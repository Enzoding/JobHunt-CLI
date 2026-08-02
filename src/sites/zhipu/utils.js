import crypto from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, stampStandardNature } from '../../core/natures.js';
import {
  coerceLimit,
  coercePage,
  fieldText,
  matchesAlias,
  stripHtml,
  toDateText,
} from '../shared.js';
import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  createFeishuSaasAdapter,
} from '../feishu-saas/utils.js';

/** Moka campus rejects oversized page sizes (limit=100 → code 102). */
const MOKA_MAX_PAGE_SIZE = 30;

/** Social/intern remain on Feishu SaaS; campus is Moka (DevTools 2026-08-02). */
export const CONFIG = {
  id: 'zhipu',
  opencliSite: 'zhipu-jobs',
  name: 'Zhipu',
  description: 'Zhipu AI social, campus, and intern recruitment',
  domain: 'zhipu-ai.jobs.feishu.cn',
  path: '/index',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
};

export const MOKA_BASE_URL = 'https://app.mokahr.com';
export const MOKA_ORG_ID = 'zphz';
export const MOKA_SITE_ID = '148984';
export const MOKA_APPLY_PATH = `/campus-recruitment/${MOKA_ORG_ID}/${MOKA_SITE_ID}`;

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';
let mokaSessionPromise;
const feishuAdapter = createFeishuSaasAdapter(CONFIG);

function splitSetCookie(header) {
  if (!header) return [];
  return header.split(/,(?=[^;,]+=)/g);
}

function getSetCookies(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  return splitSetCookie(headers.get('set-cookie'));
}

function mergeCookies(jar, headers) {
  for (const cookie of getSetCookies(headers)) {
    const [pair] = cookie.split(';');
    const index = pair.indexOf('=');
    if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join('; ');
}

function decodeHtmlEntities(value) {
  return fieldText(value)
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseInitData(html) {
  const match = html.match(/id=["']init-data["'][^>]*value=["']([^"']+)["']/);
  if (!match) throw new CliError('ZHIPU_MOKA_INIT_DATA', 'Could not find Moka init-data in Zhipu campus page', 'The Zhipu campus recruitment page structure may have changed.');
  const raw = decodeHtmlEntities(match[1]);
  try {
    return JSON.parse(raw);
  } catch {
    const ivMatch = raw.match(/"aesIv"\s*:\s*"([^"]*)"/);
    return { aesIv: ivMatch?.[1] || '' };
  }
}

async function initializeMokaSession() {
  if (!mokaSessionPromise) {
    mokaSessionPromise = (async () => {
      const applyUrl = `${MOKA_BASE_URL}${MOKA_APPLY_PATH}`;
      const jar = new Map();
      const first = await fetch(`${applyUrl}#/jobs/`, {
        redirect: 'manual',
        headers: { Accept: 'text/html', 'User-Agent': USER_AGENT },
      });
      mergeCookies(jar, first.headers);
      let response = first;
      if (first.status >= 300 && first.status < 400 && first.headers.get('location')) {
        const location = new URL(first.headers.get('location'), applyUrl).toString();
        response = await fetch(location, {
          headers: {
            Accept: 'text/html',
            Cookie: cookieHeader(jar),
            'User-Agent': USER_AGENT,
          },
        });
        mergeCookies(jar, response.headers);
      }
      const html = await response.text();
      if (!response.ok) throw new CliError('ZHIPU_MOKA_INIT_HTTP', `Zhipu campus page request failed with HTTP ${response.status}`, html.slice(0, 160));
      return { jar, initData: parseInitData(html), applyUrl };
    })();
  }
  return mokaSessionPromise;
}

function decryptWithIv(payload, aesIv) {
  const iv = Buffer.from(aesIv || '', 'utf8');
  const key = Buffer.from(payload.necromancer, 'utf8');
  const paddedIv = iv.length === 16 ? iv : Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, paddedIv);
  let decrypted = decipher.update(payload.data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

function decryptPayload(payload, aesIv) {
  if (!payload?.data || !payload?.necromancer) return payload;
  try {
    return decryptWithIv(payload, aesIv);
  } catch (error) {
    if (!aesIv) throw error;
    return decryptWithIv(payload, '');
  }
}

async function mokaFetch(endpoint, body) {
  const session = await initializeMokaSession();
  const response = await fetch(`${MOKA_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Cookie: cookieHeader(session.jar),
      Origin: MOKA_BASE_URL,
      Referer: `${session.applyUrl}#/jobs/`,
      'User-Agent': USER_AGENT,
      'x-csrf-token': session.jar.get('csrfCk') || '',
    },
    body: JSON.stringify(body),
  });
  mergeCookies(session.jar, response.headers);
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError('ZHIPU_MOKA_BAD_RESPONSE', `Zhipu campus returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('ZHIPU_MOKA_HTTP', `Zhipu campus API request failed with HTTP ${response.status}`, payload.msg || response.statusText);
  }
  const decrypted = decryptPayload(payload, session.initData.aesIv);
  if (decrypted.success === false || Number(decrypted.code || 0) !== 0) {
    throw new CliError('ZHIPU_MOKA_API', 'Zhipu campus API rejected the request', decrypted.msg || 'The recruitment API rejected the request.');
  }
  return decrypted.data ?? decrypted;
}

function jobsRequest(offset, limit, needStat = true) {
  return {
    orgId: MOKA_ORG_ID,
    siteId: Number(MOKA_SITE_ID),
    limit,
    offset,
    needStat,
    jobIdTopList: [],
    customFields: {},
    site: 'campus',
    locale: 'zh-CN',
  };
}

function jobLocations(job) {
  return Array.isArray(job.locations) ? job.locations : [];
}

function jobText(job) {
  return [
    job.title,
    job.mjCode,
    job.department?.name,
    job.zhineng?.name,
    job.commitment,
    stripHtml(job.jobDescription),
    ...jobLocations(job).map(location => location.label || location.city || location.name),
  ].join(' ');
}

function filterJob(job, args = {}) {
  if (args.query && !jobText(job).toLowerCase().includes(String(args.query).toLowerCase())) return false;
  if (args.category && !matchesAlias(args.category, [job.zhineng?.id, job.zhineng?.name, job.department?.id, job.department?.name])) return false;
  if (args.location && !jobLocations(job).some(location => matchesAlias(args.location, [location.labelCityId, location.cityId, location.label, location.city, location.name]))) return false;
  return true;
}

async function fetchAllCampusJobs(args = {}) {
  const pageSize = MOKA_MAX_PAGE_SIZE;
  const rows = [];
  const seen = new Set();
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await mokaFetch('/api/outer/ats-apply/website/jobs/v2', jobsRequest(offset, pageSize, offset === 0));
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    total = Number(data.jobStats?.total ?? data.total ?? jobs.length);
    for (const job of jobs) {
      const id = fieldText(job.id);
      if (!id || seen.has(id) || !filterJob(job, args)) continue;
      seen.add(id);
      rows.push(job);
    }
    if (jobs.length < pageSize) break;
    offset += pageSize;
  }
  return { total: rows.length, list: rows };
}

function campusJobUrl(id) {
  return `${MOKA_BASE_URL}${MOKA_APPLY_PATH}#/job/${encodeURIComponent(id)}`;
}

function normalizeCampusJob(job) {
  const id = fieldText(job.id);
  const locations = jobLocations(job);
  const visible = {
    id,
    code: fieldText(job.mjCode),
    job_no: fieldText(job.mjCode),
    name: fieldText(job.title),
    url: campusJobUrl(id),
    category_code: fieldText(job.zhineng?.id),
    category_name: fieldText(job.zhineng?.name),
    nature_code: 'campus',
    nature_name: 'campus',
    location_codes: locations.map(location => fieldText(location.labelCityId ?? location.cityId ?? location.id)).filter(Boolean).join(','),
    location_names: locations.map(location => fieldText(location.label ?? location.city ?? location.name)).filter(Boolean).join(','),
    experience_code: fieldText(job.experience),
    levels: fieldText(job.levels),
    department_code: fieldText(job.department?.id),
    department_name: fieldText(job.department?.name),
    updated_at: toDateText(job.updatedAt ?? job.publishedAt),
    description: stripHtml(job.jobDescription),
    requirement: '',
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      mj_code: job.mjCode,
      published_at: job.publishedAt,
      commitment: job.commitment,
      backend: 'moka',
    },
  });
  return stampStandardNature(output, 'campus', {
    code: fieldText(job.commitment),
    name: fieldText(job.commitment),
  });
}

async function campusFilters() {
  const { initData } = await initializeMokaSession();
  const rows = [];
  const addGroup = (group, items = []) => {
    for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
      rows.push({
        group,
        parent: '',
        code: fieldText(item.id ?? item.labelCityId ?? item.code ?? item.value),
        name: fieldText(item.label ?? item.name),
        en_name: '',
        sort_id: index + 1,
      });
    }
  };
  addGroup('location', initData.jobsGroupedByLocation || initData.jobsGroupedByCity);
  addGroup('category', initData.jobsGroupedByZhineng);
  addGroup('department', initData.jobsGroupedByDepartment);
  addGroup('experience', initData.jobsGroupedByExperience);
  addGroup('education', initData.jobsGroupedByEducation);
  return rows.filter(row => row.code || row.name);
}

export function createZhipuAdapter() {
  return {
    id: CONFIG.id,
    opencliSite: CONFIG.opencliSite,
    name: CONFIG.name,
    description: CONFIG.description,
    supportedNatures: CONFIG.supportedNatures,
    defaultNature: CONFIG.defaultNature,
    columns: COLUMNS,
    detailColumns: DETAIL_COLUMNS,
    maxPageSize: MAX_PAGE_SIZE,
    detailIdField: 'id',
    detailIdHint: 'Feishu numeric id (social/intern) or Moka UUID (campus) from search results.',
    async filters(args = {}) {
      const nature = args.nature || DEFAULT_NATURE;
      if (nature === 'campus') {
        const rows = await campusFilters();
        if (!rows.length) throw new EmptyResultError('zhipu filters', 'The Zhipu campus filter data returned no rows.');
        return rows;
      }
      return feishuAdapter.filters(args);
    },
    async search(args = {}) {
      const nature = args.nature || DEFAULT_NATURE;
      if (nature === 'campus') {
        const page = coercePage(args.page);
        const limit = coerceLimit(args.limit, 10, MOKA_MAX_PAGE_SIZE);
        const data = await fetchAllCampusJobs(args);
        const start = (page - 1) * limit;
        const rows = data.list.slice(start, start + limit).map(normalizeCampusJob);
        if (!rows.length) throw new EmptyResultError('zhipu search', 'Try a different keyword or inspect filters with `job zhipu filters --nature campus`.');
        return rows;
      }
      return feishuAdapter.search(args);
    },
    async detail(id, args = {}) {
      const nature = args.nature || DEFAULT_NATURE;
      if (nature === 'campus') {
        const normalizedId = String(id || '').trim();
        if (!normalizedId) throw new CliError('ARGUMENT_ERROR', 'Job id is required', 'Use an id returned by `job zhipu search --nature campus`.');
        const data = await fetchAllCampusJobs(args);
        const job = data.list.find(item => fieldText(item.id) === normalizedId);
        if (!job) throw new EmptyResultError('zhipu detail', `No Zhipu campus job found for id ${normalizedId}`);
        return normalizeCampusJob(job);
      }
      return feishuAdapter.detail(id, args);
    },
    async all(args = {}) {
      const nature = args.nature || DEFAULT_NATURE;
      if (nature === 'campus') {
        const max = Math.max(0, Number(args.max || 0));
        const data = await fetchAllCampusJobs(args);
        const rows = data.list.map(normalizeCampusJob);
        const sliced = max ? rows.slice(0, max) : rows;
        if (!sliced.length) throw new EmptyResultError('zhipu all', 'Try fewer filters or inspect filters with `job zhipu filters --nature campus`.');
        return sliced;
      }
      return feishuAdapter.all(args);
    },
  };
}

export { coerceLimit, coercePage, createFeishuSaasAdapter };

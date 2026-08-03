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

export const SITE = 'moonshot-jobs';
export const BASE_URL = 'https://app.mokahr.com';
export const ORG_ID = 'moonshot';
export const SOURCE_TOKEN = '7bec6769f2bfa471e5c9ce21b6b1096b';

/** DevTools 2026-08-02: social=148506, campus=148507 (Kimi校园招聘). */
export const NATURE_CHANNELS = {
  social: {
    orgId: ORG_ID,
    siteId: '148506',
    site: 'social',
    applyPath: `/apply/${ORG_ID}/148506?sourceToken=${SOURCE_TOKEN}`,
    sourceToken: SOURCE_TOKEN,
  },
  campus: {
    orgId: ORG_ID,
    siteId: '148507',
    site: 'campus',
    applyPath: `/campus-recruitment/${ORG_ID}/148507`,
    allowPartialInitData: true,
  },
};

export const DEFAULT_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 30;
export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'code', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';
const mokaSessions = new Map();

function resolveNatureChannel(nature = DEFAULT_NATURE) {
  return NATURE_CHANNELS[nature] || NATURE_CHANNELS[DEFAULT_NATURE];
}

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

function parseInitData(html, { allowPartial = false } = {}) {
  const match = html.match(/id=["']init-data["'][^>]*value=["']([^"']+)["']/);
  if (!match) {
    if (allowPartial) return { aesIv: '' };
    throw new CliError('MOONSHOT_INIT_DATA', 'Could not find Moka init-data in Moonshot page', 'The Moonshot recruitment page structure may have changed.');
  }
  const raw = decodeHtmlEntities(match[1]);
  try {
    return JSON.parse(raw);
  } catch (error) {
    // Campus microsite init-data can embed unescaped quotes in webSettings; fall back to aesIv extraction.
    if (!allowPartial) throw error;
    const ivMatch = raw.match(/"aesIv"\s*:\s*"([^"]*)"/);
    const groupMatch = raw.match(/"jobsGroupedBy(\w+)"\s*:\s*(\[[\s\S]*?\])\s*(,|})/g) || [];
    const initData = { aesIv: ivMatch?.[1] || '' };
    for (const chunk of groupMatch) {
      const name = chunk.match(/"jobsGroupedBy(\w+)"/)?.[1];
      const json = chunk.match(/:\s*(\[[\s\S]*?\])\s*(,|})/)?.[1];
      if (!name || !json) continue;
      try {
        initData[`jobsGroupedBy${name}`] = JSON.parse(json);
      } catch {
        // ignore unparsable groups
      }
    }
    return initData;
  }
}

async function initializeSession(nature = DEFAULT_NATURE) {
  const channel = resolveNatureChannel(nature);
  if (!mokaSessions.has(channel.siteId)) {
    mokaSessions.set(channel.siteId, (async () => {
      const applyUrl = `${BASE_URL}${channel.applyPath}`;
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
      if (!response.ok) throw new CliError('MOONSHOT_INIT_HTTP', `Moonshot page request failed with HTTP ${response.status}`, html.slice(0, 160));
      let initData = parseInitData(html, { allowPartial: Boolean(channel.allowPartialInitData) });
      // Campus microsite often omits aesIv; reuse social portal IV (same org, verified 2026-08-02).
      if (!initData.aesIv && nature === 'campus') {
        const socialSession = await initializeSession('social');
        initData = { ...initData, aesIv: socialSession.initData.aesIv || '' };
      }
      return { jar, initData, applyUrl, channel };
    })());
  }
  return mokaSessions.get(channel.siteId);
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

async function mokaFetch(nature, endpoint, body) {
  const session = await initializeSession(nature);
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Cookie: cookieHeader(session.jar),
      Origin: BASE_URL,
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
    throw new CliError('MOONSHOT_BAD_RESPONSE', `Moonshot returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('MOONSHOT_HTTP', `Moonshot API request failed with HTTP ${response.status}`, payload.msg || response.statusText);
  }
  const decrypted = decryptPayload(payload, session.initData.aesIv);
  if (decrypted.success === false || Number(decrypted.code || 0) !== 0) {
    throw new CliError('MOONSHOT_API', 'Moonshot API rejected the request', decrypted.msg || 'The recruitment API rejected the request.');
  }
  return decrypted.data ?? decrypted;
}

function jobsRequest(channel, offset, limit, needStat = true) {
  const body = {
    orgId: channel.orgId,
    siteId: channel.siteId,
    limit,
    offset,
    needStat,
    jobIdTopList: [],
    customFields: {},
    site: channel.site || 'social',
    locale: 'zh-CN',
  };
  if (channel.sourceToken) body.sourceToken = channel.sourceToken;
  return body;
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

async function fetchAllMatching(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  const pageSize = MAX_PAGE_SIZE;
  const rows = [];
  const seen = new Set();
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await mokaFetch(nature, '/api/outer/ats-apply/website/jobs/v2', jobsRequest(channel, offset, pageSize, offset === 0));
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

export function jobUrl(id, nature = DEFAULT_NATURE) {
  const channel = resolveNatureChannel(nature);
  return `${BASE_URL}${channel.applyPath}#/job/${encodeURIComponent(id)}`;
}

export function normalizeJob(job, nature = DEFAULT_NATURE) {
  const id = fieldText(job.id);
  const locations = jobLocations(job);
  const visible = {
    id,
    code: fieldText(job.mjCode),
    job_no: fieldText(job.mjCode),
    name: fieldText(job.title),
    url: jobUrl(id, nature),
    category_code: fieldText(job.zhineng?.id),
    category_name: fieldText(job.zhineng?.name),
    nature_code: nature,
    nature_name: nature,
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
    },
  });
  return stampStandardNature(output, nature, {
    code: fieldText(job.commitment),
    name: fieldText(job.commitment),
  });
}

export async function fetchJobs(args = {}, page = 1, limit = DEFAULT_PAGE_SIZE) {
  const data = await fetchAllMatching(args);
  const start = (page - 1) * limit;
  const list = data.list.slice(start, start + limit);
  return {
    total: data.total,
    pageNo: page,
    pageSize: limit,
    totalPage: Math.ceil(data.total / limit) || 0,
    list,
  };
}

export async function fetchJobById(id, args = {}) {
  const data = await fetchAllMatching(args);
  const job = data.list.find(item => fieldText(item.id) === String(id));
  if (!job) throw new EmptyResultError(`${SITE} detail`, `No Moonshot job found for id ${id}`);
  return job;
}

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const { initData } = await initializeSession(nature);
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
  addGroup('location', initData.jobsGroupedByLocation);
  addGroup('category', initData.jobsGroupedByZhineng);
  addGroup('department', initData.jobsGroupedByDepartment);
  addGroup('experience', initData.jobsGroupedByExperience);
  addGroup('education', initData.jobsGroupedByEducation);
  return rows.filter(row => row.code || row.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

export { coerceLimit, coercePage };

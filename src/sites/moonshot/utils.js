import crypto from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';
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
export const SITE_ID = '148506';
export const SOURCE_TOKEN = '7bec6769f2bfa471e5c9ce21b6b1096b';
export const APPLY_URL = `${BASE_URL}/apply/${ORG_ID}/${SITE_ID}?sourceToken=${SOURCE_TOKEN}`;
export const DEFAULT_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 30;
export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'code', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';
let sessionPromise;

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
  if (!match) throw new CliError('MOONSHOT_INIT_DATA', 'Could not find Moka init-data in Moonshot page', 'The Moonshot recruitment page structure may have changed.');
  return JSON.parse(decodeHtmlEntities(match[1]));
}

async function initializeSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const jar = new Map();
      const first = await fetch(`${APPLY_URL}#/jobs/`, {
        redirect: 'manual',
        headers: { Accept: 'text/html', 'User-Agent': USER_AGENT },
      });
      mergeCookies(jar, first.headers);
      let response = first;
      if (first.status >= 300 && first.status < 400 && first.headers.get('location')) {
        const location = new URL(first.headers.get('location'), APPLY_URL).toString();
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
      const initData = parseInitData(html);
      return { jar, initData };
    })();
  }
  return sessionPromise;
}

function decryptPayload(payload, aesIv) {
  if (!payload?.data || !payload?.necromancer) return payload;
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(payload.necromancer, 'utf8'), Buffer.from(aesIv, 'utf8'));
  let decrypted = decipher.update(payload.data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

async function mokaFetch(endpoint, body) {
  const session = await initializeSession();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Cookie: cookieHeader(session.jar),
      Origin: BASE_URL,
      Referer: `${APPLY_URL}#/jobs/`,
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

function jobsRequest(offset, limit, needStat = true) {
  return {
    orgId: ORG_ID,
    siteId: SITE_ID,
    limit,
    offset,
    needStat,
    jobIdTopList: [],
    customFields: {},
    site: 'social',
    sourceToken: SOURCE_TOKEN,
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
  if (args.nature && !matchesAlias(args.nature, [job.commitment])) return false;
  return true;
}

async function fetchAllMatching(args = {}) {
  const pageSize = MAX_PAGE_SIZE;
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

export function jobUrl(id) {
  return `${APPLY_URL}#/job/${encodeURIComponent(id)}`;
}

export function normalizeJob(job) {
  const id = fieldText(job.id);
  const locations = jobLocations(job);
  const visible = {
    id,
    code: fieldText(job.mjCode),
    job_no: fieldText(job.mjCode),
    name: fieldText(job.title),
    url: jobUrl(id),
    category_code: fieldText(job.zhineng?.id),
    category_name: fieldText(job.zhineng?.name),
    nature_code: fieldText(job.commitment),
    nature_name: fieldText(job.commitment),
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
    },
  });
  return output;
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

export async function fetchJobById(id) {
  const data = await fetchAllMatching({});
  const job = data.list.find(item => fieldText(item.id) === String(id));
  if (!job) throw new EmptyResultError(`${SITE} detail`, `No Moonshot job found for id ${id}`);
  return job;
}

export async function fetchFilters() {
  const { initData } = await initializeSession();
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
  for (const [index, name] of ['全职', '兼职', '实习', '其他'].entries()) {
    rows.push({ group: 'nature', parent: '', code: name, name, en_name: '', sort_id: index + 1 });
  }
  return rows.filter(row => row.code || row.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

export { coerceLimit, coercePage };

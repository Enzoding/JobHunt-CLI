import crypto from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, natureDisplayName, stampStandardNature } from '../../core/natures.js';
import {
  coerceLimit as sharedCoerceLimit,
  coercePage as sharedCoercePage,
  fieldText as sharedFieldText,
  matchesAlias,
  stripHtml,
  toDateText,
} from '../shared.js';

export const SITE = 'didi-jobs';
export const DOMAIN = 'talent.didiglobal.com';
export const BASE_URL = `https://${DOMAIN}`;
export const API_PREFIX = '/recruit-portal-service/api';
export const SOCIAL_URL = `${BASE_URL}/social/list/1`;

export const DEFAULT_PAGE_SIZE = 16;
export const MAX_PAGE_SIZE = 16;

export const NATURE_CHANNELS = {
  social: {
    backend: 'social',
    referer: SOCIAL_URL,
    jobPath: `${BASE_URL}/social/p`,
  },
  campus: {
    backend: 'moka',
    baseUrl: 'https://campus.didiglobal.com',
    orgId: 'didiglobal',
    siteId: '96064',
    applyPath: '/campus_apply/didiglobal/96064',
  },
  intern: {
    backend: 'moka',
    baseUrl: 'https://app.mokahr.com',
    orgId: 'didiglobal',
    siteId: '6222',
    applyPath: '/apply/didiglobal/6222',
  },
};

export const COLUMNS = [
  'id',
  'job_no',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'department_name',
  'updated_at',
  'url',
];

export const DETAIL_COLUMNS = [
  'id',
  'job_no',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'department_name',
  'updated_at',
  'description',
  'requirement',
  'url',
];

const SOCIAL_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  Referer: SOCIAL_URL,
  token: '',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
};

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';

const CATEGORY_MAP = {
  1: '技术',
  2: '设计',
  3: '产品',
  4: '数据',
  5: '运营',
  6: '销售',
  7: '客服',
  9: '市场',
  10: '人力',
  11: '行政',
  12: '财务',
  13: '法务',
  14: '公关',
  15: '战略',
  16: '风控',
  18: '安全',
  19: '供应链',
  20: '采购',
};

const CATEGORY_ALIASES = {
  技术: 1,
  tech: 1,
  technology: 1,
  engineering: 1,
  开发: 1,
  development: 1,
  dev: 1,
  设计: 2,
  design: 2,
  产品: 3,
  product: 3,
  数据: 4,
  data: 4,
  运营: 5,
  operation: 5,
  operations: 5,
  销售: 6,
  sales: 6,
  客服: 7,
  service: 7,
  市场: 9,
  marketing: 9,
  人力: 10,
  hr: 10,
  行政: 11,
  admin: 11,
  财务: 12,
  finance: 12,
  法务: 13,
  legal: 13,
  公关: 14,
  pr: 14,
  战略: 15,
  strategy: 15,
  风控: 16,
  risk: 16,
  安全: 18,
  security: 18,
  供应链: 19,
  supplychain: 19,
  'supply chain': 19,
  采购: 20,
  procurement: 20,
};

const mokaSessions = new Map();

function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_-]+/g, '');
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

function fieldText(value) {
  return sharedFieldText(value);
}

function stripJobNo(name, jobNo) {
  const text = fieldText(name).trim();
  if (!jobNo) return text;
  return text.replace(new RegExp(`\\s*\\(${String(jobNo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\s*$`), '').trim();
}

function categoryCodeFromName(name) {
  const text = fieldText(name);
  const entry = Object.entries(CATEGORY_MAP).find(([, categoryName]) => categoryName === text);
  return entry ? entry[0] : '';
}

export function resolveNatureChannel(nature = DEFAULT_NATURE) {
  return NATURE_CHANNELS[nature] || NATURE_CHANNELS[DEFAULT_NATURE];
}

async function readJsonResponse(response, endpoint) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError(
      'DIDI_BAD_RESPONSE',
      `Didi returned non-JSON data for ${endpoint}`,
      `HTTP ${response.status}: ${text.slice(0, 160)}`,
    );
  }
  if (!response.ok) {
    throw new CliError(
      'DIDI_HTTP',
      `Didi API request failed with HTTP ${response.status}`,
      payload?.meta?.message || response.statusText,
    );
  }
  if (payload?.meta?.code !== 0) {
    throw new CliError(
      'DIDI_API',
      `Didi API returned code ${payload?.meta?.code}`,
      payload?.meta?.message || 'The recruitment API rejected the request.',
    );
  }
  return payload.data;
}

export async function didiApi(endpoint, params = {}) {
  const query = cleanParams(params);
  const url = new URL(`${BASE_URL}${API_PREFIX}${endpoint}`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, { headers: SOCIAL_HEADERS });
  return readJsonResponse(response, endpoint);
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

function parseInitData(html) {
  const match = html.match(/id=["']init-data["'][^>]*value=["']([^"']+)["']/);
  if (!match) {
    throw new CliError('DIDI_MOKA_INIT_DATA', 'Could not find Moka init-data in Didi page', 'The Didi recruitment page structure may have changed.');
  }
  return JSON.parse(decodeHtmlEntities(match[1]));
}

function decryptPayload(payload, aesIv) {
  if (!payload?.data || !payload?.necromancer) return payload;
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(payload.necromancer, 'utf8'), Buffer.from(aesIv, 'utf8'));
  let decrypted = decipher.update(payload.data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

async function initializeMokaSession(nature = DEFAULT_NATURE) {
  const channel = resolveNatureChannel(nature);
  if (channel.backend !== 'moka') {
    throw new CliError('DIDI_NATURE', `Not a Moka channel: ${nature}`);
  }
  if (!mokaSessions.has(channel.siteId)) {
    mokaSessions.set(channel.siteId, (async () => {
      const applyUrl = `${channel.baseUrl}${channel.applyPath}`;
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
      if (!response.ok) {
        throw new CliError('DIDI_MOKA_INIT_HTTP', `Didi Moka page request failed with HTTP ${response.status}`, html.slice(0, 160));
      }
      const initData = parseInitData(html);
      return { channel, jar, initData, applyUrl };
    })());
  }
  return mokaSessions.get(channel.siteId);
}

async function mokaFetch(nature, endpoint, body) {
  const session = await initializeMokaSession(nature);
  const response = await fetch(`${session.channel.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Cookie: cookieHeader(session.jar),
      Origin: session.channel.baseUrl,
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
    throw new CliError('DIDI_MOKA_BAD_RESPONSE', `Didi Moka returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('DIDI_MOKA_HTTP', `Didi Moka API request failed with HTTP ${response.status}`, payload.msg || response.statusText);
  }
  const decrypted = decryptPayload(payload, session.initData.aesIv);
  if (decrypted.success === false || Number(decrypted.code || 0) !== 0) {
    throw new CliError('DIDI_MOKA_API', 'Didi Moka API rejected the request', decrypted.msg || 'The recruitment API rejected the request.');
  }
  return decrypted.data ?? decrypted;
}

function mokaJobsRequest(channel, offset, limit, needStat = true) {
  return {
    orgId: channel.orgId,
    siteId: channel.siteId,
    limit,
    offset,
    needStat,
    jobIdTopList: [],
    customFields: {},
    site: 'social',
    locale: 'zh-CN',
  };
}

function mokaJobLocations(job) {
  return Array.isArray(job.locations) ? job.locations : [];
}

function mokaJobText(job) {
  return [
    job.title,
    job.mjCode,
    job.department?.name,
    job.zhineng?.name,
    job.commitment,
    stripHtml(job.jobDescription),
    ...mokaJobLocations(job).map(location => location.label || location.city || location.name),
  ].join(' ');
}

function filterMokaJob(job, args = {}) {
  if (args.query && !mokaJobText(job).toLowerCase().includes(String(args.query).toLowerCase())) return false;
  if (args.category && !matchesAlias(args.category, [job.zhineng?.id, job.zhineng?.name, job.department?.id, job.department?.name])) return false;
  if (args.location && !mokaJobLocations(job).some(location => matchesAlias(args.location, [location.labelCityId, location.cityId, location.label, location.city, location.name]))) return false;
  return true;
}

async function fetchAllMokaJobs(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  const pageSize = MAX_PAGE_SIZE;
  const rows = [];
  const seen = new Set();
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await mokaFetch(nature, '/api/outer/ats-apply/website/jobs/v2', mokaJobsRequest(channel, offset, pageSize, offset === 0));
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    total = Number(data.jobStats?.total ?? data.total ?? jobs.length);
    for (const job of jobs) {
      const id = fieldText(job.id);
      if (!id || seen.has(id) || !filterMokaJob(job, args)) continue;
      seen.add(id);
      rows.push(job);
    }
    if (jobs.length < pageSize) break;
    offset += pageSize;
  }
  return { total: rows.length, list: rows };
}

export function resolveCategory(input) {
  if (!input) return '';
  const value = String(input).trim();
  if (CATEGORY_MAP[value]) return value;
  return CATEGORY_ALIASES[normalizeAliasKey(value)] || CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
}

export function resolveLocation(input) {
  if (!input) return '';
  const value = String(input).trim();
  const lower = normalizeAliasKey(value);
  if (/^[\u4e00-\u9fa5]+$/.test(value) && !value.endsWith('市') && !['香港岛', '九龙'].includes(value)) {
    return `${value}市`;
  }
  if (lower === 'beijing') return '北京市';
  if (lower === 'shanghai') return '上海市';
  if (lower === 'shenzhen') return '深圳市';
  if (lower === 'hangzhou') return '杭州市';
  if (lower === 'guangzhou') return '广州市';
  if (lower === 'chengdu') return '成都市';
  if (lower === 'wuhan') return '武汉市';
  return value;
}

export function coerceLimit(value, fallback = DEFAULT_PAGE_SIZE, maximum = MAX_PAGE_SIZE) {
  return sharedCoerceLimit(value, fallback, maximum);
}

export function coercePage(value) {
  return sharedCoercePage(value);
}

export function jobUrl(id, nature = DEFAULT_NATURE) {
  const channel = resolveNatureChannel(nature);
  if (channel.backend === 'moka') {
    return `${channel.baseUrl}${channel.applyPath}#/job/${encodeURIComponent(id)}`;
  }
  return `${channel.jobPath}/${id}`;
}

function normalizeMokaJob(job, channelNature = DEFAULT_NATURE) {
  const id = fieldText(job.id);
  const locations = mokaJobLocations(job);
  const sourceCode = fieldText(job.commitment);
  const sourceName = fieldText(job.commitment || natureDisplayName(channelNature));
  const visible = {
    id,
    code: fieldText(job.mjCode),
    job_no: fieldText(job.mjCode),
    name: fieldText(job.title),
    url: jobUrl(id, channelNature),
    category_code: fieldText(job.zhineng?.id),
    category_name: fieldText(job.zhineng?.name),
    nature_code: channelNature,
    nature_name: natureDisplayName(channelNature),
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
      commitment: job.commitment,
      published_at: job.publishedAt,
      source_nature_code: sourceCode,
      source_nature_name: sourceName,
    },
  });
  return stampStandardNature(output, channelNature, { code: sourceCode, name: sourceName });
}

export function normalizeJob(job, channelNature = DEFAULT_NATURE) {
  if (resolveNatureChannel(channelNature).backend === 'moka') {
    return normalizeMokaJob(job, channelNature);
  }

  const id = job.jdId || job.id || '';
  const categoryCode = Number.isFinite(Number(job.jobType)) ? fieldText(job.jobType) : categoryCodeFromName(job.jobType);
  const categoryName = CATEGORY_MAP[job.jobType] || fieldText(job.jobTypeName || job.jobType);
  const sourceCode = fieldText(job.recruitType || 1);
  const sourceName = fieldText(job.recruitTypeName || '社会招聘');
  const jobNo = fieldText(job.jdNo);
  const visible = {
    id,
    job_no: jobNo,
    name: stripJobNo(job.jobName, jobNo),
    url: jobUrl(id, channelNature),
    category_code: categoryCode,
    category_name: categoryName,
    nature_code: channelNature,
    nature_name: natureDisplayName(channelNature),
    location_codes: fieldText(job.workArea),
    location_names: fieldText(job.workArea),
    experience_code: '',
    levels: fieldText(job.jobLevel),
    department_code: fieldText(job.deptCode),
    department_name: fieldText(job.deptName),
    updated_at: fieldText(job.refreshTime || job.publishTime || job.createTime),
    description: fieldText(job.jobDesc || job.jobDuty).trim(),
    requirement: fieldText(job.qualification || job.jobQualification).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      jdId: job.jdId,
      jdNo: job.jdNo,
      recordId: job.recordId,
      channelId: job.channelId,
      recruitType: job.recruitType,
      jobType: job.jobType,
      workArea: job.workArea,
      deptName: job.deptName,
      refreshTime: job.refreshTime,
      publishTime: job.publishTime,
      source_nature_code: sourceCode,
      source_nature_name: sourceName,
    },
  });
  return stampStandardNature(output, channelNature, { code: sourceCode, name: sourceName });
}

export function buildSearchParams(args, page, size) {
  return {
    page,
    size,
    recruitType: 1,
    jobName: args.query,
    workArea: resolveLocation(args.location),
    jobType: resolveCategory(args.category),
  };
}

export async function fetchJobs(args, page, size) {
  const nature = args.nature || DEFAULT_NATURE;
  if (resolveNatureChannel(nature).backend === 'moka') {
    const data = await fetchAllMokaJobs(args);
    const start = (page - 1) * size;
    const list = data.list.slice(start, start + size);
    return {
      total: data.total,
      page,
      size,
      list,
    };
  }

  const data = await didiApi('/job/front/list', buildSearchParams(args, page, size));
  return {
    total: Number(data?.total || 0),
    page: Number(data?.page || page),
    size: Number(data?.size || size),
    list: Array.isArray(data?.items) ? data.items : [],
  };
}

export async function fetchJobDetail(id, listJob = {}, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  if (resolveNatureChannel(nature).backend === 'moka') {
    const data = await fetchAllMokaJobs({ ...args, nature });
    const job = data.list.find(item => fieldText(item.id) === String(id));
    if (!job) throw new EmptyResultError(`${SITE} detail`, `No Didi job found for id ${id}`);
    return job;
  }

  const data = await didiApi(`/job/front/view/${id}`);
  if (!data || !data.jobName) {
    throw new EmptyResultError(`${SITE} detail`, `No Didi job found for id ${id}`);
  }
  return {
    ...listJob,
    ...data,
    jdId: Number(id),
    jdNo: data.jdNo || listJob.jdNo,
    jobType: listJob.jobType || data.jobType,
    recruitType: listJob.recruitType || data.recruitType || 1,
    channelId: listJob.channelId,
  };
}

export async function enrichJobsWithDetails(jobs, args = {}) {
  const rows = [];
  for (const job of jobs) {
    const id = job.jdId || job.id;
    rows.push(await fetchJobDetail(id, job, args));
  }
  return rows;
}

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  if (resolveNatureChannel(nature).backend === 'moka') {
    const { initData } = await initializeMokaSession(nature);
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
    return rows.filter(row => row.code || row.name);
  }

  const [locations, categories] = await Promise.all([
    didiApi('/job/job_locations'),
    didiApi('/job/jdpublish/confirm/listJdTypes'),
  ]);
  const locationRows = Array.isArray(locations)
    ? locations.map((name, index) => ({
        group: 'location',
        parent: '',
        code: name,
        name,
        en_name: '',
        sort_id: index + 1,
      }))
    : [];
  const categoryRows = Array.isArray(categories)
    ? categories.map(item => ({
        group: 'category',
        parent: '',
        code: item.code,
        name: item.name,
        en_name: '',
        sort_id: item.code,
      }))
    : [];
  return [...locationRows, ...categoryRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

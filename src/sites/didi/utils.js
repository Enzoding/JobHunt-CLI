import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'didi-jobs';
export const DOMAIN = 'talent.didiglobal.com';
export const BASE_URL = `https://${DOMAIN}`;
export const API_PREFIX = '/recruit-portal-service/api';
export const SOCIAL_URL = `${BASE_URL}/social/list/1`;

export const DEFAULT_PAGE_SIZE = 16;
export const MAX_PAGE_SIZE = 16;

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

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  Referer: SOCIAL_URL,
  token: '',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
};

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

const NATURE_MAP = {
  1: '社会招聘',
};

const NATURE_ALIASES = {
  社招: 1,
  社会招聘: 1,
  社会: 1,
  social: 1,
  fulltime: 1,
  'full-time': 1,
  全职: 1,
};

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
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  if (value === undefined || value === null) return '';
  return String(value);
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
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  return readJsonResponse(response, endpoint);
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

export function resolveNature(input) {
  if (!input) return 1;
  const value = String(input).trim();
  if (NATURE_MAP[value]) return value;
  return NATURE_ALIASES[normalizeAliasKey(value)] || NATURE_ALIASES[normalizeCompactKey(value)] || value;
}

export function coerceLimit(value, fallback = DEFAULT_PAGE_SIZE, maximum = MAX_PAGE_SIZE) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(Math.floor(number), maximum);
}

export function coercePage(value) {
  const page = Number(value || 1);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function jobUrl(id) {
  return `${BASE_URL}/social/p/${id}`;
}

export function normalizeJob(job) {
  const id = job.jdId || job.id || '';
  const categoryCode = Number.isFinite(Number(job.jobType)) ? fieldText(job.jobType) : categoryCodeFromName(job.jobType);
  const categoryName = CATEGORY_MAP[job.jobType] || fieldText(job.jobTypeName || job.jobType);
  const natureCode = fieldText(job.recruitType || 1);
  const jobNo = fieldText(job.jdNo);
  const visible = {
    id,
    job_no: jobNo,
    name: stripJobNo(job.jobName, jobNo),
    url: jobUrl(id),
    category_code: categoryCode,
    category_name: categoryName,
    nature_code: natureCode,
    nature_name: NATURE_MAP[natureCode] || fieldText(natureCode),
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
    },
  });
  return output;
}

export function buildSearchParams(args, page, size) {
  return {
    page,
    size,
    recruitType: resolveNature(args.nature),
    jobName: args.query,
    workArea: resolveLocation(args.location),
    jobType: resolveCategory(args.category),
  };
}

export async function fetchJobs(args, page, size) {
  const data = await didiApi('/job/front/list', buildSearchParams(args, page, size));
  return {
    total: Number(data?.total || 0),
    page: Number(data?.page || page),
    size: Number(data?.size || size),
    list: Array.isArray(data?.items) ? data.items : [],
  };
}

export async function fetchJobDetail(id, listJob = {}) {
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

export async function enrichJobsWithDetails(jobs) {
  const rows = [];
  for (const job of jobs) {
    const id = job.jdId || job.id;
    rows.push(await fetchJobDetail(id, job));
  }
  return rows;
}

export async function fetchFilters() {
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
  const natureRows = Object.entries(NATURE_MAP).map(([code, name], index) => ({
    group: 'nature',
    parent: '',
    code,
    name,
    en_name: 'Social',
    sort_id: index + 1,
  }));
  return [...locationRows, ...categoryRows, ...natureRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

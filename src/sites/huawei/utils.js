import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'huawei-careers';
export const DOMAIN = 'career.huawei.com';
export const API_DOMAIN = 'apigw-dgg-b0.huawei.com';
export const BASE_URL = `https://${DOMAIN}`;
export const API_URL = `https://${API_DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/cn/social-recruitment-job-list`;
export const HW_ID = process.env.HUAWEI_HW_ID || 'app_000000035886';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  Origin: BASE_URL,
  Referer: `${BASE_URL}/`,
  'X-HW-ID': HW_ID,
  'X-Jalor-TenantAlias': 'hcm',
  'X-Language': 'zh_CN',
  'X-Referer': `${BASE_URL}/cn`,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

const CATEGORY_ALIASES = {
  财经: 'J10',
  财经族: 'J10',
  finance: 'J10',
  法务: 'J25',
  合规: 'J25',
  legal: 'J25',
};

const CITY_ALIASES = {
  深圳: 'China\\Guangdong-Shenzhen',
  东莞: 'China\\Guangdong-Dongguan',
  北京: 'China\\Beijing-Beijing',
  上海: 'China\\Shanghai-Shanghai',
  成都: 'China\\Sichuan-Chengdu',
  南京: 'China\\Jiangsu-Nanjing',
  杭州: 'China\\Zhejiang-Hangzhou',
  武汉: 'China\\Hubei-Wuhan',
};

function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_-]+/g, '');
}

function fieldText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  if (value === undefined || value === null) return '';
  return String(value);
}

function resolveCategory(input) {
  if (!input) return '';
  const value = String(input).trim();
  return CATEGORY_ALIASES[normalizeAliasKey(value)] || CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
}

function resolveCity(input) {
  if (!input) return '';
  const value = String(input).trim();
  return CITY_ALIASES[normalizeAliasKey(value)] || CITY_ALIASES[normalizeCompactKey(value)] || value;
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

async function readJsonResponse(response, endpoint) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError('HUAWEI_BAD_RESPONSE', `Huawei returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) throw new CliError('HUAWEI_HTTP', `Huawei API request failed with HTTP ${response.status}`, payload?.message || response.statusText);
  if (payload.status !== 'SUCCESS') throw new CliError('HUAWEI_API', `Huawei API returned status ${payload.status}`, payload.errors ? JSON.stringify(payload.errors) : 'The recruitment API rejected the request.');
  return payload.data;
}

async function huaweiFetch(endpoint, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}X-HW-ID=${HW_ID}`, {
    method,
    headers: REQUEST_HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${SOCIAL_URL}?jobId=${id}`;
}

export function normalizeJob(job) {
  const id = fieldText(job.jobId || job.advertisementId || job.advertisementsIntegrationId);
  const visible = {
    id,
    name: fieldText(job.jobName),
    url: jobUrl(id),
    category_code: fieldText(job.jobFamClsCode || job.jobFamily),
    category_name: fieldText(job.jobFamilyName),
    nature_code: 'SR',
    nature_name: '社招',
    location_codes: fieldText(job.jobAddress),
    location_names: fieldText(job.workPlace),
    experience_code: fieldText(job.workYear),
    levels: fieldText(job.degree || job.jobLevel),
    department_code: fieldText(job.deptCode),
    department_name: fieldText(job.deptName),
    updated_at: fieldText(job.lastUpdateDate),
    description: fieldText(job.mainBusiness).trim(),
    requirement: fieldText(job.jobRequire).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: { job_id: job.jobId, advertisement_id: job.advertisementId, integration_id: job.advertisementsIntegrationId, job_class: job.jobClass },
  });
  return output;
}

function matchesQuery(job, query) {
  if (!query) return true;
  const needle = normalizeAliasKey(query);
  return [job.jobName, job.mainBusiness, job.jobRequire, job.deptName, job.jobFamilyName, job.workPlace].some(value => normalizeAliasKey(value).includes(needle));
}

export async function fetchJobs(args, page, limit) {
  const body = {
    curPage: page,
    pageSize: limit,
    jobType: 'SR',
    jobFamily: resolveCategory(args.category) || undefined,
    jobAddress: resolveCity(args.location) || undefined,
  };
  for (const key of Object.keys(body)) if (!body[key]) delete body[key];
  const data = await huaweiFetch('/api/apig/channelhw/recruitmentPosition/pub/getJobPage', { method: 'POST', body });
  const list = Array.isArray(data?.result) ? data.result.filter(job => matchesQuery(job, args.query)) : [];
  return {
    total: args.query ? list.length : Number(data?.pageVO?.totalRows || 0),
    pageNo: Number(data?.pageVO?.curPage || page),
    pageSize: Number(data?.pageVO?.pageSize || limit),
    totalPage: Number(data?.pageVO?.totalPages || 0),
    list,
  };
}

export async function fetchAllJobs(args = {}, pageSize = MAX_PAGE_SIZE) {
  const rows = [];
  let page = 1;
  let totalPage = Infinity;
  while (page <= totalPage) {
    const result = await fetchJobs({ ...args, query: '' }, page, pageSize);
    totalPage = result.totalPage || page;
    rows.push(...result.list);
    if (result.list.length < pageSize || page >= totalPage) break;
    page += 1;
  }
  return args.query ? rows.filter(job => matchesQuery(job, args.query)) : rows;
}

export async function fetchJobById(id) {
  const rows = await fetchAllJobs({}, MAX_PAGE_SIZE);
  const job = rows.find(item => [item.jobId, item.advertisementId, item.advertisementsIntegrationId].some(value => String(value) === String(id)));
  if (!job) throw new EmptyResultError(`${SITE} detail`, `No Huawei job found for id ${id}`);
  return job;
}

export async function fetchFilters() {
  const [lookup, locations, categories, departments] = await Promise.all([
    huaweiFetch('/api/apig/channelhw/common/config/pub/lookup/list?lookupType=WORK_YEAR,HOT_ADDRESS&language=zh_CN'),
    huaweiFetch('/api/apig/channelhw/recruitmentPosition/pub/findSocialJobAddressList', { method: 'POST', body: { jobType: 'SR' } }),
    huaweiFetch('/api/apig/channelhw/recruitmentPosition/pub/getSocialRecruitmentCategory', { method: 'POST', body: { jobType: 'SR' } }),
    huaweiFetch('/api/apig/channelhw/recruitmentPosition/pub/findJobDeptList', { method: 'POST', body: { jobType: 'SR' } }),
  ]);
  const rows = [];
  for (const group of (locations || [])) {
    for (const item of group.socialJobAddressList || []) {
      rows.push({ group: 'location', parent: fieldText(group.provinceName), code: fieldText(item.jobAddress), name: fieldText(item.cityName), en_name: fieldText(item.cityNameEn), sort_id: rows.length + 1 });
    }
  }
  for (const [index, item] of (categories || []).entries()) rows.push({ group: 'category', parent: '', code: fieldText(item.jobFamily), name: fieldText(item.jobFamilyName), en_name: '', sort_id: index + 1 });
  for (const [index, item] of (departments || []).entries()) rows.push({ group: 'department', parent: '', code: fieldText(item.deptCode), name: fieldText(item.deptName), en_name: '', sort_id: index + 1 });
  for (const [index, item] of (lookup?.WORK_YEAR || []).entries()) rows.push({ group: 'experience', parent: '', code: fieldText(item.itemCode), name: fieldText(item.itemName), en_name: '', sort_id: index + 1 });
  rows.push({ group: 'nature', parent: '', code: 'SR', name: '社招', en_name: 'Social', sort_id: 1 });
  return rows.filter(row => row.code || row.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

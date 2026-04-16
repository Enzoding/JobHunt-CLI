import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'dji-careers';
export const DOMAIN = 'we.dji.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/zh-CN/social`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const REQUEST_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Origin: BASE_URL,
  Referer: SOCIAL_URL,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

const CATEGORY_ALIASES = {
  技术: '1',
  技术类: '1',
  engineering: '1',
  tech: '1',
  算法: '101',
  软件: '102',
  硬件: '103',
  嵌入式: '107',
  产品: '2',
  产品及解决方案类: '2',
  product: '2',
  营销: '3',
  销售: '3',
  market: '3',
  供应链: '4',
  supply: '4',
  服务: '5',
  设计: '6',
  职能: '7',
};

const CITY_ALIASES = {
  北京: '1100',
  上海: '3100',
  深圳: '4403',
  北京市: '1100',
  上海市: '3100',
  深圳市: '4403',
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

function dateText(value) {
  if (!value) return '';
  const number = Number(value);
  const date = new Date(number > 10_000_000_000 ? number : fieldText(value));
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return fieldText(value).slice(0, 10);
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
    throw new CliError('DJI_BAD_RESPONSE', `DJI returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) throw new CliError('DJI_HTTP', `DJI API request failed with HTTP ${response.status}`, payload.msg || response.statusText);
  if (payload.code !== 'S0000') throw new CliError('DJI_API', `DJI API returned code ${payload.code}`, payload.msg || 'The recruitment API rejected the request.');
  return payload.data;
}

async function djiFetch(endpoint, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: REQUEST_HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/zh-CN/position/detail?positionId=${id}`;
}

export function normalizeJob(job) {
  const id = fieldText(job.positionId);
  const visible = {
    id,
    name: fieldText(job.jobTitle),
    url: jobUrl(id),
    category_code: fieldText(job.positionCategoryId || job.parentId),
    category_name: fieldText(job.positionCategorySecond || job.positionCategory),
    nature_code: fieldText(job.recruitmentType),
    nature_name: fieldText(job.recruitmentName || '社招'),
    location_codes: fieldText(job.locCode),
    location_names: fieldText(job.locationDescription),
    experience_code: '',
    levels: '',
    department_code: fieldText(job.teamCode),
    department_name: fieldText(job.team),
    updated_at: dateText(job.approveTime || job.createdate),
    description: fieldText(job.duty).trim(),
    requirement: fieldText(job.requirement).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: { position_id: job.positionId, parent_id: job.parentId, team_code: job.teamCode, hot: job.hot },
  });
  return output;
}

export async function fetchJobs(args, page, limit) {
  const category = resolveCategory(args.category);
  const city = resolveCity(args.location);
  const data = await djiFetch('/hire_front/api/common/position/queryPositionCardList', {
    method: 'POST',
    body: {
      currentPage: page,
      keyWord: args.query || '',
      pageSize: limit,
      recruitmentTypes: [],
      cityList: city ? [city] : [],
      teamList: [],
      positionCategoryList: category ? [category] : [],
      schoolFlag: 'N',
    },
  });
  return {
    total: Number(data?.totalCount || 0),
    pageNo: Number(data?.currentPage || page),
    pageSize: Number(data?.pageSize || limit),
    totalPage: Number(data?.totalPage || 0),
    list: Array.isArray(data?.datas) ? data.datas : [],
  };
}

export async function fetchJobById(id) {
  for (let page = 1; page <= 20; page++) {
    const result = await fetchJobs({ query: '' }, page, MAX_PAGE_SIZE);
    const match = result.list.find(job => String(job.positionId) === String(id));
    if (match) return match;
    if (!result.list.length || page >= result.totalPage) break;
  }
  throw new EmptyResultError(`${SITE} detail`, `No DJI job found for id ${id}`);
}

export async function fetchFilters() {
  const [teams, cities, categories] = await Promise.all([
    djiFetch('/hire_front/api/common/enumnote/query/team'),
    djiFetch('/hire_front/api/common/position/queryUsingAndOldCity/N'),
    djiFetch('/hire_front/api/common/position/getAllPositionCategory'),
  ]);
  const rows = [];
  for (const [index, item] of (teams || []).entries()) rows.push({ group: 'department', parent: '', code: fieldText(item.code), name: fieldText(item.enumShortNote), en_name: fieldText(item.enNote), sort_id: index + 1 });
  for (const [index, item] of (cities?.cityList || []).entries()) rows.push({ group: 'location', parent: '', code: fieldText(item.locCode), name: fieldText(item.cityName), en_name: fieldText(item.cityEnName), sort_id: index + 1 });
  const walk = (items = [], parent = '') => {
    for (const item of items) {
      rows.push({ group: 'category', parent, code: fieldText(item.id), name: fieldText(item.description), en_name: fieldText(item.enDescription), sort_id: rows.length + 1 });
      walk(item.children || [], fieldText(item.id));
    }
  };
  walk(categories || []);
  rows.push({ group: 'nature', parent: '', code: 'SZ-01', name: '社招', en_name: 'Social', sort_id: 1 });
  return rows.filter(row => row.code || row.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

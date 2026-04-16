import { randomUUID } from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'netease-hr';
export const DOMAIN = 'hr.163.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/job-list.html`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8',
  Origin: BASE_URL,
  Referer: SOCIAL_URL,
  authtype: 'ursAuth',
  language: 'zh',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

const CATEGORY_ALIASES = {
  技术: '01',
  engineering: '01',
  tech: '01',
  游戏策划: '02',
  游戏程序: '03',
  游戏艺术: '04',
  游戏测试: '05',
  产品: '06',
  product: '06',
  人工智能: '07',
  ai: '07',
  运营: '08',
  operations: '08',
  设计: '11',
  用户体验: '11',
  项目管理: '12',
  市场: '16',
  销售: '21',
  内容: '26',
  客服: '31',
  电商: '41',
  职能: '51',
};

const CITY_ALIASES = {
  北京: 1,
  上海: 2,
  广州: 138,
  杭州: 229,
  深圳: 221,
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
  const date = new Date(Number(value));
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return fieldText(value).slice(0, 10);
}

function resolveCategory(input) {
  if (!input) return '';
  const value = String(input).trim();
  return CATEGORY_ALIASES[normalizeAliasKey(value)] || CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
}

function resolveCity(input) {
  if (!input) return undefined;
  const value = String(input).trim();
  return CITY_ALIASES[normalizeAliasKey(value)] || CITY_ALIASES[normalizeCompactKey(value)] || value;
}

function resolveNature(input) {
  if (!input) return '';
  const value = normalizeCompactKey(input);
  if (['全职', '社招', 'fulltime', 'full'].includes(value)) return '0';
  if (['实习', '实习生', 'intern', 'internship'].includes(value)) return '1';
  return String(input).trim();
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
    throw new CliError('NETEASE_BAD_RESPONSE', `NetEase returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) throw new CliError('NETEASE_HTTP', `NetEase API request failed with HTTP ${response.status}`, payload.msg || response.statusText);
  if (payload.code !== 200) throw new CliError('NETEASE_API', `NetEase API returned code ${payload.code}`, payload.msg || 'The recruitment API rejected the request.');
  return payload.data;
}

async function neteaseFetch(endpoint, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { ...REQUEST_HEADERS, 'x-ehr-uuid': randomUUID() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/job-detail.html?id=${id}`;
}

export function normalizeJob(job) {
  const id = fieldText(job.id);
  const visible = {
    id,
    name: fieldText(job.name),
    url: jobUrl(id),
    category_code: fieldText(job.firstPostType),
    category_name: fieldText(job.firstPostTypeName),
    nature_code: fieldText(job.workType),
    nature_name: job.workType === '1' ? '实习' : '全职',
    location_codes: fieldText(job.workPlaceList),
    location_names: fieldText(job.workPlaceNameList),
    experience_code: fieldText(job.reqWorkYearsName),
    levels: fieldText(job.reqEducationName),
    department_code: fieldText(job.product),
    department_name: fieldText(job.productName || job.firstDepName),
    updated_at: dateText(job.updateTime),
    description: fieldText(job.description).trim(),
    requirement: fieldText(job.requirement).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: { id: job.id, product: job.product, recruit_num: job.recruitNum, geek_flag: job.geekPassionateTalentFlag },
  });
  return output;
}

export async function fetchJobs(args, page, limit) {
  const city = resolveCity(args.location);
  const body = {
    currentPage: page,
    pageSize: limit,
    keyword: args.query || '',
    postType: resolveCategory(args.category),
    workType: resolveNature(args.nature),
  };
  if (city) body.workPlace = [Number.isNaN(Number(city)) ? city : Number(city)];
  const data = await neteaseFetch('/api/hr163/position/queryPage', { method: 'POST', body });
  return {
    total: Number(data?.total || 0),
    pageNo: page,
    pageSize: limit,
    totalPage: Number(data?.pages || 0),
    list: Array.isArray(data?.list) ? data.list : [],
  };
}

export async function fetchJobById(id) {
  const data = await neteaseFetch(`/api/hr163/position/query?id=${encodeURIComponent(id)}`);
  if (!data?.id) throw new EmptyResultError(`${SITE} detail`, `No NetEase job found for id ${id}`);
  return data;
}

export async function fetchFilters() {
  const [categories, products] = await Promise.all([
    neteaseFetch('/api/hr163/options/positionType/queryItemList?type=0'),
    neteaseFetch('/api/hr163/options/queryList?code=product&hasSub=1'),
  ]);
  const rows = [];
  for (const [index, item] of (categories || []).entries()) {
    rows.push({ group: 'category', parent: '', code: fieldText(item.id), name: fieldText(item.name), en_name: '', sort_id: index + 1 });
  }
  for (const [index, item] of (products || []).entries()) {
    rows.push({ group: 'department', parent: '', code: fieldText(item.id), name: fieldText(item.name), en_name: '', sort_id: index + 1 });
  }
  rows.push({ group: 'nature', parent: '', code: '0', name: '全职', en_name: 'Full-time', sort_id: 1 });
  rows.push({ group: 'nature', parent: '', code: '1', name: '实习', en_name: 'Internship', sort_id: 2 });
  return rows;
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

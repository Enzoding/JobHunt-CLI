import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'jd-zhaopin';
export const DOMAIN = 'zhaopin.jd.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/web/job/job_info_list/3`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

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
  Accept: '*/*',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Origin: BASE_URL,
  Referer: SOCIAL_URL,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
};

const CATEGORY_ALIASES = {
  研发: 'YANFA',
  研发类: 'YANFA',
  技术: 'YANFA',
  engineering: 'YANFA',
  tech: 'YANFA',
  运营: 'YUNGYUN',
  运营类: 'YUNGYUN',
  operations: 'YUNGYUN',
  职能: 'ZHINENG',
  职能类: 'ZHINENG',
  function: 'ZHINENG',
  采销: 'CAIXIAO',
  采销类: 'CAIXIAO',
  金融: 'JINRONGYW',
  金融业务: 'JINRONGYW',
  客服: 'KEFU',
  客服类: 'KEFU',
};

const CITY_ALIASES = {
  北京: '11',
  北京市: '11',
  beijing: '11',
  上海: '31',
  上海市: '31',
  shanghai: '31',
  广东: '44',
  广东省: '44',
  guangdong: '44',
  江苏: '32',
  江苏省: '32',
  jiangsu: '32',
  浙江: '33',
  浙江省: '33',
  zhejiang: '33',
  四川: '51',
  四川省: '51',
  sichuan: '51',
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
    throw new CliError('JD_BAD_RESPONSE', `JD returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('JD_HTTP', `JD API request failed with HTTP ${response.status}`, payload.message || response.statusText);
  }
  return payload;
}

async function jdPost(endpoint, data = {}) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    body.set(key, value ?? '');
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: [...body.keys()].length ? body : undefined,
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/web/job/job_detail/${id}`;
}

export function normalizeJob(job) {
  const id = fieldText(job.positionId || job.id);
  const visible = {
    id,
    job_no: fieldText(job.positionCode || job.reqNumber),
    name: fieldText(job.positionNameOpen || job.positionName),
    url: jobUrl(id),
    category_code: fieldText(job.jobTypeCode),
    category_name: fieldText(job.jobType),
    nature_code: '3',
    nature_name: '社招',
    location_codes: fieldText(job.workCityCode),
    location_names: fieldText(job.workCity),
    experience_code: fieldText(job.lvlName || job.positionLevel),
    levels: fieldText(job.lvlCode),
    department_code: fieldText(job.positionDeptCode),
    department_name: fieldText(job.positionDeptName),
    updated_at: fieldText(job.formatPublishTime),
    description: fieldText(job.workContent).trim(),
    requirement: fieldText(job.qualification).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      position_id: job.positionId,
      requirement_id: job.requirementId,
      req_number: job.reqNumber,
      is_hot: job.isHot,
    },
  });
  return output;
}

export async function fetchJobs(args, page, limit) {
  const categoryCode = resolveCategory(args.category);
  const cityCode = resolveCity(args.location);
  const list = await jdPost('/web/job/job_list', {
    pageIndex: page,
    pageSize: limit,
    workCityJson: JSON.stringify(cityCode ? [cityCode] : []),
    jobTypeJson: JSON.stringify(categoryCode ? [categoryCode] : []),
    jobSearch: args.query || '',
    depTypeJson: '[]',
  });
  return {
    total: 0,
    list: Array.isArray(list) ? list : [],
  };
}

export async function fetchJobById(id) {
  for (let page = 1; page <= 20; page++) {
    const result = await fetchJobs({ query: '' }, page, MAX_PAGE_SIZE);
    const match = result.list.find(job =>
      String(job.positionId) === String(id)
      || String(job.id) === String(id)
      || String(job.positionCode) === String(id)
      || String(job.reqNumber) === String(id));
    if (match) return match;
    if (!result.list.length || result.list.length < MAX_PAGE_SIZE) break;
  }
  throw new EmptyResultError(`${SITE} detail`, `No JD job found for id ${id}`);
}

export async function fetchFilters() {
  const data = await jdPost('/web/job/job_allparams');
  const rows = [];
  const addRows = (group, list = [], codeKey = 'dictCode', nameKey = 'dictName') => {
    for (const [index, item] of list.entries()) {
      rows.push({
        group,
        parent: '',
        code: fieldText(item[codeKey] ?? item.dictDataCode),
        name: fieldText(item[nameKey] ?? item.dictDataName),
        en_name: '',
        sort_id: index + 1,
      });
    }
  };
  addRows('location', data.workCityList);
  addRows('department', data.deptList);
  addRows('category', data.jobTypeList, 'dictDataCode', 'dictDataName');
  rows.push({ group: 'nature', parent: '', code: '3', name: '社招', en_name: 'Social', sort_id: 1 });
  return rows.filter(r => r.code || r.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, natureDisplayName, stampStandardNature } from '../../core/natures.js';

export const SITE = 'jd-zhaopin';
export const DOMAIN = 'zhaopin.jd.com';
export const BASE_URL = `https://${DOMAIN}`;
export const CAMPUS_DOMAIN = 'campus.jd.com';
export const CAMPUS_BASE_URL = `https://${CAMPUS_DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/web/job/job_info_list/3`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const NATURE_CHANNELS = {
  social: {
    baseUrl: BASE_URL,
    backend: 'social',
    pageType: null,
    pageIndexBase: 1,
    referer: SOCIAL_URL,
  },
  campus: {
    baseUrl: CAMPUS_BASE_URL,
    backend: 'campus',
    pageType: 'present',
    pageIndexBase: 0,
    referer: `${CAMPUS_BASE_URL}/`,
  },
  intern: {
    baseUrl: CAMPUS_BASE_URL,
    backend: 'campus',
    pageType: 'internship',
    pageIndexBase: 0,
    referer: `${CAMPUS_BASE_URL}/`,
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

const CAMPUS_CATEGORY_ALIASES = {
  技术: '02',
  技术方向: '02',
  tech: '02',
  产品: '03',
  产品方向: '03',
  product: '03',
  运营: '04',
  运营方向: '04',
  operations: '04',
  采销: '01',
  采销与物流: '01',
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

export function resolveNatureChannel(nature = DEFAULT_NATURE) {
  return NATURE_CHANNELS[nature] || NATURE_CHANNELS[DEFAULT_NATURE];
}

function resolveCategory(input, nature = DEFAULT_NATURE) {
  if (!input) return '';
  const value = String(input).trim();
  if (nature === 'social') {
    return CATEGORY_ALIASES[normalizeAliasKey(value)] || CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
  }
  return CAMPUS_CATEGORY_ALIASES[normalizeAliasKey(value)] || CAMPUS_CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
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

function campusHeaders(channel) {
  return {
    Accept: '*/*',
    'Content-Type': 'application/json; charset=UTF-8',
    Origin: channel.baseUrl,
    Referer: channel.referer,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };
}

function campusSearchParameter(args = {}) {
  const category = resolveCategory(args.category, args.nature);
  const location = resolveCity(args.location);
  return {
    positionName: args.query || '',
    planIdList: [],
    jobDirectionCodeList: category ? [category] : [],
    workCityCodeList: location ? [location] : [],
    positionDeptList: [],
  };
}

async function jdSocialPost(endpoint, data = {}) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    body.set(key, value ?? '');
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: SOCIAL_HEADERS,
    body: [...body.keys()].length ? body : undefined,
  });
  return readJsonResponse(response, endpoint);
}

async function jdCampusPost(endpoint, body, nature = DEFAULT_NATURE) {
  const channel = resolveNatureChannel(nature);
  const response = await fetch(`${channel.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: campusHeaders(channel),
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

function formatCampusDate(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '';
  return new Date(number).toISOString().slice(0, 10);
}

function campusLocations(job) {
  const reqs = Array.isArray(job.requirementVoList) ? job.requirementVoList : [];
  const names = [...new Set(reqs.map(item => fieldText(item.workCity)).filter(Boolean))];
  const codes = [...new Set(reqs.map(item => fieldText(item.workCityCode)).filter(Boolean))];
  return {
    names: names.join(','),
    codes: codes.join(','),
    departments: [...new Set(reqs.map(item => fieldText(item.positionBg)).filter(Boolean))].join(','),
  };
}

export function jobUrl(id, nature = DEFAULT_NATURE) {
  if (nature === 'social') return SOCIAL_URL;
  return `${CAMPUS_BASE_URL}/#/job/detail?publishId=${encodeURIComponent(id)}`;
}

export function normalizeJob(job, channelNature = DEFAULT_NATURE) {
  if (resolveNatureChannel(channelNature).backend === 'campus') {
    const locations = campusLocations(job);
    const sourceCode = fieldText(job.planId || job.positionType);
    const sourceName = fieldText(job.planName || job.positionTypeName || natureDisplayName(channelNature));
    const visible = {
      id: fieldText(job.publishId || job.id),
      job_no: fieldText(job.reqId),
      name: fieldText(job.positionName || job.positionNameOpen),
      url: jobUrl(fieldText(job.publishId || job.id), channelNature),
      category_code: fieldText(job.jobDirectionCode || job.jobCategoryCode),
      category_name: fieldText(job.jobDirection || job.jobCategory),
      nature_code: channelNature,
      nature_name: natureDisplayName(channelNature),
      location_codes: locations.codes,
      location_names: locations.names,
      experience_code: '',
      levels: '',
      department_code: '',
      department_name: locations.departments,
      updated_at: formatCampusDate(job.publishTime),
      description: fieldText(job.workContent).trim(),
      requirement: fieldText(job.qualification).trim(),
    };
    const output = { ...visible };
    Object.defineProperty(output, 'raw', {
      enumerable: true,
      value: {
        publish_id: job.publishId,
        req_id: job.reqId,
        plan_id: job.planId,
        source_nature_code: sourceCode,
        source_nature_name: sourceName,
      },
    });
    return stampStandardNature(output, channelNature, { code: sourceCode, name: sourceName });
  }

  const id = fieldText(job.positionId || job.id);
  const visible = {
    id,
    job_no: fieldText(job.positionCode || job.reqNumber),
    name: fieldText(job.positionNameOpen || job.positionName),
    url: jobUrl(id, channelNature),
    category_code: fieldText(job.jobTypeCode),
    category_name: fieldText(job.jobType),
    nature_code: channelNature,
    nature_name: natureDisplayName(channelNature),
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
      source_nature_code: '3',
      source_nature_name: '社招',
    },
  });
  return stampStandardNature(output, channelNature, { code: '3', name: '社招' });
}

async function fetchSocialJobs(args, page, limit) {
  const categoryCode = resolveCategory(args.category, 'social');
  const cityCode = resolveCity(args.location);
  const list = await jdSocialPost('/web/job/job_list', {
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

async function fetchCampusJobs(args, page, limit) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  const payload = await jdCampusPost(
    `/api/wx/position/page?type=${channel.pageType}`,
    {
      pageSize: limit,
      pageIndex: page - 1,
      parameter: campusSearchParameter(args),
    },
    nature,
  );
  if (payload.success === false) {
    throw new CliError('JD_API', 'JD campus API rejected the request', payload.message || 'Request failed');
  }
  const body = payload.body || {};
  const list = Array.isArray(body.items) ? body.items : [];
  const total = Number(body.totalNumber || list.length);
  return {
    total,
    pageNo: page,
    pageSize: limit,
    totalPage: Math.ceil(total / limit) || 0,
    list,
  };
}

export async function fetchJobs(args, page, limit) {
  const nature = args.nature || DEFAULT_NATURE;
  if (resolveNatureChannel(nature).backend === 'campus') {
    return fetchCampusJobs(args, page, limit);
  }
  return fetchSocialJobs(args, page, limit);
}

async function findCampusJobById(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  for (let page = 1; page <= 50; page++) {
    const result = await fetchCampusJobs(args, page, MAX_PAGE_SIZE);
    const match = result.list.find(job =>
      String(job.publishId) === String(id)
      || String(job.reqId) === String(id));
    if (match) return match;
    if (!result.list.length || page >= result.totalPage) break;
  }
  throw new EmptyResultError(`${SITE} detail`, `No JD job found for id ${id}`);
}

export async function fetchJobById(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  if (resolveNatureChannel(nature).backend === 'campus') {
    return findCampusJobById(id, args);
  }
  for (let page = 1; page <= 20; page++) {
    const result = await fetchSocialJobs({ query: '' }, page, MAX_PAGE_SIZE);
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

async function fetchSocialFilters() {
  const data = await jdSocialPost('/web/job/job_allparams');
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
  return rows.filter(r => r.code || r.name);
}

async function fetchCampusFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  const payload = await jdCampusPost(`/api/wx/position/dict?type=${channel.pageType}`, [], nature);
  const body = payload.body || {};
  const rows = [];
  const addRows = (group, list = []) => {
    for (const [index, item] of (Array.isArray(list) ? list : []).entries()) {
      rows.push({
        group,
        parent: '',
        code: fieldText(item.code),
        name: fieldText(item.name),
        en_name: '',
        sort_id: index + 1,
      });
    }
  };
  addRows('category', body.campusJobCategory);
  addRows('location', body.campusJobHotCity);
  return rows.filter(r => r.code || r.name);
}

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  if (resolveNatureChannel(nature).backend === 'campus') {
    return fetchCampusFilters(args);
  }
  return fetchSocialFilters();
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

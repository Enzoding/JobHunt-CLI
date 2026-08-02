import { randomUUID } from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, stampStandardNature } from '../../core/natures.js';

export const SITE = 'netease-hr';
export const DOMAIN = 'hr.163.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/job-list.html`;
export const CAMPUS_DOMAIN = 'campus.163.com';
export const CAMPUS_BASE_URL = `https://${CAMPUS_DOMAIN}`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** DevTools 2026-07-19: hr.163.com workType 0=社招, 1=日常实习. */
export const NATURE_WORK_TYPES = {
  social: '0',
  intern: '1',
};

/**
 * DevTools 2026-08-02: campus.163.com project API.
 * v1 covers internet campus project on campus.163.com only (external game/leihuo portals skipped).
 */
export const CAMPUS_PROJECT_IDS = [69];

export const SUPPORTED_NATURES = ['social', 'campus', 'intern'];

export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const SOCIAL_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8',
  Origin: BASE_URL,
  Referer: SOCIAL_URL,
  authtype: 'ursAuth',
  language: 'zh',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

const CAMPUS_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  Origin: CAMPUS_BASE_URL,
  Referer: `${CAMPUS_BASE_URL}/app/job/position`,
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

function workTypeForNature(nature = DEFAULT_NATURE) {
  return NATURE_WORK_TYPES[nature] || NATURE_WORK_TYPES[DEFAULT_NATURE];
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

async function readJsonResponse(response, endpoint, { okCode = 200 } = {}) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError('NETEASE_BAD_RESPONSE', `NetEase returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) throw new CliError('NETEASE_HTTP', `NetEase API request failed with HTTP ${response.status}`, payload.msg || response.statusText);
  if (payload.code !== okCode) throw new CliError('NETEASE_API', `NetEase API returned code ${payload.code}`, payload.msg || 'The recruitment API rejected the request.');
  return payload.data;
}

async function socialFetch(endpoint, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { ...SOCIAL_HEADERS, 'x-ehr-uuid': randomUUID() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return readJsonResponse(response, endpoint);
}

async function campusFetch(endpoint) {
  const url = endpoint.includes('timeStamp=')
    ? `${CAMPUS_BASE_URL}${endpoint}`
    : `${CAMPUS_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}timeStamp=${Date.now()}`;
  const response = await fetch(url, { headers: CAMPUS_HEADERS });
  return readJsonResponse(response, endpoint);
}

function matchesQuery(job, args = {}) {
  if (!args.query) return true;
  const haystack = [
    job.positionName,
    job.name,
    job.positionTypeName,
    job.firstPostTypeName,
    job.workPlaceName,
    job.workPlaceNameList,
    job.positionDescription,
    job.description,
    job.positionRequirement,
    job.requirement,
  ].map(fieldText).join(' ').toLowerCase();
  return haystack.includes(String(args.query).toLowerCase());
}

function matchesCampusFilters(job, args = {}) {
  if (!matchesQuery(job, args)) return false;
  if (args.category) {
    const category = fieldText(job.positionTypeName || job.firstPostTypeName);
    if (!normalizeAliasKey(category).includes(normalizeAliasKey(args.category))
      && !normalizeCompactKey(category).includes(normalizeCompactKey(args.category))) {
      return false;
    }
  }
  if (args.location) {
    const locations = fieldText(job.workPlaceName || job.workPlaceNameList);
    if (!normalizeAliasKey(locations).includes(normalizeAliasKey(args.location))) return false;
  }
  return true;
}

async function fetchCampusProjectPage(projectId, page, limit) {
  const data = await campusFetch(`/api/campuspc/position/getJobList?pageSize=${limit}&currentPage=${page}&projectId=${projectId}`);
  return {
    total: Number(data?.total || 0),
    pages: Number(data?.pages || 0),
    list: Array.isArray(data?.list) ? data.list : [],
  };
}

async function fetchAllCampusJobs(args = {}) {
  const pageSize = MAX_PAGE_SIZE;
  const rows = [];
  const seen = new Set();
  for (const projectId of CAMPUS_PROJECT_IDS) {
    let page = 1;
    let totalPage = Infinity;
    while (page <= totalPage) {
      const result = await fetchCampusProjectPage(projectId, page, pageSize);
      totalPage = result.pages || page;
      if (!result.list.length) break;
      for (const job of result.list) {
        const id = fieldText(job.id);
        if (!id || seen.has(id) || !matchesCampusFilters(job, args)) continue;
        seen.add(id);
        rows.push({ ...job, projectId: job.projectId || projectId });
      }
      if (result.list.length < pageSize || page >= totalPage) break;
      page += 1;
    }
  }
  return rows;
}

export function jobUrl(id, nature = DEFAULT_NATURE, projectId) {
  if (nature === 'campus') {
    const pid = projectId || CAMPUS_PROJECT_IDS[0];
    return `${CAMPUS_BASE_URL}/app/job/position?id=${pid}&positionId=${id}`;
  }
  return `${BASE_URL}/job-detail.html?id=${id}&lang=zh`;
}

export function normalizeJob(job, nature = DEFAULT_NATURE) {
  if (nature === 'campus') {
    const id = fieldText(job.id);
    const visible = {
      id,
      name: fieldText(job.positionName),
      url: jobUrl(id, nature, job.projectId),
      category_code: '',
      category_name: fieldText(job.positionTypeName),
      nature_code: nature,
      nature_name: nature,
      location_codes: '',
      location_names: fieldText(job.workPlaceName),
      experience_code: '',
      levels: '',
      department_code: fieldText(job.projectId),
      department_name: '',
      updated_at: dateText(job.updateTime),
      description: fieldText(job.positionDescription).trim(),
      requirement: fieldText(job.positionRequirement).trim(),
    };
    const output = { ...visible };
    Object.defineProperty(output, 'raw', {
      enumerable: true,
      value: {
        id: job.id,
        project_id: job.projectId,
        interview_city: job.interviewCityName,
        is_hot: job.isHot,
        tag_list: job.tagList,
      },
    });
    return stampStandardNature(output, nature, {
      code: fieldText(job.projectId),
      name: '校招',
    });
  }

  const id = fieldText(job.id);
  const visible = {
    id,
    name: fieldText(job.name),
    url: jobUrl(id, nature),
    category_code: fieldText(job.firstPostType),
    category_name: fieldText(job.firstPostTypeName),
    nature_code: nature,
    nature_name: nature,
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
    value: {
      id: job.id,
      product: job.product,
      recruit_num: job.recruitNum,
      geek_flag: job.geekPassionateTalentFlag,
      work_type: job.workType,
    },
  });
  return stampStandardNature(output, nature, {
    code: fieldText(job.workType),
    name: job.workType === '1' ? '实习' : '全职',
  });
}

export async function fetchJobs(args, page, limit) {
  const nature = args.nature || DEFAULT_NATURE;
  if (nature === 'campus') {
    const all = await fetchAllCampusJobs(args);
    const start = (page - 1) * limit;
    const list = all.slice(start, start + limit);
    return {
      total: all.length,
      pageNo: page,
      pageSize: limit,
      totalPage: Math.ceil(all.length / limit) || 0,
      list,
    };
  }

  const city = resolveCity(args.location);
  const body = {
    currentPage: page,
    pageSize: limit,
    keyword: args.query || '',
    postType: resolveCategory(args.category),
    workType: workTypeForNature(nature),
  };
  if (city) body.workPlace = [Number.isNaN(Number(city)) ? city : Number(city)];
  const data = await socialFetch('/api/hr163/position/queryPage', { method: 'POST', body });
  return {
    total: Number(data?.total || 0),
    pageNo: page,
    pageSize: limit,
    totalPage: Number(data?.pages || 0),
    list: Array.isArray(data?.list) ? data.list : [],
  };
}

export async function fetchJobById(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  if (nature === 'campus') {
    const all = await fetchAllCampusJobs(args);
    const job = all.find(item => fieldText(item.id) === String(id));
    if (!job) throw new EmptyResultError(`${SITE} detail`, `No NetEase campus job found for id ${id}`);
    return job;
  }
  const data = await socialFetch(`/api/hr163/position/query?id=${encodeURIComponent(id)}`);
  if (!data?.id) throw new EmptyResultError(`${SITE} detail`, `No NetEase job found for id ${id}`);
  return data;
}

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  if (nature === 'campus') {
    const rows = [];
    const jobs = await fetchAllCampusJobs({});
    const categories = new Map();
    const locations = new Map();
    for (const job of jobs) {
      const category = fieldText(job.positionTypeName);
      if (category && !categories.has(category)) categories.set(category, categories.size + 1);
      for (const city of fieldText(job.workPlaceName).split(/[,，]/).map(part => part.trim()).filter(Boolean)) {
        if (!locations.has(city)) locations.set(city, locations.size + 1);
      }
    }
    for (const [name, sortId] of categories) {
      rows.push({ group: 'category', parent: '', code: name, name, en_name: '', sort_id: sortId });
    }
    for (const [name, sortId] of locations) {
      rows.push({ group: 'location', parent: '', code: name, name, en_name: '', sort_id: sortId });
    }
    return rows;
  }

  const [categories, products] = await Promise.all([
    socialFetch('/api/hr163/options/positionType/queryItemList?type=0'),
    socialFetch('/api/hr163/options/queryList?code=product&hasSub=1'),
  ]);
  const rows = [];
  for (const [index, item] of (categories || []).entries()) {
    rows.push({ group: 'category', parent: '', code: fieldText(item.id), name: fieldText(item.name), en_name: '', sort_id: index + 1 });
  }
  for (const [index, item] of (products || []).entries()) {
    rows.push({ group: 'department', parent: '', code: fieldText(item.id), name: fieldText(item.name), en_name: '', sort_id: index + 1 });
  }
  return rows;
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

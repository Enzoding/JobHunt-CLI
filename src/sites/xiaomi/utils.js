import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'xiaomi-jobs';
export const DOMAIN = 'xiaomi.jobs.f.mioffice.cn';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/index`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const COLUMNS = [
  'id',
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
  Referer: `${BASE_URL}/index`,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'portal-channel': 'saas-career',
  'portal-platform': 'pc',
};

const PORTAL_TYPE_SOCIAL = 6;

const NATURE_MAP = {
  '1': '社招',
  '2': '校招',
  '3': '实习',
};

const CITY_ALIASES = {
  北京: 'CT_11',
  beijing: 'CT_11',
  上海: 'CT_125',
  shanghai: 'CT_125',
  深圳: 'CT_128',
  shenzhen: 'CT_128',
  广州: 'CT_45',
  guangzhou: 'CT_45',
  杭州: 'CT_52',
  hangzhou: 'CT_52',
  武汉: 'CT_154',
  wuhan: 'CT_154',
  南京: 'CT_107',
  nanjing: 'CT_107',
  西安: 'CT_155',
  xian: 'CT_155',
  成都: 'CT_22',
  chengdu: 'CT_22',
  苏州: 'CT_199',
  suzhou: 'CT_199',
  大连: 'CT_25',
  dalian: 'CT_25',
  济南: 'CT_66',
  jinan: 'CT_66',
  无锡: 'CT_151',
  wuxi: 'CT_151',
  沈阳: 'CT_129',
  shenyang: 'CT_129',
  重庆: 'CT_190',
  chongqing: 'CT_190',
  长沙: 'CT_20',
  changsha: 'CT_20',
  青岛: 'CT_119',
  qingdao: 'CT_119',
  哈尔滨: 'CT_48',
  harbin: 'CT_48',
  合肥: 'CT_55',
  hefei: 'CT_55',
  福州: 'CT_40',
  fuzhou: 'CT_40',
  宁波: 'CT_112',
  ningbo: 'CT_112',
  慕尼黑: 'CT_226',
  munich: 'CT_226',
  新加坡: 'CT_163',
  singapore: 'CT_163',
  马德里: 'CT_96',
  madrid: 'CT_96',
  东京: 'CT_34',
  tokyo: 'CT_34',
  曼谷: 'CT_98',
  bangkok: 'CT_98',
  迪拜: 'CT_33',
  dubai: 'CT_33',
};

function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_-]+/g, '');
}

export function resolveCity(input) {
  if (!input) return '';
  const value = String(input).trim();
  return CITY_ALIASES[normalizeAliasKey(value)] || CITY_ALIASES[normalizeCompactKey(value)] || value;
}

export function coerceLimit(value, fallback = DEFAULT_PAGE_SIZE, maximum = MAX_PAGE_SIZE) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(Math.floor(number), maximum);
}

export function coerceOffset(value) {
  const offset = Number(value || 0);
  if (!Number.isFinite(offset) || offset < 0) return 0;
  return Math.floor(offset);
}

async function readJsonResponse(response, endpoint) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError(
      'XIAOMI_BAD_RESPONSE',
      `Xiaomi returned non-JSON data for ${endpoint}`,
      `HTTP ${response.status}: ${text.slice(0, 160)}`,
    );
  }
  if (!response.ok) {
    throw new CliError(
      'XIAOMI_HTTP',
      `Xiaomi API request failed with HTTP ${response.status}`,
      payload.message || response.statusText,
    );
  }
  if (payload.code !== 0) {
    throw new CliError(
      'XIAOMI_API',
      `Xiaomi API returned code ${payload.code}`,
      payload.message || 'The recruitment API rejected the request.',
    );
  }
  return payload.data;
}

async function xiaomiGet(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  return readJsonResponse(response, endpoint);
}

async function xiaomiPost(endpoint, body = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { ...REQUEST_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/index/position/${id}/detail`;
}

function fieldText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  if (value === undefined || value === null) return '';
  return String(value);
}

export function normalizeJob(job) {
  const cities = Array.isArray(job.city_list)
    ? job.city_list.map(c => c.name).filter(Boolean)
    : [];
  const recruitType = job.recruit_type || job.recruitment_type || {};
  const parentType = recruitType.parent || {};
  const updatedAt = job.publish_time
    ? new Date(job.publish_time).toISOString().slice(0, 10)
    : '';
  const visible = {
    id: fieldText(job.id),
    name: fieldText(job.title),
    url: jobUrl(fieldText(job.id)),
    category_code: '',
    category_name: fieldText(job.job_category?.name || job.job_function?.name),
    nature_code: fieldText(recruitType.id),
    nature_name: `${fieldText(parentType.name)}${parentType.name ? '-' : ''}${fieldText(recruitType.name)}`.replace(/^-/, ''),
    location_codes: cities.join(','),
    location_names: cities.join(','),
    experience_code: '',
    levels: '',
    department_code: '',
    department_name: '',
    updated_at: updatedAt,
    description: fieldText(job.description).trim(),
    requirement: fieldText(job.requirement).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      code: job.code,
      title: job.title,
      recruit_type: recruitType.id,
      city_list: job.city_list,
      publish_time: job.publish_time,
    },
  });
  return output;
}

export function buildSearchBody(args, offset, limit) {
  const cityCode = resolveCity(args.location);
  return {
    keyword: args.query || '',
    limit,
    offset,
    job_category_id_list: [],
    tag_id_list: [],
    location_code_list: cityCode ? [cityCode] : [],
    subject_id_list: [],
    recruitment_id_list: [],
    portal_type: PORTAL_TYPE_SOCIAL,
    job_function_id_list: [],
    storefront_id_list: [],
    portal_entrance: 1,
  };
}

export async function fetchJobs(args, offset, limit) {
  const body = buildSearchBody(args, offset, limit);
  const data = await xiaomiPost('/api/v1/search/job/posts', body);
  return {
    total: Number(data?.job_post_list?.length || 0),
    offset,
    limit,
    list: Array.isArray(data?.job_post_list) ? data.job_post_list : [],
  };
}

export async function fetchJobDetail(id) {
  const data = await xiaomiGet(`/api/v1/job/posts/${id}?portal_type=${PORTAL_TYPE_SOCIAL}&with_recommend=false`);
  if (!data || !data.job_post_detail) {
    throw new EmptyResultError(`${SITE} detail`, `No Xiaomi job found for id ${id}`);
  }
  return data.job_post_detail;
}

export async function fetchFilters() {
  const data = await xiaomiGet(`/api/v1/config/job/filters/${PORTAL_TYPE_SOCIAL}`);
  const cityRows = Array.isArray(data?.city_list)
    ? data.city_list.map(c => ({
        group: 'city',
        parent: '',
        code: c.code,
        name: c.name,
        en_name: c.en_name || '',
        sort_id: c.mdm_code || '',
      }))
    : [];

  const natureRows = [
    { group: 'nature', parent: '', code: '1', name: '社招', en_name: 'Experienced', sort_id: '1' },
    { group: 'nature', parent: '', code: '2', name: '校招', en_name: 'Campus', sort_id: '2' },
    { group: 'nature', parent: '', code: '3', name: '实习', en_name: 'Intern', sort_id: '3' },
  ];

  return [...cityRows, ...natureRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

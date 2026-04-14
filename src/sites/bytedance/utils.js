import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'bytedance-jobs';
export const DOMAIN = 'jobs.bytedance.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/experienced/position`;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 200;

export const COLUMNS = [
  'id',
  'code',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'updated_at',
  'url',
];

export const DETAIL_COLUMNS = [
  'id',
  'code',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'updated_at',
  'description',
  'requirement',
  'url',
];

const REQUEST_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Referer: `${SOCIAL_URL}`,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
};

const CATEGORY_MAP = {
  '6704215862603155720': '研发',
  '6704215862557018372': '后端',
  '6704215886108035339': '前端',
  '6704215957146962184': '客户端',
  '6704215958816295181': '基础架构',
  '6704215956018694411': '算法',
  '6704219534724696331': '机器学习',
  '6704215897130666254': '测试',
  '6704217321877014787': '运维',
  '6704216109274368264': '安全',
  '6938376045242353957': '硬件',
  '6704215864629004552': '产品',
  '6704215864591255820': '产品经理',
  '6704215882479962371': '运营',
  '6704215882438019342': '商业运营',
  '6704215961064442123': '内容运营',
  '6704216057269192973': '产品运营',
  '6704216853931100430': '销售运营',
  '6704215901438216462': '市场',
  '6709824272505768200': '销售',
  '6704215938645887239': '销售',
  '6704215966085024003': '销售支持',
  '6704216224387041544': '数据分析',
  '6704216480889702664': '财务',
  '6704215913488451847': '职能 / 支持',
  '6709824272514156812': '设计',
  '6704216386916321540': '人力',
  '6863074795655792910': '项目管理',
};

const CATEGORY_ALIASES = {
  研发: '6704215862603155720',
  'r&d': '6704215862603155720',
  后端: '6704215862557018372',
  backend: '6704215862557018372',
  前端: '6704215886108035339',
  frontend: '6704215886108035339',
  客户端: '6704215957146962184',
  client: '6704215957146962184',
  基础架构: '6704215958816295181',
  infrastructure: '6704215958816295181',
  算法: '6704215956018694411',
  algorithm: '6704215956018694411',
  机器学习: '6704219534724696331',
  ml: '6704219534724696331',
  'machine learning': '6704219534724696331',
  测试: '6704215897130666254',
  testing: '6704215897130666254',
  qa: '6704215897130666254',
  运维: '6704217321877014787',
  devops: '6704217321877014787',
  安全: '6704216109274368264',
  security: '6704216109274368264',
  硬件: '6938376045242353957',
  hardware: '6938376045242353957',
  产品: '6704215864629004552',
  product: '6704215864629004552',
  产品经理: '6704215864591255820',
  'product manager': '6704215864591255820',
  pm: '6704215864591255820',
  运营: '6704215882479962371',
  operations: '6704215882479962371',
  operation: '6704215882479962371',
  商业运营: '6704215882438019342',
  内容运营: '6704215961064442123',
  产品运营: '6704216057269192973',
  销售运营: '6704216853931100430',
  市场: '6704215901438216462',
  marketing: '6704215901438216462',
  销售: '6709824272505768200',
  sales: '6709824272505768200',
  销售支持: '6704215966085024003',
  数据分析: '6704216224387041544',
  'data analysis': '6704216224387041544',
  data: '6704216224387041544',
  财务: '6704216480889702664',
  finance: '6704216480889702664',
  职能: '6704215913488451847',
  support: '6704215913488451847',
  设计: '6709824272514156812',
  design: '6709824272514156812',
  人力: '6704216386916321540',
  hr: '6704216386916321540',
  项目管理: '6863074795655792910',
  'project management': '6863074795655792910',
};

const CITY_MAP = {
  CT_11: '北京',
  CT_125: '上海',
  CT_128: '深圳',
  CT_45: '广州',
  CT_52: '杭州',
  CT_22: '成都',
  CT_154: '武汉',
  CT_155: '西安',
  CT_66: '济南',
  CT_188: '郑州',
  CT_163: '新加坡',
  CT_157: '西雅图',
  CT_33: '迪拜',
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
  成都: 'CT_22',
  chengdu: 'CT_22',
  武汉: 'CT_154',
  wuhan: 'CT_154',
  西安: 'CT_155',
  xian: 'CT_155',
  济南: 'CT_66',
  jinan: 'CT_66',
  郑州: 'CT_188',
  zhengzhou: 'CT_188',
  新加坡: 'CT_163',
  singapore: 'CT_163',
  西雅图: 'CT_157',
  seattle: 'CT_157',
  迪拜: 'CT_33',
  dubai: 'CT_33',
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

async function readJsonResponse(response, endpoint) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError(
      'BYTEDANCE_BAD_RESPONSE',
      `ByteDance returned non-JSON data for ${endpoint}`,
      `HTTP ${response.status}: ${text.slice(0, 160)}`,
    );
  }
  if (!response.ok) {
    throw new CliError(
      'BYTEDANCE_HTTP',
      `ByteDance API request failed with HTTP ${response.status}`,
      payload?.message || response.statusText,
    );
  }
  if (payload.code !== 0) {
    throw new CliError(
      'BYTEDANCE_API',
      `ByteDance API returned code ${payload.code}`,
      payload?.message || 'The recruitment API rejected the request.',
    );
  }
  return payload.data;
}

export async function bytedanceApi(endpoint, body = {}) {
  const url = `${BASE_URL}/api/v1${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

export function resolveCategory(input) {
  if (!input) return '';
  const value = String(input).trim();
  if (CATEGORY_MAP[value]) return value;
  return CATEGORY_ALIASES[normalizeAliasKey(value)] || CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
}

export function resolveCity(input) {
  if (!input) return '';
  const value = String(input).trim();
  if (CITY_MAP[value]) return value;
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

export function jobUrl(id) {
  return `${BASE_URL}/experienced/position/${id}/detail`;
}

export function normalizeJob(job) {
  const cityInfo = job.city_info || {};
  const category = job.job_category || {};
  const recruitType = job.recruit_type || {};
  const parentType = recruitType.parent || {};
  const cityList = Array.isArray(job.city_list) && job.city_list.length
    ? job.city_list
    : [cityInfo].filter(c => c.code);

  const locationCodes = cityList.map(c => c.code).filter(Boolean).join(',');
  const locationNames = cityList.map(c => c.name || CITY_MAP[c.code] || c.code).filter(Boolean).join(',');

  const visible = {
    id: fieldText(job.id),
    code: fieldText(job.code),
    name: fieldText(job.title),
    url: jobUrl(job.id),
    category_code: fieldText(category.id),
    category_name: CATEGORY_MAP[category.id] || fieldText(category.name),
    nature_code: fieldText(recruitType.id),
    nature_name: `${fieldText(parentType.name || '')}${parentType.name ? '-' : ''}${fieldText(recruitType.name)}`.replace(/^-/, ''),
    location_codes: locationCodes,
    location_names: locationNames,
    experience_code: '',
    levels: '',
    department_code: '',
    department_name: '',
    updated_at: job.publish_time ? new Date(job.publish_time).toISOString().slice(0, 10) : '',
    description: fieldText(job.description).trim(),
    requirement: fieldText(job.requirement).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      code: job.code,
      job_category_id: category.id,
      city_code: cityInfo.code,
      recruit_type_id: recruitType.id,
      publish_time: job.publish_time,
      storefront_mode: job.storefront_mode,
      process_type: job.process_type,
    },
  });
  return output;
}

export function buildSearchBody(args, offset, limit) {
  const categoryId = resolveCategory(args.category);
  const cityCode = resolveCity(args.location);
  return {
    keyword: args.query || '',
    limit,
    offset,
    job_category_id_list: categoryId ? [categoryId] : [],
    city_code_list: cityCode ? [cityCode] : [],
    recruit_type: 1,
  };
}

export async function fetchJobs(args, offset, limit) {
  const data = await bytedanceApi('/search/job/posts', buildSearchBody(args, offset, limit));
  return {
    total: Number(data?.count || 0),
    list: Array.isArray(data?.job_post_list) ? data.job_post_list : [],
  };
}

export async function fetchJobById(id) {
  const searches = [id];
  if (/^[A-Za-z]\d+[A-Za-z]?$/.test(id)) {
    searches.push(id);
  }
  for (const keyword of searches) {
    const data = await bytedanceApi('/search/job/posts', {
      keyword,
      limit: 50,
      offset: 0,
      job_category_id_list: [],
      city_code_list: [],
      recruit_type: 1,
    });
    const list = Array.isArray(data?.job_post_list) ? data.job_post_list : [];
    const match = list.find(job => String(job.id) === String(id) || String(job.code) === String(id));
    if (match) return match;
  }
  throw new EmptyResultError(`${SITE} detail`, `No ByteDance job found for id ${id}`);
}

export async function fetchFilters() {
  const data = await bytedanceApi('/search/job/posts', {
    keyword: '',
    limit: MAX_PAGE_SIZE,
    offset: 0,
    job_category_id_list: [],
    city_code_list: [],
    recruit_type: 1,
  });
  const list = Array.isArray(data?.job_post_list) ? data.job_post_list : [];

  const categorySet = new Map();
  const citySet = new Map();
  for (const job of list) {
    const cat = job.job_category;
    if (cat?.id && !categorySet.has(cat.id)) {
      categorySet.set(cat.id, { name: cat.name, en_name: cat.en_name || '' });
    }
    const city = job.city_info;
    if (city?.code && !citySet.has(city.code)) {
      citySet.set(city.code, { name: city.name, en_name: city.en_name || '' });
    }
  }

  for (const [id, info] of Object.entries(CATEGORY_MAP)) {
    if (!categorySet.has(id)) {
      const en = Object.entries(CATEGORY_ALIASES).find(([, v]) => v === id && /^[a-zA-Z]/.test(v));
      categorySet.set(id, { name: info, en_name: '' });
    }
  }
  for (const [code, name] of Object.entries(CITY_MAP)) {
    if (!citySet.has(code)) {
      citySet.set(code, { name, en_name: '' });
    }
  }

  const categoryRows = [...categorySet.entries()].map(([code, info], index) => ({
    group: 'category',
    parent: '',
    code,
    name: info.name,
    en_name: info.en_name,
    sort_id: index + 1,
  }));

  const cityRows = [...citySet.entries()].map(([code, info], index) => ({
    group: 'location',
    parent: '',
    code,
    name: info.name,
    en_name: info.en_name,
    sort_id: index + 1,
  }));

  const natureRows = [
    { group: 'nature', parent: '', code: '1', name: '社招', en_name: 'Experienced', sort_id: 1 },
  ];

  return [...cityRows, ...categoryRows, ...natureRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

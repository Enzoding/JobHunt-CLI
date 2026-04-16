import crypto from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'kuaishou-jobs';
export const DOMAIN = 'zhaopin.kuaishou.cn';
export const BASE_URL = `https://${DOMAIN}`;
export const API_PREFIX = '/recruit/e';
export const SIGN_SECRET = process.env.KUAISHOU_SIGN_SECRET || '652f962a-0575-4575-98d2-f04e2291bee2';
export const SOCIAL_URL = `${BASE_URL}/#/official/social/`;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const COLUMNS = [
  'id',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'experience_code',
  'levels',
  'department_code',
  'updated_at',
  'url',
];

export const DETAIL_COLUMNS = [
  'id',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'experience_code',
  'levels',
  'department_code',
  'updated_at',
  'description',
  'requirement',
  'url',
];

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  Referer: `${BASE_URL}/`,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
};

const CATEGORY_MAP = {
  J0012: '工程类',
  J0011: '算法类',
  J0005: '产品类',
  J0004: '运营类',
  J0003: '设计类',
  J0014: '分析类',
  J0013: '战略类',
  J0006: '市场类',
  J0002: '职能类',
  J0007: '客服类',
  J0008: '审核类',
  J0009: '内容评级类',
  J0015: '销售及支持类',
  J0010: '其它类',
};

const CATEGORY_ALIASES = {
  工程: 'J0012',
  工程类: 'J0012',
  engineering: 'J0012',
  算法: 'J0011',
  算法类: 'J0011',
  algorithm: 'J0011',
  algorithms: 'J0011',
  产品: 'J0005',
  产品类: 'J0005',
  product: 'J0005',
  运营: 'J0004',
  运营类: 'J0004',
  operations: 'J0004',
  operation: 'J0004',
  设计: 'J0003',
  设计类: 'J0003',
  design: 'J0003',
  分析: 'J0014',
  分析类: 'J0014',
  analysis: 'J0014',
  战略: 'J0013',
  战略类: 'J0013',
  strategy: 'J0013',
  市场: 'J0006',
  市场类: 'J0006',
  marketing: 'J0006',
  职能: 'J0002',
  职能类: 'J0002',
  function: 'J0002',
  客服: 'J0007',
  客服类: 'J0007',
  审核: 'J0008',
  审核类: 'J0008',
  内容评级: 'J0009',
  内容评级类: 'J0009',
  销售: 'J0015',
  销售及支持: 'J0015',
  销售及支持类: 'J0015',
  其它: 'J0010',
  其它类: 'J0010',
  其他: 'J0010',
  other: 'J0010',
};

const LOCATION_MAP = {
  domestic: '中国大陆',
  foreign: '海外',
  Beijing: '北京',
  Shanghai: '上海',
  Guangzhou: '广州',
  Shenzhen: '深圳',
  Tianjin: '天津',
  Hangzhou: '杭州',
  Chengdu: '成都',
  Wuhan: '武汉',
  qingdao: '青岛',
  Yantai: '烟台',
  Xian: '西安',
  Shenyang: '沈阳',
  shijiazhuang: '石家庄',
  Wuxi: '无锡',
  huaian: '淮安',
  tongren: '铜仁',
  jishou: '吉首',
  wulanchabu: '乌兰察布',
  chengmai: '澄迈',
  Zhuhai: '珠海',
  huhehaote: '呼和浩特',
  'Los Angeles': '洛杉矶',
  saopaulo: '圣保罗',
};

const LOCATION_ALIASES = {
  全国: 'domestic',
  国内: 'domestic',
  中国: 'domestic',
  中国大陆: 'domestic',
  海外: 'foreign',
  国外: 'foreign',
  北京: 'Beijing',
  beijing: 'Beijing',
  上海: 'Shanghai',
  shanghai: 'Shanghai',
  广州: 'Guangzhou',
  guangzhou: 'Guangzhou',
  深圳: 'Shenzhen',
  shenzhen: 'Shenzhen',
  天津: 'Tianjin',
  tianjin: 'Tianjin',
  杭州: 'Hangzhou',
  hangzhou: 'Hangzhou',
  成都: 'Chengdu',
  chengdu: 'Chengdu',
  武汉: 'Wuhan',
  wuhan: 'Wuhan',
  青岛: 'qingdao',
  qingdao: 'qingdao',
  烟台: 'Yantai',
  yantai: 'Yantai',
  西安: 'Xian',
  xian: 'Xian',
  沈阳: 'Shenyang',
  shenyang: 'Shenyang',
  石家庄: 'shijiazhuang',
  shijiazhuang: 'shijiazhuang',
  无锡: 'Wuxi',
  wuxi: 'Wuxi',
  淮安: 'huaian',
  huaian: 'huaian',
  铜仁: 'tongren',
  tongren: 'tongren',
  吉首: 'jishou',
  jishou: 'jishou',
  乌兰察布: 'wulanchabu',
  wulanchabu: 'wulanchabu',
  澄迈: 'chengmai',
  chengmai: 'chengmai',
  珠海: 'Zhuhai',
  zhuhai: 'Zhuhai',
  呼和浩特: 'huhehaote',
  huhehaote: 'huhehaote',
  洛杉矶: 'Los Angeles',
  losangeles: 'Los Angeles',
  'los angeles': 'Los Angeles',
  圣保罗: 'saopaulo',
  saopaulo: 'saopaulo',
  'sao paulo': 'saopaulo',
};

const NATURE_MAP = {
  C001: '全职',
  C002: '实习',
};

const NATURE_ALIASES = {
  全职: 'C001',
  社招: 'C001',
  正式: 'C001',
  fulltime: 'C001',
  'full-time': 'C001',
  实习: 'C002',
  实习生: 'C002',
  intern: 'C002',
  internship: 'C002',
};

function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_-]+/g, '');
}

function canonicalQuery(params) {
  const pairs = [];
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value === undefined || value === null || value === '') continue;
    const values = Array.isArray(value) ? value : [value];
    const normalizedValues = values
      .filter(item => item !== undefined && item !== null && item !== '')
      .map(item => String(item))
      .sort();
    if (!normalizedValues.length) continue;
    const encoded = normalizedValues
      .map(item => encodeURIComponent(item).replace(/%20/g, '+'))
      .join(',');
    pairs.push(`${key}=${encoded}`);
  }
  return pairs.join('&');
}

function signHeaders(params) {
  const signTimestamp = String(Date.now());
  const signInput = `${signTimestamp}${canonicalQuery(params)}${SIGN_SECRET}`;
  const sign = crypto.createHmac('sha256', SIGN_SECRET).update(signInput).digest('hex');
  return { sign, signTimestamp };
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

async function readJsonResponse(response, endpoint) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError(
      'KUAISHOU_BAD_RESPONSE',
      `Kuaishou returned non-JSON data for ${endpoint}`,
      `HTTP ${response.status}: ${text.slice(0, 160)}`,
    );
  }
  if (!response.ok) {
    throw new CliError(
      'KUAISHOU_HTTP',
      `Kuaishou API request failed with HTTP ${response.status}`,
      payload.message || response.statusText,
    );
  }
  if (payload.code !== 0) {
    throw new CliError(
      'KUAISHOU_API',
      `Kuaishou API returned code ${payload.code}`,
      payload.message || 'The recruitment API rejected the request.',
    );
  }
  return payload.result;
}

export async function kuaishouApi(endpoint, params = {}, options = {}) {
  const query = cleanParams(params);
  const url = new URL(`${BASE_URL}${API_PREFIX}${endpoint}`);
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else {
      url.searchParams.set(key, value);
    }
  }
  const headers = {
    ...REQUEST_HEADERS,
    ...(options.signed === false ? {} : signHeaders(query)),
  };
  const response = await fetch(url, { headers });
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
  if (LOCATION_MAP[value]) return value;
  return LOCATION_ALIASES[normalizeAliasKey(value)] || LOCATION_ALIASES[normalizeCompactKey(value)] || value;
}

export function resolveNature(input) {
  if (!input) return '';
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

function fieldText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  if (value === undefined || value === null) return '';
  return String(value);
}

function normalizeLocations(job) {
  const codes = Array.isArray(job.workLocationsCode) && job.workLocationsCode.length
    ? job.workLocationsCode
    : [job.workLocationCode].filter(Boolean);
  return {
    codes,
    names: codes.map(code => LOCATION_MAP[code] || code),
  };
}

export function jobUrl(id) {
  return `${BASE_URL}/#/official/social/job-info/${id}`;
}

export function normalizeJob(job) {
  const locations = normalizeLocations(job);
  const visible = {
    id: job.id,
    name: fieldText(job.name),
    url: jobUrl(job.id),
    category_code: fieldText(job.positionCategoryCode),
    category_name: CATEGORY_MAP[job.positionCategoryCode] || fieldText(job.positionCategoryCode),
    nature_code: fieldText(job.positionNatureCode),
    nature_name: NATURE_MAP[job.positionNatureCode] || fieldText(job.positionNatureCode),
    location_codes: locations.codes.join(','),
    location_names: locations.names.join(','),
    experience_code: fieldText(job.workExperienceCode),
    levels: fieldText(job.levels),
    department_code: fieldText(job.departmentCode),
    updated_at: fieldText(job.updateTime),
    description: fieldText(job.description).trim(),
    requirement: fieldText(job.positionDemand).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      recruitProjectCode: job.recruitProjectCode,
      positionNatureCode: job.positionNatureCode,
      positionCategoryCode: job.positionCategoryCode,
      workLocationCode: job.workLocationCode,
      workLocationsCode: job.workLocationsCode,
      workExperienceCode: job.workExperienceCode,
      departmentCode: job.departmentCode,
      channelCode: job.channelCode,
      updateTime: job.updateTime,
    },
  });
  return output;
}

export function buildSearchParams(args, pageNum, pageSize) {
  return {
    pageNum,
    pageSize,
    name: args.query,
    workLocationCode: resolveLocation(args.location),
    positionCategoryCode: resolveCategory(args.category),
    positionNatureCode: resolveNature(args.nature),
  };
}

export async function fetchJobs(args, pageNum, pageSize) {
  const result = await kuaishouApi('/api/v1/open/positions/simple', buildSearchParams(args, pageNum, pageSize));
  return {
    total: Number(result?.total || 0),
    pageNum: Number(result?.pageNum || pageNum),
    pageSize: Number(result?.pageSize || pageSize),
    pages: Number(result?.pages || 0),
    hasNextPage: Boolean(result?.hasNextPage),
    list: Array.isArray(result?.list) ? result.list : [],
  };
}

export async function fetchJobDetail(id) {
  const result = await kuaishouApi('/api/v1/open/position', { id });
  if (!result || !result.id) {
    throw new EmptyResultError(`${SITE} detail`, `No Kuaishou job found for id ${id}`);
  }
  return result;
}

function flattenLabelGroup(group, groupName) {
  if (!group || typeof group !== 'object') return [];
  return Object.entries(group).flatMap(([parent, items]) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      group: groupName,
      parent,
      code: item.code,
      name: item.name,
      en_name: item.enName || '',
      sort_id: item.sortId ?? '',
    }));
  });
}

export async function fetchFilters() {
  const result = await kuaishouApi(
    '/api/v1/open/positions/label',
    { channelCode: 'official', positionNatureCode: 'C001' },
    { signed: false },
  );
  const locationRows = [
    ...flattenLabelGroup({ domestic: result?.domestic }, 'location'),
    ...flattenLabelGroup({ foreign: result?.foreign }, 'location'),
  ];
  const categoryRows = Array.isArray(result?.category)
    ? result.category.map(item => ({
        group: 'category',
        parent: '',
        code: item.code,
        name: item.name,
        en_name: item.enName || '',
        sort_id: item.sortId ?? '',
      }))
    : [];
  const natureRows = Object.entries(NATURE_MAP).map(([code, name], index) => ({
    group: 'nature',
    parent: '',
    code,
    name,
    en_name: code === 'C001' ? 'Full-time' : 'Internship',
    sort_id: index + 1,
  }));
  return [...locationRows, ...categoryRows, ...natureRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

import crypto from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, natureDisplayName, stampStandardNature } from '../../core/natures.js';

export const SITE = 'kuaishou-jobs';
export const DOMAIN = 'zhaopin.kuaishou.cn';
export const BASE_URL = `https://${DOMAIN}`;
export const CAMPUS_DOMAIN = 'campus.kuaishou.cn';
export const CAMPUS_BASE_URL = `https://${CAMPUS_DOMAIN}`;
export const API_PREFIX = '/recruit/e';
export const CAMPUS_API_PREFIX = '/recruit/campus/e';
export const SIGN_SECRET = process.env.KUAISHOU_SIGN_SECRET || '652f962a-0575-4575-98d2-f04e2291bee2';
/** SPA web container roots — hash routes must sit under these paths or Nginx 302 drops `#`. */
export const SOCIAL_SPA_ROOT = `${BASE_URL}/recruit/e/`;
export const CAMPUS_SPA_ROOT = `${CAMPUS_BASE_URL}/recruit/campus/e/`;
export const SOCIAL_URL = `${SOCIAL_SPA_ROOT}#/official/social/`;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Verified 2026-07-19 via Chrome DevTools:
 * - social/intern: zhaopin.kuaishou.cn signed API with C001/C002; SPA under /recruit/e/
 * - campus: campus.kuaishou.cn JSON API (positions/simple + positions/find); SPA under /recruit/campus/e/
 */
export const NATURE_CHANNELS = {
  social: {
    backend: 'social',
    positionNatureCode: 'C001',
    channelCode: 'official',
    referer: `${SOCIAL_SPA_ROOT}#/official/social/`,
    jobPath: 'social',
  },
  intern: {
    backend: 'social',
    positionNatureCode: 'C002',
    channelCode: 'G002',
    referer: `${SOCIAL_SPA_ROOT}#/official/trainee/`,
    jobPath: 'trainee',
  },
  campus: {
    backend: 'campus',
    positionNatureCode: 'fulltime',
    referer: CAMPUS_SPA_ROOT,
    jobPath: 'campus',
  },
};

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

const SOURCE_NATURE_NAMES = {
  C001: '全职',
  C002: '实习',
  fulltime: '全职',
  intern: '实习',
};

const SOURCE_TO_STANDARD = {
  C001: 'social',
  C002: 'intern',
  fulltime: 'campus',
  intern: 'intern',
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

export function resolveNatureChannel(nature = DEFAULT_NATURE) {
  return NATURE_CHANNELS[nature] || NATURE_CHANNELS[DEFAULT_NATURE];
}

export function resolveNature(input, channelNature = DEFAULT_NATURE) {
  if (!input) return resolveNatureChannel(channelNature).positionNatureCode;
  const value = String(input).trim();
  if (NATURE_CHANNELS[value]) return NATURE_CHANNELS[value].positionNatureCode;
  if (SOURCE_TO_STANDARD[value]) return value;
  const key = normalizeAliasKey(value);
  if (key === 'c001' || key === '全职' || key === '社招' || key === '正式' || key === 'fulltime' || key === 'full-time') {
    return 'C001';
  }
  if (key === 'c002' || key === '实习' || key === '实习生' || key === 'intern' || key === 'internship') {
    return 'C002';
  }
  return resolveNatureChannel(channelNature).positionNatureCode;
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

export function jobUrl(id, nature = DEFAULT_NATURE, options = {}) {
  const channel = resolveNatureChannel(nature);
  if (channel.backend === 'campus') {
    let url = `${CAMPUS_SPA_ROOT}#/campus/job-info/${id}`;
    const batch = options.recruitSubProjectCode;
    if (batch) url += `?recruitSubProjectCodes=${encodeURIComponent(batch)}`;
    return url;
  }
  return `${SOCIAL_SPA_ROOT}#/official/${channel.jobPath}/job-info/${id}`;
}

function campusLocations(job) {
  const dicts = Array.isArray(job.workLocationDicts) ? job.workLocationDicts : [];
  return {
    codes: dicts.map(item => item.code).filter(Boolean),
    names: dicts.map(item => item.name).filter(Boolean),
  };
}

function resolveStandardNature(job, channelNature = DEFAULT_NATURE) {
  const sourceCode = fieldText(job.positionNatureCode);
  if (SOURCE_TO_STANDARD[sourceCode] === 'intern' || /实习|intern/i.test(sourceCode)) return 'intern';
  if (channelNature === 'campus' || SOURCE_TO_STANDARD[sourceCode] === 'campus') return 'campus';
  if (SOURCE_TO_STANDARD[sourceCode]) return SOURCE_TO_STANDARD[sourceCode];
  return channelNature;
}

export function normalizeJob(job, channelNature = DEFAULT_NATURE) {
  const channel = resolveNatureChannel(channelNature);
  const locations = channel.backend === 'campus' ? campusLocations(job) : normalizeLocations(job);
  const sourceCode = fieldText(job.positionNatureCode);
  const sourceName = SOURCE_NATURE_NAMES[sourceCode] || sourceCode;
  const nature = resolveStandardNature(job, channelNature);
  const updatedAt = typeof job.updateTime === 'number'
    ? new Date(job.updateTime).toISOString().slice(0, 10)
    : fieldText(job.updateTime);
  const urlNature = nature === 'intern' && channelNature === 'campus' ? 'intern' : nature;
  const visible = {
    id: job.id,
    name: fieldText(job.name),
    url: jobUrl(job.id, urlNature, { recruitSubProjectCode: job.recruitSubProjectCode }),
    category_code: fieldText(job.positionCategoryCode),
    category_name: CATEGORY_MAP[job.positionCategoryCode] || fieldText(job.positionCategoryCode),
    nature_code: nature,
    nature_name: natureDisplayName(nature),
    location_codes: locations.codes.join(','),
    location_names: locations.names.join(','),
    experience_code: fieldText(job.workExperienceCode),
    levels: fieldText(job.levels),
    department_code: fieldText(job.departmentCode),
    department_name: fieldText(job.departmentName),
    updated_at: updatedAt,
    description: fieldText(job.description).trim(),
    requirement: fieldText(job.positionDemand).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      code: job.code,
      recruitProjectCode: job.recruitProjectCode,
      recruitSubProjectCode: job.recruitSubProjectCode,
      positionNatureCode: job.positionNatureCode,
      positionCategoryCode: job.positionCategoryCode,
      workLocationCode: job.workLocationCode,
      workLocationsCode: job.workLocationsCode,
      workExperienceCode: job.workExperienceCode,
      departmentCode: job.departmentCode,
      channelCode: job.channelCode,
      updateTime: job.updateTime,
      source_nature_code: sourceCode,
      source_nature_name: sourceName,
      backend: channel.backend,
    },
  });
  return stampStandardNature(output, nature, { code: sourceCode, name: sourceName });
}

export function buildSearchParams(args, pageNum, pageSize) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  return {
    pageNum,
    pageSize,
    name: args.query,
    workLocationCode: resolveLocation(args.location),
    positionCategoryCode: resolveCategory(args.category),
    positionNatureCode: resolveNature(args.nature, nature) || channel.positionNatureCode,
  };
}

async function campusPost(endpoint, body = {}) {
  const url = `${CAMPUS_BASE_URL}${CAMPUS_API_PREFIX}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Referer: NATURE_CHANNELS.campus.referer,
      Origin: CAMPUS_BASE_URL,
      'User-Agent': REQUEST_HEADERS['User-Agent'],
    },
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

async function campusGet(endpoint) {
  const url = `${CAMPUS_BASE_URL}${CAMPUS_API_PREFIX}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      Referer: NATURE_CHANNELS.campus.referer,
      'User-Agent': REQUEST_HEADERS['User-Agent'],
    },
  });
  return readJsonResponse(response, endpoint);
}

export async function fetchJobs(args, pageNum, pageSize) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  if (channel.backend === 'campus') {
    const body = cleanParams({
      pageNum,
      pageSize,
      name: args.query || undefined,
      workLocationCode: resolveLocation(args.location) || undefined,
      positionCategoryCode: resolveCategory(args.category) || undefined,
      positionNatureCode: channel.positionNatureCode,
    });
    const result = await campusPost('/api/v1/open/positions/simple', body);
    return {
      total: Number(result?.total || 0),
      pageNum,
      pageSize,
      pages: Math.ceil(Number(result?.total || 0) / pageSize) || 0,
      hasNextPage: pageNum * pageSize < Number(result?.total || 0),
      list: Array.isArray(result?.list) ? result.list : [],
    };
  }

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

export async function fetchJobDetail(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  if (channel.backend === 'campus') {
    const result = await campusGet(`/api/v1/open/positions/find?id=${encodeURIComponent(id)}`);
    if (!result || !result.id) {
      throw new EmptyResultError(`${SITE} detail`, `No Kuaishou campus job found for id ${id}`);
    }
    return result;
  }
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

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);

  if (channel.backend === 'campus') {
    const result = await campusGet(
      '/api/v1/dictionary/batch?types=workLocation,positionCategory,positionNature,recruitSubProject',
    );
    const locationRows = Array.isArray(result?.workLocation)
      ? result.workLocation.filter(item => item.ifActive !== false).map(item => ({
          group: 'location',
          parent: '',
          code: item.code,
          name: item.name,
          en_name: '',
          sort_id: item.sortId ?? '',
        }))
      : [];
    const categoryRows = Array.isArray(result?.positionCategory)
      ? result.positionCategory.flatMap(parent => {
          const self = [{
            group: 'category',
            parent: '',
            code: parent.code,
            name: parent.name,
            en_name: '',
            sort_id: parent.sortId ?? '',
          }];
          const children = Array.isArray(parent.children)
            ? parent.children.map(child => ({
                group: 'category',
                parent: parent.name,
                code: child.code,
                name: child.name,
                en_name: '',
                sort_id: child.sortId ?? '',
              }))
            : [];
          return [...self, ...children];
        })
      : [];
    return [...locationRows, ...categoryRows];
  }

  const result = await kuaishouApi(
    '/api/v1/open/positions/label',
    { channelCode: channel.channelCode, positionNatureCode: channel.positionNatureCode },
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
  return [...locationRows, ...categoryRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

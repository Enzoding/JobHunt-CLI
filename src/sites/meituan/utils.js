import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'meituan-jobs';
export const DOMAIN = 'zhaopin.meituan.com';
export const BASE_URL = `https://${DOMAIN}`;
export const API_PREFIX = '/api/official';
export const SOCIAL_URL = `${BASE_URL}/web/social`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 30;

export const COLUMNS = [
  'id',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'experience_code',
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
  'experience_code',
  'department_name',
  'updated_at',
  'description',
  'requirement',
  'url',
];

const REQUEST_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Referer: `${BASE_URL}/web/social`,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest',
};

const JOB_TYPE_SOCIAL = '3';

const NATURE_MAP = {
  '3': '社招',
  '1': '校招',
  '2': '实习',
};

const CATEGORY_ALIASES = {
  技术: '11001',
  技术类: '11001',
  engineering: '11001',
  tech: '11001',
  software: '11001',
  产品: '11002',
  产品类: '11002',
  product: '11002',
  商业分析: '11008',
  商业分析类: '11008',
  analysis: '11008',
  零售: '11009',
  零售类: '11009',
  retail: '11009',
  运营: '11003',
  运营类: '11003',
  operations: '11003',
  operation: '11003',
  设计: '11004',
  设计类: '11004',
  design: '11004',
  市场: '11005',
  市场营销: '11005',
  市场营销类: '11005',
  marketing: '11005',
  职能: '11006',
  职能类: '11006',
  hr: '11006',
  金融: '11007',
  金融类: '11007',
  finance: '11007',
  销售: '11010',
  客服: '11010',
  销售客服: '11010',
  sales: '11010',
  综合: '11011',
  综合类: '11011',
  general: '11011',
};

const CITY_ALIASES = {
  北京: '001001',
  beijing: '001001',
  上海: '001009',
  shanghai: '001009',
  深圳: '001019002',
  shenzhen: '001019002',
  成都: '001023001',
  chengdu: '001023001',
  香港: '001032',
  hongkong: '001032',
  'hong kong': '001032',
  广州: '001019001',
  guangzhou: '001019001',
  武汉: '001017001',
  wuhan: '001017001',
  杭州: '001011001',
  hangzhou: '001011001',
  西安: '001027001',
  xian: '001027001',
  重庆: '001022',
  chongqing: '001022',
  南京: '001010001',
  nanjing: '001010001',
  厦门: '001013002',
  xiamen: '001013002',
  其他: 'other',
  other: 'other',
};

function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_-]+/g, '');
}

export function resolveCategory(input) {
  if (!input) return '';
  const value = String(input).trim();
  return CATEGORY_ALIASES[normalizeAliasKey(value)] || CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
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
    throw new CliError(
      'MEITUAN_BAD_RESPONSE',
      `Meituan returned non-JSON data for ${endpoint}`,
      `HTTP ${response.status}: ${text.slice(0, 160)}`,
    );
  }
  if (!response.ok) {
    throw new CliError(
      'MEITUAN_HTTP',
      `Meituan API request failed with HTTP ${response.status}`,
      payload.message || response.statusText,
    );
  }
  if (payload.status !== 1) {
    throw new CliError(
      'MEITUAN_API',
      `Meituan API returned status ${payload.status}`,
      payload.message || 'The recruitment API rejected the request.',
    );
  }
  return payload.data;
}

async function meituanPost(endpoint, body = {}) {
  const url = `${BASE_URL}${API_PREFIX}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/web/social/position/${id}`;
}

function fieldText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  if (value === undefined || value === null) return '';
  return String(value);
}

export function normalizeJob(job) {
  const cities = Array.isArray(job.cityList)
    ? job.cityList.map(c => c.name).filter(Boolean)
    : [];
  const departments = Array.isArray(job.department)
    ? job.department.map(d => d.name).filter(Boolean)
    : [];
  const updatedAt = job.refreshTime
    ? new Date(job.refreshTime).toISOString().slice(0, 10)
    : '';
  const visible = {
    id: fieldText(job.jobUnionId),
    name: fieldText(job.name),
    url: jobUrl(fieldText(job.jobUnionId)),
    category_code: fieldText(job.jobFamily),
    category_name: fieldText(job.jobFamily),
    nature_code: fieldText(job.jobType),
    nature_name: NATURE_MAP[fieldText(job.jobType)] || fieldText(job.jobType),
    location_codes: cities.join(','),
    location_names: cities.join(','),
    experience_code: fieldText(job.workYear),
    levels: '',
    department_code: '',
    department_name: departments.join(','),
    updated_at: updatedAt,
    description: fieldText(job.jobDuty).trim(),
    requirement: fieldText(job.jobRequirement).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      jobUnionId: job.jobUnionId,
      jobType: job.jobType,
      jobFamily: job.jobFamily,
      jobFamilyGroup: job.jobFamilyGroup,
      jobSpecialCode: job.jobSpecialCode,
      cityList: job.cityList,
      department: job.department,
      workYear: job.workYear,
      refreshTime: job.refreshTime,
    },
  });
  return output;
}

export function buildSearchBody(args, pageNo, pageSize) {
  const categoryCode = resolveCategory(args.category);
  const cityCode = resolveCity(args.location);
  return {
    page: { pageNo, pageSize },
    jobShareType: '1',
    keywords: args.query || '',
    cityList: cityCode ? [cityCode] : [],
    department: [],
    jfJgList: categoryCode ? [{ code: categoryCode, subCode: [] }] : [],
    jobType: [{ code: JOB_TYPE_SOCIAL, subCode: [] }],
    typeCode: [],
    specialCode: [],
  };
}

export async function fetchJobs(args, pageNo, pageSize) {
  const data = await meituanPost('/job/getJobList', buildSearchBody(args, pageNo, pageSize));
  return {
    total: Number(data?.page?.totalCount || 0),
    pageNo: Number(data?.page?.pageNo || pageNo),
    pageSize: Number(data?.page?.pageSize || pageSize),
    totalPage: Number(data?.page?.totalPage || 0),
    list: Array.isArray(data?.list) ? data.list : [],
  };
}

export async function fetchJobDetail(jobUnionId) {
  const data = await meituanPost('/job/getJobDetail', { jobUnionId, jobShareType: '1' });
  if (!data || !data.jobUnionId) {
    throw new EmptyResultError(`${SITE} detail`, `No Meituan job found for id ${jobUnionId}`);
  }
  return data;
}

export async function fetchFilters() {
  const [jfData, cityData] = await Promise.all([
    (async () => {
      const r = await fetch(`${BASE_URL}${API_PREFIX}/job/search/enum?enumType=JF`, {
        headers: { ...REQUEST_HEADERS, 'Content-Type': undefined },
      });
      return readJsonResponse(r, '/job/search/enum?enumType=JF');
    })(),
    meituanPost('/city/search', { hotCity: true, keyword: '' }),
  ]);

  const categoryRows = Array.isArray(jfData)
    ? jfData.flatMap(parent =>
        (parent.children || []).map(child => ({
          group: 'category',
          parent: parent.name,
          code: child.code,
          name: child.name,
          en_name: '',
          sort_id: child.sort ?? '',
        })).concat([{
          group: 'category',
          parent: '',
          code: parent.code,
          name: parent.name,
          en_name: '',
          sort_id: parent.sort ?? '',
        }])
      )
    : [];

  const cityRows = Array.isArray(cityData)
    ? cityData.map(c => ({
        group: 'city',
        parent: '',
        code: c.code,
        name: c.name,
        en_name: '',
        sort_id: c.sort ?? '',
      }))
    : [];

  const natureRows = Object.entries(NATURE_MAP).map(([code, name], index) => ({
    group: 'nature',
    parent: '',
    code,
    name,
    en_name: '',
    sort_id: index + 1,
  }));

  return [...categoryRows, ...cityRows, ...natureRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

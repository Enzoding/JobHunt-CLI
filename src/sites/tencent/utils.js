import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'tencent-careers';
export const DOMAIN = 'careers.tencent.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/jobopportunity.html`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

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
  Referer: SOCIAL_URL,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

const CATEGORY_ALIASES = {
  技术: '40001001',
  技术类: '40001001',
  engineering: '40001001',
  tech: '40001001',
  产品: '40003002',
  产品类: '40003002',
  product: '40003002',
  内容: '40002001',
  内容类: '40002001',
  content: '40002001',
  设计: '40005001',
  设计类: '40005001',
  design: '40005001',
  销售: '40004001',
  服务: '40004001',
  支持: '40004001',
  sales: '40004001',
  人力: '40006001',
  hr: '40006001',
  市场: '40007001',
  公关: '40007001',
  marketing: '40007001',
  战略: '40008001',
  投资: '40008001',
  strategy: '40008001',
  财务: '40009001',
  finance: '40009001',
  法律: '40010001',
  legal: '40010001',
  行政: '40011001',
  admin: '40011001',
};

const CITY_ALIASES = {
  北京: '1',
  beijing: '1',
  深圳: '2',
  shenzhen: '2',
  上海: '3',
  shanghai: '3',
  广州: '4',
  guangzhou: '4',
  成都: '8',
  chengdu: '8',
  杭州: '10',
  hangzhou: '10',
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
  const text = fieldText(value);
  const match = text.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!match) return text;
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
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
    throw new CliError('TENCENT_BAD_RESPONSE', `Tencent returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('TENCENT_HTTP', `Tencent API request failed with HTTP ${response.status}`, payload?.Message || response.statusText);
  }
  if (payload.Code !== 200) {
    throw new CliError('TENCENT_API', `Tencent API returned code ${payload.Code}`, payload?.Message || 'The recruitment API rejected the request.');
  }
  return payload.Data;
}

async function tencentGet(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('timestamp', Date.now());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value ?? '');
  }
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/jobdesc.html?postId=${id}`;
}

export function normalizeJob(job) {
  const id = fieldText(job.PostId);
  const responsibility = fieldText(job.Responsibility);
  const requirement = fieldText(job.Requirement || job.Responsibility);
  const visible = {
    id,
    job_no: fieldText(job.RecruitPostId),
    name: fieldText(job.RecruitPostName),
    url: fieldText(job.PostURL) || jobUrl(id),
    category_code: fieldText(job.OuterPostTypeID),
    category_name: fieldText(job.CategoryName),
    nature_code: 'social',
    nature_name: '社招',
    location_codes: fieldText(job.LocationId),
    location_names: fieldText(job.LocationName || job.CountryName),
    experience_code: fieldText(job.RequireWorkYearsName),
    levels: '',
    department_code: fieldText(job.BGId),
    department_name: fieldText(job.ProductName || job.BGName),
    updated_at: dateText(job.LastUpdateTime),
    description: responsibility,
    requirement,
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      post_id: job.PostId,
      recruit_post_id: job.RecruitPostId,
      source_id: job.SourceID,
      bg_name: job.BGName,
      product_name: job.ProductName,
    },
  });
  return output;
}

export async function fetchJobs(args, page, limit) {
  const data = await tencentGet('/tencentcareer/api/post/Query', {
    countryId: '',
    cityId: resolveCity(args.location),
    bgIds: '',
    productId: '',
    categoryId: resolveCategory(args.category),
    parentCategoryId: '',
    attrId: '1',
    keyword: args.query || '',
    pageIndex: page,
    pageSize: limit,
    language: 'zh-cn',
    area: 'cn',
  });
  return {
    total: Number(data?.Count || 0),
    list: Array.isArray(data?.Posts) ? data.Posts : [],
  };
}

export async function fetchJobById(id) {
  const data = await tencentGet('/tencentcareer/api/post/ByPostId', {
    postId: id,
    language: 'zh-cn',
  });
  if (!data?.PostId) throw new EmptyResultError(`${SITE} detail`, `No Tencent job found for id ${id}`);
  return data;
}

export async function fetchFilters() {
  const [dict, categories] = await Promise.all([
    tencentGet('/tencentcareer/api/data/GetMultiDictionary', {
      language: 'zh-cn',
      type: 'Nationality,WorkPlace,OuterType,BG,PostAttr',
    }),
    tencentGet('/tencentcareer/api/post/ByCategories', { language: 'zh-cn' }),
  ]);
  const rows = [];
  const addRows = (group, list = [], codeKey = 'Code', nameKey = 'Name', parent = '') => {
    for (const [index, item] of list.entries()) {
      rows.push({
        group,
        parent,
        code: fieldText(item[codeKey] ?? item.Id ?? item.id),
        name: fieldText(item[nameKey] ?? item.Name ?? item.name),
        en_name: fieldText(item.EnName ?? item.EnglishName),
        sort_id: index + 1,
      });
    }
  };
  addRows('location', dict?.WorkPlace || dict?.LocationList || []);
  addRows('nature', dict?.PostAttr || [], 'Code', 'Name');
  addRows('category', categories?.CategoryList || categories || [], 'CategoryId', 'CategoryName');
  if (!rows.some(r => r.group === 'nature')) {
    rows.push({ group: 'nature', parent: '', code: '1', name: '社招', en_name: 'Experienced', sort_id: 1 });
  }
  return rows.filter(r => r.code || r.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

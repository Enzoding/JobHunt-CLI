import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'ctrip-careers';
export const DOMAIN = 'careers.ctrip.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/index.html#/experienced/jobList`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const COLUMNS = ['id', 'code', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'code', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8',
  Cookie: 'language=zh-CN',
  Origin: BASE_URL,
  Referer: `${BASE_URL}/index.html`,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

const CATEGORY_ALIASES = {
  财务: 'JFG_21',
  人力资源: 'JFG_22',
  法务: 'JFG_23',
  行政: 'JFG_24',
  采购: 'JFG_25',
  公司事务: 'JFG_26',
  技术: 'JFG_31',
  开发: 'JFG_31',
  engineering: 'JFG_31',
  tech: 'JFG_31',
  测试: 'JFG_32',
  ai: 'JFG_33',
  'ai & bi': 'JFG_33',
  'ai&bi': 'JFG_33',
  人工智能: 'JFG_33',
  商业智能: 'JFG_33',
  算法: 'JFG_33',
  数据: 'JFG_33',
  运维: 'JFG_34',
  系统安全: 'JFG_35',
  项目管理技术: 'JFG_36',
  产品: 'JFG_41',
  产品管理: 'JFG_41',
  product: 'JFG_41',
  设计: 'JFG_42',
  用户体验设计: 'JFG_42',
  市场: 'JFG_51',
  业务拓展: 'JFG_61',
  内容管理: 'JFG_62',
  旅游: 'JFG_63',
  互联网金融: 'JFG_64',
  项目流程数据: 'JFG_65',
  客服: 'JFG_71',
  服务运营: 'JFG_72',
  支持: 'JFG_73',
  集团培训生: 'other_000',
};

const CITY_ALIASES = {
  上海: 'CO0009',
  北京: 'CO0001',
  广州: 'CO0003',
  深圳: 'CO0010',
  成都: 'CO0002',
  杭州: 'CO0004',
  南京: 'CO0005',
  武汉: 'CO0012',
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

function stripHtml(value) {
  return fieldText(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|ol|ul)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitDescription(value) {
  const text = stripHtml(value);
  const match = text.match(/(?:职位描述|工作职责|岗位职责)[:：]?([\s\S]*?)(?:任职资格|职位要求|任职要求|岗位要求)[:：]?([\s\S]*)/);
  if (!match) return { description: text, requirement: '' };
  return { description: match[1].trim(), requirement: match[2].trim() };
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

function resolveNature(input) {
  if (!input) return '';
  const value = normalizeCompactKey(input);
  if (['全职', '社招', 'fulltime', 'regular'].includes(value)) return 'Regular';
  if (['实习', '实习生', 'intern', 'internship'].includes(value)) return 'Intern_Long_Term';
  if (['兼职', 'parttime'].includes(value)) return 'Temporary';
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
    throw new CliError('CTRIP_BAD_RESPONSE', `Ctrip returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) throw new CliError('CTRIP_HTTP', `Ctrip API request failed with HTTP ${response.status}`, payload.retMessage || response.statusText);
  if (payload.retCode !== '201') throw new CliError('CTRIP_API', `Ctrip API returned code ${payload.retCode}`, payload.retMessage || 'The recruitment API rejected the request.');
  return payload.retValue;
}

async function ctripPost(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ ...body, head: { language: 'zh_CN', version: '1' } }),
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(code) {
  return `${SOCIAL_URL}?fromId=${encodeURIComponent(code)}`;
}

export function normalizeJob(job) {
  const parts = splitDescription(job.requirements || job.duty);
  const code = fieldText(job.fromId);
  const visible = {
    id: fieldText(job.id),
    code,
    job_no: code,
    name: fieldText(job.jobTitle),
    url: jobUrl(code),
    category_code: fieldText(job.jobFamilyGroupCode),
    category_name: fieldText(job.jobFamilyGroupName),
    nature_code: fieldText(job.kind),
    nature_name: fieldText(job.kindName || '社招'),
    location_codes: fieldText(job.city),
    location_names: fieldText(job.cityName),
    experience_code: '',
    levels: '',
    department_code: fieldText(job.buCode),
    department_name: fieldText(job.buName),
    updated_at: fieldText(job.publishDate),
    description: parts.description,
    requirement: parts.requirement,
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: { id: job.id, from_id: job.fromId, job_id: job.jobId, ats_api_type: job.atsApiType },
  });
  return output;
}

function conditionFromArgs(args = {}) {
  const category = resolveCategory(args.category);
  return {
    fromId: [],
    keyword: args.query || '',
    kind: resolveNature(args.nature) ? [resolveNature(args.nature)] : [],
    country: [],
    city: resolveCity(args.location) ? [resolveCity(args.location)] : [],
    bucode: [],
    jobFamilyCode: [],
    jobFamilyGroupCode: category ? [category] : [],
    category: 1,
  };
}

export async function fetchJobs(args, page, limit) {
  const data = await ctripPost('/api/hrrecruit/getJobAd', {
    condition: conditionFromArgs(args),
    pager: { index: String(page), size: String(limit) },
  });
  return {
    total: Number(data?.total || 0),
    pageNo: page,
    pageSize: limit,
    totalPage: Math.ceil(Number(data?.total || 0) / limit),
    list: Array.isArray(data?.recruitJobAdList) ? data.recruitJobAdList : [],
  };
}

export async function fetchJobByCode(code) {
  const data = await ctripPost('/api/hrrecruit/getJobAd', {
    condition: { ...conditionFromArgs(), fromId: [code] },
    pager: { index: '1', size: '1' },
  });
  const job = data?.recruitJobAdList?.[0];
  if (!job) throw new EmptyResultError(`${SITE} detail`, `No Ctrip job found for code ${code}`);
  return job;
}

export async function fetchFilters() {
  const [locations, groups, bu, kinds] = await Promise.all([
    ctripPost('/api/oversea/getLocation', { countryCode: '', citycode: '', type: 'OverseasCareersWorkPlace' }),
    ctripPost('/api/oversea/getCategory', { categorycode: '', type: 'OverseasCareersJobFamilyGroupCode' }),
    ctripPost('/api/oversea/getCategory', { categorycode: '', type: 'OverseasCareersBucode' }),
    ctripPost('/api/oversea/getCategory', { categorycode: '', type: 'OverseasCareersKind' }),
  ]);
  const rows = [];
  const add = (group, items, codeKey, nameKey, parentKey = '') => {
    for (const [index, item] of (items || []).entries()) {
      rows.push({ group, parent: fieldText(parentKey ? item[parentKey] : ''), code: fieldText(item[codeKey]), name: fieldText(item[nameKey]), en_name: '', sort_id: index + 1 });
    }
  };
  add('location', locations, 'code', 'name');
  add('category', groups, 'categoryCode', 'categoryName', 'parentCode');
  add('department', bu, 'categoryCode', 'categoryName');
  add('nature', kinds, 'categoryCode', 'categoryName');
  return rows.filter(row => row.code || row.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

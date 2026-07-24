import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, stampStandardNature } from '../../core/natures.js';

export const SITE = 'xiaohongshu-jobs';
export const DOMAIN = 'job.xiaohongshu.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/social/position`;
export const CAMPUS_URL = `${BASE_URL}/campus/position`;
export const INTERN_URL = `${BASE_URL}/intern/position`;

export const NATURE_RECRUIT_TYPES = {
  social: 'social',
  campus: 'campus',
  intern: 'intern',
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const COLUMNS = [
  'id',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'updated_at',
  'url',
];

export const DETAIL_COLUMNS = [
  'id',
  'name',
  'category_name',
  'nature_name',
  'location_names',
  'updated_at',
  'description',
  'requirement',
  'url',
];

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';

function listUrlForNature(nature = DEFAULT_NATURE) {
  if (nature === 'campus') return CAMPUS_URL;
  if (nature === 'intern') return INTERN_URL;
  return SOCIAL_URL;
}

function requestHeaders(nature = DEFAULT_NATURE) {
  return {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    Origin: BASE_URL,
    Referer: listUrlForNature(nature),
    'User-Agent': USER_AGENT,
  };
}

function recruitTypeForNature(nature = DEFAULT_NATURE) {
  return NATURE_RECRUIT_TYPES[nature] || NATURE_RECRUIT_TYPES[DEFAULT_NATURE];
}

const CATEGORY_ALIASES = {
  技术: 'tech',
  技术类: 'tech',
  tech: 'tech',
  engineering: 'tech',
  产品: 'pro',
  产品类: 'pro',
  product: 'pro',
  运营: 'om',
  运营类: 'om',
  operations: 'om',
  设计: 'design',
  设计类: 'design',
  design: 'design',
  销售: 'market',
  销售类: 'market',
  sales: 'market',
  职能: 'function',
  职能类: 'function',
  function: 'function',
};

const CITY_ALIASES = {
  北京: '1100',
  北京市: '1100',
  beijing: '1100',
  上海: '3100',
  上海市: '3100',
  shanghai: '3100',
  武汉: '4201',
  武汉市: '4201',
  wuhan: '4201',
  广州: '4401',
  广州市: '4401',
  guangzhou: '4401',
  深圳: '4403',
  深圳市: '4403',
  shenzhen: '4403',
  杭州: '3301',
  杭州市: '3301',
  hangzhou: '3301',
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
    throw new CliError('XIAOHONGSHU_BAD_RESPONSE', `Xiaohongshu returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('XIAOHONGSHU_HTTP', `Xiaohongshu API request failed with HTTP ${response.status}`, payload.alertMsg || response.statusText);
  }
  if (payload.statusCode !== 200) {
    throw new CliError('XIAOHONGSHU_API', `Xiaohongshu API returned status ${payload.statusCode}`, payload.alertMsg || 'The recruitment API rejected the request.');
  }
  return payload.data;
}

async function xhsPost(endpoint, body = {}, nature = DEFAULT_NATURE) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: requestHeaders(nature),
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id, nature = DEFAULT_NATURE) {
  const segment = recruitTypeForNature(nature);
  return `${BASE_URL}/${segment}/position?positionId=${id}`;
}

export function normalizeJob(job, nature = DEFAULT_NATURE) {
  const id = fieldText(job.positionId);
  const recruitType = fieldText(job.recruitType) || recruitTypeForNature(nature);
  const visible = {
    id,
    job_no: id,
    name: fieldText(job.positionName),
    url: jobUrl(id, nature),
    category_code: fieldText(job.jobType),
    category_name: fieldText(job.jobType),
    nature_code: nature,
    nature_name: nature,
    location_codes: fieldText(job.workplaceIds),
    location_names: fieldText(job.workplace),
    experience_code: '',
    levels: '',
    department_code: '',
    department_name: fieldText(job.jobProjectName),
    updated_at: fieldText(job.publishTime),
    description: fieldText(job.duty).trim(),
    requirement: fieldText(job.qualification).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      position_id: job.positionId,
      amount_in_need: job.amountInNeed,
      recruit_status: job.recruitStatus,
      labels: job.labels,
      recruit_type: recruitType,
    },
  });
  return stampStandardNature(output, nature, {
    code: recruitType,
    name: recruitType,
  });
}

export async function fetchJobs(args, page, limit) {
  const nature = args.nature || DEFAULT_NATURE;
  const body = {
    recruitType: recruitTypeForNature(nature),
    positionName: args.query || '',
    pageNum: page,
    pageSize: limit,
  };
  const category = resolveCategory(args.category);
  const city = resolveCity(args.location);
  if (category) body.jobType = category;
  if (city) body.workplace = city;
  const data = await xhsPost('/websiterecruit/position/pageQueryPosition', body, nature);
  const list = Array.isArray(data?.list) ? data.list.slice(0, limit) : [];
  return {
    total: Number(data?.total || 0),
    list,
  };
}

export async function fetchJobById(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  for (let page = 1; page <= 20; page++) {
    const result = await fetchJobs({ ...args, query: '', nature }, page, MAX_PAGE_SIZE);
    const match = result.list.find(job => String(job.positionId) === String(id));
    if (match) return match;
    if (!result.list.length || page * MAX_PAGE_SIZE >= result.total) break;
  }
  throw new EmptyResultError(`${SITE} detail`, `No Xiaohongshu job found for id ${id}`);
}

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const data = await xhsPost('/websiterecruit/common/aggEnumList', {
    applyType: recruitTypeForNature(nature),
    typeList: ['JobTypeEnum', 'PositionWorkplaceEnum'],
  }, nature);
  const rows = [];
  const addRows = (group, list = []) => {
    for (const [index, item] of list.entries()) {
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
  addRows('category', data.JobTypeEnum);
  addRows('location', data.PositionWorkplaceEnum);
  return rows.filter(r => r.code || r.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

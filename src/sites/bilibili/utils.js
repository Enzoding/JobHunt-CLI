import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'bilibili-jobs';
export const DOMAIN = 'jobs.bilibili.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/social/positions?isTrusted=true`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  Origin: BASE_URL,
  Referer: '',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'X-AppKey': 'ops.ehr-api.auth',
  'X-Channel': 'social',
  'X-UserType': '2',
};

const CATEGORY_ALIASES = {
  技术: '01',
  技术类: '01',
  engineering: '01',
  tech: '01',
  职能: '02',
  大职能类: '02',
  产品: '03',
  运营: '03',
  产品运营类: '03',
  product: '03',
  设计: '04',
  设计类: '04',
  design: '04',
  内容: '05',
  内容类: '05',
  content: '05',
  文创: '06',
  文创类: '06',
  市场: '07',
  营销: '07',
  市场营销类: '07',
  marketing: '07',
  运营保障: '08',
  运营保障类: '08',
  项目管理: '10',
  项目管理类: '10',
  pm: '10',
  游戏: '11',
  游戏类: '11',
  game: '11',
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
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function splitDescription(value) {
  const text = stripHtml(value);
  const match = text.match(/工作职责[:：]?([\s\S]*?)(?:工作要求|任职要求|职位要求)[:：]?([\s\S]*)/);
  if (!match) return { description: text, requirement: '' };
  return { description: match[1].trim(), requirement: match[2].trim() };
}

function resolveCategory(input) {
  if (!input) return '';
  const value = String(input).trim();
  return CATEGORY_ALIASES[normalizeAliasKey(value)] || CATEGORY_ALIASES[normalizeCompactKey(value)] || value;
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
    throw new CliError('BILIBILI_BAD_RESPONSE', `Bilibili returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('BILIBILI_HTTP', `Bilibili API request failed with HTTP ${response.status}`, payload.message || response.statusText);
  }
  if (payload.code !== 0) {
    throw new CliError('BILIBILI_API', `Bilibili API returned code ${payload.code}`, payload.message || 'The recruitment API rejected the request.');
  }
  return payload.data;
}

async function getCsrf() {
  const response = await fetch(`${BASE_URL}/api/auth/v1/csrf/token`, { headers: REQUEST_HEADERS });
  return readJsonResponse(response, '/api/auth/v1/csrf/token');
}

async function bilibiliFetch(endpoint, options = {}) {
  const csrf = await getCsrf();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...REQUEST_HEADERS, 'X-CSRF': csrf, ...(options.headers || {}) },
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/social/positions/${id}?isTrusted=true`;
}

export function normalizeJob(job) {
  const id = fieldText(job.id);
  const parts = splitDescription(job.positionDescription);
  const visible = {
    id,
    name: fieldText(job.positionName),
    url: jobUrl(id),
    category_code: fieldText(job.postCode),
    category_name: fieldText(job.postCodeName),
    nature_code: fieldText(job.positionTypeName),
    nature_name: fieldText(job.positionTypeName || '社招'),
    location_codes: fieldText(job.workLocation),
    location_names: fieldText(job.workLocation),
    experience_code: '',
    levels: '',
    department_code: '',
    department_name: '',
    updated_at: fieldText(job.pushTime).slice(0, 10),
    description: parts.description,
    requirement: parts.requirement,
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      hot_recruit: job.hotRecruit,
      recruit_type: job.recruitType,
    },
  });
  return output;
}

export async function fetchJobs(args, page, limit) {
  const category = resolveCategory(args.category);
  const data = await bilibiliFetch('/api/srs/position/positionList', {
    method: 'POST',
    body: JSON.stringify({
      pageSize: limit,
      pageNum: page,
      positionName: args.query || '',
      postCode: category,
      postCodeList: category,
      workLocationList: args.location || '',
      workTypeList: [3],
      positionTypeList: '3',
    }),
  });
  return {
    total: Number(data?.total || 0),
    pageNo: Number(data?.pageNum || page),
    pageSize: Number(data?.pageSize || limit),
    totalPage: Number(data?.pages || 0),
    list: Array.isArray(data?.list) ? data.list : [],
  };
}

export async function fetchJobById(id) {
  const data = await bilibiliFetch(`/api/srs/position/detail/${encodeURIComponent(id)}`);
  if (!data?.id) throw new EmptyResultError(`${SITE} detail`, `No Bilibili job found for id ${id}`);
  return data;
}

export async function fetchFilters() {
  const rows = [];
  const [cities, tree] = await Promise.all([
    bilibiliFetch('/api/srs/position/cityList?recruitType=0&positionTypeList=3&workTypeList=3&postCodeList='),
    bilibiliFetch('/api/campus/position/postCodeList?workTypeList=3&recruitType=0'),
  ]);
  for (const [index, name] of (Array.isArray(cities) ? cities : []).entries()) {
    rows.push({ group: 'location', parent: '', code: name, name, en_name: '', sort_id: index + 1 });
  }
  const walk = (items = [], parent = '') => {
    for (const item of items) {
      if (item.rankCode && item.rankName && item.rankCode !== '0') {
        rows.push({ group: 'category', parent, code: fieldText(item.rankCode), name: fieldText(item.rankName), en_name: '', sort_id: rows.length + 1 });
      }
      walk(item.sonRankBasics || [], fieldText(item.rankCode));
    }
  };
  walk(Array.isArray(tree) ? tree : []);
  rows.push({ group: 'nature', parent: '', code: '3', name: '全职', en_name: 'Full-time', sort_id: 1 });
  return rows.filter(row => row.code || row.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, stampStandardNature } from '../../core/natures.js';

export const SITE = 'bilibili-jobs';
export const DOMAIN = 'jobs.bilibili.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/social/positions?isTrusted=true`;
export const CAMPUS_URL = `${BASE_URL}/campus/positions?isTrusted=true`;

/**
 * Frontend nav (2026-08-02):
 * - 应届生招聘 → campus/positions?type=3
 * - 实习生招聘 → campus/positions?type=0
 */
export const NATURE_CHANNELS = {
  social: {
    channel: 'social',
    listPath: '/api/srs/position/positionList',
    detailPath: '/api/srs/position/detail',
    pagePath: 'social',
    recruitType: 0,
    workType: 3,
    queryType: '',
  },
  campus: {
    channel: 'campus',
    listPath: '/api/campus/position/positionList',
    detailPath: '/api/campus/position/detail',
    pagePath: 'campus',
    recruitType: 1,
    workType: 3,
    queryType: '3',
  },
  intern: {
    channel: 'campus',
    listPath: '/api/campus/position/positionList',
    detailPath: '/api/campus/position/detail',
    pagePath: 'campus',
    recruitType: 1,
    workType: 0,
    queryType: '0',
  },
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const BASE_REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  Origin: BASE_URL,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'X-AppKey': 'ops.ehr-api.auth',
  'X-UserType': '2',
};

function resolveChannel(nature = DEFAULT_NATURE) {
  return NATURE_CHANNELS[nature] || NATURE_CHANNELS[DEFAULT_NATURE];
}

function requestHeaders(nature = DEFAULT_NATURE) {
  const channel = resolveChannel(nature);
  return {
    ...BASE_REQUEST_HEADERS,
    Referer: `${BASE_URL}/${channel.pagePath}/positions?isTrusted=true`,
    'X-Channel': channel.channel,
  };
}

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

async function getCsrf(nature = DEFAULT_NATURE) {
  const response = await fetch(`${BASE_URL}/api/auth/v1/csrf/token`, { headers: requestHeaders(nature) });
  return readJsonResponse(response, '/api/auth/v1/csrf/token');
}

async function bilibiliFetch(endpoint, options = {}, nature = DEFAULT_NATURE) {
  const csrf = await getCsrf(nature);
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...requestHeaders(nature), 'X-CSRF': csrf, ...(options.headers || {}) },
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id, nature = DEFAULT_NATURE) {
  const channel = resolveChannel(nature);
  const typeQuery = channel.queryType ? `?type=${channel.queryType}&isTrusted=true` : '?isTrusted=true';
  return `${BASE_URL}/${channel.pagePath}/positions/${id}${typeQuery}`;
}

export function normalizeJob(job, nature = DEFAULT_NATURE) {
  const id = fieldText(job.id);
  const parts = splitDescription(job.positionDescription);
  const visible = {
    id,
    name: fieldText(job.positionName),
    url: jobUrl(id, nature),
    category_code: fieldText(job.postCode),
    category_name: fieldText(job.postCodeName),
    nature_code: nature,
    nature_name: nature,
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
      channel: resolveChannel(nature).channel,
    },
  });
  return stampStandardNature(output, nature, {
    code: fieldText(job.recruitType ?? job.positionTypeName),
    name: fieldText(job.positionTypeName),
  });
}

export async function fetchJobs(args, page, limit) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveChannel(nature);
  const category = resolveCategory(args.category);
  const workType = channel.workType ?? 3;
  const body = {
    pageSize: limit,
    pageNum: page,
    positionName: args.query || '',
    postCode: category,
    postCodeList: category,
    workLocationList: args.location || '',
    workTypeList: [workType],
    positionTypeList: String(workType),
  };
  if (channel.channel === 'campus') {
    body.recruitType = channel.recruitType;
  }
  const data = await bilibiliFetch(channel.listPath, {
    method: 'POST',
    body: JSON.stringify(body),
  }, nature);
  return {
    total: Number(data?.total || 0),
    pageNo: Number(data?.pageNum || page),
    pageSize: Number(data?.pageSize || limit),
    totalPage: Number(data?.pages || 0),
    list: Array.isArray(data?.list) ? data.list : [],
  };
}

export async function fetchJobById(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveChannel(nature);
  const data = await bilibiliFetch(`${channel.detailPath}/${encodeURIComponent(id)}`, {}, nature);
  if (!data?.id) throw new EmptyResultError(`${SITE} detail`, `No Bilibili job found for id ${id}`);
  return data;
}

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveChannel(nature);
  const workType = channel.workType ?? 3;
  const rows = [];
  const cityPath = channel.channel === 'social'
    ? `/api/srs/position/cityList?recruitType=${channel.recruitType}&positionTypeList=${workType}&workTypeList=${workType}&postCodeList=`
    : `/api/campus/position/cityList?recruitType=${channel.recruitType}&positionTypeList=${workType}&workTypeList=${workType}&postCodeList=`;
  const [cities, tree] = await Promise.all([
    bilibiliFetch(cityPath, {}, nature),
    bilibiliFetch(`/api/campus/position/postCodeList?workTypeList=${workType}&recruitType=${channel.recruitType}`, {}, nature),
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
  return rows.filter(row => row.code || row.name);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

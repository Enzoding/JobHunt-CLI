import { CliError, EmptyResultError } from '../../core/errors.js';

export const SITE = 'baidu-talent';
export const DOMAIN = 'talent.baidu.com';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/jobs/social-list?dev=0`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 10;

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
  'job_no',
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
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  Origin: BASE_URL,
  Referer: SOCIAL_URL,
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

const HTML_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  Referer: SOCIAL_URL,
  'User-Agent': REQUEST_HEADERS['User-Agent'],
};

const CATEGORY_ALIASES = {
  技术: '1',
  技术类: '1',
  engineering: '1',
  tech: '1',
  产品: '2',
  产品类: '2',
  product: '2',
  政企: '4',
  解决方案: '4',
  solution: '4',
  专业服务: '5',
  管理支持: '5',
  support: '5',
};

const CITY_ALIASES = {
  北京: '1100',
  北京市: '1100',
  beijing: '1100',
  上海: '3100',
  上海市: '3100',
  shanghai: '3100',
  深圳: '4403',
  深圳市: '4403',
  shenzhen: '4403',
  广州: '4401',
  广州市: '4401',
  guangzhou: '4401',
  成都: '5101',
  成都市: '5101',
  chengdu: '5101',
  全国: '9000',
  nationwide: '9000',
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
    throw new CliError('BAIDU_BAD_RESPONSE', `Baidu returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('BAIDU_HTTP', `Baidu API request failed with HTTP ${response.status}`, payload.message || response.statusText);
  }
  if (payload.status !== 'ok') {
    throw new CliError('BAIDU_API', `Baidu API returned status ${payload.status}`, payload.message || 'The recruitment API rejected the request.');
  }
  return payload.data;
}

async function baiduPost(endpoint, data = {}) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) body.set(key, value.join(','));
    else body.set(key, value ?? '');
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body,
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id) {
  return `${BASE_URL}/jobs/detail/SOCIAL/${id}?dev=0`;
}

async function baiduGetText(url, label) {
  const response = await fetch(url, { headers: HTML_HEADERS });
  const text = await response.text();
  if (!response.ok) {
    throw new CliError('BAIDU_HTTP', `Baidu page request failed with HTTP ${response.status}`, `${label}: ${text.slice(0, 160)}`);
  }
  return text;
}

function parseSsrDetail(html, id) {
  const match = html.match(/window\.__INITIAL_DATA__\s*=\s*([\s\S]*?);\s*window\.prefix/);
  if (!match) return null;

  let payload;
  try {
    payload = JSON.parse(match[1].replace(/:\s*undefined/g, ':null'));
  } catch (error) {
    throw new CliError('BAIDU_BAD_RESPONSE', 'Baidu detail page contained malformed SSR data', error.message);
  }

  const job = payload?.detailData?.postInfo;
  if (!job?.postId || String(job.postId) !== String(id)) return null;
  return job;
}

export function normalizeJob(job) {
  const id = fieldText(job.postId);
  const visible = {
    id,
    job_no: fieldText(job.jobId),
    name: fieldText(job.name),
    url: jobUrl(id),
    category_code: fieldText(job.postType),
    category_name: fieldText(job.postType),
    nature_code: 'SOCIAL',
    nature_name: '社招',
    location_codes: '',
    location_names: fieldText(job.workPlace),
    experience_code: fieldText(job.workYears),
    levels: fieldText(job.education),
    department_code: '',
    department_name: fieldText(job.orgName || job.bgShortName),
    updated_at: fieldText(job.updateDate || job.publishDate),
    description: fieldText(job.workContent).trim(),
    requirement: fieldText(job.serviceCondition).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      post_id: job.postId,
      job_id: job.jobId,
      recruit_num: job.recruitNum,
      bg_short_name: job.bgShortName,
      hot_flag: job.hotFlag,
    },
  });
  return output;
}

export async function fetchJobs(args, page, limit) {
  const data = await baiduPost('/httservice/getPostListNew', {
    recruitType: 'SOCIAL',
    pageSize: limit,
    keyWord: args.query || '',
    curPage: page,
    projectType: '',
    workPlace: resolveCity(args.location),
    postType: resolveCategory(args.category),
  });
  return {
    total: Number(data?.total || 0),
    list: Array.isArray(data?.list) ? data.list : [],
  };
}

export async function fetchJobById(id) {
  const detailHtml = await baiduGetText(jobUrl(id), `detail ${id}`);
  const ssrJob = parseSsrDetail(detailHtml, id);
  if (ssrJob) return ssrJob;

  for (let page = 1; page <= 20; page++) {
    const result = await fetchJobs({ query: '' }, page, MAX_PAGE_SIZE);
    const match = result.list.find(job => String(job.postId) === String(id) || String(job.jobId) === String(id));
    if (match) return match;
    if (!result.list.length || page * MAX_PAGE_SIZE >= result.total) break;
  }
  const searched = await fetchJobs({ query: id }, 1, MAX_PAGE_SIZE);
  const match = searched.list.find(job => String(job.postId) === String(id) || String(job.jobId) === String(id)) || searched.list[0];
  if (match) return match;
  throw new EmptyResultError(`${SITE} detail`, `No Baidu job found for id ${id}`);
}

export async function fetchFilters() {
  const rows = [];
  const add = (group, items) => {
    for (const [index, item] of items.entries()) {
      rows.push({
        group,
        parent: '',
        code: item.value,
        name: item.label,
        en_name: '',
        sort_id: index + 1,
      });
    }
  };
  add('category', [
    { value: '1', label: '技术' },
    { value: '2', label: '产品' },
    { value: '4', label: '政企行业解决方案和服务' },
    { value: '5', label: '专业服务和管理支持' },
  ]);
  add('location', [
    { value: '1100', label: '北京市' },
    { value: '3100', label: '上海市' },
    { value: '4403', label: '深圳市' },
    { value: '4401', label: '广州市' },
    { value: '5101', label: '成都市' },
    { value: '2102', label: '大连市' },
    { value: '4201', label: '武汉市' },
    { value: '3301', label: '杭州市' },
    { value: '9000', label: '全国' },
  ]);
  rows.push({ group: 'nature', parent: '', code: 'SOCIAL', name: '社招', en_name: 'Social', sort_id: 1 });
  return rows;
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

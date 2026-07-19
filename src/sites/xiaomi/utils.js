import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, natureDisplayName, stampStandardNature } from '../../core/natures.js';

export const SITE = 'xiaomi-jobs';
export const DOMAIN = 'xiaomi.jobs.f.mioffice.cn';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = `${BASE_URL}/index`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** Channel map verified via Chrome DevTools on 2026-07-19. Differentiator is website-path, not portal_type. */
export const NATURE_CHANNELS = {
  social: {
    websitePath: 'index',
    pagePath: 'index',
    referer: `${BASE_URL}/index`,
    portalType: 6,
  },
  campus: {
    websitePath: 'campus',
    pagePath: 'campus',
    referer: `${BASE_URL}/campus/`,
    portalType: 6,
  },
  intern: {
    websitePath: 'internship',
    pagePath: 'internship',
    referer: `${BASE_URL}/internship/`,
    portalType: 6,
  },
};

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

const BASE_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'portal-channel': 'saas-career',
  'portal-platform': 'pc',
};

export function resolveNatureChannel(nature = DEFAULT_NATURE) {
  const channel = NATURE_CHANNELS[nature] || NATURE_CHANNELS[DEFAULT_NATURE];
  if (!channel) {
    throw new CliError('XIAOMI_NATURE', `Unsupported Xiaomi nature channel: ${nature}`);
  }
  return channel;
}

function channelHeaders(nature) {
  const channel = resolveNatureChannel(nature);
  return {
    ...BASE_HEADERS,
    Referer: channel.referer,
    'website-path': channel.websitePath,
  };
}

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
  武汉: 'CT_154',
  wuhan: 'CT_154',
  南京: 'CT_107',
  nanjing: 'CT_107',
  西安: 'CT_155',
  xian: 'CT_155',
  成都: 'CT_22',
  chengdu: 'CT_22',
  苏州: 'CT_199',
  suzhou: 'CT_199',
  大连: 'CT_25',
  dalian: 'CT_25',
  济南: 'CT_66',
  jinan: 'CT_66',
  无锡: 'CT_151',
  wuxi: 'CT_151',
  沈阳: 'CT_129',
  shenyang: 'CT_129',
  重庆: 'CT_190',
  chongqing: 'CT_190',
  长沙: 'CT_20',
  changsha: 'CT_20',
  青岛: 'CT_119',
  qingdao: 'CT_119',
  哈尔滨: 'CT_48',
  harbin: 'CT_48',
  合肥: 'CT_55',
  hefei: 'CT_55',
  福州: 'CT_40',
  fuzhou: 'CT_40',
  宁波: 'CT_112',
  ningbo: 'CT_112',
  慕尼黑: 'CT_226',
  munich: 'CT_226',
  新加坡: 'CT_163',
  singapore: 'CT_163',
  马德里: 'CT_96',
  madrid: 'CT_96',
  东京: 'CT_34',
  tokyo: 'CT_34',
  曼谷: 'CT_98',
  bangkok: 'CT_98',
  迪拜: 'CT_33',
  dubai: 'CT_33',
};

function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_-]+/g, '');
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

export function coerceOffset(value) {
  const offset = Number(value || 0);
  if (!Number.isFinite(offset) || offset < 0) return 0;
  return Math.floor(offset);
}

async function readJsonResponse(response, endpoint) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError(
      'XIAOMI_BAD_RESPONSE',
      `Xiaomi returned non-JSON data for ${endpoint}`,
      `HTTP ${response.status}: ${text.slice(0, 160)}`,
    );
  }
  if (!response.ok) {
    throw new CliError(
      'XIAOMI_HTTP',
      `Xiaomi API request failed with HTTP ${response.status}`,
      payload.message || response.statusText,
    );
  }
  if (payload.code !== 0) {
    throw new CliError(
      'XIAOMI_API',
      `Xiaomi API returned code ${payload.code}`,
      payload.message || 'The recruitment API rejected the request.',
    );
  }
  return payload.data;
}

async function xiaomiGet(endpoint, nature = DEFAULT_NATURE) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, { headers: channelHeaders(nature) });
  return readJsonResponse(response, endpoint);
}

async function xiaomiPost(endpoint, body = {}, nature = DEFAULT_NATURE) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { ...channelHeaders(nature), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

export function jobUrl(id, nature = DEFAULT_NATURE) {
  const channel = resolveNatureChannel(nature);
  return `${BASE_URL}/${channel.pagePath}/position/${id}/detail`;
}

function fieldText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  if (value === undefined || value === null) return '';
  return String(value);
}

function resolveJobNature(job, channelNature = DEFAULT_NATURE) {
  const recruitType = job.recruit_type || job.recruitment_type || {};
  const parentType = recruitType.parent || {};
  const childName = fieldText(recruitType.name);
  const parentName = fieldText(parentType.name);
  const sourceCode = fieldText(recruitType.id || parentType.id);
  const sourceName = `${parentName}${parentName && childName ? '-' : ''}${childName}`.replace(/^-/, '');
  const blob = `${parentName} ${childName}`.toLowerCase();

  let nature = channelNature;
  if (/实习|intern/.test(blob)) nature = 'intern';
  else if (/校招|campus|graduate|应届/.test(blob)) nature = 'campus';
  else if (/社招|social|experienced|全职/.test(blob) && channelNature === 'social') nature = 'social';
  else if (/社招|social|experienced/.test(blob)) nature = 'social';

  return { nature, sourceCode, sourceName };
}

export function normalizeJob(job, channelNature = DEFAULT_NATURE) {
  const cities = Array.isArray(job.city_list)
    ? job.city_list.map(c => c.name).filter(Boolean)
    : [];
  const { nature, sourceCode, sourceName } = resolveJobNature(job, channelNature);
  const updatedAt = job.publish_time
    ? new Date(job.publish_time).toISOString().slice(0, 10)
    : '';
  const visible = {
    id: fieldText(job.id),
    name: fieldText(job.title),
    url: jobUrl(fieldText(job.id), nature),
    category_code: fieldText(job.job_function?.id || job.job_category?.id),
    category_name: fieldText(job.job_category?.name || job.job_function?.name),
    nature_code: nature,
    nature_name: natureDisplayName(nature),
    location_codes: Array.isArray(job.city_list) ? job.city_list.map(c => c.code).filter(Boolean).join(',') : '',
    location_names: cities.join(','),
    experience_code: '',
    levels: '',
    department_code: '',
    department_name: '',
    updated_at: updatedAt,
    description: fieldText(job.description).trim(),
    requirement: fieldText(job.requirement).trim(),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      code: job.code,
      title: job.title,
      recruit_type: sourceCode,
      city_list: job.city_list,
      publish_time: job.publish_time,
      source_nature_code: sourceCode,
      source_nature_name: sourceName,
      website_path: resolveNatureChannel(channelNature).websitePath,
    },
  });
  return stampStandardNature(output, nature, { code: sourceCode, name: sourceName });
}

export function buildSearchBody(args, offset, limit) {
  const cityCode = resolveCity(args.location);
  const channel = resolveNatureChannel(args.nature || DEFAULT_NATURE);
  return {
    keyword: args.query || '',
    limit,
    offset,
    job_category_id_list: [],
    tag_id_list: [],
    location_code_list: cityCode ? [cityCode] : [],
    subject_id_list: [],
    recruitment_id_list: [],
    portal_type: channel.portalType,
    job_function_id_list: [],
    storefront_id_list: [],
    portal_entrance: 1,
  };
}

export async function fetchJobs(args, offset, limit) {
  const nature = args.nature || DEFAULT_NATURE;
  const body = buildSearchBody(args, offset, limit);
  const data = await xiaomiPost('/api/v1/search/job/posts', body, nature);
  return {
    total: Number(data?.job_post_list?.length || 0),
    offset,
    limit,
    list: Array.isArray(data?.job_post_list) ? data.job_post_list : [],
  };
}

export async function fetchJobDetail(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  const data = await xiaomiGet(
    `/api/v1/job/posts/${id}?portal_type=${channel.portalType}&with_recommend=false`,
    nature,
  );
  if (!data || !data.job_post_detail) {
    throw new EmptyResultError(`${SITE} detail`, `No Xiaomi job found for id ${id}`);
  }
  return data.job_post_detail;
}

export async function fetchFilters(args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const channel = resolveNatureChannel(nature);
  const data = await xiaomiGet(`/api/v1/config/job/filters/${channel.portalType}`, nature);
  const cityRows = Array.isArray(data?.city_list)
    ? data.city_list.map(c => ({
        group: 'city',
        parent: '',
        code: c.code,
        name: c.name,
        en_name: c.en_name || '',
        sort_id: c.mdm_code || '',
      }))
    : [];

  const functionRows = Array.isArray(data?.job_function_list)
    ? data.job_function_list.map((item, index) => ({
        group: 'category',
        parent: '',
        code: fieldText(item.id),
        name: fieldText(item.name),
        en_name: fieldText(item.en_name),
        sort_id: String(index + 1),
      }))
    : [];

  return [...cityRows, ...functionRows];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

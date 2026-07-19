import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, stampStandardNature } from '../../core/natures.js';
import {
  coerceLimit,
  coercePage,
  fieldText,
  matchesAlias,
  normalizeCompactKey,
  pickFirst,
  stripHtml,
  toDateText,
} from '../shared.js';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 10;
export const DEFAULT_CHANNEL = 'group_official_site';
/** Verified via Chrome DevTools on Alibaba CPO campus pages (2026-07-19). Prefer this over HTML brand-specific campus map values. */
export const DEFAULT_CAMPUS_CHANNEL = 'campus_group_official_site';
export const DEFAULT_SUPPORTED_NATURES = ['social', 'campus', 'intern'];

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
  'code',
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

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';
const sessionCache = new Map();

function cpoSite({ id, opencliSite, name, description, baseUrl, listUrl, channel = DEFAULT_CHANNEL }) {
  return {
    id,
    opencliSite,
    name,
    description,
    baseUrl,
    listUrl,
    campusListUrl: `${baseUrl}/campus/position-list?lang=zh`,
    channel,
    campusChannel: DEFAULT_CAMPUS_CHANNEL,
    supportedNatures: DEFAULT_SUPPORTED_NATURES,
    defaultNature: DEFAULT_NATURE,
  };
}

export const ALIBABA_CPO_SITE_CONFIGS = [
  cpoSite({
    id: 'taotian',
    opencliSite: 'taotian-jobs',
    name: 'Taotian Group',
    description: 'Taotian Group recruitment (social/campus/intern)',
    baseUrl: 'https://talent.taotian.com',
    listUrl: 'https://talent.taotian.com/off-campus/position-list?lang=zh&search=',
  }),
  cpoSite({
    id: 'taobao-shangou',
    opencliSite: 'taobao-shangou-jobs',
    name: 'Taobao Shangou',
    description: 'Taobao Shangou recruitment (social/campus/intern)',
    baseUrl: 'https://talent.ele.me',
    listUrl: 'https://talent.ele.me/off-campus/position-list?lang=zh',
  }),
  cpoSite({
    id: 'fliggy',
    opencliSite: 'fliggy-jobs',
    name: 'Fliggy',
    description: 'Fliggy recruitment (social/campus/intern)',
    baseUrl: 'https://career.fliggy.com',
    listUrl: 'https://career.fliggy.com/off-campus/position-list',
  }),
  cpoSite({
    id: 'alibaba-intl',
    opencliSite: 'alibaba-intl-jobs',
    name: 'Alibaba International',
    description: 'Alibaba International Digital Commerce recruitment (social/campus/intern)',
    baseUrl: 'https://aidc-jobs.alibaba.com',
    listUrl: 'https://aidc-jobs.alibaba.com/off-campus/position-list?lang=zh',
  }),
  cpoSite({
    id: 'aliyun',
    opencliSite: 'aliyun-jobs',
    name: 'Alibaba Cloud',
    description: 'Alibaba Cloud recruitment (social/campus/intern)',
    baseUrl: 'https://careers.aliyun.com',
    listUrl: 'https://careers.aliyun.com/off-campus/position-list?lang=zh',
  }),
  cpoSite({
    id: 'tongyi',
    opencliSite: 'tongyi-jobs',
    name: 'Tongyi Lab',
    description: 'Tongyi Lab recruitment (social/campus/intern)',
    baseUrl: 'https://careers-tongyi.alibaba.com',
    listUrl: 'https://careers-tongyi.alibaba.com/off-campus/position-list?lang=zh&search=',
  }),
  cpoSite({
    id: 'dingtalk',
    opencliSite: 'dingtalk-jobs',
    name: 'DingTalk',
    description: 'DingTalk recruitment (social/campus/intern)',
    baseUrl: 'https://talent.dingtalk.com',
    listUrl: 'https://talent.dingtalk.com/off-campus/position-list?lang=zh&search=',
  }),
  cpoSite({
    id: 'quark',
    opencliSite: 'quark-jobs',
    name: 'Qianwen Consumer Group',
    description: 'Qianwen consumer group recruitment (social/campus/intern)',
    baseUrl: 'https://talent.quark.cn',
    listUrl: 'https://talent.quark.cn/off-campus/position-list?lang=zh',
  }),
  cpoSite({
    id: 'thead',
    opencliSite: 'thead-jobs',
    name: 'T-Head',
    description: 'T-Head recruitment (social/campus/intern)',
    baseUrl: 'https://recruitment.t-head.cn',
    listUrl: 'https://recruitment.t-head.cn/off-campus/position-list?lang=zh',
  }),
  cpoSite({
    id: 'amap',
    opencliSite: 'amap-jobs',
    name: 'Amap',
    description: 'Amap recruitment (social/campus/intern)',
    baseUrl: 'https://talent.amap.com',
    listUrl: 'https://talent.amap.com/off-campus/position-list?lang=zh',
  }),
  cpoSite({
    id: 'cainiao',
    opencliSite: 'cainiao-jobs',
    name: 'Cainiao',
    description: 'Cainiao recruitment (social/campus/intern)',
    baseUrl: 'https://talent.cainiao.com',
    listUrl: 'https://talent.cainiao.com/social-recruitment',
  }),
  cpoSite({
    id: 'hujing',
    opencliSite: 'hujing-jobs',
    name: 'Hujing Entertainment',
    description: 'Hujing entertainment recruitment (social/campus/intern)',
    baseUrl: 'https://jobs.hujing-dme.com',
    listUrl: 'https://jobs.hujing-dme.com/off-campus/position-list?lang=zh',
  }),
  cpoSite({
    id: 'freshippo',
    opencliSite: 'freshippo-jobs',
    name: 'Freshippo',
    description: 'Freshippo recruitment (social/campus/intern)',
    baseUrl: 'https://hire.freshippo.com',
    listUrl: 'https://hire.freshippo.com/off-campus/position-list?lang=zh&search=',
  }),
  cpoSite({
    id: 'alihealth',
    opencliSite: 'alihealth-jobs',
    name: 'AliHealth',
    description: 'AliHealth recruitment (social/campus/intern)',
    baseUrl: 'https://careers.alihealth.cn',
    listUrl: 'https://careers.alihealth.cn/off-campus/position-list?lang=zh&search=',
  }),
  cpoSite({
    id: 'lingxi',
    opencliSite: 'lingxi-jobs',
    name: 'Lingxi Games',
    description: 'Lingxi Games recruitment (social/campus/intern)',
    baseUrl: 'https://talent.lingxigames.com',
    listUrl: 'https://talent.lingxigames.com/off-campus/position-list?lang=zh',
  }),
];

export function resolveNatureChannel(config, nature = DEFAULT_NATURE) {
  if (nature === 'campus') {
    return {
      nature: 'campus',
      channel: config.campusChannel || DEFAULT_CAMPUS_CHANNEL,
      categoryType: 'freshman',
      listUrl: config.campusListUrl || `${config.baseUrl}/campus/position-list?lang=zh`,
      positionType: 'campus',
      detailPath: '/campus/position-detail',
    };
  }
  if (nature === 'intern') {
    return {
      nature: 'intern',
      channel: config.campusChannel || DEFAULT_CAMPUS_CHANNEL,
      categoryType: 'internship',
      listUrl: config.campusListUrl || `${config.baseUrl}/campus/position-list?lang=zh`,
      positionType: 'internship',
      detailPath: '/campus/position-detail',
    };
  }
  return {
    nature: DEFAULT_NATURE,
    channel: config.channel || DEFAULT_CHANNEL,
    categoryType: '',
    listUrl: config.listUrl,
    positionType: 'social',
    detailPath: '/off-campus/position-detail',
  };
}

function getSetCookies(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  const value = headers.get('set-cookie');
  return value ? [value] : [];
}

function cookieHeader(setCookies = []) {
  return setCookies
    .map(cookie => cookie.split(';')[0])
    .filter(Boolean)
    .join('; ');
}

function extractFirst(text, regex) {
  return regex.exec(text)?.[1] || '';
}

function extractChannel(html) {
  return extractFirst(html, /channelCodeMap:\s*\{[\s\S]*?offCampus:\s*"([^"]+)"/);
}

async function loadSession(config, nature = DEFAULT_NATURE, { refresh = false } = {}) {
  const route = resolveNatureChannel(config, nature);
  const cacheKey = `${config.id}:${route.nature}`;
  const cached = sessionCache.get(cacheKey);
  if (cached && !refresh) return cached;

  const response = await fetch(route.listUrl, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': USER_AGENT,
    },
    redirect: 'follow',
  });
  const html = await response.text();
  if (!response.ok) {
    throw new CliError('ALIBABA_CPO_PAGE_HTTP', `${config.name} recruitment page failed with HTTP ${response.status}`, response.statusText);
  }
  const token = extractFirst(html, /__token__\s*:\s*"([^"]+)"/);
  if (!token) {
    throw new CliError('ALIBABA_CPO_TOKEN', `${config.name} recruitment page did not expose a CSRF token`, 'The Alibaba CPO page structure may have changed.');
  }
  const session = {
    baseUrl: config.baseUrl || new URL(response.url || route.listUrl).origin,
    token,
    channel: route.channel,
    categoryType: route.categoryType,
    listUrl: response.url || route.listUrl,
    nature: route.nature,
    positionType: route.positionType,
    detailPath: route.detailPath,
    pageChannel: extractChannel(html),
    cookie: cookieHeader(getSetCookies(response.headers)),
  };
  if (!session.channel) {
    throw new CliError('ALIBABA_CPO_CHANNEL', `${config.name} recruitment page did not expose a channel`, 'The Alibaba CPO page structure may have changed.');
  }
  sessionCache.set(cacheKey, session);
  return session;
}

async function readJsonResponse(response, config, path) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError('ALIBABA_CPO_BAD_RESPONSE', `${config.name} returned non-JSON data for ${path}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('ALIBABA_CPO_HTTP', `${config.name} API request failed with HTTP ${response.status}`, payload.errorMsg || response.statusText);
  }
  if (payload.success === false) {
    throw new CliError('ALIBABA_CPO_API', `${config.name} API rejected the request`, payload.errorMsg || payload.errorCode || 'The recruitment API rejected the request.');
  }
  return payload.content ?? payload.data ?? payload.result ?? payload;
}

async function cpoPost(config, path, body = {}, options = {}) {
  const nature = options.nature || DEFAULT_NATURE;
  const session = await loadSession(config, nature, options);
  const url = new URL(path, session.baseUrl);
  url.searchParams.set('_csrf', session.token);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Origin: session.baseUrl,
      Referer: session.listUrl,
      'User-Agent': USER_AGENT,
      'X-XSRF-TOKEN': session.token,
      ...(session.cookie ? { Cookie: session.cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, config, path);
}

function walkCategories(items = [], rows, parent = '') {
  for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
    const code = fieldText(item.code ?? item.id);
    const name = fieldText(item.name);
    if (code || name) {
      rows.push({
        group: 'category',
        parent,
        code,
        name,
        en_name: fieldText(item.enName ?? item.en_name),
        sort_id: Number(item.sortId ?? item.sort ?? index + 1),
      });
    }
    walkCategories(item.categories || item.children || item.childList || [], rows, code);
  }
}

function normalizeLocationRows(locations = []) {
  const rows = [];
  for (const [index, item] of (Array.isArray(locations) ? locations : []).entries()) {
    rows.push({
      group: 'location',
      parent: fieldText(item.parentCode),
      code: fieldText(item.code ?? item.id),
      name: fieldText(item.name),
      en_name: fieldText(item.enName ?? item.en_name),
      sort_id: Number(item.sortId ?? item.sort ?? index + 1),
    });
  }
  return rows;
}

function normalizeFilters(categories, locations) {
  const rows = [];
  walkCategories(categories, rows);
  rows.push(...normalizeLocationRows(locations));
  return rows.filter(row => row.code || row.name);
}

async function resolveArgs(config, args = {}) {
  if (!args.category && !args.location) return { category: '', subCategory: '', region: '' };
  const filters = await fetchFilters(config, args);
  const resolveOne = (group, input) => {
    if (!input) return '';
    const text = String(input).trim();
    const match = filters.find(row => row.group === group && matchesAlias(input, [row.code, row.name, row.en_name]));
    if (match) return match.code;
    if (group === 'category') {
      const compactInput = normalizeCompactKey(text).replace(/类$/, '');
      const fuzzyMatch = filters.find(row => (
        row.group === 'category'
        && [row.name, row.en_name].some(value => normalizeCompactKey(value).replace(/类$/, '') === compactInput)
      ));
      if (fuzzyMatch) return fuzzyMatch.code;
    }
    return text;
  };
  const category = resolveOne('category', args.category);
  const categoryRow = filters.find(row => row.group === 'category' && row.code === category);
  const childCategories = categoryRow?.parent
    ? []
    : filters.filter(row => row.group === 'category' && row.parent === category).map(row => row.code).filter(Boolean);
  return {
    category: categoryRow?.parent || childCategories.length ? '' : category,
    subCategory: categoryRow?.parent ? category : childCategories.join(','),
    region: resolveOne('location', args.location),
  };
}

function baseSearchRequest(session, args, page, limit, resolved) {
  const body = {
    channel: session.channel,
    language: 'zh',
    batchId: '',
    categories: resolved.category || '',
    deptCodes: [],
    key: args.query || '',
    pageIndex: page,
    pageSize: limit,
    regions: resolved.region || '',
    subCategories: resolved.subCategory || '',
    shareType: '',
    shareId: '',
    myReferralShareCode: '',
  };
  if (session.categoryType) body.categoryType = session.categoryType;
  return body;
}

function listPayload(data, page, limit) {
  const list = data?.datas || data?.tableData || data?.list || data?.items || [];
  const total = Number(data?.totalCount ?? data?.paging?.totalCount ?? data?.total ?? list.length);
  const pageSize = Number(data?.pageSize ?? data?.paging?.pageSize ?? limit);
  const currentPage = Number(data?.currentPage ?? data?.paging?.currentPage ?? page);
  return {
    total,
    totalPage: Math.ceil(total / (pageSize || limit)) || 0,
    pageNo: currentPage,
    pageSize,
    list: Array.isArray(list) ? list.slice(0, limit) : [],
  };
}

export function jobUrl(config, id, nature = DEFAULT_NATURE) {
  const route = resolveNatureChannel(config, nature);
  return `${config.baseUrl}${route.detailPath}?positionId=${encodeURIComponent(id)}&positionType=${encodeURIComponent(route.positionType)}`;
}

function experienceText(experience) {
  if (!experience) return '';
  if (typeof experience === 'string') return experience;
  const from = experience.from ?? '';
  const to = experience.to ?? '';
  if (from && to) return `${from}-${to}`;
  if (from) return `${from}+`;
  if (to) return `0-${to}`;
  return '';
}

export function normalizeJob(config, job, nature = DEFAULT_NATURE) {
  const id = fieldText(job.id ?? job.positionId);
  const categories = job.categories || job.categoryNames || [];
  const locations = job.workLocations || job.locations || job.locationNames || [];
  const sourceNatureCode = fieldText(job.categoryType || job.positionType || nature);
  const sourceNatureName = fieldText(job.categoryTypeName || job.positionTypeName || sourceNatureCode);
  const visible = {
    id,
    code: fieldText(job.code ?? job.positionCode),
    job_no: fieldText(job.jobNo ?? job.code ?? job.positionCode),
    name: stripHtml(job.name ?? job.title),
    url: fieldText(job.positionUrl).startsWith('http') ? fieldText(job.positionUrl) : jobUrl(config, id, nature),
    category_code: fieldText(job.categoryCode ?? job.subCategoryCode),
    category_name: fieldText(categories.length ? categories : pickFirst(job.categoryName, job.category)),
    nature_code: nature,
    nature_name: nature,
    location_codes: fieldText(job.regionCodes ?? job.locationIds),
    location_names: fieldText(locations.length ? locations : pickFirst(job.workLocation, job.locationName)),
    experience_code: experienceText(job.experience),
    levels: fieldText(job.levels),
    department_code: fieldText(job.departmentCode ?? job.bgCode ?? job.deptCode),
    department_name: fieldText(job.department ?? job.departmentName ?? job.bgName),
    updated_at: toDateText(job.modifyTime ?? job.gmtModified ?? job.publishTime ?? job.updateTime),
    description: stripHtml(job.description ?? job.jobDescription),
    requirement: stripHtml(job.requirement ?? job.qualification),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      code: job.code,
      publish_time: job.publishTime,
      position_url: job.positionUrl,
      category_type: job.categoryType,
    },
  });
  return stampStandardNature(output, nature, {
    code: sourceNatureCode,
    name: sourceNatureName,
  });
}

export async function fetchJobs(config, args = {}, page = 1, limit = DEFAULT_PAGE_SIZE) {
  const nature = args.nature || DEFAULT_NATURE;
  const [session, resolved] = await Promise.all([
    loadSession(config, nature),
    resolveArgs(config, args),
  ]);
  const data = await cpoPost(
    config,
    '/position/search',
    baseSearchRequest(session, args, page, limit, resolved),
    { nature },
  );
  return listPayload(data, page, limit);
}

export async function fetchJobById(config, id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const session = await loadSession(config, nature);
  const job = await cpoPost(config, '/position/detail', {
    id: Number(id) || id,
    channel: session.channel,
    language: 'zh',
  }, { nature });
  if (job?.id || job?.positionId) return job;

  const fallback = await fetchJobs(config, { ...args, query: String(id), nature }, 1, MAX_PAGE_SIZE);
  const match = fallback.list.find(item => fieldText(item.id ?? item.positionId) === String(id));
  if (match) return match;
  throw new EmptyResultError(`${config.id} detail`, `No ${config.name} job found for id ${id}`);
}

export async function fetchFilters(config, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const session = await loadSession(config, nature);
  const [categories, locations] = await Promise.all([
    cpoPost(config, '/category/list', { channel: session.channel, language: 'zh' }, { nature }),
    cpoPost(config, '/region/hot', { channel: session.channel, language: 'zh' }, { nature }),
  ]);
  return normalizeFilters(categories, locations);
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

export { coerceLimit, coercePage };

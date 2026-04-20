import { CliError, EmptyResultError } from '../../core/errors.js';
import {
  coerceLimit,
  coercePage,
  fieldText,
  matchesAlias,
  pickFirst,
  stripHtml,
  toDateText,
} from '../shared.js';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const SIGNER_CHUNK_URLS = [
  'https://lf-package-cn.feishucdn.com/obj/atsx-throne/hire-fe-prod/portal/saas-career/static/js/9341.e56ad4c3.js',
  'https://lf-package-cn.feishucdn.com/obj/eden-cn/lmeh7plpjhoh/campus-fe-public/atsx-fe-web-portal/packages/atsx-fe-saas-web-portal/assets/9341.e56ad4c3.js',
];
const SIGNER_MODULE_ID = '57195';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';

let signerPromise;
const webIdCache = new Map();

function extractModuleFunction(source, moduleId) {
  const marker = `${moduleId}:function`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    throw new CliError('FEISHU_SIGNER_MODULE', `Could not find Feishu signer module ${moduleId}`, 'The Feishu recruitment portal bundle may have changed.');
  }
  const start = source.indexOf('function', markerIndex);
  if (start < 0) throw new CliError('FEISHU_SIGNER_MODULE', 'Could not locate Feishu signer function body');

  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new CliError('FEISHU_SIGNER_MODULE', 'Could not parse Feishu signer function body');
}

async function getSigner() {
  if (!signerPromise) {
    signerPromise = (async () => {
      let source = '';
      let lastError = '';
      for (const url of SIGNER_CHUNK_URLS) {
        const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        source = await response.text();
        if (response.ok) break;
        lastError = `HTTP ${response.status}: ${source.slice(0, 160)}`;
        source = '';
      }
      if (!source) {
        throw new CliError('FEISHU_SIGNER_FETCH', 'Failed to download Feishu signer bundle', lastError);
      }
      const fnSource = extractModuleFunction(source, SIGNER_MODULE_ID);
      const moduleFn = Function(`return (${fnSource});`)();
      const module = { exports: {} };
      moduleFn(module, module.exports);
      if (typeof module.exports.sign !== 'function') {
        throw new CliError('FEISHU_SIGNER_EXPORT', 'Feishu signer module did not export sign()', 'The Feishu recruitment portal bundle may have changed.');
      }
      return module.exports.sign;
    })();
  }
  return signerPromise;
}

async function fetchWebId(baseUrl) {
  if (!webIdCache.has(baseUrl)) {
    webIdCache.set(baseUrl, (async () => {
      const response = await fetch('https://mcs.snssdk.com/v1/user/webid', {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          Origin: baseUrl,
          Referer: baseUrl,
          'User-Agent': USER_AGENT,
        },
        body: JSON.stringify({
          app_id: 1943,
          url: `${baseUrl}/index`,
          user_agent: USER_AGENT,
          referer: '',
          user_unique_id: '',
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.web_id) {
        throw new CliError('FEISHU_WEB_ID', `Failed to initialize Feishu web id for ${baseUrl}`, payload.message || response.statusText);
      }
      return payload.web_id;
    })());
  }
  return webIdCache.get(baseUrl);
}

async function readJsonResponse(response, endpoint, siteName) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError('FEISHU_BAD_RESPONSE', `${siteName} returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('FEISHU_HTTP', `${siteName} API request failed with HTTP ${response.status}`, payload.message || response.statusText);
  }
  if (Number(payload.code || 0) !== 0) {
    throw new CliError('FEISHU_API', `${siteName} API returned code ${payload.code}`, payload.message || 'The recruitment API rejected the request.');
  }
  return payload.data;
}

async function feishuFetch(config, endpoint, { method = 'GET', body } = {}) {
  const baseUrl = `https://${config.domain}`;
  const url = new URL(endpoint, baseUrl);
  const signer = await getSigner();
  const path = `${url.pathname}${url.search}`;
  url.searchParams.set('_signature', signer({ body, url: path }));
  const webId = await fetchWebId(baseUrl);
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN',
      'Content-Type': 'application/json',
      Cookie: `locale=zh-CN; channel=saas-career; platform=pc; s_v_web_id=${webId}; device-id=${webId}`,
      Env: 'undefined',
      Origin: baseUrl,
      Referer: `${baseUrl}/index`,
      'User-Agent': USER_AGENT,
      'X-Csrf-Token': 'undefined',
      'portal-channel': 'saas-career',
      'portal-platform': 'pc',
      'website-path': 'index',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return readJsonResponse(response, url.pathname, config.name);
}

function searchBody(args, page, limit, resolved = {}) {
  return {
    keyword: args.query || '',
    limit,
    offset: (page - 1) * limit,
    job_category_id_list: resolved.category ? [resolved.category] : [],
    tag_id_list: [],
    location_code_list: resolved.location ? [resolved.location] : [],
    subject_id_list: [],
    recruitment_id_list: resolved.nature ? [resolved.nature] : [],
    portal_type: 6,
    job_function_id_list: resolved.function ? [resolved.function] : [],
    storefront_id_list: [],
    portal_entrance: 1,
  };
}

function searchEndpoint(body) {
  const params = new URLSearchParams({
    keyword: body.keyword,
    limit: String(body.limit),
    offset: String(body.offset),
    job_category_id_list: body.job_category_id_list.join(','),
    tag_id_list: '',
    location_code_list: body.location_code_list.join(','),
    subject_id_list: '',
    recruitment_id_list: body.recruitment_id_list.join(','),
    portal_type: '6',
    job_function_id_list: body.job_function_id_list.join(','),
    storefront_id_list: '',
    portal_entrance: '1',
  });
  return `/api/v1/search/job/posts?${params}`;
}

function filterCandidates(row) {
  return [
    row.code,
    row.name,
    row.en_name,
    row.i18n_name,
    row.value,
  ];
}

function toFilterRows(data) {
  const rows = [];
  const pushItems = (group, items = [], codeKey = 'id', parent = '') => {
    for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
      const code = fieldText(item[codeKey] ?? item.id ?? item.code);
      const name = fieldText(item.name ?? item.label ?? item.zh_name);
      if (code || name) {
        const row = {
          group,
          parent,
          code,
          name,
          en_name: fieldText(item.en_name ?? item.enName),
          sort_id: Number(item.sort_id ?? item.sort ?? index + 1),
        };
        if (item.source) Object.defineProperty(row, 'source', { value: item.source, enumerable: false });
        rows.push(row);
      }
      pushItems(group, item.children || item.child_list || [], codeKey, code);
    }
  };
  const jobTypes = data?.job_type_list || data?.job_category_list || [];
  const jobFunctions = data?.job_function_list || [];
  pushItems('category', jobTypes);
  if (!Array.isArray(jobTypes) || !jobTypes.length) {
    pushItems('category', (Array.isArray(jobFunctions) ? jobFunctions : []).map(item => ({ ...item, source: 'function' })));
  }
  pushItems('location', data?.city_list || data?.location_list || [], 'code');
  pushItems('nature', data?.recruitment_type_list || data?.recruit_type_list || data?.job_recruit_type_list || []);
  pushItems('function', jobFunctions);
  return rows.filter(row => row.code || row.name);
}

async function resolveFilters(config, args) {
  const filters = await fetchFilters(config);
  const resolveOne = (group, input) => {
    if (!input) return '';
    const match = filters.find(row => row.group === group && matchesAlias(input, filterCandidates(row)));
    return match || { code: String(input).trim() };
  };
  const categoryMatch = resolveOne('category', args.category);
  return {
    category: categoryMatch?.source === 'function' ? '' : categoryMatch?.code || '',
    function: categoryMatch?.source === 'function' ? categoryMatch.code : '',
    location: resolveOne('location', args.location)?.code || '',
    nature: resolveOne('nature', args.nature)?.code || '',
  };
}

function normalizeDescription(job) {
  return stripHtml(pickFirst(job.description, job.job_description, job.job_post_info?.description));
}

export function jobUrl(config, id) {
  return `https://${config.domain}${config.path || '/index'}?spread=${encodeURIComponent(id)}`;
}

export function normalizeFeishuJob(config, job) {
  const info = job.job_post_info || {};
  const category = job.job_category || info.job_category || {};
  const nature = job.recruit_type || info.recruit_type || info.recruitment_type || {};
  const cities = job.city_list || info.city_list || [];
  const id = fieldText(job.id ?? info.id);
  const visible = {
    id,
    code: fieldText(job.code ?? info.code),
    job_no: fieldText(job.job_no ?? info.job_no),
    name: fieldText(job.title ?? info.title ?? job.name),
    url: jobUrl(config, id),
    category_code: fieldText(category.id ?? category.code),
    category_name: fieldText(category.name),
    nature_code: fieldText(nature.id ?? nature.code),
    nature_name: fieldText(nature.name),
    location_codes: cities.map(city => fieldText(city.code ?? city.id)).filter(Boolean).join(','),
    location_names: cities.map(city => fieldText(city.name)).filter(Boolean).join(','),
    experience_code: fieldText(job.experience_code ?? info.experience_code),
    levels: fieldText(job.levels ?? info.levels),
    department_code: fieldText(job.department?.id ?? info.department?.id),
    department_name: fieldText(job.department?.name ?? info.department?.name),
    updated_at: toDateText(job.publish_time ?? info.publish_time ?? job.update_time),
    description: normalizeDescription(job),
    requirement: stripHtml(pickFirst(job.requirement, job.job_requirement, info.requirement)),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      title: job.title,
      publish_time: job.publish_time,
    },
  });
  return output;
}

export async function fetchFilters(config) {
  const data = await feishuFetch(config, '/api/v1/config/job/filters/6');
  return toFilterRows(data);
}

export async function fetchJobs(config, args, page, limit) {
  const resolved = await resolveFilters(config, args);
  const body = searchBody(args, page, limit, resolved);
  const data = await feishuFetch(config, searchEndpoint(body), { method: 'POST', body });
  const list = data?.job_post_list || data?.list || [];
  const total = Number(data?.count ?? data?.total ?? list.length);
  return {
    total,
    pageNo: page,
    pageSize: limit,
    totalPage: Math.ceil(total / limit) || 0,
    list: Array.isArray(list) ? list : [],
  };
}

export async function fetchJobById(config, id) {
  let page = 1;
  let totalPage = Infinity;
  while (page <= totalPage) {
    const result = await fetchJobs(config, {}, page, MAX_PAGE_SIZE);
    totalPage = result.totalPage || page;
    const job = result.list.find(item => fieldText(item.id ?? item.job_post_info?.id) === String(id));
    if (job) return job;
    if (result.list.length < MAX_PAGE_SIZE || page >= totalPage) break;
    page += 1;
  }
  throw new EmptyResultError(`${config.id} detail`, `No ${config.name} job found for id ${id}`);
}

export function createFeishuSaasAdapter(config) {
  return {
    id: config.id,
    opencliSite: config.opencliSite,
    name: config.name,
    description: config.description,
    columns: COLUMNS,
    detailColumns: DETAIL_COLUMNS,
    maxPageSize: MAX_PAGE_SIZE,
    detailIdField: 'id',
    detailIdHint: 'Feishu/Lark numeric job id from search results.',
    async filters() {
      const rows = await fetchFilters(config);
      assertNonEmpty(rows, `${config.id} filters`, `The ${config.name} filter endpoint returned no data.`);
      return rows;
    },
    async search(args = {}) {
      const page = coercePage(args.page);
      const limit = coerceLimit(args.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const result = await fetchJobs(config, args, page, limit);
      const rows = result.list.map(job => normalizeFeishuJob(config, job));
      assertNonEmpty(rows, `${config.id} search`, `Try a different keyword or inspect filters with \`job ${config.id} filters\`.`);
      return rows;
    },
    async detail(id) {
      const normalizedId = String(id || '').trim();
      if (!normalizedId) throw new CliError('ARGUMENT_ERROR', 'Job id is required', `Use an id returned by \`job ${config.id} search\`.`);
      return normalizeFeishuJob(config, await fetchJobById(config, normalizedId));
    },
    async all(args = {}) {
      const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE, MAX_PAGE_SIZE);
      const max = Math.max(0, Number(args.max || 0));
      const rows = [];
      const seen = new Set();
      let page = 1;
      let totalPage = Infinity;
      while (page <= totalPage && (!max || rows.length < max)) {
        const result = await fetchJobs(config, args, page, pageSize);
        totalPage = result.totalPage || page;
        if (!result.list.length) break;
        for (const job of result.list) {
          const normalized = normalizeFeishuJob(config, job);
          if (!normalized.id || seen.has(normalized.id)) continue;
          seen.add(normalized.id);
          rows.push(normalized);
          if (max && rows.length >= max) break;
        }
        if (result.list.length < pageSize || page >= totalPage) break;
        page += 1;
      }
      assertNonEmpty(rows, `${config.id} all`, `Try fewer filters or inspect filters with \`job ${config.id} filters\`.`);
      return rows;
    },
  };
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

export { coerceLimit, coercePage };

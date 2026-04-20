import crypto from 'node:crypto';
import { CliError, EmptyResultError } from '../../core/errors.js';
import {
  coerceLimit,
  coercePage,
  fieldText,
  matchesAlias,
  pickFirst,
  splitDescription,
  stripHtml,
  toDateText,
} from '../shared.js';

export const SITE = 'ant-jobs';
export const BASE_URL = 'https://talent.antgroup.com';
export const API_BASE_URL = 'https://hrcareersweb.antgroup.com';
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 10;
export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'code', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'description', 'requirement', 'url'];

const CTOKEN = 'bigfish_ctoken_1a85b4a4ad';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8',
  Origin: BASE_URL,
  Referer: `${BASE_URL}/`,
  'User-Agent': USER_AGENT,
};

function endpoint(path) {
  return `${API_BASE_URL}${path}?ctoken=${CTOKEN}`;
}

async function readJsonResponse(response, apiPath) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError('ANT_BAD_RESPONSE', `Ant Group returned non-JSON data for ${apiPath}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('ANT_HTTP', `Ant Group API request failed with HTTP ${response.status}`, payload.message || response.statusText);
  }
  if (payload.success === false || payload.code && Number(payload.code) !== 0) {
    throw new CliError('ANT_API', 'Ant Group API rejected the request', payload.message || payload.errorMsg || 'The recruitment API rejected the request.');
  }
  return payload;
}

async function antFetch(apiPath, body) {
  const response = await fetch(endpoint(apiPath), {
    method: 'POST',
    headers: {
      ...REQUEST_HEADERS,
      'front-user-id': `jobhunt-${crypto.randomUUID()}`,
    },
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, apiPath);
}

function content(payload) {
  return payload.content ?? payload.data ?? payload.result ?? payload;
}

function walkTree(items = [], group, rows, parent = '') {
  for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
    const code = fieldText(item.code ?? item.id ?? item.value);
    const name = fieldText(item.name ?? item.label ?? item.title);
    if (code || name) {
      rows.push({ group, parent, code, name, en_name: fieldText(item.enName ?? item.en_name), sort_id: Number(item.sortId ?? item.sort ?? index + 1) });
    }
    walkTree(item.children || item.childList || item.subCategories || [], group, rows, code);
  }
}

function normalizeFilterRows(categories, departments, regions) {
  const rows = [];
  walkTree(categories, 'category', rows);
  for (const [index, dept] of (Array.isArray(departments) ? departments : []).entries()) {
    rows.push({
      group: 'department',
      parent: '',
      code: fieldText(dept.code ?? dept.id),
      name: fieldText(dept.name),
      en_name: '',
      sort_id: index + 1,
    });
  }
  for (const [index, region] of (Array.isArray(regions) ? regions : []).entries()) {
    rows.push({
      group: 'location',
      parent: fieldText(region.parentCode),
      code: fieldText(region.code ?? region.id),
      name: fieldText(region.name ?? region.label),
      en_name: fieldText(region.enName ?? region.en_name),
      sort_id: index + 1,
    });
  }
  rows.push({ group: 'nature', parent: '', code: 'social', name: '社招', en_name: 'Social', sort_id: 1 });
  return rows.filter(row => row.code || row.name);
}

async function resolveArgs(args = {}) {
  const filters = await fetchFilters();
  const resolveOne = (group, input) => {
    if (!input) return '';
    const match = filters.find(row => row.group === group && matchesAlias(input, [row.code, row.name, row.en_name]));
    return match?.code || String(input).trim();
  };
  const category = resolveOne('category', args.category);
  const categoryMatch = filters.find(row => row.group === 'category' && row.code === category);
  return {
    region: resolveOne('location', args.location),
    category: categoryMatch?.parent ? '' : category,
    subCategory: categoryMatch?.parent ? category : '',
  };
}

function searchRequest(args, page, limit, resolved) {
  return {
    key: args.query || '',
    regions: resolved.region || '',
    categories: resolved.category || '',
    subCategories: resolved.subCategory || '',
    bgCode: '',
    socialQrCode: '',
    pageIndex: page,
    pageSize: limit,
    channel: 'group_official_site',
    language: 'zh',
  };
}

function normalizeListPayload(payload, page, limit) {
  const value = content(payload);
  const list = Array.isArray(value) ? value : value.list || value.positions || value.items || value.content || [];
  const total = Number(value.total ?? value.totalCount ?? value.count ?? payload.total ?? list.length);
  return {
    total,
    pageNo: page,
    pageSize: limit,
    totalPage: Math.ceil(total / limit) || 0,
    list: Array.isArray(list) ? list : [],
  };
}

export function jobUrl(id) {
  return `${BASE_URL}/off-campus-position?positionId=${encodeURIComponent(id)}&lang=zh`;
}

export function normalizeJob(job) {
  const id = fieldText(job.id ?? job.positionId);
  const parts = splitDescription(pickFirst(job.description, job.jobDescription));
  const locations = job.workLocations || job.locations || job.locationNames || [];
  const categories = job.categories || job.categoryNames || [];
  const visible = {
    id,
    code: fieldText(job.code ?? job.positionCode),
    job_no: fieldText(job.jobNo),
    name: fieldText(job.name ?? job.title),
    url: jobUrl(id),
    category_code: fieldText(job.categoryCode ?? job.subCategoryCode),
    category_name: fieldText(categories.length ? categories : job.categoryName),
    nature_code: 'social',
    nature_name: fieldText(job.natureName || '社招'),
    location_codes: fieldText(job.regionCodes),
    location_names: fieldText(locations.length ? locations : job.workLocation ?? job.locationName),
    experience_code: fieldText(job.experience?.from || job.experience?.to ? `${job.experience?.from || ''}-${job.experience?.to || ''}` : job.experience),
    levels: fieldText(job.levels),
    department_code: fieldText(job.departmentCode ?? job.bgCode),
    department_name: fieldText(job.department ?? job.departmentName ?? job.bgName),
    updated_at: toDateText(job.publishTime ?? job.gmtModified ?? job.updateTime),
    description: parts.description || stripHtml(job.description),
    requirement: parts.requirement || stripHtml(job.requirement),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      code: job.code,
      publish_time: job.publishTime,
    },
  });
  return output;
}

export async function fetchJobs(args = {}, page = 1, limit = DEFAULT_PAGE_SIZE) {
  const resolved = await resolveArgs(args);
  const payload = await antFetch('/api/social/position/search', searchRequest(args, page, limit, resolved));
  return normalizeListPayload(payload, page, limit);
}

export async function fetchJobById(id) {
  const payload = await antFetch('/api/position/getDetail', {
    id: Number(id) || id,
    language: 'zh',
    channel: 'group_official_site',
  });
  const job = content(payload);
  if (job?.id || job?.positionId) return job;

  const fallback = await fetchJobs({ query: String(id) }, 1, 10);
  const match = fallback.list.find(item => fieldText(item.id ?? item.positionId) === String(id));
  if (match) return match;
  throw new EmptyResultError(`${SITE} detail`, `No Ant Group job found for id ${id}`);
}

export async function fetchFilters() {
  const [categoryPayload, departmentPayload, regionPayload] = await Promise.all([
    antFetch('/api/social/category/list', { channel: 'group_official_site', language: 'zh' }),
    antFetch('/api/social/category/listDept', { channel: 'group_official_site', language: 'zh' }),
    antFetch('/api/region/hot', { channel: 'group_official_site', language: 'zh' }),
  ]);
  return normalizeFilterRows(content(categoryPayload), content(departmentPayload), content(regionPayload));
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

export { coerceLimit, coercePage };

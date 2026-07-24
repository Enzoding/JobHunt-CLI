import { CliError, EmptyResultError } from '../../core/errors.js';
import { DEFAULT_NATURE, stampStandardNature } from '../../core/natures.js';
import {
  coerceLimit,
  coercePage,
  fieldText,
  matchesAlias,
  pickFirst,
  stripHtml,
} from '../shared.js';

export const SITE = 'mihoyo-jobs';
export const BASE_URL = 'https://jobs.mihoyo.com';
export const API_BASE_URL = 'https://ats.openout.mihoyo.com/ats-portal';
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const COLUMNS = ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at', 'url'];
export const DETAIL_COLUMNS = ['id', 'code', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'description', 'requirement', 'url'];

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';

/** social: hireType 0; campus: hireType 1 + jobNatures [1]; intern: hireType 1 + jobNatures [3] */
export const NATURE_REQUEST_BODY = {
  social: { channelDetailIds: [1], hireType: 0 },
  campus: { channelDetailIds: [1], hireType: 1, jobNatures: [1] },
  intern: { channelDetailIds: [1], hireType: 1, jobNatures: [3] },
};

function bodyForNature(nature = DEFAULT_NATURE) {
  return NATURE_REQUEST_BODY[nature] || NATURE_REQUEST_BODY[DEFAULT_NATURE];
}

async function readJsonResponse(response, endpoint) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new CliError('MIHOYO_BAD_RESPONSE', `miHoYo returned non-JSON data for ${endpoint}`, `HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new CliError('MIHOYO_HTTP', `miHoYo API request failed with HTTP ${response.status}`, payload.message || response.statusText);
  }
  if (Number(payload.code || 0) !== 0) {
    throw new CliError('MIHOYO_API', `miHoYo API returned code ${payload.code}`, payload.message || 'The recruitment API rejected the request.');
  }
  return payload.data;
}

async function mihoyoFetch(endpoint, body) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Origin: BASE_URL,
      Referer: `${BASE_URL}/`,
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, endpoint);
}

function flattenAddressTree(nodes = [], rows = [], parent = '') {
  for (const [index, node] of (Array.isArray(nodes) ? nodes : []).entries()) {
    const code = fieldText(node.value ?? node.id ?? node.code);
    const name = fieldText(node.label ?? node.name);
    if (code || name) rows.push({ group: 'location', parent, code, name, en_name: '', sort_id: index + 1 });
    flattenAddressTree(node.children || [], rows, code);
  }
  return rows;
}

function enumRows(group, items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      group,
      parent: '',
      code: fieldText(item.value ?? item.id ?? item.code),
      name: fieldText(item.label ?? item.name),
      en_name: '',
      sort_id: index + 1,
    }))
    .filter(row => row.code || row.name);
}

async function resolveArgs(args = {}) {
  const filters = await fetchFilters(args);
  const resolveOne = (group, input) => {
    if (!input) return '';
    const match = filters.find(row => row.group === group && matchesAlias(input, [row.code, row.name]));
    return match?.code || String(input).trim();
  };
  return {
    category: resolveOne('category', args.category),
    location: resolveOne('location', args.location),
  };
}

function searchBody(args, page, limit, resolved, nature = DEFAULT_NATURE) {
  const body = {
    ...bodyForNature(nature),
    pageNo: page,
    pageSize: limit,
  };
  if (args.query) body.jobName = args.query;
  if (resolved.category) body.competencyTypes = [Number(resolved.category) || resolved.category];
  if (resolved.location) body.addressIds = [Number(resolved.location) || resolved.location];
  return body;
}

export function jobUrl(id) {
  return `${BASE_URL}/#/position/${encodeURIComponent(id)}`;
}

export function normalizeJob(job, nature = DEFAULT_NATURE) {
  const id = fieldText(job.id);
  const addresses = job.addressDetailList || [];
  const visible = {
    id,
    code: fieldText(job.code),
    job_no: fieldText(job.code),
    name: fieldText(job.title),
    url: jobUrl(id),
    category_code: fieldText(job.competencyTypeId),
    category_name: fieldText(job.competencyType),
    nature_code: nature,
    nature_name: nature,
    location_codes: addresses.map(item => fieldText(item.addressId)).filter(Boolean).join(','),
    location_names: addresses.map(item => fieldText(item.addressDetail)).filter(Boolean).join(','),
    experience_code: fieldText(job.workYear),
    levels: fieldText(job.levels),
    department_code: fieldText(job.objectId),
    department_name: fieldText(job.objectName || job.projectName),
    updated_at: fieldText(job.updateTime || job.publishTime).slice(0, 10),
    description: stripHtml(pickFirst(job.description, job.jobSummary)),
    requirement: stripHtml(pickFirst(job.jobRequire, job.requirement)),
  };
  const output = { ...visible };
  Object.defineProperty(output, 'raw', {
    enumerable: true,
    value: {
      id: job.id,
      code: job.code,
      hurry: job.hurry,
      hire_type: job.hireType,
      job_nature_id: job.jobNatureId,
    },
  });
  return stampStandardNature(output, nature, {
    code: fieldText(job.jobNatureId ?? job.hireType),
    name: fieldText(job.jobNature || job.hireTypeName),
  });
}

export async function fetchJobs(args = {}, page = 1, limit = DEFAULT_PAGE_SIZE) {
  const nature = args.nature || DEFAULT_NATURE;
  const resolved = await resolveArgs(args);
  const data = await mihoyoFetch('/v1/job/list', searchBody(args, page, limit, resolved, nature));
  const list = Array.isArray(data?.list) ? data.list : [];
  const total = Number(data?.total ?? list.length);
  return {
    total,
    pageNo: Number(data?.pageNo || page),
    pageSize: Number(data?.pageSize || limit),
    totalPage: Math.ceil(total / limit) || 0,
    list,
  };
}

export async function fetchJobById(id, args = {}) {
  const nature = args.nature || DEFAULT_NATURE;
  const data = await mihoyoFetch('/v1/job/info', { ...bodyForNature(nature), id: String(id) });
  if (!data?.id) throw new EmptyResultError(`${SITE} detail`, `No miHoYo job found for id ${id}`);
  return data;
}

export async function fetchFilters(_args = {}) {
  const baseBody = bodyForNature(DEFAULT_NATURE);
  const [categories, addresses] = await Promise.all([
    mihoyoFetch('/v2/common/enum_list/get', { ...baseBody, key: 'CompetencyTypeEnum' }),
    mihoyoFetch('/v2/common/enum_tree/get', { ...baseBody, key: 'JobAddressEnum' }),
  ]);
  return [
    ...enumRows('category', categories),
    ...flattenAddressTree(addresses),
  ];
}

export function assertNonEmpty(rows, command, hint) {
  if (!rows.length) throw new EmptyResultError(command, hint);
}

export { coerceLimit, coercePage };

import { ArgumentError } from './errors.js';

export const VIEWS = ['compact', 'full', 'debug'];

export const COMPACT_FIELDS = [
  'id',
  'detail_id',
  'name',
  'category_name',
  'nature_code',
  'location_names',
  'department_name',
  'updated_at',
  'url',
];

const REQUIRED_COMPACT_FIELDS = new Set(['id', 'detail_id', 'name', 'nature_code']);

export function isEmptyField(value) {
  return value === undefined || value === null || value === ''
    || (Array.isArray(value) && value.length === 0);
}

export function normalizeView(view) {
  if (view === undefined || view === null || String(view).trim() === '') {
    return undefined;
  }
  const value = String(view).trim().toLowerCase();
  if (!VIEWS.includes(value)) {
    throw new ArgumentError(
      `Unsupported view: ${view}`,
      `Use one of: ${VIEWS.join(', ')}`,
    );
  }
  return value;
}

export function resolveDetailId(job, detailIdField = 'id') {
  if (!job || typeof job !== 'object' || Array.isArray(job)) return '';
  const field = detailIdField || 'id';
  const primary = job[field];
  if (!isEmptyField(primary)) return String(primary);
  if (!isEmptyField(job.id)) return String(job.id);
  return '';
}

export function jobIdentity(job) {
  if (!job || typeof job !== 'object') return ':';
  return `${job.nature_code ?? ''}:${job.id ?? ''}`;
}

function cloneEnumerable(job, { dropRaw = false } = {}) {
  const clone = structuredClone(job);
  if (dropRaw) delete clone.raw;
  return clone;
}

export function projectJob(job, view, { detailIdField = 'id' } = {}) {
  const normalized = normalizeView(view);
  if (!normalized) return job;
  if (!job || typeof job !== 'object' || Array.isArray(job)) return job;

  if (normalized === 'debug') return cloneEnumerable(job);
  if (normalized === 'full') return cloneEnumerable(job, { dropRaw: true });

  const values = {
    id: job.id ?? '',
    detail_id: resolveDetailId(job, detailIdField),
    name: job.name ?? '',
    category_name: job.category_name,
    nature_code: job.nature_code ?? '',
    location_names: job.location_names,
    department_name: job.department_name,
    updated_at: job.updated_at,
    url: job.url,
  };

  const compact = {};
  for (const key of COMPACT_FIELDS) {
    const value = values[key];
    if (REQUIRED_COMPACT_FIELDS.has(key) || !isEmptyField(value)) {
      compact[key] = Array.isArray(value) ? [...value] : value;
    }
  }
  return compact;
}

export function projectJobs(jobs, view, meta = {}) {
  if (!Array.isArray(jobs)) return jobs;
  return jobs.map(job => projectJob(job, view, meta));
}

export function projectCompare(payload, view, { resolveDetailIdField } = {}) {
  if (!payload || typeof payload !== 'object') return payload;
  const results = (payload.results || []).map(result => {
    if (!result || typeof result !== 'object') return result;
    if (result.error) {
      return { ...result };
    }
    const detailIdField = resolveDetailIdField
      ? resolveDetailIdField(result.site)
      : 'id';
    const jobs = projectJobs(result.jobs || [], view, { detailIdField });
    return {
      ...result,
      jobs,
      count: Array.isArray(jobs) ? jobs.length : result.count,
    };
  });
  return { ...payload, results };
}

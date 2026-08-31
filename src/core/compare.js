import { exportJobs, getSite } from './registry.js';
import { ArgumentError, JobHuntCliError } from './errors.js';
import { normalizeNature } from './natures.js';
import { normalizeText } from './formatters.js';

export const DEFAULT_COMPARE_MAX = 30;
export const DEFAULT_COMPARE_CONCURRENCY = 3;

/**
 * Parse and validate --sites value. Preserves order, drops duplicates.
 */
export function parseSiteIds(sitesOpt) {
  const ids = String(sitesOpt || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (!ids.length) {
    throw new ArgumentError(
      '--sites is required',
      'Example: job compare AI --sites meituan,tencent,bytedance',
    );
  }

  const seen = new Set();
  const unique = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(id);
  }

  const unknown = [];
  for (const id of unique) {
    try {
      getSite(id);
    } catch {
      unknown.push(id);
    }
  }
  if (unknown.length) {
    throw new ArgumentError(
      `Unknown site(s): ${unknown.join(', ')}`,
      'Run `job sites` to list supported recruitment sites.',
    );
  }

  return unique;
}

export function stripRaw(job) {
  if (!job || typeof job !== 'object' || Array.isArray(job)) return job;
  const clone = { ...job };
  delete clone.raw;
  return clone;
}

export function resolveCompareConcurrency(env = process.env) {
  const raw = env.JOBHUNT_COMPARE_CONCURRENCY;
  if (raw === undefined || raw === null || raw === '') return DEFAULT_COMPARE_CONCURRENCY;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_COMPARE_CONCURRENCY;
  return Math.floor(n);
}

/**
 * Run async mapper over items with a fixed concurrency pool.
 */
export async function mapPool(items, concurrency, mapper) {
  const list = [...items];
  const results = new Array(list.length);
  let next = 0;

  async function worker() {
    while (next < list.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(list[index], index);
    }
  }

  const poolSize = Math.max(1, Math.min(concurrency, list.length || 1));
  await Promise.all(Array.from({ length: poolSize }, () => worker()));
  return results;
}

async function fetchSiteResult(siteId, fetchArgs, exportJobsImpl) {
  try {
    const jobs = await exportJobsImpl(siteId, fetchArgs);
    const cleaned = (jobs || []).map(stripRaw);
    return {
      site: siteId,
      count: cleaned.length,
      jobs: cleaned,
      error: null,
    };
  } catch (error) {
    return {
      site: siteId,
      count: 0,
      jobs: [],
      error: {
        code: error.code || 'ERROR',
        message: error.message || String(error),
      },
    };
  }
}

/**
 * Multi-site fetch+merge for agent consumption. No cross-site narrative.
 */
export async function compareJobs(args = {}, {
  exportJobsImpl = exportJobs,
  env = process.env,
} = {}) {
  const siteIds = parseSiteIds(args.sites);
  const maxPerSite = args.max === undefined || args.max === null || args.max === ''
    ? DEFAULT_COMPARE_MAX
    : Math.max(0, Number(args.max));
  const nature = normalizeNature(args.nature);
  const fetchArgs = {
    query: args.query || args.keyword || '',
    category: args.category || '',
    location: args.location || '',
    nature,
    max: maxPerSite,
  };

  const concurrency = resolveCompareConcurrency(env);
  const results = await mapPool(siteIds, concurrency, siteId =>
    fetchSiteResult(siteId, fetchArgs, exportJobsImpl));

  const payload = {
    query: fetchArgs.query,
    nature,
    category: fetchArgs.category,
    location: fetchArgs.location,
    max_per_site: maxPerSite,
    sites: siteIds,
    results,
  };

  if (results.length && results.every(row => row.error)) {
    const codes = results.map(row => row.error?.code).filter(Boolean).join(', ');
    throw new JobHuntCliError(
      'COMPARE_FAILED',
      `All sites failed${codes ? ` (${codes})` : ''}`,
      'Check site ids, --nature support, network/proxy, then retry with fewer --sites.',
      1,
    );
  }

  return payload;
}

export function flattenCompareRows(payload) {
  const rows = [];
  for (const result of payload.results || []) {
    if (result.error) {
      rows.push({
        site: result.site,
        id: '',
        name: `(error: ${result.error.code || 'ERROR'})`,
        category_name: '',
        nature_name: '',
        location_names: '',
        department_name: '',
        updated_at: '',
        url: '',
        error: result.error.message || '',
      });
      continue;
    }
    if (!result.jobs?.length) {
      rows.push({
        site: result.site,
        id: '',
        name: '(no jobs)',
        category_name: '',
        nature_name: '',
        location_names: '',
        department_name: '',
        updated_at: '',
        url: '',
        error: '',
      });
      continue;
    }
    for (const job of result.jobs) {
      rows.push({
        site: result.site,
        id: job.id,
        name: job.name,
        category_name: job.category_name,
        nature_name: job.nature_name,
        location_names: job.location_names,
        department_name: job.department_name,
        updated_at: job.updated_at,
        url: job.url,
        error: '',
      });
    }
  }
  return rows;
}

export function renderCompareMarkdown(payload) {
  const filterDesc = [
    payload.nature ? `nature=${payload.nature}` : '',
    payload.category ? `category=${payload.category}` : '',
    payload.location ? `location=${payload.location}` : '',
    `max_per_site=${payload.max_per_site}`,
  ].filter(Boolean).join(', ');

  let md = `# Compare 「${payload.query || '(all)'}」\n\n`;
  md += `Sites: ${(payload.sites || []).join(', ')}\n`;
  md += `Filters: ${filterDesc}\n\n`;

  for (const result of payload.results || []) {
    md += `## ${result.site} (${result.count})\n\n`;
    if (result.error) {
      md += `Error: \`${result.error.code}\` ${normalizeText(result.error.message)}\n\n`;
      continue;
    }
    if (!result.jobs?.length) {
      md += 'No jobs.\n\n';
      continue;
    }
    md += '| ID | 岗位名称 | 类别 | 地点 | 更新时间 | 链接 |\n';
    md += '| --- | --- | --- | --- | --- | --- |\n';
    for (const job of result.jobs) {
      const esc = v => normalizeText(v).replaceAll('|', '\\|');
      md += `| ${esc(job.id)} | ${esc(job.name)} | ${esc(job.category_name)} | ${esc(job.location_names)} | ${esc(job.updated_at)} | ${job.url ? `[link](${job.url})` : ''} |\n`;
    }
    md += '\n';
  }

  return md;
}

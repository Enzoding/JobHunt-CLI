import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  fetchFilters,
  fetchJobByCode,
  fetchJobs,
  normalizeJob,
} from './utils.js';
import { ArgumentError } from '../../core/errors.js';

export const ctripAdapter = {
  id: 'ctrip',
  opencliSite: SITE,
  name: 'Ctrip',
  description: 'Ctrip social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'code',
  detailIdHint: 'fromId from search results, e.g. MJ021758',
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'ctrip filters', 'The Ctrip filter endpoints returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'ctrip search', 'Try a different keyword or inspect filters with `job ctrip filters`.');
    return rows;
  },
  async detail(code) {
    const normalizedCode = String(code || '').trim();
    if (!normalizedCode) throw new ArgumentError('Job code is required', 'Use the code returned by `job ctrip search`.');
    return normalizeJob(await fetchJobByCode(normalizedCode));
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const rows = [];
    const seen = new Set();
    let page = 1;
    let totalPage = Infinity;
    while (page <= totalPage && (!max || rows.length < max)) {
      const result = await fetchJobs(args, page, pageSize);
      totalPage = result.totalPage || page;
      if (!result.list.length) break;
      for (const job of result.list) {
        const jobId = job.fromId || job.id;
        if (!jobId || seen.has(jobId)) continue;
        seen.add(jobId);
        rows.push(normalizeJob(job));
        if (max && rows.length >= max) break;
      }
      if (result.list.length < pageSize || page >= totalPage) break;
      page += 1;
    }
    assertNonEmpty(rows, 'ctrip all', 'Try fewer filters or inspect filters with `job ctrip filters`.');
    return rows;
  },
};

export default ctripAdapter;

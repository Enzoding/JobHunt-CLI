import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  enrichJobsWithDetails,
  fetchFilters,
  fetchJobDetail,
  fetchJobs,
  normalizeJob,
} from './utils.js';
import { ArgumentError } from '../../core/errors.js';

export const didiAdapter = {
  id: 'didi',
  opencliSite: SITE,
  name: 'Didi',
  description: 'Didi social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'Numeric id from search results, e.g. 60517',
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'didi filters', 'The Didi filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const size = coerceLimit(args.limit);
    const result = await fetchJobs(args, page, size);
    const rows = (await enrichJobsWithDetails(result.list.slice(0, size))).map(normalizeJob);
    assertNonEmpty(rows, 'didi search', 'Try a different keyword or inspect filters with `jobs didi filters`.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!/^\d+$/.test(normalizedId)) {
      throw new ArgumentError('Job id must be numeric', 'Use an id returned by `jobs didi search`.');
    }
    return normalizeJob(await fetchJobDetail(normalizedId));
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const rows = [];
    const seen = new Set();
    let page = 1;
    let total = Infinity;

    while (rows.length < total && (!max || rows.length < max)) {
      const result = await fetchJobs(args, page, pageSize);
      total = result.total || rows.length;
      if (!result.list.length) break;

      const pageJobs = [];
      for (const job of result.list) {
        const id = job.jdId || job.id;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        pageJobs.push(job);
        if (max && rows.length + pageJobs.length >= max) break;
      }

      rows.push(...(await enrichJobsWithDetails(pageJobs)).map(normalizeJob));

      if (result.list.length < pageSize || rows.length >= total) break;
      page += 1;
    }

    assertNonEmpty(rows, 'didi all', 'Try fewer filters or inspect filters with `jobs didi filters`.');
    return rows;
  },
};

export default didiAdapter;

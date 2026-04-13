import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  fetchFilters,
  fetchJobDetail,
  fetchJobs,
  normalizeJob,
} from './utils.js';
import { ArgumentError } from '../../core/errors.js';

export const kuaishouAdapter = {
  id: 'kuaishou',
  opencliSite: SITE,
  name: 'Kuaishou',
  description: 'Kuaishou social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'kuaishou filters', 'The Kuaishou filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const pageNum = coercePage(args.page);
    const pageSize = coerceLimit(args.limit);
    const result = await fetchJobs(args, pageNum, pageSize);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'kuaishou search', 'Try a different keyword or inspect filters with `hire kuaishou filters`.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!/^\d+$/.test(normalizedId)) {
      throw new ArgumentError('Job id must be numeric', 'Use an id returned by `hire kuaishou search`.');
    }
    return normalizeJob(await fetchJobDetail(normalizedId));
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const rows = [];
    const seen = new Set();
    let pageNum = 1;
    let total = Infinity;

    while (rows.length < total && (!max || rows.length < max)) {
      const result = await fetchJobs(args, pageNum, pageSize);
      total = result.total || rows.length;
      if (!result.list.length) break;

      for (const job of result.list) {
        if (!job.id || seen.has(job.id)) continue;
        seen.add(job.id);
        rows.push(normalizeJob(job));
        if (max && rows.length >= max) break;
      }

      if (result.pageNum >= result.pages || result.list.length < pageSize) break;
      pageNum += 1;
    }

    assertNonEmpty(rows, 'kuaishou all', 'Try fewer filters or inspect filters with `hire kuaishou filters`.');
    return rows;
  },
};

export default kuaishouAdapter;

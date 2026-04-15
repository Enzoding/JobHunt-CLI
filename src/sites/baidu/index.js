import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  fetchFilters,
  fetchJobById,
  fetchJobs,
  normalizeJob,
} from './utils.js';
import { ArgumentError } from '../../core/errors.js';

export const baiduAdapter = {
  id: 'baidu',
  opencliSite: SITE,
  name: 'Baidu',
  description: 'Baidu social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'postId from search results, e.g. abaaf0ed-39e3-4508-a208-d9e6ca20b27c',
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'baidu filters', 'The Baidu filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'baidu search', 'Try a different keyword or inspect filters with `job baidu filters`.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) {
      throw new ArgumentError('Job id is required', 'Use an id returned by `job baidu search`.');
    }
    return normalizeJob(await fetchJobById(normalizedId));
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

      for (const job of result.list) {
        const jobId = job.postId;
        if (!jobId || seen.has(jobId)) continue;
        seen.add(jobId);
        rows.push(normalizeJob(job));
        if (max && rows.length >= max) break;
      }

      if (result.list.length < pageSize) break;
      page += 1;
    }

    assertNonEmpty(rows, 'baidu all', 'Try fewer filters or inspect filters with `job baidu filters`.');
    return rows;
  },
};

export default baiduAdapter;

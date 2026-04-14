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

export const bytedanceAdapter = {
  id: 'bytedance',
  opencliSite: SITE,
  name: 'ByteDance',
  description: 'ByteDance social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'bytedance filters', 'The ByteDance filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const offset = (page - 1) * limit;
    const result = await fetchJobs(args, offset, limit);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'bytedance search', 'Try a different keyword or inspect filters with `jobs bytedance filters`.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) {
      throw new ArgumentError('Job id is required', 'Use an id returned by `jobs bytedance search`.');
    }
    return normalizeJob(await fetchJobById(normalizedId));
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const rows = [];
    const seen = new Set();
    let offset = 0;
    let total = Infinity;

    while (rows.length < total && (!max || rows.length < max)) {
      const result = await fetchJobs(args, offset, pageSize);
      total = result.total || rows.length;
      if (!result.list.length) break;

      for (const job of result.list) {
        if (!job.id || seen.has(job.id)) continue;
        seen.add(job.id);
        rows.push(normalizeJob(job));
        if (max && rows.length >= max) break;
      }

      if (result.list.length < pageSize) break;
      offset += pageSize;
    }

    assertNonEmpty(rows, 'bytedance all', 'Try fewer filters or inspect filters with `jobs bytedance filters`.');
    return rows;
  },
};

export default bytedanceAdapter;

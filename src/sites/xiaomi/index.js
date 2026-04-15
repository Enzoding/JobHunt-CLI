import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coerceOffset,
  fetchFilters,
  fetchJobDetail,
  fetchJobs,
  normalizeJob,
} from './utils.js';
import { ArgumentError } from '../../core/errors.js';

export const xiaomiAdapter = {
  id: 'xiaomi',
  opencliSite: SITE,
  name: 'Xiaomi',
  description: 'Xiaomi social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'Numeric id from search results, e.g. 7628811497149892883',
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'xiaomi filters', 'The Xiaomi filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const offset = coerceOffset(args.offset);
    const limit = coerceLimit(args.limit);
    const result = await fetchJobs(args, offset, limit);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'xiaomi search', 'Try a different keyword.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!/^\d+$/.test(normalizedId)) {
      throw new ArgumentError('Job id must be numeric', 'Use an id returned by `jobs xiaomi search`.');
    }
    return normalizeJob(await fetchJobDetail(normalizedId));
  },
  async all(args = {}) {
    const limit = coerceLimit(args.limit, MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const rows = [];
    const seen = new Set();
    let offset = 0;
    let hasMore = true;

    while (hasMore && (!max || rows.length < max)) {
      const result = await fetchJobs(args, offset, limit);
      if (!result.list.length) break;

      for (const job of result.list) {
        const jobId = job.id;
        if (!jobId || seen.has(jobId)) continue;
        seen.add(jobId);
        rows.push(normalizeJob(job));
        if (max && rows.length >= max) break;
      }

      if (result.list.length < limit) hasMore = false;
      offset += limit;
    }

    assertNonEmpty(rows, 'xiaomi all', 'Try fewer filters.');
    return rows;
  },
};

export default xiaomiAdapter;

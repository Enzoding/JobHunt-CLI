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

export const jdAdapter = {
  id: 'jd',
  opencliSite: SITE,
  name: 'JD',
  description: 'JD social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'positionId from search results, e.g. 213332',
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'jd filters', 'The JD filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'jd search', 'Try a different keyword or inspect filters with `job jd filters`.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) {
      throw new ArgumentError('Job id is required', 'Use an id returned by `job jd search`.');
    }
    return normalizeJob(await fetchJobById(normalizedId));
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const rows = [];
    const seen = new Set();
    let page = 1;
    let hasMore = true;

    while (hasMore && (!max || rows.length < max)) {
      const result = await fetchJobs(args, page, pageSize);
      if (!result.list.length) break;

      for (const job of result.list) {
        const jobId = job.positionId || job.id;
        if (!jobId || seen.has(jobId)) continue;
        seen.add(jobId);
        rows.push(normalizeJob(job));
        if (max && rows.length >= max) break;
      }

      if (result.list.length < pageSize) hasMore = false;
      page += 1;
    }

    assertNonEmpty(rows, 'jd all', 'Try fewer filters or inspect filters with `job jd filters`.');
    return rows;
  },
};

export default jdAdapter;

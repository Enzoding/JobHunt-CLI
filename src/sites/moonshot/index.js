import {
  COLUMNS,
  DEFAULT_PAGE_SIZE,
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

export const moonshotAdapter = {
  id: 'moonshot',
  opencliSite: SITE,
  name: 'Moonshot AI',
  description: 'Moonshot AI social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'Moka job id from search results.',
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'moonshot filters', 'The Moonshot filter data returned no rows.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'moonshot search', 'Try a different keyword or inspect filters with `job moonshot filters`.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) throw new ArgumentError('Job id is required', 'Use an id returned by `job moonshot search`.');
    return normalizeJob(await fetchJobById(normalizedId));
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE, MAX_PAGE_SIZE);
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
        const normalized = normalizeJob(job);
        if (!normalized.id || seen.has(normalized.id)) continue;
        seen.add(normalized.id);
        rows.push(normalized);
        if (max && rows.length >= max) break;
      }
      if (result.list.length < pageSize || page >= totalPage) break;
      page += 1;
    }
    assertNonEmpty(rows, 'moonshot all', 'Try fewer filters or inspect filters with `job moonshot filters`.');
    return rows;
  },
};

export default moonshotAdapter;

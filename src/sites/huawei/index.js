import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  fetchAllJobs,
  fetchFilters,
  fetchJobById,
  fetchJobs,
  normalizeJob,
} from './utils.js';
import { ArgumentError } from '../../core/errors.js';

export const huaweiAdapter = {
  id: 'huawei',
  opencliSite: SITE,
  name: 'Huawei',
  description: 'Huawei social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'jobId from search results, e.g. 97792',
  async filters() {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'huawei filters', 'The Huawei filter endpoints returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const result = args.query ? { list: (await fetchAllJobs(args, MAX_PAGE_SIZE)).slice((page - 1) * limit, page * limit) } : await fetchJobs(args, page, limit);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, 'huawei search', 'Try a different keyword or inspect filters with `job huawei filters`.');
    return rows;
  },
  async detail(id) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) throw new ArgumentError('Job id is required', 'Use an id returned by `job huawei search`.');
    return normalizeJob(await fetchJobById(normalizedId));
  },
  async all(args = {}) {
    const max = Math.max(0, Number(args.max || 0));
    const rows = (await fetchAllJobs(args, MAX_PAGE_SIZE)).map(normalizeJob);
    const limited = max ? rows.slice(0, max) : rows;
    assertNonEmpty(limited, 'huawei all', 'Try fewer filters or inspect filters with `job huawei filters`.');
    return limited;
  },
};

export default huaweiAdapter;

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
  description: 'JD social, campus, and intern recruitment',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'positionId/publishId from search results, e.g. 213332 or 7892',
  async filters(args = {}) {
    const rows = await fetchFilters(args);
    assertNonEmpty(rows, 'jd filters', 'The JD filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const nature = args.nature || 'social';
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(job => normalizeJob(job, nature));
    assertNonEmpty(rows, 'jd search', 'Try a different keyword or inspect filters with `job jd filters`.');
    return rows;
  },
  async detail(id, args = {}) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) {
      throw new ArgumentError('Job id is required', 'Use an id returned by `job jd search`.');
    }
    const nature = args.nature || 'social';
    return normalizeJob(await fetchJobById(normalizedId, args), nature);
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const nature = args.nature || 'social';
    const rows = [];
    const seen = new Set();
    let page = 1;
    let totalPage = Infinity;

    while (page <= totalPage && (!max || rows.length < max)) {
      const result = await fetchJobs(args, page, pageSize);
      totalPage = result.totalPage || page;
      if (!result.list.length) break;

      for (const job of result.list) {
        const normalized = normalizeJob(job, nature);
        const key = `${normalized.nature_code}:${normalized.id}`;
        const jobId = normalized.id;
        if (!jobId || seen.has(key)) continue;
        seen.add(key);
        rows.push(normalized);
        if (max && rows.length >= max) break;
      }

      if (result.list.length < pageSize || page >= totalPage) break;
      page += 1;
    }

    assertNonEmpty(rows, 'jd all', 'Try fewer filters or inspect filters with `job jd filters`.');
    return rows;
  },
};

export default jdAdapter;

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
  description: 'Ctrip social, campus, and intern recruitment',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'code',
  detailIdHint: 'fromId from search results, e.g. MJ021758',
  async filters(args = {}) {
    const rows = await fetchFilters(args);
    assertNonEmpty(rows, 'ctrip filters', 'The Ctrip filter endpoints returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const nature = args.nature || 'social';
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(job => normalizeJob(job, nature));
    assertNonEmpty(rows, 'ctrip search', 'Try a different keyword or inspect filters with `job ctrip filters`.');
    return rows;
  },
  async detail(code, args = {}) {
    const normalizedCode = String(code || '').trim();
    if (!normalizedCode) throw new ArgumentError('Job code is required', 'Use the code returned by `job ctrip search`.');
    const nature = args.nature || 'social';
    return normalizeJob(await fetchJobByCode(normalizedCode, args), nature);
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
        const key = `${normalized.nature_code}:${normalized.code || normalized.id}`;
        if (!(normalized.code || normalized.id) || seen.has(key)) continue;
        seen.add(key);
        rows.push(normalized);
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

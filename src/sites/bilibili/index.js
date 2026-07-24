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

export const bilibiliAdapter = {
  id: 'bilibili',
  opencliSite: SITE,
  name: 'Bilibili',
  description: 'Bilibili social and campus recruitment',
  supportedNatures: ['social', 'campus'],
  defaultNature: 'social',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'Numeric id from search results, e.g. 25143',
  async filters(args = {}) {
    const rows = await fetchFilters(args);
    assertNonEmpty(rows, 'bilibili filters', 'The Bilibili filter endpoints returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const nature = args.nature || 'social';
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(job => normalizeJob(job, nature));
    assertNonEmpty(rows, 'bilibili search', 'Try a different keyword or inspect filters with `job bilibili filters`.');
    return rows;
  },
  async detail(id, args = {}) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) throw new ArgumentError('Job id is required', 'Use an id returned by `job bilibili search`.');
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
        if (!normalized.id || seen.has(key)) continue;
        seen.add(key);
        rows.push(normalized);
        if (max && rows.length >= max) break;
      }
      if (result.list.length < pageSize || page >= totalPage) break;
      page += 1;
    }
    assertNonEmpty(rows, 'bilibili all', 'Try fewer filters or inspect filters with `job bilibili filters`.');
    return rows;
  },
};

export default bilibiliAdapter;

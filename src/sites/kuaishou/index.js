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
  description: 'Kuaishou social, campus, and intern recruitment',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'Numeric id from search results, e.g. 30199',
  async filters(args = {}) {
    const rows = await fetchFilters(args);
    assertNonEmpty(rows, 'kuaishou filters', 'The Kuaishou filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const pageNum = coercePage(args.page);
    const pageSize = coerceLimit(args.limit);
    const nature = args.nature || 'social';
    const result = await fetchJobs(args, pageNum, pageSize);
    const rows = result.list.map(job => normalizeJob(job, nature));
    assertNonEmpty(rows, 'kuaishou search', 'Try a different keyword or inspect filters with `job kuaishou filters`.');
    return rows;
  },
  async detail(id, args = {}) {
    const normalizedId = String(id || '').trim();
    if (!/^\d+$/.test(normalizedId)) {
      throw new ArgumentError('Job id must be numeric', 'Use an id returned by `job kuaishou search`.');
    }
    const nature = args.nature || 'social';
    return normalizeJob(await fetchJobDetail(normalizedId, args), nature);
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const nature = args.nature || 'social';
    const rows = [];
    const seen = new Set();
    let pageNum = 1;
    let total = Infinity;

    while (rows.length < total && (!max || rows.length < max)) {
      const result = await fetchJobs(args, pageNum, pageSize);
      total = result.total || rows.length;
      if (!result.list.length) break;

      for (const job of result.list) {
        const normalized = normalizeJob(job, nature);
        const key = `${normalized.nature_code}:${normalized.id}`;
        if (!normalized.id || seen.has(key)) continue;
        seen.add(key);
        rows.push(normalized);
        if (max && rows.length >= max) break;
      }

      if (result.pageNum >= result.pages || result.list.length < pageSize) break;
      pageNum += 1;
    }

    assertNonEmpty(rows, 'kuaishou all', 'Try fewer filters or inspect filters with `job kuaishou filters`.');
    return rows;
  },
};

export default kuaishouAdapter;

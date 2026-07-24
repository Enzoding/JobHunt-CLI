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
  description: 'Xiaomi social, campus, and intern recruitment',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'Numeric id from search results, e.g. 7628811497149892883',
  async filters(args = {}) {
    const rows = await fetchFilters(args);
    assertNonEmpty(rows, 'xiaomi filters', 'The Xiaomi filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const offset = coerceOffset(args.offset);
    const limit = coerceLimit(args.limit);
    const nature = args.nature || 'social';
    const result = await fetchJobs(args, offset, limit);
    const rows = result.list.map(job => normalizeJob(job, nature));
    assertNonEmpty(rows, 'xiaomi search', 'Try a different keyword.');
    return rows;
  },
  async detail(id, args = {}) {
    const normalizedId = String(id || '').trim();
    if (!/^\d+$/.test(normalizedId)) {
      throw new ArgumentError('Job id must be numeric', 'Use an id returned by `job xiaomi search`.');
    }
    const nature = args.nature || 'social';
    return normalizeJob(await fetchJobDetail(normalizedId, args), nature);
  },
  async all(args = {}) {
    const limit = coerceLimit(args.limit, MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const nature = args.nature || 'social';
    const rows = [];
    const seen = new Set();
    let offset = 0;
    let hasMore = true;

    while (hasMore && (!max || rows.length < max)) {
      const result = await fetchJobs(args, offset, limit);
      if (!result.list.length) break;

      for (const job of result.list) {
        const normalized = normalizeJob(job, nature);
        const key = `${normalized.nature_code}:${normalized.id}`;
        if (!normalized.id || seen.has(key)) continue;
        seen.add(key);
        rows.push(normalized);
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

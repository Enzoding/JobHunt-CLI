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

export const tencentAdapter = {
  id: 'tencent',
  opencliSite: SITE,
  name: 'Tencent',
  description: 'Tencent social, campus, and intern recruitment',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'PostId from search results, e.g. 2011285787706019840',
  async filters(args = {}) {
    const rows = await fetchFilters();
    assertNonEmpty(rows, 'tencent filters', 'The Tencent filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const limit = coerceLimit(args.limit);
    const nature = args.nature || 'social';
    const result = await fetchJobs(args, page, limit);
    const rows = result.list.map(job => normalizeJob(job, nature));
    assertNonEmpty(rows, 'tencent search', 'Try a different keyword or inspect filters with `job tencent filters`.');
    return rows;
  },
  async detail(id, args = {}) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) {
      throw new ArgumentError('Job id is required', 'Use an id returned by `job tencent search`.');
    }
    const nature = args.nature || 'social';
    return normalizeJob(await fetchJobById(normalizedId), nature);
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const nature = args.nature || 'social';
    const rows = [];
    const seen = new Set();
    let page = 1;
    let total = Infinity;

    while (rows.length < total && (!max || rows.length < max)) {
      const result = await fetchJobs(args, page, pageSize);
      total = result.total || rows.length;
      if (!result.list.length) break;

      for (const job of result.list) {
        const normalized = normalizeJob(job, nature);
        if (!normalized.id) continue;
        const key = `${normalized.nature_code}:${normalized.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(normalized);
        if (max && rows.length >= max) break;
      }

      if (result.list.length < pageSize) break;
      page += 1;
    }

    assertNonEmpty(rows, 'tencent all', 'Try fewer filters or inspect filters with `job tencent filters`.');
    return rows;
  },
};

export default tencentAdapter;

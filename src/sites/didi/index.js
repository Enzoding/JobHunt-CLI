import {
  COLUMNS,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  enrichJobsWithDetails,
  fetchFilters,
  fetchJobDetail,
  fetchJobs,
  normalizeJob,
  resolveNatureChannel,
} from './utils.js';
import { ArgumentError } from '../../core/errors.js';

export const didiAdapter = {
  id: 'didi',
  opencliSite: SITE,
  name: 'Didi',
  description: 'Didi social, campus, and intern recruitment',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',
  detailIdHint: 'Numeric id (social) or UUID (campus/intern) from search results',
  async filters(args = {}) {
    const rows = await fetchFilters(args);
    assertNonEmpty(rows, 'didi filters', 'The Didi filter endpoint returned no data.');
    return rows;
  },
  async search(args = {}) {
    const page = coercePage(args.page);
    const size = coerceLimit(args.limit);
    const nature = args.nature || 'social';
    const result = await fetchJobs(args, page, size);
    const jobs = resolveNatureChannel(nature).backend === 'social'
      ? await enrichJobsWithDetails(result.list.slice(0, size), args)
      : result.list;
    const rows = jobs.map(job => normalizeJob(job, nature));
    assertNonEmpty(rows, 'didi search', 'Try a different keyword or inspect filters with `jobs didi filters`.');
    return rows;
  },
  async detail(id, args = {}) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) {
      throw new ArgumentError('Job id is required', 'Use an id returned by `jobs didi search`.');
    }
    const nature = args.nature || 'social';
    return normalizeJob(await fetchJobDetail(normalizedId, {}, args), nature);
  },
  async all(args = {}) {
    const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const nature = args.nature || 'social';
    const isSocial = resolveNatureChannel(nature).backend === 'social';
    const rows = [];
    const seen = new Set();
    let page = 1;
    let total = Infinity;

    while (rows.length < total && (!max || rows.length < max)) {
      const result = await fetchJobs(args, page, pageSize);
      total = result.total || rows.length;
      if (!result.list.length) break;

      const pageJobs = [];
      for (const job of result.list) {
        const id = job.jdId || job.id;
        const key = `${nature}:${id}`;
        if (!id || seen.has(key)) continue;
        seen.add(key);
        pageJobs.push(job);
        if (max && rows.length + pageJobs.length >= max) break;
      }

      const materialized = isSocial
        ? await enrichJobsWithDetails(pageJobs, args)
        : pageJobs;
      rows.push(...materialized.map(job => normalizeJob(job, nature)));

      if (result.list.length < pageSize || rows.length >= total) break;
      page += 1;
    }

    assertNonEmpty(rows, 'didi all', 'Try fewer filters or inspect filters with `jobs didi filters`.');
    return rows;
  },
};

export default didiAdapter;

import { cli, Strategy } from '@jackwener/opencli/registry';
import {
  COLUMNS,
  DOMAIN,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  enrichJobsWithDetails,
  fetchJobs,
  normalizeJob,
} from './utils.js';

cli({
  site: SITE,
  name: 'all',
  description: 'Export all matching Didi social recruitment jobs with details',
  domain: DOMAIN,
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'query', positional: true, required: false, help: 'Optional search keyword' },
    { name: 'location', default: '', help: 'City name/code, for example 北京, 北京市, Shanghai' },
    { name: 'category', default: '', help: 'Category name/code, for example 产品, 技术, 3' },
    { name: 'nature', default: '', help: 'Recruit type: 社招, 社会招聘, 1' },
    { name: 'page-size', type: 'int', default: MAX_PAGE_SIZE, help: 'Page size for API pagination, max 16' },
    { name: 'max', type: 'int', default: 0, help: 'Maximum jobs to return; 0 means all matching jobs' },
  ],
  columns: COLUMNS,
  func: async (_page, args) => {
    const pageSize = coerceLimit(args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
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
        if (!id || seen.has(id)) continue;
        seen.add(id);
        pageJobs.push(job);
        if (max && rows.length + pageJobs.length >= max) break;
      }

      rows.push(...(await enrichJobsWithDetails(pageJobs)).map(normalizeJob));

      if (result.list.length < pageSize || rows.length >= total) break;
      page += 1;
    }

    assertNonEmpty(rows, `${SITE} all`, 'Try fewer filters or inspect filters with `opencli didi-jobs filters`.');
    return rows;
  },
});

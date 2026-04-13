import { cli, Strategy } from '@jackwener/opencli/registry';
import {
  COLUMNS,
  DOMAIN,
  MAX_PAGE_SIZE,
  SITE,
  assertNonEmpty,
  coerceLimit,
  fetchJobs,
  normalizeJob,
} from './utils.js';

cli({
  site: SITE,
  name: 'all',
  description: 'Export all matching Kuaishou social recruitment jobs',
  domain: DOMAIN,
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'query', positional: true, required: false, help: 'Optional search keyword' },
    { name: 'location', default: '', help: 'City name/code, for example 北京, Beijing, 成都, domestic' },
    { name: 'category', default: '', help: 'Category name/code, for example 算法, 工程, J0011' },
    { name: 'nature', default: '', help: 'Job nature: 全职, 实习, C001, C002' },
    { name: 'page-size', type: 'int', default: MAX_PAGE_SIZE, help: 'Page size for API pagination, max 100' },
    { name: 'max', type: 'int', default: 0, help: 'Maximum jobs to return; 0 means all matching jobs' },
  ],
  columns: COLUMNS,
  func: async (_page, args) => {
    const pageSize = coerceLimit(args['page-size'], MAX_PAGE_SIZE);
    const max = Math.max(0, Number(args.max || 0));
    const rows = [];
    const seen = new Set();
    let pageNum = 1;
    let total = Infinity;

    while (rows.length < total && (!max || rows.length < max)) {
      const result = await fetchJobs(args, pageNum, pageSize);
      total = result.total || rows.length;
      if (!result.list.length) break;

      for (const job of result.list) {
        if (!job.id || seen.has(job.id)) continue;
        seen.add(job.id);
        rows.push(normalizeJob(job));
        if (max && rows.length >= max) break;
      }

      if (result.pageNum >= result.pages || result.list.length < pageSize) break;
      pageNum += 1;
    }

    assertNonEmpty(rows, `${SITE} all`, 'Try fewer filters or inspect filters with `opencli kuaishou-jobs filters`.');
    return rows;
  },
});

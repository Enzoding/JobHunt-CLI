import { cli, Strategy } from '@jackwener/opencli/registry';
import {
  COLUMNS,
  DEFAULT_PAGE_SIZE,
  DOMAIN,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  enrichJobsWithDetails,
  fetchJobs,
  normalizeJob,
} from './utils.js';

cli({
  site: SITE,
  name: 'search',
  description: 'Search Didi social recruitment jobs',
  domain: DOMAIN,
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'query', positional: true, required: false, help: 'Search keyword, for example AI or 产品经理' },
    { name: 'location', default: '', help: 'City name/code, for example 北京, 北京市, Shanghai' },
    { name: 'category', default: '', help: 'Category name/code, for example 产品, 技术, 3' },
    { name: 'nature', default: '', help: 'Recruit type: 社招, 社会招聘, 1' },
    { name: 'page', type: 'int', default: 1, help: 'Page number' },
    { name: 'limit', type: 'int', default: DEFAULT_PAGE_SIZE, help: 'Number of jobs to return, max 16' },
  ],
  columns: COLUMNS,
  func: async (_page, args) => {
    const page = coercePage(args.page);
    const size = coerceLimit(args.limit);
    const result = await fetchJobs(args, page, size);
    const rows = (await enrichJobsWithDetails(result.list.slice(0, size))).map(normalizeJob);
    assertNonEmpty(rows, `${SITE} search`, 'Try a different keyword or inspect filters with `opencli didi-jobs filters`.');
    return rows;
  },
});

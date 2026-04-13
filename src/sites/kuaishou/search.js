import { cli, Strategy } from '@jackwener/opencli/registry';
import {
  COLUMNS,
  DEFAULT_PAGE_SIZE,
  DOMAIN,
  SITE,
  assertNonEmpty,
  coerceLimit,
  coercePage,
  fetchJobs,
  normalizeJob,
} from './utils.js';

cli({
  site: SITE,
  name: 'search',
  description: 'Search Kuaishou social recruitment jobs',
  domain: DOMAIN,
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'query', positional: true, required: false, help: 'Search keyword, for example 算法 or Agent' },
    { name: 'location', default: '', help: 'City name/code, for example 北京, Beijing, 成都, domestic' },
    { name: 'category', default: '', help: 'Category name/code, for example 算法, 工程, J0011' },
    { name: 'nature', default: '', help: 'Job nature: 全职, 实习, C001, C002' },
    { name: 'page', type: 'int', default: 1, help: 'Page number' },
    { name: 'limit', type: 'int', default: DEFAULT_PAGE_SIZE, help: 'Number of jobs to return, max 100' },
  ],
  columns: COLUMNS,
  func: async (_page, args) => {
    const pageNum = coercePage(args.page);
    const pageSize = coerceLimit(args.limit);
    const result = await fetchJobs(args, pageNum, pageSize);
    const rows = result.list.map(normalizeJob);
    assertNonEmpty(rows, `${SITE} search`, 'Try a different keyword or inspect filters with `opencli kuaishou-jobs filters`.');
    return rows;
  },
});

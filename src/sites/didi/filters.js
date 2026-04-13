import { cli, Strategy } from '@jackwener/opencli/registry';
import { DOMAIN, SITE, assertNonEmpty, fetchFilters } from './utils.js';

cli({
  site: SITE,
  name: 'filters',
  description: 'List Didi social recruitment filter codes',
  domain: DOMAIN,
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [],
  columns: ['group', 'parent', 'code', 'name', 'en_name', 'sort_id'],
  func: async () => {
    const rows = await fetchFilters();
    assertNonEmpty(rows, `${SITE} filters`, 'The recruitment filter endpoint returned no data.');
    return rows;
  },
});

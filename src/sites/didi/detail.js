import { cli, Strategy } from '@jackwener/opencli/registry';
import { ArgumentError } from '../../core/errors.js';
import { DETAIL_COLUMNS, DOMAIN, SITE, fetchJobDetail, normalizeJob } from './utils.js';

cli({
  site: SITE,
  name: 'detail',
  description: 'Get one Didi social recruitment job detail',
  domain: DOMAIN,
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'id', positional: true, required: true, help: 'Didi jdId, for example 60517' },
  ],
  columns: DETAIL_COLUMNS,
  func: async (_page, args) => {
    const id = String(args.id || '').trim();
    if (!/^\d+$/.test(id)) {
      throw new ArgumentError('Job id must be numeric', 'Use an id returned by `opencli didi-jobs search`.');
    }
    return [normalizeJob(await fetchJobDetail(id))];
  },
});

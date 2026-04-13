import { cli, Strategy } from '@jackwener/opencli/registry';
import { ArgumentError } from '../../core/errors.js';
import { DETAIL_COLUMNS, DOMAIN, SITE, fetchJobDetail, normalizeJob } from './utils.js';

cli({
  site: SITE,
  name: 'detail',
  description: 'Get one Kuaishou social recruitment job detail',
  domain: DOMAIN,
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'id', positional: true, required: true, help: 'Kuaishou job id, for example 30199' },
  ],
  columns: DETAIL_COLUMNS,
  func: async (_page, args) => {
    const id = String(args.id || '').trim();
    if (!/^\d+$/.test(id)) {
      throw new ArgumentError('Job id must be numeric', 'Use an id returned by `opencli kuaishou-jobs search`.');
    }
    return [normalizeJob(await fetchJobDetail(id))];
  },
});

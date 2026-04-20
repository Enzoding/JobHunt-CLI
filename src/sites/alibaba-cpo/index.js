import { ArgumentError } from '../../core/errors.js';
import {
  ALIBABA_CPO_SITE_CONFIGS,
  COLUMNS,
  DEFAULT_PAGE_SIZE,
  DETAIL_COLUMNS,
  MAX_PAGE_SIZE,
  coerceLimit,
  coercePage,
  fetchFilters,
  fetchJobById,
  fetchJobs,
  normalizeJob,
} from './utils.js';

function createAlibabaCpoAdapter(config) {
  return {
    id: config.id,
    opencliSite: config.opencliSite,
    name: config.name,
    description: config.description,
    columns: COLUMNS,
    detailColumns: DETAIL_COLUMNS,
    maxPageSize: MAX_PAGE_SIZE,
    detailIdField: 'id',
    detailIdHint: `Numeric position id from search results, e.g. 100001386032`,
    async filters() {
      return fetchFilters(config);
    },
    async search(args = {}) {
      const page = coercePage(args.page);
      const limit = coerceLimit(args.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const result = await fetchJobs(config, args, page, limit);
      return result.list.map(job => normalizeJob(config, job));
    },
    async detail(id) {
      const normalizedId = String(id || '').trim();
      if (!normalizedId) throw new ArgumentError('Job id is required', `Use an id returned by \`job ${config.id} search\`.`);
      return normalizeJob(config, await fetchJobById(config, normalizedId));
    },
    async all(args = {}) {
      const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE, MAX_PAGE_SIZE);
      const max = Math.max(0, Number(args.max || 0));
      const rows = [];
      const seen = new Set();
      let page = 1;
      let totalPage = Infinity;

      while (page <= totalPage && (!max || rows.length < max)) {
        const result = await fetchJobs(config, args, page, pageSize);
        totalPage = result.totalPage || page;
        if (!result.list.length) break;

        for (const job of result.list) {
          const normalized = normalizeJob(config, job);
          if (!normalized.id || seen.has(normalized.id)) continue;
          seen.add(normalized.id);
          rows.push(normalized);
          if (max && rows.length >= max) break;
        }

        if (result.list.length < pageSize || page >= totalPage) break;
        page += 1;
      }

      return rows;
    },
  };
}

export const ALIBABA_CPO_ADAPTERS = ALIBABA_CPO_SITE_CONFIGS.map(createAlibabaCpoAdapter);

export const [
  taotianAdapter,
  taobaoShangouAdapter,
  fliggyAdapter,
  alibabaIntlAdapter,
  aliyunAdapter,
  tongyiAdapter,
  dingtalkAdapter,
  quarkAdapter,
  theadAdapter,
  amapAdapter,
  cainiaoAdapter,
  hujingAdapter,
  freshippoAdapter,
  alihealthAdapter,
  lingxiAdapter,
] = ALIBABA_CPO_ADAPTERS;

export default ALIBABA_CPO_ADAPTERS;

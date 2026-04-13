import {
  fetchFilters,
  fetchJobDetail,
  fetchJobs,
  normalizeJob,
} from '../src/sites/didi/utils.js';

const filters = await fetchFilters();
const search = await fetchJobs({ query: 'AI', category: '产品' }, 1, 5);
const first = search.list[0];
const detail = first ? await fetchJobDetail(first.jdId, first) : null;

console.log(JSON.stringify({
  ok: Boolean(filters.length && first && detail),
  filters: filters.length,
  search_total: search.total,
  search_count: search.list.length,
  first: first ? normalizeJob(detail) : null,
}, null, 2));

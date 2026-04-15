import { fetchFilters, fetchJobDetail, fetchJobs, normalizeJob } from '../src/sites/xiaomi/utils.js';

const search = await fetchJobs({ query: '算法' }, 0, 5);
if (!search.list.length) throw new Error('Expected search results for 算法');

const first = normalizeJob(search.list[0]);
if (!first.id || !first.name || !first.url) throw new Error('Search result missing id/name/url');

const detail = normalizeJob(await fetchJobDetail(String(first.id)));
if (!detail.name || !detail.url) throw new Error('Detail missing name or url');

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'city')) {
  throw new Error('Filters missing city rows');
}

const all = await fetchJobs({}, 0, 30);
if (!all.list.length) throw new Error('Expected first all-jobs page');

console.log(JSON.stringify({
  ok: true,
  search_count: search.list.length,
  first_job: { id: first.id, name: first.name, updated_at: first.updated_at },
  filters: filters.length,
  all_page_count: all.list.length,
}, null, 2));

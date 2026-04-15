import { fetchFilters, fetchJobDetail, fetchJobs, normalizeJob } from '../src/sites/meituan/utils.js';

const search = await fetchJobs({ query: '产品经理' }, 1, 5);
if (!search.list.length) throw new Error('Expected search results for 产品经理');

const first = normalizeJob(search.list[0]);
if (!first.id || !first.name || !first.url) throw new Error('Search result missing id/name/url');

const detail = normalizeJob(await fetchJobDetail(String(first.id)));
if (!detail.name || !detail.url) throw new Error('Detail missing name or url');

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'city') || !filters.some(row => row.group === 'category')) {
  throw new Error('Filters missing city or category rows');
}

const all = await fetchJobs({}, 1, 30);
if (!all.list.length) throw new Error('Expected first all-jobs page');

console.log(JSON.stringify({
  ok: true,
  search_total: search.total,
  first_job: { id: first.id, name: first.name, updated_at: first.updated_at },
  filters: filters.length,
  all_page_count: all.list.length,
}, null, 2));

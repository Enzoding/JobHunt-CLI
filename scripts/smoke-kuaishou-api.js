import { fetchFilters, fetchJobDetail, fetchJobs, normalizeJob } from '../src/sites/kuaishou/utils.js';

const search = await fetchJobs({ query: '算法' }, 1, 5);
if (!search.list.length) throw new Error('Expected search results for 算法');

const first = normalizeJob(search.list[0]);
if (!first.id || !first.name || !first.url) throw new Error('Search result missing id/name/url');

const detail = normalizeJob(await fetchJobDetail(String(first.id)));
if (!detail.description || !detail.requirement) throw new Error('Detail missing description or requirement');

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'location') || !filters.some(row => row.group === 'category')) {
  throw new Error('Filters missing location or category rows');
}

const all = await fetchJobs({}, 1, 100);
if (!all.list.length || all.pageSize !== 100) throw new Error('Expected first all-jobs page with pageSize 100');

console.log(JSON.stringify({
  ok: true,
  search_total: search.total,
  first_job: { id: first.id, name: first.name, updated_at: first.updated_at },
  filters: filters.length,
  all_page_count: all.list.length,
}, null, 2));

import { fetchFilters, fetchJobById, fetchJobs, normalizeJob } from '../src/sites/baidu/utils.js';

const search = await fetchJobs({ query: 'AI' }, 1, 10);
if (!search.list.length) throw new Error('Expected Baidu search results for AI');

const first = normalizeJob(search.list[0]);
if (!first.id || !first.name || !first.url) throw new Error('Baidu search result missing id/name/url');

const detail = normalizeJob(await fetchJobById(String(first.id)));
if (!detail.name || !detail.description || !detail.requirement || !detail.url) {
  throw new Error('Baidu detail missing name/description/requirement/url');
}

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'location') || !filters.some(row => row.group === 'category')) {
  throw new Error('Baidu filters missing location or category rows');
}

const all = await fetchJobs({}, 1, 10);
if (!all.list.length) throw new Error('Expected Baidu first all-jobs page');

console.log(JSON.stringify({
  ok: true,
  search_total: search.total,
  first_job: { id: first.id, name: first.name, updated_at: first.updated_at },
  filters: filters.length,
  all_page_count: all.list.length,
}, null, 2));

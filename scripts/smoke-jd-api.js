import { fetchFilters, fetchJobById, fetchJobs, normalizeJob } from '../src/sites/jd/utils.js';

const search = await fetchJobs({ query: 'AI' }, 1, 5);
if (!search.list.length) throw new Error('Expected JD search results for AI');

const first = normalizeJob(search.list[0]);
if (!first.id || !first.name || !first.url) throw new Error('JD search result missing id/name/url');

const detail = normalizeJob(await fetchJobById(String(first.id)));
if (!detail.name || !detail.description || !detail.requirement || !detail.url) {
  throw new Error('JD detail missing name/description/requirement/url');
}

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'location') || !filters.some(row => row.group === 'category')) {
  throw new Error('JD filters missing location or category rows');
}

const all = await fetchJobs({}, 1, 5);
if (!all.list.length) throw new Error('Expected JD first all-jobs page');

console.log(JSON.stringify({
  ok: true,
  search_count: search.list.length,
  first_job: { id: first.id, name: first.name, updated_at: first.updated_at },
  filters: filters.length,
  all_page_count: all.list.length,
}, null, 2));

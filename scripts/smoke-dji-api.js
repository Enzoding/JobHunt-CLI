import { fetchFilters, fetchJobById, fetchJobs, normalizeJob } from '../src/sites/dji/utils.js';

const search = await fetchJobs({ query: '算法' }, 1, 3);
if (!search.list.length) throw new Error('Expected DJI search results for 算法');

const first = normalizeJob(search.list[0]);
if (!first.id || !first.name || !first.url) throw new Error('DJI search result missing id/name/url');

const detail = normalizeJob(await fetchJobById(first.id));
if (!detail.name || !detail.description) throw new Error('DJI detail missing name or description');

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'category')) throw new Error('DJI filters missing category rows');

const all = await fetchJobs({}, 1, 5);
if (!all.list.length) throw new Error('Expected DJI first all-jobs page');

console.log(JSON.stringify({ ok: true, search_count: search.list.length, first_job: { id: first.id, name: first.name }, filters: filters.length, all_page_count: all.list.length }, null, 2));

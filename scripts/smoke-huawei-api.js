import { fetchAllJobs, fetchFilters, fetchJobById, fetchJobs, normalizeJob } from '../src/sites/huawei/utils.js';

const search = await fetchAllJobs({ query: '审计' }, 100);
if (!search.length) throw new Error('Expected Huawei search results for 审计');

const first = normalizeJob(search[0]);
if (!first.id || !first.name || !first.url) throw new Error('Huawei search result missing id/name/url');

const detail = normalizeJob(await fetchJobById(first.id));
if (!detail.name || !detail.description) throw new Error('Huawei detail missing name or description');

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'location')) throw new Error('Huawei filters missing location rows');

const all = await fetchJobs({}, 1, 5);
if (!all.list.length) throw new Error('Expected Huawei first all-jobs page');

console.log(JSON.stringify({ ok: true, search_count: search.length, first_job: { id: first.id, name: first.name }, filters: filters.length, all_page_count: all.list.length }, null, 2));

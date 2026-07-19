import { fetchFilters, fetchJobById, fetchJobs, normalizeJob } from '../src/sites/dji/utils.js';

async function firstHit(nature, query = '') {
  const result = await fetchJobs({ query, nature }, 1, 3);
  return { nature, result };
}

let channel = await firstHit('social', '算法');
if (!channel.result.list.length) {
  channel = await firstHit('intern');
}
if (!channel.result.list.length) {
  channel = await firstHit('social');
}

const { nature, result: search } = channel;
if (!search.list.length) {
  console.log(JSON.stringify({
    ok: true,
    note: 'NO_LIVE_JOBS for social/intern smoke queries',
    nature,
    filters: (await fetchFilters({ nature: 'intern' })).length,
  }, null, 2));
  process.exit(0);
}

const first = normalizeJob(search.list[0], nature);
if (!first.id || !first.name || !first.url) throw new Error('DJI search result missing id/name/url');

const detail = normalizeJob(await fetchJobById(first.id, { nature }), nature);
if (!detail.name || !detail.description) throw new Error('DJI detail missing name or description');

const filters = await fetchFilters({ nature });
if (!filters.some(row => row.group === 'category')) throw new Error('DJI filters missing category rows');

const all = await fetchJobs({ nature }, 1, 5);
if (!all.list.length) throw new Error('Expected DJI first all-jobs page');

console.log(JSON.stringify({
  ok: true,
  nature,
  search_count: search.list.length,
  first_job: { id: first.id, name: first.name },
  filters: filters.length,
  all_page_count: all.list.length,
}, null, 2));

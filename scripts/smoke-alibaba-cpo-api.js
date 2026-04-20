import { ALIBABA_CPO_ADAPTERS } from '../src/sites/alibaba-cpo/index.js';

const results = [];

for (const adapter of ALIBABA_CPO_ADAPTERS) {
  const filters = await adapter.filters();
  if (!filters.length) throw new Error(`${adapter.id} filters returned no rows`);
  if (!filters.some(row => row.group === 'nature')) throw new Error(`${adapter.id} filters missing nature rows`);

  const search = await adapter.search({ limit: 3 });
  const all = await adapter.all({ max: 3 });

  let firstJob = null;
  if (search.length) {
    const first = search[0];
    if (!first.id || !first.name || !first.url) throw new Error(`${adapter.id} search result missing id/name/url`);
    const detail = await adapter.detail(first.id);
    if (!detail.name || !detail.url) throw new Error(`${adapter.id} detail missing name or url`);
    firstJob = { id: first.id, name: first.name };
  }

  results.push({
    site: adapter.id,
    search_count: search.length,
    all_page_count: all.length,
    filters: filters.length,
    first_job: firstJob,
  });
}

console.log(JSON.stringify({ ok: true, sites: results }, null, 2));

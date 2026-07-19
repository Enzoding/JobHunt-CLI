import { listFilters } from '../src/core/registry.js';
import { ALIBABA_CPO_ADAPTERS } from '../src/sites/alibaba-cpo/index.js';

const results = [];

for (const adapter of ALIBABA_CPO_ADAPTERS) {
  const filters = await listFilters(adapter.id, { nature: 'social' });
  if (!filters.length) throw new Error(`${adapter.id} filters returned no rows`);
  if (!filters.some(row => row.group === 'nature' && row.code === 'social')) {
    throw new Error(`${adapter.id} filters missing standard nature rows`);
  }

  const search = await adapter.search({ nature: 'social', limit: 3 });
  const all = await adapter.all({ nature: 'social', max: 3 });

  let firstJob = null;
  if (search.length) {
    const first = search[0];
    if (!first.id || !first.name || !first.url) throw new Error(`${adapter.id} search result missing id/name/url`);
    if (first.nature_code !== 'social') throw new Error(`${adapter.id} expected social nature_code`);
    const detail = await adapter.detail(first.id, { nature: 'social' });
    if (!detail.name || !detail.url) throw new Error(`${adapter.id} detail missing name or url`);
    firstJob = { id: first.id, name: first.name, nature_code: first.nature_code };
  }

  // Campus/intern channels must accept requests even when seasonally empty.
  const campus = await adapter.search({ nature: 'campus', limit: 1 });
  const intern = await adapter.search({ nature: 'intern', limit: 1 });

  results.push({
    site: adapter.id,
    search_count: search.length,
    all_page_count: all.length,
    filters: filters.length,
    campus_count: campus.length,
    intern_count: intern.length,
    first_job: firstJob,
  });
}

console.log(JSON.stringify({ ok: true, sites: results }, null, 2));

import adapter from '../src/sites/didi/index.js';

const natures = ['social', 'campus', 'intern'];
const results = {};

for (const nature of natures) {
  let search;
  try {
    search = await adapter.search({ nature, query: nature === 'social' ? 'AI' : '', limit: 2 });
  } catch {
    search = await adapter.search({ nature, limit: 2 });
  }
  if (!search.length) throw new Error(`Expected Didi ${nature} search results`);
  const first = search[0];
  const detail = await adapter.detail(first.id, { nature });
  const filters = await adapter.filters({ nature });
  results[nature] = {
    search_count: search.length,
    first: { id: first.id, name: first.name, nature_code: first.nature_code },
    detail_ok: Boolean(detail.name),
    filters: filters.length,
  };
}

console.log(JSON.stringify({ ok: true, results }, null, 2));

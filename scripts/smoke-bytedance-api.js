import adapter from '../src/sites/bytedance/index.js';

const natures = ['social', 'campus', 'intern'];
const results = {};

for (const nature of natures) {
  const search = await adapter.search({ nature, limit: 2 }).catch(() => []);
  results[nature] = {
    search_count: search.length,
    first: search[0] ? { id: search[0].id, name: search[0].name, nature_code: search[0].nature_code } : null,
    filters: (await adapter.filters({ nature })).length,
  };
  if (search[0]) {
    const detail = await adapter.detail(search[0].id || search[0].code, { nature });
    results[nature].detail_ok = Boolean(detail.name);
  }
}

console.log(JSON.stringify({ ok: true, results }, null, 2));

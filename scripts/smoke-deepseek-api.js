import adapter from '../src/sites/deepseek/index.js';

async function searchSample() {
  try {
    return await adapter.search({ query: 'AI', limit: 3 });
  } catch {
    return adapter.search({ limit: 3 });
  }
}

const search = await searchSample();
if (!search.length) throw new Error('Expected DeepSeek search results');

const first = search[0];
if (!first.id || !first.name || !first.url) throw new Error('DeepSeek search result missing id/name/url');

const detail = await adapter.detail(first.id);
if (!detail.name || !detail.description) throw new Error('DeepSeek detail missing name or description');

const filters = await adapter.filters();
if (!filters.some(row => row.group === 'category')) throw new Error('DeepSeek filters missing category rows');

const all = await adapter.all({ max: 5 });
if (!all.length) throw new Error('Expected DeepSeek first all-jobs page');

console.log(JSON.stringify({ ok: true, search_count: search.length, first_job: { id: first.id, name: first.name }, filters: filters.length, all_page_count: all.length }, null, 2));

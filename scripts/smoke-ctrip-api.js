import { fetchFilters, fetchJobByCode, fetchJobs, normalizeJob } from '../src/sites/ctrip/utils.js';

const search = await fetchJobs({ query: '算法' }, 1, 3);
if (!search.list.length) throw new Error('Expected Ctrip search results for 算法');

const first = normalizeJob(search.list[0]);
if (!first.code || !first.name || !first.url) throw new Error('Ctrip search result missing code/name/url');

const detail = normalizeJob(await fetchJobByCode(first.code));
if (!detail.name || !detail.description) throw new Error('Ctrip detail missing name or description');

const aiProduct = await fetchJobs({ query: 'AI', category: '产品管理' }, 1, 3);
if (!aiProduct.list.length) throw new Error('Expected Ctrip AI + 产品管理 search results');
const aiProductDetail = normalizeJob(await fetchJobByCode('MJ034429'));
if (!aiProductDetail.requirement) throw new Error('Expected Ctrip detail parser to split requirement text');

const filters = await fetchFilters();
if (!filters.some(row => row.group === 'location')) throw new Error('Ctrip filters missing location rows');
if (!filters.some(row => row.group === 'category' && row.code === 'JFG_41' && row.name === '产品管理')) {
  throw new Error('Ctrip filters missing 产品管理 category row');
}

const all = await fetchJobs({}, 1, 5);
if (!all.list.length) throw new Error('Expected Ctrip first all-jobs page');

console.log(JSON.stringify({
  ok: true,
  search_count: search.list.length,
  first_job: { code: first.code, name: first.name },
  ai_product_count: aiProduct.list.length,
  ai_product_first: normalizeJob(aiProduct.list[0]).name,
  filters: filters.length,
  all_page_count: all.list.length,
}, null, 2));

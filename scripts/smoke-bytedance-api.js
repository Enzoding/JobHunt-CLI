import { fetchJobs, fetchJobById, fetchFilters, normalizeJob } from '../src/sites/bytedance/utils.js';

async function main() {
  console.log('=== ByteDance API Smoke Test ===\n');

  console.log('1. Fetch filters...');
  const filters = await fetchFilters();
  const cities = filters.filter(r => r.group === 'location');
  const categories = filters.filter(r => r.group === 'category');
  console.log(`   ${cities.length} cities, ${categories.length} categories\n`);

  console.log('2. Search jobs (keyword=AI, limit=3)...');
  const result = await fetchJobs({ query: 'AI' }, 0, 3);
  console.log(`   total=${result.total}, returned=${result.list.length}`);
  for (const job of result.list) {
    const n = normalizeJob(job);
    console.log(`   - [${n.code}] ${n.name} (${n.category_name}, ${n.location_names})`);
  }
  console.log();

  if (result.list.length > 0) {
    const code = result.list[0].code;
    console.log(`3. Fetch detail by code=${code}...`);
    const detail = await fetchJobById(code);
    const d = normalizeJob(detail);
    console.log(`   name=${d.name}`);
    console.log(`   description length=${d.description.length}`);
    console.log(`   requirement length=${d.requirement.length}`);
    console.log();
  }

  console.log('=== All checks passed ===');
}

main().catch(err => {
  console.error('Smoke test failed:', err.message);
  process.exitCode = 1;
});

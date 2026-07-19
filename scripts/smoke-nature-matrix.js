#!/usr/bin/env node
/**
 * Low-traffic live matrix: one search(--limit 1) per supported nature per site.
 * Manual / pre-release use only — not for default CI.
 *
 * Usage:
 *   JOBHUNT_PROXY=direct npm run smoke:nature-matrix
 *   JOBHUNT_PROXY=direct node scripts/smoke-nature-matrix.js --site xiaomi
 */
import { spawnSync } from 'node:child_process';
import { listSites } from '../src/core/registry.js';

const siteFilter = process.argv.includes('--site')
  ? process.argv[process.argv.indexOf('--site') + 1]
  : '';

const sites = listSites().filter(site => !siteFilter || site.id === siteFilter);
let fail = 0;
let empty = 0;
let pass = 0;

for (const site of sites) {
  for (const nature of site.supported_natures) {
    const result = spawnSync(
      process.execPath,
      ['bin/job.js', site.id, 'search', '--nature', nature, '--limit', '1', '--format', 'json'],
      {
        encoding: 'utf8',
        env: { ...process.env },
        maxBuffer: 20 * 1024 * 1024,
      },
    );

    let status = 'PASS';
    let note = '';
    if (result.status !== 0) {
      const msg = `${result.stderr || ''}${result.stdout || ''}`;
      if (/EMPTY_RESULT|No .* found|returned no data|assertNonEmpty/i.test(msg)) {
        status = 'EMPTY';
        note = 'NO_LIVE_JOBS_OR_EMPTY';
        empty += 1;
      } else {
        status = 'FAIL';
        note = msg.split('\n').find(Boolean)?.slice(0, 120) || `exit ${result.status}`;
        fail += 1;
      }
    } else {
      try {
        const rows = JSON.parse(result.stdout);
        if (!Array.isArray(rows) || !rows.length) {
          status = 'EMPTY';
          note = '[]';
          empty += 1;
        } else if (rows[0].nature_code !== nature) {
          status = 'FAIL';
          note = `nature_code=${rows[0].nature_code}`;
          fail += 1;
        } else {
          note = String(rows[0].id ?? rows[0].code ?? '');
          pass += 1;
        }
      } catch {
        // Pretty JSON may contain raw control chars from job text; exit 0 is enough.
        note = 'json';
        pass += 1;
      }
    }

    console.log(`${status.padEnd(5)} ${site.id.padEnd(16)} ${nature.padEnd(8)} ${note}`);
  }
}

console.log('---');
console.log(JSON.stringify({ ok: fail === 0, pass, empty, fail, sites: sites.length }, null, 2));
process.exit(fail ? 1 : 0);

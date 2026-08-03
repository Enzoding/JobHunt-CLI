import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareJobs,
  flattenCompareRows,
  mapPool,
  parseSiteIds,
  renderCompareMarkdown,
  resolveCompareConcurrency,
  stripRaw,
} from '../src/core/compare.js';

describe('parseSiteIds', () => {
  it('requires sites and rejects unknowns', () => {
    assert.throws(() => parseSiteIds(''), error => error.code === 'ARGUMENT_ERROR');
    assert.throws(() => parseSiteIds('not-a-real-site'), error => error.code === 'ARGUMENT_ERROR');
  });

  it('dedupes and preserves order for known sites', () => {
    assert.deepEqual(parseSiteIds('meituan, tencent, meituan'), ['meituan', 'tencent']);
  });
});

describe('stripRaw', () => {
  it('removes raw without mutating other fields', () => {
    const job = { id: '1', name: 'AI', description: 'd', raw: { x: 1 } };
    assert.deepEqual(stripRaw(job), { id: '1', name: 'AI', description: 'd' });
    assert.equal(job.raw.x, 1);
  });
});

describe('resolveCompareConcurrency', () => {
  it('defaults to 3 and clamps invalid values', () => {
    assert.equal(resolveCompareConcurrency({}), 3);
    assert.equal(resolveCompareConcurrency({ JOBHUNT_COMPARE_CONCURRENCY: '2' }), 2);
    assert.equal(resolveCompareConcurrency({ JOBHUNT_COMPARE_CONCURRENCY: '0' }), 3);
  });
});

describe('mapPool', () => {
  it('preserves order with limited concurrency', async () => {
    const active = { n: 0, max: 0 };
    const results = await mapPool([1, 2, 3, 4], 2, async value => {
      active.n += 1;
      active.max = Math.max(active.max, active.n);
      await new Promise(r => setTimeout(r, 20));
      active.n -= 1;
      return value * 10;
    });
    assert.deepEqual(results, [10, 20, 30, 40]);
    assert.ok(active.max <= 2);
  });
});

describe('compareJobs', () => {
  it('merges per-site results and records partial failures', async () => {
    const payload = await compareJobs(
      { query: 'AI', sites: 'meituan,tencent', max: 2 },
      {
        env: { JOBHUNT_COMPARE_CONCURRENCY: '2' },
        exportJobsImpl: async siteId => {
          if (siteId === 'tencent') {
            const err = new Error('boom');
            err.code = 'API_ERROR';
            throw err;
          }
          return [
            { id: 'm1', name: 'AI', description: 'd', requirement: 'r', raw: { keep: false } },
          ];
        },
      },
    );

    assert.equal(payload.query, 'AI');
    assert.equal(payload.max_per_site, 2);
    assert.equal(payload.results[0].count, 1);
    assert.equal(payload.results[0].jobs[0].raw, undefined);
    assert.equal(payload.results[1].error.code, 'API_ERROR');
  });

  it('fails when every site errors', async () => {
    await assert.rejects(
      () => compareJobs(
        { sites: 'meituan,tencent' },
        {
          exportJobsImpl: async () => {
            const err = new Error('down');
            err.code = 'NETWORK';
            throw err;
          },
        },
      ),
      error => error.code === 'COMPARE_FAILED',
    );
  });
});

describe('compare render helpers', () => {
  const sample = {
    query: 'AI',
    nature: 'social',
    category: '',
    location: '',
    max_per_site: 30,
    sites: ['meituan', 'tencent'],
    results: [
      {
        site: 'meituan',
        count: 1,
        jobs: [{ id: '1', name: 'AI 工程师', category_name: '技术', location_names: '北京', updated_at: '2026-08-01', url: 'https://example.com/1' }],
        error: null,
      },
      {
        site: 'tencent',
        count: 0,
        jobs: [],
        error: { code: 'API_ERROR', message: 'timeout' },
      },
    ],
  };

  it('flattens rows for table/csv', () => {
    const rows = flattenCompareRows(sample);
    assert.equal(rows[0].site, 'meituan');
    assert.equal(rows[1].name.includes('error'), true);
  });

  it('renders minimal markdown', () => {
    const md = renderCompareMarkdown(sample);
    assert.match(md, /## meituan \(1\)/);
    assert.match(md, /Error: `API_ERROR`/);
  });
});

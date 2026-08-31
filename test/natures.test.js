import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_NATURE,
  DEFAULT_NATURE,
  NATURES,
  buildNatureFilterRows,
  jobDedupeKey,
  mergeFilterRows,
  nextNatureQuota,
  normalizeNature,
  resolveSupportedNatures,
  stampStandardNature,
} from '../src/core/natures.js';
import { aggregateFilters, aggregateJobs } from '../src/core/registry.js';

describe('normalizeNature', () => {
  it('defaults empty input to social', () => {
    assert.equal(normalizeNature(''), DEFAULT_NATURE);
    assert.equal(normalizeNature(undefined), DEFAULT_NATURE);
    assert.equal(normalizeNature(null), DEFAULT_NATURE);
  });

  it('resolves chinese and english aliases', () => {
    assert.equal(normalizeNature('社招'), 'social');
    assert.equal(normalizeNature('校园招聘'), 'campus');
    assert.equal(normalizeNature('春招'), 'campus');
    assert.equal(normalizeNature('internship'), 'intern');
    assert.equal(normalizeNature('全部'), ALL_NATURE);
    assert.equal(normalizeNature('all'), ALL_NATURE);
  });

  it('rejects unknown values before any network call', () => {
    assert.throws(() => normalizeNature('freelance'), error => {
      assert.equal(error.code, 'INVALID_NATURE');
      return true;
    });
  });
});

describe('resolveSupportedNatures', () => {
  const site = { id: 'demo', supportedNatures: ['social', 'campus'], defaultNature: 'social' };

  it('returns single supported nature', () => {
    assert.deepEqual(resolveSupportedNatures(site, 'campus'), ['campus']);
  });

  it('expands all to supported natures in deterministic order', () => {
    assert.deepEqual(resolveSupportedNatures(site, 'all'), ['social', 'campus']);
  });

  it('rejects unsupported nature with help listing supported values', () => {
    assert.throws(() => resolveSupportedNatures(site, 'intern'), error => {
      assert.equal(error.code, 'UNSUPPORTED_NATURE');
      assert.match(error.help, /social, campus/);
      return true;
    });
  });

  it('rejects detail all', () => {
    assert.throws(() => resolveSupportedNatures(site, 'all', { allowAll: false }), error => {
      assert.equal(error.code, 'INVALID_NATURE');
      return true;
    });
  });
});

describe('stampStandardNature and dedupe', () => {
  it('keeps source nature under raw and standardizes output', () => {
    const job = stampStandardNature(
      { id: '1', nature_code: '3', nature_name: '社会招聘', raw: { id: '1' } },
      'social',
    );
    assert.equal(job.nature_code, 'social');
    assert.equal(job.nature_name, '社招');
    assert.equal(job.raw.source_nature_code, '3');
    assert.equal(job.raw.source_nature_name, '社会招聘');
    assert.equal(job.raw.id, '1');
  });

  it('allows same bare id across natures', () => {
    const a = jobDedupeKey({ id: '1', nature_code: 'social' });
    const b = jobDedupeKey({ id: '1', nature_code: 'campus' });
    assert.notEqual(a, b);
  });
});

describe('filter merge and quotas', () => {
  it('dedupes filter rows by applies_to+group+parent+code', () => {
    const merged = mergeFilterRows([
      ['social', [
        { group: 'nature', code: '3', name: 'vendor' },
        { group: 'category', parent: '', code: 'A', name: 'Tech' },
      ]],
      ['campus', [
        { group: 'category', parent: '', code: 'A', name: 'Tech' },
        { group: 'category', parent: '', code: 'B', name: 'Product' },
      ]],
    ]);
    assert.deepEqual(
      merged.map(row => [row.applies_to, row.code]),
      [['social', 'A'], ['campus', 'A'], ['campus', 'B']],
    );
  });

  it('builds standard nature filter rows', () => {
    assert.deepEqual(buildNatureFilterRows(['social', 'intern']).map(r => r.code), ['social', 'intern']);
  });

  it('allocates remaining quota across later natures', () => {
    assert.equal(nextNatureQuota(5, 3), 2);
    assert.equal(nextNatureQuota(3, 2), 2);
    assert.equal(nextNatureQuota(1, 1), 1);
  });
});

function fakeJob(nature, id) {
  return {
    id: String(id),
    name: `${nature}-${id}`,
    nature_code: nature,
    nature_name: nature,
    raw: { source_nature_code: nature, source_nature_name: nature },
  };
}

function createFakeSite({
  id = 'fake',
  supportedNatures = [...NATURES],
  searchCounts = { social: 3, campus: 3, intern: 3 },
  failNature = null,
} = {}) {
  const calls = [];
  return {
    id,
    supportedNatures,
    defaultNature: 'social',
    calls,
    async filters({ nature }) {
      calls.push(['filters', nature]);
      if (failNature === nature) throw new Error(`filters failed for ${nature}`);
      return [
        { group: 'category', parent: '', code: `${nature}-cat`, name: `${nature} cat`, en_name: '', sort_id: '1' },
        { group: 'nature', parent: '', code: 'vendor', name: 'vendor', en_name: '', sort_id: '1' },
      ];
    },
    async search(args = {}) {
      calls.push(['search', args.nature, args.limit]);
      if (failNature === args.nature) throw new Error(`search failed for ${args.nature}`);
      const total = searchCounts[args.nature] || 0;
      const limit = args.limit ?? total;
      return Array.from({ length: Math.min(total, limit) }, (_, i) => fakeJob(args.nature, i + 1));
    },
    async all(args = {}) {
      calls.push(['all', args.nature, args.max]);
      if (failNature === args.nature) throw new Error(`all failed for ${args.nature}`);
      const total = searchCounts[args.nature] || 0;
      const max = args.max && args.max > 0 ? args.max : total;
      return Array.from({ length: Math.min(total, max) }, (_, i) => fakeJob(args.nature, i + 1));
    },
    async detail(id, args = {}) {
      calls.push(['detail', args.nature, id]);
      if (failNature === args.nature) throw new Error(`detail failed for ${args.nature}`);
      return fakeJob(args.nature, id);
    },
  };
}

describe('aggregateJobs', () => {
  it('applies a global max across natures sequentially and redistributes unused quota', async () => {
    const site = createFakeSite({ searchCounts: { social: 1, campus: 5, intern: 5 } });
    const rows = await aggregateJobs(site, ['social', 'campus', 'intern'], { max: 5 }, 'all');
    assert.equal(rows.length, 5);
    assert.deepEqual(rows.map(r => r.nature_code), ['social', 'campus', 'campus', 'intern', 'intern']);
    assert.ok(site.calls.every(call => call[0] === 'all'));
    assert.equal(site.calls.length, 3);
  });

  it('keeps same id from different natures', async () => {
    const site = createFakeSite({ searchCounts: { social: 1, campus: 1, intern: 0 }, supportedNatures: ['social', 'campus'] });
    const rows = await aggregateJobs(site, ['social', 'campus'], { max: 0 }, 'all');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].id, '1');
    assert.equal(rows[1].id, '1');
    assert.notEqual(rows[0].nature_code, rows[1].nature_code);
  });

  it('fails the whole aggregation when one supported channel fails', async () => {
    const site = createFakeSite({ failNature: 'campus' });
    await assert.rejects(() => aggregateJobs(site, ['social', 'campus'], { max: 4 }, 'all'), error => {
      assert.match(error.message, /fake\/campus/);
      return true;
    });
  });
});

describe('aggregateFilters', () => {
  it('adds applies_to and standard nature rows once', async () => {
    const site = createFakeSite({ supportedNatures: ['social', 'intern'] });
    const rows = await aggregateFilters(site, ['social', 'intern']);
    assert.deepEqual(rows.filter(r => r.group === 'nature').map(r => r.code), ['social', 'intern']);
    assert.ok(rows.every(r => r.group !== 'nature' || !r.applies_to));
    assert.ok(rows.some(r => r.applies_to === 'social' && r.code === 'social-cat'));
    assert.ok(rows.some(r => r.applies_to === 'intern' && r.code === 'intern-cat'));
  });
});

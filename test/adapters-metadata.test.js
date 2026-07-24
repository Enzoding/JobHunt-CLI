import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listSites, getSite, getJobDetail } from '../src/core/registry.js';
import { NATURES } from '../src/core/natures.js';

describe('adapter metadata contract', () => {
  const sites = listSites();

  it('exposes 36 sites with supported_natures and default_nature', () => {
    assert.equal(sites.length, 36);
    for (const site of sites) {
      assert.ok(Array.isArray(site.supported_natures), `${site.id} supported_natures`);
      assert.ok(site.supported_natures.length >= 1, `${site.id} has at least one nature`);
      for (const nature of site.supported_natures) {
        assert.ok(NATURES.includes(nature), `${site.id} invalid nature ${nature}`);
      }
      assert.equal(site.default_nature, 'social');
      assert.ok(site.supported_natures.includes('social'), `${site.id} must keep social`);
    }
  });

  it('adapters declare matching runtime metadata and method signatures', () => {
    for (const info of sites) {
      const site = getSite(info.id);
      assert.deepEqual(site.supportedNatures, info.supported_natures);
      assert.equal(site.defaultNature, info.default_nature);
      assert.equal(typeof site.filters, 'function');
      assert.equal(typeof site.search, 'function');
      assert.equal(typeof site.detail, 'function');
      assert.equal(typeof site.all, 'function');
      assert.ok(site.detail.length >= 1);
    }
  });

  it('rejects detail --nature all before network calls', async () => {
    await assert.rejects(() => getJobDetail('xiaomi', '1', { nature: 'all' }), error => {
      assert.equal(error.code, 'INVALID_NATURE');
      return true;
    });
  });
});

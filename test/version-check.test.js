import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  getUpdateCheckCachePath,
  isNewerVersion,
  maybeNotifyUpdate,
  shouldSkipUpdateCheck,
} from '../src/core/version-check.js';

describe('isNewerVersion', () => {
  it('detects newer patch/minor/major', () => {
    assert.equal(isNewerVersion('0.2.3', '0.2.2'), true);
    assert.equal(isNewerVersion('0.3.0', '0.2.9'), true);
    assert.equal(isNewerVersion('1.0.0', '0.9.9'), true);
  });

  it('returns false for equal or older', () => {
    assert.equal(isNewerVersion('0.2.2', '0.2.2'), false);
    assert.equal(isNewerVersion('0.2.1', '0.2.2'), false);
  });
});

describe('shouldSkipUpdateCheck', () => {
  it('skips help/version/update and env/flag opt-outs', () => {
    assert.equal(shouldSkipUpdateCheck(['node', 'job', '--help'], {}), true);
    assert.equal(shouldSkipUpdateCheck(['node', 'job', '-V'], {}), true);
    assert.equal(shouldSkipUpdateCheck(['node', 'job', 'update'], {}), true);
    assert.equal(shouldSkipUpdateCheck(['node', 'job', 'sites'], { updateCheck: false }), true);
    assert.equal(shouldSkipUpdateCheck(['node', 'job', 'sites'], {}, { JOBHUNT_NO_UPDATE_CHECK: '1' }), true);
  });

  it('runs for normal commands', () => {
    assert.equal(shouldSkipUpdateCheck(['node', 'job', 'sites'], { updateCheck: true }, {}), false);
  });
});

describe('maybeNotifyUpdate', () => {
  it('uses cache within TTL and prints tip to stderr when newer', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jobhunt-update-'));
    const cachePath = path.join(dir, 'update-check.json');
    const now = Date.UTC(2026, 7, 3, 12, 0, 0);
    fs.writeFileSync(cachePath, JSON.stringify({
      checkedAt: new Date(now - 60_000).toISOString(),
      latestVersion: '9.9.9',
    }));

    let fetchCalls = 0;
    const chunks = [];
    const originalWrite = process.stderr.write;
    process.stderr.write = (chunk, ...rest) => {
      chunks.push(String(chunk));
      return originalWrite.call(process.stderr, chunk, ...rest);
    };

    try {
      const result = await maybeNotifyUpdate({
        argv: ['node', 'job', 'sites'],
        opts: { updateCheck: true },
        env: {},
        now,
        cachePath,
        current: '0.2.2',
        fetchImpl: async () => {
          fetchCalls += 1;
          throw new Error('should not fetch');
        },
      });
      assert.equal(result.updateAvailable, true);
      assert.equal(fetchCalls, 0);
      assert.match(chunks.join(''), /tip: jobhunt-cli 9\.9\.9/);
    } finally {
      process.stderr.write = originalWrite;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fetches registry when cache is stale', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jobhunt-update-'));
    const cachePath = path.join(dir, 'update-check.json');
    const now = Date.UTC(2026, 7, 3, 12, 0, 0);
    fs.writeFileSync(cachePath, JSON.stringify({
      checkedAt: new Date(now - 25 * 60 * 60 * 1000).toISOString(),
      latestVersion: '0.1.0',
    }));

    const result = await maybeNotifyUpdate({
      argv: ['node', 'job', 'sites'],
      opts: { updateCheck: true },
      env: {},
      now,
      cachePath,
      current: '0.2.2',
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return { version: '0.2.2' };
        },
      }),
    });

    assert.equal(result.updateAvailable, false);
    const saved = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    assert.equal(saved.latestVersion, '0.2.2');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('getUpdateCheckCachePath', () => {
  it('respects XDG_CACHE_HOME', () => {
    const p = getUpdateCheckCachePath({ XDG_CACHE_HOME: '/tmp/xdg-cache' }, '/home/me');
    assert.equal(p, path.join('/tmp/xdg-cache', 'jobhunt-cli', 'update-check.json'));
  });
});

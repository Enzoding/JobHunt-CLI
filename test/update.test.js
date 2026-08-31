import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  isGlobalInstall,
  parseNpmLsGlobalVersion,
  safeNpmInstallSpec,
} from '../src/core/update.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = path.join(root, 'bin/job.js');
const identity = p => p;

describe('isGlobalInstall', () => {
  it('treats a resolved path under npm global root as global', () => {
    assert.equal(isGlobalInstall({
      binPath: '/opt/homebrew/lib/node_modules/jobhunt-cli/bin/job.js',
      cwd: '/tmp/proj',
      globalRoot: '/opt/homebrew/lib/node_modules',
      realpath: identity,
    }), true);
  });

  it('resolves a Homebrew / nvm bin shim via realpath then matches global root', () => {
    const realpath = p => (
      p === '/opt/homebrew/bin/jobhunt-cli'
        ? '/opt/homebrew/lib/node_modules/jobhunt-cli/bin/job.js'
        : p
    );
    assert.equal(isGlobalInstall({
      binPath: '/opt/homebrew/bin/jobhunt-cli',
      cwd: '/Users/me/hire_cli',
      globalRoot: '/opt/homebrew/lib/node_modules',
      realpath,
    }), true);
  });

  it('treats a source checkout as local even when npm global root is known', () => {
    assert.equal(isGlobalInstall({
      binPath: '/Users/me/hire_cli/bin/job.js',
      cwd: '/Users/me/hire_cli',
      globalRoot: '/opt/homebrew/lib/node_modules',
      realpath: identity,
    }), false);
  });

  it('treats a local node_modules bin as local', () => {
    assert.equal(isGlobalInstall({
      binPath: '/Users/me/hire_cli/node_modules/.bin/job',
      cwd: '/Users/me/hire_cli',
      globalRoot: '/opt/homebrew/lib/node_modules',
      realpath: () => '/Users/me/hire_cli/node_modules/jobhunt-cli/bin/job.js',
    }), false);
  });

  it('falls back to node_modules-outside-cwd when globalRoot is missing', () => {
    assert.equal(isGlobalInstall({
      binPath: '/Users/x/.nvm/versions/node/v22.0.0/lib/node_modules/jobhunt-cli/bin/job.js',
      cwd: '/tmp/proj',
      globalRoot: null,
      realpath: identity,
    }), true);
  });

  it('does not treat an unresolvable shim as global (realpath throws, path not under root)', () => {
    assert.equal(isGlobalInstall({
      binPath: '/opt/homebrew/bin/jobhunt-cli',
      cwd: '/tmp',
      globalRoot: '/opt/homebrew/lib/node_modules',
      realpath: () => {
        throw new Error('ENOENT');
      },
    }), false);
  });
});

describe('parseNpmLsGlobalVersion', () => {
  it('reads the package version from npm ls JSON', () => {
    const stdout = JSON.stringify({
      dependencies: { 'jobhunt-cli': { version: '0.2.6' } },
    });
    assert.equal(parseNpmLsGlobalVersion(stdout), '0.2.6');
  });

  it('still parses when npm ls exits non-zero but printed JSON (peer/extraneous)', () => {
    const stdout = `${JSON.stringify({
      error: { code: 'ELSPROBLEMS' },
      dependencies: { 'jobhunt-cli': { version: '0.2.5' } },
    })}\n`;
    assert.equal(parseNpmLsGlobalVersion(stdout), '0.2.5');
  });

  it('returns null for empty, invalid, or missing package JSON', () => {
    assert.equal(parseNpmLsGlobalVersion(''), null);
    assert.equal(parseNpmLsGlobalVersion(null), null);
    assert.equal(parseNpmLsGlobalVersion('not-json'), null);
    assert.equal(parseNpmLsGlobalVersion(JSON.stringify({ dependencies: {} })), null);
  });
});

describe('safeNpmInstallSpec', () => {
  it('accepts plain semver and latest', () => {
    assert.equal(safeNpmInstallSpec('0.2.6'), '0.2.6');
    assert.equal(safeNpmInstallSpec('0.2.6-beta.0'), '0.2.6-beta.0');
    assert.equal(safeNpmInstallSpec('latest'), 'latest');
  });

  it('rejects shell fragments and unknown values', () => {
    assert.equal(safeNpmInstallSpec('0.2.6; rm -rf /'), 'latest');
    assert.equal(safeNpmInstallSpec('$(reboot)'), 'latest');
    assert.equal(safeNpmInstallSpec(''), 'latest');
    assert.equal(safeNpmInstallSpec(null), 'latest');
  });
});

describe('job update CLI', () => {
  function runJob(args) {
    return spawnSync(process.execPath, [bin, ...args], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        JOBHUNT_NO_UPDATE_CHECK: '1',
        JOBHUNT_PROXY: 'direct',
      },
    });
  }

  it('documents --dry-run in help', () => {
    const result = runJob(['update', '--help']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /--dry-run/);
  });

  it('skips global install from a source checkout and does not print a fake success', () => {
    const result = runJob(['update', '--dry-run', '--cli-only']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /dev\/local mode/);
    assert.match(result.stdout, /Dry-run complete/);
    assert.equal(result.stdout.includes('✓'), false);
    assert.equal(result.stdout.includes('CLI updated'), false);
  });
});

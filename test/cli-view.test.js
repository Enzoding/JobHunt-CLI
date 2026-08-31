import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = path.join(root, 'bin/job.js');

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

describe('CLI view and summary-only contracts', () => {
  it('rejects an unknown view before fetching jobs', () => {
    const result = runJob(['meituan', 'search', 'AI', '--view', 'preview', '--format', 'json']);
    assert.equal(result.status, 64);
    assert.match(result.stderr, /ARGUMENT_ERROR|Unsupported view/);
    assert.match(result.stderr, /compact, full, debug|compact\|full\|debug/);
    assert.equal(result.stdout.includes('"description"'), false);
  });

  it('rejects --view with a non-JSON format', () => {
    const result = runJob(['meituan', 'search', 'AI', '--view', 'compact', '--format', 'csv']);
    assert.equal(result.status, 64);
    assert.match(result.stderr, /--format json/);
  });

  it('rejects --summary-only with markdown', () => {
    const result = runJob(['meituan', 'analyze', 'AI', '--summary-only', '--format', 'md']);
    assert.equal(result.status, 64);
    assert.match(result.stderr, /--summary-only|--format json/);
  });

  it('documents view and summary-only in help', () => {
    const search = runJob(['meituan', 'search', '--help']);
    const analyze = runJob(['meituan', 'analyze', '--help']);
    assert.equal(search.status, 0);
    assert.match(search.stdout, /--view/);
    assert.match(search.stdout, /compact\|full\|debug/);
    assert.equal(analyze.status, 0);
    assert.match(analyze.stdout, /--summary-only/);
  });
});

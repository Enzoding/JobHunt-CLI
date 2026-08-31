import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ensureOutputContract, selectAnalyzeJson } from '../src/core/output-contract.js';
import { createAnalyzeResult } from './fixtures/token/jobs.js';

describe('ensureOutputContract', () => {
  it('allows legacy options without view', () => {
    assert.deepEqual(ensureOutputContract({ format: 'table' }), {
      format: 'table',
      view: undefined,
      summaryOnly: false,
    });
    assert.deepEqual(ensureOutputContract({ format: 'json' }), {
      format: 'json',
      view: undefined,
      summaryOnly: false,
    });
  });

  it('normalizes view case for JSON', () => {
    assert.equal(ensureOutputContract({ format: 'JSON', view: 'Compact' }).view, 'compact');
  });

  it('rejects view with non-JSON formats', () => {
    for (const format of ['table', 'csv', 'md', 'markdown']) {
      assert.throws(() => ensureOutputContract({ format, view: 'compact' }), error => {
        assert.equal(error.name, 'ArgumentError');
        assert.equal(error.exitCode, 64);
        assert.match(error.help, /--format json/);
        return true;
      });
    }
  });

  it('rejects summary-only with non-JSON formats', () => {
    assert.throws(() => ensureOutputContract({ format: 'md', summaryOnly: true }), error => {
      assert.equal(error.name, 'ArgumentError');
      assert.match(error.help, /--summary-only|--format json/);
      return true;
    });
  });

  it('rejects unknown views', () => {
    assert.throws(() => ensureOutputContract({ format: 'json', view: 'tiny' }), error => {
      assert.equal(error.code, 'ARGUMENT_ERROR');
      assert.match(error.help, /compact, full, debug/);
      return true;
    });
  });
});

describe('selectAnalyzeJson', () => {
  it('keeps summary deep-equal and drops jobs only when requested', () => {
    const result = createAnalyzeResult();
    const legacy = selectAnalyzeJson(result, { summaryOnly: false });
    const summaryOnly = selectAnalyzeJson(result, { summaryOnly: true });
    assert.deepEqual(legacy.summary, result.summary);
    assert.equal(legacy.jobs, result.rows);
    assert.deepEqual(summaryOnly, { summary: result.summary });
    assert.deepEqual(summaryOnly.summary, legacy.summary);
    assert.equal(Object.hasOwn(summaryOnly, 'jobs'), false);
  });
});

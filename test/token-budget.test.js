import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatJson } from '../src/core/formatters.js';
import { selectAnalyzeJson } from '../src/core/output-contract.js';
import { jobIdentity, projectCompare, projectJobs } from '../src/core/projection.js';
import { evaluateCommandBudgets } from '../scripts/token-metrics.js';
import { evaluateWorkflowBudgets } from '../scripts/workflow-metrics.js';
import {
  createAnalyzeResult,
  createComparePayload,
  searchFixtureGroups,
} from './fixtures/token/jobs.js';

describe('semantic invariants before token gates', () => {
  it('keeps search identities and order across views', () => {
    for (const jobs of Object.values(searchFixtureGroups())) {
      const identities = jobs.map(jobIdentity);
      for (const view of ['compact', 'full', 'debug']) {
        assert.deepEqual(
          projectJobs(jobs, view, { detailIdField: 'id' }).map(jobIdentity),
          identities,
        );
      }
    }
  });

  it('keeps compare container fields and failed-site errors', () => {
    const payload = createComparePayload();
    const compact = projectCompare(payload, 'compact', { resolveDetailIdField: () => 'id' });
    assert.deepEqual(compact.query, payload.query);
    assert.deepEqual(compact.sites, payload.sites);
    assert.equal(compact.results.length, payload.results.length);
    assert.equal(compact.results[0].count, payload.results[0].count);
    assert.equal(compact.results[2].error.code, payload.results[2].error.code);
  });

  it('keeps analyze summary deep-equal when dropping jobs', () => {
    const result = createAnalyzeResult();
    const legacy = selectAnalyzeJson(result);
    const summaryOnly = selectAnalyzeJson(result, { summaryOnly: true });
    assert.deepEqual(summaryOnly.summary, legacy.summary);
    assert.notEqual(formatJson(legacy), formatJson(summaryOnly));
  });
});

describe('command token budgets', () => {
  it('meets command-level thresholds with the locked tokenizer', () => {
    const { reports, gates } = evaluateCommandBudgets();
    assert.ok(reports.length > 0, 'expected command benchmark rows');
    const failed = gates.filter(gate => !gate.pass);
    assert.deepEqual(failed.map(gate => gate.name), [], `failed gates: ${JSON.stringify(failed)}`);
  });
});

describe('workflow and skill token budgets', () => {
  it('meets workflow P50, no-regression, and skill entry thresholds', () => {
    const { reports, gates, roleRequirements } = evaluateWorkflowBudgets();
    assert.equal(reports.length, 5);
    assert.equal(roleRequirements.cliCalls, 4);
    assert.equal(roleRequirements.fullJdCount, 3);
    const failed = gates.filter(gate => !gate.pass);
    assert.deepEqual(failed.map(gate => gate.name), [], `failed gates: ${JSON.stringify(failed)}`);
  });
});

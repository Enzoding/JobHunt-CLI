import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COMPACT_FIELDS,
  jobIdentity,
  normalizeView,
  projectCompare,
  projectJob,
  projectJobs,
  resolveDetailId,
} from '../src/core/projection.js';
import {
  createComparePayload,
  createDetailIdJobs,
  createEmptyFieldJob,
  createJob,
  createLongZhJobs,
  createNestedRawJob,
} from './fixtures/token/jobs.js';

describe('normalizeView', () => {
  it('normalizes case and treats empty as legacy', () => {
    assert.equal(normalizeView('Compact'), 'compact');
    assert.equal(normalizeView('FULL'), 'full');
    assert.equal(normalizeView('Debug'), 'debug');
    assert.equal(normalizeView(undefined), undefined);
    assert.equal(normalizeView(''), undefined);
  });

  it('rejects unknown views with argument error', () => {
    assert.throws(() => normalizeView('preview'), error => {
      assert.equal(error.name, 'ArgumentError');
      assert.equal(error.code, 'ARGUMENT_ERROR');
      assert.equal(error.exitCode, 64);
      assert.match(error.help, /compact, full, debug/);
      return true;
    });
  });
});

describe('resolveDetailId', () => {
  const samples = createDetailIdJobs();

  it('uses id, code, or falls back to id', () => {
    assert.equal(resolveDetailId(samples.usesId, 'id'), 'mt-1001');
    assert.equal(resolveDetailId(samples.usesCode, 'code'), 'A57861');
    assert.equal(resolveDetailId(samples.missingCode, 'code'), 'fallback-22');
    assert.equal(resolveDetailId(samples.missingBoth, 'code'), '');
  });
});

describe('projectJob', () => {
  it('keeps compact field order and required keys', () => {
    const job = createJob({
      id: 'keep-1',
      name: '测试岗位',
      category_name: '技术类',
      nature_code: 'social',
      location_names: '北京',
      department_name: '人工智能部',
      updated_at: '2026-06-01',
      url: 'https://jobs.example.test/roles/keep-1',
    });
    const compact = projectJob(job, 'compact', { detailIdField: 'id' });
    assert.deepEqual(Object.keys(compact), COMPACT_FIELDS);
    assert.equal(compact.detail_id, 'keep-1');
    assert.equal(compact.description, undefined);
    assert.equal(compact.requirement, undefined);
    assert.equal(compact.raw, undefined);
  });

  it('omits empty optional compact fields', () => {
    const compact = projectJob(createEmptyFieldJob(), 'compact', { detailIdField: 'id' });
    assert.deepEqual(Object.keys(compact), ['id', 'detail_id', 'name', 'nature_code']);
    assert.equal(compact.category_name, undefined);
    assert.equal(compact.location_names, undefined);
    assert.equal(compact.department_name, undefined);
    assert.equal(compact.updated_at, undefined);
    assert.equal(compact.url, undefined);
  });

  it('uses code as detail_id when the adapter asks for code', () => {
    const { usesCode, missingCode } = createDetailIdJobs();
    assert.equal(projectJob(usesCode, 'compact', { detailIdField: 'code' }).detail_id, 'A57861');
    assert.equal(projectJob(missingCode, 'compact', { detailIdField: 'code' }).detail_id, 'fallback-22');
  });

  it('full drops only top-level raw and debug keeps it', () => {
    const job = createNestedRawJob();
    const full = projectJob(job, 'full');
    const debug = projectJob(job, 'debug');
    assert.equal(full.raw, undefined);
    assert.equal(full.description, job.description);
    assert.deepEqual(debug.raw, job.raw);
    assert.equal(debug.name, job.name);
  });

  it('does not mutate the input job or nested raw', () => {
    const job = createNestedRawJob();
    const before = structuredClone(job);
    projectJob(job, 'compact', { detailIdField: 'id' });
    projectJob(job, 'full');
    const debug = projectJob(job, 'debug');
    debug.raw.nested.flags.push('mutated');
    assert.deepEqual(job, before);
    assert.equal(job.raw.nested.flags.includes('mutated'), false);
  });

  it('legacy view is identity', () => {
    const job = createJob({ id: 'legacy-1' });
    assert.equal(projectJob(job, undefined), job);
  });
});

describe('projectJobs and projectCompare', () => {
  it('preserves array identity order', () => {
    const jobs = createLongZhJobs();
    const compact = projectJobs(jobs, 'compact', { detailIdField: 'id' });
    assert.deepEqual(compact.map(jobIdentity), jobs.map(jobIdentity));
  });

  it('projects successful compare sites and keeps failed site errors', () => {
    const payload = createComparePayload();
    const snapshot = structuredClone(payload);
    const projected = projectCompare(payload, 'compact', {
      resolveDetailIdField: siteId => (siteId === 'xiaomi' ? 'id' : 'id'),
    });

    assert.deepEqual(Object.keys(projected).sort(), Object.keys(payload).sort());
    assert.deepEqual(projected.sites, payload.sites);
    assert.equal(projected.results[0].count, payload.results[0].jobs.length);
    assert.deepEqual(
      projected.results[0].jobs.map(jobIdentity),
      payload.results[0].jobs.map(jobIdentity),
    );
    assert.equal(projected.results[0].jobs[0].description, undefined);
    assert.equal(projected.results[2].error.code, 'API_ERROR');
    assert.deepEqual(projected.results[2].jobs, []);
    assert.deepEqual(payload, snapshot);
  });

  it('compare debug stays within the current no-raw contract', () => {
    const payload = createComparePayload();
    const debug = projectCompare(payload, 'debug', { resolveDetailIdField: () => 'id' });
    assert.equal(debug.results[0].jobs[0].raw, undefined);
    assert.equal(debug.results[0].jobs[0].description, payload.results[0].jobs[0].description);
    assert.equal(debug.results[2].error.code, 'API_ERROR');
  });
});

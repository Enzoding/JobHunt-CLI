import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectAnalyzeJson } from '../src/core/output-contract.js';
import { projectCompare, projectJob, projectJobs } from '../src/core/projection.js';
import { formatJson } from '../src/core/formatters.js';
import {
  SKILL_ENTRY_MAX_BYTES,
  SKILL_ENTRY_REDUCTION,
  WORKFLOW_MAX_INCREASE,
  WORKFLOW_P50_REDUCTION,
  measureText,
  reductionRate,
} from './token-metrics.js';
import {
  createAnalyzeResult,
  createComparePayload,
  createLongZhJobs,
} from '../test/fixtures/token/jobs.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_SKILL_PATH = path.join(ROOT, 'test/fixtures/token/skill-entry-legacy.md');
const CURRENT_SKILL_PATH = path.join(ROOT, 'skills/jobhunt-cli/SKILL.md');

function readRequired(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} missing: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function sumParts(parts) {
  return parts.reduce((total, part) => {
    const measured = typeof part === 'string' ? measureText(part) : measureText(part.text);
    return {
      bytes: total.bytes + measured.bytes,
      chars: total.chars + measured.chars,
      tokens: total.tokens + measured.tokens,
    };
  }, { bytes: 0, chars: 0, tokens: 0 });
}

function workflowReport(workflow, legacyParts, candidateParts, extra = {}) {
  const legacy = sumParts(legacyParts);
  const candidate = sumParts(candidateParts);
  const reduction = reductionRate(legacy.tokens, candidate.tokens);
  const increased = candidate.tokens > legacy.tokens
    ? (candidate.tokens - legacy.tokens) / legacy.tokens
    : 0;
  return {
    workflow,
    legacy,
    candidate,
    tokenDelta: candidate.tokens - legacy.tokens,
    reduction,
    increased,
    pass: increased <= WORKFLOW_MAX_INCREASE + Number.EPSILON,
    ...extra,
  };
}

export function loadSkillTexts() {
  return {
    legacy: readRequired(LEGACY_SKILL_PATH, 'legacy skill fixture'),
    current: readRequired(CURRENT_SKILL_PATH, 'current skill entry'),
  };
}

export function evaluateWorkflowBudgets() {
  const skill = loadSkillTexts();
  const jobs = createLongZhJobs();
  const compactJobs = projectJobs(jobs, 'compact', { detailIdField: 'id' });
  const shortlist = jobs.slice(0, 3);
  const detailFull = shortlist.map(job => projectJob(job, 'full', { detailIdField: 'id' }));
  const compare = createComparePayload();
  const compareCompact = projectCompare(compare, 'compact', {
    resolveDetailIdField: () => 'id',
  });
  const analyze = createAnalyzeResult();

  const reports = [
    workflowReport(
      'list-jobs',
      [skill.legacy, formatJson(jobs)],
      [skill.current, formatJson(compactJobs)],
      { cliCalls: 1, fullJdCount: 0 },
    ),
    workflowReport(
      'compare-companies',
      [skill.legacy, formatJson(compare)],
      [skill.current, formatJson(compareCompact)],
      { cliCalls: 1, fullJdCount: 0 },
    ),
    workflowReport(
      'role-requirements',
      [skill.legacy, formatJson(jobs)],
      [skill.current, formatJson(compactJobs), ...detailFull.map(job => formatJson(job))],
      { cliCalls: 1 + detailFull.length, fullJdCount: detailFull.length },
    ),
    workflowReport(
      'hiring-trends',
      [skill.legacy, formatJson(selectAnalyzeJson(analyze, { summaryOnly: false }))],
      [skill.current, formatJson(selectAnalyzeJson(analyze, { summaryOnly: true }))],
      { cliCalls: 1, fullJdCount: 0 },
    ),
    workflowReport(
      'file-export',
      [skill.legacy, formatJson(projectJobs(jobs, 'full', { detailIdField: 'id' }))],
      [skill.current],
      { cliCalls: 1, fullJdCount: jobs.length, stdoutJobs: 0 },
    ),
  ];

  const reductions = [...reports].map(row => row.reduction).sort((a, b) => a - b);
  const p50 = reductions[Math.floor((reductions.length - 1) / 2)];
  const skillLegacy = measureText(skill.legacy);
  const skillCurrent = measureText(skill.current);
  const skillReduction = reductionRate(skillLegacy.tokens, skillCurrent.tokens);

  const gates = [
    {
      name: 'workflow-p50-reduction',
      value: p50,
      threshold: WORKFLOW_P50_REDUCTION,
      pass: p50 + Number.EPSILON >= WORKFLOW_P50_REDUCTION,
    },
    {
      name: 'workflow-no-regression',
      value: Math.max(...reports.map(row => row.increased)),
      threshold: WORKFLOW_MAX_INCREASE,
      pass: reports.every(row => row.pass),
    },
    {
      name: 'skill-entry-token-reduction',
      value: skillReduction,
      threshold: SKILL_ENTRY_REDUCTION,
      pass: skillReduction + Number.EPSILON >= SKILL_ENTRY_REDUCTION,
    },
    {
      name: 'skill-entry-bytes',
      value: skillCurrent.bytes,
      threshold: SKILL_ENTRY_MAX_BYTES,
      pass: skillCurrent.bytes <= SKILL_ENTRY_MAX_BYTES,
    },
  ];

  return {
    reports,
    gates,
    skill: {
      legacy: skillLegacy,
      current: skillCurrent,
      reduction: skillReduction,
    },
    roleRequirements: reports.find(row => row.workflow === 'role-requirements'),
  };
}

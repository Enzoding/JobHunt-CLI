import { createRequire } from 'node:module';
import { encode } from 'gpt-tokenizer/encoding/o200k_base';
import { formatJson } from '../src/core/formatters.js';
import { selectAnalyzeJson } from '../src/core/output-contract.js';
import { projectCompare, projectJobs } from '../src/core/projection.js';
import {
  SEARCH_FIXTURE_WEIGHTS,
  createAnalyzeResult,
  createComparePayload,
  searchFixtureGroups,
} from '../test/fixtures/token/jobs.js';

const require = createRequire(import.meta.url);
const tokenizerPkg = require('gpt-tokenizer/package.json');

export const TOKENIZER_NAME = 'o200k_base';
export const TOKENIZER_PACKAGE = 'gpt-tokenizer';
export const TOKENIZER_VERSION = tokenizerPkg.version;

export const COMMAND_THRESHOLDS = {
  'search-compact': 0.75,
  'all-compact': 0.75,
  'compare-compact': 0.75,
  'analyze-summary-only': 0.85,
};

export const WORKFLOW_P50_REDUCTION = 0.60;
export const WORKFLOW_MAX_INCREASE = 0.10;
export const SKILL_ENTRY_REDUCTION = 0.50;
export const SKILL_ENTRY_MAX_BYTES = 5 * 1024;

export function measureText(text) {
  if (typeof text !== 'string') {
    throw new Error('tokenizer input must be a string');
  }
  return {
    bytes: Buffer.byteLength(text, 'utf8'),
    chars: text.length,
    tokens: encode(text).length,
  };
}

export function measureJson(value) {
  return measureText(formatJson(value));
}

export function reductionRate(legacyTokens, candidateTokens) {
  if (!legacyTokens) return 0;
  return (legacyTokens - candidateTokens) / legacyTokens;
}

export function weightedAverage(rows, getValue, getWeight) {
  let weighted = 0;
  let weightSum = 0;
  for (const row of rows) {
    const weight = getWeight(row);
    weighted += getValue(row) * weight;
    weightSum += weight;
  }
  return weightSum ? weighted / weightSum : 0;
}

function compareScenario(name, fixture, legacy, candidate, threshold, extra = {}) {
  const legacyM = measureJson(legacy);
  const candidateM = measureJson(candidate);
  const reduction = reductionRate(legacyM.tokens, candidateM.tokens);
  const pass = threshold === null
    ? candidateM.tokens <= legacyM.tokens
    : reduction + Number.EPSILON >= threshold && candidateM.tokens <= legacyM.tokens;
  return {
    scenario: name,
    fixture,
    legacy: legacyM,
    candidate: candidateM,
    tokenDelta: candidateM.tokens - legacyM.tokens,
    reduction,
    threshold,
    pass,
    ...extra,
  };
}

export function commandScenarios() {
  const groups = searchFixtureGroups();
  const searchRows = Object.entries(groups).map(([fixture, jobs]) => {
    const compact = projectJobs(jobs, 'compact', { detailIdField: 'id' });
    const row = compareScenario(
      'search-compact',
      fixture,
      jobs,
      compact,
      null,
    );
    row.pass = row.candidate.tokens <= row.legacy.tokens;
    return { ...row, weight: SEARCH_FIXTURE_WEIGHTS[fixture] };
  });

  const allRows = searchRows.map(row => ({
    ...row,
    scenario: 'all-compact',
  }));

  const comparePayload = createComparePayload();
  const compareCompact = projectCompare(comparePayload, 'compact', {
    resolveDetailIdField: siteId => (siteId === 'bytedance' || siteId === 'ctrip' ? 'code' : 'id'),
  });
  const compareRow = compareScenario(
    'compare-compact',
    'compare-partial',
    comparePayload,
    compareCompact,
    COMMAND_THRESHOLDS['compare-compact'],
  );

  const analyze = createAnalyzeResult();
  const analyzeLegacy = selectAnalyzeJson(analyze, { summaryOnly: false });
  const analyzeSummary = selectAnalyzeJson(analyze, { summaryOnly: true });
  const analyzeRow = compareScenario(
    'analyze-summary-only',
    'analyze-result',
    analyzeLegacy,
    analyzeSummary,
    COMMAND_THRESHOLDS['analyze-summary-only'],
  );

  const longJobs = groups['jobs-long-zh'];
  const fullRow = compareScenario(
    'search-full',
    'jobs-long-zh',
    longJobs,
    projectJobs(longJobs, 'full', { detailIdField: 'id' }),
    null,
  );
  const debugRow = compareScenario(
    'search-debug',
    'jobs-long-zh',
    longJobs,
    projectJobs(longJobs, 'debug', { detailIdField: 'id' }),
    null,
  );
  debugRow.pass = debugRow.candidate.tokens === debugRow.legacy.tokens;

  return {
    searchRows,
    allRows,
    compareRow,
    analyzeRow,
    fullRow,
    debugRow,
  };
}

export function evaluateCommandBudgets() {
  const { searchRows, allRows, compareRow, analyzeRow, fullRow, debugRow } = commandScenarios();
  const searchReduction = weightedAverage(searchRows, row => row.reduction, row => row.weight);
  const allReduction = weightedAverage(allRows, row => row.reduction, row => row.weight);

  const reports = [
    ...searchRows,
    ...allRows,
    compareRow,
    analyzeRow,
    fullRow,
    debugRow,
  ];

  const gates = [
    {
      name: 'search-compact-weighted',
      reduction: searchReduction,
      threshold: COMMAND_THRESHOLDS['search-compact'],
      pass: searchReduction + Number.EPSILON >= COMMAND_THRESHOLDS['search-compact']
        && searchRows.every(row => row.candidate.tokens <= row.legacy.tokens),
    },
    {
      name: 'all-compact-weighted',
      reduction: allReduction,
      threshold: COMMAND_THRESHOLDS['all-compact'],
      pass: allReduction + Number.EPSILON >= COMMAND_THRESHOLDS['all-compact']
        && allRows.every(row => row.candidate.tokens <= row.legacy.tokens),
    },
    {
      name: 'compare-compact',
      reduction: compareRow.reduction,
      threshold: COMMAND_THRESHOLDS['compare-compact'],
      pass: compareRow.pass,
    },
    {
      name: 'analyze-summary-only',
      reduction: analyzeRow.reduction,
      threshold: COMMAND_THRESHOLDS['analyze-summary-only'],
      pass: analyzeRow.pass,
    },
    {
      name: 'search-full-not-larger',
      reduction: fullRow.reduction,
      threshold: 0,
      pass: fullRow.pass,
    },
    {
      name: 'search-debug-unchanged',
      reduction: debugRow.reduction,
      threshold: 0,
      pass: debugRow.pass,
    },
  ];

  return { reports, gates };
}

export function tokenizerMeta() {
  return {
    name: TOKENIZER_NAME,
    package: TOKENIZER_PACKAGE,
    version: TOKENIZER_VERSION,
  };
}

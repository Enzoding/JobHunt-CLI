#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { evaluateCommandBudgets, tokenizerMeta } from './token-metrics.js';
import { evaluateWorkflowBudgets } from './workflow-metrics.js';

function pct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function printTable(title, rows, columns) {
  const widths = columns.map(col => Math.max(
    col.header.length,
    ...rows.map(row => String(col.value(row)).length),
  ));
  const line = cells => cells.map((cell, i) => String(cell).padEnd(widths[i])).join('  ');
  process.stdout.write(`\n${title}\n`);
  process.stdout.write(`${line(columns.map(col => col.header))}\n`);
  process.stdout.write(`${line(widths.map(width => '-'.repeat(width)))}\n`);
  for (const row of rows) {
    process.stdout.write(`${line(columns.map(col => col.value(row)))}\n`);
  }
}

function main() {
  const tokenizer = tokenizerMeta();
  const command = evaluateCommandBudgets();
  const workflow = evaluateWorkflowBudgets();
  const failed = [
    ...command.gates.filter(gate => !gate.pass),
    ...workflow.gates.filter(gate => !gate.pass),
  ];

  printTable('Command token budget', command.reports, [
    { header: 'scenario', value: row => row.scenario },
    { header: 'fixture', value: row => row.fixture },
    { header: 'legacy_tok', value: row => row.legacy.tokens },
    { header: 'cand_tok', value: row => row.candidate.tokens },
    { header: 'delta', value: row => row.tokenDelta },
    { header: 'reduction', value: row => pct(row.reduction) },
    { header: 'pass', value: row => (row.pass ? 'pass' : 'FAIL') },
  ]);

  printTable('Command gates', command.gates, [
    { header: 'gate', value: row => row.name },
    { header: 'reduction', value: row => pct(row.reduction) },
    { header: 'threshold', value: row => pct(row.threshold) },
    { header: 'pass', value: row => (row.pass ? 'pass' : 'FAIL') },
  ]);

  printTable('Workflow token budget', workflow.reports, [
    { header: 'workflow', value: row => row.workflow },
    { header: 'legacy_tok', value: row => row.legacy.tokens },
    { header: 'cand_tok', value: row => row.candidate.tokens },
    { header: 'reduction', value: row => pct(row.reduction) },
    { header: 'calls', value: row => row.cliCalls ?? '-' },
    { header: 'full_jd', value: row => row.fullJdCount ?? '-' },
    { header: 'pass', value: row => (row.pass ? 'pass' : 'FAIL') },
  ]);

  printTable('Workflow / skill gates', workflow.gates, [
    { header: 'gate', value: row => row.name },
    { header: 'value', value: row => (typeof row.value === 'number' && row.value <= 2 ? pct(row.value) : row.value) },
    { header: 'threshold', value: row => (typeof row.threshold === 'number' && row.threshold <= 2 ? pct(row.threshold) : row.threshold) },
    { header: 'pass', value: row => (row.pass ? 'pass' : 'FAIL') },
  ]);

  const report = {
    tokenizer,
    generated_at: new Date().toISOString(),
    command,
    workflow,
    pass: failed.length === 0,
  };

  const jsonPath = process.argv.includes('--json')
    ? process.argv[process.argv.indexOf('--json') + 1]
    : '';
  if (jsonPath) {
    fs.writeFileSync(path.resolve(jsonPath), `${JSON.stringify(report, null, 2)}\n`);
  } else if (process.argv.includes('--json-stdout')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  }

  if (failed.length) {
    process.stderr.write(`token-benchmark failed: ${failed.map(item => item.name).join(', ')}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write('\nAll token budgets passed.\n');
}

try {
  main();
} catch (error) {
  process.stderr.write(`token-benchmark error: ${error.message}\n`);
  process.exitCode = 1;
}

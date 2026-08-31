import { ArgumentError } from './errors.js';
import { normalizeView } from './projection.js';

export function normalizeOutputFormat(format) {
  const value = String(format || 'table').toLowerCase();
  return value === 'markdown' ? 'md' : value;
}

export function ensureOutputContract(options = {}) {
  const format = normalizeOutputFormat(options.format);
  const hasView = options.view !== undefined && options.view !== null && String(options.view).trim() !== '';
  const view = hasView ? normalizeView(options.view) : undefined;
  const summaryOnly = Boolean(options.summaryOnly);

  if (hasView && format !== 'json') {
    throw new ArgumentError(
      `--view is only supported with JSON output`,
      `Use --format json with --view, or remove --view.`,
    );
  }
  if (summaryOnly && format !== 'json') {
    throw new ArgumentError(
      `--summary-only is only supported with JSON output`,
      `Use --format json, or remove --summary-only.`,
    );
  }

  return { format, view, summaryOnly };
}

export function selectAnalyzeJson(result, { summaryOnly } = {}) {
  if (summaryOnly) return { summary: result.summary };
  return { summary: result.summary, jobs: result.rows };
}

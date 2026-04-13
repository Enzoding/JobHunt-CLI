import fs from 'node:fs';

export function normalizeText(value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return String(value).replace(/\s+/g, ' ').trim();
}

function csvEscape(value) {
  const text = normalizeText(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function formatCsv(rows, columns) {
  const normalizedRows = Array.isArray(rows) ? rows : [rows];
  const selectedColumns = columns?.length ? columns : Object.keys(normalizedRows[0] || {});
  return `${[
    selectedColumns.join(','),
    ...normalizedRows.map(row => selectedColumns.map(column => csvEscape(row[column])).join(',')),
  ].join('\n')}\n`;
}

export function formatMarkdownTable(rows, columns) {
  const normalizedRows = Array.isArray(rows) ? rows : [rows];
  const selectedColumns = columns?.length ? columns : Object.keys(normalizedRows[0] || {});
  const escapeCell = value => normalizeText(value).replaceAll('|', '\\|');
  return `${[
    `| ${selectedColumns.join(' | ')} |`,
    `| ${selectedColumns.map(() => '---').join(' | ')} |`,
    ...normalizedRows.map(row => `| ${selectedColumns.map(column => escapeCell(row[column])).join(' | ')} |`),
  ].join('\n')}\n`;
}

export function formatTable(rows, columns) {
  const normalizedRows = Array.isArray(rows) ? rows : [rows];
  const selectedColumns = columns?.length ? columns : Object.keys(normalizedRows[0] || {});
  const values = normalizedRows.map(row => selectedColumns.map(column => normalizeText(row[column])));
  const widths = selectedColumns.map((column, index) => {
    const maxValue = Math.max(column.length, ...values.map(row => row[index]?.length || 0));
    return Math.min(maxValue, 48);
  });
  const truncate = (value, width) => (value.length > width ? `${value.slice(0, Math.max(0, width - 1))}…` : value);
  const renderRow = row => row.map((value, index) => truncate(value, widths[index]).padEnd(widths[index])).join('  ');
  return `${[
    renderRow(selectedColumns),
    widths.map(width => '-'.repeat(width)).join('  '),
    ...values.map(renderRow),
  ].join('\n')}\n`;
}

export function formatOutput(value, { format = 'table', columns = [] } = {}) {
  if (typeof value === 'string') return value.endsWith('\n') ? value : `${value}\n`;
  if (format === 'json') return formatJson(value);
  if (format === 'csv') return formatCsv(value, columns);
  if (format === 'md' || format === 'markdown') return formatMarkdownTable(value, columns);
  return formatTable(value, columns);
}

export function writeOutput(text, outputPath) {
  if (outputPath) {
    fs.writeFileSync(outputPath, text, 'utf8');
    return;
  }
  process.stdout.write(text);
}

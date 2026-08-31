import { ArgumentError } from './errors.js';

export const NATURES = ['social', 'campus', 'intern'];
export const DEFAULT_NATURE = 'social';
export const ALL_NATURE = 'all';

export const NATURE_NAMES = {
  social: '社招',
  campus: '校招',
  intern: '实习',
};

const NATURE_ALIASES = new Map([
  ['social', 'social'],
  ['社招', 'social'],
  ['社会招聘', 'social'],
  ['experienced', 'social'],

  ['campus', 'campus'],
  ['校招', 'campus'],
  ['校园招聘', 'campus'],
  ['应届', 'campus'],
  ['应届生', 'campus'],
  ['graduate', 'campus'],
  ['newgrad', 'campus'],
  ['春招', 'campus'],
  ['秋招', 'campus'],

  ['intern', 'intern'],
  ['internship', 'intern'],
  ['实习', 'intern'],
  ['实习生', 'intern'],
  ['暑期实习', 'intern'],
  ['日常实习', 'intern'],

  ['all', ALL_NATURE],
  ['全部', ALL_NATURE],
  ['所有', ALL_NATURE],
]);

function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
}

const NORMALIZED_ALIASES = new Map(
  [...NATURE_ALIASES.entries()].map(([alias, code]) => [normalizeAliasKey(alias), code]),
);

export function natureDisplayName(nature) {
  return NATURE_NAMES[nature] || nature;
}

export function normalizeNature(input) {
  if (input === undefined || input === null || String(input).trim() === '') {
    return DEFAULT_NATURE;
  }

  const key = normalizeAliasKey(input);
  const resolved = NORMALIZED_ALIASES.get(key);
  if (!resolved) {
    throw new ArgumentError(
      `Invalid recruitment nature: ${input}`,
      `Use one of: ${[...NATURES, ALL_NATURE].join(', ')} (or 社招/校招/实习/全部).`,
      'INVALID_NATURE',
    );
  }
  return resolved;
}

export function siteSupportedNatures(site) {
  const declared = Array.isArray(site?.supportedNatures) ? site.supportedNatures : [DEFAULT_NATURE];
  return NATURES.filter(nature => declared.includes(nature));
}

export function siteDefaultNature(site) {
  return site?.defaultNature || DEFAULT_NATURE;
}

export function resolveSupportedNatures(site, requested, { allowAll = true } = {}) {
  const nature = typeof requested === 'string' && NATURES.includes(requested)
    ? requested
    : requested === ALL_NATURE
      ? ALL_NATURE
      : normalizeNature(requested);

  const supported = siteSupportedNatures(site);
  const siteId = site?.id || 'unknown';

  if (nature === ALL_NATURE) {
    if (!allowAll) {
      throw new ArgumentError(
        `detail does not support --nature all for site ${siteId}`,
        `Provide a single nature: ${supported.join(', ') || DEFAULT_NATURE}.`,
        'INVALID_NATURE',
      );
    }
    if (!supported.length) {
      throw new ArgumentError(
        `Site ${siteId} has no supported recruitment natures`,
        'Check adapter supportedNatures metadata.',
        'UNSUPPORTED_NATURE',
      );
    }
    return supported;
  }

  if (!supported.includes(nature)) {
    throw new ArgumentError(
      `Site ${siteId} does not support recruitment nature: ${nature}`,
      `Supported natures: ${supported.join(', ') || '(none)'}.`,
      'UNSUPPORTED_NATURE',
    );
  }

  return [nature];
}

export function buildNatureFilterRows(supportedNatures = NATURES) {
  return supportedNatures.map((code, index) => ({
    group: 'nature',
    parent: '',
    code,
    name: natureDisplayName(code),
    en_name: code,
    sort_id: String(index + 1),
  }));
}

export function jobDedupeKey(job) {
  const nature = job?.nature_code || '';
  const id = job?.id ?? '';
  return `${nature}:${id}`;
}

export function stampStandardNature(job, channelNature, source = {}) {
  const sourceCode = source.code ?? job?.raw?.source_nature_code ?? job?.nature_code ?? '';
  const sourceName = source.name ?? job?.raw?.source_nature_name ?? job?.nature_name ?? '';
  const next = { ...job };
  next.nature_code = channelNature;
  next.nature_name = natureDisplayName(channelNature);

  const raw = { ...(job?.raw && typeof job.raw === 'object' ? job.raw : {}) };
  raw.source_nature_code = sourceCode === undefined || sourceCode === null ? '' : String(sourceCode);
  raw.source_nature_name = sourceName === undefined || sourceName === null ? '' : String(sourceName);
  Object.defineProperty(next, 'raw', {
    value: raw,
    enumerable: true,
    writable: true,
    configurable: true,
  });
  return next;
}

/**
 * Allocate a bounded per-nature quota for sequential aggregation.
 * Unused quota from earlier natures is redistributed to later ones via remaining/count.
 */
export function nextNatureQuota(remaining, naturesLeft) {
  if (!Number.isFinite(remaining) || remaining <= 0 || naturesLeft <= 0) return 0;
  return Math.ceil(remaining / naturesLeft);
}

export function filterRowDedupeKey(row) {
  return [row.applies_to || '', row.group || '', row.parent || '', row.code || ''].join('\u0000');
}

export function mergeFilterRows(rowsByNature) {
  const merged = [];
  const seen = new Set();

  for (const [nature, rows] of rowsByNature) {
    for (const row of rows || []) {
      if (!row || row.group === 'nature') continue;
      const next = { ...row, applies_to: nature };
      const key = filterRowDedupeKey(next);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(next);
    }
  }

  return merged;
}

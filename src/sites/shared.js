export function fieldText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  if (value === undefined || value === null) return '';
  return String(value);
}

export function stripHtml(value) {
  return fieldText(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_&/／\\-]+/g, '');
}

export function matchesAlias(input, values = []) {
  if (!input) return false;
  const normal = normalizeAliasKey(input);
  const compact = normalizeCompactKey(input);
  return values.some(value => {
    const candidate = fieldText(value);
    return normalizeAliasKey(candidate) === normal || normalizeCompactKey(candidate) === compact;
  });
}

export function coerceLimit(value, fallback = 10, maximum = 50) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(Math.floor(number), maximum);
}

export function coercePage(value) {
  const page = Number(value || 1);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function pickFirst(...values) {
  return values.find(value => fieldText(value).trim()) ?? '';
}

export function toDateText(value) {
  if (!value) return '';
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }
  return fieldText(value).slice(0, 10);
}

export function splitDescription(value) {
  const text = stripHtml(value);
  const match = text.match(/(?:工作职责|岗位职责|职位描述|工作内容)[:：]?([\s\S]*?)(?:任职要求|岗位要求|职位要求|我们希望你)[:：]?([\s\S]*)/);
  if (!match) return { description: text, requirement: '' };
  return { description: match[1].trim(), requirement: match[2].trim() };
}

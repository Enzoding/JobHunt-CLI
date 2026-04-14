import { exportJobs } from './registry.js';
import { normalizeText, formatCsv } from './formatters.js';

const STOP_WORDS = new Set([
  '的', '了', '和', '是', '在', '与', '及', '等', '或', '对', '为', '能',
  '有', '不', '将', '到', '以', '上', '中', '可', '从', '向', '被', '让',
  '把', '给', '并', '也', '就', '都', '而', '但', '如', '要', '会', '做',
  '这', '那', '些', '个', '各', '每', '其', '它', '他', '她', '我', '你',
  '们', '所', '该', '此', '之', '已', '过', '还', '更', '最', '很', '非',
  '着', '地', '得', '下', '出', '来', '去', '进', '行', '包括', '通过',
  '使用', '负责', '参与', '具备', '相关', '以上', '工作', '经验', '优先',
  '具有', '良好', '能力', '熟悉', '了解', '掌握', '以及', '进行', '支持',
  '提供', '完成', '实现', '满足', '需要', '要求', '至少', '年以上', '本科',
  '硕士', '博士', '学历', '专业', '方向', '领域', '基于', '年',
  '推动', '提升', '优化', '协同', '构建', '持续', '结合', '确保', '设计',
  '定义', '探索', '建设', '搭建', '制定', '开展', '深入', '识别', '跟进',
  '推进', '落地', '输出', '沉淀', '拆解', '迭代', '聚焦', '赋能', '驱动',
  '独立', '高效', '核心', '整体', '系统', '深刻', '扎实', '丰富', '突出',
  '团队', '项目', '产品', '系统', '平台', '业务', '公司', '部门', '组织',
  '用户', '客户', '市场', '行业',
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was',
  'have', 'has', 'had', 'will', 'can', 'not', 'but', 'all', 'any',
  'been', 'they', 'their', 'which', 'would', 'about', 'into', 'more',
  'other', 'than', 'its', 'also', 'our', 'you', 'your', 'who', 'how',
  'what', 'when', 'where', 'there', 'should', 'could', 'may', 'such',
  'both', 'each', 'etc', 'well', 'very', 'being', 'those',
]);

function extractTerms(text) {
  if (!text) return [];
  const enTerms = text.match(/[A-Za-z][A-Za-z0-9.+#/-]{1,30}/g) || [];
  const zhSegments = text.match(/[\u4e00-\u9fa5]{2,20}/g) || [];
  const zhTerms = [];
  for (const seg of zhSegments) {
    for (let len = 4; len >= 2; len--) {
      for (let i = 0; i <= seg.length - len; i++) {
        zhTerms.push(seg.slice(i, i + len));
      }
    }
  }
  return [...enTerms, ...zhTerms]
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t.toLowerCase()) && !STOP_WORDS.has(t));
}

function dedupeTerms(entries) {
  const result = [];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  for (const [term, count] of sorted) {
    const dominated = result.some(([longer, lc]) => lc >= count && longer.includes(term));
    if (!dominated) result.push([term, count]);
  }
  return result;
}

function countTermFrequency(jobs, fields) {
  const freq = new Map();
  for (const job of jobs) {
    const text = fields.map(f => normalizeText(job[f])).join(' ');
    const seen = new Set();
    for (const term of extractTerms(text)) {
      const key = term.length <= 6 && /^[A-Za-z]/.test(term) ? term : term.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      freq.set(key, (freq.get(key) || 0) + 1);
    }
  }
  const raw = [...freq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);
  return dedupeTerms(raw).slice(0, 50);
}

function countBy(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = normalizeText(row[key]) || '未知';
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
}

function timeBuckets(rows) {
  const buckets = new Map();
  for (const row of rows) {
    const date = normalizeText(row.updated_at);
    const month = date ? date.slice(0, 7) : '未知';
    buckets.set(month, (buckets.get(month) || 0) + 1);
  }
  return [...buckets.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

function distributionLine(entries, maxItems = 10) {
  return entries.slice(0, maxItems).map(([name, count]) => `${name} ${count}`).join('，');
}

function markdownJobTable(rows) {
  const header = '| ID | 岗位名称 | 类别 | 地点 | 部门 | 更新时间 | 链接 |';
  const sep = '| --- | --- | --- | --- | --- | --- | --- |';
  const body = rows.map(job => {
    const esc = v => normalizeText(v).replaceAll('|', '\\|');
    return `| ${esc(job.id)} | ${esc(job.name)} | ${esc(job.category_name)} | ${esc(job.location_names)} | ${esc(job.department_name)} | ${esc(job.updated_at)} | [link](${job.url}) |`;
  }).join('\n');
  return `${header}\n${sep}\n${body}`;
}

function renderMarkdown(siteId, keyword, args, rows, summary) {
  const filterDesc = [
    args.category ? `类别=${args.category}` : '',
    args.location ? `地点=${args.location}` : '',
  ].filter(Boolean).join('，');
  const filterHint = filterDesc ? `（筛选条件：${filterDesc}）` : '';

  const skillTerms = summary.skillTerms.slice(0, 20);
  const reqTerms = summary.requirementTerms.slice(0, 20);

  let md = `# ${siteId} 「${keyword}」岗位分析报告

数据来源：\`jobs ${siteId} all ${keyword || ''}${args.category ? ' --category ' + args.category : ''}${args.max ? ' --max ' + args.max : ''} --format json\`${filterHint}

## 概览

- 匹配岗位总数：**${rows.length}**
- 地域分布：${distributionLine(summary.locations)}
- 类别分布：${distributionLine(summary.categories)}
- 部门分布：${distributionLine(summary.departments)}
- 更新时间分布：${distributionLine(summary.timeBuckets, 6)}

## 高频技能/关键词（岗位描述）

${skillTerms.length ? skillTerms.map(([term, count]) => `- **${term}**（${count} 次）`).join('\n') : '无足够数据'}

## 高频要求关键词（任职要求）

${reqTerms.length ? reqTerms.map(([term, count]) => `- **${term}**（${count} 次）`).join('\n') : '无足够数据'}

## 岗位明细（前 ${Math.min(rows.length, 50)} 条）

${markdownJobTable(rows.slice(0, 50))}
`;
  return md;
}

export async function analyzeJobs(siteId, keyword, args = {}) {
  const fetchArgs = {
    query: keyword || '',
    category: args.category || '',
    location: args.location || '',
    nature: args.nature || '',
    max: args.max ?? 0,
  };
  const jobs = await exportJobs(siteId, fetchArgs);

  const rows = [...jobs].sort((a, b) =>
    normalizeText(b.updated_at).localeCompare(normalizeText(a.updated_at))
    || normalizeText(a.name).localeCompare(normalizeText(b.name), 'zh-CN'),
  );

  const summary = {
    total: rows.length,
    locations: countBy(rows, 'location_names'),
    categories: countBy(rows, 'category_name'),
    departments: countBy(rows, 'department_name'),
    timeBuckets: timeBuckets(rows),
    skillTerms: countTermFrequency(rows, ['description']),
    requirementTerms: countTermFrequency(rows, ['requirement']),
  };

  const markdown = renderMarkdown(siteId, keyword, fetchArgs, rows, summary);
  return { summary, rows, markdown };
}

export function analyzeCsv(rows) {
  return formatCsv(rows, [
    'id', 'code', 'job_no', 'name', 'category_name', 'nature_name',
    'location_names', 'department_name', 'updated_at', 'url',
    'description', 'requirement',
  ].filter(key => rows.some(r => r[key] !== undefined && r[key] !== '')));
}

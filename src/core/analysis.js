import { exportJobs } from './registry.js';
import { normalizeText, formatCsv } from './formatters.js';

const STRONG_AI_TERMS = [
  'AI',
  'AIGC',
  '大模型',
  'LLM',
  'Agent',
  'RAG',
  'NLP',
  'Chatbot',
  'ChatBI',
  'AI Coding',
  '语音交互',
  '语义理解',
  '多模态',
  'Claude',
  'Codex',
  'Cursor',
  'Copilot',
];

const WEAK_AI_TERMS = ['智能', '机器学习'];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matches(text, terms) {
  return terms.filter(term => new RegExp(escapeRegExp(term), 'i').test(text));
}

function classify(job) {
  const text = [job.name, job.department_name, job.description, job.requirement].filter(Boolean).join('\n');
  const strong = matches(text, STRONG_AI_TERMS);
  const weak = matches(text, WEAK_AI_TERMS);
  if (strong.length) return { tier: '核心AI产品岗', terms: [...new Set([...strong, ...weak])] };
  return { tier: 'AI相关/智能化产品岗', terms: weak };
}

function inferScenario(job) {
  const text = [job.name, job.department_name, job.description, job.requirement].join(' ');
  const rules = [
    ['货运/物流/配送', /货运|物流|配送|同城配送|Delivery/],
    ['客服与服务体系', /客服|Chatbot|坐席|Copilot|服务 Agent|客服工作台|CSAT|FCR/],
    ['自动驾驶/AIoT/车联网', /自动驾驶|Robotaxi|Voyager|AIoT|车联网|泊车|CV&语音/],
    ['风控/安全/治理', /风控|安全|治理|内容安全|反作弊|人脸|声纹|准入|Risk|Credit Risk|Fintech/],
    ['能源/售电', /售电|电力|虚拟电厂|绿电/],
    ['HR数字化', /HR|人才|人力/],
    ['研发效能/企业平台', /效能|DevOps|企业|差旅|信息化|管控|AI Coding|研发管理|工程效能/],
    ['增长与广告投放', /增长|广告|投放|素材|ROI|CAC|Marketing|用增/],
    ['数据分析/BI', /数据|BI|ChatBI|Data Agent|管报|报表|可视化/],
    ['司机/出行Agent', /司机|车主|出行 Agent|网约车产品|平台治理|平台乘客/],
    ['搜索推荐/交易策略', /搜推|推荐|交易|组合出行|策略|价格|商品/],
  ];
  return rules.find(([, rule]) => rule.test(text))?.[0] || '通用产品/平台化';
}

function countBy(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = normalizeText(row[key]) || '未知';
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
}

function markdownTable(rows) {
  return rows.map(job => `| ${job.id} | ${normalizeText(job.name).replaceAll('|', '\\|')} | ${job.tier} | ${job.scenario} | ${normalizeText(job.department_name)} | ${normalizeText(job.location_names)} | ${normalizeText(job.updated_at)} | ${job.matched_terms.join(', ')} | [link](${job.url}) |`).join('\n');
}

export async function analyzeAiProduct(siteId, args = {}) {
  const jobs = await exportJobs(siteId, { ...args, category: args.category || '产品', max: args.max ?? 0 });
  const rows = jobs
    .map(job => ({ ...job, ...classify(job) }))
    .filter(job => job.terms.length)
    .map(job => ({
      ...job,
      tier: job.tier,
      scenario: inferScenario(job),
      matched_terms: job.terms,
    }))
    .sort((a, b) => normalizeText(b.updated_at).localeCompare(normalizeText(a.updated_at)) || normalizeText(a.name).localeCompare(normalizeText(b.name), 'zh-CN'));
  const core = rows.filter(job => job.tier === '核心AI产品岗');
  const adjacent = rows.filter(job => job.tier !== '核心AI产品岗');
  const summary = {
    site: siteId,
    total_product_jobs: jobs.length,
    ai_product_jobs: rows.length,
    core_ai_product_jobs: core.length,
    adjacent_ai_product_jobs: adjacent.length,
    locations: countBy(rows, 'location_names'),
    scenarios: countBy(rows, 'scenario'),
    departments: countBy(rows, 'department_name'),
  };
  return { summary, rows, markdown: renderAiProductMarkdown(siteId, summary, rows, core, adjacent) };
}

export function renderAiProductMarkdown(siteId, summary, rows, core, adjacent) {
  const locations = summary.locations.map(([name, count]) => `${name} ${count}`).join('，');
  const scenarios = summary.scenarios.map(([name, count]) => `${name} ${count}`).join('，');
  const departments = summary.departments.slice(0, 10).map(([name, count]) => `${name} ${count}`).join('，');
  return `# ${siteId} AI 产品岗位与能力画像报告

数据来源：\`hire ${siteId} all --category 产品 --max 0 --format json\`

## 结论摘要

本次从产品类岗位中拉取 ${summary.total_product_jobs} 条岗位详情，经岗位名称、职责和任职要求中的 AI 相关信号过滤，识别出 ${summary.ai_product_jobs} 条 AI 产品相关岗位。其中 ${summary.core_ai_product_jobs} 条属于核心 AI 产品岗，${summary.adjacent_ai_product_jobs} 条属于 AI 相关或智能化产品岗。

岗位地域分布：${locations}。
主要业务场景：${scenarios}。
高频部门/团队：${departments}。

## 全部 AI 产品相关岗位

| ID | 岗位 | 分层 | 场景 | 部门 | 地点 | 更新时间 | AI信号 | 链接 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${markdownTable(rows)}

## 能力画像

### 1. 大模型与 Agent 产品化能力

核心岗位通常要求把 LLM、Agent、RAG、NLP、语音、多模态、Chatbot、Copilot 等能力转成可用产品，而不只是理解概念。

### 2. 场景抽象和业务落地能力

AI 产品经理需要深入具体业务场景，识别高价值问题，把非标流程抽象成产品能力，并推动算法、工程、运营和数据团队落地。

### 3. 数据驱动和评估体系能力

高频要求包括指标体系、A/B 实验、badcase 归因、准确率、转化率、满意度、人工压降、ROI、响应时长等效果评估。

### 4. AI Native 工具使用能力

部分岗位已经强调 Claude Code、Codex、Cursor、Copilot、AI Coding、Prompt、Skill 等实操能力。产品经理的技术操作能力正在变得更重要。

### 5. 平台化与中后台产品能力

大量岗位落在客服、风控、数据、研发效能、投放后台等平台场景。候选人需要具备业务建模、流程设计、配置化、灰度和复用能力。

## 候选人画像

- 有 AI 产品或智能化项目落地经验。
- 理解 LLM / Agent / RAG / NLP / 多模态 / 语音等能力边界。
- 能设计指标体系并证明 AI 的业务效果。
- 有强业务抽象、跨团队推动和数据分析能力。
- 加分项包括 AI Coding、Prompt Engineering、知识库、智能客服、ChatBI、Copilot、国际化和垂直行业经验。
`;
}

export function aiProductCsv(rows) {
  return formatCsv(rows, ['id', 'job_no', 'name', 'tier', 'scenario', 'department_name', 'location_names', 'updated_at', 'matched_terms', 'url', 'description', 'requirement']);
}

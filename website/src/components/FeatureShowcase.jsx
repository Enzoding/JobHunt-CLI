import React, { useState } from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const FEATURES = [
  {
    id: 'unified',
    navLabel: '01 统一搜索',
    title: '统一数据契约 · 抹平 30+ 招聘官网差异',
    tag: '参数归一化',
    summary: '同一套 CLI 参数覆盖所有招聘站点。通过 --nature 切换社招、校招与实习，无需记忆各站点筛选规则。',
    command: 'job meituan search "算法" --nature social --category 技术类 --limit 5',
    contrastTitle: '统一参数体系',
    codeSnippet: `// 统一 CLI 指令契约
job <site> search <keyword> [flags]

// 标准化职位性质切换
--nature social  // 社会招聘
--nature campus  // 校园招聘
--nature intern  // 实习生招聘

// 字段归一化输出
ID | 职位名称 | 部门 | 城市 | 招聘性质 | 发布时间`,
  },
  {
    id: 'compare',
    navLabel: '02 跨司对比',
    title: '跨司横向聚合 · 结构化决策目标岗位',
    tag: '多源并发比对',
    summary: '多站点并发拉取同类岗位，同屏输出职责、地点与发布时间对照表，告别多网页来回跳转。',
    command: 'job compare "大模型" --sites meituan,xiaomi,tencent --nature social',
    contrastTitle: '并发比对聚合结果',
    codeSnippet: `// 跨公司聚合比对
job compare <keyword> --sites <site1,site2,...>

// 聚合矩阵示例
┌──────────┬────────────────────────┬────────┬────────────┐
│ 站点     │ 岗位名称               │ 地点   │ 详情指令   │
├──────────┼────────────────────────┼────────┼────────────┤
│ meituan  │ 资深大模型应用专家     │ 北京   │ job mt jd  │
│ xiaomi   │ 端侧大模型算法专家     │ 武汉   │ job xm jd  │
│ tencent  │ 混元大模型应用工程师   │ 深圳   │ job tc jd  │
└──────────┴────────────────────────┴────────┴────────────┘`,
  },
  {
    id: 'agent-native',
    navLabel: '03 Agent 原生',
    title: 'LLM 上下文优化 · 紧凑 JSON 数据流',
    tag: 'Token 压缩 -78%',
    summary: '剥离冗余 DOM 与无用文本，单条岗位仅约 80 Token。无需写爬虫解析 HTML，直接作为 Context 喂给 Agent。',
    command: 'job aliyun search "Agent" --format json --view compact',
    contrastTitle: 'Compact Payload 格式',
    codeSnippet: `// 紧凑 JSON 数据流（Token 消耗减少 78%）
{
  "site": "aliyun",
  "view": "compact",
  "jobs": [
    {
      "id": "AL-901",
      "title": "AI Agent 架构师",
      "city": "杭州",
      "dept": "阿里云智能"
    }
  ]
}`,
  },
];

export function FeatureShowcase() {
  const [selectedId, setSelectedId] = useState(FEATURES[0].id);
  const active = FEATURES.find((f) => f.id === selectedId) || FEATURES[0];

  return (
    <div className="rounded-lg border border-border bg-background-subtle overflow-hidden">
      {/* Top Segmented Navigation Rail */}
      <div className="flex border-b border-border bg-background divide-x divide-border overflow-x-auto">
        {FEATURES.map((feature) => {
          const isSelected = feature.id === selectedId;
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setSelectedId(feature.id)}
              className={`flex-1 min-w-[140px] px-4 py-3 text-left transition-colors cursor-pointer select-none ${
                isSelected
                  ? 'bg-background-subtle text-foreground font-semibold border-b-2 border-foreground'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle/50 font-medium'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-[13px] font-mono tracking-tight">
                  {feature.navLabel}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-subtle border border-border">
                  {feature.tag}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Integrated Workbench Body */}
      <div className="p-5 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Specification Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {active.title}
            </h3>
            <p className="text-foreground-muted text-xs sm:text-sm leading-relaxed">
              {active.summary}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-mono text-foreground-subtle uppercase tracking-wider font-semibold">
              执行命令 (CLI Command)
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded border border-border bg-background text-xs font-mono text-foreground">
              <span className="text-foreground-muted select-none">$</span>
              <code className="flex-1 truncate">{active.command}</code>
              <CopyButton
                value={active.command}
                variant="ghost"
                size="icon-sm"
                label="复制命令"
                copiedLabel="已复制"
              />
            </div>
          </div>
        </div>

        {/* Right Code/Output Contrast Pane */}
        <div className="lg:col-span-7">
          <div className="rounded border border-border bg-background overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background-subtle text-[11px] font-mono text-foreground-muted">
              <span>{active.contrastTitle}</span>
              <span className="text-foreground-subtle">bash / json</span>
            </div>
            <pre className="p-4 m-0 overflow-x-auto font-mono text-xs sm:text-[12px] leading-relaxed text-foreground bg-background">
              {active.codeSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const FEATURES = [
  {
    id: 'unified',
    title: '统一搜索 · 抹平官网差异',
    badge: '统一数据契约',
    description:
      '一条命令覆盖各家官网。通过 `--nature` 自由切换社招、校招与实习，无需记忆各站点繁琐的筛选规则。',
    command: 'job meituan search "算法" --nature social --category 技术类 --limit 5',
    codeSnippet: `// 统一的 CLI 命令格式
job <site> search <keyword> [options]

// 支持多性质灵活切换
--nature social  // 社会招聘
--nature campus  // 校园招聘
--nature intern  // 实习生招聘`,
  },
  {
    id: 'compare',
    title: '跨司对比 · 一屏决策目标',
    badge: '横向对比分析',
    description:
      '一屏对比多家公司的在招岗位。直观比对职责要求、Base 地点与发布时间，告别多标签页来回切换。',
    command: 'job compare "前端" --sites meituan,xiaomi,bytedance --nature social',
    codeSnippet: `// 跨公司多站点聚合对比
job compare <keyword> --sites <site1,site2,...>

// 使用搜索结果里的岗位 ID 查看完整 JD
job meituan detail <job-id> --format json
job xiaomi detail <job-id> --format json
job bytedance detail <job-id> --format json`,
  },
  {
    id: 'agent-native',
    title: 'Agent 原生 · 上下文 Token 压缩',
    badge: 'LLM 优化',
    description:
      '紧凑 JSON 输出，专为 LLM 上下文优化。`--view compact` 智能剥离冗余信息，单岗位仅需约 80 Token，节省 75%+ 上下文。',
    command: 'job aliyun search "Agent" --format json --view compact',
    codeSnippet: `// 紧凑 JSON 输出，专为 LLM 上下文设计
{
  "site": "aliyun",
  "view": "compact",
  "token_efficiency": "78% saved",
  "jobs": [
    { "id": "AL-901", "title": "AI Agent 架构师", "city": "杭州" }
  ]
}`,
  },
];

export function FeatureShowcase() {
  const [selectedFeature, setSelectedFeature] = useState(FEATURES[0].id);
  const active = FEATURES.find((f) => f.id === selectedFeature) || FEATURES[0];

  return (
    <div className="space-y-6">
      {/* Feature Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FEATURES.map((feature) => {
          const isSelected = feature.id === selectedFeature;
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setSelectedFeature(feature.id)}
              className={`text-left p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-foreground/80 bg-background shadow-md ring-1 ring-border'
                  : 'border-border bg-background-subtle/60 hover:bg-background-subtle hover:border-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-foreground/5 text-foreground-muted border border-border">
                  {feature.badge}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                {feature.title.split('·')[0]}
              </h3>
              <p className="text-foreground-muted text-xs sm:text-[13px] leading-relaxed mt-1 line-clamp-2">
                {feature.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Detail Showcase Panel */}
      <div className="rounded-xl border border-border bg-background-subtle p-5 sm:p-6 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3.5">
            <span className="text-xs font-mono text-foreground-muted font-medium uppercase tracking-wider">
              {active.badge}
            </span>
            <h4 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              {active.title}
            </h4>
            <p className="text-foreground-muted text-sm leading-relaxed">
              {active.description}
            </p>

            <div className="pt-1">
              <div className="text-xs font-mono text-foreground-subtle mb-1.5 font-medium">
                执行示例:
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background text-xs font-mono text-foreground">
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

          <div className="lg:col-span-7">
            <div className="rounded-lg border border-border bg-background overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-background-subtle text-xs font-mono text-foreground-muted">
                <span>preview · {active.id}.sh</span>
                <span className="text-[11px]">syntax · bash / json</span>
              </div>
              <pre className="p-4 m-0 overflow-x-auto font-mono text-xs sm:text-[12.5px] leading-relaxed text-foreground bg-background">
                {active.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

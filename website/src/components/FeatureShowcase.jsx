import React, { useState } from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const FEATURES = [
  {
    id: 'unified',
    title: '统一搜索',
    badge: '统一格式',
    description:
      '一套参数覆盖所有招聘站。支持社招、校招、实习一键切换，无需关注各家筛选差异。',
    command: 'job meituan search "算法" --nature social --category 技术类 --limit 5',
    codeSnippet: `// 统一的 CLI 命令格式
job <site> search <keyword> [options]

// 支持多性质灵活切换
--nature social  // 社招
--nature campus  // 校招
--nature intern  // 实习`,
  },
  {
    id: 'compare',
    title: '跨司对比',
    badge: '横向比对',
    description:
      '跨公司岗位同屏对照。一键比对各家职责、地点与发布时间，告别多网页来回跳转。',
    command: 'job compare "前端" --sites meituan,xiaomi,bytedance --nature social',
    codeSnippet: `// 跨公司多站点聚合对比
job compare <keyword> --sites <site1,site2,...>

// 查阅具体岗位完整 JD
job meituan detail <job-id> --format json`,
  },
  {
    id: 'agent-native',
    title: 'Agent 原生',
    badge: 'Token 优化',
    description:
      '紧凑 JSON / CSV 导出。智能剥离冗余信息，单岗位节省 75%+ Token，专为 Agent 上下文设计。',
    command: 'job aliyun search "Agent" --format json --view compact',
    codeSnippet: `// 紧凑 JSON 输出，专为 LLM 上下文设计
{
  "site": "aliyun",
  "view": "compact",
  "tokens_saved": "78%",
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
    <div className="space-y-5">
      {/* Feature Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FEATURES.map((feature) => {
          const isSelected = feature.id === selectedFeature;
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setSelectedFeature(feature.id)}
              className={`text-left p-4 sm:p-4.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-foreground/80 bg-background shadow-md ring-1 ring-border'
                  : 'border-border bg-background-subtle/60 hover:bg-background-subtle hover:border-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-foreground/5 text-foreground-muted border border-border">
                  {feature.badge}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                {feature.title}
              </h3>
              <p className="text-foreground-muted text-xs sm:text-[13px] leading-relaxed mt-1 line-clamp-2">
                {feature.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Detail Showcase Panel */}
      <div className="rounded-xl border border-border bg-background-subtle p-4.5 sm:p-5.5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono text-foreground-muted font-medium uppercase tracking-wider">
              {active.badge}
            </span>
            <h4 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              {active.title}
            </h4>
            <p className="text-foreground-muted text-xs sm:text-sm leading-relaxed">
              {active.description}
            </p>

            <div className="pt-1">
              <div className="text-[11px] font-mono text-foreground-subtle mb-1 font-medium">
                示例命令:
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background text-xs font-mono text-foreground">
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
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background-subtle text-[11px] font-mono text-foreground-muted">
                <span>{active.id}.sh</span>
                <span>bash / json</span>
              </div>
              <pre className="p-3.5 m-0 overflow-x-auto font-mono text-xs leading-relaxed text-foreground bg-background">
                {active.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

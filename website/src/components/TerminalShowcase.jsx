import React, { useState } from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const DEMO_SCENARIOS = [
  {
    id: 'search',
    label: 'job search',
    tag: '单司检索',
    command: 'job meituan search "AI Agent" --category 技术类 --view compact --format json --limit 3',
    status: '200 OK · 124ms',
    content: (
      <div className="space-y-2 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
          ✔ 已连接 meituan 招聘官网 registry · 耗时 38ms
        </div>
        <div className="text-foreground-muted">
          找到匹配职位 (当前展示前 3 条 · --view compact 紧凑视图):
        </div>
        <div className="border-l-2 border-primary/40 pl-3 space-y-1.5 my-2.5">
          <div>
            <span className="text-foreground font-semibold">[1] AI Agent Builder</span>
            <span className="text-foreground-muted ml-2 text-xs">深圳市 · 无人机业务部 · 社招</span>
            <div className="text-foreground-subtle text-[11px] truncate">
              ID: 4669710957 · 标签: Java / AI Agent / 系统设计 · 更新: 2026-09-01
            </div>
          </div>
          <div className="pt-1">
            <span className="text-foreground font-semibold">[2] AI Agent工程师</span>
            <span className="text-foreground-muted ml-2 text-xs">北京市、上海市 · 核心本地商业-基础研发平台 · 社招</span>
            <div className="text-foreground-subtle text-[11px] truncate">
              ID: 3424768905 · 标签: AI Agent · 更新: 2026-07-23
            </div>
          </div>
          <div className="pt-1">
            <span className="text-foreground font-semibold">[3] AI Agent 开发工程师</span>
            <span className="text-foreground-muted ml-2 text-xs">北京市、成都市 · 核心本地商业-基础研发平台 · 社招</span>
            <div className="text-foreground-subtle text-[11px] truncate">
              ID: 4603842394 · 标签: AI Agent · 更新: 2026-08-28
            </div>
          </div>
        </div>
        <div className="text-foreground-subtle text-xs">
          💡 运行 <span className="text-foreground font-semibold">job meituan detail 4669710957 --format json</span> 可直接查看完整岗位详情
        </div>
      </div>
    ),
  },
  {
    id: 'compare',
    label: 'job compare',
    tag: '多司比对',
    command: 'job compare "大模型" --sites meituan,xiaomi,tencent --nature social',
    status: '3 站点聚合 · 186ms',
    content: (
      <div className="space-y-2 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
          ✔ 3 家招聘官网聚合完成 (共 42 个在招岗位)
        </div>
        <div className="overflow-x-auto my-1.5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-foreground-muted">
                <th className="py-1 pr-3 font-medium">公司</th>
                <th className="py-1 pr-3 font-medium">岗位名称</th>
                <th className="py-1 pr-2 font-medium">城市</th>
                <th className="py-1 font-medium">JD 调取指令</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground">
              <tr>
                <td className="py-1.5 pr-3 font-medium text-amber-600 dark:text-amber-400">美团</td>
                <td className="py-1.5 pr-3">AI Agent Builder</td>
                <td className="py-1.5 pr-2 text-foreground-muted">深圳市</td>
                <td className="py-1.5 text-foreground-subtle">job meituan detail 4669710957 --format json</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium text-orange-600 dark:text-orange-400">小米</td>
                <td className="py-1.5 pr-3">搜广推算法平台架构专家</td>
                <td className="py-1.5 pr-2 text-foreground-muted">北京</td>
                <td className="py-1.5 text-foreground-subtle">job xiaomi detail 7677425837373622569 --format json</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium text-blue-600 dark:text-blue-400">腾讯</td>
                <td className="py-1.5 pr-3">Agent Security Expert</td>
                <td className="py-1.5 pr-2 text-foreground-muted">新加坡</td>
                <td className="py-1.5 text-foreground-subtle">job tencent detail 2088058045916692480 --format json</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-foreground-subtle text-xs">
          💡 支持 <span className="text-foreground font-semibold">--format csv --output compare.csv</span> 导出为本地分析表格
        </div>
      </div>
    ),
  },
  {
    id: 'agent',
    label: 'Agent 结构化流',
    tag: 'LLM 优化',
    command: 'job tencent search "Agent" --format json --view compact --limit 2',
    status: 'Token 节约 76%',
    content: (
      <div className="space-y-1.5 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
          ✔ Agent-Ready JSON Stream (Compact Payload)
        </div>
        <pre className="text-foreground text-[11px] md:text-xs overflow-x-auto bg-background/80 p-2.5 rounded border border-border/60">
{`{
  "site": "tencent",
  "total": 12,
  "context_optimized": true,
  "jobs": [
    {
      "id": "2088058045916692480",
      "title": "Agent Security Expert",
      "city": "新加坡",
      "dept": "CSIG",
      "nature": "social",
      "url": "https://careers.tencent.com/..."
    },
    {
      "id": "2090443785732538368",
      "title": "Product Manager, WorkBuddy Enterprise — Agent Platform",
      "city": "新加坡",
      "dept": "CSIG",
      "nature": "social",
      "url": "https://careers.tencent.com/..."
    }
  ]
}`}
        </pre>
        <div className="text-foreground-subtle text-xs">
          ✨ 无需解析庞大 HTML，直接作为 Context 喂给 Codex / Claude Code
        </div>
      </div>
    ),
  },
];

export function TerminalShowcase() {
  const [activeTab, setActiveTab] = useState(DEMO_SCENARIOS[0].id);
  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeTab) || DEMO_SCENARIOS[0];

  return (
    <div className="w-full rounded-xl border border-border bg-background-subtle shadow-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-foreground/30">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-background select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 text-xs font-mono text-foreground-muted font-medium">
            terminal · jobhunt-cli
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-background-subtle rounded-md p-0.5 border border-border/60">
          {DEMO_SCENARIOS.map((scenario) => {
            const isActive = scenario.id === activeTab;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setActiveTab(scenario.id)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-all cursor-pointer ${
                  isActive
                    ? 'bg-background text-foreground font-semibold shadow-xs'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background/50'
                }`}
              >
                {scenario.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Command prompt bar */}
      <div className="px-4 py-2.5 bg-background/60 border-b border-border/50 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">➜</span>
          <span className="text-foreground-muted shrink-0 hidden sm:inline">~</span>
          <span className="text-foreground font-medium truncate">
            {activeScenario.command}
          </span>
          <span className="w-1.5 h-3.5 bg-foreground/70 animate-pulse shrink-0 inline-block" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-muted border border-border">
            {activeScenario.status}
          </span>
          <CopyButton
            value={activeScenario.command}
            variant="ghost"
            size="icon-sm"
            label="复制此演示命令"
            copiedLabel="已复制"
          />
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="p-4 sm:p-5 min-h-[220px] max-h-[300px] overflow-y-auto bg-background/30 transition-opacity duration-200">
        {activeScenario.content}
      </div>
    </div>
  );
}

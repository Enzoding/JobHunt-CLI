import React, { useState } from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const DEMO_SCENARIOS = [
  {
    id: 'search',
    label: 'job search',
    tag: '单司检索',
    command: 'job meituan search "AI Agent" --category 技术类 --view compact --limit 3',
    latency: 'meituan: 34ms',
    metrics: '匹配 18 岗位 · 紧凑视图',
    content: (
      <div className="space-y-2 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
          ✔ 已连接 meituan 招聘官网 · 响应 34ms
        </div>
        <div className="text-foreground-muted">
          找到 18 个匹配职位 (展示前 3 条 · --view compact):
        </div>
        <div className="border-l-2 border-foreground/30 pl-3 space-y-1.5 my-2">
          <div>
            <span className="text-foreground font-semibold">[1] 大模型应用开发专家</span>
            <span className="text-foreground-muted ml-2 text-xs">北京 · 社招 · 2026-03-01</span>
            <div className="text-foreground-subtle text-[11px] truncate">
              ID: MT-882103 · 标签: Python / LLM / Agentic Workflow
            </div>
          </div>
          <div className="pt-1">
            <span className="text-foreground font-semibold">[2] Agent 算法工程师 (NLP/RL)</span>
            <span className="text-foreground-muted ml-2 text-xs">上海 · 社招 · 2026-02-28</span>
            <div className="text-foreground-subtle text-[11px] truncate">
              ID: MT-881944 · 标签: RAG / LangChain / Multi-Agent
            </div>
          </div>
          <div className="pt-1">
            <span className="text-foreground font-semibold">[3] AI 智能体架构师</span>
            <span className="text-foreground-muted ml-2 text-xs">北京 · 社招 · 2026-02-27</span>
            <div className="text-foreground-subtle text-[11px] truncate">
              ID: MT-879012 · 标签: Go / 微服务 / 高并发
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'compare',
    label: 'job compare',
    tag: '多司比对',
    command: 'job compare "大模型" --sites meituan,xiaomi,tencent --nature social',
    latency: '3 站点聚合 · 128ms',
    metrics: '42 个在招岗位 · 同屏对照',
    content: (
      <div className="space-y-2 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
          ✔ 3 家招聘官网聚合完成 (共 42 个在招岗位)
        </div>
        <div className="overflow-x-auto my-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-foreground-muted">
                <th className="py-1 pr-3 font-medium">站点</th>
                <th className="py-1 pr-3 font-medium">岗位名称</th>
                <th className="py-1 pr-2 font-medium">地点</th>
                <th className="py-1 font-medium">JD 调取指令</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground">
              <tr>
                <td className="py-1 pr-3 font-medium">美团</td>
                <td className="py-1 pr-3">LLM Agent 研发专家</td>
                <td className="py-1 pr-2 text-foreground-muted">北京</td>
                <td className="py-1 text-foreground-subtle">job meituan detail MT-1024</td>
              </tr>
              <tr>
                <td className="py-1 pr-3 font-medium">小米</td>
                <td className="py-1 pr-3">端侧大模型算法专家</td>
                <td className="py-1 pr-2 text-foreground-muted">武汉</td>
                <td className="py-1 text-foreground-subtle">job xiaomi detail XM-8840</td>
              </tr>
              <tr>
                <td className="py-1 pr-3 font-medium">腾讯</td>
                <td className="py-1 pr-3">混元大模型应用工程师</td>
                <td className="py-1 pr-2 text-foreground-muted">深圳</td>
                <td className="py-1 text-foreground-subtle">job tencent detail TC-7719</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: 'agent',
    label: 'Agent 结构化流',
    tag: 'LLM 优化',
    command: 'job tencent search "Agent" --format json --view compact --limit 2',
    latency: 'Context Token -78%',
    metrics: '单岗位 ~80 Tokens · 无 DOM 噪点',
    content: (
      <div className="space-y-1.5 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
          ✔ Agent-Ready JSON Stream (Compact Payload)
        </div>
        <pre className="text-foreground text-[11px] md:text-xs overflow-x-auto bg-background/80 p-2.5 rounded border border-border/60">
{`{
  "site": "tencent",
  "total": 12,
  "view": "compact",
  "jobs": [
    {
      "id": "TC-202603019",
      "title": "腾讯混元 Agent 研发专家",
      "city": "深圳",
      "dept": "TEG技术工程事业群",
      "nature": "social"
    },
    {
      "id": "TC-202602881",
      "title": "微信 AI Agent 后端开发",
      "city": "广州",
      "dept": "WXG微信事业群",
      "nature": "social"
    }
  ]
}`}
        </pre>
      </div>
    ),
  },
];

export function TerminalShowcase() {
  const [activeTab, setActiveTab] = useState(DEMO_SCENARIOS[0].id);
  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeTab) || DEMO_SCENARIOS[0];

  return (
    <div className="w-full rounded-lg border border-border bg-background-subtle shadow-md overflow-hidden transition-all">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-background select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/20 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/20 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/20 inline-block" />
          <span className="ml-2 text-[11px] font-mono text-foreground-muted font-medium">
            jobhunt-cli · {activeScenario.latency}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-background-subtle rounded p-0.5 border border-border">
          {DEMO_SCENARIOS.map((scenario) => {
            const isActive = scenario.id === activeTab;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setActiveTab(scenario.id)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-all cursor-pointer ${
                  isActive
                    ? 'bg-background text-foreground font-semibold shadow-2xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {scenario.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Command prompt bar */}
      <div className="px-3.5 py-2 bg-background/60 border-b border-border/50 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-foreground font-bold shrink-0">$</span>
          <span className="text-foreground font-medium truncate">
            {activeScenario.command}
          </span>
          <span className="w-1.5 h-3.5 bg-foreground/70 animate-pulse shrink-0 inline-block" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CopyButton
            value={activeScenario.command}
            variant="ghost"
            size="icon-sm"
            label="复制演示命令"
            copiedLabel="已复制"
          />
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="p-4 min-h-[200px] max-h-[260px] overflow-y-auto bg-background/30">
        {activeScenario.content}
      </div>

      {/* Technical Quant Bar */}
      <div className="px-3.5 py-1.5 bg-background border-t border-border flex items-center justify-between text-[11px] font-mono text-foreground-subtle">
        <span>{activeScenario.metrics}</span>
        <span className="text-foreground-muted">ANSI Table · JSON · CSV</span>
      </div>
    </div>
  );
}

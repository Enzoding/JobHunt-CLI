import React, { useState } from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const DEMO_SCENARIOS = [
  {
    id: 'search',
    label: 'job search',
    shortLabel: 'search',
    tag: '单司检索',
    command: 'job meituan search "AI Agent" --category 技术类 --view compact --limit 3',
    status: '200 OK · 124ms',
    content: (
      <div className="space-y-2 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
          <span>✔</span> 已连接 meituan 招聘官网 · 耗时 38ms
        </div>
        <div className="text-slate-600">
          找到匹配职位 (当前展示前 3 条 · --view compact 紧凑视图):
        </div>
        <div className="border-l-2 border-emerald-500 pl-3 space-y-1.5 my-1.5">
          <div>
            <span className="text-slate-900 font-bold">[1] AI Agent Builder</span>
            <span className="text-slate-600 ml-2 text-xs">深圳市 · 无人机业务部 · 社招</span>
            <div className="text-slate-500 text-[11px] truncate">
              ID: 4669710957 · 标签: Java / AI Agent / 系统设计 · 更新: 2026-09-01
            </div>
          </div>
          <div className="pt-0.5">
            <span className="text-slate-900 font-bold">[2] AI Agent 工程师</span>
            <span className="text-slate-600 ml-2 text-xs">北京市、上海市 · 核心本地商业 · 社招</span>
            <div className="text-slate-500 text-[11px] truncate">
              ID: 3424768905 · 标签: AI Agent · 更新: 2026-07-23
            </div>
          </div>
          <div className="pt-0.5">
            <span className="text-slate-900 font-bold">[3] AI Agent 开发专家</span>
            <span className="text-slate-600 ml-2 text-xs">北京市、成都市 · 基础研发平台 · 社招</span>
            <div className="text-slate-500 text-[11px] truncate">
              ID: 4603842394 · 标签: 大模型平台 · 更新: 2026-08-28
            </div>
          </div>
        </div>
        <div className="text-slate-600 text-[11px] bg-slate-100/80 px-2.5 py-1.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
          <span className="truncate">💡 运行 <code className="text-emerald-700 font-semibold">job meituan detail 4669710957</code> 可提取完整 JD</span>
        </div>
      </div>
    ),
  },
  {
    id: 'compare',
    label: 'job compare',
    shortLabel: 'compare',
    tag: '多司比对',
    command: 'job compare "大模型" --sites meituan,xiaomi,tencent --nature social',
    status: '3 站点聚合 · 186ms',
    content: (
      <div className="space-y-2 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
          <span>✔</span> 3 家招聘官网聚合完成 (共 42 个在招岗位)
        </div>
        <div className="overflow-x-auto my-1.5">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-1.5 pr-3 font-medium">公司</th>
                <th className="py-1.5 pr-3 font-medium">岗位名称</th>
                <th className="py-1.5 pr-2 font-medium">城市</th>
                <th className="py-1.5 font-medium hidden sm:table-cell">JD 调取指令</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr className="hover:bg-slate-50/70">
                <td className="py-1.5 pr-3 font-semibold text-amber-700">美团</td>
                <td className="py-1.5 pr-3 font-medium text-slate-900">AI Agent Builder</td>
                <td className="py-1.5 pr-2 text-slate-600">深圳</td>
                <td className="py-1.5 text-slate-500 text-[11px] hidden sm:table-cell">job meituan detail 4669710957</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-1.5 pr-3 font-semibold text-orange-700">小米</td>
                <td className="py-1.5 pr-3 font-medium text-slate-900">搜广推算法架构专家</td>
                <td className="py-1.5 pr-2 text-slate-600">北京</td>
                <td className="py-1.5 text-slate-500 text-[11px] hidden sm:table-cell">job xiaomi detail 76774258373</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-1.5 pr-3 font-semibold text-sky-700">腾讯</td>
                <td className="py-1.5 pr-3 font-medium text-slate-900">Agent Security Expert</td>
                <td className="py-1.5 pr-2 text-slate-600">新加坡</td>
                <td className="py-1.5 text-slate-500 text-[11px] hidden sm:table-cell">job tencent detail 20880580459</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-slate-600 text-[11px] bg-slate-100/80 px-2.5 py-1.5 rounded border border-slate-200/80">
          💡 支持 <code className="text-amber-700 font-semibold">--format csv --output compare.csv</code> 导出为本地分析表格
        </div>
      </div>
    ),
  },
  {
    id: 'agent',
    label: 'Agent JSON',
    shortLabel: 'json',
    tag: 'LLM 优化',
    command: 'job tencent search "Agent" --format json --view compact --limit 2',
    status: 'Token 节约 76%',
    content: (
      <div className="space-y-2 text-xs md:text-[13px] leading-relaxed font-mono">
        <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
          <span>✔</span> Agent-Ready JSON Stream (Compact Payload)
        </div>
        <pre className="text-slate-800 text-[11px] sm:text-xs overflow-x-auto bg-slate-900/[0.04] p-2.5 rounded border border-slate-200/80 leading-tight">
<span className="text-slate-400">&#123;</span>
  <span className="text-sky-700 font-semibold">"site"</span>: <span className="text-emerald-700">"tencent"</span>,
  <span className="text-sky-700 font-semibold">"total"</span>: <span className="text-amber-700">12</span>,
  <span className="text-sky-700 font-semibold">"jobs"</span>: <span className="text-slate-400">[</span>
    <span className="text-slate-400">&#123;</span>
      <span className="text-sky-700 font-semibold">"id"</span>: <span className="text-emerald-700">"2088058045916692480"</span>,
      <span className="text-sky-700 font-semibold">"title"</span>: <span className="text-emerald-700">"Agent Security Expert"</span>,
      <span className="text-sky-700 font-semibold">"city"</span>: <span className="text-emerald-700">"新加坡"</span>,
      <span className="text-sky-700 font-semibold">"dept"</span>: <span className="text-emerald-700">"CSIG"</span>
    <span className="text-slate-400">&#125;</span>
  <span className="text-slate-400">]</span>
<span className="text-slate-400">&#125;</span>
        </pre>
        <div className="text-emerald-800 text-[11px] bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded flex items-center gap-1.5 font-medium">
          <span>⚡</span> 单岗位仅 ~200 Tokens，专为 Codex / Claude Code 上下文消除冗余
        </div>
      </div>
    ),
  },
];

export function TerminalShowcase() {
  const [activeTab, setActiveTab] = useState(DEMO_SCENARIOS[0].id);
  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeTab) || DEMO_SCENARIOS[0];

  return (
    <div className="glass-terminal-light w-full rounded-xl overflow-hidden shadow-lg">
      {/* Terminal Titlebar */}
      <div className="glass-terminal-light-titlebar flex items-center justify-between px-3.5 py-2.5 select-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_6px_rgba(255,95,86,0.35)] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_rgba(255,189,46,0.35)] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.35)] inline-block" />
          <span className="ml-2 text-xs font-mono text-slate-600 font-semibold hidden sm:inline-block">
            terminal · jobhunt-cli
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-200/60 rounded-md p-0.5 border border-slate-300/60">
          {DEMO_SCENARIOS.map((scenario) => {
            const isActive = scenario.id === activeTab;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setActiveTab(scenario.id)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <span className="hidden sm:inline">{scenario.label}</span>
                <span className="sm:hidden">{scenario.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Command prompt bar */}
      <div className="glass-terminal-light-prompt px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span className="text-emerald-600 font-bold shrink-0">➜</span>
          <span className="text-slate-400 shrink-0 hidden sm:inline">~</span>
          <span className="text-slate-900 font-semibold truncate">
            {activeScenario.command}
          </span>
          <span className="w-1.5 h-3.5 bg-emerald-600 animate-pulse shrink-0 inline-block" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold hidden md:inline-block">
            {activeScenario.status}
          </span>
          <div className="text-slate-500 hover:text-slate-900">
            <CopyButton
              value={activeScenario.command}
              variant="ghost"
              size="icon-sm"
              label="复制此演示命令"
              copiedLabel="已复制"
            />
          </div>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="glass-terminal-light-body p-3.5 sm:p-4 min-h-[210px] max-h-[295px] overflow-y-auto transition-opacity duration-200">
        {activeScenario.content}
      </div>
    </div>
  );
}

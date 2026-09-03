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
        <div className="text-emerald-400 font-medium flex items-center gap-1.5">
          <span>✔</span> 已连接 meituan 招聘官网 · 耗时 38ms
        </div>
        <div className="text-slate-400">
          找到匹配职位 (当前展示前 3 条 · --view compact 紧凑视图):
        </div>
        <div className="border-l-2 border-emerald-400/60 pl-3 space-y-2 my-2">
          <div>
            <span className="text-white font-semibold">[1] AI Agent Builder</span>
            <span className="text-slate-300 ml-2 text-xs">深圳市 · 无人机业务部 · 社招</span>
            <div className="text-slate-400 text-[11px] truncate">
              ID: 4669710957 · 标签: Java / AI Agent / 系统设计 · 更新: 2026-09-01
            </div>
          </div>
          <div className="pt-0.5">
            <span className="text-white font-semibold">[2] AI Agent 工程师</span>
            <span className="text-slate-300 ml-2 text-xs">北京市、上海市 · 核心本地商业 · 社招</span>
            <div className="text-slate-400 text-[11px] truncate">
              ID: 3424768905 · 标签: AI Agent · 更新: 2026-07-23
            </div>
          </div>
          <div className="pt-0.5">
            <span className="text-white font-semibold">[3] AI Agent 开发专家</span>
            <span className="text-slate-300 ml-2 text-xs">北京市、成都市 · 基础研发平台 · 社招</span>
            <div className="text-slate-400 text-[11px] truncate">
              ID: 4603842394 · 标签: 大模型平台 · 更新: 2026-08-28
            </div>
          </div>
        </div>
        <div className="text-slate-300 text-[11px] bg-white/[0.04] px-2.5 py-1.5 rounded border border-white/10 flex items-center justify-between gap-2">
          <span className="truncate">💡 运行 <code className="text-emerald-300 font-medium">job meituan detail 4669710957</code> 可提取完整 JD</span>
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
        <div className="text-emerald-400 font-medium flex items-center gap-1.5">
          <span>✔</span> 3 家招聘官网聚合完成 (共 42 个在招岗位)
        </div>
        <div className="overflow-x-auto my-1.5">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-1.5 pr-3 font-medium">公司</th>
                <th className="py-1.5 pr-3 font-medium">岗位名称</th>
                <th className="py-1.5 pr-2 font-medium">城市</th>
                <th className="py-1.5 font-medium hidden sm:table-cell">JD 调取指令</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-200">
              <tr className="hover:bg-white/[0.03]">
                <td className="py-1.5 pr-3 font-medium text-amber-300">美团</td>
                <td className="py-1.5 pr-3 text-white">AI Agent Builder</td>
                <td className="py-1.5 pr-2 text-slate-300">深圳</td>
                <td className="py-1.5 text-slate-400 text-[11px] hidden sm:table-cell">job meituan detail 4669710957</td>
              </tr>
              <tr className="hover:bg-white/[0.03]">
                <td className="py-1.5 pr-3 font-medium text-orange-300">小米</td>
                <td className="py-1.5 pr-3 text-white">搜广推算法架构专家</td>
                <td className="py-1.5 pr-2 text-slate-300">北京</td>
                <td className="py-1.5 text-slate-400 text-[11px] hidden sm:table-cell">job xiaomi detail 76774258373</td>
              </tr>
              <tr className="hover:bg-white/[0.03]">
                <td className="py-1.5 pr-3 font-medium text-sky-300">腾讯</td>
                <td className="py-1.5 pr-3 text-white">Agent Security Expert</td>
                <td className="py-1.5 pr-2 text-slate-300">新加坡</td>
                <td className="py-1.5 text-slate-400 text-[11px] hidden sm:table-cell">job tencent detail 20880580459</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-slate-300 text-[11px] bg-white/[0.04] px-2.5 py-1.5 rounded border border-white/10">
          💡 支持 <code className="text-amber-300 font-medium">--format csv --output compare.csv</code> 导出为本地分析表格
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
        <div className="text-emerald-400 font-medium flex items-center gap-1.5">
          <span>✔</span> Agent-Ready JSON Stream (Compact Payload)
        </div>
        <pre className="text-slate-300 text-[11px] sm:text-xs overflow-x-auto bg-black/40 p-2.5 rounded border border-white/10 leading-tight backdrop-blur-xs">
<span className="text-slate-500">&#123;</span>
  <span className="text-cyan-300">"site"</span>: <span className="text-emerald-300">"tencent"</span>,
  <span className="text-cyan-300">"total"</span>: <span className="text-amber-300">12</span>,
  <span className="text-cyan-300">"jobs"</span>: <span className="text-slate-500">[</span>
    <span className="text-slate-500">&#123;</span>
      <span className="text-cyan-300">"id"</span>: <span className="text-emerald-300">"2088058045916692480"</span>,
      <span className="text-cyan-300">"title"</span>: <span className="text-emerald-300">"Agent Security Expert"</span>,
      <span className="text-cyan-300">"city"</span>: <span className="text-emerald-300">"新加坡"</span>,
      <span className="text-cyan-300">"dept"</span>: <span className="text-emerald-300">"CSIG"</span>
    <span className="text-slate-500">&#125;</span>
  <span className="text-slate-500">]</span>
<span className="text-slate-500">&#125;</span>
        </pre>
        <div className="text-emerald-300 text-[11px] bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1.5 rounded flex items-center gap-1.5">
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
    <div className="glass-terminal w-full rounded-xl overflow-hidden">
      {/* Terminal Titlebar */}
      <div className="glass-terminal-titlebar flex items-center justify-between px-3.5 py-2.5 select-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5)] inline-block" />
          <span className="ml-2 text-xs font-mono text-slate-400 font-medium hidden sm:inline-block">
            terminal · jobhunt-cli
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-black/40 rounded-md p-0.5 border border-white/10 backdrop-blur-xs">
          {DEMO_SCENARIOS.map((scenario) => {
            const isActive = scenario.id === activeTab;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setActiveTab(scenario.id)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-xs border border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
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
      <div className="glass-terminal-prompt px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span className="text-emerald-400 font-bold shrink-0">➜</span>
          <span className="text-slate-500 shrink-0 hidden sm:inline">~</span>
          <span className="text-slate-100 font-medium truncate">
            {activeScenario.command}
          </span>
          <span className="w-1.5 h-3.5 bg-emerald-400/80 animate-pulse shrink-0 inline-block" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10 hidden md:inline-block">
            {activeScenario.status}
          </span>
          <div className="text-slate-300">
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
      <div className="glass-terminal-body p-4 sm:p-5 min-h-[220px] max-h-[310px] overflow-y-auto transition-opacity duration-200">
        {activeScenario.content}
      </div>
    </div>
  );
}


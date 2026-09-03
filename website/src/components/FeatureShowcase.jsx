import React, { useState } from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const FEATURES = [
  {
    id: 'unified',
    title: '统一搜索协议',
    badge: '单命令直连',
    tagline: '30+ 平台同一接口，社招/校招/实习无缝切换',
    command: 'job meituan search "算法" --nature social --category 技术类 --limit 5',
    highlights: [
      {
        title: '统一的标准数据规范',
        desc: '各司原始数据格式千差万别，JobHunt 全部映射为规范标准字段（id, title, city, dept, req）',
      },
      {
        title: '智能别名模糊解析',
        desc: '支持传入中文与别名（如 --category 技术、--city 北京），自动映射底层各司内部代码',
      },
      {
        title: '三大招聘性质秒级切换',
        desc: '统一通过 --nature 参数穿透切换 social（社招）、campus（校招）与 intern（实习）',
      },
    ],
    codeTitle: 'normalized-schema.json',
    codeLang: '标准字段规范',
    codeSnippet: `{
  "id": "4669710957",
  "name": "AI Agent Builder",
  "category_name": "技术类",
  "nature_code": "social",
  "location_names": ["深圳市"],
  "department_name": "无人机业务部",
  "updated_at": "2026-09-01",
  "url": "https://zhaopin.meituan.com/job-detail?jobId=4669710957"
}`,
  },
  {
    id: 'compare',
    title: '跨司横向比对',
    badge: '同屏聚合',
    tagline: '一次查询多家大厂在招岗位，同屏比对职责与发布时间',
    command: 'job compare "前端架构" --sites meituan,xiaomi,tencent --nature social',
    highlights: [
      {
        title: '多招聘站并行并发拉取',
        desc: '同时向美团、小米、腾讯等多个官网发起异步请求，毫秒级聚合并去重',
      },
      {
        title: '同屏对照排版',
        desc: '告别数十个繁杂网页标签页的反复跳转，终端或表格直接横向透视岗位差异',
      },
      {
        title: '直接导出 CSV / JSON 分析表格',
        desc: '配合 --format csv --output compare.csv，方便接入 Excel 或本地 Python 脚本分析',
      },
    ],
    codeTitle: 'cross-company-matrix.txt',
    codeLang: '聚合对比矩阵',
    codeSnippet: `┌──────────┬────────────────────────────┬────────┬────────────┐
│ 站点     │ 职位名称                   │ 城市   │ 更新时间   │
├──────────┼────────────────────────────┼────────┼────────────┤
│ meituan  │ 核心系统前端技术专家       │ 北京   │ 2026-09-02 │
│ xiaomi   │ 大模型终端应用前端负责人   │ 北京   │ 2026-09-01 │
│ tencent  │ 全栈前端架构师 (微信生态)  │ 广州   │ 2026-08-30 │
└──────────┴────────────────────────────┴────────┴────────────┘`,
  },
  {
    id: 'agent-native',
    title: 'Agent 原生流',
    badge: 'Token 优化',
    tagline: '剔除冗余 HTML 噪点，单岗节省 75%+ Token 消耗',
    command: 'job aliyun search "Agent" --format json --view compact',
    highlights: [
      {
        title: '纯粹结构化，消除 DOM 噪声',
        desc: '智能剔除导航条、追踪脚本与排版杂质，只保留核心 JD 要求与技能画像',
      },
      {
        title: '极致上下文 Token 节约',
        desc: '10 个岗位的完整网页需要 >8,000 Tokens，JobHunt Compact 视图仅需 ~600 Tokens',
      },
      {
        title: '开箱集成主流 Agent 运行时',
        desc: '标准技能规范，专为 Codex, Claude Code, Cursor, Windsurf 与 OpenClaw 打造',
      },
    ],
    codeTitle: 'token-savings.json',
    codeLang: 'Token 消耗对比',
    codeSnippet: `{
  "raw_html_crawling": {
    "tokens": 8420,
    "payload": "包含大量 DOM、CSS、追踪脚本与全局导航"
  },
  "jobhunt_compact_json": {
    "tokens": 612,
    "savings": "92.7% Token 节约",
    "prompt_friendly": true
  }
}`,
  },
];

export function FeatureShowcase() {
  const [selectedFeature, setSelectedFeature] = useState(FEATURES[0].id);
  const active = FEATURES.find((f) => f.id === selectedFeature) || FEATURES[0];

  return (
    <div className="space-y-6">
      {/* Feature Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {FEATURES.map((feature) => {
          const isSelected = feature.id === selectedFeature;
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setSelectedFeature(feature.id)}
              className={`text-left p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-foreground/80 bg-white shadow-sm ring-1 ring-border'
                  : 'border-border bg-background-subtle/50 hover:bg-background-subtle hover:border-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                  isSelected
                    ? 'bg-foreground text-background border-foreground font-semibold'
                    : 'bg-foreground/5 text-foreground-muted border-border'
                }`}>
                  {feature.badge}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <h3 className="text-base font-semibold text-foreground tracking-tight mb-1">
                {feature.title}
              </h3>
              <p className="text-foreground-muted text-xs sm:text-[13px] leading-relaxed line-clamp-2 m-0">
                {feature.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Detail Showcase Panel */}
      <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Key Highlights & Command */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-xs font-mono text-foreground-muted font-medium uppercase tracking-wider block mb-1">
                {active.badge} · 核心特性
              </span>
              <h4 className="text-xl font-bold text-foreground tracking-tight">
                {active.title}
              </h4>
            </div>

            {/* Checklist of value points */}
            <div className="space-y-3 py-1">
              {active.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-foreground font-semibold block">{item.title}</strong>
                    <span className="text-foreground-muted">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/80">
              <div className="text-[11px] font-mono text-foreground-subtle mb-1.5 font-medium">
                示例运行命令:
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background-subtle text-xs font-mono text-foreground">
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

          {/* Right Column: High-contrast Output Showcase */}
          <div className="lg:col-span-7">
            <div className="glass-terminal rounded-xl overflow-hidden">
              <div className="glass-terminal-titlebar flex items-center justify-between px-3.5 py-2 text-[11px] font-mono select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5)] inline-block" />
                  </div>
                  <span className="text-slate-300 font-medium ml-1">{active.codeTitle}</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10">
                  {active.codeLang}
                </span>
              </div>
              <pre className="glass-terminal-body p-4 m-0 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
                {active.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


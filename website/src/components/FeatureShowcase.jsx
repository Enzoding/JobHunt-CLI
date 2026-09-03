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
    <div className="space-y-4">
      {/* Feature Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FEATURES.map((feature) => {
          const isSelected = feature.id === selectedFeature;
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setSelectedFeature(feature.id)}
              className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-background border-foreground/30 shadow-xs ring-1 ring-foreground/5'
                  : 'bg-background-subtle/40 border-border/70 hover:bg-background hover:border-border text-foreground-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-muted font-medium">
                  {feature.badge}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div
                className={`text-sm sm:text-base font-bold tracking-tight ${
                  isSelected ? 'text-foreground' : 'text-foreground/80'
                }`}
              >
                {feature.title}
              </div>
              <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1 leading-relaxed">
                {feature.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Feature Detail Showcase Card */}
      <div className="rounded-xl border border-border bg-background p-4 sm:p-5 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Key Highlights & Command */}
          <div className="lg:col-span-5 space-y-3">
            <div>
              <span className="text-xs font-mono text-foreground-muted font-medium uppercase tracking-wider block mb-0.5">
                {active.badge} · 核心特性
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                {active.title}
              </h4>
            </div>

            {/* Checklist of value points */}
            <div className="space-y-2 py-0.5">
              {active.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-foreground font-semibold block">{item.title}</strong>
                    <span className="text-foreground-muted">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1.5 border-t border-border/80">
              <div className="text-[11px] font-mono text-foreground-subtle mb-1 font-medium">
                示例运行命令:
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-background-subtle text-xs font-mono text-foreground">
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
            <div className="glass-terminal-light rounded-xl overflow-hidden shadow-xs">
              <div className="glass-terminal-light-titlebar flex items-center justify-between px-3.5 py-2 text-[11px] font-mono select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_6px_rgba(255,95,86,0.35)] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_rgba(255,189,46,0.35)] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.35)] inline-block" />
                  </div>
                  <span className="text-slate-700 font-semibold ml-1">{active.codeTitle}</span>
                </div>
                <span className="text-slate-600 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80">
                  {active.codeLang}
                </span>
              </div>
              <pre className="glass-terminal-light-body p-3.5 m-0 overflow-x-auto font-mono text-xs leading-relaxed text-slate-800">
                {active.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


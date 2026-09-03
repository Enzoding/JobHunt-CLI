import React, { useState } from 'react';

const SCENARIOS = [
  {
    id: 'search',
    number: '01',
    label: '定向检索',
    title: '定向岗位检索',
    summary: '指定公司、城市、类别与性质，直接检索官网在招岗位，返回干净的结构化数据。',
    prompt: '查一下美团在深圳最近更新的 AI Agent 技术岗，社招，返回前 3 条。',
    command: 'job meituan search "AI Agent" --category 技术类 --location 深圳 --nature social --limit 3',
    points: [
      '直连各公司公开招聘网关，跳过第三方中介与过期职位',
      '支持中英文别名模糊匹配（如 技术类、深圳、社招）',
      '直接输出岗位 ID 与官网直达链接，便于后续调用完整 JD',
    ],
    previewType: 'list',
    previewItems: [
      {
        company: '美团',
        title: 'AI Agent 架构师',
        dept: '无人机业务部',
        city: '深圳',
        date: '2026-09-01',
        id: '4669710957',
        tags: ['Java / Python', 'Agent 决策编排', '分布式架构'],
      },
      {
        company: '美团',
        title: '大模型应用研发专家',
        dept: '基础研发平台',
        city: '深圳',
        date: '2026-08-28',
        id: '4669820114',
        tags: ['RAG 架构', '模型微调', '高并发工程'],
      },
    ],
  },
  {
    id: 'compare',
    number: '02',
    label: '跨司比对',
    title: '多司横向比对',
    summary: '一次查询聚合多家大厂在招岗位，同屏对照岗位职责、技术栈侧重与门槛差异。',
    prompt: '对比小米、腾讯和美团目前在招的大模型算法岗位，按技能要求与业务线对比。',
    command: 'job compare "大模型" --sites xiaomi,tencent,meituan --nature social',
    points: [
      '并发请求多家招聘官网，自动按岗位语义合并去重',
      '同屏矩阵对照各厂用人要求，无需在数十个网页标签间跳转',
      '支持导出 CSV 或 JSON，可直接供分析脚本或大模型消费',
    ],
    previewType: 'table',
    previewRows: [
      {
        site: '小米',
        role: '端侧大模型算法专家',
        dept: '手机软件部',
        focus: '模型轻量化、端侧 NPU 部署',
        exp: '3-5 年',
      },
      {
        site: '腾讯',
        role: 'Agent 架构与安全专家',
        dept: '云与智慧产业事业群',
        focus: 'Multi-Agent 协同、企业安全治理',
        exp: '5 年以上',
      },
      {
        site: '美团',
        role: '推荐大模型算法专家',
        dept: '核心本地商业',
        focus: '大规模召回排序、业务 ROI 优化',
        exp: '3 年以上',
      },
    ],
  },
  {
    id: 'trends',
    number: '03',
    label: '趋势分析',
    title: '招聘趋势与技术风向',
    summary: '分析目标公司近期放岗动态与技术关键词分布，快速识别团队扩招方向。',
    prompt: '分析快手、字节和滴滴近期放出的算法岗位，统计高频技术关键词分布。',
    command: 'job analyze --site kuaishou,bytedance,didi --keyword "算法"',
    points: [
      '基于官网实时放岗时间戳统计，杜绝长期不招的挂靠职位',
      '自动提取高频技能词频分布，直观洞悉行业热点技术演进',
      '帮助求职者按需调整准备方向，帮助团队做人才市场调研',
    ],
    previewType: 'stats',
    statBars: [
      { label: '多模态 / Agent 系统研发', count: '38 岗位', percentage: '76%' },
      { label: '模型加速与推理框架 (Triton/CUDA)', count: '29 岗位', percentage: '58%' },
      { label: '搜索推荐业务算法优化', count: '22 岗位', percentage: '44%' },
      { label: '具身智能与感知规划', count: '15 岗位', percentage: '30%' },
    ],
    keywords: ['Agent', 'RLHF', 'Triton', 'RAG', '端侧量化', '分布式训练', '召回排序'],
  },
  {
    id: 'detail',
    number: '04',
    label: 'JD 提取',
    title: 'JD 结构化提取与分析',
    summary: '提取指定职位的完整官方职责描述与任职要求，输出纯净文本供大模型比对。',
    prompt: '调取腾讯此 Agent 岗位的完整 JD，与我的项目经历做对比，指出差距。',
    command: 'job tencent detail 2088058045916692480',
    points: [
      '剔除网页多余 HTML 噪音与导航元素，单岗位提取 Token 极低',
      '职责与任职资格严格分字段输出，便于针对性撰写简历与面试准备',
      '支持与各类 Agent 工作流无缝配合，自动化生成求职分析报告',
    ],
    previewType: 'jd',
    jdDetail: {
      title: 'Agent 架构与安全专家',
      org: '腾讯 · 云与智慧产业事业群',
      duties: [
        '负责企业级 Multi-Agent 平台的架构设计与核心编排引擎研发；',
        '设计 Agent 执行过程中的权限隔离、数据防泄漏与合规校验体系；',
      ],
      requirements: [
        '计算机及相关专业本科以上学历，5 年以上分布式或云原生系统研发经验；',
        '深入理解主流大模型调用框架，对 Agent 决策规划与工具调用有实战经验。',
      ],
    },
  },
];

export function UserScenarios() {
  const [activeTab, setActiveTab] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === activeTab) || SCENARIOS[0];

  return (
    <div className="space-y-6">
      {/* Scenario Selector Tabs */}
      <div
        role="tablist"
        aria-label="典型使用场景分类"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5"
      >
        {SCENARIOS.map((s) => {
          const isSelected = s.id === activeTab;
          return (
            <button
              key={s.id}
              id={`tab-${s.id}`}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${s.id}`}
              type="button"
              onClick={() => setActiveTab(s.id)}
              className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-background border-foreground/30 shadow-xs'
                  : 'bg-background-subtle/40 border-border/70 hover:bg-background hover:border-border text-foreground-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-foreground-muted font-semibold">
                  {s.number}
                </span>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-foreground text-background font-medium'
                      : 'bg-foreground/5 text-foreground-muted'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              <div
                className={`text-sm font-semibold tracking-tight ${
                  isSelected ? 'text-foreground' : 'text-foreground/80'
                }`}
              >
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Detail Panel */}
      <div
        id={`panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${active.id}`}
        className="rounded-xl border border-border bg-background p-5 sm:p-6 shadow-xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Context & Workflow */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Scenario {active.number}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {active.title}
              </h3>
              <p className="text-sm text-foreground-muted mt-1 leading-relaxed">
                {active.summary}
              </p>
            </div>

            {/* Instruction and CLI command */}
            <div className="rounded-lg border border-border bg-background-subtle/50 p-3.5 space-y-2 text-xs font-mono">
              <div className="text-foreground-muted text-[11px] flex items-center justify-between">
                <span>用户指令</span>
                <span className="text-[10px] uppercase text-foreground-muted/80">自然语言</span>
              </div>
              <div className="text-foreground font-sans font-medium text-xs sm:text-[13px] leading-relaxed bg-background p-2.5 rounded border border-border/80">
                “{active.prompt}”
              </div>
              <div className="text-foreground-muted text-[11px] pt-1">
                <span>底层对应执行指令：</span>
                <div className="mt-1 text-foreground font-mono bg-foreground/5 p-2 rounded border border-border break-all">
                  {active.command}
                </div>
              </div>
            </div>

            {/* Value checklist */}
            <ul className="space-y-1.5 text-xs sm:text-sm text-foreground-muted">
              {active.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-foreground/80 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Structured Output Preview */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-lg border border-border bg-background-subtle/30 p-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5 mb-3 text-xs">
                <span className="font-mono text-foreground-muted font-medium">
                  结构化数据交付预览
                </span>
                <span className="font-mono text-[11px] text-foreground-muted">
                  官方公开源
                </span>
              </div>

              {/* View 1: List Cards */}
              {active.previewType === 'list' && (
                <div className="space-y-2.5">
                  {active.previewItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-background rounded-md border border-border p-3 space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-foreground/5 border border-border text-foreground">
                            {item.company}
                          </span>
                          <span className="font-semibold text-foreground text-sm">
                            {item.title}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-foreground-muted">
                          {item.date}
                        </span>
                      </div>
                      <div className="text-xs text-foreground-muted flex items-center gap-2">
                        <span>{item.city}</span>
                        <span>·</span>
                        <span>{item.dept}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px]">ID: {item.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.tags.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-muted border border-border/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 2: Table Comparison */}
              {active.previewType === 'table' && (
                <div className="bg-background rounded-md border border-border overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-background-subtle border-b border-border text-foreground-muted font-medium">
                          <th className="py-2 px-3">公司</th>
                          <th className="py-2 px-3">职位</th>
                          <th className="py-2 px-3">核心技能侧重</th>
                          <th className="py-2 px-3">门槛</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {active.previewRows.map((r, rIdx) => (
                          <tr key={rIdx} className="hover:bg-background-subtle/50">
                            <td className="py-2 px-3 font-medium font-mono text-[11px]">
                              {r.site}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-medium text-foreground">{r.role}</div>
                              <div className="text-[10px] text-foreground-muted">{r.dept}</div>
                            </td>
                            <td className="py-2 px-3 text-foreground-muted text-[11px]">
                              {r.focus}
                            </td>
                            <td className="py-2 px-3 text-foreground-muted text-[11px] whitespace-nowrap">
                              {r.exp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 3: Trend Statistics */}
              {active.previewType === 'stats' && (
                <div className="bg-background rounded-md border border-border p-3.5 space-y-3 shadow-2xs">
                  <div className="space-y-2">
                    {active.statBars.map((b, bIdx) => (
                      <div key={bIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground font-medium">{b.label}</span>
                          <span className="font-mono text-foreground-muted text-[11px]">
                            {b.count}
                          </span>
                        </div>
                        <div className="w-full bg-foreground/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-foreground/70 h-1.5 rounded-full"
                            style={{ width: b.percentage }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-border">
                    <div className="text-xs text-foreground-muted mb-1.5">高频技术关键词：</div>
                    <div className="flex flex-wrap gap-1">
                      {active.keywords.map((k, kIdx) => (
                        <span
                          key={kIdx}
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 text-foreground border border-border"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* View 4: Full JD Extraction */}
              {active.previewType === 'jd' && (
                <div className="bg-background rounded-md border border-border p-3.5 space-y-2.5 shadow-2xs text-xs">
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {active.jdDetail.title}
                    </div>
                    <div className="text-[11px] text-foreground-muted">{active.jdDetail.org}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-medium text-foreground text-[11px]">岗位职责：</div>
                    <ul className="space-y-0.5 text-foreground-muted text-[11px] list-disc list-inside">
                      {active.jdDetail.duties.map((d, dIdx) => (
                        <li key={dIdx}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-border">
                    <div className="font-medium text-foreground text-[11px]">任职要求：</div>
                    <ul className="space-y-0.5 text-foreground-muted text-[11px] list-disc list-inside">
                      {active.jdDetail.requirements.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

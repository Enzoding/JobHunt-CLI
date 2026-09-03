import React, { useState } from 'react';

const SCENARIOS = [
  {
    id: 'search',
    icon: '🔍',
    badge: '精准直查',
    title: '让 Agent 当你的大厂求职侦探',
    summary: '无需挨个注册几十家大厂官网，一句话让 AI 秒查最新一手 JD',
    painPoint: '在字节、美团、腾讯等各个招聘站点间反复切换、登录验证、手动翻页，耗时耗力还容易漏掉急招机会。',
    solution: '直接对 Agent 说出你的诉求，后台直连官方招聘接口，自动完成关键词匹配、部门过滤与去重，秒出结果。',
    userPrompt: '帮我查一下美团在深圳最近更新的所有 AI Agent 和大模型岗位，只要技术类社招，按最新时间排序。',
    agentAction: 'job meituan search "AI Agent" --category 技术类 --location 深圳 --nature social --limit 3',
    highlights: [
      '直连官方数据源：告别第三方二手招聘软件的虚假过期岗位与猎头中介骚扰',
      '极速秒级直达：直接输出岗位 ID 与官网直达投递链接，支持一键调取完整 JD',
      '部门标签穿透：一目了然看清岗位隶属于无人机、基础研发还是商业化等核心业务线',
    ],
    previewType: 'job_cards',
    previewData: [
      {
        company: '美团',
        companyBadge: 'bg-amber-100 text-amber-800 border-amber-200',
        title: 'AI Agent Builder / 系统架构师',
        city: '深圳市',
        dept: '无人机业务部 · 核心研发组',
        date: '2026-09-01',
        tags: ['Java / Python', 'Agent 决策架构', '分布式系统'],
        linkHint: '官网直达投递编号: 4669710957',
      },
      {
        company: '美团',
        companyBadge: 'bg-amber-100 text-amber-800 border-amber-200',
        title: '大模型应用研发专家',
        city: '深圳市',
        dept: '基础研发平台 · 认知智能中心',
        date: '2026-08-28',
        tags: ['RAG 检索增强', 'Prompt 工程', '高并发落地'],
        linkHint: '官网直达投递编号: 4669820114',
      },
    ],
  },
  {
    id: 'compare',
    icon: '⚖️',
    badge: '横向对比',
    title: '多家大厂同屏透视，科学选 Offer',
    summary: '横向拉齐各厂在招 JD，一眼看清技术栈要求、门槛差异与业务侧重',
    painPoint: '想了解不同大厂对同一技术方向（如“推荐算法”）的要求差异，浏览器打开几十个标签页肉眼比对，容易遗漏关键硬指标。',
    solution: '跨司聚合命令将多家官网相同方向的岗位聚拢于同屏，生成清晰的对比矩阵与技能标签横向雷达。',
    userPrompt: '对比一下小米、腾讯和美团目前在招的大模型算法专家，看它们在技能栈、经验门槛和业务重心上有什么区别？',
    agentAction: 'job compare "大模型" --sites xiaomi,tencent,meituan --nature social',
    highlights: [
      '同屏矩阵呈现：一页拉通 3~5 家大厂在招岗位，消除信息差',
      '技术栈差异透视：快速识别哪家偏工程落地、哪家看重底层训练、哪家侧重端侧推理',
      '面试与谈薪利器：全盘掌握同赛道大厂的用人标准，制定更有针对性的谈薪与面试策略',
    ],
    previewType: 'comparison_table',
    previewRows: [
      {
        site: '小米',
        siteBadge: 'bg-orange-100 text-orange-800 border-orange-200',
        role: '端侧大模型算法专家',
        dept: '手机部 · 基础软件',
        focus: '模型轻量化 / 移动端 NPU 部署',
        exp: '3-5 年 · 硕士及以上',
      },
      {
        site: '腾讯',
        siteBadge: 'bg-sky-100 text-sky-800 border-sky-200',
        role: 'Agent 架构与安全专家',
        dept: 'CSIG · 云与智慧产业',
        focus: '企业级 Multi-Agent 编排 / 治理',
        exp: '5 年以上 · 具备分布式经验',
      },
      {
        site: '美团',
        siteBadge: 'bg-amber-100 text-amber-800 border-amber-200',
        role: '推荐与大模型应用专家',
        dept: '核心本地商业 · 搜索推荐',
        focus: '大规模电商召回与排序 / ROI',
        exp: '3 年以上 · 有工业界落地经验',
      },
    ],
  },
  {
    id: 'radar',
    icon: '📡',
    badge: '招聘雷达',
    title: '实时追踪大厂业务扩招与行业动向',
    summary: '跳过过时的二手资讯，直接消费各大厂官方最新放岗数据',
    painPoint: '市面上的行业薪酬与扩招报告往往滞后数月，第三方网站充斥已招满但未下线的“僵尸职位”。',
    solution: '基于各厂官网公开接口的时间戳与在招清单实时统计，快速捕捉哪条业务线在扩招、哪类技能在起飞。',
    userPrompt: '分析一下快手、字节和滴滴最近一个月放出的算法职位，告诉我哪些细分方向最缺人，高频技术词有哪些？',
    agentAction: 'job analyze --site kuaishou,bytedance,didi --keyword "算法"',
    highlights: [
      '真放岗零滞后：只统计官网当前处于 open 状态并近期活跃更新的真实职位',
      '扩招团队雷达：精准定位正在大举揽才的部门（如具身智能组、出海商业化、自研芯片团队）',
      '技术风向标：基于真实招聘需求自动提取高频技术关键词与经验要求分布',
    ],
    previewType: 'trend_radar',
    topTeams: [
      { name: '多模态多智能体实验室', trend: '急招中 · 本周新增 8 岗', share: '38%' },
      { name: '全球化电商与商业化技术', trend: '持续放岗 · 扩编 30%', share: '29%' },
      { name: '基础架构与算力调度平台', trend: '稳步招聘 · 高职级为主', share: '21%' },
    ],
    hotKeywords: ['Multi-Agent', 'RLHF / DPO', '端侧量化', '分布式推理', 'CUDA / Triton', '电商搜索召回'],
  },
  {
    id: 'resume',
    icon: '🎯',
    badge: '智能匹配',
    title: 'AI 简历智能匹配与针对性求职攻略',
    summary: '让 Agent 拿着你的背景去核对真实官网 JD，生成逐条优化与面试建议',
    painPoint: '一份通用简历海投几十家大厂往往石沉大海，针对每家 JD 手工逐句修改简历极其耗费精力。',
    solution: '调出目标岗位的完整官方 JD（职责 + 硬性任职要求），让 Agent 与个人履历做全景 Gap 分析，定制改进行动项。',
    userPrompt: '这是我的简历文本，请调取腾讯这个 Agent 安全岗位的完整 JD，评估我的匹配度，并帮我定制一份面试答辩重点。',
    agentAction: 'job tencent detail 2088058045916692480',
    highlights: [
      '官方完整 JD 提取：不仅有标题，还有详细工作职责与任职资格全文，支持一键塞给 LLM',
      '精准 Gap 诊断：清楚指出个人履历在目标大厂对应岗位上的优势项与潜在短板',
      '面试问题预演：基于目标团队当下具体业务挑战，生成极高命中率的实战面试问题集',
    ],
    previewType: 'resume_match',
    matchScore: '88%',
    matchAnalysis: [
      { type: 'strong', text: '5 年分布式高并发经验与目标团队的平台吞吐要求完全吻合' },
      { type: 'strong', text: '熟练掌握 Agent 编排框架（LangGraph / AutoGen），与岗位核心职责强相关' },
      { type: 'warning', text: '建议简历中强化关于“企业级数据隔离与安全合规防护”的实战项目描述' },
    ],
  },
];

export function UserScenarios() {
  const [activeTab, setActiveTab] = useState(SCENARIOS[0].id);
  const activeScenario = SCENARIOS.find((s) => s.id === activeTab) || SCENARIOS[0];

  return (
    <div className="space-y-8">
      {/* 4 Interactive Scenario Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((scenario) => {
          const isActive = scenario.id === activeTab;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setActiveTab(scenario.id)}
              className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-background border-foreground/30 shadow-md ring-1 ring-foreground/10'
                  : 'bg-background/40 border-border/70 hover:bg-background/70 hover:border-border-strong text-foreground-muted'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xl">{scenario.icon}</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-foreground text-background font-semibold border-foreground'
                      : 'bg-background-subtle text-foreground-muted border-border'
                  }`}
                >
                  {scenario.badge}
                </span>
              </div>
              <div>
                <h3
                  className={`text-sm sm:text-base font-semibold leading-snug tracking-tight mb-1 ${
                    isActive ? 'text-foreground' : 'text-foreground/80'
                  }`}
                >
                  {scenario.title}
                </h3>
                <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                  {scenario.summary}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Showcase Panel */}
      <div className="rounded-2xl border border-border/80 bg-background/90 p-5 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Problem & User Story */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <span>{activeScenario.icon}</span>
                <span>典型解决场景 · {activeScenario.badge}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {activeScenario.title}
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {activeScenario.summary}
              </p>
            </div>

            {/* Pain Point vs JobHunt Solution */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="rounded-lg bg-rose-50/70 border border-rose-200/80 p-3 text-rose-950 flex items-start gap-2.5">
                <span className="shrink-0 text-rose-500 font-bold">✕ 传统痛点</span>
                <span className="text-rose-900/90 leading-relaxed">{activeScenario.painPoint}</span>
              </div>
              <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/80 p-3 text-emerald-950 flex items-start gap-2.5">
                <span className="shrink-0 text-emerald-600 font-bold">✔ 解决方案</span>
                <span className="text-emerald-900/90 leading-relaxed">{activeScenario.solution}</span>
              </div>
            </div>

            {/* Conversational Prompt Bubble */}
            <div className="rounded-xl border border-border bg-background-subtle/50 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-medium text-foreground-muted">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span>💬</span> 你只需对 Agent 吩咐：
                </span>
                <span className="font-mono text-[11px] text-foreground-muted">自然语言即可驱动</span>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border/80 text-foreground font-medium text-xs sm:text-sm leading-relaxed shadow-2xs">
                “{activeScenario.userPrompt}”
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-foreground-muted pt-1">
                <span className="text-slate-400 font-bold">Agent 底层调用:</span>
                <code className="text-foreground font-semibold bg-foreground/5 px-1.5 py-0.5 rounded border border-border truncate">
                  {activeScenario.agentAction}
                </code>
              </div>
            </div>

            {/* Highlights checklist */}
            <ul className="space-y-2 text-xs sm:text-sm text-foreground-muted">
              {activeScenario.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✔</span>
                  <span className="leading-relaxed text-foreground-muted">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Concrete Result Delivered to User */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Agent 交付的结构化成果</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  真实官网数据 · 零二手噪点
                </span>
              </div>

              {/* Preview 1: Job Cards (for Search) */}
              {activeScenario.previewType === 'job_cards' && (
                <div className="space-y-3">
                  {activeScenario.previewData.map((job, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg border border-slate-200/90 p-3.5 space-y-2 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${job.companyBadge}`}>
                              {job.company}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 tracking-tight">
                              {job.title}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>📍 {job.city}</span>
                            <span>•</span>
                            <span>🏢 {job.dept}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {job.date}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {job.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">{job.linkHint}</span>
                        <span className="text-emerald-600 font-medium hover:underline cursor-pointer">
                          调取完整 JD →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview 2: Comparison Table (for Compare) */}
              {activeScenario.previewType === 'comparison_table' && (
                <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2.5 px-3">大厂</th>
                          <th className="py-2.5 px-3">在招职位</th>
                          <th className="py-2.5 px-3">核心技能侧重</th>
                          <th className="py-2.5 px-3">经验门槛</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {activeScenario.previewRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-semibold">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${row.siteBadge}`}>
                                {row.site}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-slate-900">{row.role}</div>
                              <div className="text-[10px] text-slate-400">{row.dept}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                              {row.focus}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                              {row.exp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>💡 一键导出为本地 Excel/CSV 报表</span>
                    <span className="font-mono text-slate-400">已聚合 3 家大厂数据</span>
                  </div>
                </div>
              )}

              {/* Preview 3: Trend Radar (for Radar) */}
              {activeScenario.previewType === 'trend_radar' && (
                <div className="bg-white rounded-lg border border-slate-200/90 p-4 space-y-4 shadow-xs">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 mb-2.5 flex items-center justify-between">
                      <span>🔥 本月大厂急招部门与业务方向</span>
                      <span className="text-[10px] text-emerald-600 font-mono">官网实时统计</span>
                    </div>
                    <div className="space-y-2">
                      {activeScenario.topTeams.map((team, tIdx) => (
                        <div key={tIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800">{team.name}</span>
                            <span className="text-emerald-700 font-mono text-[11px] font-semibold">{team.trend}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: team.share }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-900 mb-2">
                      高频核心技术栈关键词（词频 Top）
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScenario.hotKeywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-mono font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview 4: Resume Matching (for Resume) */}
              {activeScenario.previewType === 'resume_match' && (
                <div className="bg-white rounded-lg border border-slate-200/90 p-4 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div>
                      <div className="text-xs font-semibold text-emerald-900">
                        腾讯云 · Agent 安全专家 岗位匹配评估
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        基于候选人履历与官方 JD 全文逐条交叉验证
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                        {activeScenario.matchScore}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">综合匹配度</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-800">
                      AI 诊断与建议改进行动项：
                    </div>
                    {activeScenario.matchAnalysis.map((item, mIdx) => (
                      <div
                        key={mIdx}
                        className={`text-xs p-2.5 rounded border flex items-start gap-2 ${
                          item.type === 'strong'
                            ? 'bg-emerald-50/40 border-emerald-200/70 text-slate-700'
                            : 'bg-amber-50/50 border-amber-200 text-slate-800'
                        }`}
                      >
                        <span className="shrink-0 mt-0.5 font-bold">
                          {item.type === 'strong' ? '🟢 优势' : '⚠️ 建议'}
                        </span>
                        <span className="leading-relaxed">{item.text}</span>
                      </div>
                    ))}
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

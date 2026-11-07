import React, { useState } from 'react';
import { Search } from 'lucide-react';

const COMPARISON_DATA = [
  {
    company: '小米',
    logo: '/logos/companies/xiaomi.svg',
    title: '端侧大模型算法专家',
    dept: '手机软件部 · AI 实验室',
    city: '北京 / 武汉',
    date: '2026-09-02',
    focus: '端侧模型轻量化、NPU 推理加速、低延迟端侧 Agent 部署',
    exp: '3-5 年',
    id: 'XM-AI-2026-08',
  },
  {
    company: '腾讯',
    logo: '/logos/companies/tencent.svg',
    title: '大模型应用研发专家 (混元)',
    dept: 'PCG 技术工程事业群',
    city: '深圳 / 北京',
    date: '2026-08-31',
    focus: '基于混元大模型的复杂 Agent 决策框架、RAG 向量检索工程',
    exp: '3-5 年',
    id: 'TX-HY-9921',
  },
  {
    company: '美团',
    logo: '/logos/companies/meituan.svg',
    title: 'AI Agent 架构师',
    dept: '无人机业务部 · 决策系统',
    city: '深圳',
    date: '2026-09-01',
    focus: '多智能体任务自治、Function Calling 外部工具链编排',
    exp: '5 年以上',
    id: '4669710957',
  },
  {
    company: '快手',
    logo: '/logos/companies/kuaishou.svg',
    title: 'AI Agent 全栈研发专家',
    dept: '主站研发中心',
    city: '北京 / 杭州',
    date: '2026-08-28',
    focus: '公开网关 HMAC 校验、FastAPI + Vue 3 智能体可视化控制台',
    exp: '3-5 年',
    id: '104829',
  },
  {
    company: '字节跳动',
    logo: '/logos/companies/bytedance.svg',
    title: '大模型应用架构专家 (Agent 方向)',
    dept: 'Flow 业务线',
    city: '上海 / 深圳',
    date: '2026-08-30',
    focus: 'Prompt Engineering、LangChain / LlamaIndex、自主 Agent 编排',
    exp: '3-5 年',
    id: '1749281',
  },
];

export function CrossCompanyMatrix() {
  const [filterQuery, setFilterQuery] = useState('');

  const compareCommand = 'job compare "大模型" --sites xiaomi,tencent,meituan,kuaishou,bytedance';

  const filtered = COMPARISON_DATA.filter((row) =>
    (row.title + row.company + row.focus).toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <section id="compare" className="py-20 sm:py-28 bg-[var(--m-paper)] border-b border-[var(--m-line)]">
      <div className="page-shell">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-balance text-[var(--m-ink)] sm:text-4xl">
            把多家公司放在一起对比
          </h2>
          <p className="mt-3 text-base leading-7 text-pretty text-[var(--m-muted)]">
            用同一个条件，看各家在招什么岗位、在哪个城市、要求差在哪里。
          </p>
        </div>

        {/* Matrix Container */}
        <div className="rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-[var(--m-card)] border-b border-[var(--m-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="min-w-0 font-mono text-xs leading-5 break-all text-[var(--m-ink)]">
              <span className="text-[var(--m-muted)]">安装完成后运行 </span>
              {compareCommand}
            </p>
            <div className="flex items-center gap-2">
              <label className="flex w-full items-center gap-2 sm:w-72">
                <span className="shrink-0 text-xs text-[var(--m-muted)]">筛选</span>
                <span className="relative block min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--m-muted)]" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="例如：端侧、RAG"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full rounded-lg border border-[var(--m-line)] bg-[var(--m-panel)] py-1.5 pr-3 pl-8 font-mono text-xs text-[var(--m-ink)] placeholder-[var(--m-muted)] focus:border-[var(--m-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m-accent)]"
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--m-line)] bg-[var(--m-panel)] text-[var(--m-muted)] font-mono">
                  <th scope="col" className="py-3 px-4 font-semibold">公司</th>
                  <th scope="col" className="py-3 px-4 font-semibold">岗位和部门</th>
                  <th scope="col" className="py-3 px-4 font-semibold">城市</th>
                  <th scope="col" className="py-3 px-4 font-semibold">岗位要求</th>
                  <th scope="col" className="py-3 px-4 font-semibold">经验要求</th>
                  <th scope="col" className="py-3 px-4 font-semibold">发布日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--m-line)] text-[var(--m-ink)] font-sans">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--m-card)] transition-colors group">
                    <td className="py-4 px-4 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={row.logo}
                          alt={row.company}
                          className="h-4 w-auto max-w-[4rem] object-contain shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="font-semibold font-mono text-xs">{row.company}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-xs group-hover:text-[var(--m-accent)] transition-colors">
                        {row.title}
                      </div>
                      <div className="text-[11px] text-[var(--m-muted)] font-mono mt-0.5">
                        {row.dept} · ID: {row.id}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[var(--m-muted)] whitespace-nowrap text-xs">
                      {row.city}
                    </td>
                    <td className="py-4 px-4 max-w-xs sm:max-w-md">
                      <p className="text-xs leading-relaxed text-[var(--m-ink)]">
                        {row.focus}
                      </p>
                    </td>
                    <td className="py-4 px-4 font-mono whitespace-nowrap text-[var(--m-muted)] text-xs">
                      {row.exp}
                    </td>
                    <td className="py-4 px-4 font-mono whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                      {row.date}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-sm text-[var(--m-muted)]">
                      没有符合「{filterQuery}」的岗位。
                      <button
                        type="button"
                        onClick={() => setFilterQuery('')}
                        className="ms-2 font-medium text-[var(--m-ink)] underline decoration-[var(--m-line-strong)] underline-offset-4"
                      >
                        清空筛选
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer of Table */}
          <div className="p-3.5 bg-[var(--m-card)] border-t border-[var(--m-line)] flex items-center justify-between text-xs font-mono text-[var(--m-muted)]">
            <span>这是 5 家公司的示例，不是实时查询结果。</span>
            <span className="text-[var(--m-ink)]">安装完成后可以导出表格、JSON、CSV 或 Markdown。</span>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { Search, Filter, Check, Copy } from 'lucide-react';

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
  const [cmdCopied, setCmdCopied] = useState(false);

  const compareCommand = 'job compare "大模型" --sites xiaomi,tencent,meituan,kuaishou,bytedance';

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(compareCommand);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2000);
  };

  const filtered = COMPARISON_DATA.filter((row) =>
    (row.title + row.company + row.focus).toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <section id="compare" className="py-20 sm:py-28 bg-[var(--m-paper)] border-b border-[var(--m-line)]">
      <div className="page-shell">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-semibold font-mono tracking-widest text-[var(--m-muted)] block mb-1.5">
            CROSS-COMPANY PERSPECTIVE
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[var(--m-ink)] tracking-tight">
            跨司同屏横向比对
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--m-muted)] leading-relaxed">
            告别在 10 个网页标签页之间反复横跳。一行命令同屏对比各大厂业务重点与核心要求。
          </p>
        </div>

        {/* Matrix Container */}
        <div className="rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-[var(--m-card)] border-b border-[var(--m-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[var(--m-ink)]">
                $ {compareCommand}
              </span>
              <button
                type="button"
                onClick={handleCopyCmd}
                className="p-1 rounded-md text-[var(--m-muted)] hover:text-[var(--m-ink)] hover:bg-[var(--m-chip)] active:scale-[0.95] transition-all cursor-pointer"
                title="复制比对命令"
                aria-label="复制跨司比对命令"
              >
                {cmdCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[var(--m-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="筛选技术栈或岗位关键字"
                  placeholder="筛选技术栈 (如: 端侧 / RAG)..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-[var(--m-panel)] border border-[var(--m-line)] text-xs font-mono text-[var(--m-ink)] placeholder-[var(--m-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m-accent)] focus:border-[var(--m-accent)] w-full"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--m-line)] bg-[var(--m-panel)] text-[var(--m-muted)] font-mono">
                  <th scope="col" className="py-3 px-4 font-semibold">招聘企业</th>
                  <th scope="col" className="py-3 px-4 font-semibold">岗位名称与部门</th>
                  <th scope="col" className="py-3 px-4 font-semibold">工作城市</th>
                  <th scope="col" className="py-3 px-4 font-semibold">核心技术栈与职责侧重</th>
                  <th scope="col" className="py-3 px-4 font-semibold">经验门槛</th>
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
              </tbody>
            </table>
          </div>

          {/* Footer of Table */}
          <div className="p-3.5 bg-[var(--m-card)] border-t border-[var(--m-line)] flex items-center justify-between text-xs font-mono text-[var(--m-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>共对比 5 家大厂公开在招岗位 · 自动去重校验完成</span>
            </span>
            <span className="text-[var(--m-ink)]">输出格式: --format table | json | csv | md</span>
          </div>
        </div>
      </div>
    </section>
  );
}

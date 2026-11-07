import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Globe,
  Database,
  Check,
  Search,
  Terminal,
} from 'lucide-react';

export function BentoFeatures() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-[var(--m-paper)] border-b border-[var(--m-line)]">
      <div className="page-shell">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--m-ink)]">
            像调用数据库一样
            <br />
            查询 30+ 家真实招聘官网。
          </h2>
          <p className="mt-3 text-base text-[var(--m-muted)]">
            不爬网页，不搞黑盒。接口毫秒级直连，全量规范数据。
          </p>
        </div>

        {/* 6 Bento Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Card 1: 公开 API 直连 */}
          <article className="flex h-full min-h-[23rem] flex-col overflow-hidden rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all p-6 justify-between">
            <div className="flex flex-1 items-center justify-center pb-6">
              <div className="w-56 p-3.5 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--m-muted)]">官方网关直通</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold tabular-nums">
                    ● 200 OK
                  </span>
                </div>
                <div className="font-semibold text-xs text-[var(--m-ink)] flex items-center gap-1.5">
                  <img src="/logos/companies/meituan.svg" alt="美团" className="h-3 w-auto" />
                  <img src="/logos/companies/bytedance.svg" alt="字节" className="h-3 w-auto" />
                  <img src="/logos/companies/kuaishou.svg" alt="快手" className="h-3 w-auto" />
                  <span className="text-[11px] text-[var(--m-muted)] font-normal ml-1">等 30+ 司</span>
                </div>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-[var(--m-muted)] font-mono">
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" aria-hidden="true" />
                    <span>HMAC 自动签名</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" aria-hidden="true" />
                    <span>零 Cookie 依赖</span>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--m-ink)]">
                公开网关直连，零爬虫黑盒
              </h3>
              <p className="mt-1.5 text-sm text-[var(--m-muted)] leading-relaxed">
                全量数据来自各司招聘官网底层公开 API，不走无头浏览器渲染，响应毫秒级，稳定性极高。
              </p>
            </div>
          </article>

          {/* Card 2: 规范统一的数据 Schema */}
          <article className="flex h-full min-h-[23rem] flex-col overflow-hidden rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all p-6 justify-between">
            <div className="flex flex-1 items-center justify-center pb-6">
              <div className="w-56 p-3.5 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] space-y-1.5 text-[11px] font-mono">
                <div className="text-[10px] text-[var(--m-muted)] pb-1 border-b border-[var(--m-line)]">
                  统一标准 Schema 字段
                </div>
                <div className="text-emerald-600 dark:text-emerald-400">id, code, job_no, name</div>
                <div className="text-[var(--m-ink)]">nature_code: "social" | "campus"</div>
                <div className="text-[var(--m-muted)]">location_names, department_name</div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--m-ink)]">
                统一岗位数据规范
              </h3>
              <p className="mt-1.5 text-sm text-[var(--m-muted)] leading-relaxed">
                将 30+ 家不同结构字段统一映射为标准数据模型，消除异构阻碍，供 Agent 与算法精准处理。
              </p>
            </div>
          </article>

          {/* Card 3: AI Agent 原生集成 */}
          <article className="flex h-full min-h-[23rem] flex-col overflow-hidden rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all p-6 justify-between">
            <div className="flex flex-1 items-center justify-center pb-6">
              <div className="w-56 p-3.5 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--m-muted)]">
                  <Terminal className="w-3 h-3 text-[var(--m-accent)]" />
                  <span>Agent Skill Ready</span>
                </div>
                <div className="p-2 rounded bg-[var(--m-panel)] font-mono text-[10px] text-[var(--m-ink)]">
                  npx skills add Enzoding/JobHunt-CLI
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono inline-flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                  <span>Claude / Cursor 自动掌握语法</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--m-ink)]">
                面向 AI Agent 原生设计
              </h3>
              <p className="mt-1.5 text-sm text-[var(--m-muted)] leading-relaxed">
                内置标准 <code className="px-1 py-0.5 rounded bg-[var(--m-chip)] text-[var(--m-accent)] font-mono text-xs">SKILL.md</code>，主流 Coding Agent 可自主识别语法并自动规划调用。
              </p>
            </div>
          </article>

          {/* Card 4: 全量采集与双重防爆防重 */}
          <article className="flex h-full min-h-[23rem] flex-col overflow-hidden rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all p-6 justify-between">
            <div className="flex flex-1 items-center justify-center pb-6">
              <div className="w-56 p-3.5 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-[var(--m-muted)] font-mono">
                  <span>分页采集监控</span>
                  <span className="text-emerald-600 font-semibold tabular-nums">98.3% 去重率</span>
                </div>
                <div className="p-1.5 rounded bg-[var(--m-panel)] text-[10px] font-mono text-[var(--m-ink)]">
                  终止校验 1: pageNo &gt;= totalPage
                </div>
                <div className="p-1.5 rounded bg-[var(--m-panel)] text-[10px] font-mono text-[var(--m-ink)]">
                  终止校验 2: list.length &lt; pageSize
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--m-ink)]">
                全量采集与防爆防重
              </h3>
              <p className="mt-1.5 text-sm text-[var(--m-muted)] leading-relaxed">
                全量采集兼顾安全与稳定。双重分页终止边界与内存 Set 复合唯一键去重，杜绝死循环。
              </p>
            </div>
          </article>

          {/* Card 5: 纯本地安全运行 */}
          <article className="flex h-full min-h-[23rem] flex-col overflow-hidden rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all p-6 justify-between">
            <div className="flex flex-1 items-center justify-center pb-6">
              <div className="w-56 p-4 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] text-center space-y-2 text-xs">
                <div className="flex items-center justify-center gap-3 text-xs font-mono text-[var(--m-ink)]">
                  <span>本地终端</span>
                  <span className="flex items-center gap-1 opacity-40" aria-hidden="true">
                    <span className="h-px w-3 bg-current" />
                    <span className="w-1.5 h-1.5 rounded-full border border-current" />
                    <span className="h-px w-3 bg-current" />
                  </span>
                  <span>云端收集</span>
                </div>
                <div className="text-[11px] text-[var(--m-muted)] font-mono pt-1">
                  上传数据量: <strong className="text-emerald-600 font-semibold tabular-nums">0 bytes</strong>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--m-ink)]">
                本地执行，隐私零泄露
              </h3>
              <p className="mt-1.5 text-sm text-[var(--m-muted)] leading-relaxed">
                所有查询均在本地发起并直接交付结果，不保留任何日志，不回传任何求职者私密偏好。
              </p>
            </div>
          </article>

          {/* Card 6: 智能别名解析与过滤 */}
          <article className="flex h-full min-h-[23rem] flex-col overflow-hidden rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all p-6 justify-between">
            <div className="flex flex-1 items-center justify-center pb-6">
              <div className="w-56 p-3 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[var(--m-muted)]" />
                  <span className="text-[var(--m-ink)] font-medium">--city 深圳 --category 技术</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--m-ink)]">
                智能别名解析与过滤
              </h3>
              <p className="mt-1.5 text-sm text-[var(--m-muted)] leading-relaxed">
                支持中文与别名输入，自动映射各公司底层城市代码与业务类别，告别记忆繁琐编码。
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

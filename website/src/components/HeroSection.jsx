import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { MacWindowMockup } from './MacWindowMockup.jsx';

const TABS = [
  { id: 'search', label: '实时搜索', caption: '直连 30+ 公司招聘官网实时 API，毫秒级响应，跳过过期失效职位。' },
  { id: 'detail', label: '岗位详情', caption: '自动解析职责要求与业务团队，保留 Raw 原始字段，数据规范透明。' },
  { id: 'summary', label: '结构化概览', caption: '提取岗位硬性门槛、核心技术栈与真实在招数据，未合上终端前已梳理完毕。' },
  { id: 'compare', label: '跨司比对', caption: '跨大厂多源横向对照，同屏透视职责与门槛差异，告别标签页反复跳转。' },
  { id: 'analyze', label: '趋势洞察', caption: '一键生成高频技能词频、城市分布与 Markdown 分析简报，辅助求职决策。' },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState('summary');
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[2];

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
      {/* Title - Pure, solid black crisp typography like Parley */}
      <h1 className="text-center text-[2.5rem] leading-[1.12] tracking-[-0.04em] text-[var(--m-ink)] sm:text-6xl lg:text-[4.25rem] font-bold max-w-4xl text-balance">
        让 Agent 直接搜索
        <br />
        真实招聘官网。
      </h1>

      {/* Subtitle - Clean muted paragraph */}
      <p className="mt-5 max-w-[48ch] text-center text-base sm:text-[1.0625rem] sm:leading-7 text-[var(--m-muted)] text-pretty">
        JobHunt 将 30+ 互联网大厂公开招聘网关转化为统一标准数据源，供 Claude Code、Cursor、Windsurf 及自动化脚本秒级消费。
      </p>

      {/* Pill Tab Switcher (Aceternity Parley xe component inspired) */}
      <div className="mt-8 flex max-w-full justify-center sm:mt-9">
        <div
          role="tablist"
          aria-label="JobHunt 功能视角"
          className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-[var(--m-chip)] p-1 [scrollbar-width:none]"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`relative min-h-9 shrink-0 rounded-full px-4 text-sm font-medium cursor-pointer active:scale-[0.97] transition-[color,transform] duration-150 ease-out ${
                  isActive
                    ? 'text-[var(--m-ink)]'
                    : 'text-[var(--m-muted)] hover:text-[var(--m-ink)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="hero-pill"
                    className="absolute inset-0 rounded-full bg-[var(--m-card)] shadow-[0_0_0_1px_var(--m-line),0_1px_2px_rgba(0,0,0,0.06)]"
                    transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mac Window Mockup Container */}
      <figure className="mt-10 w-full max-w-5xl sm:mt-12">
        <MacWindowMockup activeTab={activeTab} />

        {/* Captions below window */}
        <figcaption className="relative mt-5 flex min-h-8 justify-center text-center text-sm text-[var(--m-muted)]">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentTab.id}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
              className="max-w-[56ch] inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--m-accent)] shrink-0" aria-hidden="true" />
              <span>{currentTab.caption}</span>
            </motion.span>
          </AnimatePresence>
        </figcaption>
      </figure>
    </section>
  );
}

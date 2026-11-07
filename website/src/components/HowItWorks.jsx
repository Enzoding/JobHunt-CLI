import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal, Send, CheckCircle2, ArrowRight, Check } from 'lucide-react';

const STEPS = [
  {
    heading: '先安装，或装给 Agent',
    step: '01',
    title: '安装',
    desc: '自己用，就安装 job。交给 Claude Code、Cursor 或 Codex，就安装对应的 Skill。',
  },
  {
    heading: '用一句话说明要找的岗位',
    step: '02',
    title: '说明要求',
    desc: '例如：查美团和字节在深圳的 AI 岗位，只要社招，并对比技术栈和发布时间。',
  },
  {
    heading: '查看可以直接比较的结果',
    step: '03',
    title: '查看结果',
    desc: 'Agent 会自己查询和读取详情，然后给你一张对比表，或一份分析。',
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4200);
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6 sm:py-28"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Large Stacked Heading (Identical to Parley) */}
      <div className="flex flex-col text-[1.75rem] leading-[1.2] tracking-[-0.03em] sm:text-[2.375rem] font-bold text-[var(--m-ink)] items-start">
        {STEPS.map((s, idx) => {
          const isActive = idx === activeStep;
          return (
            <button
              key={s.step}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveStep(idx)}
              className="cursor-pointer transition-opacity duration-300 flex items-baseline text-left p-0 border-0 bg-transparent rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--m-accent)]"
              style={{ opacity: isActive ? 1 : 0.28 }}
            >
              <span>{s.heading}</span>
              <sup className={`ml-1 font-mono text-[0.6875rem] font-medium tracking-normal sm:text-xs ${isActive ? 'text-[var(--m-accent)]' : 'text-[var(--m-muted)]'}`}>
                {s.step}
              </sup>
            </button>
          );
        })}
      </div>

      {/* 3 Visual Cards */}
      <div className="mt-12 grid gap-6 sm:mt-14 md:grid-cols-3 md:gap-4">
        {STEPS.map((s, idx) => {
          const isActive = idx === activeStep;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveStep(idx)}
              className="group flex flex-col rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--m-ink)] cursor-pointer"
            >
              {/* Visual box */}
              <div
                className={`flex h-60 w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--m-panel)] px-6 transition-all duration-300 ${
                  isActive
                    ? 'shadow-[0_0_0_1px_var(--m-line-strong)] scale-[1.01]'
                    : 'shadow-[0_0_0_1px_var(--m-line)]'
                }`}
              >
                {idx === 0 && (
                  <div className="w-full max-w-[210px] p-3 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] font-mono text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--m-muted)]">
                      <Terminal className="w-3.5 h-3.5 text-[var(--m-accent)]" />
                      <span>$ npm install -g</span>
                    </div>
                    <div className="text-[11px] text-[var(--m-ink)] font-semibold truncate">
                      jobhunt-cli
                    </div>
                    <div className="text-[10px] text-[var(--m-muted)] pt-1 border-t border-[var(--m-line)]">
                      或安装给 Agent
                    </div>
                  </div>
                )}

                {idx === 1 && (
                  <div className="w-full max-w-[220px] p-3 rounded-full bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] flex items-center justify-between px-4 text-xs text-[var(--m-muted)]">
                    <span className="truncate pr-2">查美团和字节在深圳的 AI 岗位</span>
                    <div className="w-6 h-6 rounded-full bg-[var(--m-ink)] text-[var(--m-paper)] flex items-center justify-center shrink-0">
                      <Send className="w-3 h-3" />
                    </div>
                  </div>
                )}

                {idx === 2 && (
                  <div className="w-full max-w-[220px] p-3.5 rounded-xl bg-[var(--m-card)] shadow-xs border border-[var(--m-line)] space-y-2 text-xs">
                    <div className="text-[11px] text-[var(--m-muted)] flex items-center justify-between">
                      <span>已聚合 2 家公司</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold inline-flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                        <span>完成</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--m-ink)] font-medium">
                      对比表已经生成
                    </div>
                    <div className="text-[11px] text-[var(--m-muted)]">
                      技术栈包括 RAG 和 Agent
                    </div>
                  </div>
                )}
              </div>

              {/* Step indicator line & text */}
              <div className="mt-6 flex flex-col gap-1.5 px-1">
                <span className="relative flex items-center gap-3">
                  <span className={`text-xs font-medium font-mono tabular-nums ${isActive ? 'text-[var(--m-accent)]' : 'text-[var(--m-muted)]'}`}>
                    {s.step}
                  </span>
                  <span className="relative h-px w-full bg-[var(--m-line)] overflow-hidden">
                    {isActive && (
                      <span className="absolute inset-0 bg-[var(--m-accent)] animate-pulse" />
                    )}
                  </span>
                </span>
                <h3 className="text-sm font-semibold text-[var(--m-ink)]">
                  {s.title}
                </h3>
                <p className="text-xs text-[var(--m-muted)] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

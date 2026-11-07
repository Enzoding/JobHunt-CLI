import React, { useState } from 'react';
import { Terminal, Bot, Code2, ArrowRight, Copy, Check } from 'lucide-react';

const PLATFORMS = [
  {
    device: 'cli',
    title: '原生命令行终端',
    description: '在任意终端即开即用。本地极速并发，跨平台支持 macOS、Linux 与 Windows，输出彩色高亮表格。',
    command: '$ job meituan search "AI" --limit 5',
    copyCmd: 'job meituan search "AI" --limit 5',
    tag: 'macOS · Linux · Windows',
  },
  {
    device: 'agent',
    title: 'AI Coding IDE 与智能体',
    description: '自然语言无缝接入。通过标准 SKILL.md，Claude Code、Cursor、Windsurf 可自主规划多轮检索与跨司对比。',
    command: '$ claude "对比美团和腾讯的大模型岗位"',
    copyCmd: 'claude "对比美团和腾讯的大模型岗位"',
    tag: 'Claude Code · Cursor · Windsurf',
  },
  {
    device: 'sdk',
    title: 'Node.js ESM 库与服务',
    description: '在自有程序或定时监控 Bot 中直接 import 调用。原生 ESM 规范，内置 Undici 连接池与代理容灾。',
    command: "import { registry } from 'jobhunt-cli';",
    copyCmd: "import { registry } from 'jobhunt-cli';",
    tag: 'Node.js >= 21.0 · ESM',
  },
];

export function PlatformShowcase() {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (cmd, device) => {
    navigator.clipboard.writeText(cmd);
    setCopiedKey(device);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section id="capabilities" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6 sm:py-28 border-t border-[var(--m-line)]">
      {/* Title */}
      <div className="max-w-3xl mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--m-ink)]">
          全平台覆盖，随处可用。
        </h2>
        <p className="mt-3 text-base text-[var(--m-muted)]">
          无论你是在极客终端敲下命令，还是让自主智能体全自动采集，皆可丝滑就绪。
        </p>
      </div>

      {/* 3 Cards */}
      <div className="grid gap-6 sm:gap-5 md:grid-cols-3">
        {PLATFORMS.map((plat) => {
          const isCopied = copiedKey === plat.device;
          return (
            <div
              key={plat.device}
              className="flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all p-6 sm:p-7 min-h-[22rem]"
            >
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--m-muted)] font-semibold tracking-wider block mb-4">
                  {plat.tag}
                </span>

                <h3 className="text-lg font-bold text-[var(--m-ink)]">
                  {plat.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[var(--m-muted)] leading-relaxed">
                  {plat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--m-line)]">
                <button
                  type="button"
                  onClick={() => handleCopy(plat.copyCmd, plat.device)}
                  className="w-full p-3 rounded-xl bg-[var(--m-card)] border border-[var(--m-line)] font-mono text-xs text-[var(--m-ink)] flex items-center justify-between gap-2 shadow-2xs hover:border-[var(--m-line-strong)] active:scale-[0.98] transition-all cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--m-accent)]"
                  title="点击复制代码"
                  aria-label={`复制命令: ${plat.copyCmd}`}
                >
                  <span className="truncate">{plat.command}</span>
                  <span className="shrink-0 text-[var(--m-muted)] hover:text-[var(--m-ink)]">
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { GithubIcon } from './GithubIcon.jsx';
import { Terminal, Copy, Check, ArrowRight } from 'lucide-react';

export function CTASection() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const COMMANDS = [
    { label: '全局安装 CLI', cmd: 'npm install -g jobhunt-cli' },
    { label: '查看已支持站点', cmd: 'job sites' },
    { label: 'AI Agent 挂载 Skill', cmd: 'npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli' },
  ];

  const handleCopy = (cmd, idx) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 border-t border-[var(--m-line)]">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-[var(--m-panel)] p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="text-[10px] uppercase font-semibold font-mono tracking-widest text-[var(--m-muted)]">
            GET STARTED
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--m-ink)]">
            准备好让你的 Agent 接入真实职位数据了吗？
          </h2>
          <p className="text-sm sm:text-base text-[var(--m-muted)] leading-relaxed">
            开源免费、MIT 协议授权。一行命令安装，开箱即用。
          </p>
        </div>

        <div className="space-y-2.5 w-full md:w-auto min-w-[300px]">
          {COMMANDS.map((item, idx) => (
            <div
              key={item.cmd}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--m-card)] border border-[var(--m-line)] font-mono text-xs text-[var(--m-ink)] gap-3 shadow-xs"
            >
              <div className="flex flex-col truncate">
                <span className="text-[10px] text-[var(--m-muted)]">{item.label}</span>
                <span className="font-semibold truncate">$ {item.cmd}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(item.cmd, idx)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--m-muted)] hover:text-[var(--m-ink)] hover:bg-[var(--m-chip)] active:scale-[0.92] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--m-accent)] transition-all cursor-pointer shrink-0"
                aria-label={`复制命令: ${item.cmd}`}
                title={`复制: ${item.cmd}`}
              >
                {copiedIndex === idx ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

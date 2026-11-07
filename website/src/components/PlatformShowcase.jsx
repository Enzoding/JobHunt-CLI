import React from 'react';

const PLATFORMS = [
  {
    device: 'cli',
    title: '终端',
    description: '在 macOS、Linux 或 Windows 的终端里运行。',
    command: 'job meituan search "AI" --limit 5',
    note: '安装完成后运行',
    tag: 'macOS、Linux、Windows',
  },
  {
    device: 'agent',
    title: 'Agent',
    description: '在 Claude Code、Cursor 或 Windsurf 里，用一句话开始查询。',
    command: '对比美团和腾讯的大模型岗位',
    note: '安装完成后，可以对 Agent 说',
    tag: 'Claude Code、Cursor、Windsurf',
  },
  {
    device: 'sdk',
    title: '你的程序',
    description: '在你自己的 Node.js 程序里调用。需要 Node.js 21 或更高版本。',
    command: "import { registry } from 'jobhunt-cli';",
    note: '安装完成后，在程序里写',
    tag: 'Node.js 21 或更高版本',
  },
];

export function PlatformShowcase() {
  return (
    <section id="capabilities" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6 sm:py-28 border-t border-[var(--m-line)]">
      {/* Title */}
      <div className="max-w-3xl mb-12 sm:mb-16">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-balance text-[var(--m-ink)] sm:text-4xl">
          安装之后，可以在这些地方使用
        </h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-pretty text-[var(--m-muted)]">
          还没安装的话，先回到页面顶部。
        </p>
      </div>

      {/* 3 Cards */}
      <div className="grid gap-6 sm:gap-5 md:grid-cols-3">
        {PLATFORMS.map((plat) => (
          <article
            key={plat.device}
            className="flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[var(--m-line)] bg-[var(--m-panel)] p-6 sm:p-7"
          >
            <div>
              <p className="mb-4 text-sm text-[var(--m-muted)]">{plat.tag}</p>
              <h3 className="text-lg font-bold text-[var(--m-ink)]">{plat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--m-muted)]">{plat.description}</p>
            </div>
            <p className="mt-6 border-t border-[var(--m-line)] pt-4 font-mono text-xs leading-5 break-all text-[var(--m-ink)]">
              <span className="text-[var(--m-muted)]">{plat.note} </span>
              {plat.command}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

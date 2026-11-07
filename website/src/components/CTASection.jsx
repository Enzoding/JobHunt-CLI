import React from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';

const COMMANDS = [
  { label: '安装到本机', cmd: 'npm install -g jobhunt-cli' },
  { label: '先试一次', cmd: 'npx jobhunt-cli sites' },
  { label: '交给 Agent', cmd: 'npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli' },
];

export function CTASection() {
  return (
    <section className="border-t border-[var(--m-line)] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-[var(--m-panel)] p-8 sm:p-12 lg:flex-row lg:items-center lg:p-16">
        <div className="max-w-xl space-y-3">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-balance text-[var(--m-ink)] sm:text-4xl">
            还没安装的话，从这里开始
          </h2>
          <p className="text-base leading-7 text-pretty text-[var(--m-muted)]">
            下面三条命令现在就能运行。以 job 开头的查询，要等安装完成。
          </p>
        </div>

        <ul className="w-full min-w-0 space-y-2.5 md:max-w-md">
          {COMMANDS.map((item) => (
            <li
              key={item.cmd}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--m-line)] bg-[var(--m-card)] px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-xs text-[var(--m-muted)]">{item.label}</p>
                <code className="block truncate font-mono text-xs font-semibold text-[var(--m-ink)]">
                  {item.cmd}
                </code>
              </div>
              <CopyButton
                value={item.cmd}
                variant="ghost"
                size="icon-sm"
                label={`复制：${item.cmd}`}
                copiedLabel="已复制"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

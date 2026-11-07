import React from 'react';
import { Card } from '@appica/ui-react/card';
import { CopyButton } from '@appica/ui-react/copy-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@appica/ui-react/tabs';

const INSTALL_OPTIONS = [
  {
    value: 'cli',
    label: '安装到本机',
    command: 'npm install -g jobhunt-cli',
    hint: '需要 Node.js 21 或更高版本。安装完成后，在终端输入 job 就能使用。',
  },
  {
    value: 'try',
    label: '先试一次',
    command: 'npx jobhunt-cli sites',
    hint: '不会安装到系统里。用来查看目前支持哪些公司。',
  },
  {
    value: 'skill',
    label: '交给 Agent',
    command: 'npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli',
    hint: '安装到 Claude Code、Cursor 或 Codex。之后可以用一句话让它查询岗位。',
  },
];

function CommandBlock({ command }) {
  return (
    <div className="relative rounded-xl bg-[var(--m-panel)] pe-12">
      <code className="block px-4 py-3.5 font-mono text-[13px] leading-6 break-all text-[var(--m-ink)]">
        {command}
      </code>
      <div className="absolute inset-e-1.5 top-1/2 -translate-y-1/2">
        <CopyButton
          value={command}
          variant="outline"
          size="icon-sm"
          label={`复制：${command}`}
          copiedLabel="已复制"
        />
      </div>
    </div>
  );
}

export function InstallCommand() {
  return (
    <Card
      frame
      aria-labelledby="install-heading"
      className="bg-[var(--m-panel)] shadow-none backdrop-blur-none"
      contentProps={{
        className: 'gap-5 border-[var(--m-line)] bg-[var(--m-card)] p-5 sm:p-6',
      }}
    >
      <h2 id="install-heading" className="text-lg font-semibold tracking-tight text-[var(--m-ink)]">
        选择一种安装方式
      </h2>
      <Tabs defaultValue="cli" variant="line" size="sm" className="w-full">
        <TabsList className="w-full justify-start gap-5 overflow-x-auto border-b border-[var(--m-line)]">
          {INSTALL_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {INSTALL_OPTIONS.map((option) => (
          <TabsContent key={option.value} value={option.value} className="space-y-3 pt-4">
            <CommandBlock command={option.command} />
            <p className="text-sm leading-6 text-pretty text-[var(--m-muted)]">{option.hint}</p>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

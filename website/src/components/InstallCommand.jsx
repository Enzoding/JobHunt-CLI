import React from 'react';
import { CopyButton } from '@appica/ui-react/copy-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@appica/ui-react/tabs';

const INSTALL_OPTIONS = [
  {
    value: 'cli',
    label: 'CLI 安装 (推荐)',
    command: 'npm install -g jobhunt-cli',
    badge: 'Node.js >= 21',
    hint: '全局安装 job 命令，支持单司检索、跨司对比与数据导出。',
  },
  {
    value: 'skill',
    label: 'Agent Skill',
    command: 'npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli',
    badge: '即装即用',
    hint: '为 Codex、Claude Code、OpenClaw 等 Agent 赋予查询能力。',
  },
];

function CommandBlock({ command }) {
  return (
    <div className="border border-border bg-background-subtle relative overflow-hidden rounded-lg shadow-xs group transition-colors hover:border-foreground/40">
      <div className="flex items-center gap-3 px-4 py-3.5 pe-12">
        <span className="text-foreground-muted select-none font-mono text-xs">$</span>
        <code className="text-foreground min-w-0 flex-1 font-mono text-xs sm:text-[13px] leading-6 break-all font-medium">
          {command}
        </code>
      </div>
      <div className="absolute inset-e-2 top-1/2 -translate-y-1/2">
        <CopyButton
          value={command}
          variant="outline"
          size="icon-sm"
          label="一键复制安装命令"
          copiedLabel="已复制"
        />
      </div>
    </div>
  );
}

export function InstallCommand() {
  return (
    <div className="w-full">
      <Tabs defaultValue="cli" variant="line" size="sm" className="w-full">
        <TabsList className="border-b border-border/80 w-full justify-start gap-2">
          {INSTALL_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value} className="text-xs sm:text-sm font-medium">
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {INSTALL_OPTIONS.map((option) => (
          <TabsContent key={option.value} value={option.value} className="pt-3.5 space-y-2">
            <CommandBlock command={option.command} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-foreground-muted">
              <p className="m-0 leading-relaxed">{option.hint}</p>
              <span className="shrink-0 text-[11px] font-mono text-foreground-subtle self-start sm:self-auto">
                {option.badge}
              </span>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

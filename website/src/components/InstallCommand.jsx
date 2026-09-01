import { CopyButton } from '@appica/ui-react/copy-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@appica/ui-react/tabs';

const INSTALL_OPTIONS = [
  {
    value: 'skill',
    label: '安装 Agent Skill',
    command: 'npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli',
    hint: '让 Codex、Claude Code 等 Agent 直接调用同一套招聘查询命令。',
  },
  {
    value: 'cli',
    label: '安装 CLI',
    command: 'npm install -g jobhunt-cli',
    hint: '需要 Node.js 21 或更高版本。安装后即可使用 job 命令。',
  },
];

function CommandBlock({ command }) {
  return (
    <div className="border-border bg-background-subtle relative overflow-hidden rounded-md border">
      <div className="flex items-start gap-3 px-4 py-3 pe-12">
        <code className="text-foreground min-w-0 flex-1 font-mono text-[13px] leading-6 break-all">
          {command}
        </code>
      </div>
      <div className="absolute inset-e-2 top-1/2 -translate-y-1/2">
        <CopyButton
          value={command}
          variant="ghost"
          size="icon-sm"
          label="复制命令"
          copiedLabel="已复制"
        />
      </div>
    </div>
  );
}

export function InstallCommand() {
  return (
    <Tabs defaultValue="skill" variant="line" size="sm" className="w-full">
      <TabsList>
        {INSTALL_OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {INSTALL_OPTIONS.map((option) => (
        <TabsContent key={option.value} value={option.value} className="pt-4">
          <CommandBlock command={option.command} />
          <p className="text-foreground-muted mt-3 text-sm leading-6">{option.hint}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}

import React from 'react';
import { Card, CardDescription, CardHeader, CardMedia, CardTitle } from '@appica/ui-react/card';

const COMPANIES = [
  { name: '美团', role: 'AI Agent 架构师', place: '深圳 · 社招' },
  { name: '字节跳动', role: '大模型应用', place: '上海 · 社招' },
  { name: '小米', role: '端侧算法', place: '北京 · 校招' },
];

function CapabilityCard({ className, title, description, command, children }) {
  return (
    <Card
      frame
      render={<article className={className} />}
      className="h-full bg-[var(--m-panel)] shadow-none backdrop-blur-none"
      contentProps={{
        className: 'h-full gap-6 border-[var(--m-line)] bg-[var(--m-card)] p-5 sm:p-6',
      }}
    >
      <CardMedia className="text-sm leading-6 text-[var(--m-ink)]">{children}</CardMedia>
      <CardHeader className="mt-auto flex-none gap-2 p-0">
        <CardTitle className="text-lg tracking-tight text-[var(--m-ink)]">{title}</CardTitle>
        <CardDescription className="text-sm leading-6 text-pretty text-[var(--m-muted)]">
          {description}
        </CardDescription>
        <p className="pt-1 font-mono text-xs leading-5 break-all text-[var(--m-muted)]">
          <span className="text-[var(--m-ink)]">安装完成后运行 </span>
          {command}
        </p>
      </CardHeader>
    </Card>
  );
}

export function BentoFeatures() {
  return (
    <section id="features" className="scroll-mt-6 border-b border-[var(--m-line)] bg-[var(--m-paper)] py-20 sm:py-28">
      <div className="page-shell">
        <div className="mb-10 max-w-xl sm:mb-14">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-balance text-[var(--m-ink)] sm:text-4xl">
            装好之后可以做这些
          </h2>
          <p className="mt-3 text-base leading-7 text-pretty text-[var(--m-muted)]">
            查询、查看详情、对比和导出，每家公司都用同一套命令。
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-6">
          <CapabilityCard
            className="lg:col-span-4"
            title="查询一家公司的在招岗位"
            description="可以按关键词、城市，以及社招、校招或实习来缩小范围。结果来自该公司的公开招聘网站。"
            command="job meituan search AI --location 深圳 --nature 社招"
          >
            <ul className="space-y-2.5">
              {COMPANIES.map((company) => (
                <li key={company.name} className="flex items-baseline justify-between gap-4">
                  <span className="min-w-0">
                    <span className="text-[var(--m-muted)]">{company.name}</span>{' '}
                    <span className="font-medium">{company.role}</span>
                  </span>
                  <span className="shrink-0 text-[var(--m-muted)]">{company.place}</span>
                </li>
              ))}
            </ul>
          </CapabilityCard>

          <CapabilityCard
            className="lg:col-span-2"
            title="查看一条岗位的详情"
            description="可以看到职责、要求、部门和原文链接。各公司的字段已经整理成同一套。"
            command="job meituan detail <岗位 ID>"
          >
            <div className="space-y-3">
              <p>
                <span className="text-[var(--m-muted)]">职责 </span>
                编排多步任务，对接业务工具。
              </p>
              <p>
                <span className="text-[var(--m-muted)]">要求 </span>
                有 Agent 或检索系统的经验。
              </p>
            </div>
          </CapabilityCard>

          <CapabilityCard
            className="lg:col-span-3"
            title="对比多家公司"
            description="用同一个条件，看各家在招什么岗位、在哪个城市、要求差在哪里。"
            command="job compare AI --sites meituan,bytedance,xiaomi"
          >
            <ul className="space-y-2.5">
              {COMPANIES.map((company) => (
                <li key={company.name} className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">{company.name}</span>
                  <span className="text-[var(--m-muted)]">{company.place}</span>
                </li>
              ))}
            </ul>
          </CapabilityCard>

          <CapabilityCard
            className="lg:col-span-3"
            title="导出结果或生成分析"
            description="可以导出表格、CSV 或 JSON，也可以生成一份 Markdown，里面有技能词频和城市分布。"
            command="job meituan analyze AI --format md"
          >
            <ul className="grid grid-cols-2 gap-2">
              {['表格', 'CSV', 'JSON', 'Markdown'].map((item) => (
                <li key={item} className="rounded-lg bg-[var(--m-panel)] px-3 py-2.5">
                  {item}
                </li>
              ))}
            </ul>
          </CapabilityCard>
        </div>
      </div>
    </section>
  );
}

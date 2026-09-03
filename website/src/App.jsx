import React from 'react';
import { buttonVariants } from '@appica/ui-react/button';
import { CopyButton } from '@appica/ui-react/copy-button';
import { InstallCommand } from './components/InstallCommand.jsx';
import { TerminalShowcase } from './components/TerminalShowcase.jsx';
import { LogoMarquee } from './components/LogoMarquee.jsx';
import { FeatureShowcase } from './components/FeatureShowcase.jsx';
import { UserScenarios } from './components/UserScenarios.jsx';
import { agents } from './data/agents.js';
import { companies } from './data/companies.js';

const GITHUB_URL = 'https://github.com/Enzoding/JobHunt-CLI';

const NAV_LINKS = [
  { href: '#install', label: '安装' },
  { href: '#scenarios', label: '场景' },
  { href: '#ecosystem', label: '生态' },
  { href: '#capabilities', label: '能力' },
  { href: '#workflow', label: '快速上手' },
];

function GitHubLink({ children, variant = 'outline', size = 'md', className = '' }) {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className={`${buttonVariants({ variant, size })} ${className}`}
    >
      <svg
        className="w-4 h-4 mr-1.5 shrink-0 inline-block fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      {children}
    </a>
  );
}

function SiteMark() {
  return (
    <a href="#top" className="text-foreground inline-flex items-center gap-2.5 no-underline group">
      <span
        aria-hidden="true"
        className="border-foreground/80 bg-foreground text-background inline-flex h-6 w-6 items-center justify-center rounded-[6px] border text-[12px] leading-none font-mono font-bold shadow-xs group-hover:scale-105 transition-transform"
      >
        &gt;_
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">
        JobHunt <span className="text-foreground-muted font-normal">CLI</span>
      </span>
    </a>
  );
}

export default function App() {
  return (
    <div id="top" className="bg-background text-foreground min-h-screen selection:bg-foreground selection:text-background">
      <a className={`${buttonVariants({ variant: 'primary', size: 'sm' })} skip-link`} href="#main">
        跳到正文
      </a>

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="page-shell flex h-14 items-center justify-between gap-6">
          <SiteMark />
          <nav aria-label="页面章节导航" className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground-muted hover:text-foreground text-sm font-medium transition-colors no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <GitHubLink variant="outline" size="sm">
              GitHub
            </GitHubLink>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border hero-glow">
          <div className="page-shell py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Value Prop & Install */}
              <div className="lg:col-span-6 min-w-0 space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-border bg-background-subtle text-xs font-mono text-foreground-muted shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>开源 CLI · 覆盖 30+ 招聘官网</span>
                </div>

                <h1 className="hero-title text-foreground tracking-tight">
                  让 Agent 直接搜索
                  <br />
                  真实招聘官网
                </h1>

                <p className="text-foreground-muted text-sm sm:text-base leading-relaxed max-w-lg">
                  把 30+ 家大厂职位统一为结构化数据。支持自然语言找岗、跨司横向对比与行业招聘动向分析。
                </p>

                <div id="install" className="pt-1 scroll-mt-24">
                  <InstallCommand />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <GitHubLink variant="primary" size="md">
                    在 GitHub 查看
                  </GitHubLink>
                  <a
                    href="#scenarios"
                    className={buttonVariants({ variant: 'outline', size: 'md' })}
                  >
                    应用场景 ↓
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Anchor / Interactive Terminal Showcase */}
              <div className="lg:col-span-6 min-w-0 w-full">
                <TerminalShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem Marquee Section */}
        <section id="ecosystem" className="border-b border-border py-10 sm:py-14 scroll-mt-14 bg-background-subtle/30">
          <div className="page-shell mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Supported Ecosystem
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                覆盖 30+ 招聘官网与主流 Agent
              </h2>
            </div>
            <p className="text-foreground-muted text-xs sm:text-sm max-w-md leading-relaxed">
              支持 36 个官方招聘站点与主流 Agent 运行时环境，开箱即用。
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Row 1: Companies (Moving left) */}
            <LogoMarquee
              items={companies}
              logoDir="companies"
              duration="68s"
              label="当前支持的招聘官网名单"
            />
            {/* Row 2: Agents (Moving right / reverse) */}
            <LogoMarquee
              items={agents}
              logoDir="agents"
              duration="30s"
              reverse={true}
              label="支持一键接入的 Agent 运行时"
            />
          </div>
        </section>

        {/* Real-world Scenarios Section */}
        <section id="scenarios" className="border-b border-border py-14 sm:py-20 scroll-mt-14">
          <div className="page-shell space-y-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                  Use Cases
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  典型应用场景
                </h2>
                <p className="text-foreground-muted mt-2 text-sm sm:text-base leading-relaxed">
                  面向求职与行业调研，支持通过自然语言吩咐 Agent 执行，输出标准结构化数据。
                </p>
              </div>
              <div className="text-xs text-foreground-muted flex items-center gap-2 bg-background-subtle px-3 py-1.5 rounded-md border border-border shrink-0 self-start md:self-auto font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>自然语言驱动</span>
              </div>
            </div>

            <UserScenarios />
          </div>
        </section>

        {/* Core Capabilities Section */}
        <section id="capabilities" className="border-b border-border py-14 sm:py-20 scroll-mt-14 bg-background-subtle/20">
          <div className="page-shell space-y-8">
            <div className="max-w-xl">
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Core Capabilities
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                核心能力
              </h2>
              <p className="text-foreground-muted mt-2 text-sm sm:text-base leading-relaxed">
                统一数据规范，横向比对分析，极低 Token 消耗。
              </p>
            </div>

            <FeatureShowcase />
          </div>
        </section>

        {/* Quickstart Workflow Section */}
        <section id="workflow" className="border-b border-border py-14 sm:py-20 scroll-mt-14 bg-background-subtle/30">
          <div className="page-shell">
            <div className="text-center max-w-xl mx-auto mb-12">
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Quickstart Workflow
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                快速上手
              </h2>
              <p className="text-foreground-muted mt-2 text-sm sm:text-base">
                只需三步，立即将 30+ 招聘官网转化为结构化数据流
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 sm:p-6 rounded-xl border border-border bg-white shadow-2xs hover:shadow-xs transition-all space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground">
                    01
                  </div>
                  <span className="text-[11px] font-mono text-foreground-muted">环境准备</span>
                </div>
                <h3 className="text-base font-semibold text-foreground m-0">安装 CLI 或接入 Skill</h3>
                <p className="text-xs text-foreground-muted leading-relaxed m-0">
                  通过 npm 全局安装到终端，或通过 npx 为各类 Agent 运行时直接无感接入。
                </p>
                <div className="flex items-center justify-between gap-2 p-2 px-2.5 rounded-lg bg-background-subtle border border-border/80 font-mono text-xs text-foreground">
                  <code className="truncate flex-1">npm install -g jobhunt-cli</code>
                  <CopyButton value="npm install -g jobhunt-cli" variant="ghost" size="icon-sm" label="复制命令" copiedLabel="已复制" />
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-xl border border-border bg-white shadow-2xs hover:shadow-xs transition-all space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground">
                    02
                  </div>
                  <span className="text-[11px] font-mono text-foreground-muted">发现站点</span>
                </div>
                <h3 className="text-base font-semibold text-foreground m-0">查看支持站点与类别</h3>
                <p className="text-xs text-foreground-muted leading-relaxed m-0">
                  列出当前已支持的企业代码（如 meituan, tencent）、渠道性质与分类。
                </p>
                <div className="flex items-center justify-between gap-2 p-2 px-2.5 rounded-lg bg-background-subtle border border-border/80 font-mono text-xs text-foreground">
                  <code className="truncate flex-1">job sites</code>
                  <CopyButton value="job sites" variant="ghost" size="icon-sm" label="复制命令" copiedLabel="已复制" />
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-xl border border-border bg-white shadow-2xs hover:shadow-xs transition-all space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground">
                    03
                  </div>
                  <span className="text-[11px] font-mono text-foreground-muted">横向比对</span>
                </div>
                <h3 className="text-base font-semibold text-foreground m-0">开始搜索与跨司比对</h3>
                <p className="text-xs text-foreground-muted leading-relaxed m-0">
                  跨多家大厂并行同屏比对职位，直接输出格式化表格、CSV 或紧凑 JSON。
                </p>
                <div className="flex items-center justify-between gap-2 p-2 px-2.5 rounded-lg bg-background-subtle border border-border/80 font-mono text-xs text-foreground">
                  <code className="truncate flex-1">job compare AI --sites meituan,xiaomi</code>
                  <CopyButton value="job compare AI --sites meituan,xiaomi" variant="ghost" size="icon-sm" label="复制命令" copiedLabel="已复制" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="border-b border-border py-16 sm:py-24">
          <div className="page-shell">
            <div className="rounded-2xl border border-border bg-white p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xs">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-border bg-background-subtle text-xs font-mono text-foreground-muted shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>开箱即用 · 持续维护</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0">
                开源、轻量、专为开发者与 Agent 打造
              </h2>
              <p className="text-foreground-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed m-0">
                无需复杂配置，一条命令直连 30+ 家真实招聘官网，轻松获取结构化岗位数据。
              </p>

              {/* In-place install command bar */}
              <div className="max-w-md mx-auto pt-1">
                <div className="flex items-center justify-between gap-3 p-2.5 px-3.5 rounded-xl border border-border bg-background-subtle font-mono text-xs sm:text-sm shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-foreground-muted select-none">$</span>
                    <code className="text-foreground font-medium truncate">npm install -g jobhunt-cli</code>
                  </div>
                  <CopyButton
                    value="npm install -g jobhunt-cli"
                    variant="outline"
                    size="icon-sm"
                    label="复制安装命令"
                    copiedLabel="已复制"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <GitHubLink variant="primary" size="md">
                  在 GitHub 查看源码
                </GitHubLink>
                <a
                  href="#capabilities"
                  className={buttonVariants({ variant: 'outline', size: 'md' })}
                >
                  查看核心能力 ↓
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="page-shell flex flex-col sm:flex-row items-center justify-between gap-4 py-8 text-xs text-foreground-muted">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-foreground">JobHunt CLI</span>
            <span className="px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-muted font-mono text-[11px] border border-border">v0.2.6</span>
            <span>·</span>
            <span>MIT License</span>
            <span>·</span>
            <span>Open Source</span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <a
              href="https://www.npmjs.com/package/jobhunt-cli"
              target="_blank"
              rel="noreferrer"
              className="text-foreground-muted hover:text-foreground transition-colors no-underline"
            >
              npm 包
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-foreground-muted hover:text-foreground transition-colors no-underline"
            >
              GitHub 仓库
            </a>
            <a
              href="#top"
              className="text-foreground-muted hover:text-foreground transition-colors no-underline"
            >
              回到顶部 ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import { buttonVariants } from '@appica/ui-react/button';
import { InstallCommand } from './components/InstallCommand.jsx';
import { TerminalShowcase } from './components/TerminalShowcase.jsx';
import { LogoMarquee } from './components/LogoMarquee.jsx';
import { FeatureShowcase } from './components/FeatureShowcase.jsx';
import { agents } from './data/agents.js';
import { companies } from './data/companies.js';

const GITHUB_URL = 'https://github.com/Enzoding/JobHunt-CLI';

const NAV_LINKS = [
  { href: '#install', label: '安装' },
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
        className="border-foreground/80 bg-foreground text-background inline-flex h-6 w-6 items-center justify-center rounded-[5px] border text-[11px] leading-none font-mono font-bold"
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
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="page-shell flex h-14 items-center justify-between gap-6">
          <SiteMark />
          <nav aria-label="页面章节导航" className="hidden items-center gap-6 md:flex">
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
        <section className="relative border-b border-border">
          <div className="page-shell py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Value Prop & Install */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-border bg-background-subtle text-xs font-mono text-foreground-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>开源 CLI · 覆盖 30+ 招聘官网</span>
                </div>

                <h1 className="hero-title text-foreground tracking-tight">
                  让 Agent 直接搜索
                  <br />
                  真实招聘官网
                </h1>

                <p className="text-foreground-muted text-sm sm:text-base leading-relaxed max-w-lg">
                  把 30+ 家大厂职位统一成结构化数据。同一套 <code className="font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-foreground/5 border border-border text-foreground font-semibold">job</code> 命令，支持单司检索、跨司对比与按需导出。
                </p>

                <div id="install" className="pt-1 scroll-mt-24">
                  <InstallCommand />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <GitHubLink variant="primary" size="md">
                    在 GitHub 查看
                  </GitHubLink>
                  <a
                    href="#capabilities"
                    className={buttonVariants({ variant: 'outline', size: 'md' })}
                  >
                    核心能力 ↓
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Anchor / Developer Command Deck */}
              <div className="lg:col-span-6">
                <TerminalShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem Marquee Section */}
        <section id="ecosystem" className="border-b border-border py-10 sm:py-12 scroll-mt-14 bg-background-subtle/20">
          <div className="page-shell mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Ecosystem
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                覆盖 30+ 招聘官网与主流 Agent
              </h2>
            </div>
            <p className="text-foreground-muted text-xs sm:text-sm max-w-md leading-relaxed">
              支持 36 个官方招聘站点与主流 Agent 运行时环境，开箱即用。
            </p>
          </div>

          <div className="space-y-3">
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

        {/* Core Capabilities Section */}
        <section id="capabilities" className="border-b border-border py-12 sm:py-16 scroll-mt-14">
          <div className="page-shell space-y-6">
            <div className="max-w-xl">
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Capabilities
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                核心能力
              </h2>
              <p className="text-foreground-muted mt-1.5 text-xs sm:text-sm leading-relaxed">
                统一数据规范，横向比对分析，极低 Token 消耗。
              </p>
            </div>

            <FeatureShowcase />
          </div>
        </section>

        {/* Quickstart Workflow: Precision Pipeline Stream */}
        <section id="workflow" className="border-b border-border py-12 sm:py-16 scroll-mt-14 bg-background-subtle/30">
          <div className="page-shell space-y-8">
            <div className="max-w-xl">
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Quickstart
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                管道式快速上手
              </h2>
              <p className="text-foreground-muted mt-1.5 text-xs sm:text-sm">
                三步极速串联 CLI 与 Agent 工作流
              </p>
            </div>

            {/* Continuous Pipeline Rails */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 sm:p-5 rounded-lg border border-border bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-foreground">STEP 01</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-muted border border-border">
                    INSTALL
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground">安装 CLI / Skill</div>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  通过 npm 全局安装到终端，或通过 npx 为 Agent 接入。
                </p>
                <div className="p-2 rounded bg-background-subtle border border-border font-mono text-xs text-foreground truncate">
                  $ npm i -g jobhunt-cli
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-lg border border-border bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-foreground">STEP 02</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-muted border border-border">
                    DISCOVER
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground">查看支持站点</div>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  列出所有支持的 30+ 家企业代码与筛选分类。
                </p>
                <div className="p-2 rounded bg-background-subtle border border-border font-mono text-xs text-foreground truncate">
                  $ job sites
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-lg border border-border bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-foreground">STEP 03</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-foreground-muted border border-border">
                    QUERY & COMPARE
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground">执行搜索与比对</div>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  跨公司横向比对，直接输出表格、CSV 或 JSON。
                </p>
                <div className="p-2 rounded bg-background-subtle border border-border font-mono text-xs text-foreground truncate">
                  $ job compare AI --sites meituan,xiaomi
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="border-b border-border py-12 sm:py-16">
          <div className="page-shell">
            <div className="rounded-lg border border-border bg-background-subtle p-6 sm:p-8 text-center max-w-xl mx-auto space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                开源、轻量、专为开发者与 Agent 打造
              </h2>
              <p className="text-foreground-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                无需繁复配置，一条命令直连 30+ 家真实招聘官网。
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <a
                  href="#install"
                  className={buttonVariants({ variant: 'primary', size: 'md' })}
                >
                  复制安装命令 ↑
                </a>
                <GitHubLink variant="outline" size="md">
                  GitHub 仓库
                </GitHubLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="page-shell flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-xs text-foreground-muted">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">JobHunt CLI</span>
            <span>·</span>
            <span>MIT License</span>
            <span>·</span>
            <span>Open Source</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="#top"
              className="text-foreground-muted hover:text-foreground transition-colors no-underline"
            >
              回到顶部
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-foreground-muted hover:text-foreground transition-colors no-underline"
            >
              GitHub 仓库
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

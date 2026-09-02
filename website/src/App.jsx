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
  { href: '#install', label: '安装指南' },
  { href: '#ecosystem', label: '生态矩阵' },
  { href: '#capabilities', label: '核心能力' },
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
        <div className="page-shell flex h-15 items-center justify-between gap-6">
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
              Star on GitHub
            </GitHubLink>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border hero-glow">
          <div className="page-shell py-14 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Value Prop & Install */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background-subtle text-xs font-mono text-foreground-muted shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>v0.2.6 · 覆盖 30+ 家真实招聘官网 · Agent 原生支持</span>
                </div>

                <h1 className="hero-title text-foreground tracking-tight">
                  让 Agent 与开发者
                  <br />
                  直达真实招聘官网
                </h1>

                <p className="text-foreground-muted text-base sm:text-lg leading-relaxed max-w-xl">
                  把 30+ 家互联网大厂的公开职位统一成标准化、可比对、极低 Token 消耗的结构化数据。同一套 <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-foreground/5 border border-border text-foreground font-semibold">job</code> 命令，贯通社招、校招与实习。
                </p>

                <div id="install" className="pt-2 scroll-mt-24">
                  <InstallCommand />
                </div>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <GitHubLink variant="primary" size="md">
                    在 GitHub 查看源码
                  </GitHubLink>
                  <a
                    href="#capabilities"
                    className={buttonVariants({ variant: 'outline', size: 'md' })}
                  >
                    探索核心能力 ↓
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Anchor / Interactive Terminal Showcase */}
              <div className="lg:col-span-6">
                <TerminalShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem Marquee Section */}
        <section id="ecosystem" className="border-b border-border py-12 sm:py-16 scroll-mt-14 bg-background-subtle/30">
          <div className="page-shell mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1">
                Supported Ecosystem
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                覆盖 30+ 家公开招聘官网 & 主流 Agent
              </h2>
            </div>
            <p className="text-foreground-muted text-xs sm:text-sm max-w-lg leading-relaxed">
              数据以各站点实时 registry 为准，包含独立 adapter 与阿里 CPO 体系。开箱即用，支持多 Agent 运行时无缝调用。
            </p>
          </div>

          <div className="space-y-4">
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
        <section id="capabilities" className="border-b border-border py-16 sm:py-24 scroll-mt-14">
          <div className="page-shell space-y-10">
            <div className="max-w-2xl">
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1.5">
                Core Capabilities
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                一套 CLI，抹平所有信息差
              </h2>
              <p className="text-foreground-muted mt-3 text-sm sm:text-base leading-relaxed">
                无论是高频求职者对比机会，还是 AI Agent 自动化分析人才市场，JobHunt CLI 提供最纯粹、高信噪比的体验。
              </p>
            </div>

            <FeatureShowcase />
          </div>
        </section>

        {/* Quickstart Workflow Section */}
        <section id="workflow" className="border-b border-border py-16 sm:py-20 scroll-mt-14 bg-background-subtle/40">
          <div className="page-shell">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs font-mono text-foreground-muted uppercase tracking-wider mb-1.5">
                Quickstart Workflow
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                三步极速上手
              </h2>
              <p className="text-foreground-muted mt-2 text-sm sm:text-base">
                零配置、零学习成本，立即在本地或 Agent 中跑起来
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-border bg-background shadow-xs space-y-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground">
                  01
                </div>
                <h3 className="text-base font-semibold text-foreground">安装 Skill 或 CLI</h3>
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                  使用 npx 将 Skill 添加至 Agent，或通过 npm 全局安装到终端。
                </p>
                <div className="p-2.5 rounded bg-background-subtle border border-border/80 font-mono text-xs text-foreground truncate">
                  npx skills add Enzoding/JobHunt-CLI
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-background shadow-xs space-y-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground">
                  02
                </div>
                <h3 className="text-base font-semibold text-foreground">查看支持站点</h3>
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                  运行 sites 指令列出所有支持的企业代码与可用过滤类别。
                </p>
                <div className="p-2.5 rounded bg-background-subtle border border-border/80 font-mono text-xs text-foreground truncate">
                  job sites
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-background shadow-xs space-y-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground">
                  03
                </div>
                <h3 className="text-base font-semibold text-foreground">开始搜索与比对</h3>
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                  组合关键词、公司与岗位性质，直接输出表格、CSV 或 JSON。
                </p>
                <div className="p-2.5 rounded bg-background-subtle border border-border/80 font-mono text-xs text-foreground truncate">
                  job compare AI --sites meituan,xiaomi
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="border-b border-border py-16 sm:py-24">
          <div className="page-shell">
            <div className="rounded-2xl border border-border bg-background-subtle p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-md">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                开源、轻量、专为 Agent 打造
              </h2>
              <p className="text-foreground-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                无需繁复的登录流程，一键连接 30+ 互联网大厂公开招聘池。立即在你的终端或 Agent 中尝试。
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <a
                  href="#install"
                  className={buttonVariants({ variant: 'primary', size: 'lg' })}
                >
                  立即复制安装命令 ↑
                </a>
                <GitHubLink variant="outline" size="lg">
                  前往 GitHub 仓库
                </GitHubLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="page-shell flex flex-col sm:flex-row items-center justify-between gap-4 py-8 text-xs text-foreground-muted">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">JobHunt CLI</span>
            <span>·</span>
            <span>MIT License</span>
            <span>·</span>
            <span>Open Source Project</span>
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
              GitHub 源码
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

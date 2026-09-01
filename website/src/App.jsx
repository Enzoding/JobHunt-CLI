import { buttonVariants } from '@appica/ui-react/button';
import { InstallCommand } from './components/InstallCommand.jsx';
import { LogoMarquee } from './components/LogoMarquee.jsx';
import { agents } from './data/agents.js';
import { companies } from './data/companies.js';

const GITHUB_URL = 'https://github.com/Enzoding/JobHunt-CLI';

const NAV_LINKS = [
  { href: '#install', label: '安装' },
  { href: '#companies', label: '公司' },
  { href: '#capabilities', label: '能力' },
  { href: '#agents', label: 'Agent' },
];

const CAPABILITIES = [
  {
    title: '统一搜索',
    body: '各家公开招聘官网共用同一套命令和标准字段。社招、校招、实习通过 --nature 切换，不需要记每家站点自己的筛选器。',
  },
  {
    title: '跨公司比较',
    body: 'job compare 把多家公司的岗位放到同一张结果表上，方便对照职责、地点和渠道，而不是在多个招聘页之间来回切换。',
  },
  {
    title: '按需导出',
    body: 'JSON 给 Agent 和脚本，CSV 给表格，Markdown 给分析报告。compact / full 视图控制字段粒度，避免一次塞进完整 JD。',
  },
];

function GitHubLink({ children, variant = 'outline', size = 'md' }) {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({ variant, size })}
    >
      {children}
    </a>
  );
}

function SiteMark() {
  return (
    <a href="#top" className="text-foreground inline-flex items-center gap-2.5 no-underline">
      <span
        aria-hidden="true"
        className="border-foreground inline-flex h-6 w-6 items-center justify-center rounded-[5px] border text-[11px] leading-none font-medium"
      >
        &gt;
      </span>
      <span className="text-sm font-medium tracking-tight">JobHunt CLI</span>
    </a>
  );
}

export default function App() {
  return (
    <div id="top" className="bg-background text-foreground min-h-screen">
      <a className={`${buttonVariants({ variant: 'primary', size: 'sm' })} skip-link`} href="#main">
        跳到正文
      </a>

      <header className="page-rule bg-background sticky top-0 z-20">
        <div className="page-shell flex h-14 items-center justify-between gap-6">
          <SiteMark />
          <nav aria-label="页面章节" className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground-muted hover:text-foreground text-sm no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <GitHubLink variant="ghost" size="sm">
            GitHub
          </GitHubLink>
        </div>
      </header>

      <main id="main">
        <section className="page-rule">
          <div className="page-shell grid grid-cols-4 gap-x-4 gap-y-10 py-16 md:grid-cols-6 md:py-24 lg:grid-cols-12 lg:gap-x-6 lg:py-28">
            <div className="col-span-4 md:col-span-6 lg:col-span-8">
              <p className="text-foreground-muted mb-5 text-sm">开源 CLI · 覆盖 30+ 家公司</p>
              <h1 className="hero-title">让 Agent 直接搜索真实招聘官网</h1>
              <p className="text-foreground-muted mt-6 max-w-[38rem] text-lg leading-7">
                把 30+ 家互联网公司的公开职位统一成可查询、可比较、可导出的结构化数据。同一套
                job 命令，覆盖社招、校招和实习。
              </p>
            </div>
            <div id="install" className="col-span-4 scroll-mt-20 md:col-span-6 lg:col-span-8">
              <InstallCommand />
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <GitHubLink variant="primary">在 GitHub 查看</GitHubLink>
                <a href="#capabilities" className={buttonVariants({ variant: 'ghost', size: 'md' })}>
                  看它能做什么
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="companies" className="page-rule scroll-mt-14 py-10 md:py-12">
          <div className="page-shell mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="text-xl font-semibold tracking-tight">覆盖 30+ 家公开招聘官网</h2>
            <p className="text-foreground-muted max-w-xl text-sm leading-6">
              数据以当前站点 registry 为准，包括独立 adapter 与阿里 CPO 子品牌。标识为本地单色文字图形，不是官方商标复制。
            </p>
          </div>
          <LogoMarquee
            items={companies}
            logoDir="companies"
            duration="72s"
            label="当前支持的公司名单"
          />
        </section>

        <section id="capabilities" className="page-rule scroll-mt-14">
          <div className="page-shell py-16 md:py-24">
            <h2 className="text-xl font-semibold tracking-tight">同一套命令，三种用法</h2>
            <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
              {CAPABILITIES.map((item) => (
                <article key={item.title} className="min-w-0">
                  <h3 className="text-base font-medium tracking-tight">{item.title}</h3>
                  <p className="text-foreground-muted mt-3 text-sm leading-6">{item.body}</p>
                </article>
              ))}
            </div>
            <div className="border-border bg-background-subtle mt-12 overflow-x-auto rounded-md border p-4 md:p-5">
              <pre className="text-foreground m-0 font-mono text-[13px] leading-7">
                {`job meituan search AI --category 技术类 --limit 10 --view compact --format json
job compare AI --sites meituan,xiaomi --nature social --view compact --format json
job meituan all AI --format csv --output jobs.csv`}
              </pre>
            </div>
          </div>
        </section>

        <section id="agents" className="page-rule scroll-mt-14 py-10 md:py-12">
          <div className="page-shell mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="text-xl font-semibold tracking-tight">装进正在用的 Agent</h2>
            <p className="text-foreground-muted max-w-xl text-sm leading-6">
              通过 Agent Skill 安装后即可调用。下列名称是可安装目标，不是兼容认证。
            </p>
          </div>
          <LogoMarquee items={agents} logoDir="agents" duration="32s" label="可安装的 Agent 目标" />
        </section>

        <section className="page-rule">
          <div className="page-shell grid grid-cols-1 gap-6 py-16 md:grid-cols-2 md:items-end md:py-20">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">从一条命令开始</h2>
              <p className="text-foreground-muted mt-4 max-w-md text-base leading-7">
                源码、issue 与 adapter 说明都在 GitHub。安装 Skill 或 CLI 之后，先跑 job sites。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a href="#install" className={buttonVariants({ variant: 'primary', size: 'md' })}>
                回到安装命令
              </a>
              <GitHubLink>GitHub</GitHubLink>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="page-shell flex flex-col gap-3 py-8 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-foreground-muted m-0">JobHunt CLI · MIT License</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-foreground-muted hover:text-foreground no-underline"
          >
            github.com/Enzoding/JobHunt-CLI
          </a>
        </div>
      </footer>
    </div>
  );
}

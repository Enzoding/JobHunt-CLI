import React from 'react';
import { JobHuntLogo } from './JobHuntLogo.jsx';
import { GithubIcon } from './GithubIcon.jsx';
import { ArrowUp } from 'lucide-react';

export function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[var(--m-footer)] text-neutral-400 px-4 pt-20 pb-12 sm:px-6 text-xs border-t border-neutral-800">
      <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-12 gap-8 pb-12 border-b border-neutral-800">
        {/* Brand */}
        <div className="col-span-2 md:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <JobHuntLogo size={22} />
            <span className="text-sm font-semibold tracking-tight">jobhunt</span>
          </div>
          <p className="max-w-xs text-neutral-500 leading-relaxed text-[11px]">
            将中国互联网大厂官方招聘网关转化为干净、标准化的结构化数据，供开发者与 AI Agent 秒级调用。
          </p>
        </div>

        {/* Product */}
        <div className="col-span-1 md:col-span-2 space-y-2.5">
          <span className="font-semibold text-neutral-300 block">功能导航</span>
          <ul className="space-y-2">
            <li><a href="#features" className="hover:text-white transition-colors no-underline">核心特性</a></li>
            <li><a href="#how-it-works" className="hover:text-white transition-colors no-underline">工作流程</a></li>
            <li><a href="#capabilities" className="hover:text-white transition-colors no-underline">全景支持</a></li>
            <li><a href="#compare" className="hover:text-white transition-colors no-underline">多司比对</a></li>
            <li><a href="#ecosystem" className="hover:text-white transition-colors no-underline">生态覆盖</a></li>
          </ul>
        </div>

        {/* Sites */}
        <div className="col-span-1 md:col-span-3 space-y-2.5">
          <span className="font-semibold text-neutral-300 block">已支持大厂</span>
          <div className="grid grid-cols-2 gap-y-1.5 text-neutral-500">
            <span>美团 (Meituan)</span>
            <span>字节跳动 (ByteDance)</span>
            <span>腾讯 (Tencent)</span>
            <span>快手 (Kuaishou)</span>
            <span>小米 (Xiaomi)</span>
            <span>百度 (Baidu)</span>
            <span>京东 (JD)</span>
            <span>滴滴 (DiDi)</span>
          </div>
        </div>

        {/* Resources */}
        <div className="col-span-2 md:col-span-2 space-y-2.5">
          <span className="font-semibold text-neutral-300 block">开发者资源</span>
          <ul className="space-y-2 font-mono text-[11px]">
            <li>
              <a
                href="https://github.com/Enzoding/JobHunt-CLI"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors no-underline"
              >
                GitHub 开源仓库
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/jobhunt-cli"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors no-underline"
              >
                npm registry
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Enzoding/JobHunt-CLI/blob/main/skills/jobhunt-cli/SKILL.md"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors no-underline"
              >
                Agent SKILL.md
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl pt-8 flex items-center justify-between text-neutral-500 text-[11px]">
        <span>© 2024–2026 JobHunt CLI. MIT Licensed.</span>
        <button
          type="button"
          onClick={scrollToTop}
          className="min-h-[44px] px-3 py-2 rounded-lg flex items-center gap-1.5 hover:text-white active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 transition-all cursor-pointer"
          aria-label="回到页面顶部"
        >
          <span>回到顶部</span>
          <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}

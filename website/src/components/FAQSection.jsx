import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '数据来自哪里？是否需要登录账号或提供 Cookie？',
    a: '所有数据均来自各公司官方招聘网站公开直连的 API 网关或公开页面。完全不涉及登录态、Cookie 窃取、内部内网越权或隐私信息，纯净合规，零配置开箱即用。',
  },
  {
    q: '相比传统的无头浏览器网页爬虫（Puppeteer / Playwright），核心优势是什么？',
    a: '传统网页爬虫依赖复杂的 DOM 结构解析与无头浏览器，极其臃肿且网页一旦改版立即失效。JobHunt-CLI 针对每家公司编写了独立的 API Site Adapter，直连底层 JSON 接口，单机极速并发，内存占用极低，且输出数据已全部映射为标准规范字段。',
  },
  {
    q: '如何让 Claude Code、Cursor 或其他 AI Agent 直接调用？',
    a: '项目内置了标准 skills/jobhunt-cli/SKILL.md 文档。你可以直接在 Agent 中将该目录或内容作为 Skill 载入，智能体即可自动掌握 job meituan search、job detail 以及 job analyze 等全部子命令的语法与使用规范。',
  },
  {
    q: '支持哪些招聘类型？（社招、校招、实习）',
    a: '各站点 Adapter 均声明了其已验证的 recruitment natures（如 social、campus、intern）。通过统一参数 --nature social 即可一键切换，默认采用社招渠道。',
  },
  {
    q: '如何添加新的公司招聘站点？',
    a: '非常简单！项目采用经典的 Adapter 设计模式。查阅项目根目录下的 docs/ADDING_SITE.md 文档，在 src/sites/<site>/ 下实现 search、detail、all 和 filters 接口并在 registry.js 中注册，即可秒级接入全新公司。',
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[var(--m-paper)] border-b border-[var(--m-line)]">
      <div className="page-shell max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-[11px] font-semibold tracking-widest text-[var(--m-muted)] uppercase block mb-2 font-mono">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[var(--m-ink)] tracking-tight">
            常见问题与解答
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[var(--m-muted)]">
            了解 JobHunt-CLI 的底层原理、合规保障与最佳实践。
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-[var(--m-panel)] border border-[var(--m-line)] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  id={`faq-btn-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--m-accent)] transition-[background-color,transform] duration-150 active:scale-[0.995] hover:bg-[var(--m-chip)]"
                >
                  <span className="text-sm font-semibold text-[var(--m-ink)]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--m-muted)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--m-accent)]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[var(--m-muted)] leading-relaxed border-t border-[var(--m-line)] pt-3"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

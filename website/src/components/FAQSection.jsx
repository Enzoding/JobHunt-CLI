import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '数据从哪里来？需要登录吗？',
    a: '数据来自各公司公开的招聘网站。你不需要登录，JobHunt 也不会使用 Cookie。',
  },
  {
    q: '这和爬虫有什么不同？',
    a: 'JobHunt 不打开网页，也不启动浏览器。每家公司各有一个适配器，直接读取公开接口，再整理成同一套字段。',
  },
  {
    q: '怎么让 Agent 使用？',
    a: '在页面顶部选择「交给 Agent」，复制那条命令并运行。安装完成后，Claude Code、Cursor 或 Codex 会根据附带的说明自己查询。',
  },
  {
    q: '可以查询社招、校招和实习吗？',
    a: '可以。在命令里加上 --nature，取值可以是社招、校招或实习。不写时默认查询社招。每家公司支持的类型不同，运行 job sites 可以查看。',
  },
  {
    q: '怎么再添加一家公司？',
    a: '打开项目里的 docs/ADDING_SITE.md，按其中的步骤在 src/sites 添加适配器，并在 registry.js 里注册。',
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
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--m-ink)] sm:text-4xl">
            常见问题
          </h2>
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

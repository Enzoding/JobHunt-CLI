import React from 'react';
import { companies } from '../data/companies.js';
import { agents } from '../data/agents.js';

function logoSrc(item, dir) {
  return item.file || `/logos/${dir}/${item.id}.svg`;
}

function MarqueeItem({ item, dir }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[var(--m-card)] border border-[var(--m-line)] shadow-2xs hover:border-[var(--m-line-strong)] transition-all select-none">
      <img
        src={logoSrc(item, dir)}
        alt={item.name}
        className="logo-img shrink-0"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <span className="text-[var(--m-ink)] text-xs font-medium tracking-tight whitespace-nowrap font-sans">
        {item.name}
      </span>
    </div>
  );
}

export function MarqueeIntegrations() {
  return (
    <section id="ecosystem" className="relative z-10 overflow-hidden bg-[var(--m-paper)] pt-12 pb-20 sm:pt-16 sm:pb-24 border-t border-[var(--m-line)]">
      <div className="text-center max-w-xl mx-auto px-4 mb-8 sm:mb-10">
        <span className="text-[10px] uppercase font-semibold font-mono tracking-widest text-[var(--m-muted)] block mb-1.5">
          ECOSYSTEM & COVERAGE
        </span>
        <h2 className="text-base sm:text-lg font-bold text-[var(--m-ink)] tracking-tight">
          已覆盖 30+ 互联网大厂公开招聘网关，适配主流 AI Agent
        </h2>
      </div>

      <div className="space-y-3.5 max-w-6xl mx-auto px-4 sm:px-6 mask-fade-x">
        {/* Track 1: Companies (Scrolling Left) */}
        <div className="marquee">
          <div className="marquee-viewport">
            <div className="marquee-track">
              <div className="marquee-row">
                {companies.map((company) => (
                  <MarqueeItem key={`comp-1-${company.id}`} item={company} dir="companies" />
                ))}
              </div>
              <div className="marquee-row marquee-duplicate" aria-hidden="true">
                {companies.map((company) => (
                  <MarqueeItem key={`comp-2-${company.id}`} item={company} dir="companies" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Track 2: AI Agents (Scrolling Right) */}
        <div className="marquee">
          <div className="marquee-viewport">
            <div className="marquee-track-reverse">
              <div className="marquee-row">
                {agents.map((agent) => (
                  <MarqueeItem key={`agent-1-${agent.id}`} item={agent} dir="agents" />
                ))}
              </div>
              <div className="marquee-row marquee-duplicate" aria-hidden="true">
                {agents.map((agent) => (
                  <MarqueeItem key={`agent-2-${agent.id}`} item={agent} dir="agents" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

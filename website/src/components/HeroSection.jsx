import React from 'react';
import { InstallCommand } from './InstallCommand.jsx';

export function HeroSection() {
  return (
    <section id="install" className="mx-auto max-w-6xl scroll-mt-6 px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-28">
      <div className="flex max-w-3xl flex-col">
        <h1 className="text-[2.5rem] leading-[1.08] font-bold tracking-[-0.04em] text-balance text-[var(--m-ink)] sm:text-6xl lg:text-[4.25rem]">
          把大厂招聘岗位，
          <br />
          接入你的 Agent。
        </h1>
        <p className="mt-6 text-xl leading-8 text-pretty text-[var(--m-ink)]">
          把三十多家公司的公开招聘网站变成同一套命令。你可以自己查，也可以交给 Agent。
        </p>
        <div className="mt-12">
          <InstallCommand />
        </div>
      </div>
    </section>
  );
}

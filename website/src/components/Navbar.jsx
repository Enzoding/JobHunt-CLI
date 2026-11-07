import React, { useState, useEffect } from 'react';
import { JobHuntLogo } from './JobHuntLogo.jsx';
import { GithubIcon } from './GithubIcon.jsx';
import { Sun, Moon, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#install', label: '安装' },
  { href: '#features', label: '能做什么' },
  { href: '#how-it-works', label: '使用步骤' },
  { href: '#capabilities', label: '在哪里用' },
  { href: '#compare', label: '对比多家' },
  { href: '#ecosystem', label: '支持的公司' },
];

export function Navbar() {
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jh-theme');
    const isDark = saved ? saved === 'dark' : false;
    if (isDark) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('jh-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
      {/* Brand */}
      <a
        href="#top"
        className="flex items-center gap-2.5 text-[var(--m-ink)] no-underline focus-visible:outline-2 focus-visible:outline-[var(--m-ink)]"
        aria-label="JobHunt home"
      >
        <JobHuntLogo size={26} />
        <span className="text-base font-semibold tracking-tight text-[var(--m-ink)] font-mono">
          JobHunt <span className="text-[var(--m-muted)] font-normal">CLI</span>
        </span>
      </a>

      {/* Center Navigation - Clean plain text links like Parley */}
      <nav aria-label="Main" className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-normal text-[var(--m-muted)] hover:text-[var(--m-ink)] transition-colors no-underline"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle - 44x44px accessible target */}
        <button
          type="button"
          onClick={toggleTheme}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[var(--m-muted)] hover:text-[var(--m-ink)] active:scale-[0.92] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--m-accent)]"
          title={theme === 'dark' ? '切换为浅色模式' : '切换为深色模式'}
          aria-label={theme === 'dark' ? '切换为浅色模式' : '切换为深色模式'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
        </button>

        {/* Primary Download / Install Button - Crisp black pill */}
        <a
          href="https://github.com/Enzoding/JobHunt-CLI"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--m-ink)] text-[var(--m-paper)] px-4 sm:px-5 py-2 text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] no-underline shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--m-accent)]"
        >
          <GithubIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>GitHub</span>
        </a>

        {/* Mobile menu button - 44x44px accessible target */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--m-muted)] hover:text-[var(--m-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--m-accent)]"
          aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 z-50 rounded-2xl border border-[var(--m-line)] bg-[var(--m-paper)] p-4 shadow-xl md:hidden space-y-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[var(--m-ink)] hover:bg-[var(--m-panel)] rounded-lg no-underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

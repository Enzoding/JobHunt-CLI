import React from 'react';
import { Navbar } from './components/Navbar.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { MarqueeIntegrations } from './components/MarqueeIntegrations.jsx';
import { BentoFeatures } from './components/BentoFeatures.jsx';
import { HowItWorks } from './components/HowItWorks.jsx';
import { PlatformShowcase } from './components/PlatformShowcase.jsx';
import { CrossCompanyMatrix } from './components/CrossCompanyMatrix.jsx';
import { FAQSection } from './components/FAQSection.jsx';
import { CTASection } from './components/CTASection.jsx';
import { FooterSection } from './components/FooterSection.jsx';

export default function App() {
  return (
    <div
      id="top"
      className="min-h-screen bg-[var(--m-paper)] text-[var(--m-ink)] font-sans antialiased selection:bg-[var(--m-accent)]/20 selection:text-[var(--m-accent)] overflow-x-hidden"
    >
      {/* Accessibility skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--m-accent)] focus:text-white focus:shadow-lg focus:font-mono focus:text-xs"
      >
        跳到正文
      </a>

      {/* Modern Aceternity Style Floating/Sticky Navbar */}
      <Navbar />

      <main id="main" tabIndex="-1" className="outline-none">
        <HeroSection />

        {/* Aceternity Z-style Infinite Marquee with Hover Pause */}
        <MarqueeIntegrations />

        <BentoFeatures />

        {/* Aceternity Ue-style 3-Step Auto-Progress Workflow */}
        <HowItWorks />

        {/* Aceternity rt-style Multi-Platform Showcase */}
        <PlatformShowcase />

        {/* Real-world Cross-company Matrix Perspectve */}
        <CrossCompanyMatrix />

        {/* Developer & Agent FAQ Accordion */}
        <FAQSection />

        {/* Aceternity ut-style High-Impact Curved Call-to-Action */}
        <CTASection />
      </main>

      {/* Aceternity gt-style Footer */}
      <FooterSection />
    </div>
  );
}

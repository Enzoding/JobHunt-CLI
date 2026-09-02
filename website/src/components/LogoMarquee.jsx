import React from 'react';

function logoSrc(item, logoDir) {
  return item.file || `/logos/${logoDir}/${item.id}.svg`;
}

function MarqueeItem({ item, logoDir }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-3 py-1.5 rounded-md border border-border/60 bg-background/50 backdrop-blur-xs transition-all duration-200 hover:border-foreground/30 hover:bg-background hover:scale-[1.02] select-none">
      <img src={logoSrc(item, logoDir)} alt="" className="logo-img" />
      <span className="text-foreground text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap">
        {item.name}
      </span>
    </div>
  );
}

function MarqueeRow({ items, logoDir, duplicate = false }) {
  return (
    <div className={`marquee-row ${duplicate ? 'marquee-duplicate' : ''}`}>
      {items.map((item) => (
        <MarqueeItem key={`${duplicate ? 'dup-' : ''}${item.id}`} item={item} logoDir={logoDir} />
      ))}
    </div>
  );
}

export function LogoMarquee({ items, logoDir, duration = '48s', reverse = false, label }) {
  return (
    <div
      className={`marquee mask-fade-x ${reverse ? 'marquee-reverse' : ''}`}
      style={{ '--marquee-duration': duration }}
    >
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <div className="marquee-viewport" aria-hidden="true">
        <div className={`marquee-track ${reverse ? 'marquee-track-reverse' : ''}`} role="presentation">
          <MarqueeRow items={items} logoDir={logoDir} />
          <MarqueeRow items={items} logoDir={logoDir} duplicate />
        </div>
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}

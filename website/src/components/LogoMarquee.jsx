function MarqueeItem({ item, logoDir }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <span
        className="logo-mark"
        style={{ '--logo-src': `url(/logos/${logoDir}/${item.id}.svg)` }}
        aria-hidden="true"
      />
      <span className="text-foreground text-sm font-medium tracking-tight whitespace-nowrap">
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

export function LogoMarquee({ items, logoDir, duration = '48s', label }) {
  return (
    <div className="marquee" style={{ '--marquee-duration': duration }}>
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <div className="marquee-viewport" aria-hidden="true">
        <div className="marquee-track" role="presentation">
          <MarqueeRow items={items} logoDir={logoDir} />
          <MarqueeRow items={items} logoDir={logoDir} duplicate />
        </div>
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}

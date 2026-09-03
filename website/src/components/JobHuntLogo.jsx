import React from 'react';

export function JobHuntLogo({ size = 26, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="jh-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#161f30" />
        </linearGradient>
        <linearGradient id="jh-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="jh-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Squircle container with physical bevel border */}
      <rect width="36" height="36" rx="8.5" fill="url(#jh-bg-grad)" />
      <rect
        x="0.5"
        y="0.5"
        width="35"
        height="35"
        rx="8"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      {/* Target Radar Crosshair / Search Ring */}
      <circle
        cx="21.5"
        cy="14.5"
        r="7.5"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />

      {/* Terminal Prompt Chevron ">" */}
      <path
        d="M8.5 11L14.5 16L8.5 21"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Career Target Node / Pulse */}
      <circle cx="21.5" cy="14.5" r="3" fill="url(#jh-emerald-grad)" filter="url(#jh-glow-filter)" />
      <circle cx="21.5" cy="14.5" r="1" fill="#ffffff" />

      {/* Terminal Underscore / Runway Accent */}
      <line
        x1="12"
        y1="24.5"
        x2="21"
        y2="24.5"
        stroke="url(#jh-emerald-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

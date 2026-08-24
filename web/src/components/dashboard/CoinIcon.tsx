'use client';

import React from 'react';

/**
 * CoinIcon - Lightweight, dependency-free token "logo" badge.
 *
 * Renders a colored circular badge with the token's initials using each
 * token's real brand color, so the assets table/cards no longer show bare
 * text where a logo is expected. No external image requests are made,
 * keeping this fast and safe to render for arbitrary/unknown symbols.
 */

interface CoinTheme {
  bg: string;
  fg: string;
  label: string;
}

const COIN_THEMES: Record<string, CoinTheme> = {
  ETH: { bg: 'linear-gradient(135deg, #62688f 0%, #343434 100%)', fg: '#ffffff', label: 'Ξ' },
  TRAY: { bg: 'linear-gradient(135deg, #f4c94a 0%, #b9860f 100%)', fg: '#1a1200', label: 'T' },
  USDC: { bg: 'linear-gradient(135deg, #2775ca 0%, #1a4f8a 100%)', fg: '#ffffff', label: '$' },
  USDT: { bg: 'linear-gradient(135deg, #26a17b 0%, #16785a 100%)', fg: '#ffffff', label: '$' },
  MATIC: { bg: 'linear-gradient(135deg, #8247e5 0%, #5b21b6 100%)', fg: '#ffffff', label: 'M' },
  POL: { bg: 'linear-gradient(135deg, #8247e5 0%, #5b21b6 100%)', fg: '#ffffff', label: 'P' },
  BTC: { bg: 'linear-gradient(135deg, #f7931a 0%, #b96b0f 100%)', fg: '#ffffff', label: '₿' },
  BNB: { bg: 'linear-gradient(135deg, #f3ba2f 0%, #b8860b 100%)', fg: '#1a1200', label: 'B' },
  AVAX: { bg: 'linear-gradient(135deg, #e84142 0%, #a11f20 100%)', fg: '#ffffff', label: 'A' },
  ARB: { bg: 'linear-gradient(135deg, #28a0f0 0%, #12669b 100%)', fg: '#ffffff', label: 'A' },
};

const FALLBACK_THEME: CoinTheme = {
  bg: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)',
  fg: 'var(--accent-ink)',
  label: '',
};

interface CoinIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function CoinIcon({ symbol, size = 36, className = '' }: Readonly<CoinIconProps>) {
  const key = symbol?.toUpperCase?.() ?? '';
  const theme = COIN_THEMES[key] ?? FALLBACK_THEME;
  const initials = theme.label || key.slice(0, 2);

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold shadow-sm ring-1 ring-white/10 ${className}`}
      style={{
        width: size,
        height: size,
        background: theme.bg,
        color: theme.fg,
        fontSize: Math.round(size * 0.42),
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

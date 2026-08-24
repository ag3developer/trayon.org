'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CoinIcon } from '../CoinIcon';

interface Portfolio {
  totalValue: string;
  assets: Array<{
    symbol: string;
    balance: string;
    value: string;
  }>;
}

interface DashboardStatsProps {
  portfolio: Portfolio | null;
}

/**
 * Compact stats strip. Three oversized cards were replaced with a single
 * slim bar of stacked mini-stats — the same information, a fraction of
 * the vertical space, and a look closer to modern portfolio dashboards
 * (Zerion / Zapper style) instead of the old "admin template" feel.
 */
export function DashboardStats({ portfolio }: Readonly<DashboardStatsProps>) {
  const t = useTranslations('dashboard.stats');

  const mockStats = {
    totalValue: '$0.00',
    change24h: '+0.0%',
    bestAsset: 'ETH',
  };

  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface/60">
      {/* Total Value */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <p className="text-[11px] sm:text-xs font-medium text-muted">{t('totalValue')}</p>
        <p className="mt-1 text-lg sm:text-2xl font-semibold text-foreground">
          {portfolio?.totalValue || mockStats.totalValue}
        </p>
      </div>

      {/* 24h Change */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <p className="text-[11px] sm:text-xs font-medium text-muted">{t('change24h')}</p>
        <p className="mt-1 text-lg sm:text-2xl font-semibold text-accent">{mockStats.change24h}</p>
      </div>

      {/* Best Asset */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <p className="text-[11px] sm:text-xs font-medium text-muted">{t('bestAsset')}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <CoinIcon symbol={mockStats.bestAsset} size={18} />
          <p className="text-lg sm:text-2xl font-semibold text-foreground">{mockStats.bestAsset}</p>
        </div>
      </div>
    </div>
  );
}

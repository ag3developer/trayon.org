'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp } from 'lucide-react';

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

export function DashboardStats({ portfolio }: DashboardStatsProps) {
  const t = useTranslations('dashboard.stats');

  const mockStats = {
    totalValue: '$0.00',
    change24h: '+0.0%',
    bestAsset: 'ETH',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Value Card */}
      <div className="rounded-lg border border-border bg-surface/60 p-6 hover:border-accent/40 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted">{t('totalValue')}</p>
            <p className="text-3xl font-semibold text-foreground mt-2">
              {portfolio?.totalValue || mockStats.totalValue}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-accent-soft">
            <TrendingUp className="w-6 h-6 text-accent" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* 24h Change Card */}
      <div className="rounded-lg border border-border bg-surface/60 p-6 hover:border-accent/40 transition-colors">
        <p className="text-sm font-medium text-muted">{t('change24h')}</p>
        <p className="text-3xl font-semibold text-accent mt-2">
          {mockStats.change24h}
        </p>
        <p className="text-xs text-muted mt-2">Market momentum</p>
      </div>

      {/* Best Asset Card */}
      <div className="rounded-lg border border-border bg-surface/60 p-6 hover:border-accent/40 transition-colors">
        <p className="text-sm font-medium text-muted">{t('bestAsset')}</p>
        <p className="text-3xl font-semibold text-foreground mt-2">
          {mockStats.bestAsset}
        </p>
        <p className="text-xs text-accent mt-2">+5.2% today</p>
      </div>
    </div>
  );
}

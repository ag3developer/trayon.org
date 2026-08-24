'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CoinIcon } from '../CoinIcon';

interface Portfolio {
  totalValue: string;
  assets: Array<{
    symbol: string;
    balance: string;
    value: string;
  }>;
}

interface DashboardAssetsProps {
  portfolio: Portfolio | null;
}

const mockAssets = [
  { symbol: 'ETH', name: 'Ethereum', balance: '0.0000', value: '$0.00', change24h: '+2.3%' },
  { symbol: 'TRAY', name: 'Trayon', balance: '0', value: '$0.00', change24h: '+1.2%' },
  { symbol: 'USDC', name: 'USD Coin', balance: '0', value: '$0.00', change24h: '+0.0%' },
];

function ChangeBadge({ change }: Readonly<{ change: string }>) {
  const isPositive = !change.trim().startsWith('-');
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isPositive ? 'bg-accent-soft text-accent' : 'bg-danger/10 text-danger'
      }`}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {change}
    </span>
  );
}

export function DashboardAssets({ portfolio }: Readonly<DashboardAssetsProps>) {
  const t = useTranslations('dashboard.assets');
  const assets = portfolio?.assets || mockAssets;

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">{t('title')}</h2>
      </div>

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-muted">{t('noAssets')}</p>
        </div>
      )}

      {assets.length > 0 && (
        <>
          {/* Mobile: Card list (sm and below) */}
          <div className="divide-y divide-border sm:hidden">
            {assets.map((asset, idx) => {
              const name = mockAssets[idx]?.name ?? asset.symbol;
              const change = mockAssets[idx]?.change24h ?? '+0.0%';
              return (
                <div key={asset.symbol} className="flex items-center gap-3 px-4 py-4">
                  <CoinIcon symbol={asset.symbol} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-foreground">{asset.symbol}</p>
                      <p className="font-semibold text-foreground">{asset.value}</p>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted">
                        {name} · {asset.balance}
                      </p>
                      <ChangeBadge change={change} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop/tablet: Table (sm and up) */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">
                    {t('asset')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">
                    {t('balance')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">
                    {t('value')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">
                    {t('change24h')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assets.map((asset, idx) => (
                  <tr key={asset.symbol} className="transition-colors hover:bg-surface-2">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CoinIcon symbol={asset.symbol} size={32} />
                        <div>
                          <p className="font-medium text-foreground">{asset.symbol}</p>
                          {mockAssets[idx]?.name && (
                            <p className="text-xs text-muted">{mockAssets[idx].name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">{asset.balance}</td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      {asset.value}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChangeBadge change={mockAssets[idx]?.change24h || '+0.0%'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

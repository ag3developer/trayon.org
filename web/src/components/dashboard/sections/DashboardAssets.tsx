'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

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

export function DashboardAssets({ portfolio }: DashboardAssetsProps) {
  const t = useTranslations('dashboard.assets');
  const assets = portfolio?.assets || mockAssets;

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">{t('title')}</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
              <tr
                key={asset.symbol}
                className="hover:bg-surface-2 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {asset.symbol}
                    </p>
                    {mockAssets[idx]?.name && (
                      <p className="text-xs text-muted">
                        {mockAssets[idx].name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-foreground">
                  {asset.balance}
                </td>
                <td className="px-6 py-4 text-right font-medium text-foreground">
                  {asset.value}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-accent font-medium">
                    {mockAssets[idx]?.change24h || '+0.0%'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-muted">No assets yet. Connect your wallet to get started.</p>
        </div>
      )}
    </div>
  );
}

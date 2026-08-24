'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Wallet } from 'lucide-react';

interface DashboardWalletProps {
  balance?: string;
  chainId?: number;
}

const chainNames: { [key: number]: string } = {
  1: 'Ethereum',
  137: 'Polygon',
  43114: 'Avalanche',
  250: 'Fantom',
};

export function DashboardWallet({ balance, chainId }: DashboardWalletProps) {
  const t = useTranslations('dashboard.wallet');
  const chainName = chainId ? chainNames[chainId] || `Chain ${chainId}` : 'Unknown';

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent-soft">
          <Wallet className="w-5 h-5 text-accent" strokeWidth={1.5} />
        </div>
        <h3 className="font-semibold text-foreground">{t('title')}</h3>
      </div>

      <div className="space-y-4">
        {/* Balance */}
        <div>
          <p className="text-xs font-medium text-muted mb-1">
            {t('nativeBalance')}
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {balance ? Number(balance).toFixed(4) : '0.0000'} {chainName.split(' ')[0]}
          </p>
        </div>

        {/* Network */}
        <div>
          <p className="text-xs font-medium text-muted mb-1">
            {t('network')}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <p className="font-medium text-foreground">{chainName}</p>
          </div>
        </div>

        {/* Chain ID */}
        <div>
          <p className="text-xs font-medium text-muted mb-1">
            {t('chainId')}
          </p>
          <p className="font-mono text-sm text-foreground">
            {chainId || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

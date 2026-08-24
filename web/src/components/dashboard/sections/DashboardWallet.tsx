'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Wallet } from 'lucide-react';
import { CoinIcon } from '../CoinIcon';

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

const chainSymbols: { [key: number]: string } = {
  1: 'ETH',
  137: 'POL',
  43114: 'AVAX',
  250: 'FTM',
};

export function DashboardWallet({ balance, chainId }: Readonly<DashboardWalletProps>) {
  const t = useTranslations('dashboard.wallet');
  const chainName = chainId ? chainNames[chainId] || `Chain ${chainId}` : 'Unknown';
  const chainSymbol = chainId ? chainSymbols[chainId] || chainName.split(' ')[0] : 'ETH';

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-md bg-accent-soft p-1.5">
          <Wallet className="h-4 w-4 text-accent" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{t('title')}</h3>
      </div>

      <div className="space-y-3">
        {/* Balance */}
        <div className="flex items-center gap-3">
          <CoinIcon symbol={chainSymbol} size={32} />
          <div>
            <p className="text-[11px] font-medium text-muted">{t('nativeBalance')}</p>
            <p className="text-lg font-semibold text-foreground">
              {balance ? Number(balance).toFixed(4) : '0.0000'} {chainSymbol}
            </p>
          </div>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between rounded-md border border-border/60 bg-surface-2/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            <p className="text-sm font-medium text-foreground">{chainName}</p>
          </div>
          <p className="font-mono text-xs text-muted">#{chainId || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

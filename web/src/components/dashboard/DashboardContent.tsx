'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { DashboardHeader } from './sections/DashboardHeader';
import { DashboardStats } from './sections/DashboardStats';
import { DashboardAssets } from './sections/DashboardAssets';
import { DashboardWallet } from './sections/DashboardWallet';
import { DashboardQuickActions } from './sections/DashboardQuickActions';

interface Portfolio {
  totalValue: string;
  assets: Array<{
    symbol: string;
    balance: string;
    value: string;
  }>;
}

interface DashboardContentProps {
  address: string;
  portfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  balance?: string | undefined;
  chainId?: number | undefined;
  onRefresh: () => void;
}

export function DashboardContent({
  address,
  portfolio,
  isLoading,
  error,
  balance,
  chainId,
  onRefresh,
}: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader address={address} onRefresh={onRefresh} isLoading={isLoading} />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="font-semibold text-danger">Error Loading Portfolio</p>
                <p className="text-sm text-danger/80">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !portfolio && (
            <div className="rounded-lg border border-border bg-surface p-12 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin">
                  <RefreshCw className="w-6 h-6 text-accent" strokeWidth={2} />
                </div>
                <p className="text-muted font-medium">Loading your portfolio...</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {!isLoading && (
            <>
              <DashboardStats portfolio={portfolio} />

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <DashboardAssets portfolio={portfolio} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <DashboardWallet balance={balance} chainId={chainId} />
                  <DashboardQuickActions />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

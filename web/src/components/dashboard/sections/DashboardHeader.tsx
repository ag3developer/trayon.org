'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/Navbar';
import { RefreshCw, Clock } from 'lucide-react';

interface DashboardHeaderProps {
  address: string;
  onRefresh: () => void;
  isLoading: boolean;
}

/**
 * Slim dashboard header: title + live clock + refresh only.
 *
 * The wallet address is intentionally NOT repeated here — it's already
 * shown (with copy/disconnect/network actions) in the "Connect Wallet"
 * dropdown in the Navbar above, so duplicating a big "Account" card here
 * just wasted vertical space and confused users into thinking they were
 * looking at two different wallets.
 */
export function DashboardHeader({ onRefresh, isLoading }: Readonly<DashboardHeaderProps>) {
  const t = useTranslations('dashboard.header');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="border-b border-border/50 bg-surface backdrop-blur-sm sticky top-0 z-40">
        <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground leading-tight tracking-tight">
                {t('portfolio')}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                <Clock className="w-3 h-3 opacity-60" />
                <span>{currentTime}</span>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="relative group flex-shrink-0 p-2 rounded-full border border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              title={isLoading ? t('refreshing') : t('refresh')}
            >
              <RefreshCw
                className={`w-4 h-4 transition-transform duration-500 ${
                  isLoading ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

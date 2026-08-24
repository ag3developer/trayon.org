'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/Navbar';
import { RefreshCw, Clock, Copy, CheckCircle2 } from 'lucide-react';

interface DashboardHeaderProps {
  address: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DashboardHeader({ address, onRefresh, isLoading }: DashboardHeaderProps) {
  const t = useTranslations('dashboard.header');
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <>
      <Navbar />
      <div className="border-b border-border/50 bg-surface backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto">
            {/* Top Row: Title and Refresh */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <h1 className="text-4xl font-semibold text-foreground leading-tight tracking-tight">
                  {t('portfolio')}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <Clock className="w-3.5 h-3.5 opacity-60" />
                  <span>{currentTime}</span>
                </div>
              </div>

              {/* Refresh Button - Modernized */}
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="relative group p-2.5 rounded-full border border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                title={isLoading ? t('refreshing') : t('refresh')}
              >
                <RefreshCw
                  className={`w-5 h-5 transition-transform duration-500 ${
                    isLoading ? 'animate-spin' : 'group-hover:rotate-180'
                  }`}
                  strokeWidth={2}
                />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
              </button>
            </div>

            {/* Bottom Row: Account Card */}
            <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/60 bg-surface-2/40 hover:bg-surface-2/60 transition-colors duration-300">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">{t('account')}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <code className="font-mono text-sm text-accent font-semibold truncate">{shortAddress}</code>
                  <button
                    onClick={handleCopyAddress}
                    className="flex-shrink-0 p-1.5 rounded-md text-accent/60 hover:text-accent hover:bg-accent/10 transition-colors duration-200 active:scale-90"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Full address tooltip on hover */}
              <div className="hidden sm:block text-right">
                <div className="text-xs text-muted/60 truncate max-w-xs" title={address}>
                  {address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

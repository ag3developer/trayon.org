'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Wallet, ArrowRight, Briefcase, Coins, ArrowLeftRight } from 'lucide-react';

interface DashboardConnectStateProps {
  onConnect: () => void;
}

export function DashboardConnectState({ onConnect }: DashboardConnectStateProps) {
  const t = useTranslations('dashboard.connect');

  const features = [
    { icon: Briefcase, label: t('features.portfolio') },
    { icon: Coins, label: t('features.assets') },
    { icon: ArrowLeftRight, label: t('features.bridge') },
  ];

  return (
    <section className="relative min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative w-full max-w-md">
        {/* Card Container - matches landing page design */}
        <div className="rounded-lg border border-border bg-surface shadow-lg backdrop-blur overflow-hidden">
          {/* Header Accent Line */}
          <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

          {/* Content */}
          <div className="p-8 sm:p-10 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 rounded-lg bg-accent-soft">
                <Wallet className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight tracking-tight">
                {t('title')}
              </h1>
              <p className="text-muted text-base sm:text-lg leading-relaxed">
                {t('description')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-3 py-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.label} className="flex flex-col items-center gap-2 p-3 rounded-md border border-border/50 hover:border-accent/30 transition-colors">
                    <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-muted">
                      {feature.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Button - matches Hero component style */}
            <button
              onClick={onConnect}
              className="glow-accent w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
            >
              <span>{t('button')}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>

            {/* Footer Text */}
            <p className="text-xs text-muted">
              {t('supportedWallets')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

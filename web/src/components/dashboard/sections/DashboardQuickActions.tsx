'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, ArrowLeftRight, Zap } from 'lucide-react';

export function DashboardQuickActions() {
  const t = useTranslations('dashboard.quickActions');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = [
    {
      id: 'send',
      icon: Send,
      label: t('send'),
      description: t('sendDesc'),
      className: 'bg-accent hover:bg-accent-strong text-white hover:shadow-lg hover:shadow-accent/20',
    },
    {
      id: 'bridge',
      icon: ArrowLeftRight,
      label: t('bridge'),
      description: t('bridgeDesc'),
      className: 'border border-border hover:border-accent/60 text-foreground hover:bg-surface-2 hover:text-accent',
    },
    {
      id: 'swap',
      icon: Zap,
      label: t('swap'),
      description: t('swapDesc'),
      className: 'border border-border hover:border-accent/60 text-foreground hover:bg-surface-2 hover:text-accent',
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface backdrop-blur-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground leading-tight">{t('title')}</h3>
        <div className="w-1 h-1 rounded-full bg-accent/40" />
      </div>

      {/* Actions Grid */}
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;

          return (
            <button
              key={action.id}
              onMouseEnter={() => setActiveAction(action.id)}
              onMouseLeave={() => setActiveAction(null)}
              className={`
                w-full px-4 py-3 rounded-lg font-semibold text-sm
                flex items-center justify-center gap-2
                transition-all duration-300 active:scale-95
                ${action.className}
                ${isActive ? 'ring-2 ring-accent/40 ring-offset-2 ring-offset-background' : ''}
              `}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/40">
        <p className="text-xs text-muted leading-relaxed">
          {t('info')}
        </p>
      </div>
    </div>
  );
}

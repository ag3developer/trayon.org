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
    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
      {/* Header */}
      <h3 className="text-sm font-semibold text-foreground leading-tight">{t('title')}</h3>

      {/* Actions Grid */}
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;

          return (
            <button
              key={action.id}
              type="button"
              onMouseEnter={() => setActiveAction(action.id)}
              onMouseLeave={() => setActiveAction(null)}
              title={action.description}
              className={`
                flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2.5
                text-xs font-semibold
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
    </div>
  );
}

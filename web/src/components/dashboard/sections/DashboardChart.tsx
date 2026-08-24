'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardChartProps {
  /** Total portfolio value as a display string, e.g. "$0.00" */
  totalValue?: string;
  className?: string;
}

type RangeKey = '24H' | '7D' | '30D';

const RANGE_POINTS: Record<RangeKey, number> = {
  '24H': 24,
  '7D': 7 * 6,
  '30D': 30,
};

/**
 * Deterministic mock history generator so the chart always has something
 * meaningful to render before real portfolio history is wired up. Uses the
 * current total value (if any) as the ending anchor point.
 */
function buildSeries(range: RangeKey, anchor: number) {
  const points = RANGE_POINTS[range];
  const base = anchor > 0 ? anchor : 1000;
  const series: { label: string; value: number }[] = [];
  let value = base * 0.92;

  for (let i = 0; i < points; i++) {
    // Smooth deterministic pseudo-random walk (no Math.random for SSR stability)
    const wave = Math.sin(i / (points / 6)) * base * 0.03;
    const drift = (i / points) * base * 0.08;
    value = base * 0.92 + wave + drift;
    series.push({ label: `${i}`, value: Math.max(value, 0) });
  }
  // Ensure the chart ends exactly at the current total value.
  series[series.length - 1].value = base;
  return series;
}

export function DashboardChart({ totalValue, className = '' }: Readonly<DashboardChartProps>) {
  const t = useTranslations('dashboard.chart');
  const [range, setRange] = useState<RangeKey>('7D');

  const anchor = useMemo(() => {
    const numeric = Number((totalValue ?? '0').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }, [totalValue]);

  const data = useMemo(() => buildSeries(range, anchor), [range, anchor]);
  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const percentChange = first > 0 ? ((last - first) / first) * 100 : 0;
  const isPositive = percentChange >= 0;

  return (
    <div className={`rounded-lg border border-border bg-surface p-4 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{t('title')}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-semibold text-foreground">
              {totalValue || '$0.00'}
            </p>
            <span
              className={`text-xs sm:text-sm font-medium ${
                isPositive ? 'text-accent' : 'text-danger'
              }`}
            >
              {isPositive ? '+' : ''}
              {percentChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex flex-shrink-0 gap-1 rounded-md border border-border bg-surface-2 p-1">
          {(Object.keys(RANGE_POINTS) as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === key
                  ? 'bg-accent text-accent-ink'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-48 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis dataKey="label" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              cursor={{ stroke: 'var(--accent)', strokeOpacity: 0.3 }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--foreground)',
              }}
              formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, t('title')]}
              labelFormatter={() => ''}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

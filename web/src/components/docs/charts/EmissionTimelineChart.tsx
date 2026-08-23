"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "./useChartColors";
import { useIsMobile } from "./useIsMobile";

// Circulating supply unlock schedule, in millions of TRAY.
// 250M unlocks at launch, +50M/year through year 5 (matches 04-TOKENOMICS.md).
const EMISSION = [
  { year: "2026 (Launch)", yearShort: "2026", circulating: 250, locked: 750 },
  { year: "2027", yearShort: "2027", circulating: 300, locked: 700 },
  { year: "2028", yearShort: "2028", circulating: 350, locked: 650 },
  { year: "2029", yearShort: "2029", circulating: 400, locked: 600 },
  { year: "2030", yearShort: "2030", circulating: 450, locked: 550 },
  { year: "2031", yearShort: "2031", circulating: 500, locked: 500 },
] as const;

export function EmissionTimelineChart() {
  const c = useChartColors();
  const isMobile = useIsMobile();

  return (
    <div className="docs-chart">
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 300}>
        <AreaChart
          data={EMISSION as unknown as Record<string, unknown>[]}
          margin={{ top: 8, right: 8, left: isMobile ? -20 : -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="circulatingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.accent} stopOpacity={0.55} />
              <stop offset="100%" stopColor={c.accent} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="lockedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.violet} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c.violet} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={isMobile ? "yearShort" : "year"}
            tick={{ fill: c.muted, fontSize: isMobile ? 10 : 11 }}
            axisLine={{ stroke: c.border }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: c.muted, fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 40 : 54}
            tickFormatter={(v: number) => `${v}M`}
          />
          <Tooltip
            formatter={(value, name) =>
              [`${value}M TRAY`, name === "circulating" ? "Circulating" : "Locked"] as [string, string]
            }
            contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, color: c.foreground, fontSize: 12 }}
          />
          <Legend
            formatter={(value: string) => (value === "circulating" ? "Circulating supply" : "Locked (vesting)")}
            wrapperStyle={{ fontSize: 11, color: c.muted }}
          />
          <Area type="monotone" dataKey="locked" stackId="1" stroke={c.violet} fill="url(#lockedFill)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="circulating" stackId="1" stroke={c.accent} fill="url(#circulatingFill)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
      <p className="docs-chart-caption">
        Projected unlock schedule, 2026–2031: 250M TRAY circulate at launch, with
        +50M/year released through validator rewards and development vesting —
        a smooth dilution curve with no single unlock shock.
      </p>
    </div>
  );
}

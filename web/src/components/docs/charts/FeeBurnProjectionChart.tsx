"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "./useChartColors";

// Illustrative deflationary supply curve driven by the 20% fee-burn rate,
// matching the Year 1/3/5 figures in 04-TOKENOMICS.md ("Modelo de Preço & Demanda").
const BURN_PROJECTION = [
  { year: "2026", supply: 1000 },
  { year: "2027", supply: 800 },
  { year: "2028", supply: 620 },
  { year: "2029", supply: 500 },
  { year: "2030", supply: 350 },
  { year: "2031", supply: 250 },
] as const;

export function FeeBurnProjectionChart() {
  const c = useChartColors();

  return (
    <div className="docs-chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={BURN_PROJECTION as unknown as Record<string, unknown>[]} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: c.muted, fontSize: 11 }} axisLine={{ stroke: c.border }} tickLine={false} />
          <YAxis
            tick={{ fill: c.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={54}
            tickFormatter={(v: number) => `${v}M`}
          />
          <Tooltip
            formatter={(value) => [`${value}M TRAY`, "Total supply"] as [string, string]}
            contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, color: c.foreground, fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="supply"
            stroke={c.danger}
            strokeWidth={2.25}
            dot={{ r: 3, fill: c.danger, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="docs-chart-caption">
        Illustrative deflationary path assuming sustained network usage: 20% of
        gas fees are burned every transaction (see{" "}
        <a href="#deflation">Fee burn &amp; deflation</a>), progressively
        reducing total supply from 1B toward ~250M TRAY by 2031.
      </p>
    </div>
  );
}

"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "./useChartColors";
import { useIsMobile } from "./useIsMobile";

// Projected validator count and network TVL (in $M) growth, base-case scenario.
const GROWTH = [
  { period: "Testnet (Q4 2026)", periodShort: "Testnet", validators: 5, tvl: 0.5 },
  { period: "Mainnet Beta (Q2 2027)", periodShort: "Beta", validators: 150, tvl: 25 },
  { period: "Global (Q4 2027)", periodShort: "Global", validators: 500, tvl: 180 },
  { period: "2028", periodShort: "2028", validators: 800, tvl: 420 },
  { period: "2029", periodShort: "2029", validators: 1000, tvl: 900 },
  { period: "2030+", periodShort: "2030+", validators: 1200, tvl: 1600 },
] as const;

export function ValidatorGrowthChart() {
  const c = useChartColors();
  const isMobile = useIsMobile();

  return (
    <div className="docs-chart">
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 300}>
        <ComposedChart
          data={GROWTH as unknown as Record<string, unknown>[]}
          margin={{ top: 8, right: isMobile ? 0 : 12, left: isMobile ? -24 : -8, bottom: 0 }}
        >
          <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={isMobile ? "periodShort" : "period"}
            tick={{ fill: c.muted, fontSize: isMobile ? 9 : 10.5 }}
            axisLine={{ stroke: c.border }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: c.muted, fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 34 : 44}
            tickFormatter={(v: number) => `${v}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: c.muted, fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 40 : 54}
            tickFormatter={(v: number) => `$${v}M`}
          />
          <Tooltip
            formatter={(value, name) =>
              (name === "validators"
                ? [`${Number(value).toLocaleString()} nodes`, "Validators"]
                : [`$${value}M`, "Network TVL"]) as [string, string]
            }
            contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, color: c.foreground, fontSize: 12 }}
          />
          <Legend
            formatter={(value: string) => (value === "validators" ? "Active validators" : "Network TVL ($M)")}
            wrapperStyle={{ fontSize: 11, color: c.muted }}
          />
          <Bar yAxisId="left" dataKey="validators" fill={c.accent} radius={[4, 4, 0, 0]} barSize={isMobile ? 18 : 26} />
          <Line yAxisId="right" type="monotone" dataKey="tvl" stroke={c.gold} strokeWidth={2.25} dot={{ r: 3, fill: c.gold, strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="docs-chart-caption">
        Projected validator count and network TVL under the base-case roadmap
        (see <a href="/docs/validators">Running a Validator</a> and the{" "}
        <a href="/whitepaper">whitepaper roadmap</a>). Figures are illustrative
        targets, not guarantees.
      </p>
    </div>
  );
}

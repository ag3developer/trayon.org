"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import { useChartColors } from "./docs/charts/useChartColors";
import { useIsMobile } from "./docs/charts/useIsMobile";

const ALLOCATION = [
  { name: "Initial Launch (IDO/Private)", value: 25, amount: "250M TRAY" },
  { name: "DAO Treasury", value: 25, amount: "250M TRAY" },
  { name: "Validators & Operators", value: 20, amount: "200M TRAY" },
  { name: "Development Team", value: 15, amount: "150M TRAY" },
  { name: "Partnerships & Integrations", value: 10, amount: "100M TRAY" },
  { name: "Strategic Reserve", value: 5, amount: "50M TRAY" },
] as const;

/**
 * Compact TRAY supply-allocation donut for the landing page's Token
 * section, with percentage labels drawn directly on each slice and a
 * companion breakdown table underneath (see Token.tsx) so the allocation
 * is legible on its own, not just distinguishable by color. Shares the
 * theme-aware color hook used by the /docs charts so it automatically
 * matches light/dark mode.
 */
export function TokenAllocationChart() {
  const c = useChartColors();
  const isMobile = useIsMobile();
  const colors = [c.accent, c.violet, c.blue, c.gold, c.rose, c.signal];
  const outerRadius = isMobile ? 100 : 110;

  const renderPercentLabel = ({ cx, cy, midAngle, outerRadius: r, percent }: PieLabelRenderProps) => {
    const RADIAN = Math.PI / 180;
    const radius = Number(r) + 18;
    const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
    const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={c.foreground}
        textAnchor={x > Number(cx) ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${Math.round(Number(percent) * 100)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 300 : 280}>
      <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <Pie
          data={ALLOCATION as unknown as Record<string, unknown>[]}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={outerRadius * 0.58}
          outerRadius={outerRadius}
          paddingAngle={1.5}
          strokeWidth={0}
          label={renderPercentLabel}
          labelLine={{ stroke: c.muted, strokeWidth: 1 }}
        >
          {ALLOCATION.map((entry, idx) => (
            <Cell key={entry.name} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, _name, item) => {
            const pct = Number(value);
            const amount = (item?.payload as { amount?: string } | undefined)?.amount ?? "";
            return [`${pct}% · ${amount}`, ""] as [string, string];
          }}
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            color: c.foreground,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { ALLOCATION as TOKEN_ALLOCATION };

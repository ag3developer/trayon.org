"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartColors } from "./docs/charts/useChartColors";
import { useIsMobile } from "./docs/charts/useIsMobile";

const ALLOCATION = [
  { name: "Initial Launch (IDO/Private)", value: 25 },
  { name: "DAO Treasury", value: 25 },
  { name: "Validators & Operators", value: 20 },
  { name: "Development Team", value: 15 },
  { name: "Partnerships & Integrations", value: 10 },
  { name: "Strategic Reserve", value: 5 },
] as const;

/**
 * Compact TRAY supply-allocation donut for the landing page's Token
 * section. Shares the theme-aware color hook used by the /docs charts so
 * it automatically matches light/dark mode.
 */
export function TokenAllocationChart() {
  const c = useChartColors();
  const isMobile = useIsMobile();
  const colors = [c.accent, c.violet, c.blue, c.gold, c.rose, c.signal];

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 340 : 260}>
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={ALLOCATION as unknown as Record<string, unknown>[]}
          dataKey="value"
          nameKey="name"
          cx={isMobile ? "50%" : "34%"}
          cy={isMobile ? "34%" : "50%"}
          innerRadius={isMobile ? 50 : 62}
          outerRadius={isMobile ? 78 : 96}
          paddingAngle={1.5}
          strokeWidth={0}
        >
          {ALLOCATION.map((entry, idx) => (
            <Cell key={entry.name} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => {
            const pct = Number(value);
            return [`${pct}% · ${(pct * 10).toLocaleString()}M TRAY`, ""] as [string, string];
          }}
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            color: c.foreground,
            fontSize: 12,
          }}
        />
        <Legend
          layout={isMobile ? "horizontal" : "vertical"}
          verticalAlign={isMobile ? "bottom" : "middle"}
          align={isMobile ? "center" : "right"}
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: c.muted, lineHeight: "19px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

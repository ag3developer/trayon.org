"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useChartColors } from "./useChartColors";

const ALLOCATION = [
  { name: "Initial Launch (IDO/Private)", value: 25 },
  { name: "DAO Treasury", value: 25 },
  { name: "Validators & Operators", value: 20 },
  { name: "Development Team", value: 15 },
  { name: "Partnerships & Integrations", value: 10 },
  { name: "Strategic Reserve", value: 5 },
] as const;

export function SupplyDistributionChart() {
  const c = useChartColors();
  const colors = [c.accent, c.violet, c.blue, c.gold, c.rose, c.signal];

  return (
    <div className="docs-chart">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={ALLOCATION as unknown as Record<string, unknown>[]}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
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
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: c.muted, lineHeight: "22px" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="docs-chart-caption">
        Initial supply allocation — 1,000,000,000 TRAY total. See{" "}
        <a href="#supply">Supply</a> for the detailed breakdown per category.
      </p>
    </div>
  );
}

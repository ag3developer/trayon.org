"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import { useChartColors } from "./useChartColors";
import { useIsMobile } from "./useIsMobile";

const ALLOCATION = [
  { name: "Initial Launch (IDO/Private)", value: 25, amount: "250M TRAY" },
  { name: "DAO Treasury", value: 25, amount: "250M TRAY" },
  { name: "Validators & Operators", value: 20, amount: "200M TRAY" },
  { name: "Development Team", value: 15, amount: "150M TRAY" },
  { name: "Partnerships & Integrations", value: 10, amount: "100M TRAY" },
  { name: "Strategic Reserve", value: 5, amount: "50M TRAY" },
] as const;

/**
 * Donut chart used on the /docs/tokenomics page. Draws the percentage
 * directly on each slice (not just distinguishable by color/tooltip) and
 * is paired with a breakdown table underneath so the allocation is
 * legible on its own — same approach as the landing page's
 * TokenAllocationChart.
 */
export function SupplyDistributionChart() {
  const c = useChartColors();
  const isMobile = useIsMobile();
  const colors = [c.accent, c.violet, c.blue, c.gold, c.rose, c.signal];
  const outerRadius = isMobile ? 90 : 100;

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
    <div className="docs-chart">
      <ResponsiveContainer width="100%" height={isMobile ? 420 : 340}>
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <Pie
            data={ALLOCATION as unknown as Record<string, unknown>[]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy={isMobile ? "42%" : "50%"}
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
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: c.muted, lineHeight: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>

      <table className="docs-chart-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Share</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {ALLOCATION.map((row, idx) => (
            <tr key={row.name}>
              <td>
                <span className="docs-chart-table-label">
                  <span
                    className="docs-chart-swatch"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  {row.name}
                </span>
              </td>
              <td className="docs-chart-table-num">{row.value}%</td>
              <td className="docs-chart-table-num docs-chart-table-muted">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="docs-chart-caption">
        Initial supply allocation — 1,000,000,000 TRAY total. See{" "}
        <a href="#allocation-breakdown">Initial allocation breakdown</a> for
        vesting and usage detail per category.
      </p>
    </div>
  );
}

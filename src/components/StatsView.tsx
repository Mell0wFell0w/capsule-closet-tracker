import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ClothingItem, Replacement } from "../types";
import { CATEGORY_LABELS } from "../types";
import { computeStats } from "../utils/stats";

interface StatsViewProps {
  items: ClothingItem[];
  replacements: Replacement[];
}

const CHART_COLORS = [
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#a5b4fc",
  "#818cf8",
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
  "#f472b6",
  "#fb7185",
  "#f87171",
  "#fca5a5",
];

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function StatsView({ items, replacements }: StatsViewProps) {
  const stats = computeStats(items, replacements);

  const pieData = stats.byCategory
    .filter((s) => s.totalValue > 0)
    .map((s) => ({
      name: CATEGORY_LABELS[s.category],
      value: s.totalValue,
    }));

  const barItemData = stats.byCategory
    .filter((s) => s.itemCount > 0)
    .map((s) => ({
      name: CATEGORY_LABELS[s.category],
      Items: s.itemCount,
    }));

  const barCostData = stats.byCategory
    .filter((s) => s.totalValue > 0 || s.replacementCost > 0)
    .map((s) => ({
      name: CATEGORY_LABELS[s.category],
      "Purchase Cost": s.totalValue,
      "Replacement Cost": s.replacementCost,
    }));

  if (items.length === 0 && replacements.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-text">Add items to your closet to see stats.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-toolbar">
        <span className="page-title">Stats</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Wardrobe Value</div>
          <div className="stat-value">{fmtUSD(stats.totalValue)}</div>
          <div className="stat-sub">{stats.totalActiveItems} active items</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Replacement Cost</div>
          <div className="stat-value">{fmtUSD(stats.totalReplacementCost)}</div>
          <div className="stat-sub">{replacements.length} replacements tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Archived Items</div>
          <div className="stat-value">{stats.totalArchivedItems}</div>
          <div className="stat-sub">retired from active use</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categories</div>
          <div className="stat-value">{stats.byCategory.length}</div>
          <div className="stat-sub">with active items or replacements</div>
        </div>
      </div>

      <div className="charts-grid">
        {pieData.length > 0 && (
          <div className="chart-card">
            <div className="chart-title">Wardrobe Value by Category</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => typeof value === "number" ? fmtUSD(value) : String(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {barItemData.length > 0 && (
          <div className="chart-card">
            <div className="chart-title">Items per Category</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barItemData} margin={{ top: 0, right: 8, bottom: 24, left: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Bar dataKey="Items" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {barCostData.length > 0 && (
          <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
            <div className="chart-title">Purchase Cost vs. Replacement Cost by Category</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barCostData} margin={{ top: 0, right: 8, bottom: 24, left: 8 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={48} />
                <Tooltip formatter={(value) => typeof value === "number" ? fmtUSD(value) : String(value)} />
                <Legend verticalAlign="top" height={28} />
                <Bar dataKey="Purchase Cost" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Replacement Cost" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {stats.byCategory.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Total Value</th>
                <th>Replacement Cost</th>
                <th>Avg. Item Price</th>
              </tr>
            </thead>
            <tbody>
              {stats.byCategory.map((s) => (
                <tr key={s.category}>
                  <td style={{ fontWeight: 500 }}>{CATEGORY_LABELS[s.category]}</td>
                  <td>{s.itemCount}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{fmtUSD(s.totalValue)}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {s.replacementCost > 0 ? fmtUSD(s.replacementCost) : "—"}
                  </td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {s.itemCount > 0 ? fmtUSD(s.totalValue / s.itemCount) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

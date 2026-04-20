import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { monthlyRevenue, portPerformance, clients, shipments } from "@/lib/mock-data";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/analytics/")({
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.50 0.18 255)", "oklch(0.62 0.15 152)", "oklch(0.75 0.15 75)", "oklch(0.62 0.14 230)", "oklch(0.58 0.22 27)", "oklch(0.55 0.20 295)"];

function AnalyticsPage() {
  const topClients = [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
  const modeData = ["Sea", "Air", "Land"].map((m) => ({
    name: m,
    value: shipments.filter((s) => s.mode === m).length,
  }));

  return (
    <>
      <PageHeader title="Analytics" description="Profit, performance and trends" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-1">Monthly shipment volume</h3>
            <p className="text-xs text-muted-foreground mb-4">Shipments completed per month</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 250)", fontSize: 12 }} />
                <Line type="monotone" dataKey="shipments" stroke="oklch(0.50 0.18 255)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-1">Top clients by revenue</h3>
            <p className="text-xs text-muted-foreground mb-4">USD, last 6 months</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topClients} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 250)", fontSize: 12 }} />
                <Bar dataKey="totalRevenue" fill="oklch(0.50 0.18 255)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-1">Shipments by mode</h3>
            <p className="text-xs text-muted-foreground mb-4">Active shipments distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={modeData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {modeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 250)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-1">Port volume</h3>
            <p className="text-xs text-muted-foreground mb-4">Shipments handled per port</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={portPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
                <XAxis dataKey="port" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 250)", fontSize: 12 }} />
                <Bar dataKey="shipments" fill="oklch(0.62 0.14 230)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </>
  );
}

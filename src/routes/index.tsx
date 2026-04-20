import { createFileRoute } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import {
  shipments,
  invoices,
  tasks,
  documents,
  monthlyRevenue,
  portPerformance,
} from "@/lib/mock-data";
import {
  TrendingUp,
  TrendingDown,
  Ship,
  AlertTriangle,
  DollarSign,
  Clock,
  FileWarning,
  CheckCircle2,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { role } = useRole();
  return (
    <>
      <PageHeader
        title={`Welcome back, ${
          role === "Owner" ? "Rahman" : role === "Operations Manager" ? "Karim" : "Nadia"
        }`}
        description={`${role} view · ${new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="p-6 space-y-6">
        {role === "Owner" && <OwnerView />}
        {role === "Operations Manager" && <OpsView />}
        {role === "Documentation Officer" && <DocView />}
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  delta,
  positive = true,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {delta && (
            <div
              className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
                positive ? "text-success" : "text-destructive"
              }`}
            >
              {positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {delta}
            </div>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

function OwnerView() {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue");
  const overdueAmt = overdue.reduce((s, i) => s + i.due, 0);
  const active = shipments.filter(
    (s) => !["Delivered"].includes(s.status),
  ).length;
  const delayed = shipments.filter((s) => s.status === "Delayed").length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Revenue (6 mo)" value={`$${(totalRevenue / 1000).toFixed(1)}k`} delta="+12.4% vs prev" icon={DollarSign} />
        <Kpi label="Active Shipments" value={String(active)} delta="+3 this week" icon={Ship} />
        <Kpi label="Overdue Receivables" value={`$${overdueAmt.toLocaleString()}`} delta={`${overdue.length} invoices`} positive={false} icon={AlertTriangle} />
        <Kpi label="Delayed Shipments" value={String(delayed)} delta="−2 vs last week" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue & Volume</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.50 0.18 255)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.50 0.18 255)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 255)" />
              <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 255)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 250)", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="oklch(0.50 0.18 255)" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Port Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Avg clearance days</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={portPerformance} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 255)" />
              <YAxis dataKey="port" type="category" tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 255)" width={90} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 250)", fontSize: 12 }} />
              <Bar dataKey="avgDays" fill="oklch(0.50 0.18 255)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <RecentShipmentsTable />
    </>
  );
}

function OpsView() {
  const myTasks = tasks.filter((t) => t.status !== "Done");
  const urgent = myTasks.filter((t) => t.priority === "Urgent");
  const active = shipments.filter((s) => !["Delivered"].includes(s.status));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Open Tasks" value={String(myTasks.length)} delta={`${urgent.length} urgent`} positive={false} icon={CheckCircle2} />
        <Kpi label="Active Shipments" value={String(active.length)} delta="+3 this week" icon={Ship} />
        <Kpi label="Awaiting Customs" value={String(shipments.filter((s) => s.status === "Customs Review").length)} icon={Clock} />
        <Kpi label="Delayed" value={String(shipments.filter((s) => s.status === "Delayed").length)} positive={false} icon={AlertTriangle} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-sm font-semibold">Today's Action Queue</h3>
          <Link to="/tasks" className="text-xs font-medium text-primary hover:underline">
            View all tasks →
          </Link>
        </div>
        <div className="divide-y">
          {myTasks.slice(0, 6).map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/40">
              <div className={`h-2 w-2 rounded-full ${
                t.priority === "Urgent" ? "bg-destructive" :
                t.priority === "High" ? "bg-warning" : "bg-muted-foreground"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.shipmentJobNo} · {t.assignee} · Due {t.dueDate}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t.status}</span>
            </div>
          ))}
        </div>
      </Card>

      <RecentShipmentsTable />
    </>
  );
}

function DocView() {
  const pending = documents.filter((d) => d.status === "Pending Review");
  const issues = documents.filter((d) => d.status === "Issue Found");
  const verified = documents.filter((d) => d.status === "Verified");
  const total = documents.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Documents Verified" value={String(verified.length)} delta={`${Math.round((verified.length/total)*100)}% completion`} icon={CheckCircle2} />
        <Kpi label="Pending Review" value={String(pending.length)} icon={Clock} />
        <Kpi label="Issues Found" value={String(issues.length)} positive={false} icon={FileWarning} />
        <Kpi label="Shipments Awaiting Docs" value={String(shipments.filter((s) => s.status === "Documents Pending").length)} positive={false} icon={AlertTriangle} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Documentation completion</h3>
            <p className="text-xs text-muted-foreground">By active shipment</p>
          </div>
        </div>
        <div className="space-y-4">
          {shipments.slice(0, 5).map((s) => {
            const pct = Math.floor(40 + Math.random() * 55);
            return (
              <div key={s.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-foreground">{s.jobNo}</span>
                    <span className="text-muted-foreground truncate">· {s.client}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Documents needing your attention</h3>
          <Link to="/documents" className="text-xs font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="divide-y">
          {[...issues, ...pending].slice(0, 6).map((d) => (
            <div key={d.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/40">
              <div className={`h-8 w-8 rounded flex items-center justify-center ${
                d.status === "Issue Found" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground"
              }`}>
                <FileWarning className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.type} · {d.shipmentJobNo} · {d.uploadedAt}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{d.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function RecentShipmentsTable() {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold">Recent Shipments</h3>
        <Link to="/shipments" className="text-xs font-medium text-primary hover:underline">
          View all →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Job No</th>
              <th className="px-5 py-2.5 text-left font-medium">Client</th>
              <th className="px-5 py-2.5 text-left font-medium">Mode</th>
              <th className="px-5 py-2.5 text-left font-medium">Port</th>
              <th className="px-5 py-2.5 text-left font-medium">Status</th>
              <th className="px-5 py-2.5 text-left font-medium">ETA</th>
              <th className="px-5 py-2.5 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {shipments.slice(0, 6).map((s) => (
              <tr key={s.id} className="hover:bg-secondary/40">
                <td className="px-5 py-2.5 font-medium text-foreground">
                  <Link to="/shipments/$jobNo" params={{ jobNo: s.jobNo }} className="hover:text-primary">
                    {s.jobNo}
                  </Link>
                </td>
                <td className="px-5 py-2.5 text-foreground">{s.client}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{s.mode}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{s.port}</td>
                <td className="px-5 py-2.5"><StatusBadge status={s.status} /></td>
                <td className="px-5 py-2.5 text-muted-foreground tabular-nums">{s.eta}</td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium">${s.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

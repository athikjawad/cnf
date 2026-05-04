import { createFileRoute, Link } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  jobs,
  bills,
  expenses,
  dispatches,
  activityLogs,
  fmtBDT,
  fmtDate,
  fmtJobNo,
  statusVariant,
} from "@/lib/mock-data";
import {
  Briefcase,
  AlertTriangle,
  Clock,
  TrendingUp,
  Truck,
  Receipt,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn" | "danger" | "success";
}) {
  const toneClass =
    tone === "warn"
      ? "bg-warning/10 text-warning-foreground"
      : tone === "danger"
        ? "bg-destructive/10 text-destructive"
        : tone === "success"
          ? "bg-success/10 text-success"
          : "bg-primary/10 text-primary";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`rounded-md p-2 ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const { role } = useRole();

  const activeJobs = jobs.filter((j) => j.status !== "COMPLETED" && j.status !== "CANCELLED");
  const pendingDocs = jobs.filter((j) => j.status === "PENDING DOCS" || j.status === "INCOMPLETE");
  const overdueBills = bills.filter(
    (b) => b.status !== "PAID" && new Date(b.dueDate) < new Date(),
  );
  const pendingExpenses = expenses.filter((e) => e.status === "PENDING");
  const totalReceivable = bills
    .filter((b) => b.status !== "PAID")
    .reduce((s, b) => s + b.billAmount, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Welcome back, ${role === "Super Admin" ? "Rahman" : role === "Manager" ? "Karim" : role === "Operations" ? "Nadia" : "Tanvir"}`}
        description={`SFI Platform — ${role} dashboard`}
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/jobs/new">
              <Briefcase className="h-4 w-4" /> New Job
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        {/* Smart alerts */}
        {(pendingDocs.length > 0 || overdueBills.length > 0 || pendingExpenses.length > 0) && (
          <Card className="border-warning/30 bg-warning/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-foreground" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Action required</h3>
                <ul className="mt-2 grid gap-1.5 text-sm md:grid-cols-3">
                  {pendingDocs.length > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                      <Link to="/jobs" className="hover:underline">
                        {pendingDocs.length} jobs missing documents
                      </Link>
                    </li>
                  )}
                  {overdueBills.length > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      <Link to="/bills" className="hover:underline">
                        {overdueBills.length} bills overdue
                      </Link>
                    </li>
                  )}
                  {pendingExpenses.length > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-info" />
                      <Link to="/expenses" className="hover:underline">
                        {pendingExpenses.length} expenses pending approval
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Active Jobs" value={String(activeJobs.length)} sub={`of ${jobs.length} total`} icon={Briefcase} tone="success" />
          <Kpi label="Pending Docs" value={String(pendingDocs.length)} sub="needs follow-up" icon={FileText} tone="warn" />
          <Kpi label="Overdue Bills" value={String(overdueBills.length)} sub={fmtBDT(overdueBills.reduce((s, b) => s + b.billAmount, 0))} icon={Clock} tone="danger" />
          <Kpi label="Total Receivable" value={fmtBDT(totalReceivable)} sub={`${bills.filter((b) => b.status !== "PAID").length} open bills`} icon={TrendingUp} />
        </div>

        {/* Recent jobs + activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Recent Jobs</h3>
              <Button asChild size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                <Link to="/jobs">View all <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="divide-y">
              {jobs.slice(0, 5).map((j) => (
                <Link
                  key={j.jobNo}
                  to="/jobs/$jobNo"
                  params={{ jobNo: j.jobNo }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex h-9 items-center justify-center rounded-md bg-secondary px-2 text-secondary-foreground text-[10px] font-mono font-semibold whitespace-nowrap">
                    {fmtJobNo(j)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{j.partyName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {j.regId} · {j.goodsDescription}
                    </p>
                  </div>
                  <StatusBadge variant={statusVariant(j.status)}>{j.status}</StatusBadge>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Activity Log</h3>
            </div>
            <ul className="divide-y">
              {activityLogs.map((a) => (
                <li key={a.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.user} · {a.recordType} #{a.recordId}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {fmtDate(a.timestamp)} · {new Date(a.timestamp).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Bottom widgets */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-warning-foreground" />
              <h3 className="text-sm font-semibold">Pending Expense Approvals</h3>
            </div>
            <div className="mt-3 space-y-2">
              {pendingExpenses.slice(0, 4).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">#{e.jobNo} — {e.expenseHead}</span>
                  <span className="font-medium tabular-nums">{fmtBDT(e.amount)}</span>
                </div>
              ))}
              {pendingExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground">All caught up <CheckCircle2 className="inline h-4 w-4 text-success" /></p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-info" />
              <h3 className="text-sm font-semibold">Dispatch Status</h3>
            </div>
            <div className="mt-3 space-y-2">
              {dispatches.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">#{d.jobNo}</span>
                  <StatusBadge variant={d.status === "Delivered" ? "success" : d.status === "In Transit" ? "info" : "warn"}>
                    {d.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-semibold">Overdue Bills</h3>
            </div>
            <div className="mt-3 space-y-2">
              {overdueBills.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">{b.partyName}</span>
                  <span className="font-medium tabular-nums">{fmtBDT(b.billAmount)}</span>
                </div>
              ))}
              {overdueBills.length === 0 && (
                <p className="text-sm text-muted-foreground">No overdue bills</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

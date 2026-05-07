import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileBarChart, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { jobs, expenses, bills, parties, fmtBDT, fmtDate } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";

function DateRangeFilter() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">From</span>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-9 w-[150px]"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">To</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-9 w-[150px]"
        />
      </div>
      <Button
        size="sm"
        onClick={() =>
          toast.success(
            from || to
              ? `Updated: ${from || "…"} → ${to || "…"}`
              : "Showing all dates",
          )
        }
      >
        Update
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/cnf-reports/")({
  component: CnFReports,
});

type ExpenseView = "head" | "headPL" | "category" | "register" | "registerJob";
type JobView = "date" | "type" | "party" | "station" | "glance";
type StatusView = "billJob" | "billParty" | "billStation" | "jobParty" | "jobConcern";

function CnFReports() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="C&F Reports"
        description="Operational reports across expenses, jobs, and bill/job status"
        crumbs={[{ label: "C&F" }, { label: "Reports" }]}
        actions={
          <Button variant="outline" onClick={() => toast.success("Export queued")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      <Tabs defaultValue="job" className="space-y-4">
        <TabsList>
          <TabsTrigger value="job">
            <FileBarChart className="mr-2 h-4 w-4" /> Job
          </TabsTrigger>
          <TabsTrigger value="expense">
            <FileBarChart className="mr-2 h-4 w-4" /> Expense
          </TabsTrigger>
          <TabsTrigger value="status">
            <FileBarChart className="mr-2 h-4 w-4" /> Status Wise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="job"><JobReports /></TabsContent>
        <TabsContent value="expense"><ExpenseReports /></TabsContent>
        <TabsContent value="status"><StatusReports /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ----------------------- Expense ----------------------- */

function ExpenseReports() {
  const [view, setView] = useState<ExpenseView>("head");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-base">Expense Report</CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={view} onValueChange={(v) => setView(v as ExpenseView)}>
            <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="head">Head Wise Statement</SelectItem>
              <SelectItem value="headPL">Head Wise P/L Statement</SelectItem>
              <SelectItem value="category">Category Wise Statement</SelectItem>
              <SelectItem value="register">Register Details</SelectItem>
              <SelectItem value="registerJob">Register Selected Job</SelectItem>
            </SelectContent>
          </Select>
          <DateRangeFilter />
        </div>
      </CardHeader>
      <CardContent>
        {view === "head" && <HeadWise />}
        {view === "headPL" && <HeadWisePL />}
        {view === "category" && <CategoryWise />}
        {view === "register" && <RegisterDetails />}
        {view === "registerJob" && <RegisterSelectedJob />}
      </CardContent>
    </Card>
  );
}

function HeadWise() {
  const grouped = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    expenses.forEach((e) => {
      const cur = map.get(e.expenseHead) ?? { count: 0, total: 0 };
      map.set(e.expenseHead, { count: cur.count + 1, total: cur.total + e.amount });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, []);
  const total = grouped.reduce((s, [, v]) => s + v.total, 0);
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Expense Head</TableHead>
          <TableHead className="text-center">Entries</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">% of Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grouped.map(([head, v]) => (
          <TableRow key={head}>
            <TableCell className="font-medium">{head}</TableCell>
            <TableCell className="text-center">{v.count}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(v.total)}</TableCell>
            <TableCell className="text-right text-muted-foreground">
              {total ? ((v.total / total) * 100).toFixed(1) : 0}%
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="font-semibold bg-muted/30">
          <TableCell>Total</TableCell>
          <TableCell className="text-center">{expenses.length}</TableCell>
          <TableCell className="text-right tabular-nums">{fmtBDT(total)}</TableCell>
          <TableCell className="text-right">100%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function HeadWisePL() {
  // Per head: total expense vs estimated billing share (mocked)
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.expenseHead, (map.get(e.expenseHead) ?? 0) + e.amount));
    return Array.from(map.entries()).map(([head, exp]) => {
      const billing = Math.round(exp * 1.18);
      return { head, exp, billing, pl: billing - exp };
    });
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Head</TableHead>
          <TableHead className="text-right">Expense</TableHead>
          <TableHead className="text-right">Billed</TableHead>
          <TableHead className="text-right">P / L</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grouped.map((g) => (
          <TableRow key={g.head}>
            <TableCell className="font-medium">{g.head}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(g.exp)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(g.billing)}</TableCell>
            <TableCell className={`text-right tabular-nums font-medium ${g.pl >= 0 ? "text-primary" : "text-destructive"}`}>
              {fmtBDT(g.pl)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CategoryWise() {
  const cats: Record<string, string[]> = {
    Government: ["Customs Duty", "VAT (AT)", "Port Charge"],
    Logistics: ["Shipping Line Charge", "Off-Dock Handling", "Transport (Truck)"],
    Operational: ["Documentation", "Survey Fee", "Demurrage", "Labour", "Misc"],
  };
  const rows = Object.entries(cats).map(([cat, heads]) => {
    const total = expenses
      .filter((e) => heads.includes(e.expenseHead))
      .reduce((s, e) => s + e.amount, 0);
    return { cat, total };
  });
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.cat}>
            <TableCell className="font-medium">{r.cat}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(r.total)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RegisterDetails() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Date</TableHead>
          <TableHead>Job No</TableHead>
          <TableHead>Head</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{fmtDate(e.date)}</TableCell>
            <TableCell className="font-medium">{e.jobNo}</TableCell>
            <TableCell>{e.expenseHead}</TableCell>
            <TableCell className="text-muted-foreground">{e.description}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(e.amount)}</TableCell>
            <TableCell><Badge variant={e.status === "APPROVED" ? "default" : "secondary"}>{e.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RegisterSelectedJob() {
  const [jobNo, setJobNo] = useState(jobs[0]?.jobNo ?? "");
  const filtered = expenses.filter((e) => e.jobNo === jobNo);
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Job No</span>
        <Select value={jobNo} onValueChange={setJobNo}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {jobs.map((j) => (
              <SelectItem key={j.jobNo} value={j.jobNo}>{j.jobNo} — {j.partyName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Date</TableHead>
            <TableHead>Head</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{fmtDate(e.date)}</TableCell>
              <TableCell>{e.expenseHead}</TableCell>
              <TableCell className="text-muted-foreground">{e.description}</TableCell>
              <TableCell className="text-right tabular-nums">{fmtBDT(e.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold bg-muted/30">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

/* ----------------------- Job ----------------------- */

function JobReports() {
  const [view, setView] = useState<JobView>("date");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-base">Job Report</CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={view} onValueChange={(v) => setView(v as JobView)}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Wise</SelectItem>
              <SelectItem value="type">Type Wise</SelectItem>
              <SelectItem value="party">Party Wise</SelectItem>
              <SelectItem value="station">Station Wise</SelectItem>
              <SelectItem value="glance">Job At A Glance</SelectItem>
            </SelectContent>
          </Select>
          <DateRangeFilter />
        </div>
      </CardHeader>
      <CardContent>
        {view === "date" && <JobDateWise />}
        {view === "type" && <JobGroupWise field="regId" label="Reg Id" />}
        {view === "party" && <JobGroupWise field="partyName" label="Party" />}
        {view === "station" && <JobGroupWise field="station" label="Station" />}
        {view === "glance" && <JobGlance />}
      </CardContent>
    </Card>
  );
}

function JobDateWise() {
  const sorted = [...jobs].sort((a, b) => b.jobDate.localeCompare(a.jobDate));
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Date</TableHead>
          <TableHead>Job No</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Reg Id</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">C&F Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((j) => (
          <TableRow key={j.jobNo}>
            <TableCell>{fmtDate(j.jobDate)}</TableCell>
            <TableCell className="font-medium">{j.jobNo}</TableCell>
            <TableCell>{j.partyName}</TableCell>
            <TableCell className="text-muted-foreground">{j.regId}</TableCell>
            <TableCell><Badge variant="outline">{j.status}</Badge></TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(j.cfValueBdt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function JobGroupWise({ field, label }: { field: keyof typeof jobs[number]; label: string }) {
  const grouped = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    jobs.forEach((j) => {
      const k = String(j[field]);
      const cur = map.get(k) ?? { count: 0, value: 0 };
      map.set(k, { count: cur.count + 1, value: cur.value + j.cfValueBdt });
    });
    return Array.from(map.entries());
  }, [field]);
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>{label}</TableHead>
          <TableHead className="text-center">Jobs</TableHead>
          <TableHead className="text-right">C&F Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grouped.map(([k, v]) => (
          <TableRow key={k}>
            <TableCell className="font-medium">{k}</TableCell>
            <TableCell className="text-center">{v.count}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(v.value)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function JobGlance() {
  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "ACTIVE").length,
    pending: jobs.filter((j) => j.status === "PENDING DOCS").length,
    cleared: jobs.filter((j) => j.status === "CLEARED").length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
    incomplete: jobs.filter((j) => j.status === "INCOMPLETE").length,
    cfValue: jobs.reduce((s, j) => s + j.cfValueBdt, 0),
    commission: jobs.reduce((s, j) => s + j.commission, 0),
  };
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <GlanceCard label="Total Jobs" value={String(stats.total)} />
      <GlanceCard label="Active" value={String(stats.active)} />
      <GlanceCard label="Pending Docs" value={String(stats.pending)} />
      <GlanceCard label="Cleared" value={String(stats.cleared)} />
      <GlanceCard label="Completed" value={String(stats.completed)} />
      <GlanceCard label="Incomplete" value={String(stats.incomplete)} />
      <GlanceCard label="C&F Value" value={fmtBDT(stats.cfValue)} />
      <GlanceCard label="Commission" value={fmtBDT(stats.commission)} accent />
    </div>
  );
}

function GlanceCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`mt-1 text-lg font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

/* ----------------------- Status Wise ----------------------- */

function StatusReports() {
  const [view, setView] = useState<StatusView>("billJob");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">Status Wise Report</CardTitle>
        <Select value={view} onValueChange={(v) => setView(v as StatusView)}>
          <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="billJob">Bill — Job Wise</SelectItem>
            <SelectItem value="billParty">Bill — Party Wise</SelectItem>
            <SelectItem value="billStation">Bill — Station Wise</SelectItem>
            <SelectItem value="jobParty">Job — Party Wise</SelectItem>
            <SelectItem value="jobConcern">Job — Concern Wise</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {view === "billJob" && <BillJobWise />}
        {view === "billParty" && <BillGroupWise by="party" />}
        {view === "billStation" && <BillGroupWise by="station" />}
        {view === "jobParty" && <JobStatusGroup by="partyName" label="Party" />}
        {view === "jobConcern" && <JobStatusGroup by="concern" label="Concern" />}
      </CardContent>
    </Card>
  );
}

function BillJobWise() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Bill No</TableHead>
          <TableHead>Job No</TableHead>
          <TableHead>Party</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((b) => (
          <TableRow key={b.id}>
            <TableCell className="font-medium">{b.billNo}</TableCell>
            <TableCell>{b.jobNo}</TableCell>
            <TableCell>{b.partyName}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(b.billAmount)}</TableCell>
            <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BillGroupWise({ by }: { by: "party" | "station" }) {
  const rows = useMemo(() => {
    const map = new Map<string, { pending: number; forwarded: number; paid: number; partial: number; total: number }>();
    bills.forEach((b) => {
      const job = jobs.find((j) => j.jobNo === b.jobNo);
      const key = by === "party" ? b.partyName : job?.station ?? "—";
      const cur = map.get(key) ?? { pending: 0, forwarded: 0, paid: 0, partial: 0, total: 0 };
      cur.total += b.billAmount;
      if (b.status === "PENDING") cur.pending += b.billAmount;
      if (b.status === "FORWARDED") cur.forwarded += b.billAmount;
      if (b.status === "PAID") cur.paid += b.billAmount;
      if (b.status === "PARTIAL") cur.partial += b.billAmount;
      map.set(key, cur);
    });
    return Array.from(map.entries());
  }, [by]);
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>{by === "party" ? "Party" : "Station"}</TableHead>
          <TableHead className="text-right">Pending</TableHead>
          <TableHead className="text-right">Forwarded</TableHead>
          <TableHead className="text-right">Partial</TableHead>
          <TableHead className="text-right">Paid</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([k, v]) => (
          <TableRow key={k}>
            <TableCell className="font-medium">{k}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(v.pending)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(v.forwarded)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(v.partial)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtBDT(v.paid)}</TableCell>
            <TableCell className="text-right tabular-nums font-medium">{fmtBDT(v.total)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function JobStatusGroup({ by, label }: { by: "partyName" | "concern"; label: string }) {
  const rows = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    jobs.forEach((j) => {
      const k = String(j[by]) || "—";
      const cur = map.get(k) ?? {};
      cur[j.status] = (cur[j.status] ?? 0) + 1;
      cur.__total = (cur.__total ?? 0) + 1;
      map.set(k, cur);
    });
    return Array.from(map.entries());
  }, [by]);
  const allStatuses = ["ACTIVE", "PENDING DOCS", "CLEARED", "INCOMPLETE", "COMPLETED", "HOLD"];
  // suppress unused warning
  void parties;
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>{label}</TableHead>
          {allStatuses.map((s) => (
            <TableHead key={s} className="text-center">{s}</TableHead>
          ))}
          <TableHead className="text-center">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([k, v]) => (
          <TableRow key={k}>
            <TableCell className="font-medium">{k}</TableCell>
            {allStatuses.map((s) => (
              <TableCell key={s} className="text-center">{v[s] ?? 0}</TableCell>
            ))}
            <TableCell className="text-center font-semibold">{v.__total ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

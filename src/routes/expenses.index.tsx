import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { expenses as initialExpenses, jobs, expenseHeads, fmtBDT, fmtDate, type Expense } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { Plus, Check, X, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/expenses/")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const { role } = useRole();
  const canApprove = role === "Manager" || role === "Accounts" || role === "Super Admin";
  const [list, setList] = useState<Expense[]>(initialExpenses);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  // form
  const [fJobNo, setFJobNo] = useState(jobs[0]?.jobNo || "");
  const [fHead, setFHead] = useState(expenseHeads[0]);
  const [fAmount, setFAmount] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));

  const filtered = useMemo(() => {
    return list.filter((e) => {
      if (filter !== "all" && e.status.toLowerCase() !== filter) return false;
      if (q && !`${e.jobNo} ${e.expenseHead} ${e.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [list, filter, q]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const submit = () => {
    if (!fAmount || !fJobNo) {
      toast.error("Job No and Amount are required");
      return;
    }
    const newE: Expense = {
      id: `e${Date.now()}`,
      jobNo: fJobNo,
      expenseHead: fHead,
      amount: parseFloat(fAmount),
      description: fDesc,
      date: fDate,
      status: "PENDING",
    };
    setList((l) => [newE, ...l]);
    setOpen(false);
    setFAmount("");
    setFDesc("");
    toast.success("Expense submitted for approval");
  };

  const updateStatus = (id: string, status: Expense["status"]) => {
    setList((l) => l.map((e) => (e.id === id ? { ...e, status, approvedBy: status === "APPROVED" ? "Current User" : undefined } : e)));
    toast.success(`Expense ${status.toLowerCase()}`);
  };

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="All job expenses with approval workflow"
        crumbs={[{ label: "Expenses" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Job Expense</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label className="mb-1.5 block text-xs">Job No *</Label>
                  <Select value={fJobNo} onValueChange={setFJobNo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {jobs.map((j) => (
                        <SelectItem key={j.jobNo} value={j.jobNo}>#{j.jobNo} — {j.partyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Expense Head</Label>
                  <Select value={fHead} onValueChange={setFHead}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {expenseHeads.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Amount (BDT) *</Label>
                  <Input type="number" value={fAmount} onChange={(e) => setFAmount(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Date</Label>
                  <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Description</Label>
                  <Textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 text-xl font-semibold">{fmtBDT(list.reduce((s, e) => s + e.amount, 0))}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="mt-1 text-xl font-semibold text-warning-foreground">{list.filter(e => e.status === "PENDING").length}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Approved</p><p className="mt-1 text-xl font-semibold text-success">{list.filter(e => e.status === "APPROVED").length}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Rejected</p><p className="mt-1 text-xl font-semibold text-destructive">{list.filter(e => e.status === "REJECTED").length}</p></Card>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-9 pl-9" />
            </div>
            <span className="text-xs text-muted-foreground">{filtered.length} expenses · {fmtBDT(total)}</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {canApprove && <TableHead className="w-[120px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono">#{e.jobNo}</TableCell>
                  <TableCell className="font-medium">{e.expenseHead}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.description}</TableCell>
                  <TableCell className="text-sm">{fmtDate(e.date)}</TableCell>
                  <TableCell>
                    <StatusBadge variant={e.status === "APPROVED" ? "success" : e.status === "PENDING" ? "warn" : "danger"}>{e.status}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-sm">{e.approvedBy || "—"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmtBDT(e.amount)}</TableCell>
                  {canApprove && (
                    <TableCell>
                      {e.status === "PENDING" ? (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateStatus(e.id, "APPROVED")}><Check className="h-3.5 w-3.5 text-success" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateStatus(e.id, "REJECTED")}><X className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { bills as initialBills, jobs, fmtBDT, fmtDate, fmtJobNo, type Bill } from "@/lib/mock-data";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bills/")({
  component: BillsPage,
});

function BillsPage() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [filter, setFilter] = useState<"all" | "pending" | "forwarded" | "paid" | "partial">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // form
  const [fJobNo, setFJobNo] = useState(jobs[0]?.jobNo || "");
  const [fAmount, setFAmount] = useState("");
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [fDue, setFDue] = useState("");

  const filtered = bills.filter((b) => filter === "all" || b.status.toLowerCase() === filter);
  const totalReceivable = bills.filter((b) => b.status !== "PAID").reduce((s, b) => s + b.billAmount, 0);

  const isOverdue = (b: Bill) => b.status !== "PAID" && new Date(b.dueDate) < new Date();

  const create = () => {
    const job = jobs.find((j) => j.jobNo === fJobNo);
    if (!job || !fAmount) {
      toast.error("Job and amount required");
      return;
    }
    const next = String(450 + bills.length + 1).padStart(4, "0");
    setBills((l) => [
      {
        id: `b${Date.now()}`,
        billNo: `BILL-2024-${next}`,
        jobNo: fJobNo,
        partyName: job.partyName,
        billAmount: parseFloat(fAmount),
        billDate: fDate,
        dueDate: fDue || fDate,
        status: "PENDING",
      },
      ...l,
    ]);
    setOpen(false);
    setFAmount("");
    toast.success("Bill created");
  };

  const forward = () => {
    if (selected.length === 0) {
      toast.error("Select at least one bill to forward");
      return;
    }
    const ref = `FWD-${Date.now().toString().slice(-6)}`;
    setBills((l) =>
      l.map((b) =>
        selected.includes(b.id) && b.status === "PENDING"
          ? { ...b, status: "FORWARDED" as const, forwardedDate: new Date().toISOString().slice(0, 10), forwardRef: ref }
          : b,
      ),
    );
    toast.success(`${selected.length} bill(s) forwarded — Ref ${ref}`);
    setSelected([]);
  };

  return (
    <div>
      <PageHeader
        title="Bills"
        description="Job billing & forwarding"
        crumbs={[{ label: "Bills" }]}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={forward}>
              <Send className="h-4 w-4" /> Forward Selected ({selected.length})
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Bill</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Bill</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div>
                    <Label className="mb-1.5 block text-xs">Job No *</Label>
                    <Select value={fJobNo} onValueChange={setFJobNo}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {jobs.map((j) => <SelectItem key={j.jobNo} value={j.jobNo}>{fmtJobNo(j)} — {j.partyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs">Bill Amount (BDT) *</Label>
                    <Input type="number" value={fAmount} onChange={(e) => setFAmount(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="mb-1.5 block text-xs">Bill Date</Label>
                      <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs">Due Date</Label>
                      <Input type="date" value={fDue} onChange={(e) => setFDue(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={create}>Create Bill</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4"><p className="text-xs text-muted-foreground">Total Receivable</p><p className="mt-1 text-xl font-semibold">{fmtBDT(totalReceivable)}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="mt-1 text-xl font-semibold text-warning-foreground">{bills.filter(b => b.status === "PENDING").length}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Forwarded</p><p className="mt-1 text-xl font-semibold text-info">{bills.filter(b => b.status === "FORWARDED").length}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Overdue</p><p className="mt-1 text-xl font-semibold text-destructive">{bills.filter(isOverdue).length}</p></Card>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="forwarded">Forwarded</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Bill No</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => {
                const overdue = isOverdue(b);
                return (
                  <TableRow key={b.id} className={overdue ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(b.id)}
                        onCheckedChange={(c) => setSelected((s) => (c ? [...s, b.id] : s.filter((x) => x !== b.id)))}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{b.billNo}</TableCell>
                    <TableCell className="font-mono whitespace-nowrap">{fmtJobNo(b.jobNo)}</TableCell>
                    <TableCell>{b.partyName}</TableCell>
                    <TableCell className="text-sm">{fmtDate(b.billDate)}</TableCell>
                    <TableCell className="text-sm">
                      {fmtDate(b.dueDate)}
                      {overdue && <span className="ml-1 text-[10px] font-semibold text-destructive">OVERDUE</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={b.status === "PAID" ? "success" : b.status === "FORWARDED" ? "info" : b.status === "PARTIAL" ? "warn" : "danger"}>{b.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{fmtBDT(b.billAmount)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

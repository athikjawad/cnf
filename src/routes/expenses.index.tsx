import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  expenses as initialExpenses,
  jobs,
  expenseHeads,
  parties,
  fmtBDT,
  fmtDate,
  type Expense,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { Plus, Check, X, Search, Trash2, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/")({
  component: ExpensesPage,
});

interface DraftRow {
  id: string;
  jobNo: string;
  costPool: string;
  party: string;
  particulars: string;
  amount: string;
}

const newRow = (): DraftRow => ({
  id: `r${Math.random().toString(36).slice(2, 9)}`,
  jobNo: "",
  costPool: "",
  party: "",
  particulars: "",
  amount: "",
});

function Combobox({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("h-8 w-full justify-between px-2 text-xs font-normal", !value && "text-muted-foreground", className)}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}…`} className="h-9" />
          <CommandList>
            <CommandEmpty>No match.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o}
                  value={o}
                  onSelect={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                >
                  {o}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ExpensesPage() {
  const { role } = useRole();
  const canApprove = role === "Manager" || role === "Accounts" || role === "Super Admin";
  const [list, setList] = useState<Expense[]>(initialExpenses);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<DraftRow[]>([newRow()]);
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));

  const jobOptions = useMemo(() => jobs.map((j) => j.jobNo), []);
  const partyOptions = useMemo(() => parties.map((p) => p.name), []);

  const jobMap = useMemo(() => Object.fromEntries(jobs.map((j) => [j.jobNo, j])), []);

  const filtered = useMemo(() => {
    return list.filter((e) => {
      if (filter !== "all" && e.status.toLowerCase() !== filter) return false;
      if (q && !`${e.jobNo} ${e.expenseHead} ${e.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [list, filter, q]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const draftTotal = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const updateRow = (id: string, patch: Partial<DraftRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRow = (id: string) =>
    setRows((rs) => (rs.length === 1 ? [newRow()] : rs.filter((r) => r.id !== id)));

  const resetForm = () => {
    setRows([newRow()]);
    setVoucherDate(new Date().toISOString().slice(0, 10));
  };

  const submit = () => {
    const valid = rows.filter((r) => r.jobNo && r.costPool && parseFloat(r.amount) > 0);
    if (valid.length === 0) {
      toast.error("Add at least one row with Job No, Cost Pool and Amount");
      return;
    }
    const newExpenses: Expense[] = valid.map((r, i) => ({
      id: `e${Date.now()}-${i}`,
      jobNo: r.jobNo,
      expenseHead: r.costPool,
      amount: parseFloat(r.amount),
      description: [r.party, r.particulars].filter(Boolean).join(" — "),
      date: voucherDate,
      status: "PENDING",
    }));
    setList((l) => [...newExpenses, ...l]);
    setOpen(false);
    resetForm();
    toast.success(`${newExpenses.length} expense${newExpenses.length > 1 ? "s" : ""} submitted`);
  };

  const updateStatus = (id: string, status: Expense["status"]) => {
    setList((l) =>
      l.map((e) => (e.id === id ? { ...e, status, approvedBy: status === "APPROVED" ? "Current User" : undefined } : e)),
    );
    toast.success(`Expense ${status.toLowerCase()}`);
  };

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="All job expenses with approval workflow"
        crumbs={[{ label: "Expenses" }]}
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Expense</Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-5xl flex-col gap-0 p-0">
              <DialogHeader className="border-b px-6 py-4">
                <DialogTitle>New Expense Voucher</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Add one or more expense lines. Job No drives auto-population of Year, Branch and Type.
                </p>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div>
                    <Label className="mb-1.5 block text-xs">Voucher Date</Label>
                    <Input type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} className="h-8" />
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-10 text-center">#</TableHead>
                        <TableHead className="w-[140px]">Job No *</TableHead>
                        <TableHead className="w-[150px]">Type / Branch</TableHead>
                        <TableHead className="w-[170px]">Cost Pool *</TableHead>
                        <TableHead className="w-[180px]">Party</TableHead>
                        <TableHead>Particulars</TableHead>
                        <TableHead className="w-[130px] text-right">Amount (BDT) *</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r, idx) => {
                        const job = r.jobNo ? jobMap[r.jobNo] : undefined;
                        return (
                          <TableRow key={r.id} className="align-top">
                            <TableCell className="pt-3 text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell>
                              <Combobox
                                value={r.jobNo}
                                onChange={(v) => updateRow(r.id, { jobNo: v })}
                                options={jobOptions}
                                placeholder="Select job"
                              />
                            </TableCell>
                            <TableCell>
                              {job ? (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  <Badge variant="secondary" className="text-[10px]">{job.jobYear}</Badge>
                                  <Badge variant="secondary" className="text-[10px]">{job.jobType}</Badge>
                                  <Badge variant="outline" className="text-[10px]">{job.regId}</Badge>
                                </div>
                              ) : (
                                <span className="pl-1 text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Combobox
                                value={r.costPool}
                                onChange={(v) => updateRow(r.id, { costPool: v })}
                                options={expenseHeads}
                                placeholder="Select head"
                              />
                            </TableCell>
                            <TableCell>
                              <Combobox
                                value={r.party}
                                onChange={(v) => updateRow(r.id, { party: v })}
                                options={partyOptions}
                                placeholder="Vendor / party"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={r.particulars}
                                onChange={(e) => updateRow(r.id, { particulars: e.target.value })}
                                placeholder="Notes…"
                                className="h-8 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={r.amount}
                                onChange={(e) => updateRow(r.id, { amount: e.target.value })}
                                placeholder="0.00"
                                className="h-8 text-right font-mono tabular-nums text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => removeRow(r.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => setRows((rs) => [...rs, newRow()])}
                >
                  <Plus className="h-3.5 w-3.5" /> Add row
                </Button>
              </div>

              {/* Sticky footer */}
              <div className="flex items-center justify-between border-t bg-muted/30 px-6 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-mono text-lg font-semibold tabular-nums">{fmtBDT(draftTotal)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button onClick={submit}>Submit Voucher</Button>
                </div>
              </div>
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

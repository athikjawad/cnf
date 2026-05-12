import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { vouchers, chartOfAccounts, jobs, openingBalances, fmtBDT, fmtDate, fmtJobNo, type ChartOfAccount, type OpeningBalance } from "@/lib/mock-data";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts/")({
  component: AccountsPage,
});

function AccountsPage() {
  const [vType, setVType] = useState<"Receipt" | "Payment" | "Journal" | "Contra">("Payment");
  const [debit, setDebit] = useState("");
  const [credit, setCredit] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [jobNo, setJobNo] = useState("");

  const post = () => {
    if (!debit || !credit || !amount) {
      toast.error("Debit, credit, and amount are required");
      return;
    }
    toast.success(`Voucher posted: ${vType} ${fmtBDT(parseFloat(amount))}`);
    setAmount("");
    setNarration("");
  };

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Voucher entry, chart of accounts & financial transactions"
        crumbs={[{ label: "Accounts" }]}
      />

      <div className="p-6">
        <Tabs defaultValue="voucher">
          <TabsList>
            <TabsTrigger value="voucher">Voucher Entry</TabsTrigger>
            <TabsTrigger value="ledger">Voucher Ledger</TabsTrigger>
            <TabsTrigger value="coa">Chart of Accounts</TabsTrigger>
            <TabsTrigger value="opening">Opening Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="voucher" className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold">New Voucher</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs">Voucher Type *</Label>
                  <Select value={vType} onValueChange={(v) => setVType(v as typeof vType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receipt">Receipt</SelectItem>
                      <SelectItem value="Payment">Payment</SelectItem>
                      <SelectItem value="Journal">Journal</SelectItem>
                      <SelectItem value="Contra">Contra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Date</Label>
                  <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Debit Account *</Label>
                  <Select value={debit} onValueChange={setDebit}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {chartOfAccounts.map((a) => <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Credit Account *</Label>
                  <Select value={credit} onValueChange={setCredit}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {chartOfAccounts.map((a) => <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Amount (BDT) *</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Job No (optional)</Label>
                  <Select value={jobNo} onValueChange={setJobNo}>
                    <SelectTrigger><SelectValue placeholder="Link to job…" /></SelectTrigger>
                    <SelectContent>
                      {jobs.map((j) => <SelectItem key={j.jobNo} value={j.jobNo}>{fmtJobNo(j)} — {j.partyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1.5 block text-xs">Narration</Label>
                  <Textarea value={narration} onChange={(e) => setNarration(e.target.value)} rows={2} />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button onClick={post} className="gap-1.5"><Plus className="h-4 w-4" /> Post Voucher</Button>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Quick Reports</h3>
              <ul className="space-y-1 text-sm">
                {["Cash Book", "Bank Book", "Ledger Book", "Trial Balance", "Income Statement", "Balance Sheet", "Receive-Payment"].map((r) => (
                  <li key={r}>
                    <button onClick={() => toast.info(`Opening ${r}`)} className="w-full rounded-md px-2 py-1.5 text-left hover:bg-muted">{r}</button>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="ledger" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono">{v.voucherNo}</TableCell>
                      <TableCell className="text-sm">{fmtDate(v.date)}</TableCell>
                      <TableCell><span className="rounded bg-secondary px-2 py-0.5 text-xs">{v.type}</span></TableCell>
                      <TableCell className="text-sm">{v.debitAccount}</TableCell>
                      <TableCell className="text-sm">{v.creditAccount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.narration}</TableCell>
                      <TableCell className="font-mono text-sm">{v.jobNo ? fmtJobNo(v.jobNo) : "—"}</TableCell>
                      <TableCell className="text-right font-mono">{fmtBDT(v.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="coa" className="mt-4">
            <ChartOfAccountsTab />
          </TabsContent>

          <TabsContent value="opening" className="mt-4">
            <OpeningBalanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== Chart of Accounts =====
function ChartOfAccountsTab() {
  const [rows, setRows] = useState<ChartOfAccount[]>(chartOfAccounts);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ChartOfAccount | null>(null);
  const [form, setForm] = useState<ChartOfAccount>({ code: "", name: "", type: "Asset", controlCode: "" });
  const [query, setQuery] = useState("");

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.code.includes(query) ||
      r.controlCode.toLowerCase().includes(query.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ code: "", name: "", type: "Asset", controlCode: "" });
    setOpen(true);
  };
  const openEdit = (r: ChartOfAccount) => {
    setEditing(r);
    setForm(r);
    setOpen(true);
  };
  const save = () => {
    if (!form.code || !form.name || !form.controlCode) {
      toast.error("Account head, code and control code are required");
      return;
    }
    if (editing) {
      setRows((rs) => rs.map((r) => (r.code === editing.code ? form : r)));
      toast.success("Account updated");
    } else {
      if (rows.some((r) => r.code === form.code)) {
        toast.error("Account code already exists");
        return;
      }
      setRows((rs) => [...rs, form]);
      toast.success("Account added");
    }
    setOpen(false);
  };
  const remove = (code: string) => {
    setRows((rs) => rs.filter((r) => r.code !== code));
    toast.success("Account deleted");
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search account head, code or control code…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> Add Account</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Head</TableHead>
            <TableHead className="w-[140px]">Account Code</TableHead>
            <TableHead className="w-[160px]">Control Code</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.code}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="font-mono">{r.code}</TableCell>
              <TableCell className="font-mono text-sm">{r.controlCode}</TableCell>
              <TableCell><span className="rounded bg-secondary px-2 py-0.5 text-xs">{r.type}</span></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.code)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No accounts match your search.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Account" : "Add Account"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label className="mb-1.5 block text-xs">Account Head *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">Account Code *</Label>
                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} disabled={!!editing} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Control Code *</Label>
                <Input value={form.controlCode} onChange={(e) => setForm((f) => ({ ...f, controlCode: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ChartOfAccount["type"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Asset", "Liability", "Equity", "Income", "Expense"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Account"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ===== Opening Balance =====
function OpeningBalanceTab() {
  const [rows, setRows] = useState<OpeningBalance[]>(openingBalances);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OpeningBalance | null>(null);
  const [form, setForm] = useState<OpeningBalance>({
    id: "",
    date: new Date().toISOString().slice(0, 10),
    accountCode: "",
    accountHead: "",
    debit: 0,
    credit: 0,
  });

  const filtered = rows.filter((r) => {
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });

  const totals = filtered.reduce(
    (acc, r) => ({ debit: acc.debit + r.debit, credit: acc.credit + r.credit }),
    { debit: 0, credit: 0 },
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ id: "", date: new Date().toISOString().slice(0, 10), accountCode: "", accountHead: "", debit: 0, credit: 0 });
    setOpen(true);
  };
  const openEdit = (r: OpeningBalance) => {
    setEditing(r);
    setForm(r);
    setOpen(true);
  };
  const save = () => {
    if (!form.accountCode) {
      toast.error("Select an account head");
      return;
    }
    if (form.debit > 0 && form.credit > 0) {
      toast.error("Enter either debit or credit, not both");
      return;
    }
    if (form.debit === 0 && form.credit === 0) {
      toast.error("Enter a debit or credit amount");
      return;
    }
    const acc = chartOfAccounts.find((a) => a.code === form.accountCode);
    const next: OpeningBalance = { ...form, accountHead: acc?.name ?? form.accountHead };
    if (editing) {
      setRows((rs) => rs.map((r) => (r.id === editing.id ? next : r)));
      toast.success("Opening balance updated");
    } else {
      setRows((rs) => [...rs, { ...next, id: `ob-${Date.now()}` }]);
      toast.success("Opening balance added");
    }
    setOpen(false);
  };
  const remove = (id: string) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    toast.success("Opening balance deleted");
  };

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label className="mb-1.5 block text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[160px]" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[160px]" />
          </div>
          <Button variant="outline" onClick={() => { setFrom(""); setTo(""); }}>Reset</Button>
        </div>
        <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> Add Opening Balance</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">No</TableHead>
            <TableHead>Account Head</TableHead>
            <TableHead className="w-[140px]">Date</TableHead>
            <TableHead className="w-[160px] text-right">Debit Amount</TableHead>
            <TableHead className="w-[160px] text-right">Credit Amount</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r, i) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{r.accountHead} <span className="ml-1 font-mono text-xs text-muted-foreground">({r.accountCode})</span></TableCell>
              <TableCell className="text-sm">{fmtDate(r.date)}</TableCell>
              <TableCell className="text-right font-mono">{r.debit ? fmtBDT(r.debit) : "—"}</TableCell>
              <TableCell className="text-right font-mono">{r.credit ? fmtBDT(r.credit) : "—"}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No opening balances in this date range.</TableCell></TableRow>
          )}
        </TableBody>
        {filtered.length > 0 && (
          <tfoot className="border-t bg-muted/40 font-medium">
            <tr>
              <td colSpan={3} className="p-2 text-right text-sm">Totals</td>
              <td className="p-2 text-right font-mono">{fmtBDT(totals.debit)}</td>
              <td className="p-2 text-right font-mono">{fmtBDT(totals.credit)}</td>
              <td />
            </tr>
            <tr>
              <td colSpan={3} className="p-2 text-right text-sm text-muted-foreground">Difference</td>
              <td colSpan={2} className="p-2 text-right font-mono">
                <span className={totals.debit === totals.credit ? "text-success" : "text-destructive"}>
                  {fmtBDT(Math.abs(totals.debit - totals.credit))} {totals.debit === totals.credit ? "(Balanced)" : "(Unbalanced)"}
                </span>
              </td>
              <td />
            </tr>
          </tfoot>
        )}
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Opening Balance" : "Add Opening Balance"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label className="mb-1.5 block text-xs">Account Head *</Label>
              <Select value={form.accountCode} onValueChange={(v) => setForm((f) => ({ ...f, accountCode: v }))}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {chartOfAccounts.map((a) => <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">Debit Amount</Label>
                <Input type="number" value={form.debit || ""} onChange={(e) => setForm((f) => ({ ...f, debit: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Credit Amount</Label>
                <Input type="number" value={form.credit || ""} onChange={(e) => setForm((f) => ({ ...f, credit: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

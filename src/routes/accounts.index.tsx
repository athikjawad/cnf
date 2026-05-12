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

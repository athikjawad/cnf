import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Save, Search, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { parties as seedParties, type Party } from "@/lib/mock-data";

export const Route = createFileRoute("/clients/parties")({
  component: PartyInformationPage,
});

type PartyStatus = "Active" | "Inactive" | "Hold";
type RegId = "SEA EXPORT" | "SEA IMPORT" | "AIR EXPORT" | "AIR IMPORT" | "LAND PORT EXPORT" | "LAND PORT IMPORT";
type CommissionType = "BDT" | "USD";
type CommissionRateType = "Percent" | "Fixed";

interface CommissionRow {
  id: string;
  type: CommissionType;
  from: string;
  to: string;
  rateType: CommissionRateType;
  amount: string;
}

interface ExpenseLimitRow {
  id: string;
  expenseName: string;
  type: "FIXED" | "VARIABLE";
  rate: string;
  frequency: string;
  remarks: string;
}

interface PartyRecord extends Party {
  email: string;
  webAddress: string;
  apName: string;
  apContact: string;
  status: PartyStatus;
  commissions: Record<RegId, CommissionRow[]>;
  expenseLimits: Record<"IMPORT" | "EXPORT", ExpenseLimitRow[]>;
}

const REG_IDS: RegId[] = ["SEA EXPORT", "SEA IMPORT", "AIR EXPORT", "AIR IMPORT", "LAND PORT EXPORT", "LAND PORT IMPORT"];

const emptyCommission = (): Record<RegId, CommissionRow[]> =>
  REG_IDS.reduce((acc, k) => ({ ...acc, [k]: [] }), {} as Record<RegId, CommissionRow[]>);

const emptyExpense = (): Record<"IMPORT" | "EXPORT", ExpenseLimitRow[]> => ({
  IMPORT: [],
  EXPORT: [],
});

const seed: PartyRecord[] = seedParties.map((p) => ({
  ...p,
  email: `${p.name.split(" ")[0].toLowerCase()}@example.com`,
  webAddress: `www.${p.name.split(" ")[0].toLowerCase()}.com`,
  apName: "—",
  apContact: "—",
  status: "Active" as PartyStatus,
  commissions: emptyCommission(),
  expenseLimits: emptyExpense(),
}));

function PartyInformationPage() {
  const [parties, setParties] = useState<PartyRecord[]>(seed);
  const [selectedId, setSelectedId] = useState<string>(seed[0]?.id ?? "");
  const [createOpen, setCreateOpen] = useState(false);

  const selected = useMemo(() => parties.find((p) => p.id === selectedId), [parties, selectedId]);

  const updateSelected = (patch: Partial<PartyRecord>) => {
    if (!selected) return;
    setParties((prev) => prev.map((p) => (p.id === selected.id ? { ...p, ...patch } : p)));
  };

  const handleCreate = (data: Omit<PartyRecord, "id" | "concerns" | "commissions" | "expenseLimits">) => {
    const id = `p${Date.now()}`;
    const newParty: PartyRecord = {
      id,
      concerns: [],
      commissions: emptyCommission(),
      expenseLimits: emptyExpense(),
      ...data,
    };
    setParties((prev) => [newParty, ...prev]);
    setSelectedId(id);
    setCreateOpen(false);
    toast.success(`Party "${data.name}" created`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Party Information"
        description="Manage client parties, commission structures, and expense limits"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </DialogTrigger>
            <CreatePartyDialog onCreate={handleCreate} />
          </Dialog>
        }
      />

      {selected ? (
        <div className="space-y-4">
          <PartyForm party={selected} onChange={updateSelected} />
          <CommissionSection party={selected} onChange={updateSelected} />
          <ExpenseLimitSection party={selected} onChange={updateSelected} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No party selected
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* --------------------- Reusable detail panel (used in side sheet) --------------------- */

export function PartyDetailPanel({ party: initial }: { party: Party }) {
  const [party, setParty] = useState<PartyRecord>(() => ({
    ...initial,
    email: `${initial.name.split(" ")[0].toLowerCase()}@example.com`,
    webAddress: `www.${initial.name.split(" ")[0].toLowerCase()}.com`,
    apName: "—",
    apContact: "—",
    status: "Active",
    commissions: emptyCommission(),
    expenseLimits: emptyExpense(),
  }));
  const update = (patch: Partial<PartyRecord>) => setParty((p) => ({ ...p, ...patch }));
  return (
    <div className="space-y-4">
      <PartyForm party={party} onChange={update} />
      <CommissionSection party={party} onChange={update} />
      <ExpenseLimitSection party={party} onChange={update} />
    </div>
  );
}

/* --------------------- Party basic form --------------------- */

function PartyForm({
  party,
  onChange,
}: {
  party: PartyRecord;
  onChange: (p: Partial<PartyRecord>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Party Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Party Name">
          <Input value={party.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <Field label="Status">
          <Select value={party.status} onValueChange={(v) => onChange({ status: v as PartyStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Hold">Hold</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Address" className="md:col-span-2">
          <Textarea
            rows={2}
            value={party.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </Field>
        <Field label="Contact No">
          <Input value={party.contact} onChange={(e) => onChange({ contact: e.target.value })} />
        </Field>
        <Field label="Email ID">
          <Input
            type="email"
            value={party.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field label="Web Address">
          <Input value={party.webAddress} onChange={(e) => onChange({ webAddress: e.target.value })} />
        </Field>
        <Field label="A.P. Name">
          <Input value={party.apName} onChange={(e) => onChange({ apName: e.target.value })} />
        </Field>
        <Field label="A.P. Contact No">
          <Input value={party.apContact} onChange={(e) => onChange({ apContact: e.target.value })} />
        </Field>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => toast.success("Party details saved")}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* --------------------- Commission section --------------------- */

function CommissionSection({
  party,
  onChange,
}: {
  party: PartyRecord;
  onChange: (p: Partial<PartyRecord>) => void;
}) {
  const [regId, setRegId] = useState<RegId>("SEA IMPORT");
  const rows = party.commissions[regId] ?? [];

  const setRows = (next: CommissionRow[]) => {
    onChange({ commissions: { ...party.commissions, [regId]: next } });
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: `c${Date.now()}`,
        type: "BDT",
        from: "",
        to: "",
        rateType: "Percent",
        amount: "",
      },
    ]);
  };

  const updateRow = (id: string, patch: Partial<CommissionRow>) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => setRows(rows.filter((r) => r.id !== id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">Party Commission Entry</CardTitle>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Reg Id & Job Q.</Label>
          <Select value={regId} onValueChange={(v) => setRegId(v as RegId)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REG_IDS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => toast.success(`Commission saved for ${regId}`)}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">Serial</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead>FROM</TableHead>
              <TableHead>TO</TableHead>
              <TableHead className="w-32">Rate Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </TableCell>
                <TableCell>
                  <Select
                    value={row.type}
                    onValueChange={(v) => updateRow(row.id, { type: v as CommissionType })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.from}
                    onChange={(e) => updateRow(row.id, { from: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.to}
                    onChange={(e) => updateRow(row.id, { to: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.rateType}
                    onValueChange={(v) => updateRow(row.id, { rateType: v as CommissionRateType })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percent">Percent</SelectItem>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                  No commission rules — add a row below
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-3 flex justify-start">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------- Expense Limit section --------------------- */

function ExpenseLimitSection({
  party,
  onChange,
}: {
  party: PartyRecord;
  onChange: (p: Partial<PartyRecord>) => void;
}) {
  const [jobType, setJobType] = useState<"IMPORT" | "EXPORT">("IMPORT");
  const rows = party.expenseLimits[jobType] ?? [];

  const setRows = (next: ExpenseLimitRow[]) => {
    onChange({ expenseLimits: { ...party.expenseLimits, [jobType]: next } });
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: `el${Date.now()}`,
        expenseName: "",
        type: "FIXED",
        rate: "",
        frequency: "",
        remarks: "",
      },
    ]);
  };

  const updateRow = (id: string, patch: Partial<ExpenseLimitRow>) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => setRows(rows.filter((r) => r.id !== id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">Party-Wise Expense Limit</CardTitle>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Job Type</Label>
          <Select value={jobType} onValueChange={(v) => setJobType(v as "IMPORT" | "EXPORT")}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="IMPORT">IMPORT</SelectItem>
              <SelectItem value="EXPORT">EXPORT</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => toast.success(`Expense limits saved for ${jobType}`)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Expense Name</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="w-32">Rate</TableHead>
              <TableHead className="w-32">Frequency</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    value={row.expenseName}
                    onChange={(e) => updateRow(row.id, { expenseName: e.target.value })}
                    placeholder="e.g. Customs Duty"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.type}
                    onValueChange={(v) => updateRow(row.id, { type: v as "FIXED" | "VARIABLE" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">FIXED</SelectItem>
                      <SelectItem value="VARIABLE">VARIABLE</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.rate}
                    onChange={(e) => updateRow(row.id, { rate: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.frequency}
                    onChange={(e) => updateRow(row.id, { frequency: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.remarks}
                    onChange={(e) => updateRow(row.id, { remarks: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => removeRow(row.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                  No expense limits — add a row below
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------- Create dialog --------------------- */

function CreatePartyDialog({
  onCreate,
}: {
  onCreate: (data: Omit<PartyRecord, "id" | "concerns" | "commissions" | "expenseLimits">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    webAddress: "",
    apName: "",
    apContact: "",
    status: "Active" as PartyStatus,
  });

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Party Name is required");
      return;
    }
    onCreate(form);
    setForm({
      name: "",
      address: "",
      contact: "",
      email: "",
      webAddress: "",
      apName: "",
      apContact: "",
      status: "Active",
    });
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create New Party</DialogTitle>
        <DialogDescription>
          Add a new client party. You can configure commissions and expense limits afterwards.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 md:grid-cols-2 py-2">
        <Field label="Party Name *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Talisman Ltd."
          />
        </Field>
        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PartyStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Hold">Hold</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Address" className="md:col-span-2">
          <Textarea
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
        <Field label="Contact No">
          <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </Field>
        <Field label="Email ID">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Web Address">
          <Input value={form.webAddress} onChange={(e) => setForm({ ...form, webAddress: e.target.value })} />
        </Field>
        <Field label="A.P. Name">
          <Input value={form.apName} onChange={(e) => setForm({ ...form, apName: e.target.value })} />
        </Field>
        <Field label="A.P. Contact No" className="md:col-span-2">
          <Input value={form.apContact} onChange={(e) => setForm({ ...form, apContact: e.target.value })} />
        </Field>
      </div>
      <DialogFooter>
        <Button onClick={submit}>
          <Plus className="mr-2 h-4 w-4" />
          Create Party
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* Used by Status badge if needed */
export const _statusVariant = (s: PartyStatus): React.ComponentProps<typeof Badge>["variant"] => {
  switch (s) {
    case "Active": return "default";
    case "Hold": return "secondary";
    default: return "outline";
  }
};

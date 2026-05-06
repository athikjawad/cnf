import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
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
import { parties, shippingAgents, offDocks, fmtBDT, fmtDate, type RegId } from "@/lib/mock-data";
import {
  ArrowRight,
  Save,
  CheckCircle2,
  Plus,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/new")({
  component: NewJobWizard,
});

interface FormState {
  // Step 1
  regId: RegId | "";
  jobDate: string;
  jobNo: string;
  status: "ACTIVE" | "HOLD" | "CANCELLED";
  // Step 2
  partyId: string;
  partyName: string;
  concern: string;
  consigneeName: string;
  consigneeAddress: string;
  // Step 3
  goodsDescription: string;
  packageQty: string;
  packageType: string;
  cbm: string;
  grossWeight: string;
  netWeight: string;
  cfValue: string;
  currency: "USD" | "EUR" | "GBP";
  exchangeRate: string;
  assessableValue: string;
  unitValue: string;
  // Step 4
  beNo: string;
  beDate: string;
  invoiceNo: string;
  invoiceDate: string;
  lcNo: string;
  lcDate: string;
  ipEpNo: string;
  ipEpDate: string;
  hsCode: string;
  awbNo: string;
  awbDate: string;
  // Step 5
  blNo: string;
  blDate: string;
  containerNo: string;
  vesselName: string;
  shippingAgent: string;
  offDock: string;
  transportName: string;
  remarks: string;
  portCharge: "NIL" | "Paid" | "Pending";
  commission: string;
  completionStatus: "INCOMPLETE" | "COMPLETE";
}

const init: FormState = {
  regId: "",
  jobDate: new Date().toISOString().slice(0, 10),
  jobNo: String(1349),
  status: "ACTIVE",
  partyId: "",
  partyName: "",
  concern: "",
  consigneeName: "",
  consigneeAddress: "",
  goodsDescription: "",
  packageQty: "",
  packageType: "Cartons",
  cbm: "",
  grossWeight: "",
  netWeight: "",
  cfValue: "",
  currency: "USD",
  exchangeRate: "119.5",
  assessableValue: "",
  unitValue: "",
  beNo: "",
  beDate: "",
  invoiceNo: "",
  invoiceDate: "",
  lcNo: "",
  lcDate: "",
  ipEpNo: "",
  ipEpDate: "",
  hsCode: "",
  awbNo: "",
  awbDate: "",
  blNo: "",
  blDate: "",
  containerNo: "",
  vesselName: "",
  shippingAgent: "",
  offDock: "NIL",
  transportName: "",
  remarks: "",
  portCharge: "NIL",
  commission: "0",
  completionStatus: "INCOMPLETE",
};

const STEPS = [
  { n: 1, label: "Basic Info" },
  { n: 2, label: "Parties" },
  { n: 3, label: "Shipment" },
  { n: 4, label: "Documentation" },
  { n: 5, label: "Shipping & Logistics" },
  { n: 6, label: "Review" },
];

function NewJobWizard() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(init);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Auto-save every 30s
  useEffect(() => {
    const id = setInterval(() => {
      setSavedAt(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(id);
  }, [form]);

  const jobType: "EXPORT" | "IMPORT" | "" = form.regId
    ? form.regId.includes("EXPORT")
      ? "EXPORT"
      : "IMPORT"
    : "";
  const shipmentMode: "Sea" | "Air" | "Land" | "" = form.regId
    ? form.regId.startsWith("SEA")
      ? "Sea"
      : form.regId.startsWith("AIR")
        ? "Air"
        : "Land"
    : "";
  const isAir = shipmentMode === "Air";
  const cfBDT = useMemo(() => {
    const v = parseFloat(form.cfValue) * parseFloat(form.exchangeRate);
    return isNaN(v) ? 0 : v;
  }, [form.cfValue, form.exchangeRate]);

  const selectedParty = parties.find((p) => p.id === form.partyId);

  const scrollToStep = (n: number) => {
    setTimeout(() => {
      const el = document.getElementById(`step-${n}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const completeStep = (n: number) => {
    setCompleted((c) => ({ ...c, [n]: true }));
    if (n < 6) scrollToStep(n + 1);
  };

  const create = (alsoExpense = false) => {
    toast.success(`Job ${form.jobNo}|${new Date().getFullYear()}|${jobType || "—"} created successfully`);
    if (alsoExpense) {
      navigate({ to: "/expenses" });
    } else {
      navigate({ to: "/jobs/$jobNo", params: { jobNo: form.jobNo } });
    }
  };

  const saveDraft = () => {
    setSavedAt(new Date().toLocaleTimeString());
    toast.success("Draft saved");
  };

  return (
    <div>
      <PageHeader
        title="Create New Job"
        description="Single-page form — auto-saves draft every 30 seconds"
        crumbs={[{ label: "Jobs", href: "/jobs" }, { label: "New" }]}
        actions={
          <>
            {savedAt && (
              <span className="text-xs text-muted-foreground">Draft saved at {savedAt}</span>
            )}
            <Button variant="outline" size="sm" onClick={saveDraft} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Draft
            </Button>
          </>
        }
      />

      <div className="p-6 space-y-6 max-w-5xl">
        {/* Stepper (jump links) */}
        <Card className="p-4 sticky top-14 z-20 bg-background/95 backdrop-blur shadow-sm">
          <ol className="flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => {
              const done = completed[s.n];
              return (
                <li key={s.n} className="flex items-center gap-2">
                  <button
                    onClick={() => scrollToStep(s.n)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      done
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/30 text-[10px]">
                      {done ? <CheckCircle2 className="h-3 w-3" /> : s.n}
                    </span>
                    {s.label}
                  </button>
                  {i < STEPS.length - 1 && <span className="text-muted-foreground">›</span>}
                </li>
              );
            })}
          </ol>
        </Card>

        {/* STEP 1 */}
        <Card id="step-1" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 1 — Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company Name">
              <Input value="SFI — Standard Freight Incorporation" disabled />
            </Field>
            <Field label="Reg ID *">
              <Select value={form.regId} onValueChange={(v) => set("regId", v as RegId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select registration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEA EXPORT">SEA EXPORT</SelectItem>
                  <SelectItem value="SEA IMPORT">SEA IMPORT</SelectItem>
                  <SelectItem value="AIR EXPORT">AIR EXPORT</SelectItem>
                  <SelectItem value="AIR IMPORT">AIR IMPORT</SelectItem>
                  <SelectItem value="LAND PORT EXPORT">LAND PORT EXPORT</SelectItem>
                  <SelectItem value="LAND PORT IMPORT">LAND PORT IMPORT</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Job Type (auto)">
              <Input value={jobType} disabled />
            </Field>
            <Field label="Shipment Mode (auto)">
              <Input value={shipmentMode} disabled />
            </Field>
            <Field label="Job Date *">
              <Input type="date" value={form.jobDate} onChange={(e) => set("jobDate", e.target.value)} />
            </Field>
            <Field label="Job Year (auto)">
              <Input value={new Date(form.jobDate).getFullYear()} disabled />
            </Field>
            <Field label="Job No (auto)">
              <Input value={form.jobNo} onChange={(e) => set("jobNo", e.target.value)} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v as FormState["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="HOLD">HOLD</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => completeStep(1)} disabled={!form.regId || !form.jobDate} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 2 */}
        <Card id="step-2" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 2 — Parties</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Party Name * (typeahead from Party Master)">
              <Select
                value={form.partyId}
                onValueChange={(id) => {
                  const p = parties.find((pp) => pp.id === id);
                  if (p) {
                    set("partyId", id);
                    set("partyName", p.name);
                    set("consigneeAddress", p.address);
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select party..." /></SelectTrigger>
                <SelectContent>
                  {parties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="mt-1 h-7 gap-1 text-xs" onClick={() => toast.info("Inline party creation form would open here")}>
                <Plus className="h-3 w-3" /> Add as new party
              </Button>
            </Field>
            <Field label="Concern Name">
              <Select value={form.concern} onValueChange={(v) => set("concern", v)} disabled={!selectedParty}>
                <SelectTrigger><SelectValue placeholder={selectedParty ? "Select concern" : "Pick party first"} /></SelectTrigger>
                <SelectContent>
                  {selectedParty?.concerns.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Consignee Name">
              <Input value={form.consigneeName} onChange={(e) => set("consigneeName", e.target.value)} />
            </Field>
            <Field label="Consignee Address">
              <Textarea value={form.consigneeAddress} onChange={(e) => set("consigneeAddress", e.target.value)} rows={2} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => completeStep(2)} disabled={!form.partyName} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 3 */}
        <Card id="step-3" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 3 — Shipment Details</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Goods Description" className="md:col-span-3">
              <Input value={form.goodsDescription} onChange={(e) => set("goodsDescription", e.target.value)} />
            </Field>
            <Field label="Package Qty">
              <Input type="number" value={form.packageQty} onChange={(e) => set("packageQty", e.target.value)} />
            </Field>
            <Field label="Package Type">
              <Select value={form.packageType} onValueChange={(v) => set("packageType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Cartons", "Rolls", "Bags", "Pallets", "Pieces", "Drums", "Bales"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="CBM">
              <Input type="number" step="0.01" value={form.cbm} onChange={(e) => set("cbm", e.target.value)} />
            </Field>
            <Field label="Gross Weight (kg)">
              <Input type="number" step="0.01" value={form.grossWeight} onChange={(e) => set("grossWeight", e.target.value)} />
            </Field>
            <Field label="Net Weight (kg)">
              <Input type="number" step="0.01" value={form.netWeight} onChange={(e) => set("netWeight", e.target.value)} />
            </Field>
            <Field label="Currency">
              <Select value={form.currency} onValueChange={(v) => set("currency", v as FormState["currency"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={`C&F Value (${form.currency})`}>
              <Input type="number" step="0.01" value={form.cfValue} onChange={(e) => set("cfValue", e.target.value)} />
            </Field>
            <Field label="Exchange Rate">
              <Input type="number" step="0.01" value={form.exchangeRate} onChange={(e) => set("exchangeRate", e.target.value)} />
            </Field>
            <Field label="C&F Value (BDT) — auto" className="md:col-span-2">
              <Input value={fmtBDT(cfBDT)} disabled className="font-mono" />
            </Field>
            <Field label="Assessable Value (BDT)">
              <Input type="number" value={form.assessableValue} onChange={(e) => set("assessableValue", e.target.value)} />
            </Field>
            <Field label="Unit Value">
              <Input type="number" step="0.01" value={form.unitValue} onChange={(e) => set("unitValue", e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => completeStep(3)} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 4 */}
        <Card id="step-4" className="p-6 space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Step 4 — Documentation</h2>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" /> Incomplete docs won't block creation — they trigger warnings
            </span>
          </div>
          <DocPair label="B/E" no={form.beNo} date={form.beDate} onNo={(v) => set("beNo", v)} onDate={(v) => set("beDate", v)} />
          <DocPair label="Invoice" no={form.invoiceNo} date={form.invoiceDate} onNo={(v) => set("invoiceNo", v)} onDate={(v) => set("invoiceDate", v)} />
          <DocPair label="L/C" no={form.lcNo} date={form.lcDate} onNo={(v) => set("lcNo", v)} onDate={(v) => set("lcDate", v)} />
          <DocPair label="IP/EP" no={form.ipEpNo} date={form.ipEpDate} onNo={(v) => set("ipEpNo", v)} onDate={(v) => set("ipEpDate", v)} />
          <Field label="H.S Code (e.g. 5205.13.00)">
            <Input value={form.hsCode} onChange={(e) => set("hsCode", e.target.value)} placeholder="0000.00.00" />
          </Field>
          {!isAir && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              AWB / HAWB / H/BL / SC / CRF fields are hidden — Reg ID is not AIR.
            </p>
          )}
          {isAir && (
            <>
              <h3 className="pt-2 text-sm font-semibold">Air-only documents</h3>
              <DocPair label="AWB" no={form.awbNo} date={form.awbDate} onNo={(v) => set("awbNo", v)} onDate={(v) => set("awbDate", v)} />
            </>
          )}
          <div className="flex justify-end">
            <Button onClick={() => completeStep(4)} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 5 */}
        <Card id="step-5" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 5 — Shipping & Logistics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <DocPair label="B/L" no={form.blNo} date={form.blDate} onNo={(v) => set("blNo", v)} onDate={(v) => set("blDate", v)} />
            <Field label="Container No"><Input value={form.containerNo} onChange={(e) => set("containerNo", e.target.value)} /></Field>
            <Field label="Vessel Name"><Input value={form.vesselName} onChange={(e) => set("vesselName", e.target.value)} /></Field>
            <Field label="Shipping Agent">
              <Select value={form.shippingAgent} onValueChange={(v) => set("shippingAgent", v)}>
                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {shippingAgents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Off Dock">
              <Select value={form.offDock} onValueChange={(v) => set("offDock", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {offDocks.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Transport Name"><Input value={form.transportName} onChange={(e) => set("transportName", e.target.value)} /></Field>
            <Field label="Port Charge">
              <Select value={form.portCharge} onValueChange={(v) => set("portCharge", v as FormState["portCharge"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIL">NIL</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Commission (BDT)">
              <Input type="number" value={form.commission} onChange={(e) => set("commission", e.target.value)} />
            </Field>
            <Field label="Completion Status">
              <Select value={form.completionStatus} onValueChange={(v) => set("completionStatus", v as FormState["completionStatus"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOMPLETE">INCOMPLETE</SelectItem>
                  <SelectItem value="COMPLETE">COMPLETE</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Remarks" className="md:col-span-2">
              <Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => completeStep(5)} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 6 */}
        <Card id="step-6" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 6 — Review & Create</h2>
          <ReviewSection title="Basic Info">
            <KV label="Reg ID" value={form.regId || "—"} />
            <KV label="Job Type" value={jobType || "—"} />
            <KV label="Job Date" value={fmtDate(form.jobDate)} />
            <KV label="Job No" value={`#${form.jobNo}`} />
            <KV label="Status" value={form.status} />
          </ReviewSection>
          <ReviewSection title="Parties">
            <KV label="Party" value={form.partyName || "—"} warn={!form.partyName} />
            <KV label="Concern" value={form.concern || "—"} />
            <KV label="Consignee" value={form.consigneeName || "—"} />
          </ReviewSection>
          <ReviewSection title="Shipment">
            <KV label="Goods" value={form.goodsDescription || "—"} />
            <KV label={`C&F (${form.currency})`} value={form.cfValue || "0"} />
            <KV label="C&F (BDT)" value={fmtBDT(cfBDT)} />
            <KV label="Packages" value={`${form.packageQty || 0} ${form.packageType}`} />
          </ReviewSection>
          <ReviewSection title="Documentation">
            <KV label="B/E No" value={form.beNo || "—"} warn={!form.beNo} />
            <KV label="Invoice" value={form.invoiceNo || "—"} warn={!form.invoiceNo} />
            <KV label="HS Code" value={form.hsCode || "—"} warn={!form.hsCode} />
          </ReviewSection>
          <ReviewSection title="Shipping">
            <KV label="B/L" value={form.blNo || "—"} />
            <KV label="Container" value={form.containerNo || "—"} />
            <KV label="Shipping Agent" value={form.shippingAgent || "—"} />
            <KV label="Port Charge" value={form.portCharge} />
          </ReviewSection>
          <div className="rounded-md border-warning/30 border bg-warning/5 p-3 text-xs text-warning-foreground">
            <AlertTriangle className="mr-1 inline h-3 w-3" />
            Fields highlighted in amber are missing but not required. You can complete them later from the Job Workspace.
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={saveDraft}>Save as Draft</Button>
            <Button onClick={() => create(false)}>Create Job</Button>
            <Button onClick={() => create(true)} className="gap-1.5">
              Create Job + Add Expense <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}

function DocPair({
  label,
  no,
  date,
  onNo,
  onDate,
}: {
  label: string;
  no: string;
  date: string;
  onNo: (v: string) => void;
  onDate: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-2">
      <Field label={`${label} No`}>
        <Input value={no} onChange={(e) => onNo(e.target.value)} />
      </Field>
      <Field label={`${label} Date`}>
        <Input type="date" value={date} onChange={(e) => onDate(e.target.value)} />
      </Field>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function KV({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={warn ? "text-warning-foreground font-medium" : "font-medium"}>{value}</span>
    </div>
  );
}

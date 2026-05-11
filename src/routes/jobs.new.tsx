import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, type UseFormReturn, type Path, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { parties, shippingAgents, offDocks, fmtBDT, fmtDate } from "@/lib/mock-data";
import { ArrowRight, Save, CheckCircle2, Plus, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/new")({
  component: NewJobWizard,
});

/* --------------------------- Schema --------------------------- */

const RegIdEnum = z.enum([
  "SEA EXPORT",
  "SEA IMPORT",
  "AIR EXPORT",
  "AIR IMPORT",
  "LAND PORT EXPORT",
  "LAND PORT IMPORT",
]);

const jobSchema = z.object({
  // Step 1
  regId: RegIdEnum.refine((v) => !!v, { message: "Reg ID is required" }),
  jobDate: z.string().min(1, "Job date is required"),
  jobNo: z.string().min(1, "Job number is required"),
  status: z.enum(["ACTIVE", "HOLD", "CANCELLED"]),
  // Step 2
  partyId: z.string().min(1, "Select a party"),
  partyName: z.string().min(1, "Party name is required"),
  concern: z.string(),
  consigneeName: z.string(),
  consigneeAddress: z.string(),
  // Step 3
  goodsDescription: z.string(),
  packageQty: z.string(),
  packageType: z.string().min(1),
  cbm: z.string(),
  grossWeight: z.string(),
  netWeight: z.string(),
  cfValue: z.string(),
  currency: z.enum(["USD", "EUR", "GBP"]),
  exchangeRate: z
    .string()
    .min(1, "Exchange rate is required")
    .refine((v) => parseFloat(v) > 0, "Must be greater than 0"),
  assessableValue: z.string(),
  unitValue: z.string(),
  // Step 4
  beNo: z.string(),
  beDate: z.string(),
  invoiceNo: z.string(),
  invoiceDate: z.string(),
  lcNo: z.string(),
  lcDate: z.string(),
  ipEpNo: z.string(),
  ipEpDate: z.string(),
  hsCode: z.string().refine((v) => !v || /^\d{4}\.\d{2}\.\d{2}$/.test(v), {
    message: "Format must be 0000.00.00",
  }),
  awbNo: z.string(),
  awbDate: z.string(),
  // Step 5
  blNo: z.string(),
  blDate: z.string(),
  containerNo: z.string(),
  vesselName: z.string(),
  shippingAgent: z.string(),
  offDock: z.string().min(1),
  transportName: z.string(),
  remarks: z.string(),
  portCharge: z.enum(["NIL", "Paid", "Pending"]),
  commission: z.string(),
  completionStatus: z.enum(["INCOMPLETE", "COMPLETE"]),
});

type JobForm = z.infer<typeof jobSchema>;

const init: JobForm = {
  regId: "SEA IMPORT",
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
  { n: 1, label: "Basic Info", fields: ["regId", "jobDate", "jobNo", "status"] as const },
  { n: 2, label: "Parties", fields: ["partyId", "partyName"] as const },
  {
    n: 3,
    label: "Shipment",
    fields: ["currency", "exchangeRate", "packageType"] as const,
  },
  { n: 4, label: "Documentation", fields: ["hsCode"] as const },
  { n: 5, label: "Shipping & Logistics", fields: ["offDock", "portCharge"] as const },
  { n: 6, label: "Review", fields: [] as const },
];

/* --------------------------- Component --------------------------- */

function NewJobWizard() {
  const navigate = useNavigate();
  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: init,
    mode: "onBlur",
  });

  const { register, handleSubmit, watch, control, formState, trigger, getValues } = form;
  const { errors } = formState;

  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const values = watch();

  // Auto-save every 30s
  useEffect(() => {
    const id = setInterval(() => {
      setSavedAt(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const jobType: "EXPORT" | "IMPORT" | "" = values.regId
    ? values.regId.includes("EXPORT")
      ? "EXPORT"
      : "IMPORT"
    : "";
  const shipmentMode: "Sea" | "Air" | "Land" | "" = values.regId
    ? values.regId.startsWith("SEA")
      ? "Sea"
      : values.regId.startsWith("AIR")
        ? "Air"
        : "Land"
    : "";
  const isAir = shipmentMode === "Air";

  const cfBDT = useMemo(() => {
    const v = parseFloat(values.cfValue || "0") * parseFloat(values.exchangeRate || "0");
    return isNaN(v) ? 0 : v;
  }, [values.cfValue, values.exchangeRate]);

  const selectedParty = parties.find((p) => p.id === values.partyId);

  const scrollToStep = (n: number) => {
    setTimeout(() => {
      const el = document.getElementById(`step-${n}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const completeStep = async (n: number) => {
    const stepFields = STEPS[n - 1].fields as readonly Path<JobForm>[];
    const ok = stepFields.length === 0 ? true : await trigger([...stepFields]);
    if (!ok) {
      toast.error("Please fix the highlighted fields before continuing");
      return;
    }
    setCompleted((c) => ({ ...c, [n]: true }));
    if (n < 6) scrollToStep(n + 1);
  };

  const onCreate = (alsoExpense: boolean) =>
    handleSubmit(
      (data) => {
        toast.success(
          `Job ${data.jobNo}|${new Date(data.jobDate).getFullYear()}|${jobType || "—"} created successfully`,
        );
        if (alsoExpense) {
          navigate({ to: "/expenses" });
        } else {
          navigate({ to: "/jobs/$jobNo", params: { jobNo: data.jobNo } });
        }
      },
      (errs: FieldErrors<JobForm>) => {
        const firstKey = Object.keys(errs)[0];
        toast.error(`Please complete required fields${firstKey ? ` (${firstKey})` : ""}`);
      },
    );

  const saveDraft = () => {
    const data = getValues();
    setSavedAt(new Date().toLocaleTimeString());
    toast.success(`Draft saved (Job #${data.jobNo})`);
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

      <form className="p-6 space-y-6 max-w-5xl" noValidate>
        {/* Stepper (jump links) */}
        <Card className="p-4 sticky top-14 z-20 bg-background/95 backdrop-blur shadow-sm">
          <ol className="flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => {
              const done = completed[s.n];
              return (
                <li key={s.n} className="flex items-center gap-2">
                  <button
                    type="button"
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
            <Field label="Reg ID *" error={errors.regId?.message}>
              <ControlledSelect
                form={form}
                name="regId"
                placeholder="Select registration type"
                options={[
                  "SEA EXPORT",
                  "SEA IMPORT",
                  "AIR EXPORT",
                  "AIR IMPORT",
                  "LAND PORT EXPORT",
                  "LAND PORT IMPORT",
                ]}
              />
            </Field>
            <Field label="Job Type (auto)">
              <Input value={jobType} disabled />
            </Field>
            <Field label="Shipment Mode (auto)">
              <Input value={shipmentMode} disabled />
            </Field>
            <Field label="Job Date *" error={errors.jobDate?.message}>
              <Input type="date" {...register("jobDate")} />
            </Field>
            <Field label="Job Year (auto)">
              <Input value={new Date(values.jobDate).getFullYear()} disabled />
            </Field>
            <Field label="Job No *" error={errors.jobNo?.message}>
              <Input {...register("jobNo")} />
            </Field>
            <Field label="Status">
              <ControlledSelect
                form={form}
                name="status"
                options={["ACTIVE", "HOLD", "CANCELLED"]}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => completeStep(1)} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 2 */}
        <Card id="step-2" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 2 — Parties</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Party Name * (typeahead from Party Master)"
              error={errors.partyId?.message ?? errors.partyName?.message}
            >
              <Controller
                control={control}
                name="partyId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(id) => {
                      const p = parties.find((pp) => pp.id === id);
                      field.onChange(id);
                      if (p) {
                        form.setValue("partyName", p.name, { shouldValidate: true });
                        form.setValue("consigneeAddress", p.address);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select party..." />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-7 gap-1 text-xs"
                onClick={() => toast.info("Inline party creation form would open here")}
              >
                <Plus className="h-3 w-3" /> Add as new party
              </Button>
            </Field>
            <Field label="Concern Name">
              <Controller
                control={control}
                name="concern"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedParty}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={selectedParty ? "Select concern" : "Pick party first"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedParty?.concerns.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Consignee Name">
              <Input {...register("consigneeName")} />
            </Field>
            <Field label="Consignee Address">
              <Textarea rows={2} {...register("consigneeAddress")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => completeStep(2)} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 3 */}
        <Card id="step-3" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 3 — Shipment Details</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Goods Description" className="md:col-span-3">
              <Input {...register("goodsDescription")} />
            </Field>
            <Field label="Package Qty">
              <Input type="number" {...register("packageQty")} />
            </Field>
            <Field label="Package Type">
              <ControlledSelect
                form={form}
                name="packageType"
                options={["Cartons", "Rolls", "Bags", "Pallets", "Pieces", "Drums", "Bales"]}
              />
            </Field>
            <Field label="CBM">
              <Input type="number" step="0.01" {...register("cbm")} />
            </Field>
            <Field label="Gross Weight (kg)">
              <Input type="number" step="0.01" {...register("grossWeight")} />
            </Field>
            <Field label="Net Weight (kg)">
              <Input type="number" step="0.01" {...register("netWeight")} />
            </Field>
            <Field label="Currency">
              <ControlledSelect form={form} name="currency" options={["USD", "EUR", "GBP"]} />
            </Field>
            <Field label={`C&F Value (${values.currency})`}>
              <Input type="number" step="0.01" {...register("cfValue")} />
            </Field>
            <Field label="Exchange Rate *" error={errors.exchangeRate?.message}>
              <Input type="number" step="0.01" {...register("exchangeRate")} />
            </Field>
            <Field label="C&F Value (BDT) — auto" className="md:col-span-2">
              <Input value={fmtBDT(cfBDT)} disabled className="font-mono" />
            </Field>
            <Field label="Assessable Value (BDT)">
              <Input type="number" {...register("assessableValue")} />
            </Field>
            <Field label="Unit Value">
              <Input type="number" step="0.01" {...register("unitValue")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => completeStep(3)} className="gap-1.5">
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
          <DocPair label="B/E" form={form} noName="beNo" dateName="beDate" />
          <DocPair label="Invoice" form={form} noName="invoiceNo" dateName="invoiceDate" />
          <DocPair label="L/C" form={form} noName="lcNo" dateName="lcDate" />
          <DocPair label="IP/EP" form={form} noName="ipEpNo" dateName="ipEpDate" />
          <Field label="H.S Code (e.g. 5205.13.00)" error={errors.hsCode?.message}>
            <Input placeholder="0000.00.00" {...register("hsCode")} />
          </Field>
          {!isAir && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              AWB / HAWB / H/BL / SC / CRF fields are hidden — Reg ID is not AIR.
            </p>
          )}
          {isAir && (
            <>
              <h3 className="pt-2 text-sm font-semibold">Air-only documents</h3>
              <DocPair label="AWB" form={form} noName="awbNo" dateName="awbDate" />
            </>
          )}
          <div className="flex justify-end">
            <Button type="button" onClick={() => completeStep(4)} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 5 */}
        <Card id="step-5" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 5 — Shipping & Logistics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <DocPair label="B/L" form={form} noName="blNo" dateName="blDate" />
            <Field label="Container No">
              <Input {...register("containerNo")} />
            </Field>
            <Field label="Vessel Name">
              <Input {...register("vesselName")} />
            </Field>
            <Field label="Shipping Agent">
              <ControlledSelect
                form={form}
                name="shippingAgent"
                placeholder="Select agent"
                options={[...shippingAgents]}
              />
            </Field>
            <Field label="Off Dock">
              <ControlledSelect form={form} name="offDock" options={[...offDocks]} />
            </Field>
            <Field label="Transport Name">
              <Input {...register("transportName")} />
            </Field>
            <Field label="Port Charge">
              <ControlledSelect
                form={form}
                name="portCharge"
                options={["NIL", "Paid", "Pending"]}
              />
            </Field>
            <Field label="Commission (BDT)">
              <Input type="number" {...register("commission")} />
            </Field>
            <Field label="Completion Status">
              <ControlledSelect
                form={form}
                name="completionStatus"
                options={["INCOMPLETE", "COMPLETE"]}
              />
            </Field>
            <Field label="Remarks" className="md:col-span-2">
              <Textarea rows={2} {...register("remarks")} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => completeStep(5)} className="gap-1.5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* STEP 6 */}
        <Card id="step-6" className="p-6 space-y-4 scroll-mt-24">
          <h2 className="text-base font-semibold">Step 6 — Review & Create</h2>
          <ReviewSection title="Basic Info">
            <KV label="Reg ID" value={values.regId || "—"} />
            <KV label="Job Type" value={jobType || "—"} />
            <KV label="Job Date" value={fmtDate(values.jobDate)} />
            <KV label="Job No" value={`#${values.jobNo}`} />
            <KV label="Status" value={values.status} />
          </ReviewSection>
          <ReviewSection title="Parties">
            <KV label="Party" value={values.partyName || "—"} warn={!values.partyName} />
            <KV label="Concern" value={values.concern || "—"} />
            <KV label="Consignee" value={values.consigneeName || "—"} />
          </ReviewSection>
          <ReviewSection title="Shipment">
            <KV label="Goods" value={values.goodsDescription || "—"} />
            <KV label={`C&F (${values.currency})`} value={values.cfValue || "0"} />
            <KV label="C&F (BDT)" value={fmtBDT(cfBDT)} />
            <KV label="Packages" value={`${values.packageQty || 0} ${values.packageType}`} />
          </ReviewSection>
          <ReviewSection title="Documentation">
            <KV label="B/E No" value={values.beNo || "—"} warn={!values.beNo} />
            <KV label="Invoice" value={values.invoiceNo || "—"} warn={!values.invoiceNo} />
            <KV label="HS Code" value={values.hsCode || "—"} warn={!values.hsCode} />
          </ReviewSection>
          <ReviewSection title="Shipping">
            <KV label="B/L" value={values.blNo || "—"} />
            <KV label="Container" value={values.containerNo || "—"} />
            <KV label="Shipping Agent" value={values.shippingAgent || "—"} />
            <KV label="Port Charge" value={values.portCharge} />
          </ReviewSection>
          <div className="rounded-md border-warning/30 border bg-warning/5 p-3 text-xs text-warning-foreground">
            <AlertTriangle className="mr-1 inline h-3 w-3" />
            Fields highlighted in amber are missing but not required. You can complete them later from the Job Workspace.
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={saveDraft}>
              Save as Draft
            </Button>
            <Button type="button" onClick={onCreate(false)}>
              Create Job
            </Button>
            <Button type="button" onClick={onCreate(true)} className="gap-1.5">
              Create Job + Add Expense <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

/* --------------------------- Helpers --------------------------- */

function Field({
  label,
  children,
  className = "",
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ControlledSelect<T extends JobForm>({
  form,
  name,
  options,
  placeholder,
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Select value={field.value as string} onValueChange={field.onChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

function DocPair({
  label,
  form,
  noName,
  dateName,
}: {
  label: string;
  form: UseFormReturn<JobForm>;
  noName: Path<JobForm>;
  dateName: Path<JobForm>;
}) {
  return (
    <div className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-2">
      <Field label={`${label} No`}>
        <Input {...form.register(noName)} />
      </Field>
      <Field label={`${label} Date`}>
        <Input type="date" {...form.register(dateName)} />
      </Field>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function KV({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={warn ? "text-warning-foreground font-medium" : "font-medium"}>{value}</span>
    </div>
  );
}

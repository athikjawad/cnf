import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  jobs,
  expenses,
  bills,
  dispatches,
  activityLogs,
  fmtBDT,
  fmtDate,
  fmtJobNo,
  statusVariant,
} from "@/lib/mock-data";
import {
  Briefcase,
  Receipt,
  FileText,
  Truck,
  Folder,
  History,
  Edit,
  Plus,
  Upload,
  Ship,
  Plane,
  TramFront,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobNo")({
  loader: ({ params }) => {
    const job = jobs.find((j) => j.jobNo === params.jobNo);
    if (!job) throw notFound();
    return { job };
  },
  component: JobWorkspace,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <p className="text-sm text-muted-foreground">Job not found.</p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/jobs">Back to Jobs</Link>
      </Button>
    </div>
  ),
});

function JobWorkspace() {
  const { job } = Route.useLoaderData();
  const [tab, setTab] = useState("overview");

  const jobExpenses = expenses.filter((e) => e.jobNo === job.jobNo);
  const jobBills = bills.filter((b) => b.jobNo === job.jobNo);
  const jobDispatch = dispatches.find((d) => d.jobNo === job.jobNo);
  const jobActivity = activityLogs.filter((a) => a.recordType === "Job" && a.recordId === job.jobNo);

  const ModeIcon = job.shipmentMode === "Sea" ? Ship : job.shipmentMode === "Air" ? Plane : TramFront;

  return (
    <div>
      <PageHeader
        title={`Job #${job.jobNo}`}
        description={`${job.regId} · ${job.partyName}`}
        crumbs={[{ label: "Jobs", href: "/jobs" }, { label: `#${job.jobNo}` }]}
        actions={
          <>
            <StatusBadge variant={statusVariant(job.status)}>{job.status}</StatusBadge>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        {/* Header card */}
        <Card className="p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Stat icon={ModeIcon} label="Shipment Mode" value={job.shipmentMode} />
            <Stat icon={Briefcase} label="Job Type" value={job.jobType} />
            <Stat icon={FileText} label="C&F Value" value={fmtBDT(job.cfValueBdt)} />
            <Stat icon={Truck} label="Station" value={job.station} />
          </div>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({jobExpenses.length})</TabsTrigger>
            <TabsTrigger value="bills">Bills ({jobBills.length})</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard title="Parties">
                <KV label="Party Name" value={job.partyName} />
                <KV label="Concern" value={job.concern} />
                <KV label="Consignee" value={job.consigneeName} />
                <KV label="Address" value={job.consigneeAddress} />
              </DetailCard>
              <DetailCard title="Shipment">
                <KV label="Goods" value={job.goodsDescription} />
                <KV label="Packages" value={`${job.packageQty} ${job.packageType}`} />
                <KV label="Gross Weight" value={`${job.grossWeight} kg`} />
                <KV label="CBM" value={String(job.cbm)} />
                <KV label="C&F Value" value={`${job.cfValue} ${job.currency} @ ${job.exchangeRate}`} />
                <KV label="Assessable Value" value={fmtBDT(job.assessableValue)} />
              </DetailCard>
              <DetailCard title="Documentation">
                <KV label="B/E No" value={job.beNo} />
                <KV label="Invoice No" value={job.invoiceNo} />
                <KV label="L/C No" value={job.lcNo} />
                <KV label="HS Code" value={job.hsCode} />
                <KV label="Invoice Date" value={fmtDate(job.invoiceDate || "")} />
              </DetailCard>
              <DetailCard title="Shipping & Logistics">
                <KV label="B/L No" value={job.blNo} />
                <KV label="Container" value={job.containerNo} />
                <KV label="Vessel" value={job.vesselName} />
                <KV label="Shipping Agent" value={job.shippingAgent} />
                <KV label="Off Dock" value={job.offDock} />
                <KV label="Port Charge" value={job.portCharge} />
                <KV label="Commission" value={fmtBDT(job.commission)} />
              </DetailCard>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Job Expenses</h3>
                <Button asChild size="sm" className="gap-1.5">
                  <Link to="/expenses"><Plus className="h-4 w-4" /> Add Expense</Link>
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Head</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobExpenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.expenseHead}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.description}</TableCell>
                      <TableCell className="text-sm">{fmtDate(e.date)}</TableCell>
                      <TableCell>
                        <StatusBadge variant={e.status === "APPROVED" ? "success" : e.status === "PENDING" ? "warn" : "danger"}>
                          {e.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{fmtBDT(e.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {jobExpenses.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No expenses yet.</TableCell></TableRow>
                  )}
                  {jobExpenses.length > 0 && (
                    <TableRow className="bg-muted/30 font-medium">
                      <TableCell colSpan={4}>Total</TableCell>
                      <TableCell className="text-right font-mono">{fmtBDT(jobExpenses.reduce((s, e) => s + e.amount, 0))}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="bills">
            <Card>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Bills</h3>
                <Button size="sm" className="gap-1.5" onClick={() => toast.success("Bill forwarded")}>
                  <FileText className="h-4 w-4" /> Forward Bill
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobBills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono">{b.billNo}</TableCell>
                      <TableCell>{fmtDate(b.billDate)}</TableCell>
                      <TableCell>{fmtDate(b.dueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge variant={b.status === "PAID" ? "success" : b.status === "FORWARDED" ? "info" : b.status === "PARTIAL" ? "warn" : "danger"}>
                          {b.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{fmtBDT(b.billAmount)}</TableCell>
                    </TableRow>
                  ))}
                  {jobBills.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No bills yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="transport">
            <Card className="p-5">
              {jobDispatch ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Dispatch Information</h3>
                    <StatusBadge variant={jobDispatch.status === "Delivered" ? "success" : jobDispatch.status === "In Transit" ? "info" : "warn"}>
                      {jobDispatch.status}
                    </StatusBadge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <KV label="Transport" value={jobDispatch.transportName} />
                    <KV label="Vehicle No" value={jobDispatch.vehicleNo} />
                    <KV label="Driver Contact" value={jobDispatch.driverContact} />
                    <KV label="Destination" value={jobDispatch.destination} />
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No dispatch assigned yet.
                  <div className="mt-3">
                    <Button asChild size="sm"><Link to="/transport">Go to Transport</Link></Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-5">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
                <Folder className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">Upload documents for this job</p>
                <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG (max 10MB)</p>
                <Button className="mt-4 gap-1.5" onClick={() => toast.info("File picker would open here")}>
                  <Upload className="h-4 w-4" /> Upload Files
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><History className="h-4 w-4" /> Activity Log</h3>
              </div>
              <ul className="divide-y">
                {jobActivity.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">No activity yet.</li>
                ) : jobActivity.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p><span className="font-medium">{a.user}</span> ({a.role}) {a.action.toLowerCase()}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(a.timestamp)} · {new Date(a.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </Card>
  );
}

function KV({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}

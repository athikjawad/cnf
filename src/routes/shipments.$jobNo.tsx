import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shipments, documents, tasks, transports, type ShipmentStatus } from "@/lib/mock-data";
import { ArrowLeft, FileText, MessageSquare, Truck, CheckCircle2, Circle, Download } from "lucide-react";

export const Route = createFileRoute("/shipments/$jobNo")({
  component: ShipmentDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="text-sm text-muted-foreground">Shipment not found.</p>
      <Link to="/shipments" className="text-sm text-primary hover:underline">Back to shipments</Link>
    </div>
  ),
  loader: ({ params }) => {
    const s = shipments.find((x) => x.jobNo === params.jobNo);
    if (!s) throw notFound();
    return { shipment: s };
  },
});

const stages: ShipmentStatus[] = [
  "Documents Pending",
  "Arrived at Port",
  "Customs Review",
  "Cleared",
  "Truck Assigned",
  "In Transit",
  "Delivered",
];

function ShipmentDetail() {
  const { shipment: s } = Route.useLoaderData();
  const docs = documents.filter((d) => d.shipmentJobNo === s.jobNo);
  const myTasks = tasks.filter((t) => t.shipmentJobNo === s.jobNo);
  const trans = transports.filter((t) => t.shipmentJobNo === s.jobNo);

  const currentIdx = stages.indexOf(s.status);

  return (
    <>
      <PageHeader
        title={s.jobNo}
        description={`${s.client} · ${s.commodity}`}
        actions={
          <>
            <Link to="/shipments"><Button variant="outline" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
            <Button size="sm" className="gap-1.5"><MessageSquare className="h-4 w-4" /> Update Status</Button>
          </>
        }
      />
      <div className="p-6 space-y-5">
        {/* Timeline */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Shipment Timeline</h3>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {stages.map((stage, idx) => {
              const done = idx <= currentIdx && s.status !== "Delayed";
              const current = idx === currentIdx;
              return (
                <div key={stage} className="flex flex-col items-center text-center min-w-[110px] flex-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                    done ? "bg-success border-success text-success-foreground" :
                    current ? "bg-primary border-primary text-primary-foreground" :
                    "bg-card border-border text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                  </div>
                  <p className={`mt-2 text-[11px] font-medium ${current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                    {stage}
                  </p>
                  {idx < stages.length - 1 && (
                    <div className={`hidden md:block absolute h-0.5 ${done ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {s.status === "Delayed" && (
            <div className="mt-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              ⚠️ Shipment is currently delayed. Last update: customs hold pending HS code clarification.
            </div>
          )}
        </Card>

        {/* Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4">Shipment Details</h3>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <Field label="Type" value={s.type} />
              <Field label="Mode" value={s.mode} />
              <Field label="Port" value={s.port} />
              <Field label="BL / AWB" value={<span className="font-mono text-xs">{s.blNo}</span>} />
              <Field label="Container" value={<span className="font-mono text-xs">{s.containerNo}</span>} />
              <Field label="Status" value={<StatusBadge status={s.status} />} />
              <Field label="Origin" value={s.origin} />
              <Field label="Destination" value={s.destination} />
              <Field label="ETA" value={s.eta} />
              <Field label="Assigned To" value={s.assignedTo} />
              <Field label="Created" value={s.createdAt} />
              <Field label="Value" value={`$${s.value.toLocaleString()}`} />
            </dl>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">Financials</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Cargo Value</span><span className="tabular-nums font-medium">${s.value.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service Fee</span><span className="tabular-nums">$1,200</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customs Duty</span><span className="tabular-nums">$8,400</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transport</span><span className="tabular-nums">$1,800</span></div>
              <div className="border-t pt-3 flex justify-between font-semibold"><span>Profit</span><span className={`tabular-nums ${s.profit >= 0 ? "text-success" : "text-destructive"}`}>${s.profit.toLocaleString()}</span></div>
            </div>
          </Card>
        </div>

        {/* Tabs: docs, tasks, transport */}
        <Card className="p-0 overflow-hidden">
          <Tabs defaultValue="docs" className="w-full">
            <div className="border-b px-5 pt-3">
              <TabsList className="bg-transparent h-auto p-0 gap-4">
                <TabsTrigger value="docs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  <FileText className="h-4 w-4 mr-1.5" /> Documents ({docs.length})
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Tasks ({myTasks.length})
                </TabsTrigger>
                <TabsTrigger value="transport" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  <Truck className="h-4 w-4 mr-1.5" /> Transport ({trans.length})
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="docs" className="m-0">
              {docs.length === 0 ? <Empty msg="No documents uploaded yet." /> : (
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground"><tr>
                    <th className="px-5 py-2.5 text-left font-medium">Name</th>
                    <th className="px-5 py-2.5 text-left font-medium">Type</th>
                    <th className="px-5 py-2.5 text-left font-medium">Uploaded</th>
                    <th className="px-5 py-2.5 text-left font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {docs.map((d) => (
                      <tr key={d.id} className="hover:bg-secondary/40">
                        <td className="px-5 py-2.5 font-medium">{d.name}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{d.type}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{d.uploadedAt} · {d.uploadedBy}</td>
                        <td className="px-5 py-2.5"><DocStatus status={d.status} /></td>
                        <td className="px-5 py-2.5 text-right"><Button variant="ghost" size="sm" className="h-7 gap-1"><Download className="h-3.5 w-3.5" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TabsContent>
            <TabsContent value="tasks" className="m-0">
              {myTasks.length === 0 ? <Empty msg="No tasks for this shipment." /> : (
                <div className="divide-y">
                  {myTasks.map((t) => (
                    <div key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-secondary/40">
                      <div className={`h-2 w-2 rounded-full ${t.priority === "Urgent" ? "bg-destructive" : t.priority === "High" ? "bg-warning" : "bg-muted-foreground"}`} />
                      <div className="flex-1"><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.assignee} · Due {t.dueDate}</p></div>
                      <span className="text-xs">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="transport" className="m-0">
              {trans.length === 0 ? <Empty msg="No transport assigned yet." /> : (
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground"><tr>
                    <th className="px-5 py-2.5 text-left font-medium">Vendor</th>
                    <th className="px-5 py-2.5 text-left font-medium">Truck</th>
                    <th className="px-5 py-2.5 text-left font-medium">Driver</th>
                    <th className="px-5 py-2.5 text-left font-medium">Route</th>
                    <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                    <th className="px-5 py-2.5 text-left font-medium">Status</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {trans.map((t) => (
                      <tr key={t.id} className="hover:bg-secondary/40">
                        <td className="px-5 py-2.5 font-medium">{t.vendor}</td>
                        <td className="px-5 py-2.5 font-mono text-xs">{t.truckNo}</td>
                        <td className="px-5 py-2.5">{t.driver}<div className="text-xs text-muted-foreground">{t.phone}</div></td>
                        <td className="px-5 py-2.5 text-muted-foreground">{t.route}</td>
                        <td className="px-5 py-2.5 text-right tabular-nums">৳{t.rate.toLocaleString()}</td>
                        <td className="px-5 py-2.5"><span className="text-xs font-medium">{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="px-5 py-10 text-center text-sm text-muted-foreground">{msg}</div>;
}

function DocStatus({ status }: { status: string }) {
  const cls = status === "Verified" ? "bg-success/15 text-success border-success/40"
    : status === "Issue Found" ? "bg-destructive/15 text-destructive border-destructive/40"
    : "bg-warning/15 text-warning-foreground border-warning/40";
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{status}</span>;
}

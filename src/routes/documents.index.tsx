import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { documents } from "@/lib/mock-data";
import { Upload, Download, FileText, FileWarning, FileCheck } from "lucide-react";

export const Route = createFileRoute("/documents/")({
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Document Vault"
        description="All shipment documentation in one place"
        actions={<Button size="sm" className="gap-1.5"><Upload className="h-4 w-4" /> Upload</Button>}
      />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={FileCheck} label="Verified" value={documents.filter((d) => d.status === "Verified").length} tone="success" />
          <StatCard icon={FileText} label="Pending Review" value={documents.filter((d) => d.status === "Pending Review").length} tone="warning" />
          <StatCard icon={FileWarning} label="Issues Found" value={documents.filter((d) => d.status === "Issue Found").length} tone="destructive" />
        </div>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">Document</th>
                <th className="px-5 py-2.5 text-left font-medium">Type</th>
                <th className="px-5 py-2.5 text-left font-medium">Shipment</th>
                <th className="px-5 py-2.5 text-left font-medium">Uploaded By</th>
                <th className="px-5 py-2.5 text-left font-medium">Date</th>
                <th className="px-5 py-2.5 text-left font-medium">Size</th>
                <th className="px-5 py-2.5 text-left font-medium">Status</th>
                <th className="px-5 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-2.5 font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{d.name}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{d.type}</td>
                  <td className="px-5 py-2.5 font-mono text-xs">{d.shipmentJobNo}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{d.uploadedBy}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{d.uploadedAt}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{d.size}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
                      d.status === "Verified" ? "bg-success/15 text-success border-success/40"
                      : d.status === "Issue Found" ? "bg-destructive/15 text-destructive border-destructive/40"
                      : "bg-warning/15 text-warning-foreground border-warning/40"
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right"><Button variant="ghost" size="sm" className="h-7 gap-1"><Download className="h-3.5 w-3.5" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: number; tone: "success" | "warning" | "destructive" }) {
  const toneCls = tone === "success" ? "bg-success/10 text-success" : tone === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/10 text-destructive";
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md flex items-center justify-center ${toneCls}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold tabular-nums">{value}</p></div>
    </Card>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { shipments, type ShipmentStatus } from "@/lib/mock-data";
import { Plus, Filter, Search } from "lucide-react";

export const Route = createFileRoute("/shipments/")({
  component: ShipmentsList,
});

function ShipmentsList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = shipments.filter((s) => {
    const matchQ = q === "" ||
      s.jobNo.toLowerCase().includes(q.toLowerCase()) ||
      s.client.toLowerCase().includes(q.toLowerCase()) ||
      s.blNo.toLowerCase().includes(q.toLowerCase());
    const matchS = status === "all" || s.status === status;
    return matchQ && matchS;
  });

  return (
    <>
      <PageHeader
        title="Shipments"
        description={`${filtered.length} of ${shipments.length} shipments`}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Shipment
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <Card className="p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by job no, client, BL..." className="h-9 pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(["Documents Pending","Arrived at Port","Customs Review","Cleared","Truck Assigned","In Transit","Delivered","Delayed"] as ShipmentStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Filter className="h-4 w-4" /> More filters</Button>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Job No</th>
                  <th className="px-4 py-2.5 text-left font-medium">Client</th>
                  <th className="px-4 py-2.5 text-left font-medium">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium">Mode</th>
                  <th className="px-4 py-2.5 text-left font-medium">Port</th>
                  <th className="px-4 py-2.5 text-left font-medium">BL / AWB</th>
                  <th className="px-4 py-2.5 text-left font-medium">Commodity</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">ETA</th>
                  <th className="px-4 py-2.5 text-left font-medium">Assigned</th>
                  <th className="px-4 py-2.5 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/40">
                    <td className="px-4 py-2.5 font-medium">
                      <Link to="/shipments/$jobNo" params={{ jobNo: s.jobNo }} className="text-primary hover:underline">{s.jobNo}</Link>
                    </td>
                    <td className="px-4 py-2.5">{s.client}</td>
                    <td className="px-4 py-2.5"><span className={`text-xs font-medium ${s.type === "Import" ? "text-info" : "text-success"}`}>{s.type}</span></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.mode}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.port}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{s.blNo}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.commodity}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{s.eta}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.assignedTo}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">${s.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

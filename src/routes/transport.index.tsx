import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { transports } from "@/lib/mock-data";
import { Plus, Phone } from "lucide-react";

export const Route = createFileRoute("/transport/")({
  component: TransportPage,
});

function TransportPage() {
  return (
    <>
      <PageHeader
        title="Transport"
        description="Manage truck vendors, bookings, and dispatch"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Book Truck</Button>}
      />
      <div className="p-6">
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">Vendor</th>
                <th className="px-5 py-2.5 text-left font-medium">Truck No</th>
                <th className="px-5 py-2.5 text-left font-medium">Driver</th>
                <th className="px-5 py-2.5 text-left font-medium">Route</th>
                <th className="px-5 py-2.5 text-left font-medium">Shipment</th>
                <th className="px-5 py-2.5 text-right font-medium">Rate (BDT)</th>
                <th className="px-5 py-2.5 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transports.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-2.5 font-medium">{t.vendor}</td>
                  <td className="px-5 py-2.5 font-mono text-xs">{t.truckNo}</td>
                  <td className="px-5 py-2.5">{t.driver}<div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {t.phone}</div></td>
                  <td className="px-5 py-2.5 text-muted-foreground">{t.route}</td>
                  <td className="px-5 py-2.5 font-mono text-xs">{t.shipmentJobNo}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{t.rate ? `৳${t.rate.toLocaleString()}` : "—"}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
                      t.status === "Available" ? "bg-success/15 text-success border-success/40"
                      : t.status === "Delivered" ? "bg-muted text-muted-foreground border-border"
                      : t.status === "In Transit" ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-info/15 text-info border-info/40"
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

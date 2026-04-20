import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { invoices } from "@/lib/mock-data";
import { Plus, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/invoices/")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const totalDue = invoices.reduce((s, i) => s + i.due, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue");

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Billing, collections and ledger"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Invoice</Button>}
      />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">${totalDue.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Overdue Invoices</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-destructive">{overdue.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Paid this month</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-success">
              ${invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.paid, 0).toLocaleString()}
            </p>
          </Card>
        </div>

        {overdue.length > 0 && (
          <Card className="p-3 flex items-center gap-2 border-destructive/40 bg-destructive/5 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>{overdue.length} invoices overdue totaling <strong>${overdue.reduce((s, i) => s + i.due, 0).toLocaleString()}</strong> — send reminders.</span>
            <Button size="sm" variant="outline" className="ml-auto h-7">Send Reminders</Button>
          </Card>
        )}

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">Invoice No</th>
                <th className="px-5 py-2.5 text-left font-medium">Client</th>
                <th className="px-5 py-2.5 text-left font-medium">Shipment</th>
                <th className="px-5 py-2.5 text-left font-medium">Issued</th>
                <th className="px-5 py-2.5 text-left font-medium">Due Date</th>
                <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                <th className="px-5 py-2.5 text-right font-medium">Paid</th>
                <th className="px-5 py-2.5 text-right font-medium">Due</th>
                <th className="px-5 py-2.5 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-2.5 font-medium font-mono text-xs">{i.invoiceNo}</td>
                  <td className="px-5 py-2.5">{i.client}</td>
                  <td className="px-5 py-2.5 font-mono text-xs">{i.shipmentJobNo}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{i.issuedDate}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{i.dueDate}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">${i.amount.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums text-success">${i.paid.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-semibold">${i.due.toLocaleString()}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
                      i.status === "Paid" ? "bg-success/15 text-success border-success/40"
                      : i.status === "Overdue" ? "bg-destructive/15 text-destructive border-destructive/40"
                      : i.status === "Partial" ? "bg-warning/15 text-warning-foreground border-warning/40"
                      : "bg-info/15 text-info border-info/40"
                    }`}>{i.status}</span>
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

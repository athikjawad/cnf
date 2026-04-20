import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clients } from "@/lib/mock-data";
import { Plus, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description={`${clients.length} active clients`}
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Client</Button>}
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map((c) => (
          <Card key={c.id} className="p-5 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{c.industry}</p>
              </div>
              <span className="rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5">
                {c.shipments} shipments
              </span>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-foreground">{c.contact}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {c.phone}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {c.email}</p>
              <p className="text-xs text-muted-foreground pt-1">{c.address}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-sm font-semibold tabular-nums">${c.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className={`text-sm font-semibold tabular-nums ${c.outstanding > 0 ? "text-destructive" : "text-success"}`}>
                  ${c.outstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

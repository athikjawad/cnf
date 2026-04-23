import { createFileRoute } from "@tanstack/react-router";
import { useState, type DragEvent } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { dispatches as initial, transportVendors, fmtBDT, type Dispatch, type DispatchStatus } from "@/lib/mock-data";
import { Truck, Phone, Upload, GripVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/transport/")({
  component: TransportPage,
});

const COLUMNS: DispatchStatus[] = ["Cleared", "Truck Assigned", "In Transit", "Delivered"];

function TransportPage() {
  const [list, setList] = useState<Dispatch[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);

  const moveTo = (id: string, status: DispatchStatus) => {
    setList((l) => l.map((d) => (d.id === id ? { ...d, status } : d)));
    toast.success(`Moved to "${status}"`);
  };

  const handleDrop = (e: DragEvent, status: DispatchStatus) => {
    e.preventDefault();
    if (dragId) moveTo(dragId, status);
    setDragId(null);
  };

  return (
    <div>
      <PageHeader
        title="Transport"
        description="Dispatch board, vendors & POD tracking"
        crumbs={[{ label: "Transport" }]}
      />

      <div className="p-6">
        <Tabs defaultValue="dispatch">
          <TabsList>
            <TabsTrigger value="dispatch">Dispatch Board</TabsTrigger>
            <TabsTrigger value="vendors">Transport Vendors</TabsTrigger>
            <TabsTrigger value="pod">POD Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="dispatch" className="mt-4">
            <div className="grid gap-3 md:grid-cols-4">
              {COLUMNS.map((col) => {
                const items = list.filter((d) => d.status === col);
                return (
                  <div
                    key={col}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, col)}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{col}</h3>
                      <span className="rounded-full bg-card px-2 py-0.5 text-xs">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((d) => (
                        <Card
                          key={d.id}
                          draggable
                          onDragStart={() => setDragId(d.id)}
                          className="cursor-grab p-3 active:cursor-grabbing hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="mt-0.5 h-3 w-3 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-xs font-medium text-primary">#{d.jobNo}</p>
                              <p className="mt-0.5 truncate text-sm font-medium">{d.partyName}</p>
                              <p className="truncate text-xs text-muted-foreground">→ {d.destination}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">{d.transportName}</p>
                              {d.vehicleNo && <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{d.vehicleNo}</p>}
                            </div>
                          </div>
                        </Card>
                      ))}
                      {items.length === 0 && (
                        <p className="py-4 text-center text-xs text-muted-foreground">Drop here</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Rate / Trip</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transportVendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Truck className="h-4 w-4" /></div>
                          <span className="font-medium">{v.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{v.contact}</span>
                      </TableCell>
                      <TableCell className="text-sm">{v.routeSpec}</TableCell>
                      <TableCell className="font-mono">{fmtBDT(v.ratePerTrip)}</TableCell>
                      <TableCell>
                        <StatusBadge variant={v.active ? "success" : "muted"}>{v.active ? "Active" : "Inactive"}</StatusBadge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Vendor detail")}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pod" className="mt-4">
            <Card className="p-6">
              <h3 className="text-sm font-semibold">Proof of Delivery — Upload</h3>
              <p className="mt-1 text-xs text-muted-foreground">Link a POD image/PDF to a delivered job</p>
              <div className="mt-4 space-y-2">
                {list.filter(d => d.status === "Delivered" || d.status === "In Transit").map(d => (
                  <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">#{d.jobNo} — {d.partyName}</p>
                      <p className="text-xs text-muted-foreground">{d.destination}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.podUrl ? (
                        <StatusBadge variant="success">POD uploaded</StatusBadge>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success("POD uploaded")}>
                          <Upload className="h-3.5 w-3.5" /> Upload POD
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parties, shippingAgents, offDocks, expenseHeads, stations } from "@/lib/mock-data";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Company info & master data setup (Super Admin only)"
        crumbs={[{ label: "Settings" }]}
      />

      <div className="p-6">
        <Tabs defaultValue="company">
          <TabsList className="flex-wrap">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="agents">Shipping Agents</TabsTrigger>
            <TabsTrigger value="offdock">Off Docks</TabsTrigger>
            <TabsTrigger value="expense">Expense Heads</TabsTrigger>
            <TabsTrigger value="hs">HS Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-4">
            <Card className="p-6 max-w-3xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground"><Building2 className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-semibold">Standard Freight Incorporation</h3>
                  <p className="text-xs text-muted-foreground">SFI Platform configuration</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label className="mb-1.5 block text-xs">Company Name</Label><Input defaultValue="Standard Freight Incorporation" /></div>
                <div><Label className="mb-1.5 block text-xs">Short Name</Label><Input defaultValue="SFI" /></div>
                <div className="md:col-span-2"><Label className="mb-1.5 block text-xs">Address</Label><Input defaultValue="House 12, Road 4, Banani, Dhaka 1213" /></div>
                <div><Label className="mb-1.5 block text-xs">Contact Phone</Label><Input defaultValue="+880 2 988 7766" /></div>
                <div><Label className="mb-1.5 block text-xs">Contact Email</Label><Input defaultValue="ops@sfi.com.bd" /></div>
                <div><Label className="mb-1.5 block text-xs">BIN / TIN</Label><Input defaultValue="000-123-4567" /></div>
                <div><Label className="mb-1.5 block text-xs">License No</Label><Input defaultValue="CFA-CTG-1180" /></div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button onClick={() => toast.success("Company info saved")}>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="parties" className="mt-4">
            <MasterTable
              title="Party Master"
              addLabel="Add Party"
              columns={["Name", "Address", "Contact", "Concerns"]}
              rows={parties.map((p) => [p.name, p.address, p.contact, p.concerns.join(", ")])}
            />
          </TabsContent>
          <TabsContent value="stations" className="mt-4">
            <MasterTable title="Station Master" addLabel="Add Station" columns={["Station"]} rows={stations.map((s) => [s])} />
          </TabsContent>
          <TabsContent value="agents" className="mt-4">
            <MasterTable title="Shipping Agent Master" addLabel="Add Agent" columns={["Agent Name"]} rows={shippingAgents.map((s) => [s])} />
          </TabsContent>
          <TabsContent value="offdock" className="mt-4">
            <MasterTable title="Off Dock Master" addLabel="Add Off Dock" columns={["Off Dock"]} rows={offDocks.map((s) => [s])} />
          </TabsContent>
          <TabsContent value="expense" className="mt-4">
            <MasterTable title="Expense Head Master" addLabel="Add Head" columns={["Expense Head"]} rows={expenseHeads.map((s) => [s])} />
          </TabsContent>
          <TabsContent value="hs" className="mt-4">
            <Card className="p-6">
              <h3 className="text-sm font-semibold">HS Code Library</h3>
              <p className="mt-1 text-xs text-muted-foreground">Searchable HS code database — connect to BRTA/NBR feed in Phase 2</p>
              <div className="mt-4">
                <Input placeholder="Search HS codes (e.g. 5205)" />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MasterTable({ title, addLabel, columns, rows }: { title: string; addLabel: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button size="sm" className="gap-1.5" onClick={() => toast.info(`${addLabel} dialog`)}><Plus className="h-4 w-4" /> {addLabel}</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => <TableHead key={c}>{c}</TableHead>)}
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              {r.map((cell, j) => <TableCell key={j} className={j === 0 ? "font-medium" : "text-sm text-muted-foreground"}>{cell}</TableCell>)}
              <TableCell><Button variant="ghost" size="sm" onClick={() => toast.info("Edit")}>Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

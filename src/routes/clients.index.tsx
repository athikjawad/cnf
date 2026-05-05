import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parties, jobs, bills, expenses, fmtBDT, type Party } from "@/lib/mock-data";
import { PartyDetailPanel } from "./clients.parties";

export const Route = createFileRoute("/clients/")({
  component: AllPartyInformation,
});

function AllPartyInformation() {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return parties.map((p) => {
      const partyJobs = jobs.filter((j) => j.partyId === p.id);
      const active = partyJobs.filter((j) => j.status === "ACTIVE" || j.status === "PENDING DOCS").length;
      const hold = partyJobs.filter((j) => j.status === "HOLD").length;
      const completed = partyJobs.filter((j) => j.status === "COMPLETED" || j.status === "CLEARED").length;
      const partyJobNos = partyJobs.map((j) => j.jobNo);
      const spend = expenses
        .filter((e) => partyJobNos.includes(e.jobNo))
        .reduce((s, e) => s + e.amount, 0);
      const partyBills = bills.filter((b) => partyJobNos.includes(b.jobNo));
      const billing = partyBills.reduce((s, b) => s + b.billAmount, 0);
      const earned = partyJobs.reduce((s, j) => s + (j.commission || 0), 0);
      return { p, total: partyJobs.length, active, hold, completed, spend, billing, earned };
    });
  }, []);

  const filtered = rows.filter((r) =>
    r.p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totals = filtered.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      spend: acc.spend + r.spend,
      billing: acc.billing + r.billing,
      earned: acc.earned + r.earned,
    }),
    { total: 0, spend: 0, billing: 0, earned: 0 },
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="All Party Information"
        description="Consolidated overview of every client party"
        crumbs={[{ label: "Clients" }, { label: "Party Information" }]}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Total Parties" value={String(filtered.length)} />
        <StatCard label="Total Jobs" value={String(totals.total)} />
        <StatCard label="Total Billing" value={fmtBDT(totals.billing)} />
        <StatCard label="Total Earned" value={fmtBDT(totals.earned)} accent />
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search party name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Party Name</TableHead>
                  <TableHead className="text-center">Total Jobs</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Hold</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Billing</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.p.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium">{r.p.name}</div>
                      <div className="text-xs text-muted-foreground">{r.p.contact}</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{r.total}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">{r.active}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{r.hold}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{r.completed}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{fmtBDT(r.spend)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtBDT(r.billing)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-primary">
                      {fmtBDT(r.earned)}
                    </TableCell>
                    <TableCell>
                      <Link
                        to="/clients/parties"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No parties found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`mt-1 text-xl font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

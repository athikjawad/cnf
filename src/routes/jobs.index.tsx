import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jobs, fmtDate, fmtJobNo, statusVariant, type Job, type RegId } from "@/lib/mock-data";
import { Plus, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/jobs/")({
  component: JobsList,
});

const REG_IDS: (RegId | "ALL")[] = [
  "ALL",
  "SEA EXPORT",
  "SEA IMPORT",
  "AIR EXPORT",
  "AIR IMPORT",
  "LAND PORT EXPORT",
  "LAND PORT IMPORT",
];

type Bucket = "all" | "active" | "inactive" | "completed" | "incomplete";

function JobsList() {
  const [bucket, setBucket] = useState<Bucket>("all");
  const [q, setQ] = useState("");
  const [regFilter, setRegFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return jobs.filter((j: Job) => {
      if (bucket === "active" && !["ACTIVE", "PENDING DOCS", "CLEARED"].includes(j.status)) return false;
      if (bucket === "inactive" && !["HOLD", "CANCELLED"].includes(j.status)) return false;
      if (bucket === "completed" && j.status !== "COMPLETED") return false;
      if (bucket === "incomplete" && j.status !== "INCOMPLETE") return false;
      if (regFilter !== "ALL" && j.regId !== regFilter) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = [j.jobNo, j.partyName, j.blNo, j.containerNo, j.invoiceNo, j.concern]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [bucket, q, regFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [bucket, q, regFilter]);

  return (
    <div>
      <PageHeader
        title="Jobs"
        crumbs={[{ label: "Jobs" }]}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/jobs/new">
                <Plus className="h-4 w-4" /> Create Job
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-6">
        <Tabs value={bucket} onValueChange={(v) => setBucket(v as Bucket)}>
          <TabsList>
            <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({jobs.filter((j) => ["ACTIVE", "PENDING DOCS", "CLEARED"].includes(j.status)).length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({jobs.filter((j) => ["HOLD", "CANCELLED"].includes(j.status)).length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({jobs.filter((j) => j.status === "COMPLETED").length})
            </TabsTrigger>
            <TabsTrigger value="incomplete">
              Incomplete ({jobs.filter((j) => j.status === "INCOMPLETE").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Job No, BL, Container, Invoice, Party..."
                className="h-9 pl-9"
              />
            </div>
            <Select value={regFilter} onValueChange={setRegFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <Filter className="mr-1 h-3 w-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REG_IDS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "ALL" ? "All Reg IDs" : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[170px]">Job No</TableHead>
                <TableHead>Reg ID</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Concern</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((j) => (
                <TableRow key={j.jobNo} className="cursor-pointer">
                  <TableCell className="font-mono font-medium whitespace-nowrap">
                    <Link to="/jobs/$jobNo" params={{ jobNo: j.jobNo }} className="text-primary hover:underline">
                      {fmtJobNo(j)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmtDate(j.jobDate)}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmtDate(j.lastUpdate)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{j.partyName}</div>
                    <div className="text-xs text-muted-foreground">{j.consigneeName}</div>
                  </TableCell>
                  <TableCell className="text-sm">{j.concern}</TableCell>
                  <TableCell>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {j.regId}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{j.station}</TableCell>
                  <TableCell>
                    <StatusBadge variant={statusVariant(j.status)}>{j.status}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={
                        j.status === "COMPLETED"
                          ? "success"
                          : j.status === "INCOMPLETE"
                            ? "danger"
                            : "warn"
                      }
                    >
                      {j.status === "COMPLETED" ? "COMPLETED" : "INCOMPLETE"}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    No jobs match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-4 py-3 text-sm">
              <div className="text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

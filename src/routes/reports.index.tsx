import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  FileText,
  Receipt,
  Users,
  Wallet,
  Download,
  Printer,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports/")({
  component: ReportsPage,
});

const REPORTS = {
  job: [
    "Job Register (Date-Wise)",
    "Job Register (Type-Wise: Import/Export)",
    "Job Register (Station-Wise)",
    "Job Register (Party-Wise)",
    "Job at a Glance & Bill",
    "Job Status by Party",
    "Job Status by Concern",
    "Incomplete Jobs for Bill",
  ],
  billing: [
    "Job-Wise Bill Status",
    "Party-Wise Bill Status",
    "Station-Wise Bill Status",
    "Bill Forwarding Report",
    "Commission Report",
  ],
  expense: [
    "Expense Head Wise Statement",
    "Expense P/L Statement",
    "Expense Register (All / Selected Job)",
    "Category Wise Expense",
  ],
  party: ["Party Concern Statement", "All Party Information"],
  finance: [
    "Cash Book / Bank Book",
    "Ledger Book",
    "Trial Balance",
    "Income Statement",
    "Balance Sheet",
  ],
};

function Group({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="space-y-1">
        {items.map((r) => (
          <li key={r}>
            <button
              onClick={() => toast.info(`Generating: ${r}`)}
              className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
            >
              <span>{r}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Unified report hub — C&F operations, billing, finance"
        crumbs={[{ label: "Reports" }]}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Printer className="h-4 w-4" /> Print</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export PDF</Button>
            <Button size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export Excel</Button>
          </>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="job">Jobs</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Group icon={Briefcase} title="Job Reports" items={REPORTS.job} />
            <Group icon={FileText} title="Billing Reports" items={REPORTS.billing} />
            <Group icon={Receipt} title="Expense Reports" items={REPORTS.expense} />
            <Group icon={Users} title="Party Reports" items={REPORTS.party} />
            <Group icon={Wallet} title="Financial Reports" items={REPORTS.finance} />
          </TabsContent>
          <TabsContent value="job" className="mt-4 max-w-2xl"><Group icon={Briefcase} title="Job Reports" items={REPORTS.job} /></TabsContent>
          <TabsContent value="billing" className="mt-4 max-w-2xl"><Group icon={FileText} title="Billing Reports" items={REPORTS.billing} /></TabsContent>
          <TabsContent value="expense" className="mt-4 max-w-2xl"><Group icon={Receipt} title="Expense Reports" items={REPORTS.expense} /></TabsContent>
          <TabsContent value="finance" className="mt-4 max-w-2xl"><Group icon={Wallet} title="Financial Reports" items={REPORTS.finance} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

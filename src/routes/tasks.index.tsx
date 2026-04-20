import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { tasks } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/tasks/")({
  component: TasksPage,
});

const groups = ["Open", "In Progress", "Done"] as const;

function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Operational task queue across all shipments"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Task</Button>}
      />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {groups.map((g) => {
          const items = tasks.filter((t) => t.status === g);
          return (
            <Card key={g} className="p-0 overflow-hidden">
              <div className="border-b px-4 py-3 flex items-center justify-between bg-secondary/40">
                <h3 className="text-sm font-semibold">{g}</h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {items.map((t) => (
                  <div key={t.id} className="px-4 py-3 hover:bg-secondary/40">
                    <div className="flex items-start gap-2">
                      <Checkbox checked={t.status === "Done"} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${t.status === "Done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-mono">{t.shipmentJobNo}</span>
                          <span>·</span>
                          <span>{t.assignee}</span>
                          <span>·</span>
                          <span>Due {t.dueDate}</span>
                        </div>
                        <span className={`mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          t.priority === "Urgent" ? "bg-destructive/15 text-destructive" :
                          t.priority === "High" ? "bg-warning/15 text-warning-foreground" :
                          t.priority === "Medium" ? "bg-info/15 text-info" : "bg-muted text-muted-foreground"
                        }`}>{t.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

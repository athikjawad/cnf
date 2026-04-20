import { cn } from "@/lib/utils";
import { statusColor, type ShipmentStatus } from "@/lib/mock-data";

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        statusColor[status],
      )}
    >
      {status}
    </span>
  );
}

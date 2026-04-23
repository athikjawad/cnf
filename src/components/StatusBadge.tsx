import { cn } from "@/lib/utils";

type Variant = "active" | "warn" | "info" | "danger" | "muted" | "success";

const STYLES: Record<Variant, string> = {
  active: "bg-success/10 text-success border-success/20",
  success: "bg-success/10 text-success border-success/20",
  warn: "bg-warning/15 text-warning-foreground border-warning/30",
  info: "bg-info/10 text-info border-info/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  variant = "muted",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

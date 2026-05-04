import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { jobs, bills, expenses, vouchers, fmtJobNo } from "@/lib/mock-data";
import { Briefcase, FileText, Receipt, Wallet } from "lucide-react";

export function UniversalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to: to as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search jobs, BL, container, party, voucher…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Jobs">
          {jobs.map((j) => (
            <CommandItem
              key={j.jobNo}
              value={`${j.jobNo} ${j.partyName} ${j.blNo ?? ""} ${j.containerNo ?? ""} ${j.invoiceNo ?? ""}`}
              onSelect={() => go(`/jobs/${j.jobNo}`)}
            >
              <Briefcase className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">#{j.jobNo}</span>
              <span className="ml-2 text-muted-foreground">{j.partyName}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{j.regId}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Bills">
          {bills.map((b) => (
            <CommandItem
              key={b.id}
              value={`${b.billNo} ${b.partyName} ${b.jobNo}`}
              onSelect={() => go("/bills")}
            >
              <FileText className="mr-2 h-4 w-4 text-info" />
              {b.billNo}
              <span className="ml-2 text-muted-foreground">{b.partyName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Expenses">
          {expenses.slice(0, 8).map((e) => (
            <CommandItem
              key={e.id}
              value={`${e.id} ${e.expenseHead} ${e.jobNo}`}
              onSelect={() => go("/expenses")}
            >
              <Receipt className="mr-2 h-4 w-4 text-warning" />
              {e.expenseHead}
              <span className="ml-2 text-muted-foreground">Job #{e.jobNo}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Vouchers">
          {vouchers.map((v) => (
            <CommandItem
              key={v.id}
              value={`${v.voucherNo} ${v.narration}`}
              onSelect={() => go("/accounts")}
            >
              <Wallet className="mr-2 h-4 w-4 text-success" />
              {v.voucherNo}
              <span className="ml-2 text-muted-foreground">{v.narration}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

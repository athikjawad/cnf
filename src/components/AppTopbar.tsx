import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Plus, Command } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRole, ROLES, ROLE_USERS, type Role } from "@/lib/role-context";
import { UniversalSearch } from "@/components/UniversalSearch";

export function AppTopbar() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const user = ROLE_USERS[role];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4">
        <SidebarTrigger />

        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-md border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search jobs, BL, container, party…</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border bg-card px-1.5 py-0.5 text-[10px] font-mono">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="h-9 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r} — {ROLE_USERS[r].name.split(" ")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5">
                <Plus className="h-4 w-4" /> New Job
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/jobs/new" })}>
                + New Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/expenses" })}>
                + Expense Entry
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/bills" })}>
                + New Bill
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/accounts" })}>
                + Voucher Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <UniversalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

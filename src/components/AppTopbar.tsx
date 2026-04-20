import { Bell, Search, Plus } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRole, type Role } from "@/lib/role-context";

export function AppTopbar() {
  const { role, setRole } = useRole();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search shipments, BL, clients..."
          className="h-9 pl-9 bg-secondary border-transparent focus-visible:bg-card"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger className="h-9 w-[200px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Owner">Owner — Rahman</SelectItem>
            <SelectItem value="Operations Manager">Ops Manager — Karim</SelectItem>
            <SelectItem value="Documentation Officer">Doc Officer — Nadia</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-4 w-4" /> New Shipment
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {role.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import {
  Briefcase,
  Receipt,
  FileText,
  Truck,
  Wallet,
  BarChart3,
  Users,
  Settings,
  Package,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole, type ModuleKey } from "@/lib/role-context";
import { cn } from "@/lib/utils";

interface Item {
  key: ModuleKey;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CORE: Item[] = [
  { key: "jobs", title: "Jobs", url: "/jobs", icon: Briefcase },
  { key: "expenses", title: "Expenses", url: "/expenses", icon: Receipt },
  { key: "bills", title: "Bills", url: "/bills", icon: FileText },
  { key: "transport", title: "Transport", url: "/transport", icon: Truck },
];

const FINANCE: Item[] = [
  { key: "accounts", title: "Accounts", url: "/accounts", icon: Wallet },
  { key: "reports", title: "Reports", url: "/reports", icon: BarChart3 },
];

const ADMIN: Item[] = [
  { key: "users", title: "Users & Roles", url: "/users", icon: Users },
  { key: "settings", title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { can } = useRole();

  const renderGroup = (label: string, items: Item[]) => {
    const visible = items.filter((i) => can(i.key));
    if (visible.length === 0) return null;
    return (
      <SidebarGroup>
        {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {visible.map((item) => {
              const active = pathname === item.url || pathname.startsWith(item.url + "/");
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link
                      to={item.url as never}
                      className={cn(
                        "flex items-center gap-2",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Package className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">SFI Platform</span>
              <span className="truncate text-[10px] text-muted-foreground">
                Standard Freight Inc.
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Core", CORE)}
        {renderGroup("Finance", FINANCE)}
        {renderGroup("Admin", ADMIN)}
      </SidebarContent>
    </Sidebar>
  );
}

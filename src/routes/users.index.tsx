import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { activityLogs, fmtDate } from "@/lib/mock-data";
import { ROLES, type Role } from "@/lib/role-context";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  initials: string;
}

const initial: User[] = [
  { id: "u1", name: "Rahman Ahmed", email: "rahman@sfi.com.bd", role: "Super Admin", active: true, initials: "RA" },
  { id: "u2", name: "Karim Hossain", email: "karim@sfi.com.bd", role: "Manager", active: true, initials: "KH" },
  { id: "u3", name: "Nadia Islam", email: "nadia@sfi.com.bd", role: "Operations", active: true, initials: "NI" },
  { id: "u4", name: "Tanvir Rahim", email: "tanvir@sfi.com.bd", role: "Accounts", active: true, initials: "TR" },
  { id: "u5", name: "Salma Akter", email: "salma@sfi.com.bd", role: "Operations", active: false, initials: "SA" },
];

function UsersPage() {
  const [users, setUsers] = useState<User[]>(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Operations");

  const invite = () => {
    if (!name || !email) {
      toast.error("Name and email required");
      return;
    }
    setUsers((l) => [
      ...l,
      {
        id: `u${Date.now()}`,
        name,
        email,
        role,
        active: true,
        initials: name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      },
    ]);
    toast.success(`Invitation sent to ${email}`);
    setOpen(false);
    setName("");
    setEmail("");
  };

  const toggleActive = (id: string) => {
    setUsers((l) => l.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    toast.success("User status updated");
  };

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="Manage team members and access permissions (Super Admin only)"
        crumbs={[{ label: "Users & Roles" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Invite User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite a New User</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label className="mb-1.5 block text-xs">Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label className="mb-1.5 block text-xs">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div>
                  <Label className="mb-1.5 block text-xs">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={invite}>Send Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{u.initials}</AvatarFallback></Avatar>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <ShieldCheck className="h-3 w-3" />{u.role}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge variant={u.active ? "success" : "muted"}>{u.active ? "Active" : "Inactive"}</StatusBadge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(u.id)}>{u.active ? "Deactivate" : "Activate"}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Activity Log (Global)</h3>
          <ul className="space-y-3">
            {activityLogs.map((a) => (
              <li key={a.id} className="text-sm">
                <p><span className="font-medium">{a.user}</span> ({a.role})</p>
                <p className="text-xs text-muted-foreground">{a.action} · {a.recordType} #{a.recordId}</p>
                <p className="text-[10px] text-muted-foreground">{fmtDate(a.timestamp)} · {new Date(a.timestamp).toLocaleTimeString()}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

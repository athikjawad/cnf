import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

export type Role = "Super Admin" | "Manager" | "Operations" | "Accounts";

export const ROLES: Role[] = ["Super Admin", "Manager", "Operations", "Accounts"];

export const ROLE_USERS: Record<Role, { name: string; initials: string }> = {
  "Super Admin": { name: "Rahman Ahmed", initials: "RA" },
  Manager: { name: "Karim Hossain", initials: "KH" },
  Operations: { name: "Nadia Islam", initials: "NI" },
  Accounts: { name: "Tanvir Rahim", initials: "TR" },
};

// Module-level permissions
export type ModuleKey =
  | "jobs"
  | "expenses"
  | "bills"
  | "transport"
  | "clients"
  | "accounts"
  | "reports"
  | "users"
  | "settings";

export const MODULE_PERMISSIONS: Record<Role, ModuleKey[]> = {
  "Super Admin": ["jobs", "expenses", "bills", "transport", "clients", "accounts", "reports", "users", "settings"],
  Manager: ["jobs", "expenses", "bills", "transport", "clients", "accounts", "reports"],
  Operations: ["jobs", "expenses", "transport", "clients"],
  Accounts: ["expenses", "bills", "clients", "accounts", "reports"],
};

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
  can: (m: ModuleKey) => boolean;
}

const Ctx = createContext<RoleCtx>({ role: "Super Admin", setRole: () => {}, can: () => true });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Super Admin");
  const value = useMemo<RoleCtx>(
    () => ({
      role,
      setRole,
      can: (m) => MODULE_PERMISSIONS[role].includes(m),
    }),
    [role],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useRole = () => useContext(Ctx);

import type { ReactNode } from "react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { requireAdminStaff } from "@/lib/learner";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const staff = await requireAdminStaff();
  return <>
    <AdminNavigation name={staff.name} roles={staff.roles} localDevelopment={process.env.NODE_ENV === "development"} />
    {children}
  </>;
}

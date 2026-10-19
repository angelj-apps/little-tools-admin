import { AdminNav } from "@/components/AdminNav";

export function AdminShell({
  email,
  children,
}: {
  email?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <AdminNav email={email} />
      {children}
    </div>
  );
}

import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Term } from "@/lib/supabase/admin-types";

export default async function TermsPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("terms")
    .select("*")
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as Term[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>Terms</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Create, edit, and delete legal / product terms documents.
          </p>
        </div>
        <Link href="/terms/new" className="admin-btn admin-btn-primary">
          New term
        </Link>
      </div>
      {error ? <MissingTableNotice table="terms" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No terms yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Version</th>
                <th>Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                  </td>
                  <td className="mono">{row.slug}</td>
                  <td>{row.version}</td>
                  <td>{row.is_published ? "yes" : "no"}</td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link href={`/terms/${row.id}`} className="admin-btn admin-btn-ghost">
                      Edit
                    </Link>
                    <DeleteRowButton table="terms" id={row.id} returnTo="/terms" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}

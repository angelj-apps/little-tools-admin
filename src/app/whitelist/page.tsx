import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { WhitelistedEmail } from "@/lib/supabase/admin-types";

export default async function WhitelistPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whitelisted_emails")
    .select("*")
    .order("email");
  const rows = (data ?? []) as WhitelistedEmail[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>Whitelisted emails</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Individual emails allowed to sign up.
          </p>
        </div>
        <Link href="/whitelist/new" className="admin-btn admin-btn-primary">
          Add email
        </Link>
      </div>
      {error ? <MissingTableNotice table="whitelisted_emails" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No emails yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="mono">{row.email}</td>
                  <td>{row.notes || "—"}</td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link
                      href={`/whitelist/${row.id}`}
                      className="admin-btn admin-btn-ghost"
                    >
                      Edit
                    </Link>
                    <DeleteRowButton
                      table="whitelisted_emails"
                      id={row.id}
                      returnTo="/whitelist"
                    />
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

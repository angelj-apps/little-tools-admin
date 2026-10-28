import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AllowedSignupDomain } from "@/lib/supabase/admin-types";

export default async function SignupDomainsPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("allowed_signup_domains")
    .select("*")
    .order("domain");
  const rows = (data ?? []) as AllowedSignupDomain[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>Allowed signup domains</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Domains permitted to create accounts.
          </p>
        </div>
        <Link href="/signup-domains/new" className="admin-btn admin-btn-primary">
          Add domain
        </Link>
      </div>
      {error ? <MissingTableNotice table="allowed_signup_domains" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No domains yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="mono">@{row.domain}</td>
                  <td>{row.notes || "—"}</td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link
                      href={`/signup-domains/${row.id}`}
                      className="admin-btn admin-btn-ghost"
                    >
                      Edit
                    </Link>
                    <DeleteRowButton
                      table="allowed_signup_domains"
                      id={row.id}
                      returnTo="/signup-domains"
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

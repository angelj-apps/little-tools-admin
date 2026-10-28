import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LlmProvider } from "@/lib/supabase/admin-types";

export default async function LlmProvidersPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("llm_providers")
    .select("*")
    .order("name");
  const rows = (data ?? []) as LlmProvider[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>LLM providers</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Manage upstream AI providers.
          </p>
        </div>
        <Link href="/llm-providers/new" className="admin-btn admin-btn-primary">
          New provider
        </Link>
      </div>
      {error ? <MissingTableNotice table="llm_providers" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No providers yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Active</th>
                <th>Base URL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td className="mono">{row.slug}</td>
                  <td>{row.is_active ? "yes" : "no"}</td>
                  <td className="mono" style={{ fontSize: "0.78rem" }}>
                    {row.base_url || "—"}
                  </td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link
                      href={`/llm-providers/${row.id}`}
                      className="admin-btn admin-btn-ghost"
                    >
                      Edit
                    </Link>
                    <DeleteRowButton
                      table="llm_providers"
                      id={row.id}
                      returnTo="/llm-providers"
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

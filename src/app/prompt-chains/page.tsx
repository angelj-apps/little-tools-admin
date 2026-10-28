import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PromptChain } from "@/lib/supabase/admin-types";

export default async function PromptChainsPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_chains")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as PromptChain[];

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>Prompt chains</h1>
          <p>Read-only list of generation pipelines.</p>
        </div>
        <Link href="/prompt-chains/steps" className="admin-btn admin-btn-ghost">
          View steps
        </Link>
      </div>
      {error ? <MissingTableNotice table="prompt_chains" /> : null}
      {!error && rows.length === 0 ? (
        <p className="empty">No prompt chains yet. Insert rows in Supabase or seed SQL.</p>
      ) : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Active</th>
                <th>Description</th>
                <th>Created</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.is_active ? "yes" : "no"}</td>
                  <td>{row.description || "—"}</td>
                  <td className="mono" style={{ fontSize: "0.78rem" }}>
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="mono" style={{ fontSize: "0.72rem" }}>
                    {row.id}
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

import { AdminShell } from "@/components/AdminShell";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { GenerationRequest } from "@/lib/supabase/admin-types";

export default async function GenerationRequestsPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as GenerationRequest[];

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>Generation requests</h1>
          <p>Read-only log of AI generation jobs.</p>
        </div>
        <span className="pill">{rows.length} shown</span>
      </div>
      {error ? <MissingTableNotice table="generation_requests" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No requests yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Input</th>
                <th>User</th>
                <th>Chain</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="pill">{row.status}</span>
                  </td>
                  <td>{row.input_text.slice(0, 140) || "—"}</td>
                  <td className="mono" style={{ fontSize: "0.72rem" }}>
                    {row.user_id?.slice(0, 8) ?? "—"}
                  </td>
                  <td className="mono" style={{ fontSize: "0.72rem" }}>
                    {row.prompt_chain_id?.slice(0, 8) ?? "—"}
                  </td>
                  <td className="mono" style={{ fontSize: "0.78rem" }}>
                    {new Date(row.created_at).toLocaleString()}
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

import { AdminShell } from "@/components/AdminShell";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LlmResponse } from "@/lib/supabase/admin-types";

export default async function LlmResponsesPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("llm_responses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as LlmResponse[];

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>LLM responses</h1>
          <p>Read-only model outputs tied to generation requests.</p>
        </div>
      </div>
      {error ? <MissingTableNotice table="llm_responses" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No responses yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Latency</th>
                <th>Prompt</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="mono" style={{ fontSize: "0.78rem" }}>
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td>{row.latency_ms != null ? `${row.latency_ms}ms` : "—"}</td>
                  <td>{row.prompt.slice(0, 100) || "—"}</td>
                  <td>{row.response_text.slice(0, 140) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}

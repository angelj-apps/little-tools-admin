import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LlmModel, LlmProvider } from "@/lib/supabase/admin-types";

export default async function LlmModelsPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const [{ data, error }, { data: providers }] = await Promise.all([
    supabase.from("llm_models").select("*").order("name"),
    supabase.from("llm_providers").select("id, name"),
  ]);
  const providerName = new Map(
    ((providers ?? []) as Pick<LlmProvider, "id" | "name">[]).map((p) => [
      p.id,
      p.name,
    ]),
  );
  const rows = (data ?? []) as LlmModel[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>LLM models</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Models available for prompt chain steps.
          </p>
        </div>
        <Link href="/llm-models/new" className="admin-btn admin-btn-primary">
          New model
        </Link>
      </div>
      {error ? <MissingTableNotice table="llm_models" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No models yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Provider</th>
                <th>Active</th>
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
                  <td>
                    {row.provider_id
                      ? providerName.get(row.provider_id) ?? row.provider_id
                      : "—"}
                  </td>
                  <td>{row.is_active ? "yes" : "no"}</td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link
                      href={`/llm-models/${row.id}`}
                      className="admin-btn admin-btn-ghost"
                    >
                      Edit
                    </Link>
                    <DeleteRowButton
                      table="llm_models"
                      id={row.id}
                      returnTo="/llm-models"
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

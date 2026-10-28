import { AdminShell } from "@/components/AdminShell";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PromptChain, PromptChainStep } from "@/lib/supabase/admin-types";

export default async function PromptChainStepsPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();

  const [{ data: steps, error }, { data: chains }] = await Promise.all([
    supabase
      .from("prompt_chain_steps")
      .select("*")
      .order("prompt_chain_id", { ascending: true })
      .order("position", { ascending: true }),
    supabase.from("prompt_chains").select("id, name"),
  ]);

  const nameById = new Map(
    ((chains ?? []) as Pick<PromptChain, "id" | "name">[]).map((c) => [
      c.id,
      c.name,
    ]),
  );
  const rows = (steps ?? []) as PromptChainStep[];

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>Prompt chain steps</h1>
          <p>Read-only ordered steps inside each chain.</p>
        </div>
      </div>
      {error ? <MissingTableNotice table="prompt_chain_steps" /> : null}
      {!error && rows.length === 0 ? (
        <p className="empty">No steps yet.</p>
      ) : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Chain</th>
                <th>#</th>
                <th>Name</th>
                <th>Template</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{nameById.get(row.prompt_chain_id) ?? row.prompt_chain_id}</td>
                  <td>{row.position}</td>
                  <td>{row.name}</td>
                  <td className="mono" style={{ fontSize: "0.75rem" }}>
                    {row.prompt_template.slice(0, 120)}
                    {row.prompt_template.length > 120 ? "…" : ""}
                  </td>
                  <td className="mono" style={{ fontSize: "0.72rem" }}>
                    {row.model_id?.slice(0, 8) ?? "—"}
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

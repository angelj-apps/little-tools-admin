import { updateMixWeights } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PromptChain, PromptChainMix } from "@/lib/supabase/admin-types";

export default async function PromptChainMixPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();

  const [{ data: chains, error: chainsError }, { data: mixes, error: mixError }] =
    await Promise.all([
      supabase.from("prompt_chains").select("id, name"),
      supabase.from("prompt_chain_mix").select("*"),
    ]);

  const error = chainsError || mixError;
  const chainList = (chains ?? []) as Pick<PromptChain, "id" | "name">[];
  const existing = new Map(
    ((mixes ?? []) as PromptChainMix[]).map((m) => [m.prompt_chain_id, m]),
  );

  // Create missing mix rows so every chain is editable.
  const missing = chainList.filter((c) => !existing.has(c.id));
  if (!error && missing.length) {
    await supabase.from("prompt_chain_mix").insert(
      missing.map((c) => ({
        prompt_chain_id: c.id,
        weight: 0,
        label: c.name,
      })),
    );
  }

  const { data: refreshed } = await supabase
    .from("prompt_chain_mix")
    .select("*")
    .order("updated_at", { ascending: false });

  const nameById = new Map(chainList.map((c) => [c.id, c.name]));
  const rows = (refreshed ?? mixes ?? []) as PromptChainMix[];

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>Prompt chain mix</h1>
          <p>Read and update relative weights across chains.</p>
        </div>
      </div>
      {error ? <MissingTableNotice table="prompt_chain_mix" /> : null}
      {!error && rows.length === 0 ? (
        <p className="empty">
          No chains yet. Insert into <code>prompt_chains</code>, then refresh.
        </p>
      ) : null}
      {!error && rows.length > 0 ? (
        <div className="panel">
          <CrudForm action={updateMixWeights} submitLabel="Update mix">
            <div style={{ display: "grid", gap: "1rem" }}>
              {rows.map((row) => (
                <div
                  key={row.id}
                  style={{
                    display: "grid",
                    gap: "0.5rem",
                    gridTemplateColumns: "minmax(0,1fr) 6rem minmax(0,1fr)",
                    alignItems: "end",
                  }}
                >
                  <input type="hidden" name="id" value={row.id} />
                  <label>
                    Chain
                    <input
                      readOnly
                      value={nameById.get(row.prompt_chain_id) ?? row.prompt_chain_id}
                    />
                  </label>
                  <label>
                    Weight
                    <input
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={Number(row.weight)}
                      required
                    />
                  </label>
                  <label>
                    Label
                    <input name="label" defaultValue={row.label ?? ""} />
                  </label>
                </div>
              ))}
            </div>
          </CrudForm>
        </div>
      ) : null}
    </AdminShell>
  );
}

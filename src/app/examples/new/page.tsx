import { upsertExample } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PromptChain } from "@/lib/supabase/admin-types";

export default async function NewExamplePage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data: chains } = await supabase.from("prompt_chains").select("id, name");
  const action = upsertExample.bind(null, null);

  return (
    <AdminShell email={email}>
      <h1>New example</h1>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <CrudForm action={action}>
          <div className="form-grid">
            <label className="span-2">
              Title
              <input name="title" required />
            </label>
            <label>
              Prompt chain
              <select name="prompt_chain_id" defaultValue="">
                <option value="">— none —</option>
                {((chains ?? []) as Pick<PromptChain, "id" | "name">[]).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notes
              <input name="notes" />
            </label>
            <label className="span-2">
              Input
              <textarea name="input_text" rows={5} />
            </label>
            <label className="span-2">
              Output
              <textarea name="output_text" rows={5} />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

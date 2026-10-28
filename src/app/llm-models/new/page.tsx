import { upsertModel } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LlmProvider } from "@/lib/supabase/admin-types";

export default async function NewModelPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data: providers } = await supabase
    .from("llm_providers")
    .select("id, name")
    .order("name");
  const action = upsertModel.bind(null, null);

  return (
    <AdminShell email={email}>
      <h1>New model</h1>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Slug
              <input name="slug" required />
            </label>
            <label>
              Provider
              <select name="provider_id" defaultValue="">
                <option value="">— none —</option>
                {((providers ?? []) as Pick<LlmProvider, "id" | "name">[]).map(
                  (p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              Max tokens
              <input name="max_tokens" type="number" />
            </label>
            <label>
              Active
              <input name="is_active" type="checkbox" defaultChecked />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

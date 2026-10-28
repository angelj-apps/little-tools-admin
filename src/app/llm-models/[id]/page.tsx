import { notFound } from "next/navigation";
import { upsertModel } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LlmModel, LlmProvider } from "@/lib/supabase/admin-types";

export default async function EditModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const [{ data }, { data: providers }] = await Promise.all([
    supabase.from("llm_models").select("*").eq("id", id).maybeSingle(),
    supabase.from("llm_providers").select("id, name").order("name"),
  ]);
  if (!data) notFound();
  const model = data as LlmModel;
  const action = upsertModel.bind(null, model.id);

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <h1>Edit model</h1>
        <DeleteRowButton table="llm_models" id={model.id} returnTo="/llm-models" />
      </div>
      <div className="panel">
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Name
              <input name="name" required defaultValue={model.name} />
            </label>
            <label>
              Slug
              <input name="slug" required defaultValue={model.slug} />
            </label>
            <label>
              Provider
              <select name="provider_id" defaultValue={model.provider_id ?? ""}>
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
              <input
                name="max_tokens"
                type="number"
                defaultValue={model.max_tokens ?? undefined}
              />
            </label>
            <label>
              Active
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={model.is_active}
              />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

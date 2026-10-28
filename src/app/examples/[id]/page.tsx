import { notFound } from "next/navigation";
import { upsertExample } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AiGenerationExample, PromptChain } from "@/lib/supabase/admin-types";

export default async function EditExamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const [{ data }, { data: chains }] = await Promise.all([
    supabase.from("ai_generation_examples").select("*").eq("id", id).maybeSingle(),
    supabase.from("prompt_chains").select("id, name"),
  ]);
  if (!data) notFound();
  const example = data as AiGenerationExample;
  const action = upsertExample.bind(null, example.id);

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <h1>Edit example</h1>
        <DeleteRowButton
          table="ai_generation_examples"
          id={example.id}
          returnTo="/examples"
        />
      </div>
      <div className="panel">
        <CrudForm action={action}>
          <div className="form-grid">
            <label className="span-2">
              Title
              <input name="title" required defaultValue={example.title} />
            </label>
            <label>
              Prompt chain
              <select
                name="prompt_chain_id"
                defaultValue={example.prompt_chain_id ?? ""}
              >
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
              <input name="notes" defaultValue={example.notes ?? ""} />
            </label>
            <label className="span-2">
              Input
              <textarea name="input_text" rows={5} defaultValue={example.input_text} />
            </label>
            <label className="span-2">
              Output
              <textarea
                name="output_text"
                rows={5}
                defaultValue={example.output_text}
              />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

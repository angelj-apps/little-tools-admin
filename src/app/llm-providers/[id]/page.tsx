import { notFound } from "next/navigation";
import { upsertProvider } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LlmProvider } from "@/lib/supabase/admin-types";

export default async function EditProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("llm_providers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const provider = data as LlmProvider;
  const action = upsertProvider.bind(null, provider.id);

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <h1>Edit provider</h1>
        <DeleteRowButton
          table="llm_providers"
          id={provider.id}
          returnTo="/llm-providers"
        />
      </div>
      <div className="panel">
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Name
              <input name="name" required defaultValue={provider.name} />
            </label>
            <label>
              Slug
              <input name="slug" required defaultValue={provider.slug} />
            </label>
            <label className="span-2">
              Base URL
              <input name="base_url" defaultValue={provider.base_url ?? ""} />
            </label>
            <label className="span-2">
              Notes
              <textarea name="notes" rows={3} defaultValue={provider.notes ?? ""} />
            </label>
            <label>
              Active
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={provider.is_active}
              />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

import { notFound } from "next/navigation";
import { upsertTerm } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Term } from "@/lib/supabase/admin-types";

export default async function EditTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data } = await supabase.from("terms").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const term = data as Term;
  const action = upsertTerm.bind(null, term.id);

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <h1>Edit term</h1>
        <DeleteRowButton table="terms" id={term.id} returnTo="/terms" />
      </div>
      <div className="panel">
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Title
              <input name="title" required defaultValue={term.title} />
            </label>
            <label>
              Slug
              <input name="slug" required defaultValue={term.slug} />
            </label>
            <label>
              Version
              <input name="version" type="number" defaultValue={term.version} />
            </label>
            <label>
              Published
              <input
                name="is_published"
                type="checkbox"
                defaultChecked={term.is_published}
              />
            </label>
            <label className="span-2">
              Body
              <textarea name="body" rows={10} defaultValue={term.body} />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

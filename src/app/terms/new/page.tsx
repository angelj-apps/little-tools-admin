import { upsertTerm } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { requireSuperadmin } from "@/lib/auth";

export default async function NewTermPage() {
  const { email } = await requireSuperadmin();
  const action = upsertTerm.bind(null, null);

  return (
    <AdminShell email={email}>
      <h1>New term</h1>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Slug
              <input name="slug" required placeholder="terms-of-service" />
            </label>
            <label>
              Version
              <input name="version" type="number" defaultValue={1} />
            </label>
            <label>
              Published
              <input name="is_published" type="checkbox" />
            </label>
            <label className="span-2">
              Body
              <textarea name="body" rows={10} />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

import { upsertProvider } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { requireSuperadmin } from "@/lib/auth";

export default async function NewProviderPage() {
  const { email } = await requireSuperadmin();
  const action = upsertProvider.bind(null, null);

  return (
    <AdminShell email={email}>
      <h1>New provider</h1>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Name
              <input name="name" required placeholder="OpenRouter" />
            </label>
            <label>
              Slug
              <input name="slug" required placeholder="openrouter" />
            </label>
            <label className="span-2">
              Base URL
              <input name="base_url" placeholder="https://..." />
            </label>
            <label className="span-2">
              Notes
              <textarea name="notes" rows={3} />
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

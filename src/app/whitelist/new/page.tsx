import { upsertWhitelistEmail } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { requireSuperadmin } from "@/lib/auth";

export default async function NewWhitelistPage() {
  const { email } = await requireSuperadmin();
  const action = upsertWhitelistEmail.bind(null, null);

  return (
    <AdminShell email={email}>
      <h1>Add whitelisted email</h1>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Notes
              <input name="notes" />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

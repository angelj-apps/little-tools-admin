import { upsertDomain } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { requireSuperadmin } from "@/lib/auth";

export default async function NewDomainPage() {
  const { email } = await requireSuperadmin();
  const action = upsertDomain.bind(null, null);

  return (
    <AdminShell email={email}>
      <h1>Add signup domain</h1>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Domain
              <input name="domain" required placeholder="columbia.edu" />
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

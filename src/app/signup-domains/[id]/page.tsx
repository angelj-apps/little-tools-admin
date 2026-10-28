import { notFound } from "next/navigation";
import { upsertDomain } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AllowedSignupDomain } from "@/lib/supabase/admin-types";

export default async function EditDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("allowed_signup_domains")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const row = data as AllowedSignupDomain;
  const action = upsertDomain.bind(null, row.id);

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <h1>Edit domain</h1>
        <DeleteRowButton
          table="allowed_signup_domains"
          id={row.id}
          returnTo="/signup-domains"
        />
      </div>
      <div className="panel">
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Domain
              <input name="domain" required defaultValue={row.domain} />
            </label>
            <label>
              Notes
              <input name="notes" defaultValue={row.notes ?? ""} />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

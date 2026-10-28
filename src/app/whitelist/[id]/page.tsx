import { notFound } from "next/navigation";
import { upsertWhitelistEmail } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { WhitelistedEmail } from "@/lib/supabase/admin-types";

export default async function EditWhitelistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("whitelisted_emails")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const row = data as WhitelistedEmail;
  const action = upsertWhitelistEmail.bind(null, row.id);

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <h1>Edit whitelist email</h1>
        <DeleteRowButton
          table="whitelisted_emails"
          id={row.id}
          returnTo="/whitelist"
        />
      </div>
      <div className="panel">
        <CrudForm action={action}>
          <div className="form-grid">
            <label>
              Email
              <input name="email" type="email" required defaultValue={row.email} />
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

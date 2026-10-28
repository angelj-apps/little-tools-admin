import { uploadImage } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { requireSuperadmin } from "@/lib/auth";

export default async function NewImagePage() {
  const { email } = await requireSuperadmin();

  return (
    <AdminShell email={email}>
      <h1>Upload image</h1>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <CrudForm action={uploadImage} submitLabel="Upload">
          <div className="form-grid">
            <label className="span-2">
              File
              <input name="file" type="file" accept="image/*" required />
            </label>
            <label className="span-2">
              Alt text
              <input name="alt_text" />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

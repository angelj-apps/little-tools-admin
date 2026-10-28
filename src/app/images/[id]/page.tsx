import Image from "next/image";
import { notFound } from "next/navigation";
import { updateImageMeta } from "@/app/actions/crud";
import { AdminShell } from "@/components/AdminShell";
import { CrudForm } from "@/components/CrudForm";
import { DeleteImageButton } from "@/components/DeleteImageButton";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminImage } from "@/lib/supabase/admin-types";

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data } = await supabase.from("images").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const image = data as AdminImage;
  const action = updateImageMeta.bind(null, image.id);

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <h1>Edit image</h1>
        <DeleteImageButton id={image.id} path={image.path} />
      </div>
      <div className="panel">
        <Image
          src={image.public_url}
          alt={image.alt_text ?? ""}
          width={320}
          height={240}
          unoptimized
          style={{ objectFit: "contain", marginBottom: "1rem", maxWidth: "100%" }}
        />
        <CrudForm action={action}>
          <div className="form-grid">
            <label className="span-2">
              Alt text
              <input name="alt_text" defaultValue={image.alt_text ?? ""} />
            </label>
            <label className="span-2">
              Path
              <input readOnly value={image.path} className="mono" />
            </label>
          </div>
        </CrudForm>
      </div>
    </AdminShell>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { DeleteImageButton } from "@/components/DeleteImageButton";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminImage } from "@/lib/supabase/admin-types";

export default async function ImagesPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as AdminImage[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>Images</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Upload and manage images in Supabase Storage.
          </p>
        </div>
        <Link href="/images/new" className="admin-btn admin-btn-primary">
          Upload image
        </Link>
      </div>
      {error ? <MissingTableNotice table="images" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No images yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Alt</th>
                <th>Path</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Image
                      src={row.public_url}
                      alt={row.alt_text ?? ""}
                      width={64}
                      height={64}
                      unoptimized
                      style={{ objectFit: "cover", border: "1px solid var(--line)" }}
                    />
                  </td>
                  <td>{row.alt_text || "—"}</td>
                  <td className="mono" style={{ fontSize: "0.72rem" }}>
                    {row.path}
                  </td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link href={`/images/${row.id}`} className="admin-btn admin-btn-ghost">
                      Edit
                    </Link>
                    <DeleteImageButton id={row.id} path={row.path} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}

import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { MediaForm } from "@/components/MediaForm";
import { requireSuperadmin } from "@/lib/auth";

export default async function NewMediaPage() {
  const { email } = await requireSuperadmin();

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>Create media</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Insert a new AI tool card into the shared library.
          </p>
        </div>
        <Link href="/media" className="admin-btn admin-btn-ghost">
          Back to media
        </Link>
      </div>
      <div className="panel">
        <MediaForm />
      </div>
    </AdminShell>
  );
}

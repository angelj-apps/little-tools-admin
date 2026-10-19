import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { DeleteMediaButton } from "@/components/DeleteMediaButton";
import { MediaForm } from "@/components/MediaForm";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ToolCard } from "@/lib/supabase/types";

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireSuperadmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tool_cards")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const card = data as ToolCard;

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>{card.title}</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Score {card.score} · {card.difficulty} · created{" "}
            {new Date(card.created_at).toLocaleString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href="/media" className="admin-btn admin-btn-ghost">
            Back
          </Link>
          <DeleteMediaButton id={card.id} title={card.title} />
        </div>
      </div>
      <div className="panel">
        <MediaForm card={card} />
      </div>
    </AdminShell>
  );
}

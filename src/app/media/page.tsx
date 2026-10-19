import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ToolCard } from "@/lib/supabase/types";

export default async function MediaPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tool_cards")
    .select("*")
    .order("created_at", { ascending: false });

  const cards = (data ?? []) as ToolCard[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div className="hero-line" style={{ marginBottom: 0, flex: 1 }}>
          <div>
            <h1>AI media</h1>
            <p>Create, inspect, edit, and delete generated tool cards.</p>
          </div>
        </div>
        <Link href="/media/new" className="admin-btn admin-btn-primary">
          Create media
        </Link>
      </div>

      {error ? <p className="form-error">{error.message}</p> : null}

      {cards.length === 0 ? (
        <p className="empty">No tool cards yet.</p>
      ) : (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Score</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id}>
                  <td>
                    <strong>{card.title}</strong>
                    <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                      {card.goal}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        card.score > 0
                          ? "pill pill-up"
                          : card.score < 0
                            ? "pill pill-down"
                            : "pill"
                      }
                    >
                      {card.score}
                    </span>
                  </td>
                  <td>{card.difficulty}</td>
                  <td className="mono" style={{ fontSize: "0.72rem" }}>
                    {(card.tags ?? []).slice(0, 4).join(", ") || "—"}
                  </td>
                  <td className="mono" style={{ fontSize: "0.78rem" }}>
                    {new Date(card.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href={`/media/${card.id}`} className="admin-btn admin-btn-ghost">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

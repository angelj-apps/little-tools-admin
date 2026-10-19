import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ToolCard, ToolVote } from "@/lib/supabase/types";

export default async function RatingsPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();

  const [{ data: votes, error }, { data: cards }] = await Promise.all([
    supabase
      .from("tool_votes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("tool_cards").select("id, title, score"),
  ]);

  const titleById = new Map(
    ((cards ?? []) as Pick<ToolCard, "id" | "title" | "score">[]).map((c) => [
      c.id,
      c,
    ]),
  );

  const rows = (votes ?? []) as ToolVote[];
  const ups = rows.filter((v) => v.value === 1).length;
  const downs = rows.filter((v) => v.value === -1).length;

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>Ratings</h1>
          <p>
            Read-only stream of upvotes and downvotes across the Explore board.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="pill pill-up">{ups} up</span>
          <span className="pill pill-down">{downs} down</span>
        </div>
      </div>

      {error ? <p className="form-error">{error.message}</p> : null}

      {rows.length === 0 ? (
        <p className="empty">No votes yet.</p>
      ) : (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vote</th>
                <th>Tool card</th>
                <th>Voter</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((vote) => {
                const card = titleById.get(vote.tool_card_id);
                return (
                  <tr key={vote.id}>
                    <td>
                      <span
                        className={
                          vote.value === 1 ? "pill pill-up" : "pill pill-down"
                        }
                      >
                        {vote.value === 1 ? "▲ upvote" : "▼ downvote"}
                      </span>
                    </td>
                    <td>
                      {card ? (
                        <Link href={`/media/${card.id}`}>
                          <strong>{card.title}</strong>
                          <div
                            style={{
                              color: "var(--muted)",
                              fontSize: "0.78rem",
                            }}
                          >
                            card score {card.score}
                          </div>
                        </Link>
                      ) : (
                        <span className="mono" style={{ fontSize: "0.75rem" }}>
                          {vote.tool_card_id}
                        </span>
                      )}
                    </td>
                    <td className="mono" style={{ fontSize: "0.75rem" }}>
                      {vote.user_id}
                    </td>
                    <td className="mono" style={{ fontSize: "0.78rem" }}>
                      {new Date(vote.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

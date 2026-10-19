import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { SparkBars } from "@/components/SparkBars";
import { TempGauge } from "@/components/TempGauge";
import { requireSuperadmin } from "@/lib/auth";
import { buildAdminStats } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";
import type { ToolCard, ToolVote } from "@/lib/supabase/types";

export default async function DashboardPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();

  const [{ data: profiles }, { data: cards }, { data: votes }] =
    await Promise.all([
      supabase.from("profiles").select("id"),
      supabase.from("tool_cards").select("*"),
      supabase.from("tool_votes").select("*"),
    ]);

  const stats = buildAdminStats(
    profiles ?? [],
    (cards ?? []) as ToolCard[],
    (votes ?? []) as ToolVote[],
  );

  const maxBand = Math.max(1, ...stats.scoreBands.map((b) => b.count));
  const maxMix = Math.max(1, ...stats.difficultyMix.map((d) => d.count));
  const maxCreator = Math.max(1, ...stats.topCreators.map((c) => c.cards), 1);

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>Pulse</h1>
          <p>
            A live read on how Little Tools is growing — generation cadence,
            crowd temperature, and which skills are splitting the room.
          </p>
        </div>
        <Link href="/media/new" className="admin-btn admin-btn-primary">
          New media
        </Link>
      </div>

      <div className="stat-strip">
        <div className="stat">
          <strong>{stats.profileCount}</strong>
          <span>profiles</span>
        </div>
        <div className="stat">
          <strong>{stats.cardCount}</strong>
          <span>AI tool cards</span>
        </div>
        <div className="stat">
          <strong>{stats.voteCount}</strong>
          <span>ratings cast</span>
        </div>
        <div className="stat">
          <strong>{stats.cardsLast7Days}</strong>
          <span>cards this week</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="panel">
          <h2>Community temperature</h2>
          <p className="lede">
            Share of upvotes among all ratings — {stats.upCount} ▲ /{" "}
            {stats.downCount} ▼ · net card score {stats.netScore} · avg{" "}
            {stats.avgScore}
          </p>
          <TempGauge value={stats.temperature} />
        </section>

        <section className="panel">
          <h2>Generation cadence</h2>
          <p className="lede">New tool cards over the last 14 days</p>
          <SparkBars data={stats.cardsByDay} label="cards / day" />
        </section>

        <section className="panel">
          <h2>Rating cadence</h2>
          <p className="lede">
            Votes landing this week: {stats.votesLast7Days}
          </p>
          <SparkBars data={stats.votesByDay} label="votes / day" />
        </section>

        <section className="panel">
          <h2>Score bands</h2>
          <p className="lede">Where the library sits on the leaderboard</p>
          {stats.scoreBands.map((band) => (
            <div key={band.label} className="band-row">
              <span>{band.label}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(band.count / maxBand) * 100}%` }}
                />
              </div>
              <strong>{band.count}</strong>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Tag heat</h2>
          <p className="lede">
            Concepts earning the most net score · {stats.seedCount} seed cards
            still in the mix
          </p>
          <div className="tag-cloud">
            {stats.topTags.length === 0 ? (
              <p className="empty">No tagged cards yet.</p>
            ) : (
              stats.topTags.map((tag) => (
                <span key={tag.tag} className="tag-chip">
                  {tag.tag}
                  <em>{tag.totalScore}</em>
                </span>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <h2>Difficulty mix</h2>
          <p className="lede">How hard the generated library leans</p>
          {stats.difficultyMix.length === 0 ? (
            <p className="empty">No cards yet.</p>
          ) : (
            stats.difficultyMix.map((row) => (
              <div key={row.label} className="mix-row">
                <span>{row.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(row.count / maxMix) * 100}%`,
                      background: "var(--warn)",
                    }}
                  />
                </div>
                <strong>{row.count}</strong>
              </div>
            ))
          )}
        </section>

        <section className="panel">
          <h2>Controversy desk</h2>
          <p className="lede">
            High vote volume, near-zero net score — tools that split learners
          </p>
          {stats.contested.length === 0 ? (
            <p className="empty">No contested cards yet.</p>
          ) : (
            stats.contested.map((card) => (
              <div key={card.id} className="contest-row">
                <div>
                  <Link href={`/media/${card.id}`}>
                    <strong>{card.title}</strong>
                  </Link>
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                    score {card.score} · {card.ups}▲ {card.downs}▼ · volume{" "}
                    {card.volume}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="panel">
          <h2>Prolific creators</h2>
          <p className="lede">Learners generating the most AI media</p>
          {stats.topCreators.length === 0 ? (
            <p className="empty">Only system/seed cards so far.</p>
          ) : (
            stats.topCreators.map((creator) => (
              <div key={creator.userId} className="mix-row">
                <span
                  className="mono"
                  style={{ fontSize: "0.72rem", overflow: "hidden" }}
                  title={creator.userId}
                >
                  {creator.userId.slice(0, 8)}…
                </span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(creator.cards / maxCreator) * 100}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                <strong title={`avg score ${creator.avgScore}`}>
                  {creator.cards}
                </strong>
              </div>
            ))
          )}
        </section>
      </div>
    </AdminShell>
  );
}

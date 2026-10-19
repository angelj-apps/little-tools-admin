import type { ToolCard, ToolVote } from "@/lib/supabase/types";

export type DayBucket = { day: string; count: number };

export type TagHeat = { tag: string; cards: number; totalScore: number };

export type ContestedCard = {
  id: string;
  title: string;
  score: number;
  ups: number;
  downs: number;
  volume: number;
};

export type CreatorRow = {
  userId: string;
  cards: number;
  avgScore: number;
};

export type AdminStats = {
  profileCount: number;
  cardCount: number;
  voteCount: number;
  upCount: number;
  downCount: number;
  netScore: number;
  avgScore: number;
  seedCount: number;
  cardsLast7Days: number;
  votesLast7Days: number;
  temperature: number;
  cardsByDay: DayBucket[];
  votesByDay: DayBucket[];
  difficultyMix: { label: string; count: number }[];
  topTags: TagHeat[];
  contested: ContestedCard[];
  topCreators: CreatorRow[];
  scoreBands: { label: string; count: number }[];
};

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function bucketByDay(dates: string[], window: string[]): DayBucket[] {
  const map = new Map(window.map((day) => [day, 0]));
  for (const iso of dates) {
    const key = dayKey(iso);
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return window.map((day) => ({ day, count: map.get(day) ?? 0 }));
}

export function buildAdminStats(
  profiles: { id: string }[],
  cards: ToolCard[],
  votes: ToolVote[],
): AdminStats {
  const window = lastNDays(14);
  const weekAgo = new Date();
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const weekIso = weekAgo.toISOString();

  const upCount = votes.filter((v) => v.value === 1).length;
  const downCount = votes.filter((v) => v.value === -1).length;
  const voteVolume = upCount + downCount;
  const temperature =
    voteVolume === 0 ? 50 : Math.round((upCount / voteVolume) * 100);

  const netScore = cards.reduce((sum, c) => sum + (c.score ?? 0), 0);
  const avgScore =
    cards.length === 0 ? 0 : Math.round((netScore / cards.length) * 10) / 10;

  const seedCount = cards.filter((c) => c.prompt === "seed").length;

  const difficultyMap = new Map<string, number>();
  for (const card of cards) {
    const key = card.difficulty || "unknown";
    difficultyMap.set(key, (difficultyMap.get(key) ?? 0) + 1);
  }

  const tagMap = new Map<string, { cards: number; totalScore: number }>();
  for (const card of cards) {
    for (const tag of card.tags ?? []) {
      const prev = tagMap.get(tag) ?? { cards: 0, totalScore: 0 };
      tagMap.set(tag, {
        cards: prev.cards + 1,
        totalScore: prev.totalScore + (card.score ?? 0),
      });
    }
  }
  const topTags = [...tagMap.entries()]
    .map(([tag, v]) => ({ tag, ...v }))
    .sort((a, b) => b.totalScore - a.totalScore || b.cards - a.cards)
    .slice(0, 12);

  const voteByCard = new Map<string, { ups: number; downs: number }>();
  for (const vote of votes) {
    const prev = voteByCard.get(vote.tool_card_id) ?? { ups: 0, downs: 0 };
    if (vote.value === 1) prev.ups += 1;
    if (vote.value === -1) prev.downs += 1;
    voteByCard.set(vote.tool_card_id, prev);
  }

  const contested: ContestedCard[] = cards
    .map((card) => {
      const tallies = voteByCard.get(card.id) ?? { ups: 0, downs: 0 };
      const volume = tallies.ups + tallies.downs;
      return {
        id: card.id,
        title: card.title,
        score: card.score,
        ups: tallies.ups,
        downs: tallies.downs,
        volume,
      };
    })
    .filter((c) => c.volume >= 2 && Math.abs(c.score) <= 1)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 6);

  const creatorMap = new Map<string, { cards: number; scoreSum: number }>();
  for (const card of cards) {
    if (!card.user_id) continue;
    const prev = creatorMap.get(card.user_id) ?? { cards: 0, scoreSum: 0 };
    creatorMap.set(card.user_id, {
      cards: prev.cards + 1,
      scoreSum: prev.scoreSum + (card.score ?? 0),
    });
  }
  const topCreators = [...creatorMap.entries()]
    .map(([userId, v]) => ({
      userId,
      cards: v.cards,
      avgScore: v.cards === 0 ? 0 : Math.round((v.scoreSum / v.cards) * 10) / 10,
    }))
    .sort((a, b) => b.cards - a.cards)
    .slice(0, 8);

  const bands = [
    { label: "≤ -2", test: (s: number) => s <= -2 },
    { label: "-1…1", test: (s: number) => s >= -1 && s <= 1 },
    { label: "2…4", test: (s: number) => s >= 2 && s <= 4 },
    { label: "≥ 5", test: (s: number) => s >= 5 },
  ];
  const scoreBands = bands.map((b) => ({
    label: b.label,
    count: cards.filter((c) => b.test(c.score ?? 0)).length,
  }));

  return {
    profileCount: profiles.length,
    cardCount: cards.length,
    voteCount: votes.length,
    upCount,
    downCount,
    netScore,
    avgScore,
    seedCount,
    cardsLast7Days: cards.filter((c) => c.created_at >= weekIso).length,
    votesLast7Days: votes.filter((v) => v.created_at >= weekIso).length,
    temperature,
    cardsByDay: bucketByDay(
      cards.map((c) => c.created_at),
      window,
    ),
    votesByDay: bucketByDay(
      votes.map((v) => v.created_at),
      window,
    ),
    difficultyMix: [...difficultyMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    topTags,
    contested,
    topCreators,
    scoreBands,
  };
}

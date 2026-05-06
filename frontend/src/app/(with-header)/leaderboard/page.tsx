"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  id: number;
  player_name: string;
  total_score: number;
  rounds_played: number;
  average_score: number;
  created_at: string;
  rank: number;
}

interface LeaderboardStats {
  total_entries: number;
  highest_score: number;
  average_score: number;
}

const RANK_LABELS = ["1ST", "2ND", "3RD"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const [entriesRes, statsRes] = await Promise.all([
          fetch(`${API}/leaderboard?limit=100`),
          fetch(`${API}/leaderboard/stats`),
        ]);
        if (!entriesRes.ok) throw new Error("Failed to load leaderboard");
        const entriesData = await entriesRes.json();
        setEntries(entriesData.leaderboard ?? []);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [API]);

  return (
    <main className="flex flex-col items-center px-4 py-12 flex-1">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-2">Rent Golf</p>
        <h1 className="font-display text-5xl font-bold tracking-tight">High Scores</h1>
        <p className="text-xs text-muted-foreground mt-3 tracking-widest">— lower score is better —</p>
      </div>

      {stats && (
        <div className=" text-xs flex gap-8 mb-10 text-muted-foreground tracking-widest uppercase">
          <span>{stats.total_entries} players</span>
          <span>best: {stats.highest_score?.toFixed(2) ?? "—"}</span>
          <span>avg: {stats.average_score?.toFixed(2) ?? "—"}</span>
        </div>
      )}

      <div className="w-full max-w-2xl">
        {loading && (
          <p className=" text-center text-muted-foreground tracking-widest animate-pulse">
            LOADING...
          </p>
        )}

        {error && (
          <p className=" text-center text-destructive tracking-widest">{error.toUpperCase()}</p>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="text-center py-16">
            <p className=" text-muted-foreground tracking-widest text-sm uppercase">No scores yet</p>
            <p className=" text-xs text-muted-foreground/50 mt-2 tracking-widest">Be the first to play</p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <table className="w-full  text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="text-left py-2 pr-4 tracking-widest text-xs font-normal text-muted-foreground w-16">RANK</th>
                <th className="text-left py-2 pr-4 tracking-widest text-xs font-normal text-muted-foreground">NAME</th>
                <th className="text-right py-2 pr-4 tracking-widest text-xs font-normal text-muted-foreground w-24">SCORE</th>
                <th className="text-right py-2 tracking-widest text-xs font-normal text-muted-foreground w-28 hidden sm:table-cell">DATE</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const isTop3 = i < 3;
                const rankLabel = i < 3 ? RANK_LABELS[i] : `${entry.rank}.`;

                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-border transition-colors ${
                      i === 0 ? "bg-accent/10"
                      : i === 1 ? "bg-muted/40"
                      : i === 2 ? "bg-secondary/10"
                      : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <span className={`text-xs tracking-widest font-bold ${
                        i === 0 ? "text-accent"
                        : i === 1 ? "text-muted-foreground"
                        : i === 2 ? "text-secondary"
                        : "text-muted-foreground/50"
                      }`}>
                        {rankLabel}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`uppercase tracking-wide ${isTop3 ? "font-bold text-foreground" : "text-foreground/70"}`}>
                        {entry.player_name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`tabular-nums ${isTop3 ? "font-bold text-foreground" : "text-foreground/70"}`}>
                        {entry.total_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { MATCHES, computeGoldenBoot, getTeam, PAST_GOLDEN_BOOT_WINNERS } from "@/data/tournament";
import { cn } from "@/lib/utils";

const GoldenBoot = () => {
  const ranking = useMemo(() => computeGoldenBoot(MATCHES), []);
  const leader = ranking[0];
  const hasGoals = (leader?.goals ?? 0) > 0;
  const leaderTeam = leader ? getTeam(leader.teamId) : undefined;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Top Scorers</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Golden Boot Race</h1>
        <p className="text-sm text-muted-foreground">
          Forwards from all 48 teams competing for the tournament's top scorer.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 via-card to-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gold/20 text-3xl">
            {hasGoals && leaderTeam ? leaderTeam.flag : <Trophy className="h-7 w-7 text-gold" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Current Leader</p>
            {hasGoals && leader ? (
              <>
                <p className="truncate text-xl font-extrabold text-foreground">{leader.playerName}</p>
                <p className="text-sm text-muted-foreground">
                  {leaderTeam?.name} · {leader.goals} {leader.goals === 1 ? "goal" : "goals"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-extrabold text-foreground">Race wide open</p>
                <p className="text-sm text-muted-foreground">No goals scored yet — be the first!</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Past Winners ── */}
      <section>
        <h2 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Past Winners</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {PAST_GOLDEN_BOOT_WINNERS.map((w) => {
            const team = getTeam(w.teamId);
            return (
              <div
                key={`${w.year}-${w.playerName}`}
                className="flex shrink-0 w-40 flex-col justify-between rounded-xl border border-border/70 bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xl font-black text-gold">{w.year}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">{w.host}</span>
                </div>
                <p className="mt-1.5 truncate text-sm font-extrabold text-foreground">{w.playerName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl leading-none">{team?.flag ?? "⚽"}</span>
                  <span className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-foreground">{w.goals}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">goals</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Full Rankings ── */}
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        {ranking.slice(0, 60).map((entry, i) => {
          const team = getTeam(entry.teamId);
          return (
            <div
              key={`${entry.teamId}-${entry.playerName}`}
              className="flex items-center gap-3 border-t border-border/50 px-4 py-3 first:border-t-0"
            >
              <span
                className={cn(
                  "w-6 text-center text-sm font-extrabold tabular-nums",
                  i === 0 ? "text-gold" : "text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span className="text-xl leading-none">{team?.flag}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{entry.playerName}</p>
                <p className="text-xs text-muted-foreground">{team?.name}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-extrabold tabular-nums",
                  entry.goals > 0 ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"
                )}
              >
                {entry.goals}
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default GoldenBoot;

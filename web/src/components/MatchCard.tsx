import { memo } from "react";
import { MapPin } from "lucide-react";
import { type Match, type GoalEvent, getTeam, formatKickoff } from "@/data/tournament";
import { cn } from "@/lib/utils";

type ScorerRow = { name: string; count: number; minutes: number[] };

function groupBySide(goals: GoalEvent[], side: "home" | "away"): ScorerRow[] {
  const map = new Map<string, ScorerRow>();
  goals
    .filter((g) => g.side === side)
    .forEach((g) => {
      const existing = map.get(g.playerName);
      if (existing) {
        existing.count += 1;
        existing.minutes.push(g.minute);
      } else {
        map.set(g.playerName, { name: g.playerName, count: 1, minutes: [g.minute] });
      }
    });
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

const MatchCard = memo(({ match }: { match: Match }) => {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  if (!home || !away) return null;

  const { et, ist } = formatKickoff(match.kickoff);
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const homeScorers = isFinished ? groupBySide(match.goals, "home") : [];
  const awayScorers = isFinished ? groupBySide(match.goals, "away") : [];

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/60 bg-accent/40 px-4 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Group {match.group}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-live">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
            </span>
            Live {match.minute ? `${match.minute}'` : ""}
          </span>
        ) : (
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-wider",
              isFinished ? "text-muted-foreground" : "text-primary/70"
            )}
          >
            {isFinished ? "Full time" : "Upcoming"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 px-4 py-4">
        <TeamSideWithScorers
          name={home.name}
          flag={home.flag}
          align="start"
          scorers={homeScorers}
        />
        <div className="flex min-w-[68px] flex-col items-center pt-1">
          {isFinished || isLive ? (
            <div className="flex items-center gap-1.5 text-2xl font-extrabold tabular-nums text-foreground">
              <span>{match.homeScore ?? 0}</span>
              <span className="text-muted-foreground">:</span>
              <span>{match.awayScore ?? 0}</span>
            </div>
          ) : (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
              VS
            </span>
          )}
        </div>
        <TeamSideWithScorers
          name={away.name}
          flag={away.flag}
          align="end"
          scorers={awayScorers}
        />
      </div>

      <div className="space-y-0.5 border-t border-border/60 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{et}</p>
        <p className="text-xs text-muted-foreground">{ist}</p>
        <p className="flex items-center gap-1 pt-0.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {match.venue} · {match.city}
        </p>
        {(isLive || isFinished) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded bg-[#D00] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
              ESPN
            </span>
          </div>
        )}
      </div>
    </article>
  );
});

MatchCard.displayName = "MatchCard";

function TeamSideWithScorers({
  name,
  flag,
  align,
  scorers,
}: {
  name: string;
  flag: string;
  align: "start" | "end";
  scorers: ScorerRow[];
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "end" ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5",
          align === "end" ? "flex-row-reverse text-right" : "text-left"
        )}
      >
        <span className="text-3xl leading-none">{flag}</span>
        <span className="text-sm font-bold leading-tight text-foreground">{name}</span>
      </div>
      {scorers.length > 0 && (
        <div className={cn("flex flex-col gap-0.5", align === "end" ? "items-end" : "items-start")}>
          {scorers.map((s) => (
            <div
              key={s.name}
              className={cn(
                "flex items-center gap-1.5 text-[11px] leading-tight",
                align === "end" ? "flex-row-reverse" : ""
              )}
            >
              <span className="font-medium text-foreground">{s.name}</span>
              <span className="text-muted-foreground/70">
                {s.minutes.sort((a, b) => a - b).join("', ")}'
              </span>
              {s.count > 1 && (
                <span className="rounded-full bg-gold/15 px-1 py-0 text-[10px] font-bold text-gold">
                  ×{s.count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchCard;

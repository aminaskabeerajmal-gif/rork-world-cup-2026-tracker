import { useMemo, useState } from "react";
import { GROUPS, type Match } from "@/data/tournament";
import MatchCard from "@/components/MatchCard";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useEspnLive } from "@/hooks/use-espn";

type Filter = "all" | "finished" | "upcoming";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "finished", label: "Results" },
];

const Matches = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [group, setGroup] = useState<string | "all">("all");
  const { matches: allMatches, espnLive, refresh } = useEspnLive();

  const matches = useMemo<Match[]>(() => {
    return allMatches.filter((m) => {
      if (filter === "finished" && m.status !== "finished") return false;
      if (filter === "upcoming" && m.status === "finished") return false;
      if (group !== "all" && m.group !== group) return false;
      return true;
    }).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  }, [filter, group, allMatches]);

  const liveCount = useMemo(
    () => allMatches.filter((m) => m.status === "live").length,
    [allMatches],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">June 11 - July 19, 2026</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Match Centre</h1>
            <p className="text-sm text-muted-foreground">
              Every group-stage fixture, with kickoff times in Eastern and Indian time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {espnLive && liveCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-live/10 px-2.5 py-1 text-[11px] font-extrabold text-live">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                </span>
                {liveCount} LIVE
              </span>
            )}
            {espnLive && (
              <span className="rounded-full bg-[#D00] px-2.5 py-1 text-[11px] font-extrabold text-white">
                ESPN
              </span>
            )}
            <button
              onClick={() => { setFilter("all"); setGroup("all"); refresh(); }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"
              title="Refresh from ESPN"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-center">
          <p className="text-xs font-semibold text-muted-foreground">
            Watch live on <span className="font-extrabold text-primary">Unite8 Sports</span> &mdash; India&apos;s home of the World Cup
          </p>
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip active={group === "all"} onClick={() => setGroup("all")}>
            All groups
          </Chip>
          {GROUPS.map((g) => (
            <Chip key={g} active={group === g} onClick={() => setGroup(g)}>
              {g}
            </Chip>
          ))}
        </div>
      </div>

      {matches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center text-sm text-muted-foreground">
          No matches for this filter.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-w-[36px] rounded-lg px-2.5 py-1 text-xs font-bold transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default Matches;

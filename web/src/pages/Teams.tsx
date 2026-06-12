import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TEAMS, FORWARD_PLAYERS, type Team } from "@/data/tournament";
import { cn } from "@/lib/utils";

const CONFEDS = ["All", "UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];

const Teams = () => {
  const [query, setQuery] = useState<string>("");
  const [confed, setConfed] = useState<string>("All");

  const teams = useMemo<Team[]>(() => {
    const q = query.trim().toLowerCase();
    return TEAMS.filter((t) => {
      if (confed !== "All" && t.confederation !== confed) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.code.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => a.fifaRank - b.fifaRank);
  }, [query, confed]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">48 Nations</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Teams</h1>
        <p className="text-sm text-muted-foreground">Browse every qualified team and its key forwards.</p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none ring-primary/30 transition focus:ring-2"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CONFEDS.map((c) => (
            <button
              key={c}
              onClick={() => setConfed(c)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                confed === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((t) => {
          const forwards = FORWARD_PLAYERS[t.id] ?? [];
          return (
            <article
              key={t.id}
              className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl leading-none">{t.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Group {t.group} · {t.confederation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rank</p>
                  <p className="text-lg font-extrabold tabular-nums text-primary">#{t.fifaRank}</p>
                </div>
              </div>
              {forwards.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-3">
                  {forwards.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Teams;

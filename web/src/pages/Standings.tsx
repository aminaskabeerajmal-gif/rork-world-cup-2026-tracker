import { GROUPS, computeStandings } from "@/data/tournament";

const Standings = () => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Group Stage</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Standings</h1>
        <p className="text-sm text-muted-foreground">
          Top two from each group advance, plus the best third-placed sides.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {GROUPS.map((group) => {
          const table = computeStandings(group);
          return (
            <section
              key={group}
              className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-border/60 bg-accent/40 px-4 py-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
                  {group}
                </span>
                <span className="text-sm font-bold text-foreground">Group {group}</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 text-left font-semibold">Team</th>
                    <th className="px-1.5 py-2 text-center font-semibold">P</th>
                    <th className="px-1.5 py-2 text-center font-semibold">GD</th>
                    <th className="px-3 py-2 text-center font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((s, i) => (
                    <tr
                      key={s.team.id}
                      className="border-t border-border/50 last:border-b-0"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-6 w-1 rounded-full ${
                              i < 2 ? "bg-primary" : i === 2 ? "bg-gold" : "bg-transparent"
                            }`}
                          />
                          <span className="text-lg leading-none">{s.team.flag}</span>
                          <span className="font-semibold text-foreground">{s.team.name}</span>
                        </div>
                      </td>
                      <td className="px-1.5 py-2.5 text-center tabular-nums text-muted-foreground">
                        {s.played}
                      </td>
                      <td className="px-1.5 py-2.5 text-center tabular-nums text-muted-foreground">
                        {s.gd > 0 ? `+${s.gd}` : s.gd}
                      </td>
                      <td className="px-3 py-2.5 text-center text-base font-extrabold tabular-nums text-foreground">
                        {s.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Standings;

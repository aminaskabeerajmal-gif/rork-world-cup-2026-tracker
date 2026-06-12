import { BRACKET } from "@/data/tournament";

const Bracket = () => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Knockout Stage</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Bracket</h1>
        <p className="text-sm text-muted-foreground">
          The road to the final in MetLife Stadium, July 19.
        </p>
      </header>

      <div className="space-y-7">
        {BRACKET.map((round) => (
          <section key={round.round} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold uppercase tracking-wider text-primary">
                {round.round}
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground">
                {round.matches.length} {round.matches.length === 1 ? "match" : "matches"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {round.matches.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                >
                  <Side flag={m.homeFlag} label={m.homeLabel} />
                  <div className="my-2 flex items-center gap-2">
                    <span className="h-px flex-1 bg-border/60" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      vs
                    </span>
                    <span className="h-px flex-1 bg-border/60" />
                  </div>
                  <Side flag={m.awayFlag} label={m.awayLabel} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

function Side({ flag, label }: { flag?: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-base">
        {flag ?? "•"}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
}

export default Bracket;

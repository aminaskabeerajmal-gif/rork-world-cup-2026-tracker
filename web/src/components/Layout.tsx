import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, ListOrdered, Trophy, Users, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Matches", icon: CalendarDays, end: true },
  { to: "/standings", label: "Standings", icon: ListOrdered, end: false },
  { to: "/golden-boot", label: "Golden Boot", icon: Trophy, end: false },
  { to: "/teams", label: "Teams", icon: Users, end: false },
  { to: "/bracket", label: "Bracket", icon: GitFork, end: false },
];

const Layout = () => {
  return (
    <div className="min-h-screen bg-pitch">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg shadow-sm shadow-primary/30">
              ⚽
            </span>
            <div className="leading-none">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                World Cup 2026
              </p>
              <p className="text-base font-extrabold tracking-tight text-foreground">FootballTracker</p>
            </div>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around px-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;

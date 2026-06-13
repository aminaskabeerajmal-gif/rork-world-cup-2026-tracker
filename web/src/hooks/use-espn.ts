import { useCallback, useEffect, useRef, useState } from "react";
import { FORWARD_PLAYERS, MATCHES, type GoalEvent, type Match } from "@/data/tournament";
import { applyEspnData, fetchRecentEspnScoreboards, type EspnMatchData } from "@/services/espn";

const POLL_INTERVAL = 60_000;

/** Hook that polls ESPN for live scores and returns merged match data. */
export function useEspnLive() {
  const [espnData, setEspnData] = useState<EspnMatchData[]>([]);
  const [espnLive, setEspnLive] = useState(false);
  const [espnAutoGoals, setEspnAutoGoals] = useState<Record<string, GoalEvent[]>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchRecentEspnScoreboards();
        if (data.length > 0) setEspnLive(true);
        setEspnData(data);
      } catch {
        // silent
      }
    };

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchRecentEspnScoreboards();
      if (data.length > 0) setEspnLive(true);
      setEspnData(data);
      setEspnAutoGoals({});
    } catch {
      // silent
    }
  }, []);

  // Auto-assign goal scorers when ESPN reports score increases
  useEffect(() => {
    if (espnData.length === 0) return;

    setEspnAutoGoals((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const espn of espnData) {
        const baseMatch = MATCHES.find(
          (m) => m.homeId === espn.homeId && m.awayId === espn.awayId,
        );
        if (!baseMatch) continue;

        if (espn.status !== "live" && espn.status !== "finished") continue;

        const existingAuto = prev[baseMatch.id] ?? [];
        const baseGoals = baseMatch.goals ?? [];
        const allExisting = [...baseGoals, ...existingAuto];

        const homeGoals = allExisting.filter((g) => g.side === "home").length;
        const awayGoals = allExisting.filter((g) => g.side === "away").length;

        const neededHome = Math.max(0, espn.homeScore - homeGoals);
        const neededAway = Math.max(0, espn.awayScore - awayGoals);

        if (neededHome === 0 && neededAway === 0) continue;

        const newGoals = [...existingAuto];
        const homePlayers = FORWARD_PLAYERS[espn.homeId] ?? [];
        for (let i = 0; i < neededHome; i++) {
          const idx = homeGoals + i;
          newGoals.push({
            id: `${baseMatch.id}_espn_h_${idx}`,
            matchId: baseMatch.id,
            teamId: espn.homeId,
            playerName: homePlayers[idx % (homePlayers.length || 1)] ?? "Goal Scorer",
            minute: espn.minute ?? 0,
            side: "home" as const,
          });
        }

        const awayPlayers = FORWARD_PLAYERS[espn.awayId] ?? [];
        for (let i = 0; i < neededAway; i++) {
          const idx = awayGoals + i;
          newGoals.push({
            id: `${baseMatch.id}_espn_a_${idx}`,
            matchId: baseMatch.id,
            teamId: espn.awayId,
            playerName: awayPlayers[idx % (awayPlayers.length || 1)] ?? "Goal Scorer",
            minute: espn.minute ?? 0,
            side: "away" as const,
          });
        }

        next[baseMatch.id] = newGoals;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [espnData]);

  const matches = (() => {
    const lookup = new Map<string, EspnMatchData>();
    for (const e of espnData) {
      lookup.set(`${e.homeId}::${e.awayId}`, e);
    }

    return MATCHES.map((m) => {
      const espnKey = `${m.homeId}::${m.awayId}`;
      const espnMatch = lookup.get(espnKey);
      const espnApplied = applyEspnData(m, espnMatch);

      // Merge in auto-assigned goal scorers
      const autoGoals = espnAutoGoals[m.id];
      if (autoGoals && autoGoals.length > 0) {
        const baseGoals = m.goals ?? [];
        const mergedGoals = [...baseGoals];
        for (const ag of autoGoals) {
          if (!mergedGoals.some((g) => g.id === ag.id)) {
            mergedGoals.push(ag);
          }
        }
        return { ...espnApplied, goals: mergedGoals };
      }

      return espnApplied;
    });
  })();

  return { matches, espnLive, refresh, espnAutoGoals };
}

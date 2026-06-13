import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FORWARD_PLAYERS, GoalEvent, MATCHES, Match, MatchStatus } from "@/constants/tournament";
import { applyEspnData, fetchRecentEspnScoreboards, type EspnMatchData } from "@/services/espn";

const STORAGE_KEY = "wc26.liveMatches";

type MatchOverride = {
  id: string;
  status?: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  goals?: GoalEvent[];
};

type OverridesMap = Record<string, MatchOverride>;

function loadOverrides(): Promise<OverridesMap> {
  return AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => (raw ? JSON.parse(raw) : {}))
    .catch(() => ({} as OverridesMap));
}

async function saveOverrides(map: OverridesMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore write failures
  }
}

let nextGoalId = 1;

const ESPN_POLL_INTERVAL = 60_000; // 60 seconds

export const [LiveMatchProvider, useLiveMatch] = createContextHook(() => {
  const [overrides, setOverrides] = useState<OverridesMap>({});
  const [espnData, setEspnData] = useState<EspnMatchData[]>([]);
  const [espnLive, setEspnLive] = useState(false);
  const [espnAutoGoals, setEspnAutoGoals] = useState<Record<string, GoalEvent[]>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useQuery({
    queryKey: ["liveMatches"],
    queryFn: async () => {
      const data = await loadOverrides();
      setOverrides(data);
      return data;
    },
  });

  // Poll ESPN for live scores
  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchRecentEspnScoreboards();
        if (data.length > 0) {
          setEspnLive(true);
        }
        setEspnData(data);
      } catch {
        // ESPN fetch failed silently — keep existing data
      }
    };

    poll(); // initial fetch
    pollRef.current = setInterval(poll, ESPN_POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /** Build ESPN lookup by team pair. */
  const espnLookup = useMemo(() => {
    const map = new Map<string, EspnMatchData>();
    for (const e of espnData) {
      const key = `${e.homeId}::${e.awayId}`;
      map.set(key, e);
    }
    return map;
  }, [espnData]);

  /** Auto-assign goal scorers when ESPN reports score increases. */
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
        if (overrides[baseMatch.id] && (
          overrides[baseMatch.id].status !== undefined ||
          overrides[baseMatch.id].homeScore !== undefined ||
          overrides[baseMatch.id].awayScore !== undefined
        )) continue;

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
  }, [espnData, overrides]);

  /** Merge base MATCHES with persisted overrides, ESPN live data, and auto-goals. */
  const mergedMatches = useMemo<Match[]>(() => {
    return MATCHES.map((m) => {
      const ov = overrides[m.id];
      const hasManual = ov && (
        ov.status !== undefined ||
        ov.homeScore !== undefined ||
        ov.awayScore !== undefined
      );

      // Apply manual overrides first
      const withManual: Match = ov
        ? {
            ...m,
            goals: ov.goals ?? m.goals ?? [],
            status: ov.status ?? m.status,
            homeScore: ov.homeScore !== undefined ? ov.homeScore : m.homeScore,
            awayScore: ov.awayScore !== undefined ? ov.awayScore : m.awayScore,
            minute: ov.minute !== undefined ? ov.minute : m.minute,
          }
        : { ...m, goals: m.goals ?? [] };

      // If user manually touched this match, don't override with ESPN
      if (hasManual) return withManual;

      // Otherwise, apply ESPN live data
      const espnKey = `${m.homeId}::${m.awayId}`;
      const espnMatch = espnLookup.get(espnKey);
      const espnApplied = applyEspnData(withManual, espnMatch);

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
  }, [overrides, espnLookup, espnAutoGoals]);

  const getMatch = useCallback(
    (id: string): Match | undefined => mergedMatches.find((m) => m.id === id),
    [mergedMatches],
  );

  const updateMatch = useCallback(
    async (id: string, patch: Partial<Omit<MatchOverride, "id" | "goals">>) => {
      const next = {
        ...overrides,
        [id]: { ...overrides[id], ...patch },
      };
      setOverrides(next);
      await saveOverrides(next);
    },
    [overrides],
  );

  const setLive = useCallback(
    async (id: string) => {
      const match = MATCHES.find((m) => m.id === id);
      if (!match) return;
      await updateMatch(id, {
        status: "live",
        minute: 0,
        homeScore: 0,
        awayScore: 0,
      });
    },
    [updateMatch],
  );

  const endLive = useCallback(
    async (id: string) => {
      await updateMatch(id, { status: "finished" });
    },
    [updateMatch],
  );

  const updateMinute = useCallback(
    async (id: string, minute: number) => {
      await updateMatch(id, { minute });
    },
    [updateMatch],
  );

  const updateScore = useCallback(
    async (id: string, homeScore: number, awayScore: number) => {
      await updateMatch(id, { homeScore, awayScore });
    },
    [updateMatch],
  );

  const addGoal = useCallback(
    async (matchId: string, goal: Omit<GoalEvent, "id" | "matchId">) => {
      const existing = overrides[matchId];
      const currentGoals = existing?.goals ?? [];
      const g: GoalEvent = {
        id: `g_${Date.now()}_${nextGoalId++}`,
        matchId,
        ...goal,
      };
      const nextGoals = [...currentGoals, g].sort((a, b) => a.minute - b.minute);
      const match = MATCHES.find((m) => m.id === matchId);
      if (!match) return;

      // Auto-update score based on goals
      const homeGoals = nextGoals.filter((g2) => g2.side === "home").length;
      const awayGoals = nextGoals.filter((g2) => g2.side === "away").length;

      const next = {
        ...overrides,
        [matchId]: {
          ...existing,
          goals: nextGoals,
          homeScore: homeGoals,
          awayScore: awayGoals,
        },
      };
      setOverrides(next);
      await saveOverrides(next);
    },
    [overrides],
  );

  const removeGoal = useCallback(
    async (matchId: string, goalId: string) => {
      const existing = overrides[matchId];
      const currentGoals = existing?.goals ?? [];
      const nextGoals = currentGoals.filter((g) => g.id !== goalId);

      const homeGoals = nextGoals.filter((g2) => g2.side === "home").length;
      const awayGoals = nextGoals.filter((g2) => g2.side === "away").length;

      const next = {
        ...overrides,
        [matchId]: {
          ...existing,
          goals: nextGoals,
          homeScore: homeGoals,
          awayScore: awayGoals,
        },
      };
      setOverrides(next);
      await saveOverrides(next);
    },
    [overrides],
  );

  const resetAll = useCallback(async () => {
    setOverrides({});
    setEspnAutoGoals({});
    await saveOverrides({});
  }, []);

  return useMemo(
    () => ({
      matches: mergedMatches,
      espnLive,
      getMatch,
      setLive,
      endLive,
      updateMinute,
      updateScore,
      addGoal,
      removeGoal,
      resetAll,
    }),
    [mergedMatches, espnLive, getMatch, setLive, endLive, updateMinute, updateScore, addGoal, removeGoal, resetAll],
  );
});

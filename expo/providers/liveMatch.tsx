import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { GoalEvent, MATCHES, Match, MatchStatus } from "@/constants/tournament";

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

export const [LiveMatchProvider, useLiveMatch] = createContextHook(() => {
  const [overrides, setOverrides] = useState<OverridesMap>({});

  useQuery({
    queryKey: ["liveMatches"],
    queryFn: async () => {
      const data = await loadOverrides();
      setOverrides(data);
      return data;
    },
  });

  /** Merge base MATCHES with persisted overrides. */
  const mergedMatches = useMemo<Match[]>(() => {
    return MATCHES.map((m) => {
      const ov = overrides[m.id];
      if (!ov) return { ...m, goals: m.goals ?? [] };
      return {
        ...m,
        goals: ov.goals ?? m.goals ?? [],
        status: ov.status ?? m.status,
        homeScore: ov.homeScore !== undefined ? ov.homeScore : m.homeScore,
        awayScore: ov.awayScore !== undefined ? ov.awayScore : m.awayScore,
        minute: ov.minute !== undefined ? ov.minute : m.minute,
      };
    });
  }, [overrides]);

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

  return useMemo(
    () => ({
      matches: mergedMatches,
      getMatch,
      setLive,
      endLive,
      updateMinute,
      updateScore,
      addGoal,
      removeGoal,
    }),
    [mergedMatches, getMatch, setLive, endLive, updateMinute, updateScore, addGoal, removeGoal],
  );
});

import { router } from "expo-router";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { getTeam, GoalEvent, GROUPS, Match } from "@/constants/tournament";
import LivePulse from "@/components/LivePulse";

function formatTime(iso: string, tz: string, label: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleString("en-US", { weekday: "short", timeZone: tz });
  const month = d.toLocaleString("en-US", { month: "short", timeZone: tz });
  const day = d.toLocaleString("en-US", { day: "numeric", timeZone: tz });
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  });
  return `${weekday}, ${month} ${day} · ${time} ${label}`;
}

function formatKickoff(iso: string): { et: string; ist: string } {
  return {
    et: formatTime(iso, "America/New_York", "ET"),
    ist: formatTime(iso, "Asia/Kolkata", "IST"),
  };
}

function useCountdown(targetISO: string): string {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const diff = new Date(targetISO).getTime() - now;
  if (diff <= 0) return "Starting soon";
  const totalMin = Math.floor(diff / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

type ScorerSummary = {
  playerName: string;
  teamId: string;
  count: number;
  side: "home" | "away";
  minutes: number[];
};

function groupGoals(goals: GoalEvent[], side: "home" | "away"): ScorerSummary[] {
  const map = new Map<string, ScorerSummary>();
  goals
    .filter((g) => g.side === side)
    .forEach((g) => {
      const key = `${g.playerName}__${g.teamId}`;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
        existing.minutes.push(g.minute);
      } else {
        map.set(key, { playerName: g.playerName, teamId: g.teamId, count: 1, side: g.side, minutes: [g.minute] });
      }
    });
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.playerName.localeCompare(b.playerName));
}

function useLiveMinute(kickoffISO: string, isLive: boolean): number | null {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!isLive) return;
    const start = new Date(kickoffISO).getTime();
    const tick = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [kickoffISO, isLive]);

  return isLive ? Math.floor(elapsed / 60) : null;
}

function MatchCardBase({ match }: { match: Match }) {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  if (!home || !away) return null;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isUpcoming = match.status === "upcoming";
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const hasGoals = isFinished && match.goals.length > 0;

  const homeWin = hasScore && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWin = hasScore && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  const countdown = useCountdown(isUpcoming ? match.kickoff : new Date().toISOString());

  const liveMinute = useLiveMinute(match.kickoff, isLive);

  const homeScorers = useMemo(() => (hasGoals ? groupGoals(match.goals, "home") : []), [match.goals, hasGoals]);
  const awayScorers = useMemo(() => (hasGoals ? groupGoals(match.goals, "away") : []), [match.goals, hasGoals]);

  const handlePress = () => {
    router.push(`/live/${match.id}`);
  };

  return (
    <Pressable
      style={[styles.card, isLive && styles.cardLive]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.groupTag}>
          <Text style={styles.groupTagText}>
            {GROUPS.includes(match.group) ? `GROUP ${match.group}` : match.group}
          </Text>
        </View>
        {isLive ? (
          <View style={styles.liveBadge}>
            <LivePulse />
            <Text style={styles.liveText}>{liveMinute ?? match.minute ?? 0}'</Text>
          </View>
        ) : isFinished ? (
          <Text style={styles.statusText}>FULL TIME</Text>
        ) : (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingText}>{countdown}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={[styles.side, styles.sideColumn]}>
          <View style={styles.teamRow}>
            <Text style={styles.flag}>{home.flag}</Text>
            <Text style={[styles.team, homeWin && styles.teamWin]} numberOfLines={1}>
              {home.name}
            </Text>
          </View>
          {hasGoals && homeScorers.length > 0 && (
            <View style={styles.scorersInline}>
              {homeScorers.map((s) => (
                <View key={`h_${s.teamId}_${s.playerName}`} style={styles.scorerInlineRow}>
                  <Text style={styles.scorerInlineName} numberOfLines={1}>{s.playerName}</Text>
                  {s.minutes.length === 1 ? (
                    <Text style={styles.scorerMinute}>{s.minutes[0]}&apos;</Text>
                  ) : (
                    <Text style={styles.scorerMinute}>{s.minutes.join("&apos;, ")}&apos;</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.scoreBox}>
          {hasScore ? (
            <Text style={[styles.score, isLive && styles.scoreLive]}>
              {match.homeScore}
              <Text style={styles.scoreDash}>  -  </Text>
              {match.awayScore}
            </Text>
          ) : (
            <Text style={styles.vs}>VS</Text>
          )}
        </View>

        <View style={[styles.side, styles.sideColumn, styles.sideRight]}>
          <View style={[styles.teamRow, styles.teamRowRight]}>
            <Text style={[styles.team, styles.teamRight, awayWin && styles.teamWin]} numberOfLines={1}>
              {away.name}
            </Text>
            <Text style={styles.flag}>{away.flag}</Text>
          </View>
          {hasGoals && awayScorers.length > 0 && (
            <View style={[styles.scorersInline, styles.scorersInlineRight]}>
              {awayScorers.map((s) => (
                <View key={`a_${s.teamId}_${s.playerName}`} style={[styles.scorerInlineRow, styles.scorerInlineRowRight]}>
                  {s.minutes.length === 1 ? (
                    <Text style={styles.scorerMinute}>{s.minutes[0]}&apos;</Text>
                  ) : (
                    <Text style={styles.scorerMinute}>{s.minutes.join("&apos;, ")}&apos;</Text>
                  )}
                  <Text style={styles.scorerInlineName} numberOfLines={1}>{s.playerName}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.dateTime} numberOfLines={1}>
            {formatKickoff(match.kickoff).et}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.dateTimeIst} numberOfLines={1}>
            {formatKickoff(match.kickoff).ist}
          </Text>
        </View>
        <Text style={styles.venue} numberOfLines={1}>
          {match.venue} · {match.city}
        </Text>

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLive: {
    borderColor: "rgba(224,36,75,0.45)",
    backgroundColor: "#FFF5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  groupTag: {
    backgroundColor: Colors.cardAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  groupTagText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveText: {
    color: Colors.live,
    fontSize: 12,
    fontWeight: "900",
  },
  upcomingBadge: {
    backgroundColor: Colors.greenDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingText: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: "800",
  },
  statusText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sideRight: {
    justifyContent: "flex-end",
  },
  flag: {
    fontSize: 30,
  },
  team: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  teamRight: {
    textAlign: "right",
  },
  teamWin: {
    color: Colors.gold,
  },
  scoreBox: {
    minWidth: 92,
    alignItems: "center",
  },
  score: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: "900",
  },
  scoreLive: {
    color: Colors.live,
  },
  scoreDash: {
    color: Colors.textDim,
    fontSize: 20,
  },
  vs: {
    color: Colors.textDim,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sideColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  teamRowRight: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  scorersInline: {
    marginTop: 2,
    gap: 3,
  },
  scorersInlineRight: {
    alignItems: "flex-end",
  },
  scorerInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  scorerInlineRowRight: {
    justifyContent: "flex-end",
  },
  scorerInlineName: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
  scorerMinute: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "600",
  },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerRow: {
    marginBottom: 2,
  },
  dateTime: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  dateTimeIst: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "600",
  },
  venue: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "600",
  },

});

export default memo(MatchCardBase);

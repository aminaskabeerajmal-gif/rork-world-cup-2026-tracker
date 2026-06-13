import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshCw } from "lucide-react-native";

import Colors from "@/constants/colors";
import { computeGoldenBoot, getTeam, PAST_GOLDEN_BOOT_WINNERS } from "@/constants/tournament";
import { useLiveMatch } from "@/providers/liveMatch";

export default function GoldenBootScreen() {
  const { matches, resetAll } = useLiveMatch();

  const standings = useMemo(() => computeGoldenBoot(matches), [matches]);

  const hasAnyGoals = useMemo(() => standings.some((e) => e.goals > 0), [standings]);

  const leaders = useMemo(() => {
    if (standings.length === 0 || standings[0].goals === 0) return [];
    const top = standings[0].goals;
    return standings.filter((e) => e.goals === top);
  }, [standings]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>GOLDEN BOOT RACE</Text>
            <Text style={styles.title}>Top Scorers</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => resetAll()}
            style={styles.refreshBtn}
          >
            <RefreshCw size={18} color={Colors.textMuted} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.leaderCard}>
        {leaders.length === 0 ? (
          <View style={styles.leaderEmpty}>
            <Text style={styles.bootEmoji}>👟</Text>
            <Text style={styles.leaderEmptyTitle}>No goals yet</Text>
            <Text style={styles.leaderEmptySub}>
              Forwards from all 48 teams are in the race. Goals will appear as matches are played.
            </Text>
          </View>
        ) : leaders.length === 1 ? (
          <>
            <Text style={styles.leaderLabel}>LEADER</Text>
            <Text style={styles.leaderPlayer}>{leaders[0].playerName}</Text>
            <Text style={styles.leaderTeam}>
              {getTeam(leaders[0].teamId)?.flag} {getTeam(leaders[0].teamId)?.name}
            </Text>
            <View style={styles.leaderGoalBadge}>
              <Text style={styles.leaderGoalCount}>{leaders[0].goals}</Text>
              <Text style={styles.leaderGoalLabel}>
                {leaders[0].goals === 1 ? "goal" : "goals"}
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.leaderLabel}>JOINT LEADERS</Text>
            <View style={styles.leaderMulti}>
              {leaders.map((l, i) => (
                <View key={i} style={styles.leaderItem}>
                  <Text style={styles.leaderPlayerSmall}>{l.playerName}</Text>
                  <Text style={styles.leaderTeamSmall}>
                    {getTeam(l.teamId)?.flag}
                  </Text>
                  <View style={styles.leaderGoalBadgeSmall}>
                    <Text style={styles.leaderGoalCountSmall}>{l.goals}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* ── Past Winners ── */}
      <Text style={styles.sectionTitle}>PAST WINNERS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pastWinnersList}
      >
        {PAST_GOLDEN_BOOT_WINNERS.map((w) => {
          const team = getTeam(w.teamId);
          return (
            <View key={`${w.year}-${w.playerName}`} style={styles.pastCard}>
              <View style={styles.pastCardTop}>
                <Text style={styles.pastYear}>{w.year}</Text>
                <Text style={styles.pastHost}>{w.host}</Text>
              </View>
              <Text style={styles.pastPlayer} numberOfLines={1}>
                {w.playerName}
              </Text>
              <View style={styles.pastCardBottom}>
                <Text style={styles.pastFlag}>{team?.flag ?? "⚽"}</Text>
                <View style={styles.pastGoalPill}>
                  <Text style={styles.pastGoalCount}>{w.goals}</Text>
                  <Text style={styles.pastGoalLabel}>goals</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>FULL RANKINGS</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {standings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No players in the race.</Text>
          </View>
        ) : (
          standings.map((entry, index) => {
            const team = getTeam(entry.teamId);
            const rankBg =
              index === 0
                ? Colors.gold
                : index === 1
                  ? "#C0C0C0"
                  : index === 2
                    ? "#CD7F32"
                    : Colors.bgElevated;

            const rankColor =
              index < 3 ? "#FFF" : Colors.textMuted;

            return (
              <View key={entry.teamId + entry.playerName} style={styles.row}>
                <View style={[styles.rankBadge, { backgroundColor: rankBg }]}>
                  <Text style={[styles.rankText, { color: rankColor }]}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.playerInfo}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {entry.playerName}
                  </Text>
                  <Text style={styles.teamName}>
                    {team?.flag} {team?.name ?? entry.teamId}
                  </Text>
                </View>

                <View style={styles.goalCol}>
                  <Text style={styles.goalCount}>{entry.goals}</Text>
                  <Text style={styles.goalLabel}>
                    {entry.goals === 1 ? "goal" : "goals"}
                  </Text>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  kicker: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 2,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  leaderCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.goldDim,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  leaderLabel: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },
  leaderPlayer: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  leaderTeam: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  leaderGoalBadge: {
    marginTop: 16,
    backgroundColor: Colors.goldDim,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  leaderGoalCount: {
    color: Colors.gold,
    fontSize: 36,
    fontWeight: "900",
  },
  leaderGoalLabel: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "700",
    marginTop: -2,
  },
  leaderMulti: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginTop: 4,
  },
  leaderItem: {
    alignItems: "center",
    gap: 6,
  },
  leaderPlayerSmall: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  leaderTeamSmall: {
    fontSize: 20,
  },
  leaderGoalBadgeSmall: {
    backgroundColor: Colors.goldDim,
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  leaderGoalCountSmall: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: "900",
  },
  leaderEmpty: {
    alignItems: "center",
    gap: 8,
  },
  bootEmoji: {
    fontSize: 48,
  },
  leaderEmptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  leaderEmptySub: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 15,
    fontWeight: "900",
  },
  playerInfo: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  teamName: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  goalCol: {
    alignItems: "center",
    minWidth: 44,
  },
  goalCount: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  goalLabel: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    marginTop: -2,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  // ── Past Winners ──
  pastWinnersList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pastCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 150,
    justifyContent: "space-between",
  },
  pastCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  pastYear: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: "900",
  },
  pastHost: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "700",
  },
  pastPlayer: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  pastCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pastFlag: {
    fontSize: 22,
  },
  pastGoalPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  pastGoalCount: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  pastGoalLabel: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "700",
  },
});

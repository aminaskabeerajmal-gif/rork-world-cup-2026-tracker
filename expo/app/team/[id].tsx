import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronLeft, Star } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import {
  computeStandings,
  getTeam,
  MATCHES,
  Match,
} from "@/constants/tournament";
import { useFavorites } from "@/providers/favorites";

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavorite, toggle } = useFavorites();
  const team = getTeam(id ?? "");

  const standing = useMemo(() => {
    if (!team) return undefined;
    return computeStandings(team.group).find((s) => s.team.id === team.id);
  }, [team]);

  const position = useMemo(() => {
    if (!team) return 0;
    return computeStandings(team.group).findIndex((s) => s.team.id === team.id) + 1;
  }, [team]);

  const matches = useMemo<Match[]>(() => {
    if (!team) return [];
    return MATCHES.filter((m) => m.homeId === team.id || m.awayId === team.id).sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
    );
  }, [team]);

  if (!team) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Team not found.</Text>
      </SafeAreaView>
    );
  }

  const fav = isFavorite(team.id);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <ChevronLeft color={Colors.text} size={26} strokeWidth={2.6} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggle(team.id)} hitSlop={10} style={styles.favBtn}>
            <Star
              size={22}
              color={fav ? Colors.gold : Colors.textMuted}
              fill={fav ? Colors.gold : "transparent"}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.heroFlag}>{team.flag}</Text>
            <Text style={styles.heroName}>{team.name}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>GROUP {team.group}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{team.confederation}</Text>
              </View>
              <View style={[styles.metaPill, styles.metaPillGreen]}>
                <Text style={[styles.metaPillText, styles.metaPillTextGreen]}>
                  FIFA #{team.fifaRank}
                </Text>
              </View>
            </View>
          </View>

          {standing && (
            <View style={styles.statsCard}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{position}</Text>
                <Text style={styles.statLabel}>POSITION</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{standing.points}</Text>
                <Text style={styles.statLabel}>POINTS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{standing.played}</Text>
                <Text style={styles.statLabel}>PLAYED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {standing.gd > 0 ? `+${standing.gd}` : standing.gd}
                </Text>
                <Text style={styles.statLabel}>GOAL DIFF</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>FIXTURES</Text>
          <View style={styles.fixtures}>
            {matches.map((m) => {
              const opponentId = m.homeId === team.id ? m.awayId : m.homeId;
              const opponent = getTeam(opponentId);
              const isHome = m.homeId === team.id;
              const hasScore = m.homeScore !== null && m.awayScore !== null;
              const myScore = isHome ? m.homeScore : m.awayScore;
              const oppScore = isHome ? m.awayScore : m.homeScore;
              let resultColor = Colors.textMuted;
              let resultLabel = "—";
              if (hasScore && myScore !== null && oppScore !== null) {
                if (myScore > oppScore) {
                  resultColor = Colors.green;
                  resultLabel = "W";
                } else if (myScore < oppScore) {
                  resultColor = Colors.red;
                  resultLabel = "L";
                } else {
                  resultColor = Colors.gold;
                  resultLabel = "D";
                }
              }
              return (
                <View key={m.id} style={styles.fixture}>
                  <View style={[styles.resultBadge, { borderColor: resultColor }]}>
                    {m.status === "upcoming" ? (
                      <Text style={[styles.resultText, { color: Colors.textDim }]}>vs</Text>
                    ) : (
                      <Text style={[styles.resultText, { color: resultColor }]}>{resultLabel}</Text>
                    )}
                  </View>
                  <View style={styles.fixtureMid}>
                    <View style={styles.fixtureTeamRow}>
                      <Text style={styles.fixtureFlag}>{opponent?.flag}</Text>
                      <Text style={styles.fixtureOpponent} numberOfLines={1}>
                        {isHome ? "vs" : "@"} {opponent?.name}
                      </Text>
                    </View>
                    <Text style={styles.fixtureWhen}>{formatKickoff(m.kickoff)}</Text>
                  </View>
                  {hasScore ? (
                    <Text style={styles.fixtureScore}>
                      {myScore}-{oppScore}
                    </Text>
                  ) : (
                    <Text style={styles.fixtureKick}>{m.status === "live" ? `${m.minute}'` : ""}</Text>
                  )}
                </View>
              );
            })}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1, backgroundColor: Colors.bg },
  missing: { color: Colors.text, textAlign: "center", marginTop: 80, fontSize: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  backBtn: { padding: 4 },
  favBtn: { padding: 4 },
  content: { paddingHorizontal: 20 },
  hero: { alignItems: "center", paddingTop: 12, paddingBottom: 24 },
  heroFlag: { fontSize: 72 },
  heroName: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 10,
  },
  heroMeta: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" },
  metaPill: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaPillGreen: { backgroundColor: Colors.greenDim, borderColor: "transparent" },
  metaPillText: { color: Colors.textMuted, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  metaPillTextGreen: { color: Colors.green },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { color: Colors.text, fontSize: 22, fontWeight: "900" },
  statLabel: { color: Colors.textDim, fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 26,
    marginBottom: 12,
  },
  fixtures: { gap: 10 },
  fixture: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: { fontSize: 14, fontWeight: "900" },
  fixtureMid: { flex: 1, gap: 3 },
  fixtureTeamRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  fixtureFlag: { fontSize: 20 },
  fixtureOpponent: { color: Colors.text, fontSize: 15, fontWeight: "700", flexShrink: 1 },
  fixtureWhen: { color: Colors.textDim, fontSize: 12, fontWeight: "600" },
  fixtureScore: { color: Colors.text, fontSize: 18, fontWeight: "900" },
  fixtureKick: { color: Colors.live, fontSize: 14, fontWeight: "800" },
});

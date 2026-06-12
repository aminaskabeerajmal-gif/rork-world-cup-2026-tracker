import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { computeStandings, GROUPS } from "@/constants/tournament";

export default function StandingsScreen() {
  const [group, setGroup] = useState<string>("A");
  const router = useRouter();
  const standings = computeStandings(group);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>GROUP STAGE</Text>
        <Text style={styles.title}>Standings</Text>
      </View>

      <View style={styles.groupSelectorWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupSelector}
        >
          {GROUPS.map((g) => {
            const active = g === group;
            return (
              <TouchableOpacity
                key={g}
                activeOpacity={0.8}
                onPress={() => setGroup(g)}
                style={[styles.groupPill, active && styles.groupPillActive]}
              >
                <Text style={[styles.groupPillText, active && styles.groupPillTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.hCell, styles.posCol]}>#</Text>
            <Text style={[styles.hCell, styles.teamCol]}>TEAM</Text>
            <Text style={[styles.hCell, styles.statCol]}>P</Text>
            <Text style={[styles.hCell, styles.statCol]}>GD</Text>
            <Text style={[styles.hCell, styles.statCol, styles.ptsCol]}>PTS</Text>
          </View>

          {standings.map((s, i) => {
            const qualifies = i < 2;
            return (
              <TouchableOpacity
                key={s.team.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/team/${s.team.id}`)}
                style={[styles.row, i === standings.length - 1 && styles.rowLast]}
              >
                <View style={[styles.posWrap, styles.posCol]}>
                  <View style={[styles.posBar, qualifies && styles.posBarQ]} />
                  <Text style={styles.pos}>{i + 1}</Text>
                </View>
                <View style={[styles.teamCell, styles.teamCol]}>
                  <Text style={styles.flag}>{s.team.flag}</Text>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {s.team.name}
                  </Text>
                </View>
                <Text style={[styles.cell, styles.statCol]}>{s.played}</Text>
                <Text style={[styles.cell, styles.statCol]}>
                  {s.gd > 0 ? `+${s.gd}` : s.gd}
                </Text>
                <Text style={[styles.cell, styles.statCol, styles.pts]}>{s.points}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
            <Text style={styles.legendText}>Advances to Round of 16</Text>
          </View>
          <Text style={styles.legendNote}>
            Top 2 of each group plus 8 best third-placed teams qualify.
          </Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  kicker: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  groupSelectorWrap: { paddingTop: 16, paddingBottom: 4 },
  groupSelector: { paddingHorizontal: 20, gap: 8 },
  groupPill: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupPillActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  groupPillText: { color: Colors.textMuted, fontSize: 17, fontWeight: "900" },
  groupPillTextActive: { color: "#FFF" },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  table: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.bgElevated,
  },
  hCell: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowLast: {},
  posCol: { width: 38 },
  teamCol: { flex: 1 },
  statCol: { width: 34, textAlign: "center" },
  ptsCol: { width: 40 },
  posWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  posBar: {
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  posBarQ: { backgroundColor: Colors.green },
  pos: { color: Colors.textMuted, fontSize: 14, fontWeight: "800" },
  teamCell: { flexDirection: "row", alignItems: "center", gap: 10 },
  flag: { fontSize: 24 },
  teamName: { color: Colors.text, fontSize: 15, fontWeight: "700", flexShrink: 1 },
  cell: { color: Colors.textMuted, fontSize: 14, fontWeight: "700" },
  pts: { color: Colors.text, fontSize: 16, fontWeight: "900" },
  legend: { marginTop: 18, gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
  legendNote: { color: Colors.textDim, fontSize: 12, fontWeight: "500" },
});

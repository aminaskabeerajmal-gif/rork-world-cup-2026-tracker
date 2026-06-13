import React, { useMemo, useState } from "react";
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
import { Match, MatchStatus } from "@/constants/tournament";
import MatchCard from "@/components/MatchCard";
import LivePulse from "@/components/LivePulse";
import { useLiveMatch } from "@/providers/liveMatch";

type Filter = "all" | "live" | "upcoming" | "finished";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "finished", label: "Results" },
];

export default function MatchesScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const { matches: allMatches, resetAll } = useLiveMatch();

  const liveCount = useMemo(
    () => allMatches.filter((m) => m.status === "live").length,
    [allMatches]
  );

  const matches = useMemo<Match[]>(() => {
    const sorted = [...allMatches].sort((a, b) => {
      const order: Record<MatchStatus, number> = { live: 0, upcoming: 1, finished: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
    });
    if (filter === "all") return sorted;
    return sorted.filter((m) => m.status === filter);
  }, [filter]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>FOOTBALL TRACKER</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>World Cup 2026</Text>
            <View style={styles.hostBadge}>
              <Text style={styles.hostText}>🇨🇦 🇺🇸 🇲🇽</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => resetAll()}
            style={styles.refreshBtn}
          >
            <RefreshCw size={18} color={Colors.textMuted} strokeWidth={2.5} />
          </TouchableOpacity>
          {liveCount > 0 && (
            <View style={styles.liveCounter}>
              <LivePulse />
              <Text style={styles.liveCounterText}>{liveCount} LIVE</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.8}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                {f.key === "live" && <LivePulse size={7} color={active ? "#FFF" : Colors.live} />}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>⚽️</Text>
            <Text style={styles.emptyText}>No matches here right now.</Text>
          </View>
        ) : (
          matches.map((m) => <MatchCard key={m.id} match={m} />)
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  kicker: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  title: {
    color: Colors.text,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
  },
  hostBadge: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hostText: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
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
  },
  liveCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.live + "14",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveCounterText: {
    color: Colors.live,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  chipsWrap: {
    paddingTop: 14,
    paddingBottom: 4,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#FFF",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
});

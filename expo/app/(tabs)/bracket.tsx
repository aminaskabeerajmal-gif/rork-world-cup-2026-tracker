import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { BRACKET, BracketMatch } from "@/constants/tournament";

export default function BracketScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>ROAD TO THE FINAL</Text>
        <Text style={styles.title}>Knockout Bracket</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {BRACKET.map((stage, si) => (
          <View key={stage.round} style={styles.stage}>
            <View style={styles.stageHeaderRow}>
              <View style={[styles.stageDot, si === BRACKET.length - 1 && styles.stageDotFinal]} />
              <Text style={styles.stageTitle}>{stage.round}</Text>
              <View style={styles.stageLine} />
            </View>
            <View style={styles.stageMatches}>
              {stage.matches.map((m) => (
                <BracketCard key={m.id} match={m} isFinal={stage.round === "Final"} />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.trophyCard}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.trophyText}>World Champions 2026</Text>
          <Text style={styles.trophySub}>Lift the trophy at MetLife Stadium · July 19</Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BracketCard({ match, isFinal }: { match: BracketMatch; isFinal: boolean }) {
  return (
    <View style={[styles.card, isFinal && styles.cardFinal]}>
      <View style={styles.cardRow}>
        <Text style={styles.cardFlag}>{match.homeFlag}</Text>
        <Text style={styles.cardLabel} numberOfLines={1}>
          {match.homeLabel}
        </Text>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardRow}>
        <Text style={styles.cardFlag}>{match.awayFlag}</Text>
        <Text style={styles.cardLabel} numberOfLines={1}>
          {match.awayLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8 },
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
    letterSpacing: -0.5,
    marginTop: 2,
  },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  stage: { marginBottom: 26 },
  stageHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  stageDotFinal: { backgroundColor: Colors.gold },
  stageTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  stageLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  stageMatches: { gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardFinal: {
    borderColor: Colors.gold + "80",
    backgroundColor: Colors.goldDim,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardFlag: { fontSize: 24 },
  cardLabel: { color: Colors.text, fontSize: 15, fontWeight: "700", flexShrink: 1 },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  trophyCard: {
    alignItems: "center",
    backgroundColor: Colors.cardAlt,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.gold + "55",
    gap: 6,
  },
  trophyEmoji: { fontSize: 52 },
  trophyText: { color: Colors.gold, fontSize: 18, fontWeight: "900" },
  trophySub: { color: Colors.textMuted, fontSize: 13, fontWeight: "600", textAlign: "center" },
});

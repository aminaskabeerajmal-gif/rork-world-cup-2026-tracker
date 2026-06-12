import { useRouter } from "expo-router";
import { Search, Star } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getTeam, TEAMS } from "@/constants/tournament";
import { useFavorites } from "@/providers/favorites";

export default function TeamsScreen() {
  const router = useRouter();
  const { ids, isFavorite, toggle } = useFavorites();
  const [query, setQuery] = useState<string>("");

  const favoriteTeams = useMemo(
    () => ids.map((id) => getTeam(id)).filter((t): t is NonNullable<typeof t> => !!t),
    [ids]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? TEAMS.filter(
          (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
        )
      : TEAMS;
    return [...list].sort((a, b) => a.fifaRank - b.fifaRank);
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>48 NATIONS</Text>
        <Text style={styles.title}>Teams</Text>
      </View>

      <View style={styles.searchBar}>
        <Search color={Colors.textDim} size={18} strokeWidth={2.4} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search nations"
          placeholderTextColor={Colors.textDim}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {favoriteTeams.length > 0 && query.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Following</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favRow}
            >
              {favoriteTeams.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/team/${t.id}`)}
                  style={styles.favChip}
                >
                  <Text style={styles.favFlag}>{t.flag}</Text>
                  <Text style={styles.favName}>{t.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {query.length > 0 ? "Results" : "By FIFA Ranking"}
        </Text>
        <View style={styles.grid}>
          {filtered.map((t) => {
            const fav = isFavorite(t.id);
            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.85}
                onPress={() => router.push(`/team/${t.id}`)}
                style={styles.teamCard}
              >
                <View style={styles.teamCardTop}>
                  <Text style={styles.teamFlag}>{t.flag}</Text>
                  <TouchableOpacity
                    hitSlop={10}
                    onPress={() => toggle(t.id)}
                    style={styles.starBtn}
                  >
                    <Star
                      size={18}
                      color={fav ? Colors.gold : Colors.textDim}
                      fill={fav ? Colors.gold : "transparent"}
                      strokeWidth={2.4}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.teamCardName} numberOfLines={1}>
                  {t.name}
                </Text>
                <View style={styles.teamCardMeta}>
                  <View style={styles.groupBadge}>
                    <Text style={styles.groupBadgeText}>GRP {t.group}</Text>
                  </View>
                  <Text style={styles.rankText}>#{t.fifaRank}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  section: { marginBottom: 18 },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  favRow: { gap: 10, paddingRight: 8 },
  favChip: {
    alignItems: "center",
    backgroundColor: Colors.cardAlt,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.gold + "50",
  },
  favFlag: { fontSize: 28 },
  favName: { color: Colors.text, fontSize: 12, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  teamCard: {
    width: "47.5%",
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
  teamCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  teamFlag: { fontSize: 34 },
  starBtn: { padding: 2 },
  teamCardName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },
  teamCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  groupBadge: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  groupBadgeText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rankText: { color: Colors.green, fontSize: 13, fontWeight: "900" },
});

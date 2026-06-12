import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock, Goal, Plus, User, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getTeam, GoalEvent } from "@/constants/tournament";
import LivePulse from "@/components/LivePulse";
import { useLiveMatch } from "@/providers/liveMatch";

function fmtTimer(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function useElapsedTimer(kickoffISO: string, isLive: boolean): number {
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

  return elapsed;
}

type GoalForm = {
  side: "home" | "away";
  playerName: string;
  minute: string;
};

export default function LiveSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMatch, matches: allMatches, setLive, endLive, addGoal, removeGoal } = useLiveMatch();

  const match = getMatch(id ?? "");
  const home = match ? getTeam(match.homeId) : undefined;
  const away = match ? getTeam(match.awayId) : undefined;

  const elapsed = useElapsedTimer(match?.kickoff ?? "", match?.status === "live");
  const displayMinute = match?.status === "live" ? Math.floor(elapsed / 60) : (match?.minute ?? 0);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GoalForm>({ side: "home", playerName: "", minute: "" });

  const slide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: showForm ? 0 : 300,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [showForm, slide]);

  const handleStartLive = useCallback(async () => {
    if (!id) return;
    await setLive(id);
  }, [id, setLive]);

  const handleEndLive = useCallback(async () => {
    if (!id) return;
    await endLive(id);
  }, [id, endLive]);

  const openForm = useCallback(
    (side: "home" | "away") => {
      setForm({ side, playerName: "", minute: String(displayMinute) });
      setShowForm(true);
    },
    [displayMinute],
  );

  const selectPlayer = useCallback((playerName: string) => {
    setForm((f) => ({ ...f, playerName }));
  }, []);

  const submitGoal = useCallback(async () => {
    if (!id || !form.playerName.trim()) return;
    const min = parseInt(form.minute, 10);
    if (isNaN(min) || min < 0) return;
    await addGoal(id, {
      teamId: form.side === "home" ? (match?.homeId ?? "") : (match?.awayId ?? ""),
      playerName: form.playerName.trim(),
      minute: min,
      side: form.side,
    });
    setShowForm(false);
  }, [id, form, addGoal, match]);

  const goals = match?.goals ?? [];

  // Build quick-select player suggestions for each team from all known goals
  const { homeScorers, awayScorers } = useMemo(() => {
    const seen = new Set<string>();
    const homeList: string[] = [];
    const awayList: string[] = [];
    const homeId = match?.homeId ?? "";
    const awayId = match?.awayId ?? "";

    // Collect all goals from every match in the tournament for these two teams
    for (const m of allMatches) {
      for (const g of m.goals) {
        const name = g.playerName.trim();
        if (!name) continue;
        if (g.teamId === homeId) {
          if (!seen.has(`home::${name}`)) {
            seen.add(`home::${name}`);
            homeList.push(name);
          }
        } else if (g.teamId === awayId) {
          if (!seen.has(`away::${name}`)) {
            seen.add(`away::${name}`);
            awayList.push(name);
          }
        }
      }
    }

    return { homeScorers: homeList, awayScorers: awayList };
  }, [allMatches, match?.homeId, match?.awayId]);

  if (!match || !home || !away) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Match not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={Colors.text} size={22} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.groupLabel}>GROUP {match.group}</Text>
          <Text style={styles.stageLabel}>{match.stage}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Live pulse bar */}
      {isLive && (
        <View style={styles.liveBar}>
          <LivePulse size={10} />
          <Text style={styles.liveBarText}>LIVE</Text>
        </View>
      )}

      {/* Timer */}
      <View style={styles.timerSection}>
        <View style={styles.timerRow}>
          <Clock color={isLive ? Colors.live : Colors.textDim} size={16} strokeWidth={2.5} />
          <Text style={[styles.timer, isLive && styles.timerLive]}>
            {isLive ? fmtTimer(elapsed) : isFinished ? "FULL TIME" : "NOT STARTED"}
          </Text>
        </View>
        {isLive && (
          <Text style={styles.elapsedLabel}>{displayMinute}' played</Text>
        )}
      </View>

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        <View style={styles.teamCol}>
          <Text style={styles.flagBig}>{home.flag}</Text>
          <Text style={styles.teamName} numberOfLines={1}>{home.name}</Text>
        </View>

        <View style={styles.scoreCol}>
          <Text style={[styles.scoreBig, isLive && styles.scoreLive]}>
            {match.homeScore ?? 0}
          </Text>
          <Text style={styles.scoreDash}>-</Text>
          <Text style={[styles.scoreBig, isLive && styles.scoreLive]}>
            {match.awayScore ?? 0}
          </Text>
        </View>

        <View style={styles.teamCol}>
          <Text style={styles.flagBig}>{away.flag}</Text>
          <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>{away.name}</Text>
        </View>
      </View>

      {/* Venue */}
      <Text style={styles.venue}>
        {match.venue} · {match.city}
      </Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        {!isLive && !isFinished && (
          <Pressable style={styles.startBtn} onPress={handleStartLive}>
            <LivePulse size={9} color="#FFF" />
            <Text style={styles.startBtnText}>START LIVE</Text>
          </Pressable>
        )}
        {isLive && (
          <Pressable style={[styles.startBtn, styles.endBtn]} onPress={handleEndLive}>
            <X color="#FFF" size={16} strokeWidth={3} />
            <Text style={styles.startBtnText}>END MATCH</Text>
          </Pressable>
        )}
      </View>

      {/* Goal timeline */}
      <View style={styles.sectionHeader}>
        <Goal color={Colors.text} size={18} strokeWidth={2.2} />
        <Text style={styles.sectionTitle}>Goals</Text>
      </View>

      <ScrollView
        style={styles.goalList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={goals.length === 0 ? styles.goalListEmpty : styles.goalListContent}
      >
        {goals.length === 0 ? (
          <Text style={styles.noGoals}>No goals recorded yet</Text>
        ) : (
          goals.map((g) => {
            const gTeam = g.side === "home" ? home : away;
            return (
              <View key={g.id} style={styles.goalRow}>
                <View style={styles.goalLeft}>
                  <Text style={styles.goalFlag}>{gTeam.flag}</Text>
                  <View>
                    <Text style={styles.goalPlayer}>{g.playerName}</Text>
                    <Text style={styles.goalTeam}>{gTeam.name}</Text>
                  </View>
                </View>
                <View style={styles.goalRight}>
                  <View style={styles.goalMinBadge}>
                    <Text style={styles.goalMinute}>{g.minute}'</Text>
                  </View>
                  {isLive && (
                    <Pressable
                      onPress={() => removeGoal(match.id, g.id)}
                      style={styles.removeBtn}
                      hitSlop={10}
                    >
                      <X color={Colors.red} size={14} strokeWidth={3} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add goal FABs */}
      {(isLive || (!isLive && goals.length > 0 && isFinished)) && (
        <View style={styles.fabs}>
          <Pressable style={styles.fabHome} onPress={() => openForm("home")}>
            <Text style={styles.fabFlag}>{home.flag}</Text>
            <Plus color="#FFF" size={18} strokeWidth={3} />
          </Pressable>
          <Pressable style={styles.fabAway} onPress={() => openForm("away")}>
            <Plus color="#FFF" size={18} strokeWidth={3} />
            <Text style={styles.fabFlag}>{away.flag}</Text>
          </Pressable>
        </View>
      )}

      {/* Add Goal Modal */}
      <Modal
        visible={showForm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForm(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowForm(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "position" : undefined}
            style={{ width: "100%", alignItems: "center" }}
          >
            <Animated.View
              style={[styles.modalCard, { transform: [{ translateY: slide }] }]}
            >
              <Pressable onPress={() => setShowForm(false)}>
                {/* Stop propagation */}
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add Goal</Text>

                  {/* Side toggle */}
                  <View style={styles.sideToggle}>
                    <Pressable
                      style={[styles.sideBtn, form.side === "home" && styles.sideBtnActive]}
                      onPress={() => setForm((f) => ({ ...f, side: "home" }))}
                    >
                      <Text style={styles.sideFlag}>{home.flag}</Text>
                      <Text style={[styles.sideText, form.side === "home" && styles.sideTextActive]}>
                        {home.name}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.sideBtn, form.side === "away" && styles.sideBtnActive]}
                      onPress={() => setForm((f) => ({ ...f, side: "away" }))}
                    >
                      <Text style={styles.sideFlag}>{away.flag}</Text>
                      <Text style={[styles.sideText, form.side === "away" && styles.sideTextActive]}>
                        {away.name}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Quick-select player chips */}
                  {(() => {
                    const list = form.side === "home" ? homeScorers : awayScorers;
                    if (list.length === 0) return null;
                    const selectedTeam = form.side === "home" ? home : away;
                    return (
                      <View style={styles.quickPickSection}>
                        <View style={styles.quickPickHeader}>
                          <User color={Colors.textMuted} size={13} strokeWidth={2.5} />
                          <Text style={styles.quickPickLabel}>
                            {selectedTeam.name} scorers
                          </Text>
                        </View>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.quickPickChips}
                        >
                          {list.map((name) => {
                            const selected = form.playerName === name;
                            return (
                              <Pressable
                                key={name}
                                style={[styles.quickChip, selected && styles.quickChipSelected]}
                                onPress={() => selectPlayer(name)}
                              >
                                <Text
                                  style={[
                                    styles.quickChipText,
                                    selected && styles.quickChipTextSelected,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {name}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    );
                  })()}

                  {/* Player name */}
                  <Text style={styles.inputLabel}>Player Name</Text>
                  <TextInput
                    style={styles.input}
                    value={form.playerName}
                    onChangeText={(t) => setForm((f) => ({ ...f, playerName: t }))}
                    placeholder="Enter scorer name..."
                    placeholderTextColor={Colors.textDim}
                    autoFocus
                    returnKeyType="next"
                  />

                  {/* Minute */}
                  <Text style={styles.inputLabel}>Minute</Text>
                  <TextInput
                    style={[styles.input, styles.inputSmall]}
                    value={form.minute}
                    onChangeText={(t) => setForm((f) => ({ ...f, minute: t }))}
                    placeholder="0"
                    placeholderTextColor={Colors.textDim}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={submitGoal}
                  />

                  <Pressable
                    style={[styles.submitBtn, !form.playerName.trim() && styles.submitBtnDisabled]}
                    onPress={submitGoal}
                    disabled={!form.playerName.trim()}
                  >
                    <Text style={styles.submitBtnText}>Add Goal</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    color: Colors.tint,
    fontSize: 14,
    fontWeight: "700",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  groupLabel: {
    color: Colors.tint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  stageLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  // Live bar
  liveBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
    backgroundColor: Colors.live + "12",
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  liveBarText: {
    color: Colors.live,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  // Timer
  timerSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timer: {
    color: Colors.textDim,
    fontSize: 28,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  timerLive: {
    color: Colors.live,
  },
  elapsedLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  // Scoreboard
  scoreboard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  teamCol: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  flagBig: {
    fontSize: 52,
  },
  teamName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    numberOfLines: 1,
  },
  teamNameRight: {
    // inherits
  },
  scoreCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  scoreBig: {
    color: Colors.text,
    fontSize: 48,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  scoreLive: {
    color: Colors.live,
  },
  scoreDash: {
    color: Colors.textDim,
    fontSize: 28,
    fontWeight: "600",
  },

  // Venue
  venue: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },

  // Actions
  actions: {
    alignItems: "center",
    paddingBottom: 16,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.live,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  endBtn: {
    backgroundColor: Colors.textMuted,
  },
  startBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // Goal section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
  },

  // Goal list
  goalList: {
    flex: 1,
  },
  goalListEmpty: {
    alignItems: "center",
    paddingTop: 32,
  },
  goalListContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 100,
  },
  noGoals: {
    color: Colors.textDim,
    fontSize: 14,
    fontWeight: "600",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalFlag: {
    fontSize: 26,
  },
  goalPlayer: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  goalTeam: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  goalRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalMinBadge: {
    backgroundColor: Colors.goldDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goalMinute: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.red + "14",
    alignItems: "center",
    justifyContent: "center",
  },

  // FABs
  fabs: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  fabHome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.tint,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  fabAway: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  fabFlag: {
    fontSize: 22,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
  },
  modalContent: {
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },

  // Side toggle
  sideToggle: {
    flexDirection: "row",
    gap: 10,
  },
  sideBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardAlt,
  },
  sideBtnActive: {
    borderColor: Colors.tint,
    backgroundColor: Colors.greenDim,
  },
  sideFlag: {
    fontSize: 22,
  },
  sideText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  sideTextActive: {
    color: Colors.tint,
  },

  // Quick-pick chips
  quickPickSection: {
    gap: 8,
  },
  quickPickHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickPickLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  quickPickChips: {
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickChipSelected: {
    backgroundColor: Colors.tint,
    borderColor: Colors.tint,
  },
  quickChipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  quickChipTextSelected: {
    color: "#FFF",
  },

  // Inputs
  inputLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputSmall: {
    width: 100,
  },

  // Submit
  submitBtn: {
    backgroundColor: Colors.tint,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

/**
 * ESPN public API service for live FIFA World Cup 2026 data (Web).
 *
 * @see https://github.com/pseudo-r/Public-ESPN-API
 */

import type { Match, MatchStatus } from "@/data/tournament";

/** ESPN API scoreboard response types (partial). */
interface EspnTeam {
  id: string;
  abbreviation: string;
  displayName: string;
}

interface EspnCompetitor {
  homeAway: "home" | "away";
  score: string;
  team: EspnTeam;
}

interface EspnStatusType {
  id: string;
  name: string;
  state: "pre" | "in" | "post";
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
}

interface EspnCompetition {
  id: string;
  date: string;
  status: {
    clock: number;
    displayClock: string;
    period: number;
    type: EspnStatusType;
  };
  competitors: EspnCompetitor[];
}

interface EspnEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: EspnCompetition[];
}

interface EspnScoreboardResponse {
  leagues?: Array<{ name: string; abbreviation: string }>;
  day: { date: string };
  events: EspnEvent[];
}

/** Map ESPN team abbreviations to app team IDs. */
const ESPN_TO_APP_TEAM: Record<string, string> = {
  MEX: "mex", RSA: "rsa", KOR: "kor", CZE: "cze",
  CAN: "can", BIH: "bih", QAT: "qat", SUI: "sui",
  BRA: "bra", MAR: "mar", HAI: "hai", SCO: "sco",
  USA: "usa", PAR: "par", AUS: "aus", TUR: "tur",
  GER: "ger", CUW: "cuw", CIV: "civ", ECU: "ecu",
  NED: "ned", JPN: "jpn", SWE: "swe", TUN: "tun",
  BEL: "bel", EGY: "egy", IRN: "irn", NZL: "nzl",
  ESP: "esp", CPV: "cpv", KSA: "ksa", URU: "uru",
  FRA: "fra", SEN: "sen", IRQ: "irq", NOR: "nor",
  ARG: "arg", ALG: "alg", AUT: "aut", JOR: "jor",
  POR: "por", COD: "cod", UZB: "uzb", COL: "col",
  ENG: "eng", CRO: "cro", GHA: "gha", PAN: "pan",
};

function mapEspnAbbreviation(abbr: string): string {
  return ESPN_TO_APP_TEAM[abbr] ?? abbr.toLowerCase();
}

const STATUS_MAP: Record<string, MatchStatus> = {
  STATUS_SCHEDULED: "upcoming",
  STATUS_IN_PROGRESS: "live",
  STATUS_HALFTIME: "live",
  STATUS_FIRST_HALF: "live",
  STATUS_SECOND_HALF: "live",
  STATUS_END_PERIOD: "live",
  STATUS_FULL_TIME: "finished",
  STATUS_FINAL: "finished",
  STATUS_POSTPONED: "upcoming",
  STATUS_CANCELLED: "upcoming",
};

function mapEspnStatus(statusType: EspnStatusType): MatchStatus {
  return STATUS_MAP[statusType.name] ?? "upcoming";
}

function parseMinute(displayClock: string): number | null {
  const match = displayClock.match(/^(\d+)/);
  if (match) {
    const m = Number(match[1]);
    return Number.isNaN(m) ? null : m;
  }
  return null;
}

export interface EspnMatchData {
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute: number | null;
  espnEventId: string;
  date: string;
}

async function fetchEspnScoreboard(dateStr?: string): Promise<EspnMatchData[]> {
  const base =
    "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
  const url = dateStr ? `${base}?dates=${dateStr}` : base;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data: EspnScoreboardResponse = await res.json();
  const results: EspnMatchData[] = [];

  for (const event of data.events ?? []) {
    for (const comp of event.competitions ?? []) {
      const competitors = comp.competitors ?? [];
      if (competitors.length < 2) continue;

      const home = competitors.find((c) => c.homeAway === "home");
      const away = competitors.find((c) => c.homeAway === "away");
      if (!home || !away) continue;

      results.push({
        homeId: mapEspnAbbreviation(home.team.abbreviation),
        awayId: mapEspnAbbreviation(away.team.abbreviation),
        homeScore: Number(home.score) || 0,
        awayScore: Number(away.score) || 0,
        status: mapEspnStatus(comp.status.type),
        minute: parseMinute(comp.status.displayClock),
        espnEventId: event.id,
        date: comp.date,
      });
    }
  }

  return results;
}

function todayEspnDate(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function yesterdayEspnDate(): string {
  const d = new Date(Date.now() - 86400000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function fetchRecentEspnScoreboards(): Promise<EspnMatchData[]> {
  const [today, yesterday] = await Promise.all([
    fetchEspnScoreboard(todayEspnDate()),
    fetchEspnScoreboard(yesterdayEspnDate()),
  ]);

  const seen = new Set<string>();
  const merged: EspnMatchData[] = [];

  for (const m of [...today, ...yesterday]) {
    if (seen.has(m.espnEventId)) continue;
    seen.add(m.espnEventId);
    merged.push(m);
  }

  return merged;
}

export function applyEspnData(
  localMatch: Match,
  espnMatch: EspnMatchData | undefined,
): Match {
  if (!espnMatch) return localMatch;

  const hasManualScores =
    localMatch.status === "live" &&
    localMatch.homeScore !== null &&
    localMatch.awayScore !== null;

  if (espnMatch.status === "finished") {
    return {
      ...localMatch,
      status: "finished",
      homeScore: espnMatch.homeScore,
      awayScore: espnMatch.awayScore,
      minute: null,
    };
  }

  if (espnMatch.status === "live" && !hasManualScores) {
    return {
      ...localMatch,
      status: "live",
      homeScore: espnMatch.homeScore,
      awayScore: espnMatch.awayScore,
      minute: espnMatch.minute ?? localMatch.minute,
    };
  }

  return localMatch;
}

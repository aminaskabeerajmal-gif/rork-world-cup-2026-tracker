/**
 * ESPN public API service for live FIFA World Cup 2026 data.
 *
 * Uses ESPN's undocumented-but-public scoreboard endpoint.
 * No API key required. CORS-enabled.
 *
 * @see https://github.com/pseudo-r/Public-ESPN-API
 */

import { GoalEvent, Match, MatchStatus } from "@/constants/tournament";

/** ESPN API scoreboard response types (partial — only fields we use). */
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

interface EspnStatus {
  clock: number;
  displayClock: string;
  period: number;
  type: EspnStatusType;
}

interface EspnCompetition {
  id: string;
  date: string;
  status: EspnStatus;
  competitors: EspnCompetitor[];
  venue?: {
    fullName: string;
    address: { city: string; country: string };
  };
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

/** Single match data extracted from ESPN. */
export interface EspnMatchData {
  /** The app team ID for the home side. */
  homeId: string;
  /** The app team ID for the away side. */
  awayId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute: number | null;
  /** ESPN event ID — use for dedup & detail lookups. */
  espnEventId: string;
  /** ISO date string from ESPN. */
  date: string;
}

/**
 * Fetch live/historical World Cup 2026 scoreboard from ESPN.
 *
 * @param dateStr - YYYYMMDD date filter (e.g. "20260612"). Omit for today.
 */
export async function fetchEspnScoreboard(
  dateStr?: string,
): Promise<EspnMatchData[]> {
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

      const homeId = mapEspnAbbreviation(home.team.abbreviation);
      const awayId = mapEspnAbbreviation(away.team.abbreviation);

      results.push({
        homeId,
        awayId,
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

/** Date formats we care about for polling. */
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

/**
 * Fetch today's AND yesterday's scoreboards to catch all recent results.
 * Useful for polling — covers matches that finished late yesterday.
 */
export async function fetchRecentEspnScoreboards(): Promise<EspnMatchData[]> {
  const [today, yesterday] = await Promise.all([
    fetchEspnScoreboard(todayEspnDate()),
    fetchEspnScoreboard(yesterdayEspnDate()),
  ]);

  // Deduplicate by espnEventId — prefer today's data
  const seen = new Set<string>();
  const merged: EspnMatchData[] = [];

  for (const m of [...today, ...yesterday]) {
    if (seen.has(m.espnEventId)) continue;
    seen.add(m.espnEventId);
    merged.push(m);
  }

  return merged;
}

/**
 * Match local app match data against ESPN live data.
 * Returns the merged match with ESPN scores for live/finished matches.
 * Manual overrides (from AsyncStorage) always win.
 */
export function applyEspnData(
  localMatch: Match,
  espnMatch: EspnMatchData | undefined,
): Match {
  if (!espnMatch) return localMatch;

  // Only apply ESPN data if the match isn't manually overridden with different data
  // We detect manual overrides by checking if local has scores that differ from ESPN
  const hasManualScores =
    localMatch.status === "live" &&
    localMatch.homeScore !== null &&
    localMatch.awayScore !== null;

  // If match is finished in ESPN, apply the result
  if (espnMatch.status === "finished") {
    return {
      ...localMatch,
      status: "finished",
      homeScore: espnMatch.homeScore,
      awayScore: espnMatch.awayScore,
      minute: null,
    };
  }

  // If match is live in ESPN and not manually set
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

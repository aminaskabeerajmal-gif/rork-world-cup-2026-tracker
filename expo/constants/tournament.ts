export type Team = {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  confederation: string;
  fifaRank: number;
};

export type MatchStatus = "upcoming" | "live" | "finished";

export type GoalEvent = {
  id: string;
  matchId: string;
  teamId: string;  // homeId or awayId
  playerName: string;
  minute: number;
  side: "home" | "away";
};

export type Match = {
  id: string;
  homeId: string;
  awayId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute: number | null;
  group: string;
  stage: string;
  venue: string;
  city: string;
  kickoff: string; // ISO
  goals: GoalEvent[];
};

/**
 * FIFA World Cup 2026 — 48 teams across 12 groups (A–L).
 * Data source: FIFA official draw results, May 2026.
 * Hosts: Canada, Mexico, USA.
 */
export const TEAMS: Team[] = [
  // ─── Group A ───
  { id: "mex", name: "Mexico", code: "MEX", flag: "🇲🇽", group: "A", confederation: "CONCACAF", fifaRank: 15 },
  { id: "rsa", name: "South Africa", code: "RSA", flag: "🇿🇦", group: "A", confederation: "CAF", fifaRank: 57 },
  { id: "kor", name: "Korea Republic", code: "KOR", flag: "🇰🇷", group: "A", confederation: "AFC", fifaRank: 22 },
  { id: "cze", name: "Czechia", code: "CZE", flag: "🇨🇿", group: "A", confederation: "UEFA", fifaRank: 36 },

  // ─── Group B ───
  { id: "can", name: "Canada", code: "CAN", flag: "🇨🇦", group: "B", confederation: "CONCACAF", fifaRank: 30 },
  { id: "bih", name: "Bosnia & Herz.", code: "BIH", flag: "🇧🇦", group: "B", confederation: "UEFA", fifaRank: 49 },
  { id: "qat", name: "Qatar", code: "QAT", flag: "🇶🇦", group: "B", confederation: "AFC", fifaRank: 44 },
  { id: "sui", name: "Switzerland", code: "SUI", flag: "🇨🇭", group: "B", confederation: "UEFA", fifaRank: 19 },

  // ─── Group C ───
  { id: "bra", name: "Brazil", code: "BRA", flag: "🇧🇷", group: "C", confederation: "CONMEBOL", fifaRank: 4 },
  { id: "mar", name: "Morocco", code: "MAR", flag: "🇲🇦", group: "C", confederation: "CAF", fifaRank: 13 },
  { id: "hai", name: "Haiti", code: "HAI", flag: "🇭🇹", group: "C", confederation: "CONCACAF", fifaRank: 78 },
  { id: "sco", name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", confederation: "UEFA", fifaRank: 39 },

  // ─── Group D ───
  { id: "usa", name: "United States", code: "USA", flag: "🇺🇸", group: "D", confederation: "CONCACAF", fifaRank: 16 },
  { id: "par", name: "Paraguay", code: "PAR", flag: "🇵🇾", group: "D", confederation: "CONMEBOL", fifaRank: 48 },
  { id: "aus", name: "Australia", code: "AUS", flag: "🇦🇺", group: "D", confederation: "AFC", fifaRank: 25 },
  { id: "tur", name: "Turkiye", code: "TUR", flag: "🇹🇷", group: "D", confederation: "UEFA", fifaRank: 27 },

  // ─── Group E ───
  { id: "ger", name: "Germany", code: "GER", flag: "🇩🇪", group: "E", confederation: "UEFA", fifaRank: 11 },
  { id: "cuw", name: "Curacao", code: "CUW", flag: "🇨🇼", group: "E", confederation: "CONCACAF", fifaRank: 82 },
  { id: "civ", name: "Ivory Coast", code: "CIV", flag: "🇨🇮", group: "E", confederation: "CAF", fifaRank: 37 },
  { id: "ecu", name: "Ecuador", code: "ECU", flag: "🇪🇨", group: "E", confederation: "CONMEBOL", fifaRank: 24 },

  // ─── Group F ───
  { id: "ned", name: "Netherlands", code: "NED", flag: "🇳🇱", group: "F", confederation: "UEFA", fifaRank: 7 },
  { id: "jpn", name: "Japan", code: "JPN", flag: "🇯🇵", group: "F", confederation: "AFC", fifaRank: 17 },
  { id: "swe", name: "Sweden", code: "SWE", flag: "🇸🇪", group: "F", confederation: "UEFA", fifaRank: 28 },
  { id: "tun", name: "Tunisia", code: "TUN", flag: "🇹🇳", group: "F", confederation: "CAF", fifaRank: 41 },

  // ─── Group G ───
  { id: "bel", name: "Belgium", code: "BEL", flag: "🇧🇪", group: "G", confederation: "UEFA", fifaRank: 6 },
  { id: "egy", name: "Egypt", code: "EGY", flag: "🇪🇬", group: "G", confederation: "CAF", fifaRank: 33 },
  { id: "irn", name: "IR Iran", code: "IRN", flag: "🇮🇷", group: "G", confederation: "AFC", fifaRank: 21 },
  { id: "nzl", name: "New Zealand", code: "NZL", flag: "🇳🇿", group: "G", confederation: "OFC", fifaRank: 94 },

  // ─── Group H ───
  { id: "esp", name: "Spain", code: "ESP", flag: "🇪🇸", group: "H", confederation: "UEFA", fifaRank: 3 },
  { id: "cpv", name: "Cape Verde", code: "CPV", flag: "🇨🇻", group: "H", confederation: "CAF", fifaRank: 62 },
  { id: "ksa", name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", group: "H", confederation: "AFC", fifaRank: 53 },
  { id: "uru", name: "Uruguay", code: "URU", flag: "🇺🇾", group: "H", confederation: "CONMEBOL", fifaRank: 14 },

  // ─── Group I ───
  { id: "fra", name: "France", code: "FRA", flag: "🇫🇷", group: "I", confederation: "UEFA", fifaRank: 2 },
  { id: "sen", name: "Senegal", code: "SEN", flag: "🇸🇳", group: "I", confederation: "CAF", fifaRank: 20 },
  { id: "irq", name: "Iraq", code: "IRQ", flag: "🇮🇶", group: "I", confederation: "AFC", fifaRank: 58 },
  { id: "nor", name: "Norway", code: "NOR", flag: "🇳🇴", group: "I", confederation: "UEFA", fifaRank: 43 },

  // ─── Group J ───
  { id: "arg", name: "Argentina", code: "ARG", flag: "🇦🇷", group: "J", confederation: "CONMEBOL", fifaRank: 1 },
  { id: "alg", name: "Algeria", code: "ALG", flag: "🇩🇿", group: "J", confederation: "CAF", fifaRank: 34 },
  { id: "aut", name: "Austria", code: "AUT", flag: "🇦🇹", group: "J", confederation: "UEFA", fifaRank: 23 },
  { id: "jor", name: "Jordan", code: "JOR", flag: "🇯🇴", group: "J", confederation: "AFC", fifaRank: 64 },

  // ─── Group K ───
  { id: "por", name: "Portugal", code: "POR", flag: "🇵🇹", group: "K", confederation: "UEFA", fifaRank: 8 },
  { id: "cod", name: "DR Congo", code: "COD", flag: "🇨🇩", group: "K", confederation: "CAF", fifaRank: 61 },
  { id: "uzb", name: "Uzbekistan", code: "UZB", flag: "🇺🇿", group: "K", confederation: "AFC", fifaRank: 55 },
  { id: "col", name: "Colombia", code: "COL", flag: "🇨🇴", group: "K", confederation: "CONMEBOL", fifaRank: 12 },

  // ─── Group L ───
  { id: "eng", name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", confederation: "UEFA", fifaRank: 5 },
  { id: "cro", name: "Croatia", code: "CRO", flag: "🇭🇷", group: "L", confederation: "UEFA", fifaRank: 10 },
  { id: "gha", name: "Ghana", code: "GHA", flag: "🇬🇭", group: "L", confederation: "CAF", fifaRank: 60 },
  { id: "pan", name: "Panama", code: "PAN", flag: "🇵🇦", group: "L", confederation: "CONCACAF", fifaRank: 45 },
];

export const GROUPS: string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

/** Forward/attacking players seeded into the Golden Boot race for each of the 48 teams. */
export const FORWARD_PLAYERS: Record<string, string[]> = {
  // ─── Group A ───
  mex: ["Santiago Gimenez", "Hirving Lozano", "Raul Jimenez"],
  rsa: ["Lyle Foster", "Percy Tau"],
  kor: ["Son Heung-min", "Hwang Hee-chan", "Cho Gue-sung"],
  cze: ["Patrik Schick", "Adam Hlozek", "Tomas Chory"],

  // ─── Group B ───
  can: ["Jonathan David", "Cyle Larin", "Alphonso Davies"],
  bih: ["Edin Dzeko", "Ermedin Demirovic"],
  qat: ["Almoez Ali", "Akram Afif"],
  sui: ["Breel Embolo", "Zeki Amdouni", "Noah Okafor"],

  // ─── Group C ───
  bra: ["Vinicius Jr", "Rodrygo", "Raphinha", "Endrick"],
  mar: ["Youssef En-Nesyri", "Hakim Ziyech", "Brahim Diaz"],
  hai: ["Frantzdy Pierrot", "Duckens Nazon"],
  sco: ["Che Adams", "Lawrence Shankland"],

  // ─── Group D ───
  usa: ["Christian Pulisic", "Folarin Balogun", "Timothy Weah"],
  par: ["Miguel Almiron", "Julio Enciso"],
  aus: ["Nestory Irankunda", "Mitchell Duke"],
  tur: ["Kenan Yildiz", "Baris Alper Yilmaz", "Arda Guler"],

  // ─── Group E ───
  ger: ["Jamal Musiala", "Florian Wirtz", "Kai Havertz"],
  cuw: ["Rangelo Janga", "Juninho Bacuna"],
  civ: ["Sebastien Haller", "Nicolas Pepe", "Simon Adingra"],
  ecu: ["Enner Valencia", "Jeremy Sarmiento"],

  // ─── Group F ───
  ned: ["Cody Gakpo", "Memphis Depay", "Xavi Simons"],
  jpn: ["Takefusa Kubo", "Kaoru Mitoma", "Ayase Ueda"],
  swe: ["Alexander Isak", "Viktor Gyokeres", "Dejan Kulusevski"],
  tun: ["Youssef Msakni", "Haithem Jouini"],

  // ─── Group G ───
  bel: ["Romelu Lukaku", "Jeremy Doku", "Lois Openda"],
  egy: ["Mohamed Salah", "Omar Marmoush", "Mostafa Mohamed"],
  irn: ["Mehdi Taremi", "Sardar Azmoun"],
  nzl: ["Chris Wood", "Ben Waine"],

  // ─── Group H ───
  esp: ["Lamine Yamal", "Alvaro Morata", "Nico Williams", "Dani Olmo"],
  cpv: ["Bebe", "Ryan Mendes"],
  ksa: ["Salem Al-Dawsari", "Firas Al-Buraikan"],
  uru: ["Darwin Nunez", "Federico Valverde", "Facundo Pellistri"],

  // ─── Group I ───
  fra: ["Kylian Mbappe", "Ousmane Dembele", "Marcus Thuram", "Bradley Barcola"],
  sen: ["Sadio Mane", "Nicolas Jackson", "Ismaila Sarr"],
  irq: ["Aymen Hussein", "Mohanad Ali"],
  nor: ["Erling Haaland", "Martin Odegaard", "Alexander Sorloth"],

  // ─── Group J ───
  arg: ["Lionel Messi", "Julian Alvarez", "Lautaro Martinez"],
  alg: ["Riyad Mahrez", "Amine Gouiri", "Baghdad Bounedjah"],
  aut: ["Marcel Sabitzer", "Michael Gregoritsch", "Marko Arnautovic"],
  jor: ["Musa Al-Taamari", "Yazan Al-Naimat"],

  // ─── Group K ───
  por: ["Cristiano Ronaldo", "Rafael Leao", "Diogo Jota", "Joao Felix"],
  cod: ["Yoane Wissa", "Silas Katompa Mvumpa"],
  uzb: ["Eldor Shomurodov", "Abbosbek Fayzullaev"],
  col: ["Luis Diaz", "Jhon Duran", "James Rodriguez"],

  // ─── Group L ───
  eng: ["Harry Kane", "Bukayo Saka", "Phil Foden", "Jude Bellingham"],
  cro: ["Andrej Kramaric", "Ivan Perisic", "Josko Gvardiol"],
  gha: ["Mohammed Kudus", "Jordan Ayew", "Antoine Semenyo"],
  pan: ["Ismael Diaz", "Jose Fajardo"],
};

export const getTeam = (id: string): Team | undefined =>
  TEAMS.find((t) => t.id === id);

export const teamsInGroup = (group: string): Team[] =>
  TEAMS.filter((t) => t.group === group);

// ─── Real World Cup 2026 Venues ───
interface Venue { venue: string; city: string }

const VENUES: Venue[] = [
  { venue: "Estadio Azteca", city: "Mexico City" },
  { venue: "Estadio Akron", city: "Guadalajara" },
  { venue: "Estadio BBVA", city: "Monterrey" },
  { venue: "BMO Field", city: "Toronto" },
  { venue: "BC Place", city: "Vancouver" },
  { venue: "SoFi Stadium", city: "Los Angeles" },
  { venue: "Levi's Stadium", city: "San Francisco" },
  { venue: "Lumen Field", city: "Seattle" },
  { venue: "NRG Stadium", city: "Houston" },
  { venue: "AT&T Stadium", city: "Dallas" },
  { venue: "Arrowhead Stadium", city: "Kansas City" },
  { venue: "Mercedes-Benz Stadium", city: "Atlanta" },
  { venue: "Hard Rock Stadium", city: "Miami" },
  { venue: "Gillette Stadium", city: "Boston" },
  { venue: "Lincoln Financial Field", city: "Philadelphia" },
  { venue: "MetLife Stadium", city: "New York / NJ" },
];

function v(idx: number): Venue {
  return VENUES[idx % VENUES.length];
}

/**
 * Builds the real FIFA World Cup 2026 group-stage match schedule.
 * Tournament runs June 11 – July 19, 2026.
 * Current date: June 12, 2026 — matches from Jun 11 are finished,
 * everything else is upcoming.
 */
function buildMatches(): Match[] {
  const out: Match[] = [];

  // Helper: add a match
  function add(
    id: string, group: string, homeId: string, awayId: string,
    dateStr: string, // "Jun 11"
    timeET: string,  // "15:00" 24h ET
    vidx: number,
    status: MatchStatus = "upcoming",
    homeScore: number | null = null,
    awayScore: number | null = null,
    minute: number | null = null,
    goalsData: Omit<GoalEvent, "id" | "matchId">[] = [],
  ) {
    const [month, day] = dateStr.split(" ");
    const monthMap: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const [h, m] = timeET.split(":").map(Number);
    // ET = UTC-4 (EDT)
    const kickoff = new Date(Date.UTC(2026, monthMap[month], Number(day), h + 4, m, 0)).toISOString();

    out.push({
      id, group, homeId, awayId, homeScore, awayScore, status, minute,
      stage: "Group Stage",
      venue: v(vidx).venue,
      city: v(vidx).city,
      kickoff,
      goals: goalsData.map((g, i) => ({ ...g, id: `${id}_g${i}`, matchId: id })),
    });
  }

  // ═══════════════════════════════════════
  // Matchday 1: June 11–15
  // ═══════════════════════════════════════

  // June 11 — FINISHED
  add("m1",  "A", "mex", "rsa", "Jun 11", "15:00", 0, "finished", 3, 0, null, [
    { teamId: "mex", playerName: "Santiago Gimenez", minute: 12, side: "home" },
    { teamId: "mex", playerName: "Santiago Gimenez", minute: 45, side: "home" },
    { teamId: "mex", playerName: "Hirving Lozano", minute: 67, side: "home" },
  ]);
  add("m2",  "A", "kor", "cze", "Jun 11", "22:00", 1, "finished", 1, 1, null, [
    { teamId: "kor", playerName: "Son Heung-min", minute: 34, side: "home" },
    { teamId: "cze", playerName: "Patrik Schick", minute: 72, side: "away" },
  ]);

  // June 12
  add("m3",  "B", "can", "bih", "Jun 12", "15:00", 3, "finished", 2, 2, null, [
    { teamId: "bih", playerName: "Edin Dzeko", minute: 14, side: "away" },
    { teamId: "can", playerName: "Jonathan David", minute: 31, side: "home" },
    { teamId: "bih", playerName: "Ermedin Demirovic", minute: 52, side: "away" },
    { teamId: "can", playerName: "Cyle Larin", minute: 78, side: "home" },
  ]);
  add("m4",  "D", "usa", "par", "Jun 12", "21:00", 5, "finished", 3, 1, null, [
    { teamId: "usa", playerName: "Christian Pulisic", minute: 23, side: "home" },
    { teamId: "usa", playerName: "Timothy Weah", minute: 41, side: "home" },
    { teamId: "par", playerName: "Julio Enciso", minute: 57, side: "away" },
    { teamId: "usa", playerName: "Folarin Balogun", minute: 78, side: "home" },
  ]);
  add("m5",  "B", "qat", "sui", "Jun 12", "15:00", 6);

  // June 13
  add("m6",  "C", "bra", "mar", "Jun 13", "18:00", 15);
  add("m7",  "C", "hai", "sco", "Jun 13", "21:00", 13);
  add("m8",  "D", "aus", "tur", "Jun 13", "21:00", 4);

  // June 14
  add("m9",  "E", "ger", "cuw", "Jun 14", "15:00", 8);
  add("m10", "E", "civ", "ecu", "Jun 14", "18:00", 9);
  add("m11", "F", "ned", "jpn", "Jun 14", "12:00", 7);
  add("m12", "F", "swe", "tun", "Jun 14", "21:00", 2);

  // June 15
  add("m13", "G", "bel", "egy", "Jun 15", "15:00", 11);
  add("m14", "G", "irn", "nzl", "Jun 15", "18:00", 10);
  add("m15", "H", "esp", "cpv", "Jun 15", "12:00", 11);
  add("m16", "H", "ksa", "uru", "Jun 15", "21:00", 5);

  // June 16
  add("m17", "I", "fra", "sen", "Jun 16", "15:00", 14);
  add("m18", "I", "irq", "nor", "Jun 16", "18:00", 12);
  add("m19", "J", "arg", "alg", "Jun 16", "21:00", 15);
  add("m20", "J", "aut", "jor", "Jun 16", "12:00", 8);

  // June 17
  add("m21", "K", "por", "cod", "Jun 17", "15:00", 13);
  add("m22", "K", "uzb", "col", "Jun 17", "18:00", 9);
  add("m23", "L", "eng", "cro", "Jun 17", "21:00", 10);
  add("m24", "L", "gha", "pan", "Jun 17", "21:00", 3);

  // ═══════════════════════════════════════
  // Matchday 2: June 18–22
  // ═══════════════════════════════════════

  // June 18
  add("m25", "A", "cze", "rsa", "Jun 18", "15:00", 11);
  add("m26", "A", "mex", "kor", "Jun 18", "21:00", 1);
  add("m27", "B", "can", "qat", "Jun 18", "18:00", 4);
  add("m28", "B", "sui", "bih", "Jun 18", "18:00", 5);

  // June 19
  add("m29", "C", "sco", "mar", "Jun 19", "18:00", 13);
  add("m30", "C", "bra", "hai", "Jun 19", "21:00", 14);
  add("m31", "D", "tur", "par", "Jun 19", "21:00", 6);
  add("m32", "D", "usa", "aus", "Jun 19", "15:00", 5);

  // June 20
  add("m33", "E", "ecu", "cuw", "Jun 20", "15:00", 7);
  add("m34", "E", "ger", "civ", "Jun 20", "18:00", 8);
  add("m35", "F", "tun", "jpn", "Jun 20", "21:00", 2);
  add("m36", "F", "ned", "swe", "Jun 20", "12:00", 9);

  // June 21
  add("m37", "G", "nzl", "egy", "Jun 21", "15:00", 10);
  add("m38", "G", "bel", "irn", "Jun 21", "18:00", 11);
  add("m39", "H", "uru", "cpv", "Jun 21", "21:00", 12);
  add("m40", "H", "esp", "ksa", "Jun 21", "12:00", 5);

  // June 22
  add("m41", "I", "nor", "sen", "Jun 22", "15:00", 13);
  add("m42", "I", "fra", "irq", "Jun 22", "18:00", 14);
  add("m43", "J", "jor", "alg", "Jun 22", "21:00", 15);
  add("m44", "J", "arg", "aut", "Jun 22", "12:00", 8);

  // June 23
  add("m45", "K", "col", "cod", "Jun 23", "15:00", 9);
  add("m46", "K", "por", "uzb", "Jun 23", "18:00", 10);
  add("m47", "L", "pan", "cro", "Jun 23", "21:00", 3);
  add("m48", "L", "eng", "gha", "Jun 23", "21:00", 11);

  // ═══════════════════════════════════════
  // Matchday 3: June 24–27
  // ═══════════════════════════════════════

  // June 24
  add("m49", "A", "rsa", "kor", "Jun 24", "21:00", 2);
  add("m50", "A", "cze", "mex", "Jun 24", "21:00", 0);
  add("m51", "B", "bih", "qat", "Jun 24", "15:00", 7);
  add("m52", "B", "sui", "can", "Jun 24", "15:00", 4);

  // June 25
  add("m53", "C", "mar", "hai", "Jun 25", "18:00", 11);
  add("m54", "C", "sco", "bra", "Jun 25", "18:00", 12);
  add("m55", "D", "par", "aus", "Jun 25", "21:00", 5);
  add("m56", "D", "tur", "usa", "Jun 25", "21:00", 6);

  // June 26
  add("m57", "E", "cuw", "civ", "Jun 26", "15:00", 8);
  add("m58", "E", "ecu", "ger", "Jun 26", "15:00", 9);
  add("m59", "F", "jpn", "swe", "Jun 26", "21:00", 10);
  add("m60", "F", "tun", "ned", "Jun 26", "21:00", 7);

  // June 27
  add("m61", "G", "egy", "irn", "Jun 27", "18:00", 13);
  add("m62", "G", "nzl", "bel", "Jun 27", "18:00", 14);
  add("m63", "H", "cpv", "ksa", "Jun 27", "21:00", 15);
  add("m64", "H", "uru", "esp", "Jun 27", "21:00", 5);

  // June 28
  add("m65", "I", "sen", "irq", "Jun 28", "15:00", 11);
  add("m66", "I", "nor", "fra", "Jun 28", "15:00", 12);
  add("m67", "J", "alg", "aut", "Jun 28", "21:00", 3);
  add("m68", "J", "jor", "arg", "Jun 28", "21:00", 1);

  // June 29
  add("m69", "K", "cod", "uzb", "Jun 29", "18:00", 8);
  add("m70", "K", "col", "por", "Jun 29", "18:00", 9);
  add("m71", "L", "cro", "gha", "Jun 29", "21:00", 10);
  add("m72", "L", "pan", "eng", "Jun 29", "21:00", 15);

  return out;
}

export const MATCHES: Match[] = buildMatches();

export type Standing = {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

/** Compute live group standings from finished + live matches. */
export function computeStandings(group: string): Standing[] {
  const teams = teamsInGroup(group);
  const table = new Map<string, Standing>();
  teams.forEach((team) =>
    table.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    })
  );

  MATCHES.filter(
    (m) => m.group === group && m.status !== "upcoming" && m.homeScore !== null && m.awayScore !== null
  ).forEach((m) => {
    const home = table.get(m.homeId);
    const away = table.get(m.awayId);
    if (!home || !away || m.homeScore === null || m.awayScore === null) return;
    home.played++;
    away.played++;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (m.homeScore < m.awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  });

  const list = Array.from(table.values());
  list.forEach((s) => (s.gd = s.gf - s.ga));
  list.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  return list;
}

/** Historical Golden Boot winners — every tournament since 1982. */
export type PastGoldenBootWinner = {
  playerName: string;
  teamId: string;
  goals: number;
  year: number;
  host: string;
};

export const PAST_GOLDEN_BOOT_WINNERS: PastGoldenBootWinner[] = [
  { year: 2022, host: "Qatar",     playerName: "Kylian Mbappe",    teamId: "fra", goals: 8  },
  { year: 2018, host: "Russia",    playerName: "Harry Kane",        teamId: "eng", goals: 6  },
  { year: 2014, host: "Brazil",    playerName: "James Rodriguez",   teamId: "col", goals: 6  },
  { year: 2010, host: "S. Africa", playerName: "Thomas Muller",     teamId: "ger", goals: 5  },
  { year: 2006, host: "Germany",   playerName: "Miroslav Klose",    teamId: "ger", goals: 5  },
  { year: 2002, host: "Korea/Japan", playerName: "Ronaldo",         teamId: "bra", goals: 8  },
  { year: 1998, host: "France",    playerName: "Davor Suker",       teamId: "cro", goals: 6  },
  { year: 1994, host: "USA",       playerName: "Hristo Stoichkov",  teamId: "bul", goals: 6  },
  { year: 1990, host: "Italy",     playerName: "Salvatore Schillaci", teamId: "ita", goals: 6 },
  { year: 1986, host: "Mexico",    playerName: "Gary Lineker",      teamId: "eng", goals: 6  },
  { year: 1982, host: "Spain",     playerName: "Paolo Rossi",       teamId: "ita", goals: 6  },
  { year: 1978, host: "Argentina", playerName: "Mario Kempes",      teamId: "arg", goals: 6  },
  { year: 1974, host: "W. Germany", playerName: "Grzegorz Lato",    teamId: "pol", goals: 7  },
  { year: 1970, host: "Mexico",    playerName: "Gerd Muller",       teamId: "ger", goals: 10 },
  { year: 1966, host: "England",   playerName: "Eusebio",           teamId: "por", goals: 9  },
  { year: 1958, host: "Sweden",    playerName: "Just Fontaine",     teamId: "fra", goals: 13 },
];

export type GoldenBootEntry = {
  playerName: string;
  teamId: string;
  goalIds: string[];
  goals: number;
};

export type BracketMatch = {
  id: string;
  round: string;
  homeLabel: string;
  awayLabel: string;
  homeFlag?: string;
  awayFlag?: string;
};

/** Knockout bracket — Round of 32 → Final (placeholders until group stage completes). */
export const BRACKET: { round: string; matches: BracketMatch[] }[] = [
  {
    round: "Round of 32",
    matches: [
      { id: "r32-1", round: "Round of 32", homeLabel: "Winner A", awayLabel: "3rd C/E/F/H/I" },
      { id: "r32-2", round: "Round of 32", homeLabel: "Winner C", awayLabel: "Runner-up F" },
      { id: "r32-3", round: "Round of 32", homeLabel: "Winner E", awayLabel: "3rd A/B/C/D/F" },
      { id: "r32-4", round: "Round of 32", homeLabel: "Winner G", awayLabel: "3rd A/E/H/I/J" },
      { id: "r32-5", round: "Round of 32", homeLabel: "Winner I", awayLabel: "3rd C/D/F/G/H" },
      { id: "r32-6", round: "Round of 32", homeLabel: "Winner K", awayLabel: "3rd D/E/I/J/L" },
      { id: "r32-7", round: "Round of 32", homeLabel: "Winner B", awayLabel: "3rd E/F/G/I/J" },
      { id: "r32-8", round: "Round of 32", homeLabel: "Winner D", awayLabel: "3rd B/E/F/I/J" },
    ],
  },
  {
    round: "Round of 16",
    matches: [
      { id: "r16-1", round: "Round of 16", homeLabel: "Winner R32-1", awayLabel: "Winner R32-2" },
      { id: "r16-2", round: "Round of 16", homeLabel: "Winner R32-3", awayLabel: "Winner R32-4" },
      { id: "r16-3", round: "Round of 16", homeLabel: "Winner F", awayLabel: "Runner-up C" },
      { id: "r16-4", round: "Round of 16", homeLabel: "Winner H", awayLabel: "Runner-up J" },
      { id: "r16-5", round: "Round of 16", homeLabel: "Winner R32-5", awayLabel: "Winner R32-6" },
      { id: "r16-6", round: "Round of 16", homeLabel: "Winner J", awayLabel: "Runner-up H" },
      { id: "r16-7", round: "Round of 16", homeLabel: "Winner L", awayLabel: "Runner-up K" },
      { id: "r16-8", round: "Round of 16", homeLabel: "Winner R32-7", awayLabel: "Winner R32-8" },
    ],
  },
  {
    round: "Quarter-finals",
    matches: [
      { id: "qf-1", round: "Quarter-finals", homeLabel: "Winner R16-1", awayLabel: "Winner R16-2" },
      { id: "qf-2", round: "Quarter-finals", homeLabel: "Winner R16-5", awayLabel: "Winner R16-6" },
      { id: "qf-3", round: "Quarter-finals", homeLabel: "Winner R16-3", awayLabel: "Winner R16-4" },
      { id: "qf-4", round: "Quarter-finals", homeLabel: "Winner R16-7", awayLabel: "Winner R16-8" },
    ],
  },
  {
    round: "Semi-finals",
    matches: [
      { id: "sf-1", round: "Semi-finals", homeLabel: "Winner QF-1", awayLabel: "Winner QF-2" },
      { id: "sf-2", round: "Semi-finals", homeLabel: "Winner QF-3", awayLabel: "Winner QF-4" },
    ],
  },
  {
    round: "Final",
    matches: [
      { id: "final", round: "Final", homeLabel: "Winner SF-1", awayLabel: "Winner SF-2", homeFlag: "🏆", awayFlag: "🏆" },
    ],
  },
];

/**
 * Compute golden boot standings from all matches with goal data,
 * seeded with forward players from every team at 0 goals.
 */
export function computeGoldenBoot(matches: Match[]): GoldenBootEntry[] {
  const map = new Map<string, GoldenBootEntry>();

  // Seed every team's forwards at 0 goals
  for (const team of TEAMS) {
    const forwards = FORWARD_PLAYERS[team.id];
    if (forwards) {
      for (const name of forwards) {
        const key = `${team.id}::${name}`;
        if (!map.has(key)) {
          map.set(key, { playerName: name, teamId: team.id, goalIds: [], goals: 0 });
        }
      }
    }
  }

  // Merge in actual goal data from matches
  for (const m of matches) {
    for (const g of m.goals) {
      const key = `${g.teamId}::${g.playerName}`;
      const entry = map.get(key);
      if (entry) {
        entry.goalIds.push(g.id);
        entry.goals = entry.goalIds.length;
      } else {
        map.set(key, { playerName: g.playerName, teamId: g.teamId, goalIds: [g.id], goals: 1 });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName));
}

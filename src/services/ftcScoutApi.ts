import { EventSearchResult, RawEventData } from '../types';

const API_URL = 'https://api.ftcscout.org/graphql';

async function gql(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const body = JSON.stringify({ query, variables });
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try { const t = await res.text(); if (t) detail = t; } catch {}
    throw new Error(`API ${res.status}: ${detail}`);
  }
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e: any) => e.message).join('; '));
  return json.data;
}

export const SEASONS = [
  { label: '2025-2026', value: 2025 },
  { label: '2024-2025', value: 2024 },
  { label: '2023-2024', value: 2023 },
  { label: '2022-2023', value: 2022 },
  { label: '2021-2022', value: 2021 },
];

// ── Inline fragments for season-specific union types ──────────────────────

// Remote seasons (2020Remote, 2021Remote) had no alliance structure — each team
// competed individually, so there are no red/blue fields on those types.
// GraphQL validates ALL inline fragments even if unused, so we must exclude them.
const SCORES_FRAGMENTS = `
  ... on MatchScores2025    { red { totalPoints } blue { totalPoints } }
  ... on MatchScores2024    { red { totalPoints } blue { totalPoints } }
  ... on MatchScores2023    { red { totalPoints } blue { totalPoints } }
  ... on MatchScores2022    { red { totalPoints } blue { totalPoints } }
  ... on MatchScores2021Trad { red { totalPoints } blue { totalPoints } }
  ... on MatchScores2020Trad { red { totalPoints } blue { totalPoints } }
  ... on MatchScores2019     { red { totalPoints } blue { totalPoints } }
`;

const STATS_OPR_FRAGMENTS = `
  ... on TeamEventStats2025 { opr { totalPoints } }
  ... on TeamEventStats2024 { opr { totalPoints } }
  ... on TeamEventStats2023 { opr { totalPoints } }
  ... on TeamEventStats2022 { opr { totalPoints } }
  ... on TeamEventStats2021Trad   { opr { totalPoints } }
  ... on TeamEventStats2021Remote { opr { totalPoints } }
  ... on TeamEventStats2020Trad   { opr { totalPoints } }
`;

// Ranking stats + event OPR — only trad seasons have alliance-based rankings
const STATS_RANK_FRAGMENTS = `
  ... on TeamEventStats2025 { rank wins losses ties rp opr { totalPoints } }
  ... on TeamEventStats2024 { rank wins losses ties rp opr { totalPoints } }
  ... on TeamEventStats2023 { rank wins losses ties rp opr { totalPoints } }
  ... on TeamEventStats2022 { rank wins losses ties rp opr { totalPoints } }
  ... on TeamEventStats2021Trad { rank wins losses ties rp opr { totalPoints } }
  ... on TeamEventStats2020Trad { rank wins losses ties rp opr { totalPoints } }
  ... on TeamEventStats2019     { rank wins losses ties rp opr { totalPoints } }
`;

// ── Helpers ───────────────────────────────────────────────────────────────

export function extractScore(score: any): number {
  if (!score) return 0;
  return score.totalPoints ?? score.total ?? 0;
}

/** alliance is "Red" or "Blue" (capitalized) from the API */
export function getTeamAlliance(alliance: string): 'red' | 'blue' | null {
  const a = (alliance ?? '').toLowerCase();
  if (a === 'red')  return 'red';
  if (a === 'blue') return 'blue';
  return null;
}

/** True if the string could be an event code (no spaces, alphanumeric/dashes) */
function looksLikeCode(s: string): boolean {
  return /^[A-Za-z0-9_-]{4,}$/.test(s.trim());
}

// ── Event Search ──────────────────────────────────────────────────────────

const EVENT_SEARCH_QUERY = `
  query SearchEvents($season: Int!, $q: String!) {
    eventsSearch(season: $season, searchText: $q) {
      code name start end
      location { venue city state country }
    }
  }
`;

const EVENT_BY_CODE_QUERY = `
  query EventByCode($season: Int!, $code: String!) {
    eventByCode(season: $season, code: $code) {
      code name start end finished
      location { venue city state country }
    }
  }
`;

export async function searchEvents(
  query: string,
  season: number
): Promise<EventSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toUpperCase();
  const results: EventSearchResult[] = [];
  const seen = new Set<string>();

  const addAll = (arr: any[]) => {
    for (const e of arr || []) {
      if (e && !seen.has(e.code)) {
        seen.add(e.code);
        results.push({ ...e, season });
      }
    }
  };

  // Always run text search
  const textSearch = gql(EVENT_SEARCH_QUERY, { season, q: query.trim() })
    .then(d => addAll(d.eventsSearch))
    .catch(() => {});

  // If it looks like a code, also try direct code lookup
  const codeSearch = looksLikeCode(query)
    ? gql(EVENT_BY_CODE_QUERY, { season, code: q })
        .then(d => { if (d.eventByCode) addAll([d.eventByCode]); })
        .catch(() => {})
    : Promise.resolve();

  await Promise.all([textSearch, codeSearch]);

  // Sort: code-exact-match first, then by start date
  return results.sort((a, b) => {
    const aExact = a.code.toUpperCase() === q ? -1 : 0;
    const bExact = b.code.toUpperCase() === q ? -1 : 0;
    if (aExact !== bExact) return aExact - bExact;
    return new Date(b.start).getTime() - new Date(a.start).getTime();
  });
}

// ── Event Details ─────────────────────────────────────────────────────────

export async function getEventDetails(code: string, season: number): Promise<RawEventData> {
  const data = await gql(
    `query GetEvent($season: Int!, $code: String!) {
      eventByCode(season: $season, code: $code) {
        code name start end finished
        location { venue city state country }
        teams {
          teamNumber
          stats { ${STATS_RANK_FRAGMENTS} }
        }
        matches {
          matchNum hasBeenPlayed tournamentLevel
          teams { teamNumber alliance station surrogate noShow dq }
          scores { ${SCORES_FRAGMENTS} }
        }
      }
    }`,
    { season, code }
  );
  const event = data.eventByCode;
  if (!event) throw new Error(`Event "${code}" not found for ${season}-${season + 1} season`);
  return event;
}

// ── Team Peak OPR (events strictly before target date) ───────────────────

async function fetchTeamPeakOPRBeforeDate(
  teamNumber: number,
  season: number,
  eventStartDate: string
): Promise<number> {
  const data = await gql(
    `query GetTeamEvents($number: Int!, $season: Int!) {
      teamByNumber(number: $number) {
        events(season: $season) {
          event { start }
          stats { ${STATS_OPR_FRAGMENTS} }
        }
      }
    }`,
    { number: teamNumber, season }
  );

  const events: any[] = data?.teamByNumber?.events ?? [];
  const cutoff = new Date(eventStartDate).getTime();

  const validOPRs: number[] = [];
  for (const e of events) {
    const t = new Date(e?.event?.start ?? '').getTime();
    if (isNaN(t) || t >= cutoff) continue;
    const opr = e?.stats?.opr?.totalPoints;
    if (typeof opr === 'number' && opr > 0) validOPRs.push(opr);
  }

  return validOPRs.length > 0 ? Math.max.apply(null, validOPRs) : 0;
}

/**
 * Load blended OPRs for all teams:
 * - No prior events  → use currentEventOPR (team's first event)
 * - Has prior events → average(currentEventOPR, maxPriorOPR)
 */
export async function loadTeamBestOPRs(
  teamNumbers: number[],
  season: number,
  eventStartDate: string,
  currentEventOPRs: Map<number, number>
): Promise<Map<number, number>> {
  const settled = await Promise.allSettled(
    teamNumbers.map(num => fetchTeamPeakOPRBeforeDate(num, season, eventStartDate))
  );
  const result = new Map<number, number>();
  teamNumbers.forEach((num, i) => {
    const r = settled[i];
    const priorMax = r.status === 'fulfilled' ? r.value : 0;
    const current = currentEventOPRs.get(num) ?? 0;
    if (priorMax === 0) {
      // First event this season — fall back to current event OPR
      result.set(num, current);
    } else {
      // Average current event OPR with season-best prior OPR
      result.set(num, (current + priorMax) / 2);
    }
  });
  return result;
}

// Legacy export
export const fetchEventsByName = searchEvents;
export const fetchEventData = async (n: string) => ({
  name: n, location: 'TBD', date: 'TBD', matches: [],
});

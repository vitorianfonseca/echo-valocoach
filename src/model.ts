import { z } from "zod";
export const MatchSchema = z.object({
  id: z.string().min(1),
  map: z.string(),
  agent: z.string().default("Desconhecido"),
  date: z.string(),
  won: z.boolean(),
  kills: z.number().nonnegative(),
  deaths: z.number().nonnegative(),
  assists: z.number().nonnegative(),
  roundsWon: z.number().nonnegative(),
  roundsLost: z.number().nonnegative(),
  source: z.enum(["import", "riot", "demo"]).default("import"),
});
export type Match = z.infer<typeof MatchSchema>;
export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
  model?: string;
};
export type State = {
  version: 1;
  demo: boolean;
  settings: {
    theme: "dark" | "light";
    language: "pt" | "en";
    reducedMotion: boolean;
    captureQuality: string;
    player: string;
    tag: string;
  };
  matches: Match[];
  plan: string[];
  sessions: {
    id: string;
    exercise: string;
    seconds: number;
    at: string;
    reflection: string;
  }[];
  setups: {
    id: string;
    name: string;
    map: string;
    agent: string;
    markers: { x: number; y: number }[];
  }[];
  conversations: { id: string; name: string; messages: Message[] }[];
  corrections: { id: string; reason: string; context: string; at: string }[];
  notes: { id: string; mediaId: string; time: number; text: string }[];
  onboarded: boolean;
};
export const initialState: State = {
  version: 1,
  demo: true,
  settings: {
    theme: "dark",
    language: "pt",
    reducedMotion: false,
    captureQuality: "1080p30",
    player: "VITOR",
    tag: "EUW",
  },
  matches: [],
  plan: [],
  sessions: [],
  setups: [],
  conversations: [{ id: "default", name: "A minha revisão", messages: [] }],
  corrections: [],
  notes: [],
  onboarded: false,
};
export function hydrate(value: unknown): State {
  if (!value || typeof value !== "object" || (value as any).version !== 1)
    return structuredClone(initialState);
  const v = value as State;
  return {
    ...structuredClone(initialState),
    ...v,
    settings: { ...initialState.settings, ...v.settings },
    matches: Array.isArray(v.matches)
      ? v.matches.filter((m) => MatchSchema.safeParse(m).success)
      : [],
    plan: Array.isArray(v.plan) ? v.plan : [],
    sessions: Array.isArray(v.sessions) ? v.sessions : [],
    setups: Array.isArray(v.setups) ? v.setups : [],
    conversations:
      Array.isArray(v.conversations) && v.conversations.length
        ? v.conversations
        : structuredClone(initialState.conversations),
    corrections: Array.isArray(v.corrections) ? v.corrections : [],
    notes: Array.isArray(v.notes) ? v.notes : [],
  };
}
export function importMatches(input: any): Match[] {
  if (Array.isArray(input))
    return z
      .array(MatchSchema)
      .parse(input)
      .map((m) => ({ ...m, source: "import" }));
  if (Array.isArray(input?.matches) && input.puuid) {
    return input.matches.map((raw: any) => {
      const p = raw.players?.find((p: any) => p.puuid === input.puuid);
      if (!p) throw new Error("O jogador não aparece numa das partidas.");
      const team = raw.teams?.find((t: any) => t.teamId === p.teamId),
        other = raw.teams?.find((t: any) => t.teamId !== p.teamId);
      return MatchSchema.parse({
        id: raw.matchInfo.matchId,
        map: raw.matchInfo.mapId,
        agent: p.characterId,
        date: new Date(raw.matchInfo.gameStartMillis).toISOString(),
        won: !!team?.won,
        kills: p.stats?.kills || 0,
        deaths: p.stats?.deaths || 0,
        assists: p.stats?.assists || 0,
        roundsWon: team?.roundsWon || 0,
        roundsLost: other?.roundsWon || 0,
        source: "riot",
      });
    });
  }
  if (input?.version === 1 && Array.isArray(input.matches))
    return z.array(MatchSchema).parse(input.matches);
  throw new Error(
    "Formato inválido. Usa o esquema ECHO ou {puuid, matches} com respostas da API Riot.",
  );
}
export function mergeMatches(existing: Match[], incoming: Match[]) {
  return [
    ...new Map([...existing, ...incoming].map((m) => [m.id, m])).values(),
  ].sort((a, b) => b.date.localeCompare(a.date));
}
export function stats(matches: Match[]) {
  const n = matches.length,
    k = matches.reduce((a, m) => a + m.kills, 0),
    d = matches.reduce((a, m) => a + m.deaths, 0);
  return {
    count: n,
    winrate: n
      ? Math.round((matches.filter((m) => m.won).length / n) * 100)
      : null,
    kd: d ? Math.round((k / d) * 100) / 100 : null,
    kills: k,
    deaths: d,
  };
}
export function safeInterval(start: number, end: number, duration: number) {
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start >= 0 &&
    end > start &&
    end <= duration
  );
}

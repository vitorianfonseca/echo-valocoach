import { describe, it, expect } from "vitest";
import {
  hydrate,
  importMatches,
  mergeMatches,
  stats,
  safeInterval,
  initialState,
} from "../src/model";
const match = {
  id: "a",
  map: "Ascent",
  agent: "Omen",
  date: "2026-10-20T12:00:00Z",
  won: true,
  kills: 10,
  deaths: 5,
  assists: 3,
  roundsWon: 13,
  roundsLost: 8,
  source: "import" as const,
};
describe("match ingestion and honest metrics", () => {
  it("rejects malformed imports instead of inventing data", () => {
    expect(() => importMatches([{ ...match, kills: -1 }])).toThrow();
    expect(() => importMatches({})).toThrow();
  });
  it("deduplicates imports by match id", () => {
    expect(mergeMatches([match], [{ ...match, kills: 20 }])).toHaveLength(1);
    expect(mergeMatches([match], [{ ...match, kills: 20 }])[0].kills).toBe(20);
  });
  it("handles empty samples and zero deaths without fake scores", () => {
    expect(stats([])).toMatchObject({ count: 0, winrate: null, kd: null });
    expect(stats([{ ...match, deaths: 0 }]).kd).toBeNull();
    expect(stats([match])).toMatchObject({ winrate: 100, kd: 2 });
  });
  it("uses correct player and team in Riot match payload", () => {
    const result = importMatches({
      puuid: "p",
      matches: [
        {
          matchInfo: { matchId: "a", mapId: "Ascent", gameStartMillis: 1 },
          players: [
            {
              puuid: "p",
              teamId: "Blue",
              characterId: "Omen",
              stats: { kills: 10, deaths: 5, assists: 3 },
            },
          ],
          teams: [
            { teamId: "Blue", won: true, roundsWon: 13 },
            { teamId: "Red", won: false, roundsWon: 8 },
          ],
        },
      ],
    });
    expect(result[0]).toMatchObject({
      won: true,
      roundsWon: 13,
      roundsLost: 8,
      source: "riot",
    });
  });
  it("hydrates a missing store and rejects unsupported versions", () => {
    expect(hydrate(null)).toEqual(initialState);
    expect(hydrate({ version: 9 })).toEqual(initialState);
  });
  it("only accepts clip ranges inside the loaded media", () => {
    expect(safeInterval(0, 15, 60)).toBe(true);
    expect(safeInterval(-1, 10, 60)).toBe(false);
    expect(safeInterval(10, 5, 60)).toBe(false);
    expect(safeInterval(0, 70, 60)).toBe(false);
  });
});

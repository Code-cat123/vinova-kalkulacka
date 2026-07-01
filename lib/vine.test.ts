import { describe, expect, it } from "vitest";
import { normalizeRecords, parseVine, toVine } from "./vine";
import { Tasting } from "./types";

function sampleTasting(over: Partial<Tasting> = {}): Tasting {
  return {
    id: "x",
    user_id: "u",
    name: "Ryzlink",
    type: "tiche",
    vintage: "2021",
    producer: "Vinař",
    variety: "RR",
    tasted_on: "2024-09-15",
    grades: { vz_cirost: 0, za_dojem: 0 },
    total_score: 999, // intentionally wrong; must be recomputed on import
    medal: "zadna",
    note: "pozn",
    photo_url: null,
    photo_path: null,
    created_at: "2024-09-15T00:00:00.000Z",
    ...over,
  };
}

const OPTS = { userId: "target", newId: () => "new-id", now: "2026-07-01T10:00:00.000Z" };

describe(".vine round-trip", () => {
  it("toVine → parseVine zachová záznamy", () => {
    const text = toVine([sampleTasting()], "2026-07-01T00:00:00.000Z");
    const records = parseVine(text);
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe("Ryzlink");
    expect(records[0].tasted_on).toBe("2024-09-15");
  });

  it("parseVine akceptuje i holé pole", () => {
    const records = parseVine(JSON.stringify([{ name: "A", type: "tiche" }]));
    expect(records).toHaveLength(1);
  });

  it("parseVine odmítne nesmysl", () => {
    expect(() => parseVine("{}")).toThrow();
    expect(() => parseVine("not json")).toThrow();
  });
});

describe("normalizeRecords (import)", () => {
  it("přepočítá skóre a nastaví cílového uživatele + nové id", () => {
    const rows = normalizeRecords([sampleTasting()], OPTS);
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe("target");
    expect(rows[0].id).toBe("new-id");
    expect(rows[0].total_score).toBe(5 + 11); // vz_cirost=5, za_dojem=11 (tiche)
    expect(rows[0].photo_path).toBeNull();
  });

  it("zahodí záznam bez názvu", () => {
    const rows = normalizeRecords([{ type: "tiche", name: "  " }], OPTS);
    expect(rows).toHaveLength(0);
  });

  it("očistí neplatné známky a neznámý typ spadne na 'tiche'", () => {
    const rows = normalizeRecords(
      [{ name: "X", type: "cosi", grades: { vz_cirost: 9, foo: 2, za_dojem: 1 } }],
      OPTS,
    );
    expect(rows[0].type).toBe("tiche");
    // vz_cirost=9 mimo rozsah → zahozeno, foo neznámé → zahozeno, za_dojem=1 → 10
    expect(rows[0].grades).toEqual({ za_dojem: 1 });
    expect(rows[0].total_score).toBe(10);
  });

  it("neplatné datum spadne na dnešek (z opts.now)", () => {
    const rows = normalizeRecords([{ name: "X", tasted_on: "kdovíkdy" }], OPTS);
    expect(rows[0].tasted_on).toBe("2026-07-01");
  });

  it("povolí data: URL fotky (lokální režim) i http", () => {
    const dataUrl = normalizeRecords([{ name: "X", photo_url: "data:image/png;base64,AAAA" }], OPTS);
    expect(dataUrl[0].photo_url).toMatch(/^data:/);
    const httpUrl = normalizeRecords([{ name: "X", photo_url: "https://e.com/a.jpg" }], OPTS);
    expect(httpUrl[0].photo_url).toBe("https://e.com/a.jpg");
    const bad = normalizeRecords([{ name: "X", photo_url: "javascript:alert(1)" }], OPTS);
    expect(bad[0].photo_url).toBeNull();
  });
});

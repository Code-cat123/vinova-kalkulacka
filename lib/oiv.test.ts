import { describe, expect, it } from "vitest";
import {
  CRITERIA_SUMIVE,
  CRITERIA_TICHE,
  maxScore,
  medalFor,
} from "./oiv";
import { computeScore, Grades } from "./scoring";

describe("OIV bodové tabulky", () => {
  it("max skóre tichého vína = 100", () => {
    expect(maxScore("tiche")).toBe(100);
  });

  it("max skóre šumivého vína = 100", () => {
    expect(maxScore("sumive")).toBe(100);
  });

  it("součet sekcí tichého: 15 + 30 + 44 + 11", () => {
    const sum = (s: string) =>
      CRITERIA_TICHE.filter((c) => c.section === s).reduce(
        (a, c) => a + c.points[0],
        0,
      );
    expect(sum("vzhled")).toBe(15);
    expect(sum("vune")).toBe(30);
    expect(sum("chut")).toBe(44);
    expect(sum("zaver")).toBe(11);
  });

  it("součet sekcí šumivého: 25 + 28 + 35 + 12", () => {
    const sum = (s: string) =>
      CRITERIA_SUMIVE.filter((c) => c.section === s).reduce(
        (a, c) => a + c.points[0],
        0,
      );
    expect(sum("vzhled")).toBe(25);
    expect(sum("vune")).toBe(28);
    expect(sum("chut")).toBe(35);
    expect(sum("zaver")).toBe(12);
  });
});

describe("computeScore", () => {
  it("všechna kritéria 'vynikající' (index 0) => 100", () => {
    const grades: Grades = Object.fromEntries(
      CRITERIA_TICHE.map((c) => [c.id, 0]),
    ) as Grades;
    expect(computeScore(grades, "tiche").total).toBe(100);
  });

  it("nevyplněná kritéria = 0 bodů", () => {
    expect(computeScore({}, "tiche").total).toBe(0);
    expect(computeScore({}, "tiche").ungradedCount).toBe(CRITERIA_TICHE.length);
  });

  it("vzorový součet tichého vína", () => {
    // čirost(0)=5, vzhled(1)=8, vůně čistota(0)=6, intenzita(1)=7, kvalita(1)=14,
    // chuť čistota(0)=6, intenzita(0)=8, perzistence(1)=7, kvalita(1)=19, dojem(1)=10
    const grades: Grades = {
      vz_cirost: 0,
      vz_vzhled: 1,
      vu_cistota: 0,
      vu_intenzita: 1,
      vu_kvalita: 1,
      ch_cistota: 0,
      ch_intenzita: 0,
      ch_perzistence: 1,
      ch_kvalita: 1,
      za_dojem: 1,
    };
    const r = computeScore(grades, "tiche");
    expect(r.total).toBe(90);
    expect(r.medal).toBe("zlata");
  });
});

describe("medalFor", () => {
  it("prahy medailí", () => {
    expect(medalFor(92)).toBe("velka_zlata");
    expect(medalFor(91)).toBe("zlata");
    expect(medalFor(85)).toBe("zlata");
    expect(medalFor(84)).toBe("stribrna");
    expect(medalFor(82)).toBe("stribrna");
    expect(medalFor(81)).toBe("zadna");
    expect(medalFor(0)).toBe("zadna");
  });
});

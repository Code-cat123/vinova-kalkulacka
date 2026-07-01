// OIV 2009 (NVC/OIV2009) 100-point wine scoring system — source of truth.
// All scoring constants and medal thresholds live here.

export type GradeIndex = 0 | 1 | 2 | 3 | 4; // 0 = vynikající ... 4 = nedostatečné
export type WineType = "tiche" | "sumive";

export const GRADE_LABELS = [
  "vynikající",
  "velmi dobré",
  "dobré",
  "dostatečné",
  "nedostatečné",
] as const;

export interface Criterion {
  id: string;
  section: "vzhled" | "vune" | "chut" | "zaver";
  label: string;
  points: [number, number, number, number, number]; // body pro index 0..4
}

export const SECTION_LABELS: Record<Criterion["section"], string> = {
  vzhled: "Vzhled",
  vune: "Vůně",
  chut: "Chuť",
  zaver: "Harmonie – celkový dojem",
};

export const SECTION_ORDER: Criterion["section"][] = [
  "vzhled",
  "vune",
  "chut",
  "zaver",
];

// ---- TICHÁ VÍNA (max 100: Vzhled 15 + Vůně 30 + Chuť 44 + Závěr 11) ----
export const CRITERIA_TICHE: Criterion[] = [
  { id: "vz_cirost", section: "vzhled", label: "Čirost", points: [5, 4, 3, 2, 1] },
  { id: "vz_vzhled", section: "vzhled", label: "Vzhled mimo čirost", points: [10, 8, 6, 4, 2] },
  { id: "vu_cistota", section: "vune", label: "Čistota", points: [6, 5, 4, 3, 2] },
  { id: "vu_intenzita", section: "vune", label: "Pozitivní intenzita", points: [8, 7, 6, 4, 2] },
  { id: "vu_kvalita", section: "vune", label: "Kvalita", points: [16, 14, 12, 10, 8] },
  { id: "ch_cistota", section: "chut", label: "Čistota", points: [6, 5, 4, 3, 2] },
  { id: "ch_intenzita", section: "chut", label: "Pozitivní intenzita", points: [8, 7, 6, 4, 2] },
  { id: "ch_perzistence", section: "chut", label: "Harmonická perzistence", points: [8, 7, 6, 5, 4] },
  { id: "ch_kvalita", section: "chut", label: "Kvalita", points: [22, 19, 16, 13, 10] },
  { id: "za_dojem", section: "zaver", label: "Celkový dojem", points: [11, 10, 9, 8, 7] },
];

// ---- ŠUMIVÁ VÍNA (max 100: Vzhled 25 + Vůně 28 + Chuť 35 + Závěr 12) ----
export const CRITERIA_SUMIVE: Criterion[] = [
  { id: "vz_cirost", section: "vzhled", label: "Čirost", points: [5, 4, 3, 2, 1] },
  { id: "vz_vzhled", section: "vzhled", label: "Vzhled mimo čirost", points: [10, 8, 6, 4, 2] },
  { id: "vz_perleni", section: "vzhled", label: "Perlení", points: [10, 8, 6, 4, 2] },
  { id: "vu_cistota", section: "vune", label: "Čistota", points: [7, 6, 5, 4, 3] },
  { id: "vu_intenzita", section: "vune", label: "Pozitivní intenzita", points: [7, 6, 5, 4, 3] },
  { id: "vu_kvalita", section: "vune", label: "Kvalita", points: [14, 12, 10, 8, 6] },
  { id: "ch_cistota", section: "chut", label: "Čistota", points: [7, 6, 5, 4, 3] },
  { id: "ch_intenzita", section: "chut", label: "Pozitivní intenzita", points: [7, 6, 5, 4, 3] },
  { id: "ch_perzistence", section: "chut", label: "Harmonická perzistence", points: [7, 6, 5, 4, 3] },
  { id: "ch_kvalita", section: "chut", label: "Kvalita", points: [14, 12, 10, 8, 6] },
  { id: "za_dojem", section: "zaver", label: "Celkový dojem", points: [12, 11, 10, 9, 8] },
];

export const CRITERIA: Record<WineType, Criterion[]> = {
  tiche: CRITERIA_TICHE,
  sumive: CRITERIA_SUMIVE,
};

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  tiche: "Tiché",
  sumive: "Šumivé",
};

export type Medal = "velka_zlata" | "zlata" | "stribrna" | "zadna";

export function medalFor(score: number): Medal {
  if (score >= 92) return "velka_zlata";
  if (score >= 85) return "zlata";
  if (score >= 82) return "stribrna";
  return "zadna";
}

export const MEDAL_LABELS = {
  velka_zlata: "Velká zlatá medaile",
  zlata: "Zlatá medaile",
  stribrna: "Stříbrná medaile",
  zadna: "Bez medaile",
} as const;

// Maximum achievable score for a wine type (best grade for every criterion).
export function maxScore(type: WineType): number {
  return CRITERIA[type].reduce((sum, c) => sum + c.points[0], 0);
}

// Scoring helpers built on top of the OIV source of truth (lib/oiv.ts).

import {
  CRITERIA,
  CRITERIA_SUMIVE,
  CRITERIA_TICHE,
  GRADE_LABELS,
  GradeIndex,
  Medal,
  medalFor,
  WineType,
} from "./oiv";

export type Grades = Record<string, GradeIndex>;

export interface ScoreResult {
  total: number;
  medal: Medal;
  gradedCount: number;
  criteriaCount: number;
  ungradedCount: number;
}

// Sum the points for the selected grade of every criterion of the given type.
// Ungraded criteria contribute 0 points.
export function computeScore(grades: Grades, type: WineType): ScoreResult {
  const criteria = CRITERIA[type];
  let total = 0;
  let gradedCount = 0;

  for (const c of criteria) {
    const g = grades[c.id];
    if (g === undefined || g === null) continue;
    total += c.points[g];
    gradedCount += 1;
  }

  return {
    total,
    medal: medalFor(total),
    gradedCount,
    criteriaCount: criteria.length,
    ungradedCount: criteria.length - gradedCount,
  };
}

// Per-row points for a given criterion + grade (0 if ungraded).
export function rowPoints(
  type: WineType,
  criterionId: string,
  grade: GradeIndex | undefined,
): number {
  if (grade === undefined || grade === null) return 0;
  const c = CRITERIA[type].find((x) => x.id === criterionId);
  return c ? c.points[grade] : 0;
}

// Unified set of criterion ids across both wine types (tiché ∪ šumivé),
// preserving a stable order. Used for export columns.
export interface UnifiedCriterion {
  id: string;
  label: string;
}

export const UNIFIED_CRITERIA: UnifiedCriterion[] = (() => {
  const seen = new Set<string>();
  const out: UnifiedCriterion[] = [];
  for (const c of [...CRITERIA_TICHE, ...CRITERIA_SUMIVE]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push({ id: c.id, label: c.label });
  }
  return out;
})();

export function gradeLabel(grade: GradeIndex | undefined): string {
  if (grade === undefined || grade === null) return "";
  return GRADE_LABELS[grade];
}

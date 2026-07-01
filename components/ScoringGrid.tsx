"use client";

import {
  CRITERIA,
  Criterion,
  GRADE_LABELS,
  GradeIndex,
  SECTION_LABELS,
  SECTION_ORDER,
  WineType,
} from "@/lib/oiv";
import { Grades, rowPoints } from "@/lib/scoring";

export function ScoringGrid({
  type,
  grades,
  onChange,
}: {
  type: WineType;
  grades: Grades;
  onChange: (criterionId: string, grade: GradeIndex) => void;
}) {
  const criteria = CRITERIA[type];
  const bySection = SECTION_ORDER.map((section) => ({
    section,
    items: criteria.filter((c) => c.section === section),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {bySection.map(({ section, items }) => (
        <div
          key={section}
          className="overflow-hidden rounded-xl border border-stone-200 bg-white"
        >
          <div className="border-b border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700">
            {SECTION_LABELS[section]}
          </div>
          <div className="divide-y divide-stone-100">
            {items.map((c) => (
              <CriterionRow
                key={c.id}
                type={type}
                criterion={c}
                grade={grades[c.id]}
                onChange={(g) => onChange(c.id, g)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CriterionRow({
  type,
  criterion,
  grade,
  onChange,
}: {
  type: WineType;
  criterion: Criterion;
  grade: GradeIndex | undefined;
  onChange: (g: GradeIndex) => void;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="w-full shrink-0 sm:w-48">
        <div className="text-sm font-medium text-stone-800">
          {criterion.label}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-5">
        {criterion.points.map((pts, i) => {
          const idx = i as GradeIndex;
          const selected = grade === idx;
          return (
            <button
              type="button"
              key={i}
              onClick={() => onChange(idx)}
              aria-pressed={selected}
              title={GRADE_LABELS[idx]}
              className={[
                "flex flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-center transition",
                selected
                  ? "border-wine-600 bg-wine-600 text-white shadow"
                  : "border-stone-200 bg-white text-stone-600 hover:border-wine-300 hover:bg-wine-50",
              ].join(" ")}
            >
              <span className="text-[11px] leading-tight">
                {GRADE_LABELS[idx]}
              </span>
              <span className="text-sm font-semibold">{pts}</span>
            </button>
          );
        })}
      </div>

      <div className="shrink-0 text-right sm:w-16">
        <span className="text-sm font-semibold text-stone-900">
          {rowPoints(type, criterion.id, grade)}
        </span>
        <span className="text-xs text-stone-400"> b.</span>
      </div>
    </div>
  );
}

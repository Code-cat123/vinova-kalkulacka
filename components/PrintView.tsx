"use client";

import {
  CRITERIA,
  GRADE_LABELS,
  maxScore,
  MEDAL_LABELS,
  SECTION_LABELS,
  SECTION_ORDER,
  WINE_TYPE_LABELS,
} from "@/lib/oiv";
import { rowPoints } from "@/lib/scoring";
import { Tasting } from "@/lib/types";

export function PrintView({
  tasting,
  photoUrl,
}: {
  tasting: Tasting;
  photoUrl: string | null;
}) {
  const criteria = CRITERIA[tasting.type];
  const sections = SECTION_ORDER.map((section) => ({
    section,
    items: criteria.filter((c) => c.section === section),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-stone-900 print:p-0">
      <div className="mb-4 flex items-start justify-between border-b border-stone-300 pb-3">
        <div>
          <h1 className="text-2xl font-bold">{tasting.name}</h1>
          <p className="text-sm text-stone-600">
            {WINE_TYPE_LABELS[tasting.type]}
            {tasting.vintage ? ` · ročník ${tasting.vintage}` : ""}
            {tasting.producer ? ` · ${tasting.producer}` : ""}
            {tasting.variety ? ` · ${tasting.variety}` : ""}
          </p>
          <p className="text-sm text-stone-500">
            Datum hodnocení: {tasting.tasted_on}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {tasting.total_score}
            <span className="text-base font-normal text-stone-400">
              {" "}
              / {maxScore(tasting.type)}
            </span>
          </div>
          <div className="text-sm font-medium">
            {MEDAL_LABELS[tasting.medal]}
          </div>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-400 text-left">
            <th className="py-1.5 pr-2">Kritérium</th>
            {GRADE_LABELS.map((g) => (
              <th key={g} className="px-1 py-1.5 text-center font-medium">
                {g}
              </th>
            ))}
            <th className="py-1.5 pl-2 text-right">Body</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(({ section, items }) => (
            <PrintSection
              key={section}
              title={SECTION_LABELS[section]}
              items={items}
              tasting={tasting}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-stone-400 font-bold">
            <td className="py-2" colSpan={6}>
              Celkem
            </td>
            <td className="py-2 text-right">{tasting.total_score}</td>
          </tr>
        </tfoot>
      </table>

      {tasting.note && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold">Poznámka</h2>
          <p className="whitespace-pre-wrap text-sm text-stone-700">
            {tasting.note}
          </p>
        </div>
      )}

      {photoUrl && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Foto lahve"
            className="max-h-64 rounded object-contain ring-1 ring-stone-200"
          />
        </div>
      )}
    </div>
  );
}

function PrintSection({
  title,
  items,
  tasting,
}: {
  title: string;
  items: typeof CRITERIA.tiche;
  tasting: Tasting;
}) {
  return (
    <>
      <tr className="bg-stone-100">
        <td colSpan={7} className="px-1 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
          {title}
        </td>
      </tr>
      {items.map((c) => {
        const grade = tasting.grades[c.id];
        return (
          <tr key={c.id} className="border-b border-stone-200">
            <td className="py-1.5 pr-2">{c.label}</td>
            {c.points.map((pts, i) => {
              const selected = grade === i;
              return (
                <td
                  key={i}
                  className={[
                    "px-1 py-1.5 text-center",
                    selected ? "bg-stone-800 font-bold text-white" : "text-stone-400",
                  ].join(" ")}
                >
                  {pts}
                </td>
              );
            })}
            <td className="py-1.5 pl-2 text-right font-semibold">
              {rowPoints(tasting.type, c.id, grade)}
            </td>
          </tr>
        );
      })}
    </>
  );
}

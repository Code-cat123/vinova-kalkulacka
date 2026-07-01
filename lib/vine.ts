// Portable ".vine" file — a self-contained snapshot of tastings that can be
// downloaded and re-imported into ANY account (records are re-created there).
// It's plain JSON with a .vine extension.

import { CRITERIA, GradeIndex, WineType } from "./oiv";
import { computeScore } from "./scoring";
import { Tasting } from "./types";

export interface VineRecord {
  name: string;
  type: WineType;
  vintage: string | null;
  producer: string | null;
  variety: string | null;
  tasted_on: string;
  grades: Record<string, GradeIndex>;
  note: string | null;
  photo_url: string | null;
}

export interface VineFile {
  format: "vine";
  version: number;
  exportedAt: string;
  count: number;
  tastings: VineRecord[];
}

export const VINE_VERSION = 1;

function toRecord(t: Tasting): VineRecord {
  return {
    name: t.name,
    type: t.type,
    vintage: t.vintage,
    producer: t.producer,
    variety: t.variety,
    tasted_on: t.tasted_on,
    grades: t.grades,
    note: t.note,
    photo_url: t.photo_url, // public URL survives across accounts; not re-uploaded
  };
}

export function toVine(tastings: Tasting[], exportedAt: string): string {
  const file: VineFile = {
    format: "vine",
    version: VINE_VERSION,
    exportedAt,
    count: tastings.length,
    tastings: tastings.map(toRecord),
  };
  return JSON.stringify(file, null, 2);
}

export function downloadVine(tastings: Tasting[], filename: string) {
  const content = toVine(tastings, new Date().toISOString());
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function vineFilename(isoDate: string): string {
  return `hodnoceni-vin_${isoDate}.vine`;
}

// Parse a .vine file's text into raw records. Accepts either the wrapped object
// ({ format:"vine", tastings:[...] }) or a bare array. The server action does
// the authoritative validation + score recompute on import.
export function parseVine(text: string): VineRecord[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Soubor není platný .vine (nelze načíst JSON).");
  }
  const arr = Array.isArray(data)
    ? data
    : (data as { tastings?: unknown })?.tastings;
  if (!Array.isArray(arr)) {
    throw new Error("Soubor .vine neobsahuje žádné záznamy.");
  }
  return arr as VineRecord[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function coerceGrades(obj: unknown, type: WineType): Record<string, GradeIndex> {
  if (!obj || typeof obj !== "object") return {};
  const valid = new Set(CRITERIA[type].map((c) => c.id));
  const out: Record<string, GradeIndex> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const n = Number(v);
    if (valid.has(k) && Number.isInteger(n) && n >= 0 && n <= 4) {
      out[k] = n as GradeIndex;
    }
  }
  return out;
}

// Validate + normalize untrusted .vine records into full Tasting rows. Shared by
// the server import (cloud) and the local import (localStorage). Score/medal are
// always recomputed; ids/timestamps are supplied by the caller.
export function normalizeRecords(
  records: unknown,
  opts: { userId: string; newId: () => string; now: string },
): Tasting[] {
  if (!Array.isArray(records)) return [];
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const out: Tasting[] = [];
  for (const raw of records) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;

    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name) continue; // name is required

    const type: WineType = r.type === "sumive" ? "sumive" : "tiche";
    const grades = coerceGrades(r.grades, type);
    const score = computeScore(grades, type);

    out.push({
      id: opts.newId(),
      user_id: opts.userId,
      name,
      type,
      vintage: str(r.vintage),
      producer: str(r.producer),
      variety: str(r.variety),
      tasted_on:
        typeof r.tasted_on === "string" && ISO_DATE.test(r.tasted_on)
          ? r.tasted_on
          : opts.now.slice(0, 10),
      grades,
      total_score: score.total,
      medal: score.medal,
      note: str(r.note),
      // Allow both public URLs and local data: URLs (local-mode photos).
      photo_url:
        typeof r.photo_url === "string" && /^(https?:|data:)/.test(r.photo_url)
          ? r.photo_url
          : null,
      photo_path: null,
      created_at: opts.now,
    });
  }
  return out;
}

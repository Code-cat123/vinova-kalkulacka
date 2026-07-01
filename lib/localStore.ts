"use client";

// Local (browser-only) data store. Used by the "local mode" — no login, nothing
// leaves the browser. Tastings live in localStorage; photos are stored inline as
// data: URLs. Same Tasting shape as the cloud so all UI components are reused.

import { computeScore } from "./scoring";
import { normalizeRecords } from "./vine";
import { SaveTastingPayload, Tasting } from "./types";

const KEY = "vinova-kalkulacka:tastings:v1";
export const LOCAL_USER = "local";

function read(): Tasting[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Tasting[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: Tasting[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function listLocal(): Tasting[] {
  // Newest first; the list view re-sorts per the active filter anyway.
  return read().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getLocal(id: string): Tasting | null {
  return read().find((t) => t.id === id) ?? null;
}

export function deleteLocal(id: string): void {
  write(read().filter((t) => t.id !== id));
}

export async function saveLocal(payload: SaveTastingPayload): Promise<string> {
  const list = read();
  const existing = payload.existingId
    ? list.find((t) => t.id === payload.existingId)
    : null;
  const id = existing?.id ?? crypto.randomUUID();

  const v = payload.values;
  const score = computeScore(v.grades, v.type);

  let photoUrl = existing?.photo_url ?? null;
  if (payload.photoFile) {
    photoUrl = await fileToDataUrl(payload.photoFile);
  } else if (payload.removePhoto) {
    photoUrl = null;
  }

  const row: Tasting = {
    id,
    user_id: LOCAL_USER,
    name: v.name,
    type: v.type,
    vintage: v.vintage,
    producer: v.producer,
    variety: v.variety,
    tasted_on: v.tasted_on,
    grades: v.grades,
    total_score: score.total,
    medal: score.medal,
    note: v.note,
    photo_url: photoUrl,
    photo_path: null,
    created_at: existing?.created_at ?? new Date().toISOString(),
  };

  write(existing ? list.map((t) => (t.id === id ? row : t)) : [row, ...list]);
  return id;
}

export function importLocal(records: unknown): {
  imported: number;
  tastings: Tasting[];
} {
  const rows = normalizeRecords(records, {
    userId: LOCAL_USER,
    newId: () => crypto.randomUUID(),
    now: new Date().toISOString(),
  });
  write([...rows, ...read()]);
  return { imported: rows.length, tastings: rows };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

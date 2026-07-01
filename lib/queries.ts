import "server-only";
import { sql } from "./db";
import { Tasting } from "./types";

// A `date` column is parsed by the driver into a Date at LOCAL midnight; using
// toISOString() would shift it across the UTC boundary (e.g. 09-15 → 09-14 in
// CEST). Format from local parts to preserve the calendar date.
function toISODate(v: unknown): string {
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(v);
}

// Map a raw DB row to the Tasting shape (grades comes back as a parsed object).
function mapRow(r: Record<string, unknown>): Tasting {
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    name: r.name as string,
    type: r.type as Tasting["type"],
    vintage: (r.vintage as string) ?? null,
    producer: (r.producer as string) ?? null,
    variety: (r.variety as string) ?? null,
    tasted_on: toISODate(r.tasted_on),
    grades: (r.grades as Tasting["grades"]) ?? {},
    total_score: Number(r.total_score ?? 0),
    medal: r.medal as Tasting["medal"],
    note: (r.note as string) ?? null,
    photo_url: (r.photo_url as string) ?? null,
    photo_path: (r.photo_path as string) ?? null,
    created_at:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : (r.created_at as string),
  };
}

export async function listTastings(userId: string): Promise<Tasting[]> {
  const rows = (await sql`
    select * from public.tastings
    where user_id = ${userId}
    order by tasted_on desc, created_at desc
  `) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export async function getTasting(
  userId: string,
  id: string,
): Promise<Tasting | null> {
  const rows = (await sql`
    select * from public.tastings
    where user_id = ${userId} and id = ${id}
    limit 1
  `) as Record<string, unknown>[];
  return rows.length ? mapRow(rows[0]) : null;
}

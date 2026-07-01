"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { sql } from "./db";
import { requireUser } from "./auth";
import { deletePhoto, uploadPhoto } from "./blob";
import { getTasting } from "./queries";
import { CRITERIA, WineType } from "./oiv";
import { computeScore, Grades } from "./scoring";
import { DEV_AUTH_BYPASS } from "./devAuth";
import { normalizeRecords } from "./vine";
import { Tasting } from "./types";

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

// Keep only valid criterion ids for the type, with an integer grade 0..4.
function coerceGrades(obj: unknown, type: WineType): Grades {
  if (!obj || typeof obj !== "object") return {};
  const valid = new Set(CRITERIA[type].map((c) => c.id));
  const out: Grades = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const n = Number(v);
    if (valid.has(k) && Number.isInteger(n) && n >= 0 && n <= 4) {
      out[k] = n as Grades[string];
    }
  }
  return out;
}

function parseGrades(raw: string | null, type: WineType): Grades {
  if (!raw) return {};
  try {
    return coerceGrades(JSON.parse(raw), type);
  } catch {
    return {};
  }
}

// Create or update a tasting from the form's FormData. Returns the row id so the
// client form can navigate to the detail page.
export async function saveTasting(fd: FormData): Promise<{ id: string }> {
  const user = await requireUser();

  const existingId = str(fd, "id");
  const name = str(fd, "name");
  if (!name) throw new Error("Název vína je povinný.");

  const type: WineType = fd.get("type") === "sumive" ? "sumive" : "tiche";
  const grades = parseGrades(str(fd, "grades"), type);
  const score = computeScore(grades, type);

  const vintage = str(fd, "vintage");
  const producer = str(fd, "producer");
  const variety = str(fd, "variety");
  const tastedOn = str(fd, "tasted_on") ?? new Date().toISOString().slice(0, 10);
  const note = str(fd, "note");

  const id = existingId ?? randomUUID();

  // Load the existing row (also enforces ownership on edit).
  const prev = existingId ? await getTasting(user.id, existingId) : null;
  if (existingId && !prev) throw new Error("Hodnocení nenalezeno.");

  // Photo handling.
  const photo = fd.get("photo");
  const removePhoto = fd.get("removePhoto") === "1";
  let photoUrl = prev?.photo_url ?? null;
  let photoPath = prev?.photo_path ?? null;

  if (photo instanceof File && photo.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // No Blob configured. In dev-bypass we keep the tasting and skip the photo;
      // otherwise this is a real misconfiguration.
      if (!DEV_AUTH_BYPASS) {
        throw new Error("BLOB_READ_WRITE_TOKEN není nastaven (úložiště fotek).");
      }
    } else {
      const uploaded = await uploadPhoto(user.id, id, photo);
      if (prev?.photo_path) await deletePhoto(prev.photo_path).catch(() => {});
      photoUrl = uploaded.url;
      photoPath = uploaded.pathname;
    }
  } else if (removePhoto) {
    if (prev?.photo_path) await deletePhoto(prev.photo_path).catch(() => {});
    photoUrl = null;
    photoPath = null;
  }

  const gradesJson = JSON.stringify(grades);

  if (prev) {
    await sql`
      update public.tastings set
        name = ${name}, type = ${type}, vintage = ${vintage},
        producer = ${producer}, variety = ${variety}, tasted_on = ${tastedOn},
        grades = ${gradesJson}::jsonb, total_score = ${score.total},
        medal = ${score.medal}, note = ${note},
        photo_url = ${photoUrl}, photo_path = ${photoPath}
      where id = ${id} and user_id = ${user.id}
    `;
  } else {
    await sql`
      insert into public.tastings
        (id, user_id, name, type, vintage, producer, variety, tasted_on,
         grades, total_score, medal, note, photo_url, photo_path)
      values
        (${id}, ${user.id}, ${name}, ${type}, ${vintage}, ${producer},
         ${variety}, ${tastedOn}, ${gradesJson}::jsonb, ${score.total},
         ${score.medal}, ${note}, ${photoUrl}, ${photoPath})
    `;
  }

  revalidatePath("/");
  revalidatePath(`/tasting/${id}`);
  return { id };
}

export async function deleteTasting(id: string): Promise<void> {
  const user = await requireUser();
  const prev = await getTasting(user.id, id);
  if (!prev) return;
  if (prev.photo_path) await deletePhoto(prev.photo_path).catch(() => {});
  await sql`delete from public.tastings where id = ${id} and user_id = ${user.id}`;
  revalidatePath("/");
}

// Import records from a .vine file into the current account as NEW rows.
// Everything is re-validated and score/medal recomputed in normalizeRecords —
// the file is untrusted. Photos are referenced by URL (not re-uploaded).
export async function importTastings(
  records: unknown,
): Promise<{ imported: number; tastings: Tasting[] }> {
  const user = await requireUser();

  const rows = normalizeRecords(records, {
    userId: user.id,
    newId: () => randomUUID(),
    now: new Date().toISOString(),
  });

  for (const t of rows) {
    await sql`
      insert into public.tastings
        (id, user_id, name, type, vintage, producer, variety, tasted_on,
         grades, total_score, medal, note, photo_url, photo_path, created_at)
      values
        (${t.id}, ${t.user_id}, ${t.name}, ${t.type}, ${t.vintage}, ${t.producer},
         ${t.variety}, ${t.tasted_on}, ${JSON.stringify(t.grades)}::jsonb,
         ${t.total_score}, ${t.medal}, ${t.note}, ${t.photo_url}, ${null},
         ${t.created_at})
    `;
  }

  revalidatePath("/");
  return { imported: rows.length, tastings: rows };
}

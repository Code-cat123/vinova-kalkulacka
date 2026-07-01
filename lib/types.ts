import { GradeIndex, Medal, WineType } from "./oiv";

export interface Tasting {
  id: string;
  user_id: string; // id uživatele z Neon Auth (Stack Auth)
  name: string; // POVINNÉ
  type: WineType;
  vintage: string | null; // ročník
  producer: string | null; // vinař / producent
  variety: string | null; // odrůda
  tasted_on: string; // ISO date, default dnes
  grades: Record<string, GradeIndex>; // criterionId -> 0..4
  total_score: number; // auto z grades
  medal: Medal; // auto
  note: string | null;
  photo_url: string | null; // veřejná (nezhádnutelná) URL z Vercel Blob
  photo_path: string | null; // klíč objektu v Blob storu (pro mazání)
  created_at: string;
}

// Fields a client submits via the form (server fills user_id, score, medal, photos).
export interface TastingFormValues {
  name: string;
  type: WineType;
  vintage: string | null;
  producer: string | null;
  variety: string | null;
  tasted_on: string;
  grades: Record<string, GradeIndex>;
  note: string | null;
}

// What TastingForm hands to its onSave callback. The callback (cloud or local)
// persists it and returns the row id to navigate to.
export interface SaveTastingPayload {
  existingId?: string;
  values: TastingFormValues;
  photoFile: File | null;
  removePhoto: boolean;
}

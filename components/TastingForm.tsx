"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GradeIndex, maxScore, WINE_TYPE_LABELS, WineType } from "@/lib/oiv";
import { computeScore, Grades } from "@/lib/scoring";
import { SaveTastingPayload, Tasting, TastingFormValues } from "@/lib/types";
import { ScoringGrid } from "./ScoringGrid";
import { MedalBadge } from "./MedalBadge";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Data-source-agnostic form. `onSave` persists the record (cloud via server
// action, or local via localStorage) and returns the row id to navigate to.
export function TastingForm({
  existing,
  existingPhotoUrl,
  onSave,
  basePath,
}: {
  existing?: Tasting;
  existingPhotoUrl?: string | null;
  onSave: (payload: SaveTastingPayload) => Promise<string>;
  basePath: string; // e.g. "/tasting" or "/local/tasting"
}) {
  const router = useRouter();

  const [type, setType] = useState<WineType>(existing?.type ?? "tiche");
  const [name, setName] = useState(existing?.name ?? "");
  const [vintage, setVintage] = useState(existing?.vintage ?? "");
  const [producer, setProducer] = useState(existing?.producer ?? "");
  const [variety, setVariety] = useState(existing?.variety ?? "");
  const [tastedOn, setTastedOn] = useState(existing?.tasted_on ?? today());
  const [note, setNote] = useState(existing?.note ?? "");
  const [grades, setGrades] = useState<Grades>(existing?.grades ?? {});

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    existingPhotoUrl ?? null,
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fileKey, setFileKey] = useState(0); // remount file input to clear it

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = computeScore(grades, type);

  function setGrade(criterionId: string, grade: GradeIndex) {
    setGrades((prev) => ({ ...prev, [criterionId]: grade }));
  }

  function onPhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setRemovePhoto(false);
    setPhotoPreview(file ? URL.createObjectURL(file) : existingPhotoUrl ?? null);
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    setFileKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);

    const values: TastingFormValues = {
      name: name.trim(),
      type,
      vintage: vintage.trim() || null,
      producer: producer.trim() || null,
      variety: variety.trim() || null,
      tasted_on: tastedOn,
      grades,
      note: note.trim() || null,
    };

    try {
      const id = await onSave({
        existingId: existing?.id,
        values,
        photoFile,
        removePhoto,
      });
      router.push(`${basePath}/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uložení se nezdařilo.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* Type switcher */}
      <div className="inline-flex rounded-lg border border-stone-300 bg-white p-1">
        {(["tiche", "sumive"] as WineType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition",
              type === t
                ? "bg-wine-600 text-white"
                : "text-stone-600 hover:bg-stone-100",
            ].join(" ")}
          >
            {WINE_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Header fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Název vína" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="např. Ryzlink rýnský, pozdní sběr"
            className={inputCls}
          />
        </Field>
        <Field label="Datum hodnocení">
          <input
            type="date"
            value={tastedOn}
            onChange={(e) => setTastedOn(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Ročník">
          <input
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            placeholder="např. 2021"
            className={inputCls}
          />
        </Field>
        <Field label="Vinař / producent">
          <input
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Odrůda">
          <input
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Scoring grid */}
      <ScoringGrid type={type} grades={grades} onChange={setGrade} />

      {score.ungradedCount > 0 && (
        <p className="text-sm text-amber-600">
          {score.ungradedCount} {pluralizeCriteria(score.ungradedCount)}{" "}
          nehodnoceno (počítá se 0 bodů).
        </p>
      )}

      {/* Note */}
      <Field label="Poznámka">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="Vlastní postřehy k vínu…"
        />
      </Field>

      {/* Photo */}
      <Field label="Foto lahve">
        <div className="flex items-start gap-4">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="Náhled lahve"
              className="h-32 w-32 rounded-lg object-cover ring-1 ring-stone-200"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-stone-100 text-3xl text-stone-300 ring-1 ring-stone-200">
              🍾
            </div>
          )}
          <div className="space-y-2">
            <input
              key={fileKey}
              type="file"
              accept="image/*"
              onChange={onPhotoSelect}
              className="block text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-wine-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-wine-700"
            />
            {photoPreview && (
              <button
                type="button"
                onClick={clearPhoto}
                className="text-sm text-red-600 hover:underline"
              >
                Odebrat foto
              </button>
            )}
          </div>
        </div>
      </Field>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {/* Sticky footer: live total + actions */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 backdrop-blur no-print">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-2xl font-bold text-stone-900">
                {score.total}
              </span>
              <span className="text-stone-400"> / {maxScore(type)}</span>
            </div>
            <MedalBadge medal={score.medal} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="rounded-lg bg-wine-600 px-5 py-2 text-sm font-medium text-white hover:bg-wine-700 disabled:opacity-50"
            >
              {saving ? "Ukládám…" : "Uložit"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function pluralizeCriteria(n: number): string {
  if (n === 1) return "kritérium";
  if (n >= 2 && n <= 4) return "kritéria";
  return "kritérií";
}

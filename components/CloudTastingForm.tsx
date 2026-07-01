"use client";

import { saveTasting } from "@/lib/actions";
import { SaveTastingPayload, Tasting } from "@/lib/types";
import { TastingForm } from "./TastingForm";

// Cloud variant: persists via the server action (Neon + Vercel Blob).
export function CloudTastingForm({
  existing,
  existingPhotoUrl,
}: {
  existing?: Tasting;
  existingPhotoUrl?: string | null;
}) {
  async function onSave(p: SaveTastingPayload): Promise<string> {
    const fd = new FormData();
    if (p.existingId) fd.set("id", p.existingId);
    fd.set("name", p.values.name);
    fd.set("type", p.values.type);
    if (p.values.vintage) fd.set("vintage", p.values.vintage);
    if (p.values.producer) fd.set("producer", p.values.producer);
    if (p.values.variety) fd.set("variety", p.values.variety);
    fd.set("tasted_on", p.values.tasted_on);
    fd.set("grades", JSON.stringify(p.values.grades));
    if (p.values.note) fd.set("note", p.values.note);
    fd.set("removePhoto", p.removePhoto ? "1" : "0");
    if (p.photoFile) fd.set("photo", p.photoFile);

    const res = await saveTasting(fd);
    return res.id;
  }

  return (
    <TastingForm
      existing={existing}
      existingPhotoUrl={existingPhotoUrl}
      onSave={onSave}
      basePath="/tasting"
    />
  );
}

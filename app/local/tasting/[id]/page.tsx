"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LocalHeader } from "@/components/LocalHeader";
import { TastingForm } from "@/components/TastingForm";
import { getLocal, saveLocal } from "@/lib/localStore";
import { Tasting } from "@/lib/types";

export default function LocalEditTastingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [tasting, setTasting] = useState<Tasting | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">(
    "loading",
  );

  useEffect(() => {
    const t = getLocal(id);
    setTasting(t);
    setStatus(t ? "ok" : "notfound");
  }, [id]);

  return (
    <div className="min-h-screen">
      <LocalHeader />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Link
              href="/local"
              className="text-sm text-stone-500 hover:underline"
            >
              ← Zpět na seznam
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">
              {status === "ok" ? tasting?.name : "Hodnocení"}
            </h1>
          </div>
          {status === "ok" && (
            <Link
              href={`/local/tasting/${id}/print`}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Tisk / PDF
            </Link>
          )}
        </div>

        {status === "loading" && <p className="text-stone-500">Načítám…</p>}
        {status === "notfound" && (
          <p className="text-stone-500">Hodnocení nenalezeno.</p>
        )}
        {status === "ok" && tasting && (
          <TastingForm
            existing={tasting}
            existingPhotoUrl={tasting.photo_url}
            onSave={saveLocal}
            basePath="/local/tasting"
          />
        )}
      </main>
    </div>
  );
}

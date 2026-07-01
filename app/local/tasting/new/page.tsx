"use client";

import Link from "next/link";
import { LocalHeader } from "@/components/LocalHeader";
import { TastingForm } from "@/components/TastingForm";
import { saveLocal } from "@/lib/localStore";

export default function LocalNewTastingPage() {
  return (
    <div className="min-h-screen">
      <LocalHeader />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <Link href="/local" className="text-sm text-stone-500 hover:underline">
            ← Zpět na seznam
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">
            Nové hodnocení
          </h1>
        </div>
        <TastingForm onSave={saveLocal} basePath="/local/tasting" />
      </main>
    </div>
  );
}

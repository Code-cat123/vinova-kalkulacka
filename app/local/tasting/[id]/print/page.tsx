"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PrintView } from "@/components/PrintView";
import { PrintButton } from "@/components/PrintButton";
import { getLocal } from "@/lib/localStore";
import { Tasting } from "@/lib/types";

export default function LocalPrintPage() {
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

  if (status === "loading") {
    return <p className="p-6 text-stone-500">Načítám…</p>;
  }
  if (status === "notfound" || !tasting) {
    return <p className="p-6 text-stone-500">Hodnocení nenalezeno.</p>;
  }

  return (
    <div className="min-h-screen bg-stone-100 py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between px-4">
        <Link
          href={`/local/tasting/${id}`}
          className="text-sm text-stone-500 hover:underline"
        >
          ← Zpět
        </Link>
        <PrintButton />
      </div>
      <div className="mx-auto max-w-3xl px-4 print:px-0">
        <div className="rounded-xl bg-white shadow print:rounded-none print:shadow-none">
          <PrintView tasting={tasting} photoUrl={tasting.photo_url} />
        </div>
      </div>
    </div>
  );
}

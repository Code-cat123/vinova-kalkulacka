"use client";

import { useEffect, useState } from "react";
import { LocalHeader } from "@/components/LocalHeader";
import { TastingListClient } from "@/components/TastingListClient";
import { deleteLocal, importLocal, listLocal } from "@/lib/localStore";
import { Tasting } from "@/lib/types";

export default function LocalListPage() {
  const [rows, setRows] = useState<Tasting[] | null>(null);

  // localStorage is only available in the browser.
  useEffect(() => {
    setRows(listLocal());
  }, []);

  return (
    <div className="min-h-screen">
      <LocalHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {rows === null ? (
          <p className="text-stone-500">Načítám…</p>
        ) : (
          <TastingListClient
            initialRows={rows}
            onDelete={async (id) => {
              deleteLocal(id);
            }}
            onImport={async (records) => importLocal(records)}
            basePath="/local/tasting"
            newHref="/local/tasting/new"
          />
        )}
      </main>
    </div>
  );
}

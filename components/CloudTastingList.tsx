"use client";

import { deleteTasting, importTastings } from "@/lib/actions";
import { Tasting } from "@/lib/types";
import { TastingListClient } from "./TastingListClient";

// Cloud variant: delete/import via server actions (Neon).
export function CloudTastingList({ initialRows }: { initialRows: Tasting[] }) {
  return (
    <TastingListClient
      initialRows={initialRows}
      onDelete={(id) => deleteTasting(id)}
      onImport={(records) => importTastings(records)}
      basePath="/tasting"
      newHref="/tasting/new"
    />
  );
}

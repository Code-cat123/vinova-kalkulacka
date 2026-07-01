"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { MedalBadge } from "@/components/MedalBadge";
import {
  DEFAULT_FILTERS,
  FilterState,
  Filters,
} from "@/components/Filters";
import { WINE_TYPE_LABELS } from "@/lib/oiv";
import { Tasting } from "@/lib/types";
import { downloadCSV, downloadXLSX, exportFilename } from "@/lib/export";
import { downloadVine, parseVine, vineFilename } from "@/lib/vine";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function applyFilters(rows: Tasting[], f: FilterState): Tasting[] {
  const q = f.search.trim().toLowerCase();
  let out = rows.filter((t) => {
    if (f.type !== "vse" && t.type !== f.type) return false;
    if (f.medal !== "vse" && t.medal !== f.medal) return false;
    if (f.dateFrom && t.tasted_on < f.dateFrom) return false;
    if (f.dateTo && t.tasted_on > f.dateTo) return false;
    if (q) {
      const hay = [t.name, t.producer, t.variety, t.note]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
    let cmp = 0;
    if (f.sortBy === "datum") {
      cmp = a.tasted_on.localeCompare(b.tasted_on);
    } else if (f.sortBy === "skore") {
      cmp = a.total_score - b.total_score;
    } else {
      cmp = a.name.localeCompare(b.name, "cs");
    }
    return f.sortDir === "asc" ? cmp : -cmp;
  });

  return out;
}

export function TastingListClient({
  initialRows,
  onDelete,
  onImport,
  basePath,
  newHref,
}: {
  initialRows: Tasting[];
  onDelete: (id: string) => Promise<void>;
  onImport: (
    records: unknown,
  ) => Promise<{ imported: number; tastings: Tasting[] }>;
  basePath: string; // item links: `${basePath}/${id}` and `/print`
  newHref: string;
}) {
  const [rows, setRows] = useState<Tasting[]>(initialRows);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [exportAll, setExportAll] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  function handleDelete(t: Tasting) {
    if (!confirm(`Opravdu smazat hodnocení „${t.name}“?`)) return;
    setRows((prev) => prev.filter((x) => x.id !== t.id)); // optimistic
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(t.id);
      return next;
    });
    startTransition(async () => {
      await onDelete(t.id);
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((t) => selected.has(t.id));

  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((t) => next.delete(t.id));
      else filtered.forEach((t) => next.add(t.id));
      return next;
    });
  }

  // Spreadsheet export honours the "export all" toggle / current filter.
  const spreadsheetData = () => (exportAll ? rows : filtered);

  // .vine export: selected records if any, otherwise the current filtered view.
  const selectedRows = rows.filter((t) => selected.has(t.id));
  const vineData = selected.size ? selectedRows : filtered;

  function handleVineExport() {
    if (!vineData.length) return;
    downloadVine(vineData, vineFilename(today()));
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const records = parseVine(text);
      const res = await onImport(records);
      setRows((prev) => [...res.tastings, ...prev]);
      alert(`Importováno ${res.imported} záznamů ze souboru .vine.`);
    } catch (err) {
      alert(
        "Import selhal: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Databáze hodnocení
          </h1>
          <p className="text-sm text-stone-500">
            {filtered.length} z {rows.length} záznamů
            {selected.size > 0 && ` · vybráno ${selected.size}`}
          </p>
        </div>
        <Link
          href={newHref}
          className="rounded-lg bg-wine-600 px-4 py-2 text-sm font-medium text-white hover:bg-wine-700"
        >
          + Nové hodnocení
        </Link>
      </div>

      <Filters value={filters} onChange={setFilters} />

      {/* Spreadsheet export */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
        <span className="text-sm font-medium text-stone-700">Export tabulky:</span>
        <button
          onClick={() =>
            downloadCSV(spreadsheetData(), exportFilename("csv", today()))
          }
          disabled={spreadsheetData().length === 0}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          CSV
        </button>
        <button
          onClick={() =>
            downloadXLSX(spreadsheetData(), exportFilename("xlsx", today()))
          }
          disabled={spreadsheetData().length === 0}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          XLSX
        </button>
        <label className="flex items-center gap-1.5 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={exportAll}
            onChange={(e) => setExportAll(e.target.checked)}
          />
          Exportovat vše (ignorovat filtr)
        </label>
      </div>

      {/* Portable .vine backup / transfer */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
        <span className="text-sm font-medium text-stone-700">
          Záloha / přenos (.vine):
        </span>
        <button
          onClick={handleVineExport}
          disabled={vineData.length === 0}
          className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
          title="Stáhne vybrané záznamy (nebo aktuální výběr filtru) do souboru .vine"
        >
          ↓ Stáhnout .vine ({vineData.length})
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          title="Nahraje záznamy ze souboru .vine do tohoto účtu jako nové"
        >
          {importing ? "Importuji…" : "↑ Importovat .vine"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".vine,application/json"
          onChange={handleImport}
          className="hidden"
        />
        <span className="text-xs text-stone-400">
          {selected.size
            ? `Stáhne se ${selected.size} vybraných.`
            : "Bez výběru se stáhne aktuální filtr. Import vytvoří nové záznamy."}
        </span>
      </div>

      {/* List */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
            {rows.length === 0
              ? "Zatím žádná hodnocení. Začněte tlačítkem „Nové hodnocení“."
              : "Žádné záznamy neodpovídají filtru."}
          </div>
        ) : (
          <TastingTable
            rows={filtered}
            onDelete={handleDelete}
            selected={selected}
            onToggle={toggleSelect}
            allSelected={allFilteredSelected}
            onToggleAll={toggleAllFiltered}
            basePath={basePath}
          />
        )}
      </div>
    </>
  );
}

function TastingTable({
  rows,
  onDelete,
  selected,
  onToggle,
  allSelected,
  onToggleAll,
  basePath,
}: {
  rows: Tasting[];
  onDelete: (t: Tasting) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  allSelected: boolean;
  onToggleAll: () => void;
  basePath: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      {/* Desktop table */}
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                title="Vybrat vše (dle filtru)"
              />
            </th>
            <th className="px-4 py-2.5">Název</th>
            <th className="px-4 py-2.5">Typ</th>
            <th className="px-4 py-2.5">Ročník</th>
            <th className="px-4 py-2.5">Vinař</th>
            <th className="px-4 py-2.5">Datum</th>
            <th className="px-4 py-2.5 text-right">Skóre</th>
            <th className="px-4 py-2.5">Medaile</th>
            <th className="px-4 py-2.5 text-right">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((t) => (
            <tr key={t.id} className="hover:bg-stone-50">
              <td className="px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => onToggle(t.id)}
                />
              </td>
              <td className="px-4 py-2.5 font-medium text-stone-900">
                <Link href={`${basePath}/${t.id}`} className="hover:underline">
                  {t.name}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <TypeBadge type={t.type} />
              </td>
              <td className="px-4 py-2.5 text-stone-600">{t.vintage ?? "—"}</td>
              <td className="px-4 py-2.5 text-stone-600">
                {t.producer ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-stone-600">{t.tasted_on}</td>
              <td className="px-4 py-2.5 text-right font-semibold">
                {t.total_score}
              </td>
              <td className="px-4 py-2.5">
                <MedalBadge medal={t.medal} />
              </td>
              <td className="px-4 py-2.5">
                <RowActions t={t} onDelete={onDelete} basePath={basePath} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="divide-y divide-stone-100 sm:hidden">
        {rows.map((t) => (
          <div key={t.id} className="flex gap-3 p-4">
            <input
              type="checkbox"
              checked={selected.has(t.id)}
              onChange={() => onToggle(t.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`${basePath}/${t.id}`}
                  className="font-medium text-stone-900"
                >
                  {t.name}
                </Link>
                <span className="text-lg font-bold">{t.total_score}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <TypeBadge type={t.type} />
                {t.vintage && <span>· {t.vintage}</span>}
                {t.producer && <span>· {t.producer}</span>}
                <span>· {t.tasted_on}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <MedalBadge medal={t.medal} />
                <RowActions t={t} onDelete={onDelete} basePath={basePath} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RowActions({
  t,
  onDelete,
  basePath,
}: {
  t: Tasting;
  onDelete: (t: Tasting) => void;
  basePath: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      <Link
        href={`${basePath}/${t.id}`}
        className="text-stone-600 hover:text-wine-700 hover:underline"
        title="Detail / editovat"
      >
        Detail
      </Link>
      <Link
        href={`${basePath}/${t.id}/print`}
        className="text-stone-600 hover:text-wine-700 hover:underline"
        title="Tisk / PDF"
      >
        PDF
      </Link>
      <button
        onClick={() => onDelete(t)}
        className="text-red-600 hover:underline"
        title="Smazat"
      >
        Smazat
      </button>
    </div>
  );
}

function TypeBadge({ type }: { type: Tasting["type"] }) {
  const styles =
    type === "sumive" ? "bg-sky-100 text-sky-700" : "bg-wine-100 text-wine-700";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {WINE_TYPE_LABELS[type]}
    </span>
  );
}

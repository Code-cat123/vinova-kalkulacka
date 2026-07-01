// Export helpers — CSV (hand-rolled, RFC 4180, UTF-8 + BOM) and XLSX (SheetJS).

import { CRITERIA, GRADE_LABELS, MEDAL_LABELS, WINE_TYPE_LABELS } from "./oiv";
import { rowPoints, UNIFIED_CRITERIA } from "./scoring";
import { Tasting } from "./types";

// Whether a criterion id belongs to the given wine type (perlení only šumivé).
function appliesTo(t: Tasting, criterionId: string): boolean {
  return CRITERIA[t.type].some((c) => c.id === criterionId);
}

interface Column {
  header: string;
  value: (t: Tasting) => string | number;
}

// Summary columns first, then per-criterion (level + points) for the unified set.
function buildColumns(): Column[] {
  const cols: Column[] = [
    { header: "nazev", value: (t) => t.name },
    { header: "typ", value: (t) => WINE_TYPE_LABELS[t.type] },
    { header: "rocnik", value: (t) => t.vintage ?? "" },
    { header: "vinar", value: (t) => t.producer ?? "" },
    { header: "odruda", value: (t) => t.variety ?? "" },
    { header: "datum", value: (t) => t.tasted_on },
    { header: "skore", value: (t) => t.total_score },
    { header: "medaile", value: (t) => MEDAL_LABELS[t.medal] },
    { header: "poznamka", value: (t) => t.note ?? "" },
  ];

  for (const c of UNIFIED_CRITERIA) {
    cols.push({
      header: `${c.id}_uroven`,
      value: (t) => {
        if (!appliesTo(t, c.id)) return ""; // např. perlení u tichých
        const g = t.grades[c.id];
        return g === undefined || g === null ? "" : GRADE_LABELS[g];
      },
    });
    cols.push({
      header: `${c.id}_body`,
      value: (t) => {
        if (!appliesTo(t, c.id)) return ""; // např. perlení u tichých
        const g = t.grades[c.id];
        return g === undefined || g === null ? "" : rowPoints(t.type, c.id, g);
      },
    });
  }

  return cols;
}

function buildMatrix(tastings: Tasting[]): {
  headers: string[];
  rows: (string | number)[][];
} {
  const cols = buildColumns();
  const headers = cols.map((c) => c.header);
  const rows = tastings.map((t) => cols.map((c) => c.value(t)));
  return { headers, rows };
}

// ---- CSV ----

function csvCell(v: string | number): string {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toCSV(tastings: Tasting[]): string {
  const { headers, rows } = buildMatrix(tastings);
  const lines = [headers, ...rows].map((r) => r.map(csvCell).join(","));
  // CRLF line endings + UTF-8 BOM for correct diacritics in Excel.
  return "﻿" + lines.join("\r\n");
}

export function downloadCSV(tastings: Tasting[], filename: string) {
  const blob = new Blob([toCSV(tastings)], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, filename);
}

// ---- XLSX (dynamic import so SheetJS stays out of the main bundle) ----

export async function downloadXLSX(tastings: Tasting[], filename: string) {
  const XLSX = await import("xlsx");
  const { headers, rows } = buildMatrix(tastings);

  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Bold header row.
  for (let c = 0; c < headers.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[ref]) ws[ref].s = { font: { bold: true } };
  }

  // Freeze first row.
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2" };
  (ws as Record<string, unknown>)["!panes"] = [
    { state: "frozen", ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" },
  ];

  // Auto column widths.
  ws["!cols"] = headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      const len = String(row[i] ?? "").length;
      if (len > max) max = len;
    }
    return { wch: Math.min(Math.max(max + 2, 8), 50) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hodnocení");
  XLSX.writeFile(wb, filename, { bookType: "xlsx" });
}

// ---- filename + download helpers ----

export function exportFilename(ext: "csv" | "xlsx", isoDate: string): string {
  return `hodnoceni-vin_${isoDate}.${ext}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

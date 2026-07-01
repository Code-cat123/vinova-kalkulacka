"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-wine-600 px-4 py-2 text-sm font-medium text-white hover:bg-wine-700"
    >
      Tisk / Uložit jako PDF
    </button>
  );
}

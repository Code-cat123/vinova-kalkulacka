"use client";

import Link from "next/link";

export function LocalHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/local"
          className="flex items-center gap-2 font-semibold text-stone-900"
        >
          <span className="text-xl">🍷</span>
          <span>Vínová kalkulačka</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
            Lokální režim (data v prohlížeči)
          </span>
          <Link
            href="/login"
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cloud / přihlášení
          </Link>
        </div>
      </div>
    </header>
  );
}

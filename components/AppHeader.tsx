import Link from "next/link";
import { DEV_AUTH_BYPASS } from "@/lib/devAuth";
import { SignOutButton } from "./SignOutButton";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-stone-900"
        >
          <span className="text-xl">🍷</span>
          <span>Vínová kalkulačka</span>
        </Link>
        <div className="flex items-center gap-2">
          {DEV_AUTH_BYPASS ? (
            <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
              DEV režim (bez přihlášení)
            </span>
          ) : (
            <>
              <Link
                href="/account"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                Účet
              </Link>
              <SignOutButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

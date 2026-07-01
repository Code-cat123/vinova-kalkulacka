import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/" className="text-sm text-stone-500 hover:underline">
          ← Zpět na seznam
        </Link>
        <h1 className="mb-1 mt-1 text-2xl font-bold text-stone-900">Účet</h1>
        <p className="mb-6 text-sm text-stone-500">
          Přihlášen jako {user.email ?? "—"}
        </p>

        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-700">
            Nastavení účtu a propojení metod přihlášení
          </h2>
          <p className="text-sm text-stone-600">
            Správa účtu, propojení GitHub i Google a odhlášení probíhá přes
            Neon Auth (Stack Auth).
          </p>
          <Link
            href="/handler/account-settings"
            className="inline-block rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Otevřít nastavení účtu
          </Link>
          <p className="pt-2 text-xs text-stone-400">
            Tip: GitHub i Google se sloučí automaticky, pokud mají stejný
            ověřený e-mail. Při různých e-mailech je propojíte v nastavení účtu.
          </p>
        </div>
      </main>
    </div>
  );
}

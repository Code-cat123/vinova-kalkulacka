"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStackApp } from "@stackframe/stack";

const STACK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_STACK_PROJECT_ID);

function LoginInner() {
  const params = useSearchParams();
  const forbidden = params.get("error") === "forbidden";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-wine-50 to-stone-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg ring-1 ring-stone-200">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🍷</div>
          <h1 className="text-xl font-semibold text-stone-900">
            Vínová kalkulačka
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Hodnocení vín podle systému OIV 100
          </p>
        </div>

        {forbidden && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            Tento účet nemá přístup.
          </div>
        )}

        {STACK_CONFIGURED ? (
          <OAuthButtons />
        ) : (
          <div className="rounded-lg bg-stone-50 p-3 text-sm text-stone-500 ring-1 ring-stone-200">
            Cloudové přihlášení není nakonfigurováno. Použij lokální režim níže —
            data zůstanou jen v tomto prohlížeči.
          </div>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
          <span className="h-px flex-1 bg-stone-200" />
          nebo
          <span className="h-px flex-1 bg-stone-200" />
        </div>

        <Link
          href="/local"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
        >
          Pokračovat bez přihlášení (lokálně)
        </Link>
        <p className="mt-2 text-center text-xs text-stone-400">
          Lokální režim ukládá data jen v tomto prohlížeči. Přenos mezi
          zařízeními/účty přes soubor .vine.
        </p>
      </div>
    </main>
  );
}

function OAuthButtons() {
  const app = useStackApp();
  const [loading, setLoading] = useState<"github" | "google" | null>(null);

  async function signIn(provider: "github" | "google") {
    setLoading(provider);
    try {
      await app.signInWithOAuth(provider);
    } catch (e) {
      setLoading(null);
      alert(
        "Přihlášení selhalo: " + (e instanceof Error ? e.message : String(e)),
      );
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => signIn("github")}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        <GitHubIcon />
        {loading === "github" ? "Přesměrování…" : "Přihlásit přes GitHub"}
      </button>

      <button
        onClick={() => signIn("google")}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50 disabled:opacity-60"
      >
        <GoogleIcon />
        {loading === "google" ? "Přesměrování…" : "Přihlásit přes Google"}
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.5 34.5 26.9 35 24 35c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.6 5.6C40.9 36.5 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5Z" />
    </svg>
  );
}

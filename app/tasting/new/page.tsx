import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CloudTastingForm } from "@/components/CloudTastingForm";
import { requireUser } from "@/lib/auth";

export default async function NewTastingPage() {
  await requireUser();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <Link href="/" className="text-sm text-stone-500 hover:underline">
            ← Zpět na seznam
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">
            Nové hodnocení
          </h1>
        </div>
        <CloudTastingForm />
      </main>
    </div>
  );
}

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CloudTastingForm } from "@/components/CloudTastingForm";
import { requireUser } from "@/lib/auth";
import { getTasting } from "@/lib/queries";

export default async function EditTastingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const tasting = await getTasting(user.id, id);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-stone-500 hover:underline">
              ← Zpět na seznam
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">
              {tasting ? tasting.name : "Hodnocení"}
            </h1>
          </div>
          {tasting && (
            <Link
              href={`/tasting/${id}/print`}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Tisk / PDF
            </Link>
          )}
        </div>

        {tasting ? (
          <CloudTastingForm
            existing={tasting}
            existingPhotoUrl={tasting.photo_url}
          />
        ) : (
          <p className="text-stone-500">
            Hodnocení nenalezeno nebo k němu nemáte přístup.
          </p>
        )}
      </main>
    </div>
  );
}

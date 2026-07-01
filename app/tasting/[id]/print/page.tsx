import Link from "next/link";
import { PrintView } from "@/components/PrintView";
import { PrintButton } from "@/components/PrintButton";
import { requireUser } from "@/lib/auth";
import { getTasting } from "@/lib/queries";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const tasting = await getTasting(user.id, id);

  if (!tasting) {
    return (
      <p className="p-6 text-stone-500">
        Hodnocení nenalezeno nebo k němu nemáte přístup.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between px-4">
        <Link
          href={`/tasting/${id}`}
          className="text-sm text-stone-500 hover:underline"
        >
          ← Zpět
        </Link>
        <PrintButton />
      </div>
      <div className="mx-auto max-w-3xl px-4 print:px-0">
        <div className="rounded-xl bg-white shadow print:rounded-none print:shadow-none">
          <PrintView tasting={tasting} photoUrl={tasting.photo_url} />
        </div>
      </div>
    </div>
  );
}

import { AppHeader } from "@/components/AppHeader";
import { CloudTastingList } from "@/components/CloudTastingList";
import { requireUser } from "@/lib/auth";
import { listTastings } from "@/lib/queries";

// Reads run server-side against Neon; ownership enforced by user id.
export default async function ListPage() {
  const user = await requireUser();
  const rows = await listTastings(user.id);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <CloudTastingList initialRows={rows} />
      </main>
    </div>
  );
}

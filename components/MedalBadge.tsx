import { Medal, MEDAL_LABELS } from "@/lib/oiv";

const STYLES: Record<Medal, string> = {
  velka_zlata: "bg-amber-200 text-amber-900 border-amber-400",
  zlata: "bg-yellow-100 text-yellow-800 border-yellow-300",
  stribrna: "bg-stone-200 text-stone-700 border-stone-400",
  zadna: "bg-stone-100 text-stone-500 border-stone-300",
};

export function MedalBadge({
  medal,
  className = "",
}: {
  medal: Medal;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[medal]} ${className}`}
    >
      {medal !== "zadna" && <span aria-hidden>🏅</span>}
      {MEDAL_LABELS[medal]}
    </span>
  );
}

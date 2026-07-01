"use client";

import { useUser } from "@stackframe/stack";

export function SignOutButton() {
  const user = useUser();
  return (
    <button
      onClick={() => user?.signOut()}
      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
    >
      Odhlásit
    </button>
  );
}

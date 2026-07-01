import "server-only";
import { redirect } from "next/navigation";
import { STACK_CONFIGURED, stackServerApp } from "@/stack";
import { DEV_AUTH_BYPASS, DEV_USER } from "./devAuth";

// Optional hard allowlist for a personal app. If ALLOWED_EMAILS is set, only
// those accounts are permitted; anyone else is signed out.
function allowedEmails(): string[] | null {
  const raw = process.env.ALLOWED_EMAILS;
  if (!raw) return null;
  const list = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.length ? list : null;
}

// Require an authenticated, allowed user. Redirects to /login (Stack sign-in)
// when not signed in. Returns the current user's id + email.
export async function requireUser(): Promise<{ id: string; email: string | null }> {
  if (DEV_AUTH_BYPASS) return DEV_USER;

  // No cloud auth configured → the cloud area isn't usable; send the user to
  // the local (browser-only) mode instead of erroring.
  if (!STACK_CONFIGURED) redirect("/local");

  const user = await stackServerApp.getUser({ or: "redirect" });

  const allow = allowedEmails();
  const email = user.primaryEmail?.toLowerCase() ?? null;
  if (allow && (!email || !allow.includes(email))) {
    await user.signOut();
    redirect("/login?error=forbidden");
  }

  return { id: user.id, email: user.primaryEmail ?? null };
}

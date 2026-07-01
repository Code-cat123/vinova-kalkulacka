import "server-only";
import { StackServerApp } from "@stackframe/stack";

// Whether Stack Auth (cloud login) is configured. When it isn't, the app still
// runs fully in local mode — see requireUser(), which routes to /local instead
// of throwing. Importing this module must never throw (the root layout imports
// it), so we always construct with safe fallbacks; env is enforced at the auth
// entry point (requireUser), not here.
export const STACK_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
    process.env.STACK_SECRET_SERVER_KEY,
);

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId:
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID ||
    "123e4567-e89b-42d3-a456-426614174000", // build-time placeholder (v4 UUID)
  publishableClientKey:
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "placeholder",
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY || "placeholder",
  urls: {
    signIn: "/login",
    afterSignIn: "/",
    afterSignUp: "/",
    afterSignOut: "/login",
  },
});

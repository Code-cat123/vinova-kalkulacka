// Local development auth bypass. Lets the app run against Neon WITHOUT Stack
// Auth configured — a fake local user is used instead. This is ONLY ever active
// in development; in a production build (NODE_ENV=production) it is always off,
// regardless of the flag, so it can never weaken the deployed app.
export const DEV_AUTH_BYPASS =
  process.env.DEV_AUTH_BYPASS === "1" &&
  process.env.NODE_ENV !== "production";

// Stable fake user id; rows created in dev are owned by this id.
export const DEV_USER = { id: "dev-local-user", email: "dev@local" };

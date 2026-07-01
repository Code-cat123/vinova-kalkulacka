import "server-only";
import { neon } from "@neondatabase/serverless";

// Neon serverless SQL client (HTTP). Server-only — never import from a client
// component. All data access goes through here; ownership is enforced in queries.
// At runtime DATABASE_URL is required. During `next build` (page-data
// collection) env may be absent, so fall back to a well-formed placeholder
// only then — otherwise fail loudly instead of silently using a dead URL.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (!process.env.DATABASE_URL && !isBuildPhase) {
  throw new Error("DATABASE_URL není nastavena.");
}

export const sql = neon(
  process.env.DATABASE_URL ||
    "postgresql://user:pass@placeholder.neon.tech/db?sslmode=require",
);

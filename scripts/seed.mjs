// Optional LOCAL-ONLY seed script for Neon. Inserts a few sample tastings.
//
// Vlastnictví řádků je dané user_id (id uživatele z Neon Auth / Stack Auth).
// Nejdříve se jednou přihlaste v aplikaci, pak najděte své user id v Neonu:
//   select id, name, primary_email from neon_auth.users_sync;
//
// Usage:
//   DATABASE_URL=postgresql://...neon.tech/...?sslmode=require \
//   SEED_USER_ID=<vase-user-id> \
//   node scripts/seed.mjs

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
const userId = process.env.SEED_USER_ID;

if (!url || !userId) {
  console.error("Chybí env: DATABASE_URL, SEED_USER_ID");
  process.exit(1);
}

const sql = neon(url);

// total_score / medal odpovídají lib/oiv.ts.
const samples = [
  {
    name: "Ryzlink rýnský, pozdní sběr",
    type: "tiche",
    vintage: "2021",
    producer: "Vinařství Ukázka",
    variety: "Ryzlink rýnský",
    tasted_on: "2024-09-15",
    grades: {
      vz_cirost: 0, vz_vzhled: 0, vu_cistota: 0, vu_intenzita: 1, vu_kvalita: 0,
      ch_cistota: 0, ch_intenzita: 0, ch_perzistence: 1, ch_kvalita: 0, za_dojem: 0,
    },
    total_score: 98,
    medal: "velka_zlata",
    note: "Krásná mineralita, dlouhá perzistence.",
  },
  {
    name: "Sekt Brut, méthode traditionnelle",
    type: "sumive",
    vintage: "2019",
    producer: "Sektárna Ukázka",
    variety: "Chardonnay / Pinot Noir",
    tasted_on: "2024-12-31",
    grades: {
      vz_cirost: 0, vz_vzhled: 1, vz_perleni: 0, vu_cistota: 0, vu_intenzita: 1,
      vu_kvalita: 1, ch_cistota: 0, ch_intenzita: 1, ch_perzistence: 1,
      ch_kvalita: 1, za_dojem: 1,
    },
    total_score: 90,
    medal: "zlata",
    note: "Jemné perlení, brioškové tóny.",
  },
  {
    name: "Veltlínské zelené",
    type: "tiche",
    vintage: "2022",
    producer: "Vinařství Ukázka",
    variety: "Veltlínské zelené",
    tasted_on: "2024-06-02",
    grades: {
      vz_cirost: 1, vz_vzhled: 1, vu_cistota: 1, vu_intenzita: 2, vu_kvalita: 2,
      ch_cistota: 1, ch_intenzita: 1, ch_perzistence: 2, ch_kvalita: 2, za_dojem: 2,
    },
    total_score: 78,
    medal: "zadna",
    note: "Svěží, pitelné, mladé víno.",
  },
];

let inserted = 0;
for (const s of samples) {
  await sql`
    insert into public.tastings
      (user_id, name, type, vintage, producer, variety, tasted_on,
       grades, total_score, medal, note)
    values
      (${userId}, ${s.name}, ${s.type}, ${s.vintage}, ${s.producer},
       ${s.variety}, ${s.tasted_on}, ${JSON.stringify(s.grades)}::jsonb,
       ${s.total_score}, ${s.medal}, ${s.note})
  `;
  inserted += 1;
  console.log(" -", s.name);
}

console.log(`Vloženo ${inserted} záznamů.`);

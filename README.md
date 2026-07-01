# Vínová kalkulačka 🍷

Osobní webová aplikace pro zaznamenávání a správu degustačních hodnocení vín podle
**100-bodového systému OIV 2009** (NVC/OIV2009). Tiché i šumivé víno, výpočet skóre a medailí,
fotky lahví, export do CSV/XLSX a tisk jednoho hodnocení do PDF.

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Databáze:** **Neon** (Postgres) — přístup ze serveru přes `@neondatabase/serverless`
- **Auth:** **Neon Auth (Stack Auth)** — OAuth přes GitHub a Google
- **Fotky:** **Vercel Blob**
- **Deploy:** Vercel

UI je kompletně v češtině. Aplikace je jednouživatelská (osobní log), ale dostupná z více zařízení.

### Dva režimy

- **☁️ Cloud** (`/`) — přihlášení přes GitHub/Google (Neon Auth), data v Neon Postgresu, fotky ve
  Vercel Blob, dostupné z více zařízení. Vyžaduje nakonfigurovaný cloud (viz níže).
- **💾 Lokální** (`/local`) — **bez přihlášení**, data se ukládají **jen v tomto prohlížeči**
  (localStorage), fotky inline. Funguje okamžitě bez jakéhokoliv nastavení. Přenos mezi
  zařízeními/účty přes soubor **`.vine`** (Stáhnout .vine → Importovat .vine).

Když cloud není nakonfigurován, appka automaticky přesměruje na lokální režim. Přepínat lze na
stránce `/login` a v hlavičce.

### Architektura

- **Data:** veškerý CRUD běží **na serveru** (Server Actions + server komponenty) proti Neonu.
  Vlastnictví záznamů se vynucuje v dotazech (`where user_id = <přihlášený uživatel>`) — žádná RLS
  není potřeba. K Neonu se z prohlížeče nikdy nepřipojujeme.
- **Auth:** Neon Auth (Stack Auth). Chráněné stránky volají `requireUser()`, který bez přihlášení
  přesměruje na `/login`. Stack si spravuje vlastní auth routy pod `/handler/*`.
- **Fotky:** upload na Vercel Blob ze server action; URL se ukládá do řádku. Bloby mají nezhádnutelné URL.

---

## Rychlý start (lokálně)

```bash
npm install
cp .env.local.example .env.local   # a doplňte hodnoty (viz níže)
npm run dev                        # http://localhost:3000
```

Další skripty:

```bash
npm run build      # produkční build
npm run start      # spuštění produkčního buildu
npm test           # unit testy (OIV tabulky: max = 100, vzorové součty, medaile)
```

---

## 1) Neon — databáze

1. Vytvořte projekt na [neon.tech](https://neon.tech).
2. **Connect → Connection string** (doporučeně *pooled*) → vložte do `DATABASE_URL`.
3. Spusťte migraci `db/migrations/0001_init.sql` (vytvoří tabulku `public.tastings` a index).
   Buď v **Neon SQL Editoru** (vložit a spustit), nebo přes `psql`:
   ```bash
   psql "$DATABASE_URL" -f db/migrations/0001_init.sql
   ```

## 2) Neon Auth (Stack Auth) — přihlášení

1. V **Neon Console → Auth** zapněte Neon Auth. Tím se vytvoří Stack Auth projekt a do databáze se
   začne synchronizovat tabulka `neon_auth.users_sync` (uživatelé).
2. Zkopírujte klíče do env:
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY`
3. V Stack Auth dashboardu (**Auth → Providers / OAuth**) zapněte **GitHub** a **Google** a vyplňte
   jejich OAuth Client ID + Secret:
   - **GitHub:** OAuth App → callback URL nastavte podle pokynu v Stack dashboardu
     (typicky `https://api.stack-auth.com/.../callback` nebo doménu uvedenou u providera).
   - **Google:** OAuth Client (Web) → Authorized redirect URI dle pokynu v Stack dashboardu.
   - Stack pro vývoj nabízí i „shared" OAuth klíče, takže přihlášení jde vyzkoušet i bez vlastních.
4. Do **povolených domén / redirect URLs** v Stacku přidejte `http://localhost:3000` i produkční doménu.

> Žádná jiná metoda přihlášení (heslo, magic-link, telefon/SMS) se nepoužívá — jen GitHub a Google OAuth.

## 3) Vercel Blob — fotky

1. Ve **Vercel → Storage → Blob** vytvořte Blob store a propojte ho s projektem.
2. Token `BLOB_READ_WRITE_TOKEN` se při propojení doplní automaticky do env projektu na Vercelu;
   pro lokální vývoj ho zkopírujte do `.env.local`.

## 4) Env proměnné

Zkopírujte `.env.local.example` do `.env.local` a vyplňte:

```
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
BLOB_READ_WRITE_TOKEN=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Volitelně: allowlist účtů (osobní appka)
# ALLOWED_EMAILS=tvuj@email.cz,druhy@email.cz
```

Na **Vercelu** nastavte stejné proměnné v **Project → Settings → Environment Variables**
(`DATABASE_URL` a `BLOB_READ_WRITE_TOKEN` se přes Neon/Blob integrace často doplní samy).
`NEXT_PUBLIC_SITE_URL` nastavte na produkční doménu.

### Omezení na jednoho uživatele (volitelné)

OAuth registraci nelze „vypnout", ale data jsou vázaná na `user_id`, takže cizí účet uvidí **prázdnou**
aplikaci. Tvrdší zámek zapnete proměnnou `ALLOWED_EMAILS` (čárkou oddělený seznam) — `requireUser()`
po přihlášení ověří e-mail a nepovolený účet odhlásí a přesměruje na `/login`.

## 5) Deploy na Vercel

1. Naimportujte repozitář do Vercelu. Aplikace je v podsložce — nastavte **Root Directory** na
   `vinova-kalkulacka`.
2. Nastavte env proměnné (viz výše) a propojte Neon + Vercel Blob.
3. Po nasazení doplňte produkční doménu do povolených URL v Stack Auth a nastavte `NEXT_PUBLIC_SITE_URL`.

---

## Volitelný seed (vzorová data)

`scripts/seed.mjs` vloží 2–3 vzorové záznamy. Nejdříve se jednou přihlaste v aplikaci, pak v Neonu
zjistěte své `user id`:

```sql
select id, name, primary_email from neon_auth.users_sync;
```

a spusťte:

```bash
DATABASE_URL="postgresql://...neon.tech/...?sslmode=require" \
SEED_USER_ID="<vase-user-id>" \
node scripts/seed.mjs
```

---

## Jak se počítá skóre

Zdroj pravdy je **`lib/oiv.ts`** — diskrétní bodové tabulky OIV 2009. U každého kritéria se vybírá jedna
z 5 úrovní (vynikající → nedostatečné) s pevným počtem bodů; skóre je prostý součet, max **100** u obou typů.

| Typ      | Vzhled | Vůně | Chuť | Harmonie | Σ   |
|----------|:------:|:----:|:----:|:--------:|:---:|
| Tiché    | 15     | 30   | 44   | 11       | 100 |
| Šumivé   | 25     | 28   | 35   | 12       | 100 |

**Medaile (OIV prahy):** Velká zlatá ≥ 92, Zlatá ≥ 85, Stříbrná ≥ 82, jinak bez medaile.

`total_score` a `medal` se přepočítají z `grades` na serveru při uložení a ukládají denormalizovaně.

---

## Struktura projektu

```
app/
  layout.tsx                     # root layout + StackProvider
  page.tsx                       # seznam (server: requireUser + listTastings)
  login/page.tsx                 # GitHub + Google přihlášení (Stack OAuth)
  handler/[...stack]/page.tsx    # auth routy Stacku (callback, account, sign-out)
  account/page.tsx               # odkaz na nastavení účtu (Stack)
  tasting/new/page.tsx           # nové hodnocení
  tasting/[id]/page.tsx          # detail + editace
  tasting/[id]/print/page.tsx    # tisk / PDF (A4)
lib/
  oiv.ts                         # OIV tabulky — zdroj pravdy
  scoring.ts                     # computeScore, sjednocené sloupce pro export
  export.ts                      # toCSV / downloadXLSX (klientsky)
  db.ts                          # Neon SQL klient (server-only)
  auth.ts                        # requireUser (+ allowlist)
  queries.ts                     # server reads (listTastings, getTasting)
  actions.ts                     # server actions (save/delete + Blob upload)
  blob.ts                        # Vercel Blob upload/delete
  types.ts                       # datový model Tasting
stack.ts                         # Stack Auth server app (server-only)
components/
  AppHeader.tsx  ScoringGrid.tsx  TastingForm.tsx  TastingListClient.tsx
  Filters.tsx    MedalBadge.tsx   PrintView.tsx     PrintButton.tsx
db/migrations/0001_init.sql
scripts/seed.mjs                 # volitelný seed (lokálně)
```

# Shajira — Family Tree

**Created and maintained by Kadir Ravshanov.**

Interactive family tree for the Ravshanov family. Same features as the Oq-Ariq
app (tree, members, map, timeline, stats, join requests, Supabase sync), with a
fresh **Shajira** brand, sapphire theme, and empty starter data.

**Planned live site:** https://ravshanov-family.vercel.app

Stack (all free tiers): React + TypeScript + Vite + Tailwind + React Flow,
hosted on **Vercel**, data on a **separate Supabase** project.

## What’s different from myfamilytree

| | Oq-Ariq OILASI | Shajira |
|---|---|---|
| App name | Oq-Ariq OILASI | **Shajira** |
| Repo | `myfamilytree` | `familytree-x2` |
| Vercel | myfamilytree-kdr6 | **ravshanov-family** |
| Theme | Emerald green | Sapphire + soft gold |
| Starter data | Full family | **Empty** — add people in the app |
| LocalStorage | `familytree.*` | `shajira.*` (no clash) |
| Auth emails | `@oqariq.family` | `@ravshanov.family` |

## Free setup (do once)

### 1. Supabase (new free project)

1. Create a **new** project at [supabase.com](https://supabase.com) (keep the Oq-Ariq one untouched).
2. Run the SQL files in order (`supabase-setup.sql`, then any `supabase-upgrade*.sql` you need) in the SQL editor.
3. Create two Auth users (Authentication → Users, auto-confirm, **disable public sign-ups**):
   - `owner@ravshanov.family` — owner password
   - `family@ravshanov.family` — member password
4. Copy Project URL + anon key into a local `.env` (see `.env.example`).
5. In Settings on the site, generate new password hashes and paste them into `src/config/access.ts`, then redeploy.

Free plan tip: Supabase usually allows **2 free projects**. You already use one for Oq-Ariq — this is the second.

### 2. GitHub + Vercel

```bash
# from this folder, after first commit:
gh repo create kdrcoding/familytree-x2 --private --source=. --remote=origin --push
npx vercel --prod
```

In the Vercel dashboard, set the project name / production domain to
**ravshanov-family** so the URL is `https://ravshanov-family.vercel.app`.
Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as project env vars.

Or use `tools\deploy.bat` after the remotes exist.

### 3. Local run

```bash
npm install
npm run dev
```

## Languages

Uzbek (default), English, Russian — same as the first app.

## License / privacy

Family data is private. Do not commit `.env` or real passwords.

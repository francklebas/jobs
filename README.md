# Suivi de candidatures

App Nuxt 4 pour tracker ses candidatures et ne pas oublier de relancer les recruteurs.

**Prod : [jobs.francklebas.com](https://jobs.francklebas.com)** (Cloudflare Workers)

- **Auth** : comptes utilisateurs via Supabase Auth (e-mail / mot de passe)
- **DB** : table `applications` sur Supabase, protégée par Row Level Security
- **Relances** : chaque candidature peut avoir une date de relance ; les relances dues s'affichent en haut du dashboard
- **UI** : Tailwind CSS 4, mode clair / sombre

## Prérequis Supabase

1. Créer un projet sur [supabase.com](https://supabase.com/dashboard)
2. Exécuter `supabase/migrations/20260702000000_applications.sql` dans le **SQL Editor** du projet (ou `supabase db push` avec la CLI)
3. Copier `.env.example` vers `.env` et renseigner :
   - `SUPABASE_URL` : Project Settings → API → Project URL
   - `SUPABASE_KEY` : la clé `anon` / publishable
4. Dans **Authentication → URL Configuration** :
   - **Site URL** : `https://jobs.francklebas.com` — c'est là que Supabase redirige après un clic
     sur un lien d'e-mail (confirmation d'inscription, reset de mot de passe). L'app récupère
     alors la session sur la page `/confirm` avant de renvoyer vers le dashboard.
   - **Redirect URLs** : ajouter `http://localhost:3000/**` pour que ces liens fonctionnent
     aussi en dev local.

## Développement

```bash
bun install
bun run dev
```

L'app tourne sur `http://localhost:3000`. Sans session, toute page redirige vers `/login`.

## Déploiement (Cloudflare Workers)

```bash
bun run build
bunx wrangler deploy
```

Le build utilise le preset Nitro `cloudflare_module` ; la config (custom domain
`jobs.francklebas.com`, variables d'environnement Supabase) est dans `wrangler.jsonc`.

## Pistes suivantes

- Envoi d'e-mails de rappel (pg_cron + Edge Function Supabase, ou tâche Nitro + Resend)
- Génération des types Supabase (`supabase gen types typescript`) pour typer le client

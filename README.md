# Suivi de candidatures

App Nuxt 4 pour tracker ses candidatures et ne pas oublier de relancer les recruteurs.

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
4. Dans **Authentication → URL Configuration**, mettre la Site URL à `http://localhost:3000`
   (les liens de confirmation d'e-mail redirigent vers `/confirm`)

## Développement

```bash
bun install
bun run dev
```

L'app tourne sur `http://localhost:3000`. Sans session, toute page redirige vers `/login`.

## Production

```bash
bun run build
bun run preview
```

## Pistes suivantes

- Envoi d'e-mails de rappel (pg_cron + Edge Function Supabase, ou tâche Nitro + Resend)
- Génération des types Supabase (`supabase gen types typescript`) pour typer le client

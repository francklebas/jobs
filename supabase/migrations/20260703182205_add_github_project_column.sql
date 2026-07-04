-- Lien vers un éventuel projet GitHub associé à la candidature.
-- Migration appliquée directement sur le projet distant (dashboard), reconstituée ici.
alter table public.applications
  add column github_project_url text;

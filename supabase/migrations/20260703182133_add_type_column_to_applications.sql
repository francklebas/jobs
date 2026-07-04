-- Distinguer les missions freelance des CDI.
-- Migration appliquée directement sur le projet distant (dashboard), reconstituée ici.
alter table public.applications
  add column type text default 'emploi'
  check (type in ('free', 'emploi'));

-- Table des candidatures, une ligne par candidature envoyée.
-- À exécuter dans le SQL Editor de Supabase (ou via `supabase db push`).

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  position text not null,
  status text not null default 'envoyee'
    check (status in ('envoyee', 'relancee', 'entretien', 'offre', 'refusee', 'sans_reponse')),
  applied_at date not null default current_date,
  follow_up_at date,
  contact_name text,
  contact_email text,
  job_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications (user_id);
create index applications_follow_up_at_idx on public.applications (follow_up_at)
  where follow_up_at is not null;

-- Chaque utilisateur ne voit et ne modifie que ses propres candidatures.
alter table public.applications enable row level security;

create policy "select own applications" on public.applications
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "insert own applications" on public.applications
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "update own applications" on public.applications
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "delete own applications" on public.applications
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Maintient updated_at à jour automatiquement.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

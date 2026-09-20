-- Saved drafts, per user (and optionally per project), locked down with RLS.

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  format text not null,
  brief text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index drafts_user_project_idx on public.drafts (user_id, project_id, created_at desc);

alter table public.drafts enable row level security;

create policy "own drafts" on public.drafts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (project_id is null or exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    ))
  );

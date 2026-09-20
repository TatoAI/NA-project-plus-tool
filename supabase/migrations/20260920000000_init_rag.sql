-- Per-user RAG schema. Every table is owned by a user and locked down with RLS,
-- so one user can never read or search another user's data.

create extension if not exists vector with schema extensions;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- project_id is null for general (account-wide) context.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  filename text not null,
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding extensions.vector(1024) not null,
  created_at timestamptz not null default now()
);

create index projects_user_idx on public.projects (user_id);
create index documents_user_project_idx on public.documents (user_id, project_id);
create index chunks_user_project_idx on public.chunks (user_id, project_id);
create index chunks_document_idx on public.chunks (document_id);
create index chunks_embedding_idx on public.chunks
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.chunks enable row level security;

create policy "own projects" on public.projects
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "own documents" on public.documents
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (project_id is null or exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    ))
  );

create policy "own chunks" on public.chunks
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = (select auth.uid())
    )
  );

-- Vector search over the caller's own chunks: general context plus, optionally,
-- one project's context. SECURITY INVOKER (the default) means RLS still applies.
create or replace function public.match_chunks (
  query_embedding extensions.vector(1024),
  match_count int default 30,
  filter_project uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  project_id uuid,
  content text,
  similarity float
)
language sql
stable
set search_path = ''
as $$
  select
    c.id,
    c.document_id,
    c.project_id,
    c.content,
    1 - (c.embedding operator(extensions.<=>) query_embedding) as similarity
  from public.chunks c
  where c.user_id = (select auth.uid())
    and (c.project_id is null or c.project_id = filter_project)
  order by c.embedding operator(extensions.<=>) query_embedding
  limit match_count;
$$;

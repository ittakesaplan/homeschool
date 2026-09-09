-- ═══════════════════════════════════════════════════
-- Homeschool Portfolio — Supabase Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════

-- 1. Create the entries table
create table if not exists public.entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  entry_date date not null default current_date,
  title text not null,
  description text default '',
  learnings text default '',
  subjects text[] default '{}',
  is_portfolio boolean default false,
  user_id uuid references auth.users(id) on delete set null
);

-- 2. Create the entry_files table (tracks uploaded photos/docs)
create table if not exists public.entry_files (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  entry_id uuid references public.entries(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text default '',
  storage_path text default ''
);

-- 3. Enable Row Level Security
alter table public.entries enable row level security;
alter table public.entry_files enable row level security;

-- 4. RLS policies — any authenticated user can do everything
--    (This is a private family app; both parents have accounts)
create policy "Authenticated users full access to entries"
  on public.entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users full access to entry_files"
  on public.entry_files for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 5. Create the storage bucket for file uploads
insert into storage.buckets (id, name, public)
values ('entry-files', 'entry-files', true)
on conflict (id) do nothing;

-- 6. Storage policies — authenticated users upload, anyone reads (public URLs)
create policy "Authenticated users can upload files"
  on storage.objects for insert
  with check (bucket_id = 'entry-files' and auth.role() = 'authenticated');

create policy "Anyone can read uploaded files"
  on storage.objects for select
  using (bucket_id = 'entry-files');

create policy "Authenticated users can delete files"
  on storage.objects for delete
  using (bucket_id = 'entry-files' and auth.role() = 'authenticated');

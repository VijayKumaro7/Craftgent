-- ============================================================
-- Craftgent — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- BEFORE starting the backend for the first time.
--
-- Prerequisites:
--   1. Create a Supabase project at https://supabase.com
--   2. Copy env vars from Project Settings → API into your .env
-- ============================================================

-- ── Profiles (extends Supabase auth.users) ──────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique not null,
  created_at  timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── Agent name enum ─────────────────────────────────────────
do $$ begin
  create type agent_name as enum ('NEXUS', 'ALEX', 'VORTEX', 'RESEARCHER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_role as enum ('user', 'assistant', 'system');
exception when duplicate_object then null; end $$;


-- ── Chat sessions ────────────────────────────────────────────
create table if not exists public.chat_sessions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  active_agent  agent_name default 'NEXUS' not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.chat_sessions enable row level security;

create policy "chat_sessions: owner only"
  on public.chat_sessions for all
  using (auth.uid() = user_id);


-- ── Messages ─────────────────────────────────────────────────
create table if not exists public.messages (
  id          uuid default gen_random_uuid() primary key,
  session_id  uuid references public.chat_sessions(id) on delete cascade not null,
  role        message_role not null,
  content     text not null,
  agent       agent_name,
  token_count integer default 0 not null,
  created_at  timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "messages: session owner only"
  on public.messages for all
  using (
    exists (
      select 1 from public.chat_sessions cs
      where cs.id = session_id and cs.user_id = auth.uid()
    )
  );

create index if not exists messages_session_created
  on public.messages (session_id, created_at);


-- ── File uploads ─────────────────────────────────────────────
create table if not exists public.file_uploads (
  id          uuid default gen_random_uuid() primary key,
  session_id  uuid references public.chat_sessions(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  filename    text not null,
  file_type   text not null,
  file_size   integer not null,
  file_path   text not null,
  created_at  timestamptz default now() not null
);

alter table public.file_uploads enable row level security;

create policy "file_uploads: owner only"
  on public.file_uploads for all
  using (auth.uid() = user_id);


-- ── Reports ──────────────────────────────────────────────────
create table if not exists public.reports (
  id           uuid default gen_random_uuid() primary key,
  session_id   uuid references public.chat_sessions(id) on delete cascade not null,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  title        text not null,
  format       text not null check (format in ('pdf', 'docx')),
  file_path    text,
  file_size    integer default 0 not null,
  generated_at timestamptz default now() not null
);

alter table public.reports enable row level security;

create policy "reports: owner only"
  on public.reports for all
  using (auth.uid() = user_id);

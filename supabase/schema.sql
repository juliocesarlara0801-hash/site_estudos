-- ============================================================
-- Site de Estudos — Schema completo (Fase 1)
-- Execute este arquivo no SQL Editor do Supabase (projeto novo)
-- ============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. profiles
-- Um perfil por usuário, criado automaticamente no cadastro
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  dark_mode boolean not null default false,
  pomodoro_settings jsonb not null default '{
    "estudo_minutos": 25,
    "pausa_curta_minutos": 5,
    "pausa_longa_minutos": 15,
    "ciclos_ate_pausa_longa": 4
  }'::jsonb,
  created_at timestamptz not null default now()
);

-- Cria o profile automaticamente quando um novo usuário se cadastra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. subjects (matérias)
-- ------------------------------------------------------------
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. day_entries (anotações do dia)
-- Um registro por usuário/dia
-- ------------------------------------------------------------
create table public.day_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  schedule jsonb not null default '[]'::jsonb,      -- blocos de horário [{inicio, fim, subject_id, titulo}]
  notes text default '',                             -- anotações (rich text em HTML/JSON)
  conclusions text default '',                        -- o que aprendi
  doubts text default '',                              -- dúvidas em aberto
  pending text default '',                             -- pendências
  completed jsonb not null default '[]'::jsonb,      -- checklist [{texto, feito}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ------------------------------------------------------------
-- 4. study_sessions (histórico de cronômetro/timer/pomodoro)
-- ------------------------------------------------------------
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  type text not null check (type in ('free', 'timer', 'pomodoro')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. goals (metas)
-- ------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  target_hours numeric(6,2) not null,
  period text not null check (period in ('weekly', 'monthly')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. flashcard_decks
-- ------------------------------------------------------------
create table public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7. flashcards
-- Não tem user_id direto — pertence a um deck, que pertence a um usuário
-- ------------------------------------------------------------
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  front text not null,
  back text not null,
  next_review_at timestamptz not null default now(),
  difficulty_level text check (difficulty_level in ('dificil', 'medio', 'facil')),
  acertos integer not null default 0,   -- revisões marcadas como "médio" ou "fácil"
  revisoes integer not null default 0,  -- total de revisões já feitas
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8. reminders (lembretes durante o estudo)
-- ------------------------------------------------------------
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,              -- ex: 'agua', 'alongar', 'olhar_longe', 'comer'
  message text not null,
  interval_minutes integer not null default 30,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.day_entries enable row level security;
alter table public.study_sessions enable row level security;
alter table public.goals enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.reminders enable row level security;

-- profiles: usuário só vê/edita o próprio perfil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- subjects
create policy "subjects_select_own" on public.subjects
  for select using (auth.uid() = user_id);
create policy "subjects_insert_own" on public.subjects
  for insert with check (auth.uid() = user_id);
create policy "subjects_update_own" on public.subjects
  for update using (auth.uid() = user_id);
create policy "subjects_delete_own" on public.subjects
  for delete using (auth.uid() = user_id);

-- day_entries
create policy "day_entries_select_own" on public.day_entries
  for select using (auth.uid() = user_id);
create policy "day_entries_insert_own" on public.day_entries
  for insert with check (auth.uid() = user_id);
create policy "day_entries_update_own" on public.day_entries
  for update using (auth.uid() = user_id);
create policy "day_entries_delete_own" on public.day_entries
  for delete using (auth.uid() = user_id);

-- study_sessions
create policy "study_sessions_select_own" on public.study_sessions
  for select using (auth.uid() = user_id);
create policy "study_sessions_insert_own" on public.study_sessions
  for insert with check (auth.uid() = user_id);
create policy "study_sessions_update_own" on public.study_sessions
  for update using (auth.uid() = user_id);
create policy "study_sessions_delete_own" on public.study_sessions
  for delete using (auth.uid() = user_id);

-- goals
create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = user_id);

-- flashcard_decks
create policy "decks_select_own" on public.flashcard_decks
  for select using (auth.uid() = user_id);
create policy "decks_insert_own" on public.flashcard_decks
  for insert with check (auth.uid() = user_id);
create policy "decks_update_own" on public.flashcard_decks
  for update using (auth.uid() = user_id);
create policy "decks_delete_own" on public.flashcard_decks
  for delete using (auth.uid() = user_id);

-- flashcards (via deck_id -> flashcard_decks.user_id)
create policy "flashcards_select_own" on public.flashcards
  for select using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and d.user_id = auth.uid()
    )
  );
create policy "flashcards_insert_own" on public.flashcards
  for insert with check (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and d.user_id = auth.uid()
    )
  );
create policy "flashcards_update_own" on public.flashcards
  for update using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and d.user_id = auth.uid()
    )
  );
create policy "flashcards_delete_own" on public.flashcards
  for delete using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and d.user_id = auth.uid()
    )
  );

-- reminders
create policy "reminders_select_own" on public.reminders
  for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on public.reminders
  for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on public.reminders
  for update using (auth.uid() = user_id);
create policy "reminders_delete_own" on public.reminders
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Índices úteis
-- ============================================================
create index idx_day_entries_user_date on public.day_entries(user_id, date);
create index idx_study_sessions_user on public.study_sessions(user_id, started_at);
create index idx_flashcards_deck on public.flashcards(deck_id);
create index idx_flashcards_next_review on public.flashcards(next_review_at);

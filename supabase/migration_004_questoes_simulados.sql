-- ============================================================
-- Migração 004 — Acompanhamento de Questões e Simulados
-- Execute no SQL Editor do Supabase (projeto já criado com schema.sql)
-- ============================================================

-- ------------------------------------------------------------
-- 1. simulados
-- ------------------------------------------------------------
create table public.simulados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  date date not null default current_date,
  total_questions integer not null default 0,
  total_correct integer not null default 0,
  total_wrong integer not null default 0,
  percentage numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. simulado_subjects
-- Desempenho por matéria em cada simulado — não tem user_id
-- direto, pertence a um simulado, que pertence a um usuário
-- ------------------------------------------------------------
create table public.simulado_subjects (
  id uuid primary key default gen_random_uuid(),
  simulado_id uuid not null references public.simulados(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  questions integer not null default 0,
  correct integer not null default 0,
  wrong integer not null default 0,
  percentage numeric(5,2) not null default 0
);

-- ------------------------------------------------------------
-- 3. exercise_lists (listas de exercícios)
-- ------------------------------------------------------------
create table public.exercise_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  source text,
  description text,
  date date not null default current_date,
  questions integer not null default 0,
  correct integer not null default 0,
  wrong integer not null default 0,
  percentage numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. accuracy_goals (metas de % de acerto por matéria)
-- ------------------------------------------------------------
create table public.accuracy_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  target_percentage numeric(5,2) not null default 70,
  created_at timestamptz not null default now(),
  unique (user_id, subject_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.simulados enable row level security;
alter table public.simulado_subjects enable row level security;
alter table public.exercise_lists enable row level security;
alter table public.accuracy_goals enable row level security;

-- simulados
create policy "simulados_select_own" on public.simulados
  for select using (auth.uid() = user_id);
create policy "simulados_insert_own" on public.simulados
  for insert with check (auth.uid() = user_id);
create policy "simulados_update_own" on public.simulados
  for update using (auth.uid() = user_id);
create policy "simulados_delete_own" on public.simulados
  for delete using (auth.uid() = user_id);

-- simulado_subjects (via simulado_id -> simulados.user_id)
create policy "simulado_subjects_select_own" on public.simulado_subjects
  for select using (
    exists (
      select 1 from public.simulados s
      where s.id = simulado_subjects.simulado_id and s.user_id = auth.uid()
    )
  );
create policy "simulado_subjects_insert_own" on public.simulado_subjects
  for insert with check (
    exists (
      select 1 from public.simulados s
      where s.id = simulado_subjects.simulado_id and s.user_id = auth.uid()
    )
  );
create policy "simulado_subjects_update_own" on public.simulado_subjects
  for update using (
    exists (
      select 1 from public.simulados s
      where s.id = simulado_subjects.simulado_id and s.user_id = auth.uid()
    )
  );
create policy "simulado_subjects_delete_own" on public.simulado_subjects
  for delete using (
    exists (
      select 1 from public.simulados s
      where s.id = simulado_subjects.simulado_id and s.user_id = auth.uid()
    )
  );

-- exercise_lists
create policy "exercise_lists_select_own" on public.exercise_lists
  for select using (auth.uid() = user_id);
create policy "exercise_lists_insert_own" on public.exercise_lists
  for insert with check (auth.uid() = user_id);
create policy "exercise_lists_update_own" on public.exercise_lists
  for update using (auth.uid() = user_id);
create policy "exercise_lists_delete_own" on public.exercise_lists
  for delete using (auth.uid() = user_id);

-- accuracy_goals
create policy "accuracy_goals_select_own" on public.accuracy_goals
  for select using (auth.uid() = user_id);
create policy "accuracy_goals_insert_own" on public.accuracy_goals
  for insert with check (auth.uid() = user_id);
create policy "accuracy_goals_update_own" on public.accuracy_goals
  for update using (auth.uid() = user_id);
create policy "accuracy_goals_delete_own" on public.accuracy_goals
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Índices úteis
-- ============================================================
create index idx_simulados_user_date on public.simulados(user_id, date);
create index idx_simulado_subjects_simulado on public.simulado_subjects(simulado_id);
create index idx_simulado_subjects_subject on public.simulado_subjects(subject_id);
create index idx_exercise_lists_user_date on public.exercise_lists(user_id, date);
create index idx_exercise_lists_subject on public.exercise_lists(subject_id);
create index idx_accuracy_goals_user on public.accuracy_goals(user_id);

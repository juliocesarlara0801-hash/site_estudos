-- ============================================================
-- Migração 002 — Estatística de acerto nos flashcards (Fase 6)
-- Execute no SQL Editor do Supabase (projeto já criado com schema.sql)
-- ============================================================

alter table public.flashcards
  add column if not exists acertos integer not null default 0,
  add column if not exists revisoes integer not null default 0;

comment on column public.flashcards.acertos is
  'Quantidade de revisões marcadas como "médio" ou "fácil"';
comment on column public.flashcards.revisoes is
  'Quantidade total de revisões já feitas neste cartão';

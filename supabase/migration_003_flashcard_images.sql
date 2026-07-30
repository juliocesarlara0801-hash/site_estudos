-- ============================================================
-- Migração 003 — Imagens nos flashcards (frente e verso)
-- Execute no SQL Editor do Supabase (depois de aplicar migration_002)
-- ============================================================

alter table public.flashcards
  add column if not exists front_image_url text,
  add column if not exists back_image_url text;

comment on column public.flashcards.front_image_url is
  'Caminho do objeto no bucket flashcard-images para a imagem da frente (ex: {user_id}/{card_id}/front.webp)';
comment on column public.flashcards.back_image_url is
  'Caminho do objeto no bucket flashcard-images para a imagem do verso (ex: {user_id}/{card_id}/back.webp)';

-- ============================================================
-- Storage: bucket + políticas de acesso
-- O bucket em si (INSERT INTO storage.buckets) normalmente precisa ser
-- criado pelo Dashboard (Storage > New bucket) porque a role usada no
-- SQL Editor às vezes não tem permissão direta na tabela storage.buckets.
-- Se der erro de permissão nesse INSERT, crie o bucket pelo Dashboard
-- com o nome exato "flashcard-images" e marque como privado (Public: off),
-- depois rode só a parte das policies abaixo.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('flashcard-images', 'flashcard-images', false)
on conflict (id) do nothing;

-- Usuário pode fazer upload apenas na própria pasta (primeiro segmento do path = seu user_id)
drop policy if exists "flashcard_images_insert_own" on storage.objects;
create policy "flashcard_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'flashcard-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuário pode ver apenas as próprias imagens
drop policy if exists "flashcard_images_select_own" on storage.objects;
create policy "flashcard_images_select_own" on storage.objects
  for select using (
    bucket_id = 'flashcard-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuário pode substituir (upsert) apenas as próprias imagens
drop policy if exists "flashcard_images_update_own" on storage.objects;
create policy "flashcard_images_update_own" on storage.objects
  for update using (
    bucket_id = 'flashcard-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuário pode apagar apenas as próprias imagens
drop policy if exists "flashcard_images_delete_own" on storage.objects;
create policy "flashcard_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'flashcard-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

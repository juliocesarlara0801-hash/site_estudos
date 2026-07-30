import type { createClient } from "@/lib/supabase/server";
import type { Deck } from "@/lib/types/flashcards";
import { BUCKET_IMAGENS_FLASHCARDS } from "@/lib/utils/image-flashcards";

export async function obterDecksComResumo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Deck[]> {
  const { data: decks } = await supabase
    .from("flashcard_decks")
    .select("id, name, subjects(name, color)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!decks || decks.length === 0) return [];

  const agora = new Date().toISOString();

  return Promise.all(
    decks.map(async (deck) => {
      const { data: cartoes } = await supabase
        .from("flashcards")
        .select("next_review_at, acertos, revisoes")
        .eq("deck_id", deck.id);

      const todos = cartoes ?? [];
      const paraRevisar = todos.filter((c) => c.next_review_at <= agora).length;
      const totalRevisoes = todos.reduce((soma, c) => soma + c.revisoes, 0);
      const totalAcertos = todos.reduce((soma, c) => soma + c.acertos, 0);

      const materia = Array.isArray(deck.subjects)
        ? deck.subjects[0]
        : deck.subjects;

      return {
        id: deck.id as string,
        nome: deck.name as string,
        materiaNome: (materia as { name: string } | null)?.name ?? null,
        materiaCor: (materia as { color: string } | null)?.color ?? null,
        totalCartoes: todos.length,
        paraRevisar,
        taxaAcerto:
          totalRevisoes > 0 ? Math.round((totalAcertos / totalRevisoes) * 100) : null,
      };
    })
  );
}

/**
 * Gera signed URLs (1h) em lote para as imagens dos cartões, já que o bucket é privado.
 */
export async function assinarImagensCartoes<
  T extends { front_image_url: string | null; back_image_url: string | null },
>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cartoes: T[]
): Promise<(T & { frontImageSignedUrl: string | null; backImageSignedUrl: string | null })[]> {
  const caminhos = Array.from(
    new Set(
      cartoes
        .flatMap((c) => [c.front_image_url, c.back_image_url])
        .filter((caminho): caminho is string => !!caminho)
    )
  );

  if (caminhos.length === 0) {
    return cartoes.map((c) => ({ ...c, frontImageSignedUrl: null, backImageSignedUrl: null }));
  }

  const { data } = await supabase.storage
    .from(BUCKET_IMAGENS_FLASHCARDS)
    .createSignedUrls(caminhos, 3600);

  const mapaUrls = new Map(
    (data ?? [])
      .filter((item) => item.signedUrl && !item.error && item.path)
      .map((item) => [item.path as string, item.signedUrl as string])
  );

  return cartoes.map((c) => ({
    ...c,
    frontImageSignedUrl: c.front_image_url ? (mapaUrls.get(c.front_image_url) ?? null) : null,
    backImageSignedUrl: c.back_image_url ? (mapaUrls.get(c.back_image_url) ?? null) : null,
  }));
}

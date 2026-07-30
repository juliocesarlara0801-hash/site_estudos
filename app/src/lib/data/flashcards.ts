import type { createClient } from "@/lib/supabase/server";
import type { Deck } from "@/lib/types/flashcards";

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

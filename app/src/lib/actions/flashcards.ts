"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Dificuldade } from "@/lib/types/flashcards";

export type EstadoFlashcards = { erro?: string } | undefined;

export async function criarDeck(
  _estado: EstadoFlashcards,
  formData: FormData
): Promise<EstadoFlashcards> {
  const nome = String(formData.get("nome") ?? "").trim();
  const subjectIdBruto = String(formData.get("subjectId") ?? "");
  const subjectId = subjectIdBruto || null;

  if (!nome) {
    return { erro: "Informe o nome do deck." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada." };
  }

  const { error } = await supabase.from("flashcard_decks").insert({
    user_id: user.id,
    subject_id: subjectId,
    name: nome,
  });

  if (error) {
    return { erro: "Não foi possível criar o deck." };
  }

  revalidatePath("/flashcards");
  return undefined;
}

export async function excluirDeck(id: string) {
  const supabase = await createClient();
  await supabase.from("flashcard_decks").delete().eq("id", id);
  revalidatePath("/flashcards");
}

export async function criarFlashcard(
  _estado: EstadoFlashcards,
  formData: FormData
): Promise<EstadoFlashcards> {
  const deckId = String(formData.get("deckId") ?? "");
  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();

  if (!front || !back) {
    return { erro: "Preencha a frente e o verso do cartão." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("flashcards").insert({
    deck_id: deckId,
    front,
    back,
  });

  if (error) {
    return { erro: "Não foi possível criar o cartão." };
  }

  revalidatePath(`/flashcards/${deckId}`);
  return undefined;
}

export async function atualizarFlashcard(
  id: string,
  deckId: string,
  front: string,
  back: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("flashcards")
    .update({ front, back, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath(`/flashcards/${deckId}`);
  return error ? { erro: "Não foi possível salvar o cartão." } : { ok: true as const };
}

export async function excluirFlashcard(id: string, deckId: string) {
  const supabase = await createClient();
  await supabase.from("flashcards").delete().eq("id", id);
  revalidatePath(`/flashcards/${deckId}`);
}

const DIAS_POR_DIFICULDADE: Record<Dificuldade, number> = {
  dificil: 1,
  medio: 3,
  facil: 7,
};

export async function revisarFlashcard(
  id: string,
  deckId: string,
  dificuldade: Dificuldade
) {
  const supabase = await createClient();

  const { data: cartaoAtual } = await supabase
    .from("flashcards")
    .select("acertos, revisoes")
    .eq("id", id)
    .maybeSingle();

  const proximaRevisao = addDays(new Date(), DIAS_POR_DIFICULDADE[dificuldade]);
  const acertou = dificuldade !== "dificil";

  const { error } = await supabase
    .from("flashcards")
    .update({
      difficulty_level: dificuldade,
      next_review_at: proximaRevisao.toISOString(),
      revisoes: (cartaoAtual?.revisoes ?? 0) + 1,
      acertos: (cartaoAtual?.acertos ?? 0) + (acertou ? 1 : 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath(`/flashcards/${deckId}`);
  revalidatePath("/flashcards");

  return error ? { erro: "Não foi possível salvar a revisão." } : { ok: true as const };
}

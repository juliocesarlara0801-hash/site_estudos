"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Dificuldade, LadoCartao } from "@/lib/types/flashcards";
import {
  BUCKET_IMAGENS_FLASHCARDS,
  TAMANHO_MAXIMO_IMAGEM_BYTES,
} from "@/lib/utils/image-flashcards";

export type EstadoFlashcards = { erro?: string } | undefined;

const EXTENSAO_POR_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
  const cardId = String(formData.get("cardId") ?? "");
  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  const frontImagePath = String(formData.get("frontImagePath") ?? "") || null;
  const backImagePath = String(formData.get("backImagePath") ?? "") || null;

  if (!cardId) {
    return { erro: "Não foi possível identificar o cartão." };
  }
  if (!front && !frontImagePath) {
    return { erro: "A frente precisa de um texto ou de uma imagem." };
  }
  if (!back && !backImagePath) {
    return { erro: "O verso precisa de um texto ou de uma imagem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("flashcards").insert({
    id: cardId,
    deck_id: deckId,
    front,
    back,
    front_image_url: frontImagePath,
    back_image_url: backImagePath,
  });

  if (error) {
    return { erro: "Não foi possível criar o cartão." };
  }

  revalidatePath(`/flashcards/${deckId}`);
  return undefined;
}

export async function uploadImagemFlashcard(
  cardId: string,
  deckId: string,
  lado: LadoCartao,
  formData: FormData
): Promise<{ path?: string; erro?: string }> {
  const arquivo = formData.get("file");

  if (!(arquivo instanceof File)) {
    return { erro: "Nenhum arquivo enviado." };
  }

  const extensao = EXTENSAO_POR_MIME[arquivo.type];
  if (!extensao) {
    return { erro: "Formato de imagem inválido." };
  }
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM_BYTES) {
    return { erro: "A imagem excede o limite de 5MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada." };
  }

  const pasta = `${user.id}/${cardId}`;
  const nomeArquivo = `${lado}.${extensao}`;
  const caminho = `${pasta}/${nomeArquivo}`;

  const { data: existentes } = await supabase.storage
    .from(BUCKET_IMAGENS_FLASHCARDS)
    .list(pasta);
  const obsoletos = (existentes ?? []).filter(
    (item) => item.name.startsWith(`${lado}.`) && item.name !== nomeArquivo
  );
  if (obsoletos.length > 0) {
    await supabase.storage
      .from(BUCKET_IMAGENS_FLASHCARDS)
      .remove(obsoletos.map((item) => `${pasta}/${item.name}`));
  }

  const { error: erroUpload } = await supabase.storage
    .from(BUCKET_IMAGENS_FLASHCARDS)
    .upload(caminho, arquivo, { contentType: arquivo.type, upsert: true });

  if (erroUpload) {
    return { erro: "Não foi possível enviar a imagem." };
  }

  await supabase
    .from("flashcards")
    .update({ [`${lado}_image_url`]: caminho, updated_at: new Date().toISOString() })
    .eq("id", cardId);

  revalidatePath(`/flashcards/${deckId}`);
  revalidatePath(`/flashcards/${deckId}/revisar`);

  return { path: caminho };
}

export async function removerImagemFlashcard(
  cardId: string,
  deckId: string,
  lado: LadoCartao
): Promise<{ ok?: true; erro?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada." };
  }

  const pasta = `${user.id}/${cardId}`;
  const { data: existentes } = await supabase.storage
    .from(BUCKET_IMAGENS_FLASHCARDS)
    .list(pasta);
  const arquivos = (existentes ?? []).filter((item) => item.name.startsWith(`${lado}.`));

  if (arquivos.length > 0) {
    await supabase.storage
      .from(BUCKET_IMAGENS_FLASHCARDS)
      .remove(arquivos.map((item) => `${pasta}/${item.name}`));
  }

  await supabase
    .from("flashcards")
    .update({ [`${lado}_image_url`]: null, updated_at: new Date().toISOString() })
    .eq("id", cardId);

  revalidatePath(`/flashcards/${deckId}`);
  revalidatePath(`/flashcards/${deckId}/revisar`);

  return { ok: true };
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const pasta = `${user.id}/${id}`;
    const { data: arquivos } = await supabase.storage
      .from(BUCKET_IMAGENS_FLASHCARDS)
      .list(pasta);
    if (arquivos && arquivos.length > 0) {
      await supabase.storage
        .from(BUCKET_IMAGENS_FLASHCARDS)
        .remove(arquivos.map((item) => `${pasta}/${item.name}`));
    }
  }

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

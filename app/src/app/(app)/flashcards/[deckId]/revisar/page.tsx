import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { assinarImagensCartoes } from "@/lib/data/flashcards";
import { Revisao } from "@/components/flashcards/revisao";

export default async function RevisarPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deck } = await supabase
    .from("flashcard_decks")
    .select("id, name")
    .eq("id", deckId)
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  if (!deck) {
    notFound();
  }

  const { data: cartoesBrutos } = await supabase
    .from("flashcards")
    .select(
      "id, front, back, next_review_at, difficulty_level, acertos, revisoes, front_image_url, back_image_url"
    )
    .eq("deck_id", deckId)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true });

  const cartoes = await assinarImagensCartoes(supabase, cartoesBrutos ?? []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Revisar: {deck.name}
        </h1>
      </div>

      <Revisao deckId={deckId} deckNome={deck.name} cartoesIniciais={cartoes} />
    </div>
  );
}

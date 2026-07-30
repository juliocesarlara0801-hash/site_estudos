import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { assinarImagensCartoes } from "@/lib/data/flashcards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NovoCartaoForm } from "@/components/flashcards/novo-cartao-form";
import { CartaoItem } from "@/components/flashcards/cartao-item";
import { ExportarDeckButton } from "@/components/flashcards/exportar-deck-button";

export default async function DeckPage({
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
    .order("created_at", { ascending: true });

  const cartoes = await assinarImagensCartoes(supabase, cartoesBrutos ?? []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Voltar para os decks"
            render={<Link href="/flashcards" />}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{deck.name}</h1>
        </div>
        <ExportarDeckButton
          deckNome={deck.name}
          cartoes={cartoes.map((c) => ({
            front: c.front,
            back: c.back,
            frontImageUrl: c.frontImageSignedUrl,
            backImageUrl: c.backImageSignedUrl,
          }))}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <NovoCartaoForm deckId={deckId} />
        </CardContent>
      </Card>

      {cartoes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum cartão neste deck ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {cartoes.map((cartao) => (
            <CartaoItem key={cartao.id} cartao={cartao} deckId={deckId} />
          ))}
        </div>
      )}
    </div>
  );
}

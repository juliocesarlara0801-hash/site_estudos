import { createClient } from "@/lib/supabase/server";
import { obterDecksComResumo } from "@/lib/data/flashcards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NovoDeckForm } from "@/components/flashcards/novo-deck-form";
import { DeckCard } from "@/components/flashcards/deck-card";

export default async function FlashcardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [decks, { data: materias }] = await Promise.all([
    obterDecksComResumo(supabase, user?.id ?? ""),
    supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user?.id ?? "")
      .order("name"),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
        <p className="text-muted-foreground">
          Crie decks por matéria e revise com repetição espaçada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo deck</CardTitle>
        </CardHeader>
        <CardContent>
          <NovoDeckForm materias={materias ?? []} />
        </CardContent>
      </Card>

      {decks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum deck criado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}

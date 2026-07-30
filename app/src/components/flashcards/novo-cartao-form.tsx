"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";

import { criarFlashcard, type EstadoFlashcards } from "@/lib/actions/flashcards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const estadoInicial: EstadoFlashcards = undefined;

export function NovoCartaoForm({ deckId }: { deckId: string }) {
  const [estado, formAction, pendente] = useActionState(
    criarFlashcard,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="deckId" value={deckId} />
      {estado?.erro && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{estado.erro}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="front" className="text-xs text-muted-foreground">
            Frente (pergunta)
          </Label>
          <Textarea id="front" name="front" rows={2} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="back" className="text-xs text-muted-foreground">
            Verso (resposta)
          </Label>
          <Textarea id="back" name="back" rows={2} required />
        </div>
      </div>
      <div>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar cartão"}
        </Button>
      </div>
    </form>
  );
}

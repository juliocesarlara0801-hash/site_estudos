"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";

import { criarFlashcard, type EstadoFlashcards } from "@/lib/actions/flashcards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/flashcards/image-upload";

const estadoInicial: EstadoFlashcards = undefined;

export function NovoCartaoForm({ deckId }: { deckId: string }) {
  const [estado, formAction, pendente] = useActionState(
    criarFlashcard,
    estadoInicial
  );
  const [cardId, setCardId] = useState(() => crypto.randomUUID());
  const [frontImagePath, setFrontImagePath] = useState<string | null>(null);
  const [backImagePath, setBackImagePath] = useState<string | null>(null);
  const enviouRef = useRef(false);

  useEffect(() => {
    if (pendente) enviouRef.current = true;
  }, [pendente]);

  useEffect(() => {
    if (!pendente && enviouRef.current && !estado?.erro) {
      enviouRef.current = false;
      setCardId(crypto.randomUUID());
      setFrontImagePath(null);
      setBackImagePath(null);
    }
  }, [pendente, estado]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="deckId" value={deckId} />
      <input type="hidden" name="cardId" value={cardId} />
      <input type="hidden" name="frontImagePath" value={frontImagePath ?? ""} />
      <input type="hidden" name="backImagePath" value={backImagePath ?? ""} />
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
          <Textarea id="front" name="front" rows={2} />
          <ImageUpload
            key={`front-${cardId}`}
            cardId={cardId}
            deckId={deckId}
            lado="front"
            label="Imagem da frente (opcional)"
            altTexto="Imagem da frente do cartão"
            urlInicial={null}
            onAlterar={setFrontImagePath}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="back" className="text-xs text-muted-foreground">
            Verso (resposta)
          </Label>
          <Textarea id="back" name="back" rows={2} />
          <ImageUpload
            key={`back-${cardId}`}
            cardId={cardId}
            deckId={deckId}
            lado="back"
            label="Imagem do verso (opcional)"
            altTexto="Imagem do verso do cartão"
            urlInicial={null}
            onAlterar={setBackImagePath}
          />
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

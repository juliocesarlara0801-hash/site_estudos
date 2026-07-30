"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { atualizarFlashcard, excluirFlashcard } from "@/lib/actions/flashcards";
import type { Flashcard } from "@/lib/types/flashcards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ROTULO_DIFICULDADE: Record<string, string> = {
  dificil: "Difícil",
  medio: "Médio",
  facil: "Fácil",
};

export function CartaoItem({
  cartao,
  deckId,
}: {
  cartao: Flashcard;
  deckId: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [front, setFront] = useState(cartao.front);
  const [back, setBack] = useState(cartao.back);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    await atualizarFlashcard(cartao.id, deckId, front, back);
    setSalvando(false);
    setAberto(false);
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogTrigger className="flex-1 cursor-pointer text-left">
          <div className="flex flex-col gap-0.5">
            <span className="line-clamp-1 text-sm font-medium">{cartao.front}</span>
            <span className="line-clamp-1 text-xs text-muted-foreground">{cartao.back}</span>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cartão</DialogTitle>
            <DialogDescription>
              Atualize a frente (pergunta) e o verso (resposta).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Frente</Label>
              <Textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Verso</Label>
              <Textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        {cartao.difficulty_level && (
          <Badge variant="secondary">
            {ROTULO_DIFICULDADE[cartao.difficulty_level]}
          </Badge>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => excluirFlashcard(cartao.id, deckId)}
          aria-label="Excluir cartão"
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

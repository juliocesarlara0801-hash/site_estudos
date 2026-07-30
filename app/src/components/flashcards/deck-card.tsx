"use client";

import Link from "next/link";
import { Layers, Trash2 } from "lucide-react";

import { excluirDeck } from "@/lib/actions/flashcards";
import type { Deck } from "@/lib/types/flashcards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground" />
            {deck.nome}
          </CardTitle>
          {deck.materiaNome && (
            <Badge
              style={{
                backgroundColor: `${deck.materiaCor}20`,
                color: deck.materiaCor ?? undefined,
              }}
              className="w-fit border-0"
            >
              {deck.materiaNome}
            </Badge>
          )}
          <CardDescription>
            {deck.totalCartoes} {deck.totalCartoes === 1 ? "cartão" : "cartões"}
            {deck.taxaAcerto !== null && ` · ${deck.taxaAcerto}% de acerto`}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => excluirDeck(deck.id)}
          aria-label="Excluir deck"
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          size="sm"
          disabled={deck.paraRevisar === 0}
          render={<Link href={`/flashcards/${deck.id}/revisar`} />}
        >
          Revisar {deck.paraRevisar > 0 && `(${deck.paraRevisar})`}
        </Button>
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/flashcards/${deck.id}`} />}
        >
          Gerenciar cartões
        </Button>
      </CardContent>
    </Card>
  );
}

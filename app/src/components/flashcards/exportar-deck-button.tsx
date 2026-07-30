"use client";

import { Download } from "lucide-react";

import { gerarPdfDeck } from "@/lib/utils/pdf-flashcards";
import { Button } from "@/components/ui/button";

export function ExportarDeckButton({
  deckNome,
  cartoes,
}: {
  deckNome: string;
  cartoes: { front: string; back: string }[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={cartoes.length === 0}
      onClick={() => gerarPdfDeck(deckNome, cartoes)}
    >
      <Download /> Exportar PDF
    </Button>
  );
}

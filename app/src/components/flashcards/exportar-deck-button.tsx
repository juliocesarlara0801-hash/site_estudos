"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { gerarPdfDeck } from "@/lib/utils/pdf-flashcards";
import { Button } from "@/components/ui/button";

export function ExportarDeckButton({
  deckNome,
  cartoes,
}: {
  deckNome: string;
  cartoes: {
    front: string;
    back: string;
    frontImageUrl: string | null;
    backImageUrl: string | null;
  }[];
}) {
  const [gerando, setGerando] = useState(false);

  async function baixar() {
    setGerando(true);
    try {
      await gerarPdfDeck(deckNome, cartoes);
    } finally {
      setGerando(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={cartoes.length === 0 || gerando}
      onClick={baixar}
    >
      <Download /> {gerando ? "Gerando..." : "Exportar PDF"}
    </Button>
  );
}

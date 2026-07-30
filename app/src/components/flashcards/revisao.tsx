"use client";

import { useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

import { revisarFlashcard } from "@/lib/actions/flashcards";
import type { Dificuldade, Flashcard } from "@/lib/types/flashcards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BOTOES_DIFICULDADE: {
  valor: Dificuldade;
  rotulo: string;
  descricao: string;
  variant: "destructive" | "outline" | "default";
}[] = [
  { valor: "dificil", rotulo: "Difícil", descricao: "volta em 1 dia", variant: "destructive" },
  { valor: "medio", rotulo: "Médio", descricao: "volta em 3 dias", variant: "outline" },
  { valor: "facil", rotulo: "Fácil", descricao: "volta em 7 dias", variant: "default" },
];

export function Revisao({
  deckId,
  deckNome,
  cartoesIniciais,
}: {
  deckId: string;
  deckNome: string;
  cartoesIniciais: Flashcard[];
}) {
  const fila = cartoesIniciais;
  const [indice, setIndice] = useState(0);
  const [respostaVisivel, setRespostaVisivel] = useState(false);
  const [resultados, setResultados] = useState<Dificuldade[]>([]);
  const [enviando, setEnviando] = useState(false);

  const cartaoAtual = fila[indice];
  const terminou = indice >= fila.length;

  async function avaliar(dificuldade: Dificuldade) {
    if (!cartaoAtual || enviando) return;
    setEnviando(true);
    await revisarFlashcard(cartaoAtual.id, deckId, dificuldade);
    setEnviando(false);
    setResultados((r) => [...r, dificuldade]);
    setRespostaVisivel(false);
    setIndice((i) => i + 1);
  }

  if (fila.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-lg font-medium">Nada para revisar por aqui! 🎉</p>
          <p className="text-sm text-muted-foreground">
            Todos os cartões deste deck já foram revisados recentemente.
          </p>
          <Button render={<Link href="/flashcards" />}>Voltar aos decks</Button>
        </CardContent>
      </Card>
    );
  }

  if (terminou) {
    const acertos = resultados.filter((r) => r !== "dificil").length;
    const taxa = Math.round((acertos / resultados.length) * 100);
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <PartyPopper className="size-8 text-muted-foreground" />
          <p className="text-lg font-medium">Revisão concluída!</p>
          <p className="text-sm text-muted-foreground">
            {resultados.length} cartões revisados · {taxa}% avaliados como médio/fácil
          </p>
          <Button render={<Link href="/flashcards" />}>Voltar aos decks</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Cartão {indice + 1} de {fila.length} · {deckNome}
      </p>

      <Card className="min-h-56 w-full max-w-xl">
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 py-8 text-center">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {respostaVisivel ? "Resposta" : "Pergunta"}
          </span>
          <p className="text-xl font-medium text-balance">
            {respostaVisivel ? cartaoAtual.back : cartaoAtual.front}
          </p>
        </CardContent>
      </Card>

      {!respostaVisivel ? (
        <Button size="lg" onClick={() => setRespostaVisivel(true)}>
          Mostrar resposta
        </Button>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {BOTOES_DIFICULDADE.map((botao) => (
            <Button
              key={botao.valor}
              size="lg"
              variant={botao.variant}
              disabled={enviando}
              onClick={() => avaliar(botao.valor)}
            >
              {botao.rotulo}
              <span className="text-xs opacity-70">({botao.descricao})</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

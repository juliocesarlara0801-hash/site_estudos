"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play, Settings2, Square } from "lucide-react";

import { usePomodoro, type FasePomodoro } from "@/lib/hooks/use-pomodoro";
import { useLembretes } from "@/lib/hooks/use-lembretes";
import { salvarSessao } from "@/lib/actions/sessoes";
import { formatarHMS } from "@/lib/utils/tempo";
import { tocarBipe } from "@/lib/utils/som";
import { notificar, pedirPermissaoNotificacao } from "@/lib/utils/notificacoes";
import { celebrarMetaSeAtingida } from "@/lib/utils/celebrar-meta";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Materia } from "@/lib/types/materia";
import type { ConfigPomodoroDb, Lembrete } from "@/lib/types/cronometro";
import { SeletorMateria } from "./seletor-materia";

const ROTULO_FASE: Record<FasePomodoro, string> = {
  estudo: "Estudo",
  pausa_curta: "Pausa curta",
  pausa_longa: "Pausa longa",
};

export function PainelPomodoro({
  materias,
  lembretes,
  configuracao,
}: {
  materias: Materia[];
  lembretes: Lembrete[];
  configuracao: ConfigPomodoroDb;
}) {
  const [materiaId, setMateriaId] = useState<string | null>(
    materias[0]?.id ?? null
  );
  const inicioFaseRef = useRef<string>(new Date().toISOString());

  const pomodoro = usePomodoro(
    {
      estudoMinutos: configuracao.estudo_minutos,
      pausaCurtaMinutos: configuracao.pausa_curta_minutos,
      pausaLongaMinutos: configuracao.pausa_longa_minutos,
      ciclosAtePausaLonga: configuracao.ciclos_ate_pausa_longa,
    },
    async (faseCompleta, cicloDaFase, segundosDaFase) => {
      tocarBipe();
      const proximaFase =
        faseCompleta === "estudo"
          ? cicloDaFase % configuracao.ciclos_ate_pausa_longa === 0
            ? "pausa_longa"
            : "pausa_curta"
          : "estudo";
      notificar(
        `${ROTULO_FASE[faseCompleta]} concluída!`,
        `Próxima fase: ${ROTULO_FASE[proximaFase]}`
      );
      toast.add({
        title: `${ROTULO_FASE[faseCompleta]} concluída!`,
        description: `Próxima fase: ${ROTULO_FASE[proximaFase]}`,
        type: "success",
      });

      if (faseCompleta === "estudo") {
        const inicio = inicioFaseRef.current;
        const resultado = await salvarSessao({
          subjectId: materiaId,
          startedAt: inicio,
          endedAt: new Date().toISOString(),
          durationSeconds: segundosDaFase,
          type: "pomodoro",
        });
        celebrarMetaSeAtingida(resultado);
      }
      inicioFaseRef.current = new Date().toISOString();
    }
  );

  useLembretes(lembretes, pomodoro.duracaoFase - pomodoro.restantes, pomodoro.rodando);

  const emAndamento = pomodoro.rodando || pomodoro.restantes !== pomodoro.duracaoFase;

  function iniciar() {
    if (!materiaId) {
      toast.add({
        title: "Selecione uma matéria",
        description: "Escolha a matéria antes de iniciar o Pomodoro.",
        type: "warning",
      });
      return;
    }
    pedirPermissaoNotificacao();
    inicioFaseRef.current = new Date().toISOString();
    pomodoro.iniciar();
  }

  async function parar() {
    if (pomodoro.fase === "estudo") {
      const decorridosNaFase = pomodoro.duracaoFase - pomodoro.restantes;
      if (decorridosNaFase >= 1) {
        const resultado = await salvarSessao({
          subjectId: materiaId,
          startedAt: inicioFaseRef.current,
          endedAt: new Date().toISOString(),
          durationSeconds: decorridosNaFase,
          type: "pomodoro",
        });
        celebrarMetaSeAtingida(resultado);
      }
    }
    pomodoro.parar();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <SeletorMateria
        materias={materias}
        valor={materiaId}
        onChange={setMateriaId}
        disabled={emAndamento}
      />

      <div className="flex items-center gap-2">
        <Badge variant={pomodoro.fase === "estudo" ? "default" : "secondary"}>
          {ROTULO_FASE[pomodoro.fase]}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Ciclo {pomodoro.cicloAtual} de {configuracao.ciclos_ate_pausa_longa}
        </span>
      </div>

      <div className="font-mono text-6xl font-semibold tabular-nums">
        {formatarHMS(pomodoro.restantes)}
      </div>

      <div className="flex gap-2">
        {!emAndamento && (
          <Button size="lg" onClick={iniciar}>
            <Play /> Iniciar
          </Button>
        )}
        {emAndamento && pomodoro.rodando && (
          <Button size="lg" variant="outline" onClick={pomodoro.pausar}>
            <Pause /> Pausar
          </Button>
        )}
        {emAndamento && !pomodoro.rodando && (
          <Button size="lg" onClick={pomodoro.retomar}>
            <Play /> Retomar
          </Button>
        )}
        {emAndamento && (
          <Button size="lg" variant="destructive" onClick={parar}>
            <Square /> Parar
          </Button>
        )}
      </div>

      <Button
        variant="link"
        size="sm"
        className="text-muted-foreground"
        render={<Link href="/configuracoes" />}
      >
        <Settings2 /> {configuracao.estudo_minutos}min estudo /{" "}
        {configuracao.pausa_curta_minutos}min pausa — editar preferências
      </Button>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

import { useContador } from "@/lib/hooks/use-contador";
import { useLembretes } from "@/lib/hooks/use-lembretes";
import { salvarSessao } from "@/lib/actions/sessoes";
import { formatarHMS } from "@/lib/utils/tempo";
import { tocarBipe } from "@/lib/utils/som";
import { notificar, pedirPermissaoNotificacao } from "@/lib/utils/notificacoes";
import { celebrarMetaSeAtingida } from "@/lib/utils/celebrar-meta";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Materia } from "@/lib/types/materia";
import type { Lembrete } from "@/lib/types/cronometro";
import { SeletorMateria } from "./seletor-materia";

export function PainelTimer({
  materias,
  lembretes,
}: {
  materias: Materia[];
  lembretes: Lembrete[];
}) {
  const [materiaId, setMateriaId] = useState<string | null>(
    materias[0]?.id ?? null
  );
  const [minutos, setMinutos] = useState(45);
  const [duracaoAtiva, setDuracaoAtiva] = useState<number | null>(null);
  const inicioSessaoRef = useRef<string | null>(null);

  const contador = useContador({
    regressivo: true,
    duracaoSegundos: duracaoAtiva ?? undefined,
    aoFinalizar: async () => {
      tocarBipe();
      notificar("Tempo esgotado!", "Seu timer chegou ao fim.");
      toast.add({
        title: "Tempo esgotado!",
        description: "Sessão salva no histórico.",
        type: "success",
      });
      if (duracaoAtiva) {
        const resultado = await salvarSessao({
          subjectId: materiaId,
          startedAt: inicioSessaoRef.current ?? new Date().toISOString(),
          endedAt: new Date().toISOString(),
          durationSeconds: duracaoAtiva,
          type: "timer",
        });
        celebrarMetaSeAtingida(resultado);
      }
      setDuracaoAtiva(null);
    },
  });

  useLembretes(lembretes, contador.decorridos, contador.rodando);

  function iniciar() {
    if (!materiaId) {
      toast.add({
        title: "Selecione uma matéria",
        description: "Escolha a matéria antes de iniciar o timer.",
        type: "warning",
      });
      return;
    }
    if (!Number.isFinite(minutos) || minutos <= 0) {
      toast.add({
        title: "Tempo inválido",
        description: "Informe uma quantidade de minutos maior que zero.",
        type: "warning",
      });
      return;
    }
    pedirPermissaoNotificacao();
    inicioSessaoRef.current = new Date().toISOString();
    setDuracaoAtiva(minutos * 60);
    contador.iniciar();
  }

  async function pararManual() {
    const duracao = contador.decorridos;
    contador.parar();
    setDuracaoAtiva(null);
    if (duracao >= 1) {
      const resultado = await salvarSessao({
        subjectId: materiaId,
        startedAt: inicioSessaoRef.current ?? new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: duracao,
        type: "timer",
      });
      toast.add({
        title: "Sessão salva",
        description: `${formatarHMS(duracao)} registrados.`,
        type: "success",
      });
      celebrarMetaSeAtingida(resultado);
    }
  }

  const emAndamento = duracaoAtiva !== null;

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex flex-wrap items-end justify-center gap-4">
        <SeletorMateria
          materias={materias}
          valor={materiaId}
          onChange={setMateriaId}
          disabled={emAndamento}
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minutos" className="text-xs text-muted-foreground">
            Minutos
          </Label>
          <Input
            id="minutos"
            type="number"
            min={1}
            value={minutos}
            onChange={(e) => setMinutos(Number(e.target.value))}
            disabled={emAndamento}
            className="w-24"
          />
        </div>
      </div>

      <div className="font-mono text-6xl font-semibold tabular-nums">
        {formatarHMS(contador.restantes ?? minutos * 60)}
      </div>

      <div className="flex gap-2">
        {!emAndamento && (
          <Button size="lg" onClick={iniciar}>
            <Play /> Iniciar
          </Button>
        )}
        {emAndamento && contador.rodando && (
          <Button size="lg" variant="outline" onClick={contador.pausar}>
            <Pause /> Pausar
          </Button>
        )}
        {emAndamento && !contador.rodando && (
          <Button size="lg" onClick={contador.retomar}>
            <Play /> Retomar
          </Button>
        )}
        {emAndamento && (
          <Button size="lg" variant="destructive" onClick={pararManual}>
            <Square /> Parar e salvar
          </Button>
        )}
      </div>
    </div>
  );
}

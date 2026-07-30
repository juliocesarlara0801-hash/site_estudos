"use client";

import { useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

import { useContador } from "@/lib/hooks/use-contador";
import { useLembretes } from "@/lib/hooks/use-lembretes";
import { salvarSessao } from "@/lib/actions/sessoes";
import { formatarHMS } from "@/lib/utils/tempo";
import { pedirPermissaoNotificacao } from "@/lib/utils/notificacoes";
import { celebrarMetaSeAtingida } from "@/lib/utils/celebrar-meta";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { Materia } from "@/lib/types/materia";
import type { Lembrete } from "@/lib/types/cronometro";
import { SeletorMateria } from "./seletor-materia";

export function PainelLivre({
  materias,
  lembretes,
}: {
  materias: Materia[];
  lembretes: Lembrete[];
}) {
  const [materiaId, setMateriaId] = useState<string | null>(
    materias[0]?.id ?? null
  );
  const inicioSessaoRef = useRef<string | null>(null);
  const contador = useContador({});

  useLembretes(lembretes, contador.decorridos, contador.rodando);

  function iniciar() {
    if (!materiaId) {
      toast.add({
        title: "Selecione uma matéria",
        description: "Escolha a matéria antes de iniciar o cronômetro.",
        type: "warning",
      });
      return;
    }
    pedirPermissaoNotificacao();
    inicioSessaoRef.current = new Date().toISOString();
    contador.iniciar();
  }

  async function parar() {
    const duracao = contador.decorridos;
    const inicio = inicioSessaoRef.current ?? new Date().toISOString();
    contador.parar();

    if (duracao >= 1) {
      const resultado = await salvarSessao({
        subjectId: materiaId,
        startedAt: inicio,
        endedAt: new Date().toISOString(),
        durationSeconds: duracao,
        type: "free",
      });
      toast.add({
        title: "Sessão salva",
        description: `${formatarHMS(duracao)} registrados.`,
        type: "success",
      });
      celebrarMetaSeAtingida(resultado);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <SeletorMateria
        materias={materias}
        valor={materiaId}
        onChange={setMateriaId}
        disabled={contador.rodando}
      />

      <div className="font-mono text-6xl font-semibold tabular-nums">
        {formatarHMS(contador.decorridos)}
      </div>

      <div className="flex gap-2">
        {!contador.rodando && contador.decorridos === 0 && (
          <Button size="lg" onClick={iniciar}>
            <Play /> Iniciar
          </Button>
        )}
        {contador.rodando && (
          <Button size="lg" variant="outline" onClick={contador.pausar}>
            <Pause /> Pausar
          </Button>
        )}
        {!contador.rodando && contador.decorridos > 0 && (
          <Button size="lg" onClick={contador.retomar}>
            <Play /> Retomar
          </Button>
        )}
        {contador.decorridos > 0 && (
          <Button size="lg" variant="destructive" onClick={parar}>
            <Square /> Parar e salvar
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

import type { Lembrete } from "@/lib/types/cronometro";
import { tocarBipe } from "@/lib/utils/som";
import { notificar } from "@/lib/utils/notificacoes";
import { toast } from "@/components/ui/toast";

/**
 * Dispara lembretes (toast + som + notificação do navegador) sempre que
 * o tempo decorrido de uma sessão em andamento cruza um múltiplo do
 * intervalo configurado para cada lembrete habilitado.
 */
export function useLembretes(
  lembretes: Lembrete[],
  segundosDecorridos: number,
  rodando: boolean
) {
  const disparadosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (segundosDecorridos === 0) {
      disparadosRef.current.clear();
    }

    if (!rodando || segundosDecorridos === 0) return;

    for (const lembrete of lembretes) {
      if (!lembrete.enabled || lembrete.interval_minutes <= 0) continue;

      const intervaloSegundos = lembrete.interval_minutes * 60;
      if (segundosDecorridos % intervaloSegundos !== 0) continue;

      const chave = `${lembrete.id}-${segundosDecorridos}`;
      if (disparadosRef.current.has(chave)) continue;
      disparadosRef.current.add(chave);

      tocarBipe();
      notificar("Lembrete", lembrete.message);
      toast.add({
        title: "Lembrete",
        description: lembrete.message,
        type: "info",
      });
    }
  }, [segundosDecorridos, rodando, lembretes]);
}

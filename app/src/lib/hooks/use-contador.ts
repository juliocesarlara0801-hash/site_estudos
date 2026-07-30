"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cronômetro genérico baseado em timestamps (não em contagem de ticks),
 * para não perder precisão se a aba ficar em segundo plano.
 * Serve tanto para o cronômetro livre (regressivo=false) quanto para o timer (regressivo=true).
 */
export function useContador({
  regressivo = false,
  duracaoSegundos,
  aoFinalizar,
}: {
  regressivo?: boolean;
  duracaoSegundos?: number;
  aoFinalizar?: () => void;
}) {
  const [rodando, setRodando] = useState(false);
  const [decorridos, setDecorridos] = useState(0);
  const inicioRef = useRef<number | null>(null);
  const finalizadoRef = useRef(false);
  const aoFinalizarRef = useRef(aoFinalizar);
  useEffect(() => {
    aoFinalizarRef.current = aoFinalizar;
  });

  useEffect(() => {
    if (!rodando) return;

    const id = setInterval(() => {
      const passados = Math.floor(
        (Date.now() - (inicioRef.current ?? Date.now())) / 1000
      );

      if (
        regressivo &&
        duracaoSegundos !== undefined &&
        passados >= duracaoSegundos &&
        !finalizadoRef.current
      ) {
        finalizadoRef.current = true;
        setDecorridos(duracaoSegundos);
        setRodando(false);
        aoFinalizarRef.current?.();
        return;
      }

      setDecorridos(passados);
    }, 250);

    return () => clearInterval(id);
  }, [rodando, regressivo, duracaoSegundos]);

  function iniciar() {
    finalizadoRef.current = false;
    inicioRef.current = Date.now();
    setDecorridos(0);
    setRodando(true);
  }

  function pausar() {
    setRodando(false);
  }

  function retomar() {
    inicioRef.current = Date.now() - decorridos * 1000;
    setRodando(true);
  }

  function parar() {
    setRodando(false);
    finalizadoRef.current = false;
    inicioRef.current = null;
    setDecorridos(0);
  }

  const restantes =
    regressivo && duracaoSegundos !== undefined
      ? Math.max(0, duracaoSegundos - decorridos)
      : undefined;

  return { decorridos, restantes, rodando, iniciar, pausar, retomar, parar };
}

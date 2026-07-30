"use client";

import { useEffect, useRef, useState } from "react";

export type FasePomodoro = "estudo" | "pausa_curta" | "pausa_longa";

export type ConfigPomodoro = {
  estudoMinutos: number;
  pausaCurtaMinutos: number;
  pausaLongaMinutos: number;
  ciclosAtePausaLonga: number;
};

/**
 * Máquina de estados do Pomodoro: estudo -> pausa curta -> ... -> pausa longa a cada N ciclos.
 * A fonte da verdade durante a contagem fica em refs (evita closures desatualizadas
 * dentro do interval quando a fase muda sozinha); o valor exposto pro componente
 * é sempre espelhado em state, já que refs não podem ser lidas durante a renderização.
 */
export function usePomodoro(
  config: ConfigPomodoro,
  aoCompletarFase: (
    fase: FasePomodoro,
    cicloAtual: number,
    segundosDaFase: number
  ) => void
) {
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });
  const aoCompletarFaseRef = useRef(aoCompletarFase);
  useEffect(() => {
    aoCompletarFaseRef.current = aoCompletarFase;
  });

  const faseRef = useRef<FasePomodoro>("estudo");
  const cicloRef = useRef(1);
  const duracaoFaseRef = useRef(config.estudoMinutos * 60);
  const inicioRef = useRef<number | null>(null);

  const [rodando, setRodando] = useState(false);
  const [fase, setFase] = useState<FasePomodoro>("estudo");
  const [cicloAtual, setCicloAtual] = useState(1);
  const [duracaoFase, setDuracaoFase] = useState(config.estudoMinutos * 60);
  const [restantes, setRestantes] = useState(config.estudoMinutos * 60);

  function duracaoDaFase(fase: FasePomodoro) {
    const c = configRef.current;
    if (fase === "estudo") return c.estudoMinutos * 60;
    if (fase === "pausa_curta") return c.pausaCurtaMinutos * 60;
    return c.pausaLongaMinutos * 60;
  }

  useEffect(() => {
    if (!rodando) return;

    const id = setInterval(() => {
      const passados = Math.floor(
        (Date.now() - (inicioRef.current ?? Date.now())) / 1000
      );
      let novoRestante = duracaoFaseRef.current - passados;

      if (novoRestante <= 0) {
        aoCompletarFaseRef.current(
          faseRef.current,
          cicloRef.current,
          duracaoFaseRef.current
        );

        if (faseRef.current === "estudo") {
          const ehPausaLonga =
            cicloRef.current % configRef.current.ciclosAtePausaLonga === 0;
          faseRef.current = ehPausaLonga ? "pausa_longa" : "pausa_curta";
        } else {
          faseRef.current = "estudo";
          cicloRef.current += 1;
        }

        duracaoFaseRef.current = duracaoDaFase(faseRef.current);
        inicioRef.current = Date.now();
        novoRestante = duracaoFaseRef.current;

        setFase(faseRef.current);
        setCicloAtual(cicloRef.current);
        setDuracaoFase(duracaoFaseRef.current);
      }

      setRestantes(novoRestante);
    }, 250);

    return () => clearInterval(id);
  }, [rodando]);

  function iniciar() {
    faseRef.current = "estudo";
    cicloRef.current = 1;
    duracaoFaseRef.current = duracaoDaFase("estudo");
    inicioRef.current = Date.now();
    setFase("estudo");
    setCicloAtual(1);
    setDuracaoFase(duracaoFaseRef.current);
    setRestantes(duracaoFaseRef.current);
    setRodando(true);
  }

  function pausar() {
    setRodando(false);
  }

  function retomar() {
    inicioRef.current = Date.now() - (duracaoFaseRef.current - restantes) * 1000;
    setRodando(true);
  }

  function parar() {
    setRodando(false);
    faseRef.current = "estudo";
    cicloRef.current = 1;
    duracaoFaseRef.current = duracaoDaFase("estudo");
    setFase("estudo");
    setCicloAtual(1);
    setDuracaoFase(duracaoFaseRef.current);
    setRestantes(duracaoFaseRef.current);
  }

  return {
    fase,
    cicloAtual,
    restantes,
    duracaoFase,
    rodando,
    iniciar,
    pausar,
    retomar,
    parar,
  };
}

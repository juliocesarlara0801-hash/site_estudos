import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";

import type { createClient } from "@/lib/supabase/server";

export type Periodo = "semana" | "mes";

export type DadosEstatisticas = {
  totalSemanaAtual: number;
  totalSemanaAnterior: number;
  totalMesAtual: number;
  totalDesdeInicio: number;
  variacaoPercentual: number | null;
  porMateria: { materiaId: string; nome: string; cor: string; segundos: number }[];
  porDia: { data: string; horas: number }[];
};

export async function obterDadosEstatisticas(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  filtros: { periodo: Periodo; materiaId: string | null }
): Promise<DadosEstatisticas> {
  const agora = new Date();
  const inicioSemanaAtual = startOfWeek(agora, { weekStartsOn: 0 });
  const fimSemanaAtual = endOfWeek(agora, { weekStartsOn: 0 });
  const inicioSemanaAnterior = subWeeks(inicioSemanaAtual, 1);
  const fimSemanaAnterior = subWeeks(fimSemanaAtual, 1);
  const inicioMesAtual = startOfMonth(agora);
  const fimMesAtual = endOfMonth(agora);

  let query = supabase
    .from("study_sessions")
    .select("duration_seconds, subject_id, started_at")
    .eq("user_id", userId);

  if (filtros.materiaId) {
    query = query.eq("subject_id", filtros.materiaId);
  }

  const { data: sessoes } = await query;
  const todasSessoes = sessoes ?? [];

  function somarEntre(inicio: Date, fim: Date) {
    return todasSessoes
      .filter((s) => {
        const d = new Date(s.started_at);
        return d >= inicio && d <= fim;
      })
      .reduce((soma, s) => soma + s.duration_seconds, 0);
  }

  const totalSemanaAtual = somarEntre(inicioSemanaAtual, fimSemanaAtual);
  const totalSemanaAnterior = somarEntre(inicioSemanaAnterior, fimSemanaAnterior);
  const totalMesAtual = somarEntre(inicioMesAtual, fimMesAtual);
  const totalDesdeInicio = todasSessoes.reduce(
    (soma, s) => soma + s.duration_seconds,
    0
  );

  const variacaoPercentual =
    totalSemanaAnterior > 0
      ? ((totalSemanaAtual - totalSemanaAnterior) / totalSemanaAnterior) * 100
      : totalSemanaAtual > 0
        ? 100
        : null;

  const { data: materias } = await supabase
    .from("subjects")
    .select("id, name, color")
    .eq("user_id", userId)
    .order("name");

  const [inicioPeriodo, fimPeriodo] =
    filtros.periodo === "semana"
      ? [inicioSemanaAtual, fimSemanaAtual]
      : [inicioMesAtual, fimMesAtual];

  const porMateria = (materias ?? [])
    .map((materia) => {
      const segundos = todasSessoes
        .filter((s) => s.subject_id === materia.id)
        .filter((s) => {
          const d = new Date(s.started_at);
          return d >= inicioPeriodo && d <= fimPeriodo;
        })
        .reduce((soma, s) => soma + s.duration_seconds, 0);
      return {
        materiaId: materia.id as string,
        nome: materia.name as string,
        cor: materia.color as string,
        segundos,
      };
    })
    .filter((m) => m.segundos > 0)
    .sort((a, b) => b.segundos - a.segundos);

  const porDia: { data: string; horas: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const dia = subDays(agora, 29 - i);
    const chave = format(dia, "yyyy-MM-dd");
    const segundos = todasSessoes
      .filter((s) => format(new Date(s.started_at), "yyyy-MM-dd") === chave)
      .reduce((soma, s) => soma + s.duration_seconds, 0);
    porDia.push({ data: chave, horas: Math.round((segundos / 3600) * 100) / 100 });
  }

  return {
    totalSemanaAtual,
    totalSemanaAnterior,
    totalMesAtual,
    totalDesdeInicio,
    variacaoPercentual,
    porMateria,
    porDia,
  };
}

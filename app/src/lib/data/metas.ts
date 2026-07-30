import { subMonths, subWeeks } from "date-fns";

import type { createClient } from "@/lib/supabase/server";
import { intervaloDoPeriodo, type PeriodoMeta } from "@/lib/utils/periodo";

export type MetaComProgresso = {
  id: string;
  materiaNome: string;
  materiaCor: string;
  targetHours: number;
  period: PeriodoMeta;
  progressoHoras: number;
  historico: boolean[];
};

const JANELAS_HISTORICO: Record<PeriodoMeta, number> = {
  weekly: 8,
  monthly: 6,
};

export async function obterMetasComProgresso(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<MetaComProgresso[]> {
  const { data: metas } = await supabase
    .from("goals")
    .select("id, subject_id, target_hours, period, subjects(name, color)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!metas || metas.length === 0) return [];

  return Promise.all(
    metas.map(async (meta) => {
      const period = meta.period as PeriodoMeta;
      const numJanelas = JANELAS_HISTORICO[period];
      const janelas = Array.from({ length: numJanelas }, (_, i) => {
        const referencia =
          period === "weekly"
            ? subWeeks(new Date(), numJanelas - 1 - i)
            : subMonths(new Date(), numJanelas - 1 - i);
        return intervaloDoPeriodo(period, referencia);
      });

      const { data: sessoes } = await supabase
        .from("study_sessions")
        .select("duration_seconds, started_at")
        .eq("user_id", userId)
        .eq("subject_id", meta.subject_id)
        .gte("started_at", janelas[0].inicio.toISOString());

      const todasSessoes = sessoes ?? [];
      const metaSegundos = meta.target_hours * 3600;

      const historico = janelas.map(({ inicio, fim }) => {
        const total = todasSessoes
          .filter((s) => {
            const d = new Date(s.started_at);
            return d >= inicio && d <= fim;
          })
          .reduce((soma, s) => soma + s.duration_seconds, 0);
        return total >= metaSegundos;
      });

      const janelaAtual = janelas[numJanelas - 1];
      const progressoSegundos = todasSessoes
        .filter((s) => {
          const d = new Date(s.started_at);
          return d >= janelaAtual.inicio && d <= janelaAtual.fim;
        })
        .reduce((soma, s) => soma + s.duration_seconds, 0);

      const subjectRelacionado = meta.subjects as unknown as
        | { name: string; color: string }
        | { name: string; color: string }[]
        | null;
      const materia = Array.isArray(subjectRelacionado)
        ? subjectRelacionado[0]
        : subjectRelacionado;

      return {
        id: meta.id as string,
        materiaNome: materia?.name ?? "Matéria removida",
        materiaCor: materia?.color ?? "#898781",
        targetHours: meta.target_hours as number,
        period,
        progressoHoras: Math.round((progressoSegundos / 3600) * 100) / 100,
        historico,
      };
    })
  );
}

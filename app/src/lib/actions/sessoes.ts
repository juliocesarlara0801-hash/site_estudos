"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { intervaloDoPeriodo, type PeriodoMeta } from "@/lib/utils/periodo";

export type TipoSessao = "free" | "timer" | "pomodoro";

export async function salvarSessao(input: {
  subjectId: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  type: TipoSessao;
}) {
  if (input.durationSeconds < 1) {
    return { ok: true as const, metaAtingida: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada." };
  }

  const { error } = await supabase.from("study_sessions").insert({
    user_id: user.id,
    subject_id: input.subjectId,
    started_at: input.startedAt,
    ended_at: input.endedAt,
    duration_seconds: Math.round(input.durationSeconds),
    type: input.type,
  });

  if (error) {
    return { erro: "Não foi possível salvar a sessão de estudo." };
  }

  revalidatePath("/estatisticas");
  revalidatePath("/dashboard");
  revalidatePath("/metas");

  let metaAtingida: { materiaNome: string; periodo: PeriodoMeta } | null = null;

  if (input.subjectId) {
    const { data: metas } = await supabase
      .from("goals")
      .select("target_hours, period, subjects(name)")
      .eq("user_id", user.id)
      .eq("subject_id", input.subjectId);

    for (const meta of metas ?? []) {
      const periodo = meta.period as PeriodoMeta;
      const { inicio, fim } = intervaloDoPeriodo(periodo);

      const { data: sessoesPeriodo } = await supabase
        .from("study_sessions")
        .select("duration_seconds")
        .eq("user_id", user.id)
        .eq("subject_id", input.subjectId)
        .gte("started_at", inicio.toISOString())
        .lte("started_at", fim.toISOString());

      const totalSegundos = (sessoesPeriodo ?? []).reduce(
        (soma, s) => soma + s.duration_seconds,
        0
      );
      const metaSegundos = meta.target_hours * 3600;
      const totalAntesDestaSessao = totalSegundos - Math.round(input.durationSeconds);

      if (totalAntesDestaSessao < metaSegundos && totalSegundos >= metaSegundos) {
        const subjectRelacionado = meta.subjects as unknown as
          | { name: string }
          | { name: string }[]
          | null;
        const materiaNome = Array.isArray(subjectRelacionado)
          ? (subjectRelacionado[0]?.name ?? "matéria")
          : (subjectRelacionado?.name ?? "matéria");

        metaAtingida = { materiaNome, periodo };
        break;
      }
    }
  }

  return { ok: true as const, metaAtingida };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcularPercentual } from "@/lib/utils/desempenho";

export type EstadoQuestoes = { erro?: string } | undefined;

type LinhaMateria = { subjectId: string; questions: number; correct: number };

function parseMaterias(raw: string): LinhaMateria[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const linhas: LinhaMateria[] = [];
    for (const item of parsed) {
      const subjectId = String(item?.subjectId ?? "");
      const questions = Number(item?.questions);
      const correct = Number(item?.correct);
      if (!subjectId || !Number.isFinite(questions) || questions <= 0) return null;
      if (!Number.isFinite(correct) || correct < 0 || correct > questions) return null;
      linhas.push({ subjectId, questions: Math.trunc(questions), correct: Math.trunc(correct) });
    }
    return linhas.length > 0 ? linhas : null;
  } catch {
    return null;
  }
}

export async function salvarSimulado(
  _estado: EstadoQuestoes,
  formData: FormData
): Promise<EstadoQuestoes> {
  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const materiasRaw = String(formData.get("materias") ?? "[]");

  if (!name) return { erro: "Informe o nome do simulado." };
  if (!date) return { erro: "Informe a data do simulado." };

  const linhas = parseMaterias(materiasRaw);
  if (!linhas) {
    return {
      erro: "Adicione ao menos uma matéria, com número de questões maior que zero e acertos válidos.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const totalQuestions = linhas.reduce((soma, l) => soma + l.questions, 0);
  const totalCorrect = linhas.reduce((soma, l) => soma + l.correct, 0);
  const totalWrong = totalQuestions - totalCorrect;
  const percentage = calcularPercentual(totalCorrect, totalQuestions);

  let simuladoId = id;

  if (simuladoId) {
    const { error } = await supabase
      .from("simulados")
      .update({
        name,
        description,
        date,
        total_questions: totalQuestions,
        total_correct: totalCorrect,
        total_wrong: totalWrong,
        percentage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", simuladoId);

    if (error) return { erro: "Não foi possível salvar o simulado." };

    await supabase.from("simulado_subjects").delete().eq("simulado_id", simuladoId);
  } else {
    const { data: novo, error } = await supabase
      .from("simulados")
      .insert({
        user_id: user.id,
        name,
        description,
        date,
        total_questions: totalQuestions,
        total_correct: totalCorrect,
        total_wrong: totalWrong,
        percentage,
      })
      .select("id")
      .single();

    if (error || !novo) return { erro: "Não foi possível criar o simulado." };
    simuladoId = novo.id as string;
  }

  const { error: erroMaterias } = await supabase.from("simulado_subjects").insert(
    linhas.map((l) => ({
      simulado_id: simuladoId,
      subject_id: l.subjectId,
      questions: l.questions,
      correct: l.correct,
      wrong: l.questions - l.correct,
      percentage: calcularPercentual(l.correct, l.questions),
    }))
  );

  if (erroMaterias) return { erro: "Não foi possível salvar as matérias do simulado." };

  revalidatePath("/questoes");
  revalidatePath(`/questoes/simulados/${simuladoId}`);
  revalidatePath("/calendario");
  return undefined;
}

export async function excluirSimulado(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("simulados").delete().eq("id", id);
  revalidatePath("/questoes");
  revalidatePath("/calendario");
  return error ? { erro: "Não foi possível excluir o simulado." } : { ok: true as const };
}

export async function salvarLista(
  _estado: EstadoQuestoes,
  formData: FormData
): Promise<EstadoQuestoes> {
  const id = String(formData.get("id") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const subjectId = String(formData.get("subjectId") ?? "");
  const date = String(formData.get("date") ?? "");
  const questions = Number(formData.get("questions"));
  const correct = Number(formData.get("correct"));
  const source = String(formData.get("source") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title) return { erro: "Informe o título da lista." };
  if (!subjectId) return { erro: "Selecione uma matéria." };
  if (!date) return { erro: "Informe a data." };
  if (!Number.isFinite(questions) || questions <= 0) {
    return { erro: "Informe a quantidade de questões." };
  }
  if (!Number.isFinite(correct) || correct < 0 || correct > questions) {
    return { erro: "Acertos não pode ser maior que o total de questões." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const wrong = questions - correct;
  const percentage = calcularPercentual(correct, questions);

  const payload = {
    title,
    subject_id: subjectId,
    date,
    questions,
    correct,
    wrong,
    percentage,
    source,
    description,
  };

  const { error } = id
    ? await supabase
        .from("exercise_lists")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("exercise_lists").insert({ ...payload, user_id: user.id });

  if (error) return { erro: "Não foi possível salvar a lista." };

  revalidatePath("/questoes");
  if (id) revalidatePath(`/questoes/listas/${id}`);
  revalidatePath("/calendario");
  return undefined;
}

export async function excluirLista(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("exercise_lists").delete().eq("id", id);
  revalidatePath("/questoes");
  revalidatePath("/calendario");
  return error ? { erro: "Não foi possível excluir a lista." } : { ok: true as const };
}

export async function salvarMeta(
  _estado: EstadoQuestoes,
  formData: FormData
): Promise<EstadoQuestoes> {
  const subjectId = String(formData.get("subjectId") ?? "");
  const targetPercentage = Number(formData.get("targetPercentage"));

  if (!subjectId) return { erro: "Selecione uma matéria." };
  if (!Number.isFinite(targetPercentage) || targetPercentage <= 0 || targetPercentage > 100) {
    return { erro: "Informe uma meta entre 1% e 100%." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const { error } = await supabase
    .from("accuracy_goals")
    .upsert(
      { user_id: user.id, subject_id: subjectId, target_percentage: targetPercentage },
      { onConflict: "user_id,subject_id" }
    );

  if (error) return { erro: "Não foi possível salvar a meta." };

  revalidatePath("/questoes");
  return undefined;
}

export async function excluirMeta(id: string) {
  const supabase = await createClient();
  await supabase.from("accuracy_goals").delete().eq("id", id);
  revalidatePath("/questoes");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoMeta = { erro?: string } | undefined;

export async function criarMeta(
  _estado: EstadoMeta,
  formData: FormData
): Promise<EstadoMeta> {
  const subjectId = String(formData.get("subjectId") ?? "");
  const targetHours = Number(formData.get("targetHours"));
  const period = String(formData.get("period") ?? "weekly");

  if (!subjectId) {
    return { erro: "Selecione uma matéria." };
  }
  if (!Number.isFinite(targetHours) || targetHours <= 0) {
    return { erro: "Informe uma meta de horas maior que zero." };
  }
  if (period !== "weekly" && period !== "monthly") {
    return { erro: "Período inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada." };
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    subject_id: subjectId,
    target_hours: targetHours,
    period,
  });

  if (error) {
    return { erro: "Não foi possível criar a meta." };
  }

  revalidatePath("/metas");
  return undefined;
}

export async function excluirMeta(id: string) {
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", id);
  revalidatePath("/metas");
}

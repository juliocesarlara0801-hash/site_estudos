"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoLembrete = { erro?: string } | undefined;

export async function criarLembrete(
  _estado: EstadoLembrete,
  formData: FormData
): Promise<EstadoLembrete> {
  const mensagem = String(formData.get("mensagem") ?? "").trim();
  const intervalo = Number(formData.get("intervalo"));
  const tipo = String(formData.get("tipo") ?? "personalizado");

  if (!mensagem) {
    return { erro: "Escreva o texto do lembrete." };
  }
  if (!Number.isFinite(intervalo) || intervalo <= 0) {
    return { erro: "Informe um intervalo válido em minutos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada." };
  }

  const { error } = await supabase.from("reminders").insert({
    user_id: user.id,
    type: tipo,
    message: mensagem,
    interval_minutes: Math.round(intervalo),
    enabled: true,
  });

  if (error) {
    return { erro: "Não foi possível criar o lembrete." };
  }

  revalidatePath("/configuracoes");
  revalidatePath("/cronometro");
  return undefined;
}

export async function alternarLembrete(id: string, enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("reminders").update({ enabled }).eq("id", id);
  revalidatePath("/configuracoes");
  revalidatePath("/cronometro");
}

export async function excluirLembrete(id: string) {
  const supabase = await createClient();
  await supabase.from("reminders").delete().eq("id", id);
  revalidatePath("/configuracoes");
  revalidatePath("/cronometro");
}

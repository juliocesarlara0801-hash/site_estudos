"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoConfig = { erro?: string; mensagem?: string } | undefined;

export async function atualizarPerfil(
  _estado: EstadoConfig,
  formData: FormData
): Promise<EstadoConfig> {
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    return { erro: "Informe um nome de exibição." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: nome })
    .eq("id", user.id);

  if (error) {
    return { erro: "Não foi possível salvar o nome." };
  }

  revalidatePath("/", "layout");
  return { mensagem: "Nome atualizado com sucesso." };
}

// Paleta categórica validada para distinção sob daltonismo (ordem importa: veja
// scripts/validate_palette.js do skill de dataviz — não reordenar sem revalidar).
const CORES_PADRAO = [
  "#2a78d6", // azul
  "#eb6834", // laranja
  "#1baf7a", // água
  "#eda100", // amarelo
  "#e87ba4", // magenta
  "#008300", // verde
  "#4a3aa7", // violeta
  "#e34948", // vermelho
];

export async function criarMateria(
  _estado: EstadoConfig,
  formData: FormData
): Promise<EstadoConfig> {
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    return { erro: "Informe o nome da matéria." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada. Faça login novamente." };
  }

  const { count } = await supabase
    .from("subjects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const cor = CORES_PADRAO[(count ?? 0) % CORES_PADRAO.length];

  const { error } = await supabase
    .from("subjects")
    .insert({ user_id: user.id, name: nome, color: cor });

  if (error) {
    return { erro: "Não foi possível criar a matéria." };
  }

  revalidatePath("/configuracoes");
  return { mensagem: "Matéria criada." };
}

export async function excluirMateria(id: string) {
  const supabase = await createClient();
  await supabase.from("subjects").delete().eq("id", id);
  revalidatePath("/configuracoes");
}

export async function salvarPomodoro(
  _estado: EstadoConfig,
  formData: FormData
): Promise<EstadoConfig> {
  const estudo = Number(formData.get("estudo_minutos"));
  const pausaCurta = Number(formData.get("pausa_curta_minutos"));
  const pausaLonga = Number(formData.get("pausa_longa_minutos"));
  const ciclos = Number(formData.get("ciclos_ate_pausa_longa"));

  if (
    [estudo, pausaCurta, pausaLonga, ciclos].some(
      (valor) => !Number.isFinite(valor) || valor <= 0
    )
  ) {
    return { erro: "Preencha todos os campos com números maiores que zero." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      pomodoro_settings: {
        estudo_minutos: Math.round(estudo),
        pausa_curta_minutos: Math.round(pausaCurta),
        pausa_longa_minutos: Math.round(pausaLonga),
        ciclos_ate_pausa_longa: Math.round(ciclos),
      },
    })
    .eq("id", user.id);

  if (error) {
    return { erro: "Não foi possível salvar as preferências do Pomodoro." };
  }

  revalidatePath("/configuracoes");
  revalidatePath("/cronometro");
  return { mensagem: "Preferências do Pomodoro salvas." };
}

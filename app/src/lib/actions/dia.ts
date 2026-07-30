"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PayloadDia } from "@/lib/types/calendario";

export async function salvarDia(date: string, payload: PayloadDia) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase.from("day_entries").upsert(
    {
      user_id: user.id,
      date,
      schedule: payload.schedule,
      notes: payload.notes,
      conclusions: payload.conclusions,
      doubts: JSON.stringify(payload.doubts),
      pending: JSON.stringify(payload.pending),
      completed: payload.completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );

  if (error) {
    return { erro: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/calendario");
  return { ok: true as const };
}

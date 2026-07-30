"use server";

import { addDays, format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { parseArrayJson } from "@/lib/utils/json-lista";
import type { DadosExportacaoDia } from "@/lib/utils/pdf-dia";

export async function obterDadosSemanaParaPdf(inicioSemanaISO: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Sessão expirada." as const };
  }

  const inicio = new Date(`${inicioSemanaISO}T00:00:00`);
  const datas = Array.from({ length: 7 }, (_, i) =>
    format(addDays(inicio, i), "yyyy-MM-dd")
  );

  const [{ data: entradas }, { data: materias }] = await Promise.all([
    supabase
      .from("day_entries")
      .select("date, schedule, notes, conclusions, doubts, pending, completed")
      .eq("user_id", user.id)
      .gte("date", datas[0])
      .lte("date", datas[6]),
    supabase.from("subjects").select("id, name").eq("user_id", user.id),
  ]);

  const materiasPorId = Object.fromEntries(
    (materias ?? []).map((m) => [m.id, m.name])
  );
  const porData = new Map((entradas ?? []).map((e) => [e.date, e]));

  const dias: DadosExportacaoDia[] = datas.map((data) => {
    const entrada = porData.get(data);
    return {
      data,
      schedule: entrada?.schedule ?? [],
      notes: entrada?.notes ?? "",
      conclusions: entrada?.conclusions ?? "",
      doubts: parseArrayJson(entrada?.doubts),
      pending: parseArrayJson(entrada?.pending),
      completed: entrada?.completed ?? [],
      materiasPorId,
    };
  });

  return { dias };
}

import { notFound } from "next/navigation";
import { isValid, parseISO } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { obterAtividadesDoDia } from "@/lib/data/questoes";
import { DiaEditor } from "@/components/calendario/dia-editor";
import { AtividadesDoDia } from "@/components/calendario/atividades-do-dia";

export default async function DiaPage({
  params,
}: {
  params: Promise<{ data: string }>;
}) {
  const { data: dataParam } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataParam) || !isValid(parseISO(dataParam))) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: entrada }, { data: materias }, atividades] = await Promise.all([
    supabase
      .from("day_entries")
      .select("schedule, notes, conclusions, doubts, pending, completed")
      .eq("user_id", user?.id ?? "")
      .eq("date", dataParam)
      .maybeSingle(),
    supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user?.id ?? "")
      .order("name"),
    obterAtividadesDoDia(supabase, user?.id ?? "", dataParam),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <AtividadesDoDia atividades={atividades} />
      <DiaEditor data={dataParam} entradaInicial={entrada} materias={materias ?? []} />
    </div>
  );
}

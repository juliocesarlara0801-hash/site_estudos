import { notFound } from "next/navigation";
import { isValid, parseISO } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { DiaEditor } from "@/components/calendario/dia-editor";

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

  const [{ data: entrada }, { data: materias }] = await Promise.all([
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
  ]);

  return (
    <DiaEditor data={dataParam} entradaInicial={entrada} materias={materias ?? []} />
  );
}

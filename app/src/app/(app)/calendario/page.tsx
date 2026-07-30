import {
  addDays,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { CalendarioMensal } from "@/components/calendario/calendario-mensal";
import { CalendarioSemanal } from "@/components/calendario/calendario-semanal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ visao?: string; mes?: string; data?: string }>;
}) {
  const {
    visao: visaoParam,
    mes: mesParam,
    data: dataParam,
  } = await searchParams;
  const visao = visaoParam === "semanal" ? "semanal" : "mensal";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let inicio: Date;
  let fim: Date;
  let mesAtual = new Date();
  let inicioSemana = startOfWeek(new Date(), { weekStartsOn: 0 });

  if (visao === "mensal") {
    mesAtual =
      mesParam && /^\d{4}-\d{2}$/.test(mesParam)
        ? parseISO(`${mesParam}-01`)
        : new Date();
    inicio = startOfMonth(mesAtual);
    fim = endOfMonth(mesAtual);
  } else {
    const base =
      dataParam && isValid(parseISO(dataParam)) ? parseISO(dataParam) : new Date();
    inicioSemana = startOfWeek(base, { weekStartsOn: 0 });
    inicio = inicioSemana;
    fim = addDays(inicioSemana, 6);
  }

  const { data: entradas } = await supabase
    .from("day_entries")
    .select("date")
    .eq("user_id", user?.id ?? "")
    .gte("date", format(inicio, "yyyy-MM-dd"))
    .lte("date", format(fim, "yyyy-MM-dd"));

  const datasComEntrada = (entradas ?? []).map((e) => e.date as string);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">
            Clique em um dia para ver o cronograma e as anotações.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={visao === "mensal" ? "default" : "ghost"}
            size="sm"
            render={<Link href="/calendario?visao=mensal">Mensal</Link>}
          />
          <Button
            variant={visao === "semanal" ? "default" : "ghost"}
            size="sm"
            render={<Link href="/calendario?visao=semanal">Semanal</Link>}
          />
        </div>
      </div>

      {visao === "mensal" ? (
        <CalendarioMensal
          mes={mesAtual}
          datasComEntrada={datasComEntrada.map((d) => parseISO(d))}
        />
      ) : (
        <CalendarioSemanal
          inicioSemana={inicioSemana}
          datasComEntrada={datasComEntrada}
        />
      )}
    </div>
  );
}

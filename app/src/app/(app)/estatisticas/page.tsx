import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { obterDadosEstatisticas, type Periodo } from "@/lib/data/estatisticas";
import { formatarHorasMinutos } from "@/lib/utils/tempo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Filtros } from "@/components/estatisticas/filtros";
import { GraficoPorMateria } from "@/components/estatisticas/grafico-por-materia";
import { GraficoPorDia } from "@/components/estatisticas/grafico-por-dia";
import { CartaoEstatistica } from "@/components/estatisticas/cartao-estatistica";

export default async function EstatisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; materia?: string }>;
}) {
  const { periodo: periodoParam, materia: materiaParam } = await searchParams;
  const periodo: Periodo = periodoParam === "mes" ? "mes" : "semana";
  const materiaId = materiaParam ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [dados, { data: materias }] = await Promise.all([
    obterDadosEstatisticas(supabase, user?.id ?? "", { periodo, materiaId }),
    supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user?.id ?? "")
      .order("name"),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estatísticas</h1>
          <p className="text-muted-foreground">
            Acompanhe quanto tempo você tem estudado.
          </p>
        </div>
        <Suspense>
          <Filtros materias={materias ?? []} />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoEstatistica
          rotulo="Esta semana"
          valor={formatarHorasMinutos(dados.totalSemanaAtual)}
          delta={
            dados.variacaoPercentual !== null
              ? { percentual: dados.variacaoPercentual, rotuloComparacao: "vs. semana passada" }
              : null
          }
        />
        <CartaoEstatistica
          rotulo="Este mês"
          valor={formatarHorasMinutos(dados.totalMesAtual)}
        />
        <CartaoEstatistica
          rotulo="Desde o início"
          valor={formatarHorasMinutos(dados.totalDesdeInicio)}
        />
        <CartaoEstatistica
          rotulo="Semana passada"
          valor={formatarHorasMinutos(dados.totalSemanaAnterior)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Tempo por matéria ({periodo === "semana" ? "esta semana" : "este mês"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoPorMateria dados={dados.porMateria} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo total por dia (últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoPorDia dados={dados.porDia} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

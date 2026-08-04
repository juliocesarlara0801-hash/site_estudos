import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { obterSimuladoDetalhe } from "@/lib/data/questoes";
import { excluirSimulado } from "@/lib/actions/questoes";
import { corPorPercentual } from "@/lib/utils/desempenho";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimuladoFormDialog } from "@/components/questoes/simulado-form-dialog";
import { ExcluirRegistroButton } from "@/components/questoes/excluir-registro-button";
import { GraficoDesempenhoMaterias } from "@/components/questoes/grafico-desempenho-materias";
import { ComparacaoAnterior } from "@/components/questoes/comparacao-anterior";

export default async function SimuladoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [detalhe, { data: materias }] = await Promise.all([
    obterSimuladoDetalhe(supabase, user?.id ?? "", id),
    supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user?.id ?? "")
      .order("name"),
  ]);

  if (!detalhe) notFound();

  const { simulado, anterior } = detalhe;
  const corGeral = corPorPercentual(simulado.percentage);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Voltar para questões"
            render={<Link href="/questoes" />}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{simulado.name}</h1>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(simulado.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SimuladoFormDialog
            materias={materias ?? []}
            simulado={simulado}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil /> Editar
              </Button>
            }
          />
          <ExcluirRegistroButton
            titulo="Excluir simulado"
            descricao={`Tem certeza que deseja excluir "${simulado.name}"? Essa ação não pode ser desfeita.`}
            aoConfirmar={() => excluirSimulado(simulado.id)}
            redirecionarPara="/questoes"
            rotulo="Excluir"
          />
        </div>
      </div>

      {simulado.description && (
        <p className="text-sm text-muted-foreground">{simulado.description}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Questões</CardDescription>
            <div className="text-2xl font-semibold">{simulado.totalQuestions}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Acertos</CardDescription>
            <div className="text-2xl font-semibold">{simulado.totalCorrect}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Erros</CardDescription>
            <div className="text-2xl font-semibold">{simulado.totalWrong}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>% de acerto geral</CardDescription>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold" style={{ color: corGeral }}>
                {simulado.percentage}%
              </span>
              {anterior && (
                <ComparacaoAnterior atual={simulado.percentage} anterior={anterior.percentage} />
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho por matéria</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoDesempenhoMaterias materias={simulado.materias} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento</CardTitle>
          {!anterior && (
            <CardDescription>
              Este é o primeiro simulado registrado — sem simulado anterior para comparar.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-2 font-medium">Matéria</th>
                <th className="pb-2 pr-2 font-medium">Questões</th>
                <th className="pb-2 pr-2 font-medium">Acertos</th>
                <th className="pb-2 pr-2 font-medium">Erros</th>
                <th className="pb-2 pr-2 font-medium">%</th>
                {anterior && <th className="pb-2 font-medium">Comparação</th>}
              </tr>
            </thead>
            <tbody>
              {simulado.materias.map((m) => {
                const cor = corPorPercentual(m.percentage);
                const materiaAnterior = anterior?.materias.find(
                  (a) => a.subjectId === m.subjectId
                );
                return (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      <Badge
                        style={{ backgroundColor: `${m.materiaCor}20`, color: m.materiaCor }}
                        className="border-0"
                      >
                        {m.materiaNome}
                      </Badge>
                    </td>
                    <td className="py-2 pr-2">{m.questions}</td>
                    <td className="py-2 pr-2">{m.correct}</td>
                    <td className="py-2 pr-2">{m.wrong}</td>
                    <td className="py-2 pr-2 font-medium" style={{ color: cor }}>
                      {m.percentage}%
                    </td>
                    {anterior && (
                      <td className="py-2">
                        {materiaAnterior ? (
                          <ComparacaoAnterior
                            atual={m.percentage}
                            anterior={materiaAnterior.percentage}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem dado anterior</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

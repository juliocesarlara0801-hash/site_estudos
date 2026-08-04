import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { obterListaDetalhe } from "@/lib/data/questoes";
import { excluirLista } from "@/lib/actions/questoes";
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
import { ListaFormDialog } from "@/components/questoes/lista-form-dialog";
import { ExcluirRegistroButton } from "@/components/questoes/excluir-registro-button";
import { ComparacaoAnterior } from "@/components/questoes/comparacao-anterior";

export default async function ListaDetalhePage({
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
    obterListaDetalhe(supabase, user?.id ?? "", id),
    supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user?.id ?? "")
      .order("name"),
  ]);

  if (!detalhe) notFound();

  const { lista, anterior } = detalhe;
  const cor = corPorPercentual(lista.percentage);

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
            <h1 className="text-2xl font-semibold tracking-tight">{lista.title}</h1>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(lista.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ListaFormDialog
            materias={materias ?? []}
            lista={lista}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil /> Editar
              </Button>
            }
          />
          <ExcluirRegistroButton
            titulo="Excluir lista"
            descricao={`Tem certeza que deseja excluir "${lista.title}"? Essa ação não pode ser desfeita.`}
            aoConfirmar={() => excluirLista(lista.id)}
            redirecionarPara="/questoes"
            rotulo="Excluir"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          style={{ backgroundColor: `${lista.materiaCor}20`, color: lista.materiaCor }}
          className="border-0"
        >
          {lista.materiaNome}
        </Badge>
        {lista.source && (
          <span className="text-sm text-muted-foreground">Fonte: {lista.source}</span>
        )}
      </div>

      {lista.description && (
        <p className="text-sm text-muted-foreground">{lista.description}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Questões</CardDescription>
            <div className="text-2xl font-semibold">{lista.questions}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Acertos</CardDescription>
            <div className="text-2xl font-semibold">{lista.correct}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Erros</CardDescription>
            <div className="text-2xl font-semibold">{lista.wrong}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>% de acerto</CardDescription>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold" style={{ color: cor }}>
                {lista.percentage}%
              </span>
              {anterior && (
                <ComparacaoAnterior atual={lista.percentage} anterior={anterior.percentage} />
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparação com a lista anterior</CardTitle>
        </CardHeader>
        <CardContent>
          {anterior ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{anterior.title}</span>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(anterior.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })} ·{" "}
                  {anterior.percentage}%
                </span>
              </div>
              <ComparacaoAnterior atual={lista.percentage} anterior={anterior.percentage} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma lista anterior de {lista.materiaNome} para comparar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

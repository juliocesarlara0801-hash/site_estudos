"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";

import { excluirSimulado } from "@/lib/actions/questoes";
import type { Materia } from "@/lib/types/materia";
import type { SimuladoComMaterias } from "@/lib/types/questoes";
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

export function SimuladoCard({
  simulado,
  materias,
}: {
  simulado: SimuladoComMaterias;
  materias: Materia[];
}) {
  const cor = corPorPercentual(simulado.percentage);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{simulado.name}</CardTitle>
          <CardDescription>
            {format(parseISO(simulado.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })} ·{" "}
            {simulado.totalQuestions} questões
          </CardDescription>
          <div className="flex flex-wrap gap-1">
            {simulado.materias.map((m) => (
              <Badge
                key={m.id}
                style={{ backgroundColor: `${m.materiaCor}20`, color: m.materiaCor }}
                className="border-0"
              >
                {m.materiaNome}
              </Badge>
            ))}
          </div>
        </div>
        <Badge
          style={{ backgroundColor: `${cor}20`, color: cor }}
          className="border-0 text-sm font-semibold"
        >
          {simulado.percentage}%
        </Badge>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/questoes/simulados/${simulado.id}`} />}
        >
          Ver detalhes
        </Button>
        <SimuladoFormDialog
          materias={materias}
          simulado={simulado}
          trigger={
            <Button size="icon-sm" variant="ghost" aria-label="Editar simulado">
              <Pencil className="text-muted-foreground" />
            </Button>
          }
        />
        <ExcluirRegistroButton
          titulo="Excluir simulado"
          descricao={`Tem certeza que deseja excluir "${simulado.name}"? Essa ação não pode ser desfeita.`}
          aoConfirmar={() => excluirSimulado(simulado.id)}
        />
      </CardContent>
    </Card>
  );
}

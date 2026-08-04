"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";

import { excluirLista } from "@/lib/actions/questoes";
import type { Materia } from "@/lib/types/materia";
import type { ListaExercicios } from "@/lib/types/questoes";
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

export function ListaCard({
  lista,
  materias,
}: {
  lista: ListaExercicios;
  materias: Materia[];
}) {
  const cor = corPorPercentual(lista.percentage);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{lista.title}</CardTitle>
          <CardDescription>
            {format(parseISO(lista.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })} ·{" "}
            {lista.questions} questões
            {lista.source && ` · ${lista.source}`}
          </CardDescription>
          <Badge
            style={{ backgroundColor: `${lista.materiaCor}20`, color: lista.materiaCor }}
            className="w-fit border-0"
          >
            {lista.materiaNome}
          </Badge>
        </div>
        <Badge
          style={{ backgroundColor: `${cor}20`, color: cor }}
          className="border-0 text-sm font-semibold"
        >
          {lista.percentage}%
        </Badge>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/questoes/listas/${lista.id}`} />}
        >
          Ver detalhes
        </Button>
        <ListaFormDialog
          materias={materias}
          lista={lista}
          trigger={
            <Button size="icon-sm" variant="ghost" aria-label="Editar lista">
              <Pencil className="text-muted-foreground" />
            </Button>
          }
        />
        <ExcluirRegistroButton
          titulo="Excluir lista"
          descricao={`Tem certeza que deseja excluir "${lista.title}"? Essa ação não pode ser desfeita.`}
          aoConfirmar={() => excluirLista(lista.id)}
        />
      </CardContent>
    </Card>
  );
}

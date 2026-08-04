import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import type { ResumoGeral } from "@/lib/types/questoes";

export function ResumoGeralCards({ resumo }: { resumo: ResumoGeral }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="gap-1">
          <CardDescription>Total de questões</CardDescription>
          <div className="text-3xl font-semibold">{resumo.totalQuestoes}</div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="gap-1">
          <CardDescription>% de acerto geral</CardDescription>
          <div className="text-3xl font-semibold">
            {resumo.totalQuestoes > 0 ? `${resumo.percentualGeral}%` : "—"}
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="gap-1">
          <CardDescription>Melhor matéria</CardDescription>
          <div className="text-xl font-semibold">
            {resumo.melhorMateria ? resumo.melhorMateria.nome : "—"}
          </div>
          {resumo.melhorMateria && (
            <span className="text-sm text-muted-foreground">
              {resumo.melhorMateria.percentual}% de acerto
            </span>
          )}
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="gap-1">
          <CardDescription>Pior matéria</CardDescription>
          <div className="text-xl font-semibold">
            {resumo.piorMateria ? resumo.piorMateria.nome : "—"}
          </div>
          {resumo.piorMateria && (
            <span className="text-sm text-muted-foreground">
              {resumo.piorMateria.percentual}% de acerto
            </span>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}

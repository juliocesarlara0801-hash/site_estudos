import Link from "next/link";

import type { AtividadeDoDia } from "@/lib/data/questoes";
import { corPorPercentual } from "@/lib/utils/desempenho";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AtividadesDoDia({ atividades }: { atividades: AtividadeDoDia[] }) {
  if (atividades.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Simulados e listas deste dia</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {atividades.map((a) => {
          const cor = corPorPercentual(a.percentual);
          const href =
            a.tipo === "simulado" ? `/questoes/simulados/${a.id}` : `/questoes/listas/${a.id}`;
          return (
            <Link
              key={`${a.tipo}-${a.id}`}
              href={href}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
            >
              <span className="text-muted-foreground">
                {a.tipo === "simulado" ? "Simulado" : "Lista"}:
              </span>
              <span className="font-medium">{a.titulo}</span>
              <Badge style={{ backgroundColor: `${cor}20`, color: cor }} className="border-0">
                {a.percentual}%
              </Badge>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardDescription, CardHeader } from "@/components/ui/card";

export function CartaoEstatistica({
  rotulo,
  valor,
  delta,
}: {
  rotulo: string;
  valor: string;
  delta?: { percentual: number; rotuloComparacao: string } | null;
}) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardDescription>{rotulo}</CardDescription>
        <div className="text-3xl font-semibold">{valor}</div>
        {delta && (
          <div
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: delta.percentual >= 0 ? "#0ca30c" : "#d03b3b" }}
          >
            {delta.percentual >= 0 ? (
              <ArrowUp className="size-3.5" />
            ) : (
              <ArrowDown className="size-3.5" />
            )}
            {Math.abs(Math.round(delta.percentual))}% {delta.rotuloComparacao}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

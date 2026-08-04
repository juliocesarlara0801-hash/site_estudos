import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

import { COR_VERDE, COR_VERMELHO, compararPercentuais } from "@/lib/utils/desempenho";

export function ComparacaoAnterior({ atual, anterior }: { atual: number; anterior: number }) {
  const tendencia = compararPercentuais(atual, anterior);
  const diferenca = Math.round((atual - anterior) * 10) / 10;

  if (tendencia === "manteve") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowRight className="size-3.5" /> Manteve
      </span>
    );
  }

  const melhorou = tendencia === "melhorou";
  return (
    <span
      className="flex items-center gap-1 text-xs font-medium"
      style={{ color: melhorou ? COR_VERDE : COR_VERMELHO }}
    >
      {melhorou ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
      {Math.abs(diferenca)} p.p.
    </span>
  );
}

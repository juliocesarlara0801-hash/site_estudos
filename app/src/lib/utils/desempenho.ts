export const COR_VERDE = "#0ca30c";
export const COR_AMARELO = "#eda100";
export const COR_VERMELHO = "#d03b3b";

export function corPorPercentual(percentual: number): string {
  if (percentual >= 70) return COR_VERDE;
  if (percentual >= 50) return COR_AMARELO;
  return COR_VERMELHO;
}

export function rotuloFaixa(percentual: number): "boa" | "media" | "baixa" {
  if (percentual >= 70) return "boa";
  if (percentual >= 50) return "media";
  return "baixa";
}

export type TendenciaComparacao = "melhorou" | "piorou" | "manteve";

export function compararPercentuais(
  atual: number,
  anterior: number
): TendenciaComparacao {
  const diferenca = atual - anterior;
  if (Math.abs(diferenca) < 2) return "manteve";
  return diferenca > 0 ? "melhorou" : "piorou";
}

export function calcularPercentual(correct: number, questions: number): number {
  if (questions <= 0) return 0;
  return Math.round((correct / questions) * 10000) / 100;
}

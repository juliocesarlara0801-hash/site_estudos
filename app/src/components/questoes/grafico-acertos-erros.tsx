"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DadosAcertosErros } from "@/lib/data/questoes";
import { COR_VERDE, COR_VERMELHO } from "@/lib/utils/desempenho";

const config: ChartConfig = {
  acertos: { label: "Acertos", color: COR_VERDE },
  erros: { label: "Erros", color: COR_VERMELHO },
};

export function GraficoAcertosErros({ dados }: { dados: DadosAcertosErros[] }) {
  if (dados.length === 0) {
    return (
      <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        Nenhuma questão registrada ainda.
      </p>
    );
  }

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <BarChart data={dados} margin={{ top: 12 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="materia"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="acertos" stackId="a" fill="var(--color-acertos)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="erros" stackId="a" fill="var(--color-erros)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

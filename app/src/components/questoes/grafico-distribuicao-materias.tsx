"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DadosDistribuicao } from "@/lib/data/questoes";

export function GraficoDistribuicaoMaterias({ dados }: { dados: DadosDistribuicao[] }) {
  if (dados.length === 0) {
    return (
      <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Nenhuma questão registrada ainda.
      </p>
    );
  }

  const config: ChartConfig = Object.fromEntries(
    dados.map((d) => [d.materia, { label: d.materia, color: d.cor }])
  );

  return (
    <ChartContainer config={config} className="mx-auto h-[260px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="materia" hideLabel />} />
        <Pie
          data={dados}
          dataKey="questoes"
          nameKey="materia"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
        >
          {dados.map((d) => (
            <Cell key={d.materia} fill={d.cor} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="materia" />} />
      </PieChart>
    </ChartContainer>
  );
}

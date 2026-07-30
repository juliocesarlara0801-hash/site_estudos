"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { segundosParaHoras } from "@/lib/utils/tempo";

export function GraficoPorMateria({
  dados,
}: {
  dados: { materiaId: string; nome: string; cor: string; segundos: number }[];
}) {
  if (dados.length === 0) {
    return (
      <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        Nenhuma sessão de estudo registrada neste período.
      </p>
    );
  }

  const dadosGrafico = dados.map((d) => ({
    nome: d.nome,
    horas: segundosParaHoras(d.segundos),
    cor: d.cor,
  }));

  const config: ChartConfig = {
    horas: { label: "Horas estudadas" },
  };

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <BarChart data={dadosGrafico} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="nome"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="horas" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {dadosGrafico.map((entrada) => (
            <Cell key={entrada.nome} fill={entrada.cor} />
          ))}
          <LabelList
            dataKey="horas"
            position="top"
            className="fill-muted-foreground text-xs"
            formatter={(valor) =>
              typeof valor === "number" ? `${valor}h` : ""
            }
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

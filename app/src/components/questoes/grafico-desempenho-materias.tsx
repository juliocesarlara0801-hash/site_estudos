"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { SimuladoMateria } from "@/lib/types/questoes";
import { corPorPercentual } from "@/lib/utils/desempenho";

const config: ChartConfig = { percentual: { label: "% de acerto" } };

export function GraficoDesempenhoMaterias({ materias }: { materias: SimuladoMateria[] }) {
  if (materias.length === 0) return null;

  const dados = materias.map((m) => ({ nome: m.materiaNome, percentual: m.percentage }));

  return (
    <ChartContainer config={config} className="h-[220px] w-full">
      <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 28 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="nome"
          width={110}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="percentual" radius={[4, 4, 4, 4]} maxBarSize={22}>
          {dados.map((d) => (
            <Cell key={d.nome} fill={corPorPercentual(d.percentual)} />
          ))}
          <LabelList
            dataKey="percentual"
            position="right"
            className="fill-foreground text-xs"
            formatter={(valor) => (typeof valor === "number" ? `${valor}%` : "")}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

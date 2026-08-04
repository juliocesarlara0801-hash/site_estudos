"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PontoEvolucao } from "@/lib/data/questoes";

const config: ChartConfig = {
  percentual: { label: "% de acerto", color: "var(--primary)" },
};

export function GraficoEvolucaoTemporal({ dados }: { dados: PontoEvolucao[] }) {
  if (dados.length === 0) {
    return (
      <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        Nenhum simulado registrado ainda.
      </p>
    );
  }

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <LineChart data={dados} margin={{ left: -20, right: 12, top: 12 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="data"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(valor: string) => format(parseISO(valor), "d/MM")}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          width={32}
          domain={[0, 100]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(valor) =>
                format(parseISO(String(valor)), "EEEE, d 'de' MMMM", { locale: ptBR })
              }
            />
          }
        />
        <Line
          dataKey="percentual"
          type="monotone"
          stroke="var(--color-percentual)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-percentual)" }}
          activeDot={{ r: 5, stroke: "var(--background)", strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

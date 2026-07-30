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

const config: ChartConfig = {
  horas: { label: "Horas estudadas", color: "var(--primary)" },
};

export function GraficoPorDia({
  dados,
}: {
  dados: { data: string; horas: number }[];
}) {
  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <LineChart data={dados} margin={{ left: -20, right: 12, top: 12 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="data"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          interval={4}
          tickFormatter={(valor: string) => format(parseISO(valor), "d/MM")}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          width={32}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(valor) =>
                format(parseISO(String(valor)), "EEEE, d 'de' MMMM", {
                  locale: ptBR,
                })
              }
            />
          }
        />
        <Line
          dataKey="horas"
          type="monotone"
          stroke="var(--color-horas)"
          strokeWidth={2}
          dot={{ r: 2, fill: "var(--color-horas)" }}
          activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SeriePorMateria } from "@/lib/data/questoes";

export function GraficoEvolucaoMateria({ series }: { series: SeriePorMateria[] }) {
  const [subjectId, setSubjectId] = useState(series[0]?.subjectId ?? "");

  if (series.length === 0) {
    return (
      <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        Sem dados suficientes por matéria ainda.
      </p>
    );
  }

  const serieAtual = series.find((s) => s.subjectId === subjectId) ?? series[0];

  const config: ChartConfig = {
    percentual: { label: "% de acerto", color: serieAtual.cor },
  };

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={serieAtual.subjectId}
        onValueChange={(v) => setSubjectId(String(v))}
        items={series.map((s) => ({ value: s.subjectId, label: s.nome }))}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {series.map((s) => (
            <SelectItem key={s.subjectId} value={s.subjectId}>
              {s.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {serieAtual.pontos.length === 0 ? (
        <p className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Nenhum registro para esta matéria ainda.
        </p>
      ) : (
        <ChartContainer config={config} className="h-[200px] w-full">
          <LineChart data={serieAtual.pontos} margin={{ left: -20, right: 12, top: 12 }}>
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
                    format(parseISO(String(valor)), "d 'de' MMMM", { locale: ptBR })
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
      )}
    </div>
  );
}

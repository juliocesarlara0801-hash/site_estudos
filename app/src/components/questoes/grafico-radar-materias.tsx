"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DadosRadar } from "@/lib/data/questoes";

const config: ChartConfig = {
  percentual: { label: "% de acerto", color: "var(--primary)" },
};

export function GraficoRadarMaterias({ dados }: { dados: DadosRadar[] }) {
  if (dados.length < 3) {
    return (
      <p className="flex h-[260px] items-center justify-center text-center text-sm text-muted-foreground">
        Registre questões em pelo menos 3 matérias para ver o comparativo.
      </p>
    );
  }

  return (
    <ChartContainer config={config} className="mx-auto h-[260px] w-full">
      <RadarChart data={dados} outerRadius="75%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="materia"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Radar
          dataKey="percentual"
          stroke="var(--color-percentual)"
          fill="var(--color-percentual)"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ChartContainer>
  );
}

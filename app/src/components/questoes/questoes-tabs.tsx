"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Materia } from "@/lib/types/materia";
import type { ListaExercicios, MetaAcerto, SimuladoComMaterias } from "@/lib/types/questoes";
import type { DadosDesempenho } from "@/lib/data/questoes";
import { SimuladosPainel } from "@/components/questoes/simulados-painel";
import { ListasPainel } from "@/components/questoes/listas-painel";
import { DesempenhoPainel } from "@/components/questoes/desempenho-painel";

export function QuestoesTabs({
  simulados,
  listas,
  materias,
  dadosDesempenho,
  metas,
}: {
  simulados: SimuladoComMaterias[];
  listas: ListaExercicios[];
  materias: Materia[];
  dadosDesempenho: DadosDesempenho;
  metas: MetaAcerto[];
}) {
  return (
    <Tabs defaultValue="simulados">
      <TabsList>
        <TabsTrigger value="simulados">Simulados</TabsTrigger>
        <TabsTrigger value="listas">Listas de Exercícios</TabsTrigger>
        <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
      </TabsList>
      <TabsContent value="simulados">
        <SimuladosPainel simulados={simulados} materias={materias} />
      </TabsContent>
      <TabsContent value="listas">
        <ListasPainel listas={listas} materias={materias} />
      </TabsContent>
      <TabsContent value="desempenho">
        <DesempenhoPainel dados={dadosDesempenho} metas={metas} materias={materias} />
      </TabsContent>
    </Tabs>
  );
}

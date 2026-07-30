"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Materia } from "@/lib/types/materia";
import type { ConfigPomodoroDb, Lembrete } from "@/lib/types/cronometro";
import { PainelLivre } from "./painel-livre";
import { PainelTimer } from "./painel-timer";
import { PainelPomodoro } from "./painel-pomodoro";

export function CronometroApp({
  materias,
  lembretes,
  configuracaoPomodoro,
}: {
  materias: Materia[];
  lembretes: Lembrete[];
  configuracaoPomodoro: ConfigPomodoroDb;
}) {
  return (
    <Tabs defaultValue="livre">
      <TabsList>
        <TabsTrigger value="livre">Livre</TabsTrigger>
        <TabsTrigger value="timer">Timer</TabsTrigger>
        <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
      </TabsList>
      <TabsContent value="livre">
        <PainelLivre materias={materias} lembretes={lembretes} />
      </TabsContent>
      <TabsContent value="timer">
        <PainelTimer materias={materias} lembretes={lembretes} />
      </TabsContent>
      <TabsContent value="pomodoro">
        <PainelPomodoro
          materias={materias}
          lembretes={lembretes}
          configuracao={configuracaoPomodoro}
        />
      </TabsContent>
    </Tabs>
  );
}

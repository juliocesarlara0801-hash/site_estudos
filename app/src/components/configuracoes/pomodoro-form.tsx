"use client";

import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { salvarPomodoro, type EstadoConfig } from "@/lib/actions/configuracoes";
import type { ConfigPomodoroDb } from "@/lib/types/cronometro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const estadoInicial: EstadoConfig = undefined;

export function PomodoroForm({
  configuracaoAtual,
}: {
  configuracaoAtual: ConfigPomodoroDb;
}) {
  const [estado, formAction, pendente] = useActionState(
    salvarPomodoro,
    estadoInicial
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {estado?.erro && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{estado.erro}</AlertDescription>
        </Alert>
      )}
      {estado?.mensagem && (
        <Alert>
          <CircleCheck />
          <AlertDescription>{estado.mensagem}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="estudo_minutos">Estudo (min)</Label>
          <Input
            id="estudo_minutos"
            name="estudo_minutos"
            type="number"
            min={1}
            defaultValue={configuracaoAtual.estudo_minutos}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pausa_curta_minutos">Pausa curta (min)</Label>
          <Input
            id="pausa_curta_minutos"
            name="pausa_curta_minutos"
            type="number"
            min={1}
            defaultValue={configuracaoAtual.pausa_curta_minutos}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pausa_longa_minutos">Pausa longa (min)</Label>
          <Input
            id="pausa_longa_minutos"
            name="pausa_longa_minutos"
            type="number"
            min={1}
            defaultValue={configuracaoAtual.pausa_longa_minutos}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ciclos_ate_pausa_longa">Ciclos até pausa longa</Label>
          <Input
            id="ciclos_ate_pausa_longa"
            name="ciclos_ate_pausa_longa"
            type="number"
            min={1}
            defaultValue={configuracaoAtual.ciclos_ate_pausa_longa}
            required
          />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar preferências"}
        </Button>
      </div>
    </form>
  );
}

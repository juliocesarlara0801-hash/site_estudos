"use client";

import { useActionState } from "react";
import { CircleAlert, Droplet, Eye, PersonStanding, Trash2, UtensilsCrossed } from "lucide-react";

import {
  alternarLembrete,
  criarLembrete,
  excluirLembrete,
  type EstadoLembrete,
} from "@/lib/actions/lembretes";
import type { Lembrete } from "@/lib/types/cronometro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

const estadoInicial: EstadoLembrete = undefined;

const SUGESTOES = [
  { tipo: "agua", mensagem: "Beba um copo de água", intervalo: 45, icone: Droplet },
  { tipo: "comer", mensagem: "Faça uma pausa para comer algo", intervalo: 120, icone: UtensilsCrossed },
  { tipo: "alongar", mensagem: "Levante e alongue o corpo", intervalo: 60, icone: PersonStanding },
  { tipo: "olhar_longe", mensagem: "Regra 20-20-20: olhe para algo a 20 pés por 20 segundos", intervalo: 20, icone: Eye },
];

export function Lembretes({ lembretes }: { lembretes: Lembrete[] }) {
  const [estado, formAction, pendente] = useActionState(
    criarLembrete,
    estadoInicial
  );

  return (
    <div className="flex flex-col gap-4">
      {estado?.erro && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{estado.erro}</AlertDescription>
        </Alert>
      )}

      {lembretes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum lembrete cadastrado. Use os atalhos abaixo ou crie o seu.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lembretes.map((lembrete) => (
            <li
              key={lembrete.id}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm">{lembrete.message}</span>
                <span className="text-xs text-muted-foreground">
                  A cada {lembrete.interval_minutes} min
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={lembrete.enabled}
                  onCheckedChange={(checked) =>
                    alternarLembrete(lembrete.id, checked)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => excluirLembrete(lembrete.id)}
                  aria-label="Excluir lembrete"
                >
                  <Trash2 className="text-muted-foreground" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {SUGESTOES.map((sugestao) => (
          <Button
            key={sugestao.tipo}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const formData = new FormData();
              formData.set("mensagem", sugestao.mensagem);
              formData.set("intervalo", String(sugestao.intervalo));
              formData.set("tipo", sugestao.tipo);
              criarLembrete(undefined, formData);
            }}
          >
            <sugestao.icone /> {sugestao.mensagem}
          </Button>
        ))}
      </div>

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-1 min-w-48 flex-col gap-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="mensagem">
            Novo lembrete
          </label>
          <Input id="mensagem" name="mensagem" placeholder="Ex: Levantar e caminhar" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="intervalo">
            A cada (min)
          </label>
          <Input
            id="intervalo"
            name="intervalo"
            type="number"
            min={1}
            defaultValue={30}
            className="w-24"
            required
          />
        </div>
        <input type="hidden" name="tipo" value="personalizado" />
        <Button type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>
    </div>
  );
}

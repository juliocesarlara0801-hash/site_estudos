"use client";

import { Plus, Trash2 } from "lucide-react";

import type { BlocoHorario, Materia } from "@/lib/types/calendario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function gerarId() {
  return Math.random().toString(36).slice(2, 10);
}

export function CronogramaEditor({
  blocos,
  onChange,
  materias,
}: {
  blocos: BlocoHorario[];
  onChange: (blocos: BlocoHorario[]) => void;
  materias: Materia[];
}) {
  function adicionar() {
    onChange([
      ...blocos,
      { id: gerarId(), inicio: "08:00", fim: "09:00", titulo: "", subjectId: null },
    ]);
  }

  function atualizar(
    id: string,
    campo: keyof BlocoHorario,
    valor: string | null
  ) {
    onChange(
      blocos.map((bloco) =>
        bloco.id === id ? { ...bloco, [campo]: valor } : bloco
      )
    );
  }

  function remover(id: string) {
    onChange(blocos.filter((bloco) => bloco.id !== id));
  }

  const blocosOrdenados = [...blocos].sort((a, b) =>
    a.inicio.localeCompare(b.inicio)
  );

  return (
    <div className="flex flex-col gap-3">
      {blocos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum bloco de horário ainda.
        </p>
      )}
      {blocosOrdenados.map((bloco) => (
        <div
          key={bloco.id}
          className="flex flex-wrap items-end gap-2 rounded-lg border p-2"
        >
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Início</Label>
            <Input
              type="time"
              value={bloco.inicio}
              onChange={(e) => atualizar(bloco.id, "inicio", e.target.value)}
              className="w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Fim</Label>
            <Input
              type="time"
              value={bloco.fim}
              onChange={(e) => atualizar(bloco.id, "fim", e.target.value)}
              className="w-28"
            />
          </div>
          <div className="flex min-w-40 flex-1 flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Atividade</Label>
            <Input
              value={bloco.titulo}
              onChange={(e) => atualizar(bloco.id, "titulo", e.target.value)}
              placeholder="Ex: Revisão de exercícios"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Matéria</Label>
            <Select
              value={bloco.subjectId ?? "nenhuma"}
              onValueChange={(valor) =>
                atualizar(
                  bloco.id,
                  "subjectId",
                  valor === "nenhuma" ? null : String(valor)
                )
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Sem matéria</SelectItem>
                {materias.map((materia) => (
                  <SelectItem key={materia.id} value={materia.id}>
                    {materia.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => remover(bloco.id)}
            aria-label="Remover bloco"
          >
            <Trash2 className="text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={adicionar}
        className="self-start"
      >
        <Plus /> Adicionar bloco
      </Button>
    </div>
  );
}

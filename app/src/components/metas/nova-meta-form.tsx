"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";

import { criarMeta, type EstadoMeta } from "@/lib/actions/metas";
import type { Materia } from "@/lib/types/materia";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

const estadoInicial: EstadoMeta = undefined;

export function NovaMetaForm({ materias }: { materias: Materia[] }) {
  const [estado, formAction, pendente] = useActionState(criarMeta, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {estado?.erro && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{estado.erro}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Matéria</Label>
          <Select name="subjectId">
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {materias.map((materia) => (
                <SelectItem key={materia.id} value={materia.id}>
                  {materia.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="targetHours" className="text-xs text-muted-foreground">
            Meta (horas)
          </Label>
          <Input
            id="targetHours"
            name="targetHours"
            type="number"
            min={1}
            step="0.5"
            defaultValue={5}
            className="w-24"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Período</Label>
          <Select name="period" defaultValue="weekly">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={pendente}>
          {pendente ? "Criando..." : "Criar meta"}
        </Button>
      </div>
    </form>
  );
}

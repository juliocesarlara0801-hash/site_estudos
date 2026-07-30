"use client";

import type { Materia } from "@/lib/types/materia";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function SeletorMateria({
  materias,
  valor,
  onChange,
  disabled,
}: {
  materias: Materia[];
  valor: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">Matéria</Label>
      <Select
        value={valor ?? undefined}
        onValueChange={(v) => onChange(v ? String(v) : null)}
        disabled={disabled}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Selecione uma matéria" />
        </SelectTrigger>
        <SelectContent>
          {materias.length === 0 && (
            <SelectItem value="_sem_materias" disabled>
              Cadastre uma matéria em Configurações
            </SelectItem>
          )}
          {materias.map((materia) => (
            <SelectItem key={materia.id} value={materia.id}>
              {materia.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

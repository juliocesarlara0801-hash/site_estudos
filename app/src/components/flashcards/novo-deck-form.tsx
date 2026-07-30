"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";

import { criarDeck, type EstadoFlashcards } from "@/lib/actions/flashcards";
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

const estadoInicial: EstadoFlashcards = undefined;

export function NovoDeckForm({ materias }: { materias: Materia[] }) {
  const [estado, formAction, pendente] = useActionState(criarDeck, estadoInicial);

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
          <Label htmlFor="nome" className="text-xs text-muted-foreground">
            Nome do deck
          </Label>
          <Input id="nome" name="nome" placeholder="Ex: Verbos irregulares" required className="w-56" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Matéria (opcional)</Label>
          <Select
            name="subjectId"
            items={materias.map((materia) => ({
              value: materia.id,
              label: materia.name,
            }))}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sem matéria" />
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
        <Button type="submit" disabled={pendente}>
          {pendente ? "Criando..." : "Criar deck"}
        </Button>
      </div>
    </form>
  );
}

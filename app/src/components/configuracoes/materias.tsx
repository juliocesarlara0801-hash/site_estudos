"use client";

import { useActionState } from "react";
import { Trash2, CircleAlert } from "lucide-react";

import {
  criarMateria,
  excluirMateria,
  type EstadoConfig,
} from "@/lib/actions/configuracoes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type Materia = { id: string; name: string; color: string };

const estadoInicial: EstadoConfig = undefined;

export function Materias({ materias }: { materias: Materia[] }) {
  const [estado, formAction, pendente] = useActionState(
    criarMateria,
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

      <form action={formAction} className="flex max-w-sm gap-2">
        <Input name="nome" placeholder="Nova matéria (ex: Matemática)" required />
        <Button type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>

      {materias.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma matéria cadastrada ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {materias.map((materia) => (
            <li
              key={materia.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <Badge
                style={{
                  backgroundColor: `${materia.color}20`,
                  color: materia.color,
                }}
                className="border-0"
              >
                {materia.name}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => excluirMateria(materia.id)}
                aria-label={`Excluir ${materia.name}`}
              >
                <Trash2 className="text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { atualizarPerfil, type EstadoConfig } from "@/lib/actions/configuracoes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const estadoInicial: EstadoConfig = undefined;

export function PerfilForm({ nomeAtual }: { nomeAtual: string | null }) {
  const [estado, formAction, pendente] = useActionState(
    atualizarPerfil,
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
      <div className="flex flex-col gap-2 sm:max-w-sm">
        <Label htmlFor="nome">Nome de exibição</Label>
        <Input id="nome" name="nome" defaultValue={nomeAtual ?? ""} required />
      </div>
      <div>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

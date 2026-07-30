"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { recuperarSenha, type EstadoAuth } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const estadoInicial: EstadoAuth = undefined;

export function EsqueciSenhaForm() {
  const [estado, formAction, pendente] = useActionState(
    recuperarSenha,
    estadoInicial
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Enviaremos um link para redefinir sua senha.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {estado?.mensagem && (
          <Alert>
            <CircleCheck />
            <AlertDescription>{estado.mensagem}</AlertDescription>
          </Alert>
        )}
        {estado?.erro && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{estado.erro}</AlertDescription>
          </Alert>
        )}

        {!estado?.mensagem && (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                required
              />
            </div>
            <Button type="submit" disabled={pendente} className="w-full">
              {pendente ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  );
}

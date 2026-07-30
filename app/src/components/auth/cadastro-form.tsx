"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { cadastrar, type EstadoAuth } from "@/lib/actions/auth";
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

export function CadastroForm() {
  const [estado, formAction, pendente] = useActionState(
    cadastrar,
    estadoInicial
  );

  if (estado?.mensagem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quase lá!</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CircleCheck />
            <AlertDescription>{estado.mensagem}</AlertDescription>
          </Alert>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Comece a organizar seus estudos gratuitamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {estado?.erro && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{estado.erro}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" autoComplete="name" required />
          </div>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmarSenha">Confirmar senha</Label>
            <Input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={pendente} className="w-full">
            {pendente ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

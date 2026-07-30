"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { entrar, entrarComGoogle, type EstadoAuth } from "@/lib/actions/auth";
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
import { Separator } from "@/components/ui/separator";

const estadoInicial: EstadoAuth = undefined;

export function LoginForm({
  redirectTo,
  mensagemInicial,
}: {
  redirectTo?: string;
  mensagemInicial?: string;
}) {
  const [estado, formAction, pendente] = useActionState(entrar, estadoInicial);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para continuar seus estudos.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {mensagemInicial && !estado?.erro && (
          <Alert>
            <CircleCheck />
            <AlertDescription>{mensagemInicial}</AlertDescription>
          </Alert>
        )}
        {estado?.erro && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{estado.erro}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
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
            <div className="flex items-center justify-between">
              <Label htmlFor="senha">Senha</Label>
              <Link
                href="/esqueci-senha"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" disabled={pendente} className="w-full">
            {pendente ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <form action={entrarComGoogle}>
          <Button type="submit" variant="outline" className="w-full">
            Entrar com Google
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="font-medium text-foreground underline-offset-4 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

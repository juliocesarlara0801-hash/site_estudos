"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ExcluirRegistroButton({
  titulo,
  descricao,
  aoConfirmar,
  redirecionarPara,
  rotulo,
}: {
  titulo: string;
  descricao: string;
  aoConfirmar: () => Promise<{ erro?: string } | void>;
  redirecionarPara?: string;
  rotulo?: string;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    setExcluindo(true);
    await aoConfirmar();
    setExcluindo(false);
    if (redirecionarPara) router.push(redirecionarPara);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={rotulo ? "outline" : "ghost"}
            size={rotulo ? "sm" : "icon-sm"}
            aria-label={titulo}
          >
            <Trash2 className={rotulo ? undefined : "text-muted-foreground"} />
            {rotulo}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            onClick={confirmar}
            disabled={excluindo}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

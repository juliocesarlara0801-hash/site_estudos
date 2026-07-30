import Link from "next/link";
import { Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function AvisoSemMaterias() {
  return (
    <Alert>
      <Info />
      <AlertDescription>
        Você ainda não tem matérias cadastradas.{" "}
        <Link href="/configuracoes" className="font-medium underline underline-offset-4">
          Crie uma em Configurações
        </Link>{" "}
        para poder selecioná-la aqui.
      </AlertDescription>
    </Alert>
  );
}

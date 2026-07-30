import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PaginaEmConstrucao({
  icone: Icone,
  titulo,
  descricao,
  fase,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  fase: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        <p className="text-muted-foreground">{descricao}</p>
      </div>
      <Card className="flex flex-1 items-center justify-center border-dashed">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <Icone className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>
            Esta seção será implementada na {fase}.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

import { obterDadosSemanaParaPdf } from "@/lib/actions/exportar";
import { gerarPdfSemana } from "@/lib/utils/pdf-dia";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function CalendarioSemanal({
  inicioSemana,
  datasComEntrada,
}: {
  inicioSemana: Date;
  datasComEntrada: string[];
}) {
  const router = useRouter();
  const [exportando, setExportando] = useState(false);
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));

  function irParaSemana(offsetDias: number) {
    const novaData = addDays(inicioSemana, offsetDias);
    router.push(
      `/calendario?visao=semanal&data=${format(novaData, "yyyy-MM-dd")}`
    );
  }

  async function exportarSemana() {
    setExportando(true);
    const inicioIso = format(inicioSemana, "yyyy-MM-dd");
    const resultado = await obterDadosSemanaParaPdf(inicioIso);
    setExportando(false);

    if ("erro" in resultado) {
      toast.add({ title: "Erro ao exportar", description: resultado.erro, type: "error" });
      return;
    }
    gerarPdfSemana(resultado.dias, inicioIso);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon-sm" onClick={() => irParaSemana(-7)} aria-label="Semana anterior">
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium capitalize">
          {format(dias[0], "d MMM", { locale: ptBR })} –{" "}
          {format(dias[6], "d MMM yyyy", { locale: ptBR })}
        </span>
        <Button variant="outline" size="icon-sm" onClick={() => irParaSemana(7)} aria-label="Próxima semana">
          <ChevronRight />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={exportarSemana}
        disabled={exportando}
        className="self-end"
      >
        <Download /> {exportando ? "Gerando..." : "Exportar semana em PDF"}
      </Button>
      <div className="grid grid-cols-7 gap-2">
        {dias.map((dia) => {
          const iso = format(dia, "yyyy-MM-dd");
          const comEntrada = datasComEntrada.includes(iso);
          const hoje = iso === format(new Date(), "yyyy-MM-dd");
          return (
            <button
              key={iso}
              type="button"
              onClick={() => router.push(`/calendario/${iso}`)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-lg border p-3 text-sm hover:bg-accent",
                hoje && "border-primary"
              )}
            >
              <span className="text-xs text-muted-foreground capitalize">
                {format(dia, "EEE", { locale: ptBR })}
              </span>
              <span className="font-medium">{format(dia, "d")}</span>
              {comEntrada && (
                <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

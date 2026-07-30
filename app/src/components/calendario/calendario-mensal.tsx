"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";

export function CalendarioMensal({
  mes,
  datasComEntrada,
}: {
  mes: Date;
  datasComEntrada: Date[];
}) {
  const router = useRouter();

  return (
    <Calendar
      mode="single"
      month={mes}
      locale={ptBR}
      onMonthChange={(novoMes) =>
        router.push(`/calendario?visao=mensal&mes=${format(novoMes, "yyyy-MM")}`)
      }
      onSelect={(dia) => {
        if (dia) router.push(`/calendario/${format(dia, "yyyy-MM-dd")}`);
      }}
      modifiers={{ comEntrada: datasComEntrada }}
      modifiersClassNames={{
        comEntrada:
          "after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary after:content-['']",
      }}
      className="w-fit rounded-lg border"
    />
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { Materia } from "@/lib/types/materia";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Filtros({ materias }: { materias: Materia[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const periodo = searchParams.get("periodo") === "mes" ? "mes" : "semana";
  const materiaId = searchParams.get("materia") ?? "todas";

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor === "todas" || valor === "semana") {
      params.delete(chave);
    } else {
      params.set(chave, valor);
    }
    router.push(`/estatisticas?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={periodo} onValueChange={(v) => atualizar("periodo", String(v))}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semana">Esta semana</SelectItem>
          <SelectItem value="mes">Este mês</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={materiaId}
        onValueChange={(v) => atualizar("materia", String(v))}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as matérias</SelectItem>
          {materias.map((materia) => (
            <SelectItem key={materia.id} value={materia.id}>
              {materia.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

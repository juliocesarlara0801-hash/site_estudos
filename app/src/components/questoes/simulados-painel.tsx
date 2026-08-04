"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import type { Materia } from "@/lib/types/materia";
import type { SimuladoComMaterias } from "@/lib/types/questoes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimuladoFormDialog } from "@/components/questoes/simulado-form-dialog";
import { SimuladoCard } from "@/components/questoes/simulado-card";

export function SimuladosPainel({
  simulados,
  materias,
}: {
  simulados: SimuladoComMaterias[];
  materias: Materia[];
}) {
  const [materiaId, setMateriaId] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const filtrados = useMemo(() => {
    return simulados.filter((s) => {
      if (materiaId !== "todas" && !s.materias.some((m) => m.subjectId === materiaId)) {
        return false;
      }
      if (dataInicio && s.date < dataInicio) return false;
      if (dataFim && s.date > dataFim) return false;
      return true;
    });
  }, [simulados, materiaId, dataInicio, dataFim]);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Matéria</Label>
            <Select
              value={materiaId}
              onValueChange={(v) => setMateriaId(String(v))}
              items={[
                { value: "todas", label: "Todas" },
                ...materias.map((m) => ({ value: m.id, label: m.name })),
              ]}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {materias.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-36"
            />
          </div>
        </div>
        <SimuladoFormDialog
          materias={materias}
          trigger={
            <Button>
              <Plus /> Novo Simulado
            </Button>
          }
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {simulados.length === 0
            ? "Nenhum simulado registrado ainda."
            : "Nenhum simulado encontrado com esses filtros."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtrados.map((s) => (
            <SimuladoCard key={s.id} simulado={s} materias={materias} />
          ))}
        </div>
      )}
    </div>
  );
}

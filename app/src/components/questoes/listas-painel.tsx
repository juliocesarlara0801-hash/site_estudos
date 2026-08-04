"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import type { Materia } from "@/lib/types/materia";
import type { ListaExercicios } from "@/lib/types/questoes";
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
import { ListaFormDialog } from "@/components/questoes/lista-form-dialog";
import { ListaCard } from "@/components/questoes/lista-card";

export function ListasPainel({
  listas,
  materias,
}: {
  listas: ListaExercicios[];
  materias: Materia[];
}) {
  const [materiaId, setMateriaId] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const filtradas = useMemo(() => {
    return listas.filter((l) => {
      if (materiaId !== "todas" && l.subjectId !== materiaId) return false;
      if (dataInicio && l.date < dataInicio) return false;
      if (dataFim && l.date > dataFim) return false;
      return true;
    });
  }, [listas, materiaId, dataInicio, dataFim]);

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
        <ListaFormDialog
          materias={materias}
          trigger={
            <Button>
              <Plus /> Nova Lista
            </Button>
          }
        />
      </div>

      {filtradas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {listas.length === 0
            ? "Nenhuma lista registrada ainda."
            : "Nenhuma lista encontrada com esses filtros."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtradas.map((l) => (
            <ListaCard key={l.id} lista={l} materias={materias} />
          ))}
        </div>
      )}
    </div>
  );
}

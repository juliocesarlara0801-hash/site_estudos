"use client";

import { useActionState } from "react";
import { CircleAlert, Trash2 } from "lucide-react";

import { excluirMeta, salvarMeta, type EstadoQuestoes } from "@/lib/actions/questoes";
import type { Materia } from "@/lib/types/materia";
import type { MetaAcerto } from "@/lib/types/questoes";
import { COR_AMARELO, COR_VERDE, COR_VERMELHO } from "@/lib/utils/desempenho";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const estadoInicial: EstadoQuestoes = undefined;

function corDaMeta(mediaAtual: number, targetPercentage: number): { cor: string; rotulo: string } {
  if (mediaAtual >= targetPercentage) return { cor: COR_VERDE, rotulo: "Meta atingida" };
  if (mediaAtual >= targetPercentage - 10) return { cor: COR_AMARELO, rotulo: "Perto da meta" };
  return { cor: COR_VERMELHO, rotulo: "Longe da meta" };
}

export function MetasAcerto({
  metas,
  materias,
}: {
  metas: MetaAcerto[];
  materias: Materia[];
}) {
  const [estado, formAction, pendente] = useActionState(salvarMeta, estadoInicial);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        {estado?.erro && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{estado.erro}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Matéria</Label>
            <Select name="subjectId" items={materias.map((m) => ({ value: m.id, label: m.name }))}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {materias.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetPercentage" className="text-xs text-muted-foreground">
              Meta de acerto (%)
            </Label>
            <Input
              id="targetPercentage"
              name="targetPercentage"
              type="number"
              min={1}
              max={100}
              defaultValue={70}
              className="w-24"
            />
          </div>
          <Button type="submit" disabled={pendente}>
            {pendente ? "Salvando..." : "Salvar meta"}
          </Button>
        </div>
      </form>

      {metas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma meta de acerto definida ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {metas.map((meta) => {
            const { cor, rotulo } = corDaMeta(meta.mediaAtual, meta.targetPercentage);
            const largura = Math.min(100, Math.round((meta.mediaAtual / meta.targetPercentage) * 100));
            return (
              <div key={meta.id} className="flex flex-col gap-1.5 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium" style={{ color: meta.materiaCor }}>
                    {meta.materiaNome}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: cor }}>
                      {rotulo}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {meta.mediaAtual}% de {meta.targetPercentage}%
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => excluirMeta(meta.id)}
                      aria-label="Excluir meta"
                    >
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${largura}%`, backgroundColor: cor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

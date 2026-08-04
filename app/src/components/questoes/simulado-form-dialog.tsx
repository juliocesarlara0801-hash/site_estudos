"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { useActionState } from "react";
import { CircleAlert, Plus, Trash2 } from "lucide-react";

import { salvarSimulado, type EstadoQuestoes } from "@/lib/actions/questoes";
import type { Materia } from "@/lib/types/materia";
import type { LinhaFormularioMateria, SimuladoComMaterias } from "@/lib/types/questoes";
import { calcularPercentual } from "@/lib/utils/desempenho";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const estadoInicial: EstadoQuestoes = undefined;

function linhaVazia(): LinhaFormularioMateria {
  return { subjectId: "", questions: "", correct: "" };
}

function linhasIniciais(simulado?: SimuladoComMaterias): LinhaFormularioMateria[] {
  if (!simulado || simulado.materias.length === 0) return [linhaVazia()];
  return simulado.materias.map((m) => ({
    subjectId: m.subjectId,
    questions: String(m.questions),
    correct: String(m.correct),
  }));
}

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

export function SimuladoFormDialog({
  materias,
  simulado,
  trigger,
}: {
  materias: Materia[];
  simulado?: SimuladoComMaterias;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [estado, formAction, pendente] = useActionState(salvarSimulado, estadoInicial);
  const [nome, setNome] = useState(simulado?.name ?? "");
  const [data, setData] = useState(simulado?.date ?? hojeIso());
  const [descricao, setDescricao] = useState(simulado?.description ?? "");
  const [linhas, setLinhas] = useState<LinhaFormularioMateria[]>(linhasIniciais(simulado));
  const enviouRef = useRef(false);

  useEffect(() => {
    if (pendente) enviouRef.current = true;
  }, [pendente]);

  useEffect(() => {
    if (!pendente && enviouRef.current && !estado?.erro) {
      enviouRef.current = false;
      setOpen(false);
    }
  }, [pendente, estado]);

  function alterarAberto(novoAberto: boolean) {
    setOpen(novoAberto);
    if (novoAberto) {
      setNome(simulado?.name ?? "");
      setData(simulado?.date ?? hojeIso());
      setDescricao(simulado?.description ?? "");
      setLinhas(linhasIniciais(simulado));
    }
  }

  function atualizarLinha(index: number, campo: keyof LinhaFormularioMateria, valor: string) {
    setLinhas((atual) =>
      atual.map((linha, i) => (i === index ? { ...linha, [campo]: valor } : linha))
    );
  }

  function adicionarLinha() {
    setLinhas((atual) => [...atual, linhaVazia()]);
  }

  function removerLinha(index: number) {
    setLinhas((atual) => (atual.length > 1 ? atual.filter((_, i) => i !== index) : atual));
  }

  const totalQuestoes = linhas.reduce((soma, l) => soma + (Number(l.questions) || 0), 0);
  const totalAcertos = linhas.reduce((soma, l) => soma + (Number(l.correct) || 0), 0);
  const percentualGeral = calcularPercentual(totalAcertos, totalQuestoes);

  return (
    <Dialog open={open} onOpenChange={alterarAberto}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{simulado ? "Editar simulado" : "Novo simulado"}</DialogTitle>
          <DialogDescription>
            Registre o desempenho por matéria. Erros e % são calculados automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {simulado && <input type="hidden" name="id" value={simulado.id} />}
          <input type="hidden" name="materias" value={JSON.stringify(linhas)} />

          {estado?.erro && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{estado.erro}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs text-muted-foreground">
              Nome do simulado
            </Label>
            <Input
              id="name"
              name="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Simulado ENEM 3"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date" className="text-xs text-muted-foreground">
              Data de realização
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="w-40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-xs text-muted-foreground">
              Observações (opcional)
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Fiz com tempo cronometrado, 4h"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Matérias</Label>
              <Button type="button" variant="outline" size="sm" onClick={adicionarLinha}>
                <Plus /> Adicionar matéria
              </Button>
            </div>

            {linhas.map((linha, index) => {
              const questoes = Number(linha.questions) || 0;
              const acertos = Number(linha.correct) || 0;
              const percentual = calcularPercentual(acertos, questoes);
              return (
                <div
                  key={index}
                  className="flex flex-wrap items-end gap-2 rounded-lg border p-2"
                >
                  <div className="flex min-w-32 flex-1 flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Matéria</Label>
                    <Select
                      value={linha.subjectId || undefined}
                      onValueChange={(v) => atualizarLinha(index, "subjectId", String(v))}
                      items={materias.map((m) => ({ value: m.id, label: m.name }))}
                    >
                      <SelectTrigger className="w-full">
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
                  <div className="flex w-20 flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Questões</Label>
                    <Input
                      type="number"
                      min={0}
                      value={linha.questions}
                      onChange={(e) => atualizarLinha(index, "questions", e.target.value)}
                    />
                  </div>
                  <div className="flex w-20 flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Acertos</Label>
                    <Input
                      type="number"
                      min={0}
                      value={linha.correct}
                      onChange={(e) => atualizarLinha(index, "correct", e.target.value)}
                    />
                  </div>
                  <span className="w-12 shrink-0 pb-1.5 text-center text-sm font-medium text-muted-foreground">
                    {questoes > 0 ? `${percentual}%` : "—"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removerLinha(index)}
                    disabled={linhas.length === 1}
                    aria-label="Remover matéria"
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              Total: {totalQuestoes} questões, {totalAcertos} acertos
            </span>
            <span className="font-medium">{totalQuestoes > 0 ? `${percentualGeral}%` : "—"}</span>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pendente}>
              {pendente ? "Salvando..." : simulado ? "Salvar alterações" : "Criar simulado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

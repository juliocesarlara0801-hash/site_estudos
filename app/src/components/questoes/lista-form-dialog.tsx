"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { useActionState } from "react";
import { CircleAlert } from "lucide-react";

import { salvarLista, type EstadoQuestoes } from "@/lib/actions/questoes";
import type { Materia } from "@/lib/types/materia";
import type { ListaExercicios } from "@/lib/types/questoes";
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

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ListaFormDialog({
  materias,
  lista,
  trigger,
}: {
  materias: Materia[];
  lista?: ListaExercicios;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [estado, formAction, pendente] = useActionState(salvarLista, estadoInicial);
  const [titulo, setTitulo] = useState(lista?.title ?? "");
  const [subjectId, setSubjectId] = useState(lista?.subjectId ?? "");
  const [data, setData] = useState(lista?.date ?? hojeIso());
  const [questoes, setQuestoes] = useState(lista ? String(lista.questions) : "");
  const [acertos, setAcertos] = useState(lista ? String(lista.correct) : "");
  const [fonte, setFonte] = useState(lista?.source ?? "");
  const [descricao, setDescricao] = useState(lista?.description ?? "");
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
      setTitulo(lista?.title ?? "");
      setSubjectId(lista?.subjectId ?? "");
      setData(lista?.date ?? hojeIso());
      setQuestoes(lista ? String(lista.questions) : "");
      setAcertos(lista ? String(lista.correct) : "");
      setFonte(lista?.source ?? "");
      setDescricao(lista?.description ?? "");
    }
  }

  const totalQuestoes = Number(questoes) || 0;
  const totalAcertos = Number(acertos) || 0;
  const percentual = calcularPercentual(totalAcertos, totalQuestoes);

  return (
    <Dialog open={open} onOpenChange={alterarAberto}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lista ? "Editar lista de exercícios" : "Nova lista de exercícios"}</DialogTitle>
          <DialogDescription>
            Questões do dia a dia, listas de uma matéria específica.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {lista && <input type="hidden" name="id" value={lista.id} />}
          <input type="hidden" name="subjectId" value={subjectId} />

          {estado?.erro && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{estado.erro}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="text-xs text-muted-foreground">
              Título
            </Label>
            <Input
              id="title"
              name="title"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Lista 5 de Álgebra Linear"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Matéria</Label>
              <Select
                value={subjectId || undefined}
                onValueChange={(v) => setSubjectId(String(v))}
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date" className="text-xs text-muted-foreground">
                Data
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="questions" className="text-xs text-muted-foreground">
                Questões
              </Label>
              <Input
                id="questions"
                name="questions"
                type="number"
                min={1}
                value={questoes}
                onChange={(e) => setQuestoes(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="correct" className="text-xs text-muted-foreground">
                Acertos
              </Label>
              <Input
                id="correct"
                name="correct"
                type="number"
                min={0}
                value={acertos}
                onChange={(e) => setAcertos(e.target.value)}
                required
              />
            </div>
            <span className="pb-1.5 text-center text-sm font-medium text-muted-foreground">
              {totalQuestoes > 0 ? `${percentual}%` : "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source" className="text-xs text-muted-foreground">
              Fonte/origem (opcional)
            </Label>
            <Input
              id="source"
              name="source"
              value={fonte}
              onChange={(e) => setFonte(e.target.value)}
              placeholder="Ex: Livro do Stewart, Site QConcursos"
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
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pendente}>
              {pendente ? "Salvando..." : lista ? "Salvar alterações" : "Adicionar lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

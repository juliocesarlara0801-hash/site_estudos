"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";

import { salvarDia } from "@/lib/actions/dia";
import type { EntradaDia, ItemChecklist, Materia, BlocoHorario } from "@/lib/types/calendario";
import { parseArrayJson } from "@/lib/utils/json-lista";
import { gerarPdfDia } from "@/lib/utils/pdf-dia";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CronogramaEditor } from "./cronograma-editor";
import { ChecklistEditor } from "./checklist-editor";
import { ListaItensEditor } from "./lista-itens-editor";
import { EditorTextoRico } from "./editor-texto-rico";

export function DiaEditor({
  data,
  entradaInicial,
  materias,
}: {
  data: string;
  entradaInicial: EntradaDia;
  materias: Materia[];
}) {
  const diaAtual = parseISO(data);

  const [schedule, setSchedule] = useState<BlocoHorario[]>(
    entradaInicial?.schedule ?? []
  );
  const [notes, setNotes] = useState(entradaInicial?.notes ?? "");
  const [conclusions, setConclusions] = useState(
    entradaInicial?.conclusions ?? ""
  );
  const [doubts, setDoubts] = useState<string[]>(
    parseArrayJson(entradaInicial?.doubts)
  );
  const [pending, setPending] = useState<string[]>(
    parseArrayJson(entradaInicial?.pending)
  );
  const [completed, setCompleted] = useState<ItemChecklist[]>(
    entradaInicial?.completed ?? []
  );

  const [status, setStatus] = useState<"ocioso" | "salvando" | "salvo">(
    "ocioso"
  );
  const primeiraRenderizacao = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }

    setStatus("salvando");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      salvarDia(data, {
        schedule,
        notes,
        conclusions,
        doubts,
        pending,
        completed,
      }).then(() => setStatus("salvo"));
    }, 800);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, notes, conclusions, doubts, pending, completed]);

  function exportarPdf() {
    const materiasPorId = Object.fromEntries(
      materias.map((materia) => [materia.id, materia.name])
    );
    gerarPdfDia({
      data,
      schedule,
      notes,
      conclusions,
      doubts,
      pending,
      completed,
      materiasPorId,
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Voltar ao calendário"
            render={<Link href="/calendario" />}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-semibold capitalize tracking-tight">
              {format(diaAtual, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(diaAtual, "yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Dia anterior"
            render={
              <Link
                href={`/calendario/${format(addDays(diaAtual, -1), "yyyy-MM-dd")}`}
              />
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Próximo dia"
            render={
              <Link
                href={`/calendario/${format(addDays(diaAtual, 1), "yyyy-MM-dd")}`}
              />
            }
          >
            <ChevronRight />
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPdf}>
            <Download /> Exportar PDF
          </Button>
          <span className="flex w-24 items-center gap-1 text-xs text-muted-foreground">
            {status === "salvando" && (
              <>
                <Loader2 className="size-3 animate-spin" /> Salvando...
              </>
            )}
            {status === "salvo" && (
              <>
                <Check className="size-3" /> Salvo
              </>
            )}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cronograma</CardTitle>
          </CardHeader>
          <CardContent>
            <CronogramaEditor
              blocos={schedule}
              onChange={setSchedule}
              materias={materias}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Concluído</CardTitle>
          </CardHeader>
          <CardContent>
            <ChecklistEditor itens={completed} onChange={setCompleted} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Anotações</CardTitle>
          </CardHeader>
          <CardContent>
            <EditorTextoRico valor={notes} onChange={setNotes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conclusões (o que aprendi)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={conclusions}
              onChange={(e) => setConclusions(e.target.value)}
              placeholder="O que você aprendeu hoje?"
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dúvidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ListaItensEditor
              itens={doubts}
              onChange={setDoubts}
              placeholder="Nova dúvida..."
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pendências</CardTitle>
          </CardHeader>
          <CardContent>
            <ListaItensEditor
              itens={pending}
              onChange={setPending}
              placeholder="Nova pendência..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

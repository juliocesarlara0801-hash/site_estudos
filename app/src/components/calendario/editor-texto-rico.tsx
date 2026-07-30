"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Editor de texto rico simples baseado em contentEditable + execCommand.
// Suficiente para negrito, itálico e listas, sem depender de uma lib pesada.
export function EditorTextoRico({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Sincroniza o conteúdo externo (ex: ao trocar de dia) sem interromper a digitação.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== valor) {
      ref.current.innerHTML = valor || "";
    }
  }, [valor]);

  function formatar(comando: "bold" | "italic" | "insertUnorderedList") {
    ref.current?.focus();
    document.execCommand(comando);
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 rounded-lg border p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatar("bold")}
          aria-label="Negrito"
        >
          <Bold />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatar("italic")}
          aria-label="Itálico"
        >
          <Italic />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatar("insertUnorderedList")}
          aria-label="Lista"
        >
          <List />
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className={cn(
          "min-h-32 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "[&_ul]:list-disc [&_ul]:pl-5"
        )}
        data-placeholder="Escreva suas anotações do dia..."
      />
    </div>
  );
}

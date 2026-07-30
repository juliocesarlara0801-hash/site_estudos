"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ListaItensEditor({
  itens,
  onChange,
  placeholder,
}: {
  itens: string[];
  onChange: (itens: string[]) => void;
  placeholder: string;
}) {
  const [novoTexto, setNovoTexto] = useState("");

  function adicionar() {
    const texto = novoTexto.trim();
    if (!texto) return;
    onChange([...itens, texto]);
    setNovoTexto("");
  }

  function remover(indice: number) {
    onChange(itens.filter((_, i) => i !== indice));
  }

  return (
    <div className="flex flex-col gap-3">
      {itens.length === 0 && (
        <p className="text-sm text-muted-foreground">Nada por aqui ainda.</p>
      )}
      <ul className="flex flex-col gap-2">
        {itens.map((item, indice) => (
          <li
            key={`${indice}-${item}`}
            className="flex items-start gap-2 rounded-lg border px-3 py-2"
          >
            <span className="flex-1 text-sm">{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remover(indice)}
              aria-label="Remover"
            >
              <X className="text-muted-foreground" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={novoTexto}
          onChange={(e) => setNovoTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" size="icon" onClick={adicionar} aria-label="Adicionar">
          <Plus />
        </Button>
      </div>
    </div>
  );
}

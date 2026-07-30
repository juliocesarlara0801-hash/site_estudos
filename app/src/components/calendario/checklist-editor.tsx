"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { ItemChecklist } from "@/lib/types/calendario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

function gerarId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ChecklistEditor({
  itens,
  onChange,
}: {
  itens: ItemChecklist[];
  onChange: (itens: ItemChecklist[]) => void;
}) {
  const [novoTexto, setNovoTexto] = useState("");

  function adicionar() {
    const texto = novoTexto.trim();
    if (!texto) return;
    onChange([...itens, { id: gerarId(), texto, feito: false }]);
    setNovoTexto("");
  }

  function alternar(id: string) {
    onChange(
      itens.map((item) =>
        item.id === id ? { ...item, feito: !item.feito } : item
      )
    );
  }

  function remover(id: string) {
    onChange(itens.filter((item) => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      {itens.length === 0 && (
        <p className="text-sm text-muted-foreground">Nada concluído ainda.</p>
      )}
      <ul className="flex flex-col gap-2">
        {itens.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <Checkbox
              checked={item.feito}
              onCheckedChange={() => alternar(item.id)}
            />
            <span
              className={
                item.feito
                  ? "flex-1 text-sm text-muted-foreground line-through"
                  : "flex-1 text-sm"
              }
            >
              {item.texto}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remover(item.id)}
              aria-label="Remover item"
            >
              <Trash2 className="text-muted-foreground" />
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
          placeholder="O que você concluiu?"
        />
        <Button type="button" variant="outline" size="icon" onClick={adicionar} aria-label="Adicionar">
          <Plus />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  removerImagemFlashcard,
  uploadImagemFlashcard,
} from "@/lib/actions/flashcards";
import type { LadoCartao } from "@/lib/types/flashcards";
import {
  TAMANHO_MAXIMO_IMAGEM_BYTES,
  TIPOS_IMAGEM_ACEITOS,
  comprimirImagem,
} from "@/lib/utils/image-flashcards";

export function ImageUpload({
  cardId,
  deckId,
  lado,
  label,
  altTexto,
  urlInicial,
  onAlterar,
}: {
  cardId: string;
  deckId: string;
  lado: LadoCartao;
  label: string;
  altTexto: string;
  urlInicial: string | null;
  onAlterar?: (caminho: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(urlInicial);
  const [enviando, setEnviando] = useState(false);

  async function selecionarArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    if (!TIPOS_IMAGEM_ACEITOS.includes(arquivo.type)) {
      toast.add({
        title: "Formato inválido",
        description: "Use JPG, PNG, WEBP ou GIF.",
        type: "error",
      });
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM_BYTES) {
      toast.add({
        title: "Imagem muito grande",
        description: "O limite é 5MB por imagem.",
        type: "error",
      });
      return;
    }

    setEnviando(true);
    const previewAnterior = preview;
    try {
      const comprimido = await comprimirImagem(arquivo);
      setPreview(URL.createObjectURL(comprimido));

      const formData = new FormData();
      formData.set("file", comprimido);
      const resultado = await uploadImagemFlashcard(cardId, deckId, lado, formData);

      if (resultado.erro || !resultado.path) {
        toast.add({
          title: "Falha no upload",
          description: resultado.erro ?? "Tente novamente.",
          type: "error",
        });
        setPreview(previewAnterior);
        return;
      }

      onAlterar?.(resultado.path);
    } finally {
      setEnviando(false);
    }
  }

  async function remover() {
    setEnviando(true);
    try {
      const resultado = await removerImagemFlashcard(cardId, deckId, lado);
      if (resultado.erro) {
        toast.add({
          title: "Não foi possível remover a imagem",
          type: "error",
        });
        return;
      }
      setPreview(null);
      onAlterar?.(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {preview ? (
        <div className="relative w-fit">
          <img
            src={preview}
            alt={altTexto || label}
            className="h-24 w-24 rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            className="absolute -top-2 -right-2 rounded-full"
            onClick={remover}
            disabled={enviando}
            aria-label="Remover imagem"
          >
            <X />
          </Button>
          {enviando && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={enviando}
          onClick={() => inputRef.current?.click()}
        >
          {enviando ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {enviando ? "Enviando..." : "Adicionar imagem"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_IMAGEM_ACEITOS.join(",")}
        className="hidden"
        onChange={selecionarArquivo}
      />
    </div>
  );
}

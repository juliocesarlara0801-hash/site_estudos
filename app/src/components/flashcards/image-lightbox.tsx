"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ImageLightbox({
  url,
  alt,
  className,
  imgClassName,
}: {
  url: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [ampliado, setAmpliado] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "group relative cursor-zoom-in overflow-hidden rounded-lg",
          className
        )}
        onClick={() => setAberto(true)}
      >
        <img src={url} alt={alt} className={cn("h-full w-full object-contain", imgClassName)} />
        <span className="absolute inset-0 hidden items-center justify-center bg-black/30 group-hover:flex">
          <ZoomIn className="text-white" />
        </span>
      </button>

      <Dialog
        open={aberto}
        onOpenChange={(valor) => {
          setAberto(valor);
          if (!valor) setAmpliado(false);
        }}
      >
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img
            src={url}
            alt={alt}
            onClick={() => setAmpliado((v) => !v)}
            className={cn(
              "mx-auto max-h-[85vh] w-auto rounded-xl object-contain transition-transform",
              ampliado ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            )}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

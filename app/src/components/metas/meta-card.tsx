"use client";

import { PartyPopper, Trash2 } from "lucide-react";

import { excluirMeta } from "@/lib/actions/metas";
import type { MetaComProgresso } from "@/lib/data/metas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function MetaCard({ meta }: { meta: MetaComProgresso }) {
  const percentual = Math.round((meta.progressoHoras / meta.targetHours) * 100);
  const atingida = percentual >= 100;
  const rotuloPeriodo = meta.period === "weekly" ? "semanal" : "mensal";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <Badge
            style={{
              backgroundColor: `${meta.materiaCor}20`,
              color: meta.materiaCor,
            }}
            className="w-fit border-0"
          >
            {meta.materiaNome}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Meta {rotuloPeriodo}: {meta.targetHours}h
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => excluirMeta(meta.id)}
          aria-label="Excluir meta"
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {meta.progressoHoras}h de {meta.targetHours}h
          </span>
          {atingida && (
            <span className="flex items-center gap-1 font-medium" style={{ color: "#0ca30c" }}>
              <PartyPopper className="size-4" /> Meta atingida
            </span>
          )}
        </div>
        <Progress value={Math.min(100, percentual)} />

        <div className="flex items-center gap-1 pt-1">
          <span className="mr-1 text-xs text-muted-foreground">
            Últimas {meta.historico.length}:
          </span>
          {meta.historico.map((cumprida, i) => (
            <span
              key={i}
              className={cn(
                "size-2.5 rounded-full",
                cumprida ? "bg-foreground" : "bg-muted"
              )}
              title={cumprida ? "Meta cumprida" : "Meta não cumprida"}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

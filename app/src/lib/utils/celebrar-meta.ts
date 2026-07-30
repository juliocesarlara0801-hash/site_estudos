import { tocarBipe } from "./som";
import { notificar } from "./notificacoes";
import { toast } from "@/components/ui/toast";
import type { PeriodoMeta } from "./periodo";

type ResultadoSessao = {
  metaAtingida?: { materiaNome: string; periodo: PeriodoMeta } | null;
} | undefined;

export function celebrarMetaSeAtingida(resultado: ResultadoSessao) {
  if (!resultado?.metaAtingida) return;

  const { materiaNome, periodo } = resultado.metaAtingida;
  const rotuloPeriodo = periodo === "weekly" ? "semanal" : "mensal";

  tocarBipe();
  notificar("Meta atingida! 🎉", `Você bateu sua meta ${rotuloPeriodo} de ${materiaNome}.`);
  toast.add({
    title: "Meta atingida! 🎉",
    description: `Você bateu sua meta ${rotuloPeriodo} de ${materiaNome}.`,
    type: "success",
  });
}

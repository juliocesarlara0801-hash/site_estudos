import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";

export type PeriodoMeta = "weekly" | "monthly";

export function intervaloDoPeriodo(
  periodo: PeriodoMeta,
  referencia: Date = new Date()
) {
  if (periodo === "weekly") {
    return {
      inicio: startOfWeek(referencia, { weekStartsOn: 0 }),
      fim: endOfWeek(referencia, { weekStartsOn: 0 }),
    };
  }
  return {
    inicio: startOfMonth(referencia),
    fim: endOfMonth(referencia),
  };
}

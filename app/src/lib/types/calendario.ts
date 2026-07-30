export type BlocoHorario = {
  id: string;
  inicio: string;
  fim: string;
  titulo: string;
  subjectId: string | null;
};

export type ItemChecklist = {
  id: string;
  texto: string;
  feito: boolean;
};

export type { Materia } from "./materia";

export type EntradaDia = {
  schedule: BlocoHorario[] | null;
  notes: string | null;
  conclusions: string | null;
  doubts: string | null;
  pending: string | null;
  completed: ItemChecklist[] | null;
} | null;

export type PayloadDia = {
  schedule: BlocoHorario[];
  notes: string;
  conclusions: string;
  doubts: string[];
  pending: string[];
  completed: ItemChecklist[];
};

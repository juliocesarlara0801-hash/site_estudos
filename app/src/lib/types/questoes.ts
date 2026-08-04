export type Simulado = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  percentage: number;
};

export type SimuladoMateria = {
  id: string;
  subjectId: string;
  materiaNome: string;
  materiaCor: string;
  questions: number;
  correct: number;
  wrong: number;
  percentage: number;
};

export type SimuladoComMaterias = Simulado & { materias: SimuladoMateria[] };

export type ListaExercicios = {
  id: string;
  title: string;
  subjectId: string;
  materiaNome: string;
  materiaCor: string;
  date: string;
  questions: number;
  correct: number;
  wrong: number;
  percentage: number;
  source: string | null;
  description: string | null;
};

export type MetaAcerto = {
  id: string;
  subjectId: string;
  materiaNome: string;
  materiaCor: string;
  targetPercentage: number;
  mediaAtual: number;
};

export type ResumoGeral = {
  totalQuestoes: number;
  percentualGeral: number;
  melhorMateria: { nome: string; percentual: number } | null;
  piorMateria: { nome: string; percentual: number } | null;
};

export type LinhaFormularioMateria = {
  subjectId: string;
  questions: string;
  correct: string;
};

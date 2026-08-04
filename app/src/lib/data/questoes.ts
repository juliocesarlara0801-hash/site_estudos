import type { createClient } from "@/lib/supabase/server";
import { calcularPercentual } from "@/lib/utils/desempenho";
import type {
  ListaExercicios,
  MetaAcerto,
  ResumoGeral,
  SimuladoComMaterias,
} from "@/lib/types/questoes";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type FiltrosQuestoes = {
  subjectId?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
};

type SubjectRef =
  | { name: string; color: string }
  | { name: string; color: string }[]
  | null;

function materiaFromRef(ref: SubjectRef): { nome: string; cor: string } {
  const materia = Array.isArray(ref) ? ref[0] : ref;
  return { nome: materia?.name ?? "Matéria removida", cor: materia?.color ?? "#898781" };
}

type SimuladoRow = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  total_questions: number;
  total_correct: number;
  total_wrong: number;
  percentage: number;
  simulado_subjects:
    | {
        id: string;
        subject_id: string;
        questions: number;
        correct: number;
        wrong: number;
        percentage: number;
        subjects: SubjectRef;
      }[]
    | null;
};

function mapSimulados(rows: SimuladoRow[]): SimuladoComMaterias[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    date: row.date,
    totalQuestions: row.total_questions,
    totalCorrect: row.total_correct,
    totalWrong: row.total_wrong,
    percentage: Number(row.percentage),
    materias: (row.simulado_subjects ?? []).map((ms) => {
      const materia = materiaFromRef(ms.subjects);
      return {
        id: ms.id,
        subjectId: ms.subject_id,
        materiaNome: materia.nome,
        materiaCor: materia.cor,
        questions: ms.questions,
        correct: ms.correct,
        wrong: ms.wrong,
        percentage: Number(ms.percentage),
      };
    }),
  }));
}

const SELECT_SIMULADO =
  "id, name, description, date, total_questions, total_correct, total_wrong, percentage, simulado_subjects(id, subject_id, questions, correct, wrong, percentage, subjects(name, color))";

export async function obterSimulados(
  supabase: SupabaseServerClient,
  userId: string,
  filtros?: FiltrosQuestoes
): Promise<SimuladoComMaterias[]> {
  let query = supabase
    .from("simulados")
    .select(SELECT_SIMULADO)
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (filtros?.dataInicio) query = query.gte("date", filtros.dataInicio);
  if (filtros?.dataFim) query = query.lte("date", filtros.dataFim);

  const { data } = await query;
  let simulados = mapSimulados((data ?? []) as unknown as SimuladoRow[]);

  if (filtros?.subjectId) {
    simulados = simulados.filter((s) =>
      s.materias.some((m) => m.subjectId === filtros.subjectId)
    );
  }

  return simulados;
}

export async function obterSimuladoDetalhe(
  supabase: SupabaseServerClient,
  userId: string,
  id: string
): Promise<{ simulado: SimuladoComMaterias; anterior: SimuladoComMaterias | null } | null> {
  const todos = await obterSimulados(supabase, userId);
  const index = todos.findIndex((s) => s.id === id);
  if (index === -1) return null;

  return { simulado: todos[index], anterior: todos[index + 1] ?? null };
}

type ListaRow = {
  id: string;
  title: string;
  subject_id: string;
  date: string;
  questions: number;
  correct: number;
  wrong: number;
  percentage: number;
  source: string | null;
  description: string | null;
  subjects: SubjectRef;
};

function mapLista(row: ListaRow): ListaExercicios {
  const materia = materiaFromRef(row.subjects);
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    materiaNome: materia.nome,
    materiaCor: materia.cor,
    date: row.date,
    questions: row.questions,
    correct: row.correct,
    wrong: row.wrong,
    percentage: Number(row.percentage),
    source: row.source,
    description: row.description,
  };
}

const SELECT_LISTA =
  "id, title, subject_id, date, questions, correct, wrong, percentage, source, description, subjects(name, color)";

export async function obterListas(
  supabase: SupabaseServerClient,
  userId: string,
  filtros?: FiltrosQuestoes
): Promise<ListaExercicios[]> {
  let query = supabase
    .from("exercise_lists")
    .select(SELECT_LISTA)
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (filtros?.subjectId) query = query.eq("subject_id", filtros.subjectId);
  if (filtros?.dataInicio) query = query.gte("date", filtros.dataInicio);
  if (filtros?.dataFim) query = query.lte("date", filtros.dataFim);

  const { data } = await query;
  return ((data ?? []) as unknown as ListaRow[]).map(mapLista);
}

export async function obterListaDetalhe(
  supabase: SupabaseServerClient,
  userId: string,
  id: string
): Promise<{ lista: ListaExercicios; anterior: ListaExercicios | null } | null> {
  const { data } = await supabase
    .from("exercise_lists")
    .select(SELECT_LISTA)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  const lista = mapLista(data as unknown as ListaRow);

  const { data: anteriorData } = await supabase
    .from("exercise_lists")
    .select(SELECT_LISTA)
    .eq("user_id", userId)
    .eq("subject_id", lista.subjectId)
    .lt("date", lista.date)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    lista,
    anterior: anteriorData ? mapLista(anteriorData as unknown as ListaRow) : null,
  };
}

type AgregadoMateria = {
  subjectId: string;
  nome: string;
  cor: string;
  questions: number;
  correct: number;
  wrong: number;
};

function agregarPorMateria(
  simulados: SimuladoComMaterias[],
  listas: ListaExercicios[]
): AgregadoMateria[] {
  const mapa = new Map<string, AgregadoMateria>();

  for (const s of simulados) {
    for (const m of s.materias) {
      const atual = mapa.get(m.subjectId) ?? {
        subjectId: m.subjectId,
        nome: m.materiaNome,
        cor: m.materiaCor,
        questions: 0,
        correct: 0,
        wrong: 0,
      };
      atual.questions += m.questions;
      atual.correct += m.correct;
      atual.wrong += m.wrong;
      mapa.set(m.subjectId, atual);
    }
  }

  for (const l of listas) {
    const atual = mapa.get(l.subjectId) ?? {
      subjectId: l.subjectId,
      nome: l.materiaNome,
      cor: l.materiaCor,
      questions: 0,
      correct: 0,
      wrong: 0,
    };
    atual.questions += l.questions;
    atual.correct += l.correct;
    atual.wrong += l.wrong;
    mapa.set(l.subjectId, atual);
  }

  return [...mapa.values()];
}

export function calcularResumoGeral(
  simulados: SimuladoComMaterias[],
  listas: ListaExercicios[]
): ResumoGeral {
  const agregados = agregarPorMateria(simulados, listas).filter((m) => m.questions > 0);
  const totalQuestoes = agregados.reduce((soma, m) => soma + m.questions, 0);
  const totalCorretas = agregados.reduce((soma, m) => soma + m.correct, 0);

  const comPercentual = agregados
    .map((m) => ({ nome: m.nome, percentual: calcularPercentual(m.correct, m.questions) }))
    .sort((a, b) => b.percentual - a.percentual);

  return {
    totalQuestoes,
    percentualGeral: calcularPercentual(totalCorretas, totalQuestoes),
    melhorMateria: comPercentual[0] ?? null,
    piorMateria: comPercentual[comPercentual.length - 1] ?? null,
  };
}

export type PontoEvolucao = { data: string; percentual: number; rotulo: string };
export type SeriePorMateria = {
  subjectId: string;
  nome: string;
  cor: string;
  pontos: PontoEvolucao[];
};
export type DadosRadar = { materia: string; percentual: number };
export type DadosDistribuicao = { materia: string; cor: string; questoes: number };
export type DadosAcertosErros = { materia: string; acertos: number; erros: number };

export type DadosDesempenho = {
  evolucaoTemporal: PontoEvolucao[];
  porMateria: SeriePorMateria[];
  radar: DadosRadar[];
  distribuicao: DadosDistribuicao[];
  acertosErros: DadosAcertosErros[];
};

export function calcularDadosDesempenho(
  simulados: SimuladoComMaterias[],
  listas: ListaExercicios[]
): DadosDesempenho {
  const simuladosAsc = [...simulados].sort((a, b) => a.date.localeCompare(b.date));
  const listasAsc = [...listas].sort((a, b) => a.date.localeCompare(b.date));

  const evolucaoTemporal = simuladosAsc.map((s) => ({
    data: s.date,
    percentual: s.percentage,
    rotulo: s.name,
  }));

  const seriesPorMateria = new Map<string, SeriePorMateria>();
  function registrarPonto(subjectId: string, nome: string, cor: string, data: string, percentual: number) {
    const serie = seriesPorMateria.get(subjectId) ?? { subjectId, nome, cor, pontos: [] };
    serie.pontos.push({ data, percentual, rotulo: data });
    seriesPorMateria.set(subjectId, serie);
  }

  for (const s of simuladosAsc) {
    for (const m of s.materias) {
      registrarPonto(m.subjectId, m.materiaNome, m.materiaCor, s.date, m.percentage);
    }
  }
  for (const l of listasAsc) {
    registrarPonto(l.subjectId, l.materiaNome, l.materiaCor, l.date, l.percentage);
  }

  const porMateria = [...seriesPorMateria.values()].sort((a, b) => a.nome.localeCompare(b.nome));

  const agregados = agregarPorMateria(simulados, listas).filter((m) => m.questions > 0);

  const radar = agregados.map((m) => ({
    materia: m.nome,
    percentual: calcularPercentual(m.correct, m.questions),
  }));
  const distribuicao = agregados.map((m) => ({
    materia: m.nome,
    cor: m.cor,
    questoes: m.questions,
  }));
  const acertosErros = agregados.map((m) => ({
    materia: m.nome,
    acertos: m.correct,
    erros: m.wrong,
  }));

  return { evolucaoTemporal, porMateria, radar, distribuicao, acertosErros };
}

export async function obterMetas(
  supabase: SupabaseServerClient,
  userId: string,
  simulados: SimuladoComMaterias[],
  listas: ListaExercicios[]
): Promise<MetaAcerto[]> {
  const { data } = await supabase
    .from("accuracy_goals")
    .select("id, subject_id, target_percentage, subjects(name, color)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const agregados = agregarPorMateria(simulados, listas);
  const mapaAgregado = new Map(agregados.map((a) => [a.subjectId, a]));

  return (data ?? []).map((row) => {
    const materia = materiaFromRef(row.subjects as unknown as SubjectRef);
    const agregado = mapaAgregado.get(row.subject_id as string);
    return {
      id: row.id as string,
      subjectId: row.subject_id as string,
      materiaNome: materia.nome,
      materiaCor: materia.cor,
      targetPercentage: Number(row.target_percentage),
      mediaAtual: agregado ? calcularPercentual(agregado.correct, agregado.questions) : 0,
    };
  });
}

export async function obterDatasComAtividade(
  supabase: SupabaseServerClient,
  userId: string,
  inicioIso: string,
  fimIso: string
): Promise<string[]> {
  const [{ data: simulados }, { data: listas }] = await Promise.all([
    supabase
      .from("simulados")
      .select("date")
      .eq("user_id", userId)
      .gte("date", inicioIso)
      .lte("date", fimIso),
    supabase
      .from("exercise_lists")
      .select("date")
      .eq("user_id", userId)
      .gte("date", inicioIso)
      .lte("date", fimIso),
  ]);

  const datas = new Set<string>();
  (simulados ?? []).forEach((s) => datas.add(s.date as string));
  (listas ?? []).forEach((l) => datas.add(l.date as string));
  return [...datas];
}

export type AtividadeDoDia = {
  tipo: "simulado" | "lista";
  id: string;
  titulo: string;
  percentual: number;
};

export async function obterAtividadesDoDia(
  supabase: SupabaseServerClient,
  userId: string,
  dataIso: string
): Promise<AtividadeDoDia[]> {
  const [{ data: simulados }, { data: listas }] = await Promise.all([
    supabase
      .from("simulados")
      .select("id, name, percentage")
      .eq("user_id", userId)
      .eq("date", dataIso),
    supabase
      .from("exercise_lists")
      .select("id, title, percentage")
      .eq("user_id", userId)
      .eq("date", dataIso),
  ]);

  const atividades: AtividadeDoDia[] = [];
  (simulados ?? []).forEach((s) =>
    atividades.push({
      tipo: "simulado",
      id: s.id as string,
      titulo: s.name as string,
      percentual: Number(s.percentage),
    })
  );
  (listas ?? []).forEach((l) =>
    atividades.push({
      tipo: "lista",
      id: l.id as string,
      titulo: l.title as string,
      percentual: Number(l.percentage),
    })
  );

  return atividades;
}

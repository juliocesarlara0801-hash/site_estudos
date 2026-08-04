import { createClient } from "@/lib/supabase/server";
import {
  calcularDadosDesempenho,
  calcularResumoGeral,
  obterListas,
  obterMetas,
  obterSimulados,
} from "@/lib/data/questoes";
import { ResumoGeralCards } from "@/components/questoes/resumo-geral-cards";
import { QuestoesTabs } from "@/components/questoes/questoes-tabs";
import { AvisoSemMaterias } from "@/components/aviso-sem-materias";

export default async function QuestoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [simulados, listas, { data: materias }] = await Promise.all([
    obterSimulados(supabase, user?.id ?? ""),
    obterListas(supabase, user?.id ?? ""),
    supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user?.id ?? "")
      .order("name"),
  ]);

  const metas = await obterMetas(supabase, user?.id ?? "", simulados, listas);
  const resumo = calcularResumoGeral(simulados, listas);
  const dadosDesempenho = calcularDadosDesempenho(simulados, listas);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Questões</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho em simulados e listas de exercícios.
        </p>
      </div>

      {(!materias || materias.length === 0) && <AvisoSemMaterias />}

      <ResumoGeralCards resumo={resumo} />

      <QuestoesTabs
        simulados={simulados}
        listas={listas}
        materias={materias ?? []}
        dadosDesempenho={dadosDesempenho}
        metas={metas}
      />
    </div>
  );
}

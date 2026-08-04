import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Materia } from "@/lib/types/materia";
import type { MetaAcerto } from "@/lib/types/questoes";
import type { DadosDesempenho } from "@/lib/data/questoes";
import { GraficoEvolucaoTemporal } from "@/components/questoes/grafico-evolucao-temporal";
import { GraficoEvolucaoMateria } from "@/components/questoes/grafico-evolucao-materia";
import { GraficoRadarMaterias } from "@/components/questoes/grafico-radar-materias";
import { GraficoDistribuicaoMaterias } from "@/components/questoes/grafico-distribuicao-materias";
import { GraficoAcertosErros } from "@/components/questoes/grafico-acertos-erros";
import { MetasAcerto } from "@/components/questoes/metas-acerto";

export function DesempenhoPainel({
  dados,
  metas,
  materias,
}: {
  dados: DadosDesempenho;
  metas: MetaAcerto[];
  materias: Materia[];
}) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução geral (por simulado)</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoEvolucaoTemporal dados={dados.evolucaoTemporal} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução por matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoEvolucaoMateria series={dados.porMateria} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo entre matérias</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoRadarMaterias dados={dados.radar} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de questões por matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoDistribuicaoMaterias dados={dados.distribuicao} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Acertos vs. erros por matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoAcertosErros dados={dados.acertosErros} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metas de acerto por matéria</CardTitle>
        </CardHeader>
        <CardContent>
          <MetasAcerto metas={metas} materias={materias} />
        </CardContent>
      </Card>
    </div>
  );
}

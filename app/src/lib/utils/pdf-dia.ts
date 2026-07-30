import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { htmlParaTexto } from "./html";
import type { BlocoHorario, ItemChecklist } from "@/lib/types/calendario";

export type DadosExportacaoDia = {
  data: string; // yyyy-MM-dd
  schedule: BlocoHorario[];
  notes: string;
  conclusions: string;
  doubts: string[];
  pending: string[];
  completed: ItemChecklist[];
  materiasPorId: Record<string, string>;
};

const MARGEM = 15;

function criarConstrutor(doc: jsPDF) {
  const largura = doc.internal.pageSize.getWidth() - MARGEM * 2;
  const altura = doc.internal.pageSize.getHeight();
  let y = MARGEM;

  function novaPaginaSeNecessario(alturaNecessaria: number) {
    if (y + alturaNecessaria > altura - MARGEM) {
      doc.addPage();
      y = MARGEM;
    }
  }

  function cabecalhoDia(dataISO: string) {
    novaPaginaSeNecessario(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20);
    const dataFormatada = format(
      new Date(`${dataISO}T00:00:00`),
      "EEEE, d 'de' MMMM 'de' yyyy",
      { locale: ptBR }
    );
    doc.text(dataFormatada, MARGEM, y);
    y += 10;
  }

  function titulo(texto: string) {
    novaPaginaSeNecessario(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(texto, MARGEM, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  }

  function paragrafo(texto: string, indentacao = 0) {
    if (!texto) {
      doc.setTextColor(150);
      novaPaginaSeNecessario(6);
      doc.text("(vazio)", MARGEM + indentacao, y);
      y += 6;
      doc.setTextColor(20);
      return;
    }

    doc.setTextColor(20);
    const linhas: string[] = doc.splitTextToSize(texto, largura - indentacao);
    for (const linha of linhas) {
      novaPaginaSeNecessario(5.5);
      doc.text(linha, MARGEM + indentacao, y);
      y += 5.5;
    }
    y += 2;
  }

  function linhaDivisoria() {
    novaPaginaSeNecessario(6);
    doc.setDrawColor(220);
    doc.line(MARGEM, y, MARGEM + largura, y);
    y += 6;
  }

  return {
    doc,
    cabecalhoDia,
    titulo,
    paragrafo,
    linhaDivisoria,
    novaPaginaSeNecessario,
    get y() {
      return y;
    },
    set y(valor: number) {
      y = valor;
    },
  };
}

function escreverDia(
  construtor: ReturnType<typeof criarConstrutor>,
  dados: DadosExportacaoDia
) {
  const { titulo, paragrafo } = construtor;

  construtor.cabecalhoDia(dados.data);

  titulo("Cronograma");
  if (dados.schedule.length === 0) {
    paragrafo("");
  } else {
    const blocosOrdenados = [...dados.schedule].sort((a, b) =>
      a.inicio.localeCompare(b.inicio)
    );
    for (const bloco of blocosOrdenados) {
      const materiaNome = bloco.subjectId
        ? (dados.materiasPorId[bloco.subjectId] ?? "")
        : "";
      const linha = `${bloco.inicio}–${bloco.fim}  ${bloco.titulo || "(sem título)"}${
        materiaNome ? ` · ${materiaNome}` : ""
      }`;
      paragrafo(linha);
    }
  }

  titulo("Anotações");
  paragrafo(htmlParaTexto(dados.notes));

  titulo("Conclusões (o que aprendi)");
  paragrafo(dados.conclusions);

  titulo("Dúvidas");
  if (dados.doubts.length === 0) {
    paragrafo("");
  } else {
    dados.doubts.forEach((duvida) => paragrafo(`• ${duvida}`));
  }

  titulo("Pendências");
  if (dados.pending.length === 0) {
    paragrafo("");
  } else {
    dados.pending.forEach((pendencia) => paragrafo(`• ${pendencia}`));
  }

  titulo("Concluído");
  if (dados.completed.length === 0) {
    paragrafo("");
  } else {
    dados.completed.forEach((item) =>
      paragrafo(`${item.feito ? "[x]" : "[ ]"} ${item.texto}`)
    );
  }
}

export function gerarPdfDia(dados: DadosExportacaoDia) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const construtor = criarConstrutor(doc);
  escreverDia(construtor, dados);
  doc.save(`estudos-${dados.data}.pdf`);
}

export function gerarPdfSemana(dias: DadosExportacaoDia[], inicioSemana: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const construtor = criarConstrutor(doc);

  dias.forEach((dia, indice) => {
    if (indice > 0) {
      doc.addPage();
      construtor.y = MARGEM;
    }
    escreverDia(construtor, dia);
  });

  doc.save(`estudos-semana-${inicioSemana}.pdf`);
}

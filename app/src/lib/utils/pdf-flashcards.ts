import { jsPDF } from "jspdf";

const MARGEM = 15;

export function gerarPdfDeck(
  nomeDeck: string,
  cartoes: { front: string; back: string }[]
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth() - MARGEM * 2;
  const altura = doc.internal.pageSize.getHeight();
  let y = MARGEM;

  function novaPaginaSeNecessario(alturaNecessaria: number) {
    if (y + alturaNecessaria > altura - MARGEM) {
      doc.addPage();
      y = MARGEM;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(nomeDeck, MARGEM, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`${cartoes.length} cartões`, MARGEM, (y += 5));
  y += 5;
  doc.setTextColor(20);

  cartoes.forEach((cartao, indice) => {
    novaPaginaSeNecessario(16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const linhasFrente: string[] = doc.splitTextToSize(
      `${indice + 1}. ${cartao.front}`,
      largura
    );
    for (const linha of linhasFrente) {
      novaPaginaSeNecessario(6);
      doc.text(linha, MARGEM, y);
      y += 6;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    const linhasVerso: string[] = doc.splitTextToSize(
      `R: ${cartao.back}`,
      largura - 5
    );
    for (const linha of linhasVerso) {
      novaPaginaSeNecessario(5.5);
      doc.text(linha, MARGEM + 5, y);
      y += 5.5;
    }
    doc.setTextColor(20);

    y += 3;
    novaPaginaSeNecessario(4);
    doc.setDrawColor(220);
    doc.line(MARGEM, y, MARGEM + largura, y);
    y += 6;
  });

  const nomeArquivo = nomeDeck
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  doc.save(`flashcards-${nomeArquivo || "deck"}.pdf`);
}

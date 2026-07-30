import { jsPDF } from "jspdf";

const MARGEM = 15;
const ALTURA_MAXIMA_IMAGEM_MM = 60;

type CartaoParaPdf = {
  front: string;
  back: string;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
};

type ImagemCarregada = {
  dataUrl: string;
  largura: number;
  altura: number;
};

/**
 * Baixa a imagem (signed URL) e a redesenha em um canvas para gerar um PNG,
 * já que o jsPDF não sabe lidar com GIF e assim evitamos checar o mimetype original.
 */
async function carregarImagemParaPdf(url: string): Promise<ImagemCarregada | null> {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) return null;
    const blob = await resposta.blob();
    const objectUrl = URL.createObjectURL(blob);

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const elemento = new window.Image();
        elemento.onload = () => resolve(elemento);
        elemento.onerror = reject;
        elemento.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);

      return {
        dataUrl: canvas.toDataURL("image/png"),
        largura: img.naturalWidth,
        altura: img.naturalHeight,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}

export async function gerarPdfDeck(
  nomeDeck: string,
  cartoes: CartaoParaPdf[]
): Promise<void> {
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

  function inserirImagem(imagem: ImagemCarregada) {
    const escala = Math.min(
      largura / imagem.largura,
      ALTURA_MAXIMA_IMAGEM_MM / imagem.altura,
      1
    );
    const larguraFinal = imagem.largura * escala;
    const alturaFinal = imagem.altura * escala;

    novaPaginaSeNecessario(alturaFinal + 4);
    doc.addImage(
      imagem.dataUrl,
      "PNG",
      MARGEM + (largura - larguraFinal) / 2,
      y,
      larguraFinal,
      alturaFinal
    );
    y += alturaFinal + 4;
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

  for (const [indice, cartao] of cartoes.entries()) {
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

    if (cartao.frontImageUrl) {
      const imagem = await carregarImagemParaPdf(cartao.frontImageUrl);
      if (imagem) inserirImagem(imagem);
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

    if (cartao.backImageUrl) {
      const imagem = await carregarImagemParaPdf(cartao.backImageUrl);
      if (imagem) inserirImagem(imagem);
    }

    y += 3;
    novaPaginaSeNecessario(4);
    doc.setDrawColor(220);
    doc.line(MARGEM, y, MARGEM + largura, y);
    y += 6;
  }

  const nomeArquivo = nomeDeck
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  doc.save(`flashcards-${nomeArquivo || "deck"}.pdf`);
}

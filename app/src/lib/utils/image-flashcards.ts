export const BUCKET_IMAGENS_FLASHCARDS = "flashcard-images";

export const TIPOS_IMAGEM_ACEITOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const TAMANHO_MAXIMO_IMAGEM_BYTES = 5 * 1024 * 1024;

const LADO_MAXIMO_PX = 1200;

/**
 * Redimensiona (máx. 1200px no lado maior) e converte para WEBP no client antes do upload.
 * GIF é mantido intacto para não perder a animação (canvas achataria em um único frame).
 */
export async function comprimirImagem(arquivo: File): Promise<File> {
  if (arquivo.type === "image/gif") {
    return arquivo;
  }

  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, LADO_MAXIMO_PX / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return arquivo;

    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    const nomeBase = arquivo.name.replace(/\.[^.]+$/, "");

    const blobWebp = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    if (blobWebp) {
      return new File([blobWebp], `${nomeBase}.webp`, { type: "image/webp" });
    }

    const tipoFallback = arquivo.type === "image/png" ? "image/png" : "image/jpeg";
    const extensaoFallback = arquivo.type === "image/png" ? "png" : "jpg";
    const blobFallback = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, tipoFallback, 0.85)
    );
    if (blobFallback) {
      return new File([blobFallback], `${nomeBase}.${extensaoFallback}`, {
        type: tipoFallback,
      });
    }

    return arquivo;
  } catch {
    return arquivo;
  }
}

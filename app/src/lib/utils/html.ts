/** Converte o HTML simples do editor de anotações em texto puro, preservando listas. */
export function htmlParaTexto(html: string): string {
  if (!html) return "";

  let texto = html
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(p|div|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  const entidades: [RegExp, string][] = [
    [/&nbsp;/g, " "],
    [/&amp;/g, "&"],
    [/&lt;/g, "<"],
    [/&gt;/g, ">"],
    [/&quot;/g, '"'],
    [/&#39;/g, "'"],
  ];
  for (const [padrao, substituto] of entidades) {
    texto = texto.replace(padrao, substituto);
  }

  return texto.replace(/\n{3,}/g, "\n\n").trim();
}

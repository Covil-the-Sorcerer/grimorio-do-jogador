const LIMITE_DO_ARQUIVO = 20 * 1024 * 1024;

function carregar(url: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () =>
      rejeitar(new Error("Não foi possível abrir a imagem. Tente outro arquivo (JPG, PNG ou WebP)."));
    imagem.src = url;
  });
}

/**
 * Recorta a imagem em quadrado (pelo centro), reduz para `lado` pixels e devolve em JPEG
 * no formato "data:image/jpeg;base64,...". Fica pequena o bastante para guardar no aparelho.
 */
export async function reduzirImagem(arquivo: File, lado = 384): Promise<string> {
  if (!arquivo.type.startsWith("image/")) {
    throw new Error("O arquivo escolhido não é uma imagem.");
  }
  if (arquivo.size > LIMITE_DO_ARQUIVO) {
    throw new Error("A imagem é grande demais (limite de 20 MB).");
  }

  const url = URL.createObjectURL(arquivo);
  try {
    const imagem = await carregar(url);
    const menor = Math.min(imagem.naturalWidth, imagem.naturalHeight);
    if (!menor) throw new Error("Não foi possível ler as dimensões da imagem.");

    const origemX = (imagem.naturalWidth - menor) / 2;
    const origemY = (imagem.naturalHeight - menor) / 2;

    const tela = document.createElement("canvas");
    tela.width = lado;
    tela.height = lado;
    const contexto = tela.getContext("2d");
    if (!contexto) throw new Error("Não foi possível preparar a imagem.");

    // Fundo branco, para imagens com transparência não ficarem pretas no JPEG.
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, lado, lado);
    contexto.drawImage(imagem, origemX, origemY, menor, menor, 0, 0, lado, lado);
    return tela.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

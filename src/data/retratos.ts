import { armazenamento } from "../storage";
import { idValido } from "./ficha";

// A imagem de perfil fica em um arquivo de texto separado (retratos/{id}.txt) contendo a
// imagem já reduzida, no formato "data:image/jpeg;base64,...". Assim a ficha em si continua leve.

function caminho(id: string): string {
  if (!idValido(id)) throw new Error("Identificação de ficha inválida.");
  return `retratos/${id}.txt`;
}

export async function lerRetrato(id: string): Promise<string | null> {
  const conteudo = await armazenamento().ler(caminho(id));
  if (conteudo === null) return null;
  const limpo = conteudo.trim();
  return limpo.startsWith("data:image/") ? limpo : null;
}

export async function salvarRetrato(id: string, imagem: string): Promise<void> {
  if (!imagem.startsWith("data:image/")) throw new Error("Imagem inválida.");
  await armazenamento().gravar(caminho(id), imagem);
}

export async function removerRetrato(id: string): Promise<void> {
  await armazenamento().apagar(caminho(id));
}

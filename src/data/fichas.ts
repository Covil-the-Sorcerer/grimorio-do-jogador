import { registrarErro } from "../lib/diagnostico";
import { armazenamento } from "../storage";
import {
  criarFichaVazia,
  idValido,
  normalizarFicha,
  novoId,
  type Ficha,
  type OpcoesNovaFicha,
} from "./ficha";

const PASTA = "fichas";

export interface ResumoFicha {
  id: string;
  nome: string;
  classe: string;
  nivel: number;
  atualizadaEm: string;
}

export interface ListaFichas {
  fichas: ResumoFicha[];
  /** Nomes de arquivos que não puderam ser lidos. */
  problemas: string[];
}

function caminho(id: string): string {
  if (!idValido(id)) throw new Error("Identificação de ficha inválida.");
  return `${PASTA}/${id}.json`;
}

export async function listarFichas(): Promise<ListaFichas> {
  const arq = armazenamento();
  const nomes = await arq.listar(PASTA);
  const fichas: ResumoFicha[] = [];
  const problemas: string[] = [];

  for (const nome of nomes) {
    if (!nome.endsWith(".json")) continue;
    const id = nome.slice(0, -".json".length);
    try {
      const conteudo = await arq.ler(`${PASTA}/${nome}`);
      if (conteudo === null) continue;
      const ficha = normalizarFicha(JSON.parse(conteudo), id);
      fichas.push({
        id,
        nome: ficha.nome,
        classe: ficha.dados.classe,
        nivel: ficha.dados.nivel,
        atualizadaEm: ficha.atualizadaEm,
      });
    } catch (erro) {
      registrarErro("listar-fichas", new Error(`${nome}: ${erro instanceof Error ? erro.message : String(erro)}`));
      problemas.push(nome);
    }
  }

  fichas.sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm));
  return { fichas, problemas };
}

export async function lerFicha(id: string): Promise<Ficha | null> {
  const conteudo = await armazenamento().ler(caminho(id));
  if (conteudo === null) return null;
  return normalizarFicha(JSON.parse(conteudo), id);
}

// As gravações entram em uma fila, uma de cada vez, para nunca se atropelarem.
let fila: Promise<void> = Promise.resolve();

export function salvarFicha(ficha: Ficha): Promise<void> {
  const destino = caminho(ficha.id);
  const conteudo = JSON.stringify(ficha, null, 2);
  const tarefa = fila.then(() => armazenamento().gravar(destino, conteudo));
  fila = tarefa.catch(() => undefined);
  return tarefa;
}

export async function criarFicha(opcoes: OpcoesNovaFicha): Promise<Ficha> {
  const ficha = criarFichaVazia(opcoes);
  await salvarFicha(ficha);
  return ficha;
}

export async function duplicarFicha(id: string): Promise<Ficha> {
  const original = await lerFicha(id);
  if (!original) throw new Error("A ficha original não foi encontrada.");
  const agora = new Date().toISOString();
  const copia: Ficha = {
    ...structuredClone(original),
    id: novoId(),
    nome: `${original.nome} (cópia)`,
    criadaEm: agora,
    atualizadaEm: agora,
  };
  await salvarFicha(copia);
  return copia;
}

export async function excluirFicha(id: string): Promise<void> {
  await armazenamento().apagar(caminho(id));
}

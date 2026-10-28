import type { DadosDnd5e } from "./tipos";

function simplificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * A especialização em perícias é exclusiva de Bardo e Ladino.
 * Vale tanto para fichas da criação guiada quanto para fichas em branco com o nome da classe escrito.
 */
export function permiteEspecializacao(dados: DadosDnd5e): boolean {
  if (dados.origem.classeId === "ladino" || dados.origem.classeId === "bardo") return true;
  const nome = simplificar(dados.classe);
  return /\b(ladino|ladina|bardo|barda|rogue|bard)\b/.test(nome);
}

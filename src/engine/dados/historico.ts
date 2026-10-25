import type { GrupoDados, ModoD20, ResultadoRolagem } from "./rolar";

export interface Rolagem {
  id: string;
  /** Data e hora (ISO). */
  quando: string;
  nome: string;
  /** De onde veio a rolagem, ex.: o nome da ficha. Pode ser vazio. */
  origem: string;
  resultado: ResultadoRolagem;
}

export const LIMITE_DO_HISTORICO = 100;

function ehNumero(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

function listaDeNumeros(valor: unknown): number[] | null {
  if (!Array.isArray(valor) || valor.length > 200) return null;
  return valor.every(ehNumero) ? (valor as number[]) : null;
}

function lerGrupo(bruto: unknown): GrupoDados | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const g = bruto as Record<string, unknown>;
  const resultados = listaDeNumeros(g.resultados);
  const descartados = listaDeNumeros(g.descartados);
  if (!resultados || !descartados) return null;
  if ((g.sinal !== 1 && g.sinal !== -1) || !ehNumero(g.quantidade) || !ehNumero(g.lados)) return null;
  return { sinal: g.sinal, quantidade: g.quantidade, lados: g.lados, resultados, descartados };
}

function lerResultado(bruto: unknown): ResultadoRolagem | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const r = bruto as Record<string, unknown>;
  if (typeof r.formula !== "string" || !ehNumero(r.modificador) || !ehNumero(r.total)) return null;
  if (!Array.isArray(r.grupos) || r.grupos.length > 50) return null;

  const grupos: GrupoDados[] = [];
  for (const item of r.grupos) {
    const grupo = lerGrupo(item);
    if (!grupo) return null;
    grupos.push(grupo);
  }

  const modo: ModoD20 =
    r.modo === "vantagem" || r.modo === "desvantagem" ? r.modo : "normal";
  const natural: 20 | 1 | null = r.natural === 20 ? 20 : r.natural === 1 ? 1 : null;
  return { formula: r.formula, modo, grupos, modificador: r.modificador, total: r.total, natural };
}

/** Lê o histórico de um arquivo, descartando o que estiver quebrado. Nunca lança erro. */
export function normalizarHistorico(bruto: unknown): Rolagem[] {
  if (typeof bruto !== "object" || bruto === null) return [];
  const itens = (bruto as Record<string, unknown>).itens;
  if (!Array.isArray(itens)) return [];

  const saida: Rolagem[] = [];
  const ids = new Set<string>();
  for (const item of itens) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    if (typeof r.id !== "string" || !r.id || ids.has(r.id)) continue;
    if (typeof r.quando !== "string") continue;
    const resultado = lerResultado(r.resultado);
    if (!resultado) continue;
    ids.add(r.id);
    saida.push({
      id: r.id,
      quando: r.quando,
      nome: typeof r.nome === "string" ? r.nome : "",
      origem: typeof r.origem === "string" ? r.origem : "",
      resultado,
    });
    if (saida.length >= LIMITE_DO_HISTORICO) break;
  }
  return saida;
}

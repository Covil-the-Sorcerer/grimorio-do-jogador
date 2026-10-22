import { avaliar } from "../formulas/avaliar";
import type { DefinicaoSistema, Resultado, Valor } from "./tipos";

function temPropriedade(objeto: object, nome: string): boolean {
  return Object.prototype.hasOwnProperty.call(objeto, nome);
}

// Lê um número em um caminho da ficha, ex.: "atributos.for".
function numeroEm(dados: unknown, caminho: string): number {
  let atual: unknown = dados;
  for (const parte of caminho.split(".")) {
    if (typeof atual !== "object" || atual === null || !temPropriedade(atual, parte)) {
      throw new Error(`Valor não encontrado na ficha: ${caminho}`);
    }
    atual = (atual as Record<string, unknown>)[parte];
  }
  if (typeof atual !== "number" || !Number.isFinite(atual)) {
    throw new Error(`O valor "${caminho}" não é um número.`);
  }
  return atual;
}

function sobrescritasDe(dados: unknown): Record<string, number> {
  if (typeof dados === "object" && dados !== null && "sobrescritas" in dados) {
    const bruto = (dados as { sobrescritas: unknown }).sobrescritas;
    if (typeof bruto === "object" && bruto !== null) return bruto as Record<string, number>;
  }
  return {};
}

/**
 * Calcula todos os valores da definição para uma ficha.
 * Regra do override: se o jogador trocou um valor à mão, ele vale no lugar do calculado,
 * e os valores que dependem dele já usam o número trocado.
 */
export function calcularTudo(definicao: DefinicaoSistema, dados: unknown): Resultado {
  const porChave = new Map(definicao.calculados.map((c) => [c.chave, c]));
  const sobrescritas = sobrescritasDe(dados);
  const prontos = new Map<string, Valor>();
  const emCalculo = new Set<string>();

  function valorDe(chave: string): Valor {
    const pronto = prontos.get(chave);
    if (pronto) return pronto;

    const def = porChave.get(chave);
    if (!def) throw new Error(`Valor calculado desconhecido: ${chave}`);
    if (emCalculo.has(chave)) throw new Error(`Fórmulas em círculo envolvendo: ${chave}`);

    emCalculo.add(chave);
    try {
      const calculado = avaliar(def.formula, resolver);
      const trocado = temPropriedade(sobrescritas, chave) ? sobrescritas[chave] : undefined;
      const sobrescrito = typeof trocado === "number" && Number.isFinite(trocado);
      const valor: Valor = {
        calculado,
        efetivo: sobrescrito ? (trocado as number) : calculado,
        sobrescrito,
      };
      prontos.set(chave, valor);
      return valor;
    } finally {
      emCalculo.delete(chave);
    }
  }

  function resolver(nome: string): number {
    if (porChave.has(nome)) return valorDe(nome).efetivo;
    return numeroEm(dados, nome);
  }

  const resultado: Resultado = {};
  for (const def of definicao.calculados) {
    resultado[def.chave] = valorDe(def.chave);
  }
  return resultado;
}

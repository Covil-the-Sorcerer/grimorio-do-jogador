import type { Ficha } from "../../data/ficha";
import type { Resultado } from "../../engine/rules/tipos";

export interface PropsAba {
  ficha: Ficha;
  calc: Resultado;
  atualizar: (mutar: (rascunho: Ficha) => void) => void;
}

/** Troca (ou desfaz a troca de) um valor calculado. */
export function definirSobrescrita(ficha: Ficha, chave: string, valor: number | null): void {
  if (valor === null) {
    delete ficha.dados.sobrescritas[chave];
  } else {
    ficha.dados.sobrescritas[chave] = valor;
  }
}

export function formatarSinal(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

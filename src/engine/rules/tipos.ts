// Formato das definições de sistema: as regras do jogo escritas como dados.
export interface DefAtributo {
  id: string;
  nome: string;
  sigla: string;
}

export interface DefPericia {
  id: string;
  nome: string;
  /** id do atributo usado pela perícia */
  atributo: string;
}

export interface DefCalculado {
  /** Nome único do valor, ex.: "mod.for" ou "ca". */
  chave: string;
  nome: string;
  /** Fórmula que usa outras chaves e caminhos da ficha, ex.: "10 + mod.des". */
  formula: string;
}

export interface DefinicaoSistema {
  id: string;
  versao: string;
  nome: string;
  atributos: DefAtributo[];
  pericias: DefPericia[];
  calculados: DefCalculado[];
}

/** Um valor calculado: o que a regra dá, o que vale de fato e se foi trocado à mão. */
export interface Valor {
  calculado: number;
  efetivo: number;
  sobrescrito: boolean;
}

export type Resultado = Record<string, Valor>;

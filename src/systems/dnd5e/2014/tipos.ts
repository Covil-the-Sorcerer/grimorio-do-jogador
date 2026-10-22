// Dados de uma ficha de D&D 5e (2014).
export interface Vida {
  atual: number;
  maximo: number;
  temporario: number;
}

export interface DadosDnd5e {
  jogador: string;
  raca: string;
  classe: string;
  antecedente: string;
  alinhamento: string;
  nivel: number;
  /** Valor de cada atributo, por id (for, des, con, int, sab, car). */
  atributos: Record<string, number>;
  /** 0 = sem proficiência, 1 = proficiente, 2 = especialista (perícias). */
  proficiencia: {
    pericias: Record<string, number>;
    resistencias: Record<string, number>;
  };
  /** Valores trocados à mão, por chave (ex.: "ca", "mod.des"). Só existem as chaves trocadas. */
  sobrescritas: Record<string, number>;
  vida: Vida;
  /** Deslocamento em metros. */
  deslocamento: number;
  anotacoes: string;
}

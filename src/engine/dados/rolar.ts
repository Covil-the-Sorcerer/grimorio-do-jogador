// Rolagem de dados: leitura de fórmulas como "2d8+3" ou "1d20-1" e sorteio dos resultados.

export type ModoD20 = "normal" | "vantagem" | "desvantagem";

/** Devolve um número inteiro de 1 até `lados`. */
export type Sorteador = (lados: number) => number;

export type Termo =
  | { tipo: "dados"; sinal: 1 | -1; quantidade: number; lados: number }
  | { tipo: "fixo"; sinal: 1 | -1; valor: number };

export interface FormulaDados {
  termos: Termo[];
}

export interface GrupoDados {
  sinal: 1 | -1;
  quantidade: number;
  lados: number;
  /** Dados que contam para o total. */
  resultados: number[];
  /** Dados rolados mas ignorados (o que sobra na vantagem ou desvantagem). */
  descartados: number[];
}

export interface ResultadoRolagem {
  /** Fórmula na forma padronizada, ex.: "1d20+5". */
  formula: string;
  /** Modo realmente aplicado (vira "normal" se a fórmula não tem 1d20). */
  modo: ModoD20;
  grupos: GrupoDados[];
  /** Soma dos números fixos da fórmula. */
  modificador: number;
  total: number;
  /** 20 ou 1, quando o 1d20 contado tirou o máximo ou o mínimo. */
  natural: 20 | 1 | null;
}

const MAXIMO_DADOS = 100;
const MAXIMO_LADOS = 1000;
const MAXIMO_TERMOS = 20;
const MAXIMO_FIXO = 100000;

/** Sorteio sem viés, com o gerador seguro do sistema. */
export function sortearPadrao(lados: number): number {
  const limite = 0x100000000 - (0x100000000 % lados);
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limite) return (buffer[0] % lados) + 1;
  }
}

/** Lê uma fórmula de dados. Lança um erro com mensagem clara se ela não for válida. */
export function interpretar(texto: string): FormulaDados {
  const compacto = texto.toLowerCase().replace(/\s+/g, "");
  if (!compacto) {
    throw new Error("Digite uma fórmula, por exemplo 1d20+5.");
  }
  // "2d6 3" viraria "2d63" ao tirar os espaços; é quase certo que faltou um + ou -.
  if (/\d\s+\d/.test(texto)) {
    throw new Error(`Fórmula inválida: "${texto.trim()}". Falta um + ou - entre os números.`);
  }
  if (!/^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/.test(compacto)) {
    throw new Error(`Fórmula inválida: "${texto.trim()}". Use algo como 2d6+3 ou 1d20-1.`);
  }

  const termos: Termo[] = [];
  for (const parte of compacto.matchAll(/([+-]?)(\d*d\d+|\d+)/g)) {
    const sinal: 1 | -1 = parte[1] === "-" ? -1 : 1;
    const corpo = parte[2];
    if (corpo.includes("d")) {
      const [q, l] = corpo.split("d");
      const quantidade = q === "" ? 1 : Number(q);
      const lados = Number(l);
      if (quantidade < 1 || quantidade > MAXIMO_DADOS) {
        throw new Error(`Use de 1 a ${MAXIMO_DADOS} dados por vez.`);
      }
      if (lados < 2 || lados > MAXIMO_LADOS) {
        throw new Error(`Os dados precisam ter de 2 a ${MAXIMO_LADOS} lados.`);
      }
      termos.push({ tipo: "dados", sinal, quantidade, lados });
    } else {
      const valor = Number(corpo);
      if (valor > MAXIMO_FIXO) throw new Error("Número grande demais na fórmula.");
      termos.push({ tipo: "fixo", sinal, valor });
    }
  }

  if (termos.length > MAXIMO_TERMOS) {
    throw new Error(`Use no máximo ${MAXIMO_TERMOS} partes na fórmula.`);
  }
  return { termos };
}

/** Escreve a fórmula na forma padronizada (ex.: "2d6+1d4-1"). */
export function formatar(formula: FormulaDados): string {
  return formula.termos
    .map((termo, indice) => {
      const corpo =
        termo.tipo === "dados" ? `${termo.quantidade}d${termo.lados}` : String(termo.valor);
      if (termo.sinal === -1) return `-${corpo}`;
      return indice === 0 ? corpo : `+${corpo}`;
    })
    .join("");
}

/** Dano crítico: dobra a quantidade de dados somados (os números fixos não mudam). */
export function dobrarDados(formula: FormulaDados): FormulaDados {
  return {
    termos: formula.termos.map((termo) =>
      termo.tipo === "dados" && termo.sinal === 1
        ? { ...termo, quantidade: Math.min(MAXIMO_DADOS, termo.quantidade * 2) }
        : termo,
    ),
  };
}

function eD20Simples(termo: Termo): boolean {
  return termo.tipo === "dados" && termo.sinal === 1 && termo.quantidade === 1 && termo.lados === 20;
}

/**
 * Rola a fórmula. Vantagem e desvantagem valem para o primeiro "1d20": rola-se duas vezes
 * e conta o maior (vantagem) ou o menor (desvantagem).
 */
export function executar(
  formula: FormulaDados,
  opcoes: { modo?: ModoD20; sortear?: Sorteador } = {},
): ResultadoRolagem {
  const sortear = opcoes.sortear ?? sortearPadrao;
  const indiceD20 = formula.termos.findIndex(eD20Simples);
  const pedido = opcoes.modo ?? "normal";
  const modo: ModoD20 = indiceD20 >= 0 ? pedido : "normal";

  const grupos: GrupoDados[] = [];
  let modificador = 0;
  let total = 0;
  let natural: 20 | 1 | null = null;

  formula.termos.forEach((termo, indice) => {
    if (termo.tipo === "fixo") {
      modificador += termo.sinal * termo.valor;
      total += termo.sinal * termo.valor;
      return;
    }

    let resultados: number[] = [];
    let descartados: number[] = [];

    if (indice === indiceD20 && modo !== "normal") {
      const a = sortear(termo.lados);
      const b = sortear(termo.lados);
      const fica = modo === "vantagem" ? Math.max(a, b) : Math.min(a, b);
      const sai = a + b - fica;
      resultados = [fica];
      descartados = [sai];
    } else {
      for (let i = 0; i < termo.quantidade; i++) resultados.push(sortear(termo.lados));
    }

    if (indice === indiceD20) {
      const contado = resultados[0];
      natural = contado === 20 ? 20 : contado === 1 ? 1 : null;
    }

    total += termo.sinal * resultados.reduce((soma, valor) => soma + valor, 0);
    grupos.push({
      sinal: termo.sinal,
      quantidade: termo.quantidade,
      lados: termo.lados,
      resultados,
      descartados,
    });
  });

  return { formula: formatar(formula), modo, grupos, modificador, total, natural };
}

/** Monta a fórmula de um teste de d20 com modificador: 5 -> "1d20+5", -2 -> "1d20-2", 0 -> "1d20". */
export function formulaDeTeste(modificador: number): string {
  const inteiro = Math.trunc(modificador);
  if (inteiro === 0) return "1d20";
  return inteiro > 0 ? `1d20+${inteiro}` : `1d20${inteiro}`;
}

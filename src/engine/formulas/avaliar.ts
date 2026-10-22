// Leitor e avaliador de fórmulas, por exemplo: "floor((atributos.for - 10) / 2)".
// Não usa eval: só entende números, nomes, + - * /, parênteses e algumas funções.

export type Resolvedor = (nome: string) => number;

type No =
  | { tipo: "numero"; valor: number }
  | { tipo: "nome"; nome: string }
  | { tipo: "unario"; operador: "+" | "-"; operando: No }
  | { tipo: "binario"; operador: "+" | "-" | "*" | "/"; esquerda: No; direita: No }
  | { tipo: "chamada"; funcao: string; argumentos: No[] };

type Token =
  | { tipo: "numero"; valor: number }
  | { tipo: "nome"; nome: string }
  | { tipo: "simbolo"; simbolo: string };

interface Funcao {
  minimo: number;
  maximo: number;
  executar: (argumentos: number[]) => number;
}

const FUNCOES = new Map<string, Funcao>([
  ["floor", { minimo: 1, maximo: 1, executar: (a) => Math.floor(a[0]) }],
  ["ceil", { minimo: 1, maximo: 1, executar: (a) => Math.ceil(a[0]) }],
  ["round", { minimo: 1, maximo: 1, executar: (a) => Math.round(a[0]) }],
  ["abs", { minimo: 1, maximo: 1, executar: (a) => Math.abs(a[0]) }],
  ["min", { minimo: 1, maximo: 20, executar: (a) => Math.min(...a) }],
  ["max", { minimo: 1, maximo: 20, executar: (a) => Math.max(...a) }],
]);

function tokenizar(texto: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < texto.length && /[0-9.]/.test(texto[j])) j++;
      const trecho = texto.slice(i, j);
      const valor = Number(trecho);
      if (!Number.isFinite(valor)) throw new Error(`Número inválido na fórmula: "${trecho}"`);
      tokens.push({ tipo: "numero", valor });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < texto.length && /[A-Za-z0-9_.]/.test(texto[j])) j++;
      tokens.push({ tipo: "nome", nome: texto.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/(),".includes(c)) {
      tokens.push({ tipo: "simbolo", simbolo: c });
      i++;
      continue;
    }
    throw new Error(`Caractere inválido na fórmula: "${c}"`);
  }
  return tokens;
}

function analisar(formula: string): No {
  const tokens = tokenizar(formula);
  let pos = 0;

  const erro = (motivo: string) => new Error(`Fórmula inválida (${motivo}): ${formula}`);

  const simboloAtual = (): string | null => {
    const token = tokens[pos];
    return token !== undefined && token.tipo === "simbolo" ? token.simbolo : null;
  };

  const consumir = (simbolo: string) => {
    if (simboloAtual() !== simbolo) throw erro(`esperava "${simbolo}"`);
    pos++;
  };

  function expressao(): No {
    let esquerda = termo();
    for (;;) {
      const s = simboloAtual();
      if (s !== "+" && s !== "-") break;
      pos++;
      esquerda = { tipo: "binario", operador: s, esquerda, direita: termo() };
    }
    return esquerda;
  }

  function termo(): No {
    let esquerda = unario();
    for (;;) {
      const s = simboloAtual();
      if (s !== "*" && s !== "/") break;
      pos++;
      esquerda = { tipo: "binario", operador: s, esquerda, direita: unario() };
    }
    return esquerda;
  }

  function unario(): No {
    const s = simboloAtual();
    if (s === "-" || s === "+") {
      pos++;
      return { tipo: "unario", operador: s, operando: unario() };
    }
    return primario();
  }

  function primario(): No {
    const token = tokens[pos];
    if (token === undefined) throw erro("fim inesperado");

    if (token.tipo === "numero") {
      pos++;
      return { tipo: "numero", valor: token.valor };
    }

    if (token.tipo === "nome") {
      pos++;
      if (simboloAtual() === "(") {
        pos++;
        const argumentos: No[] = [];
        if (simboloAtual() !== ")") {
          for (;;) {
            argumentos.push(expressao());
            if (simboloAtual() === ",") {
              pos++;
              continue;
            }
            break;
          }
        }
        consumir(")");
        return { tipo: "chamada", funcao: token.nome, argumentos };
      }
      return { tipo: "nome", nome: token.nome };
    }

    if (token.simbolo === "(") {
      pos++;
      const dentro = expressao();
      consumir(")");
      return dentro;
    }

    throw erro(`símbolo inesperado "${token.simbolo}"`);
  }

  const resultado = expressao();
  if (pos < tokens.length) throw erro("sobrou texto no final");
  return resultado;
}

function avaliarNo(no: No, resolver: Resolvedor): number {
  switch (no.tipo) {
    case "numero":
      return no.valor;
    case "nome":
      return resolver(no.nome);
    case "unario": {
      const valor = avaliarNo(no.operando, resolver);
      return no.operador === "-" ? -valor : valor;
    }
    case "binario": {
      const a = avaliarNo(no.esquerda, resolver);
      const b = avaliarNo(no.direita, resolver);
      if (no.operador === "+") return a + b;
      if (no.operador === "-") return a - b;
      if (no.operador === "*") return a * b;
      if (b === 0) throw new Error("Divisão por zero em uma fórmula.");
      return a / b;
    }
    case "chamada": {
      const funcao = FUNCOES.get(no.funcao);
      if (!funcao) throw new Error(`Função desconhecida na fórmula: ${no.funcao}`);
      const quantidade = no.argumentos.length;
      if (quantidade < funcao.minimo || quantidade > funcao.maximo) {
        throw new Error(`Quantidade de argumentos inválida em ${no.funcao}().`);
      }
      return funcao.executar(no.argumentos.map((argumento) => avaliarNo(argumento, resolver)));
    }
  }
}

const cache = new Map<string, No>();

/** Calcula uma fórmula. O resolvedor devolve o valor de cada nome citado nela. */
export function avaliar(formula: string, resolver: Resolvedor): number {
  let arvore = cache.get(formula);
  if (!arvore) {
    arvore = analisar(formula);
    cache.set(formula, arvore);
  }
  const resultado = avaliarNo(arvore, resolver);
  if (!Number.isFinite(resultado)) throw new Error(`A fórmula não deu um número válido: ${formula}`);
  return resultado;
}

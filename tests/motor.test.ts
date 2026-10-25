// Testes do motor de regras. Rodam antes de cada compilação (npm run build).
import test from "node:test";
import assert from "node:assert/strict";

import { avaliar } from "../src/engine/formulas/avaliar";
import { calcularTudo } from "../src/engine/rules/calcular";
import type { DefinicaoSistema } from "../src/engine/rules/tipos";
import { dnd5e2014 } from "../src/systems/dnd5e/2014/definicao";
import { dadosVazios } from "../src/systems/dnd5e/2014/dados";
import { aplicarCura, aplicarDano } from "../src/systems/dnd5e/2014/vida";

const semNomes = () => {
  throw new Error("não deveria resolver nomes");
};

test("fórmulas: precedência e parênteses", () => {
  assert.equal(avaliar("2 + 3 * 4", semNomes), 14);
  assert.equal(avaliar("(2 + 3) * 4", semNomes), 20);
  assert.equal(avaliar("10 - 2 - 3", semNomes), 5);
  assert.equal(avaliar("8 / 2 / 2", semNomes), 2);
  assert.equal(avaliar("-3 + 5", semNomes), 2);
  assert.equal(avaliar("2 * -3", semNomes), -6);
});

test("fórmulas: funções", () => {
  assert.equal(avaliar("floor(7 / 2)", semNomes), 3);
  assert.equal(avaliar("floor(-1 / 2)", semNomes), -1);
  assert.equal(avaliar("ceil(7 / 2)", semNomes), 4);
  assert.equal(avaliar("round(2.5)", semNomes), 3);
  assert.equal(avaliar("abs(-4)", semNomes), 4);
  assert.equal(avaliar("min(3, 1, 2)", semNomes), 1);
  assert.equal(avaliar("max(3, 1, 2)", semNomes), 3);
});

test("fórmulas: nomes com ponto", () => {
  const valores: Record<string, number> = { "atributos.for": 16, nivel: 5 };
  const resolver = (n: string) => {
    if (!(n in valores)) throw new Error(`sem ${n}`);
    return valores[n];
  };
  assert.equal(avaliar("floor((atributos.for - 10) / 2) + nivel", resolver), 8);
});

test("fórmulas: erros claros", () => {
  assert.throws(() => avaliar("2 +", semNomes), /Fórmula inválida/);
  assert.throws(() => avaliar("2 $ 3", semNomes), /Caractere inválido/);
  assert.throws(() => avaliar("(2 + 3", semNomes), /Fórmula inválida/);
  assert.throws(() => avaliar("2 3", semNomes), /Fórmula inválida/);
  assert.throws(() => avaliar("1 / 0", semNomes), /Divisão por zero/);
  assert.throws(() => avaliar("foo(1)", semNomes), /Função desconhecida/);
  assert.throws(() => avaliar("floor(1, 2)", semNomes), /argumentos/);
  assert.throws(() => avaliar("eval(1)", semNomes), /Função desconhecida/);
});

test("D&D: modificadores de atributo", () => {
  const esperados: Array<[number, number]> = [
    [1, -5], [8, -1], [9, -1], [10, 0], [11, 0], [12, 1], [15, 2], [16, 3], [20, 5], [30, 10],
  ];
  for (const [valor, mod] of esperados) {
    const dados = dadosVazios();
    dados.atributos.for = valor;
    assert.equal(calcularTudo(dnd5e2014, dados)["mod.for"].efetivo, mod, `valor ${valor}`);
  }
});

test("D&D: bônus de proficiência por nível", () => {
  const esperados: Array<[number, number]> = [
    [1, 2], [4, 2], [5, 3], [8, 3], [9, 4], [12, 4], [13, 5], [16, 5], [17, 6], [20, 6],
  ];
  for (const [nivel, bonus] of esperados) {
    const dados = dadosVazios();
    dados.nivel = nivel;
    assert.equal(calcularTudo(dnd5e2014, dados).bonusProficiencia.efetivo, bonus, `nível ${nivel}`);
  }
});

test("D&D: perícias e resistências com proficiência", () => {
  const dados = dadosVazios();
  dados.nivel = 5; // bônus +3
  dados.atributos.des = 16; // +3
  dados.atributos.sab = 14; // +2

  let r = calcularTudo(dnd5e2014, dados);
  assert.equal(r["pericia.acrobacia"].efetivo, 3);
  assert.equal(r["pericia.percepcao"].efetivo, 2);
  assert.equal(r["resistencia.des"].efetivo, 3);

  dados.proficiencia.pericias.acrobacia = 1;
  dados.proficiencia.pericias.percepcao = 2;
  dados.proficiencia.resistencias.des = 1;
  r = calcularTudo(dnd5e2014, dados);
  assert.equal(r["pericia.acrobacia"].efetivo, 6);
  assert.equal(r["pericia.percepcao"].efetivo, 8);
  assert.equal(r["resistencia.des"].efetivo, 6);
  assert.equal(r.percepcaoPassiva.efetivo, 18);
});

test("D&D: CA e iniciativa padrão", () => {
  const dados = dadosVazios();
  dados.atributos.des = 14; // +2
  const r = calcularTudo(dnd5e2014, dados);
  assert.equal(r.ca.efetivo, 12);
  assert.equal(r.iniciativa.efetivo, 2);
  assert.equal(r.ca.sobrescrito, false);
});

test("override: vale no lugar do calculado e os dependentes usam o valor trocado", () => {
  const dados = dadosVazios();
  dados.atributos.des = 14; // +2

  dados.sobrescritas.ca = 18;
  let r = calcularTudo(dnd5e2014, dados);
  assert.equal(r.ca.calculado, 12);
  assert.equal(r.ca.efetivo, 18);
  assert.equal(r.ca.sobrescrito, true);

  // trocar o modificador de DES muda tudo que depende dele
  delete dados.sobrescritas.ca;
  dados.sobrescritas["mod.des"] = 5;
  r = calcularTudo(dnd5e2014, dados);
  assert.equal(r["mod.des"].calculado, 2);
  assert.equal(r["mod.des"].efetivo, 5);
  assert.equal(r.ca.efetivo, 15);
  assert.equal(r.iniciativa.efetivo, 5);
  assert.equal(r["pericia.acrobacia"].efetivo, 5);

  // voltar ao automático
  delete dados.sobrescritas["mod.des"];
  r = calcularTudo(dnd5e2014, dados);
  assert.equal(r.ca.efetivo, 12);
});

test("override: chaves desconhecidas e valores inválidos são ignorados", () => {
  const dados = dadosVazios();
  (dados.sobrescritas as Record<string, unknown>)["nao.existe"] = 7;
  (dados.sobrescritas as Record<string, unknown>).ca = "abc";
  const r = calcularTudo(dnd5e2014, dados);
  assert.equal(r.ca.sobrescrito, false);
  assert.equal(r.ca.efetivo, 10);
});

test("motor: fórmulas em círculo dão erro claro", () => {
  const circular: DefinicaoSistema = {
    id: "teste",
    versao: "1",
    nome: "Teste",
    atributos: [],
    pericias: [],
    calculados: [
      { chave: "a", nome: "A", formula: "b + 1" },
      { chave: "b", nome: "B", formula: "a + 1" },
    ],
  };
  assert.throws(() => calcularTudo(circular, {}), /círculo/);
});

test("motor: valor ausente na ficha dá erro claro", () => {
  assert.throws(() => calcularTudo(dnd5e2014, { sobrescritas: {} }), /não encontrado/);
});

test("D&D: dano gasta PV temporários primeiro", () => {
  const v = aplicarDano({ atual: 20, maximo: 30, temporario: 5 }, 8);
  assert.deepEqual(v, { atual: 17, maximo: 30, temporario: 0 });
  assert.deepEqual(aplicarDano({ atual: 20, maximo: 30, temporario: 5 }, 3), {
    atual: 20,
    maximo: 30,
    temporario: 2,
  });
});

test("D&D: dano nunca deixa PV abaixo de zero", () => {
  assert.equal(aplicarDano({ atual: 4, maximo: 30, temporario: 0 }, 50).atual, 0);
  assert.equal(aplicarDano({ atual: 4, maximo: 30, temporario: 0 }, -5).atual, 4);
});

test("D&D: cura não passa do máximo", () => {
  assert.equal(aplicarCura({ atual: 25, maximo: 30, temporario: 0 }, 10).atual, 30);
  assert.equal(aplicarCura({ atual: 35, maximo: 30, temporario: 0 }, 10).atual, 35);
  assert.equal(aplicarCura({ atual: 10, maximo: 30, temporario: 0 }, 5).atual, 15);
});

// ---------- Leitura de fichas ----------
import { criarFichaVazia, normalizarFicha, idValido } from "../src/data/ficha";

test("ficha: criar em branco e reler dá o mesmo resultado", () => {
  const f = criarFichaVazia({ nome: "  Aria  ", versaoRegras: "2014", multiclasse: true });
  assert.equal(f.nome, "Aria");
  assert.equal(f.regrasDaMesa.multiclasse, true);
  const lida = normalizarFicha(JSON.parse(JSON.stringify(f)), f.id);
  assert.deepEqual(lida, f);
});

test("ficha: arquivos incompletos ou estranhos são completados com o padrão", () => {
  const lida = normalizarFicha(
    { nome: 5, dados: { nivel: 99, atributos: { for: "x", des: 40 }, vida: { atual: -3 } } },
    "abcdef123456",
  );
  assert.equal(lida.id, "abcdef123456");
  assert.equal(lida.nome, "Sem nome");
  assert.equal(lida.dados.nivel, 20);
  assert.equal(lida.dados.atributos.for, 10);
  assert.equal(lida.dados.atributos.des, 30);
  assert.equal(lida.dados.vida.atual, 0);
  // o motor consegue calcular qualquer ficha normalizada
  assert.doesNotThrow(() => calcularTudo(dnd5e2014, lida.dados));
});

test("ficha: o que não é ficha é recusado", () => {
  assert.throws(() => normalizarFicha(null, "abcdef123456"), /não contém uma ficha/);
  assert.throws(() => normalizarFicha([1, 2], "abcdef123456"), /não contém uma ficha/);
  assert.throws(() => normalizarFicha("texto", "abcdef123456"), /não contém uma ficha/);
});

test("ficha: sobrescritas inválidas são descartadas", () => {
  const lida = normalizarFicha(
    { dados: { sobrescritas: { ca: 17, mod: "x", nada: null } } },
    "abcdef123456",
  );
  assert.deepEqual(lida.dados.sobrescritas, { ca: 17 });
});

test("ficha: validação de identificação", () => {
  assert.equal(idValido("abcdef123456"), true);
  assert.equal(idValido("../x"), false);
  assert.equal(idValido("a/b"), false);
  assert.equal(idValido("curto"), false);
});

// ---------- Aba Personagem / Habilidades e proficiências ----------
test("ficha: campos novos existem em fichas em branco", () => {
  const f = criarFichaVazia({ nome: "Aria", versaoRegras: "2014", multiclasse: false });
  assert.equal(f.temRetrato, false);
  assert.equal(f.dados.personagem.historia, "");
  assert.deepEqual(f.dados.outrasProficiencias, { armas: [], armaduras: [], ferramentas: [] });
  assert.deepEqual(f.dados.idiomas, []);
  assert.deepEqual(f.dados.habilidades, []);
});

test("ficha: fichas antigas (sem os campos novos) continuam abrindo", () => {
  const lida = normalizarFicha({ nome: "Antiga", dados: { nivel: 3 } }, "abcdef123456");
  assert.equal(lida.temRetrato, false);
  assert.equal(lida.dados.personagem.tesouros, "");
  assert.deepEqual(lida.dados.idiomas, []);
  assert.deepEqual(lida.dados.habilidades, []);
});

test("ficha: listas de proficiências e idiomas são limpas", () => {
  const lida = normalizarFicha(
    {
      dados: {
        idiomas: ["Comum", " comum ", "", "Élfico", 7, null],
        outrasProficiencias: { armas: ["Espadas longas", "espadas longas"], armaduras: "x", ferramentas: ["Alaúde"] },
      },
    },
    "abcdef123456",
  );
  assert.deepEqual(lida.dados.idiomas, ["Comum", "Élfico"]);
  assert.deepEqual(lida.dados.outrasProficiencias.armas, ["Espadas longas"]);
  assert.deepEqual(lida.dados.outrasProficiencias.armaduras, []);
  assert.deepEqual(lida.dados.outrasProficiencias.ferramentas, ["Alaúde"]);
});

test("ficha: habilidades recebem identificação e textos válidos", () => {
  const lida = normalizarFicha(
    {
      dados: {
        habilidades: [
          { id: "h1", nome: "Visão no Escuro", origem: "Raça", descricao: "Enxerga no escuro." },
          { id: "h1", nome: "Repetida" },
          { nome: 5 },
          "texto solto",
          null,
        ],
      },
    },
    "abcdef123456",
  );
  assert.equal(lida.dados.habilidades.length, 3);
  assert.equal(lida.dados.habilidades[0].nome, "Visão no Escuro");
  assert.equal(lida.dados.habilidades[2].nome, "");
  const ids = new Set(lida.dados.habilidades.map((h) => h.id));
  assert.equal(ids.size, 3, "identificações precisam ser únicas");
});

test("ficha: temRetrato só vale se for verdadeiro de fato", () => {
  assert.equal(normalizarFicha({ temRetrato: true }, "abcdef123456").temRetrato, true);
  assert.equal(normalizarFicha({ temRetrato: "sim" }, "abcdef123456").temRetrato, false);
});

// ---------- Rolador de dados ----------
import { dobrarDados, executar, formatar, formulaDeTeste, interpretar, sortearPadrao } from "../src/engine/dados/rolar";
import { normalizarHistorico } from "../src/engine/dados/historico";

// Sorteador de teste: devolve os números de uma lista, na ordem.
function sequencia(...valores: number[]) {
  let i = 0;
  return (lados: number) => {
    const v = valores[i++];
    if (v === undefined) throw new Error("faltaram números no sorteador de teste");
    assert.ok(v >= 1 && v <= lados, `valor ${v} fora de 1..${lados}`);
    return v;
  };
}

test("dados: leitura de fórmulas", () => {
  assert.equal(formatar(interpretar("2d8+3")), "2d8+3");
  assert.equal(formatar(interpretar(" 1D20 - 2 ")), "1d20-2");
  assert.equal(formatar(interpretar("d6")), "1d6");
  assert.equal(formatar(interpretar("2d6+1d4+3")), "2d6+1d4+3");
  assert.equal(formatar(interpretar("-1d4+10")), "-1d4+10");
  assert.equal(formatar(interpretar("5")), "5");
});

test("dados: fórmulas inválidas dão mensagem clara", () => {
  for (const ruim of ["", "   ", "abc", "2d", "d", "2d6+", "2d6++3", "2x6", "1d20 +* 3", "2d6 3", "0d6", "101d6", "1d1", "1d1001", "1d20;"]) {
    assert.throws(() => interpretar(ruim), Error, `deveria recusar "${ruim}"`);
  }
  assert.throws(() => interpretar("0d6"), /1 a 100 dados/);
  assert.throws(() => interpretar("1d1001"), /2 a 1000 lados/);
  assert.throws(() => interpretar(""), /Digite uma fórmula/);
  assert.throws(() => interpretar("2d6 3"), /Falta um \+ ou -/);
});

test("dados: rolagem simples soma dados e números fixos", () => {
  const r = executar(interpretar("2d8+3"), { sortear: sequencia(5, 7) });
  assert.equal(r.total, 15);
  assert.equal(r.modificador, 3);
  assert.deepEqual(r.grupos[0].resultados, [5, 7]);
  assert.equal(r.formula, "2d8+3");
});

test("dados: termos negativos subtraem", () => {
  const r = executar(interpretar("1d20-2"), { sortear: sequencia(10) });
  assert.equal(r.total, 8);
  assert.equal(r.modificador, -2);
  const r2 = executar(interpretar("2d6-1d4"), { sortear: sequencia(6, 5, 3) });
  assert.equal(r2.total, 8);
});

test("dados: vantagem fica com o maior e desvantagem com o menor", () => {
  const v = executar(interpretar("1d20+5"), { modo: "vantagem", sortear: sequencia(8, 15) });
  assert.equal(v.modo, "vantagem");
  assert.deepEqual(v.grupos[0].resultados, [15]);
  assert.deepEqual(v.grupos[0].descartados, [8]);
  assert.equal(v.total, 20);

  const d = executar(interpretar("1d20+5"), { modo: "desvantagem", sortear: sequencia(8, 15) });
  assert.deepEqual(d.grupos[0].resultados, [8]);
  assert.deepEqual(d.grupos[0].descartados, [15]);
  assert.equal(d.total, 13);
});

test("dados: vantagem só vale para 1d20", () => {
  const r = executar(interpretar("2d6+3"), { modo: "vantagem", sortear: sequencia(2, 4) });
  assert.equal(r.modo, "normal");
  assert.equal(r.total, 9);
  assert.deepEqual(r.grupos[0].descartados, []);
  const r2 = executar(interpretar("2d20"), { modo: "vantagem", sortear: sequencia(2, 4) });
  assert.equal(r2.modo, "normal");
});

test("dados: 20 e 1 naturais", () => {
  assert.equal(executar(interpretar("1d20+5"), { sortear: sequencia(20) }).natural, 20);
  assert.equal(executar(interpretar("1d20+5"), { sortear: sequencia(1) }).natural, 1);
  assert.equal(executar(interpretar("1d20+5"), { sortear: sequencia(13) }).natural, null);
  // com vantagem vale o dado que ficou
  assert.equal(executar(interpretar("1d20"), { modo: "vantagem", sortear: sequencia(1, 20) }).natural, 20);
  assert.equal(executar(interpretar("1d20"), { modo: "vantagem", sortear: sequencia(1, 5) }).natural, null);
  assert.equal(executar(interpretar("1d20"), { modo: "desvantagem", sortear: sequencia(1, 20) }).natural, 1);
  // sem 1d20 não há natural
  assert.equal(executar(interpretar("1d8"), { sortear: sequencia(8) }).natural, null);
});

test("dados: dano crítico dobra só os dados", () => {
  assert.equal(formatar(dobrarDados(interpretar("1d8+3"))), "2d8+3");
  assert.equal(formatar(dobrarDados(interpretar("2d6+1d4+2"))), "4d6+2d4+2");
  assert.equal(formatar(dobrarDados(interpretar("1d8-1d4"))), "2d8-1d4");
  assert.equal(formatar(dobrarDados(interpretar("80d6"))), "100d6");
});

test("dados: fórmula de teste com modificador", () => {
  assert.equal(formulaDeTeste(5), "1d20+5");
  assert.equal(formulaDeTeste(-2), "1d20-2");
  assert.equal(formulaDeTeste(0), "1d20");
  assert.equal(formulaDeTeste(3.9), "1d20+3");
});

test("dados: sorteio padrão fica dentro dos limites e usa todas as faces", () => {
  const vistos = new Set<number>();
  for (let i = 0; i < 1000; i++) {
    const n = sortearPadrao(6);
    assert.ok(Number.isInteger(n) && n >= 1 && n <= 6);
    vistos.add(n);
  }
  assert.equal(vistos.size, 6);
  for (let i = 0; i < 200; i++) {
    const n = sortearPadrao(100);
    assert.ok(n >= 1 && n <= 100);
  }
});

test("dados: histórico lido de arquivo descarta o que está quebrado", () => {
  const bom = executar(interpretar("1d20+5"), { sortear: sequencia(9) });
  const lido = normalizarHistorico({
    itens: [
      { id: "a", quando: "2026-10-24T10:00:00.000Z", nome: "Furtividade", origem: "Aria", resultado: bom },
      { id: "a", quando: "x", resultado: bom },
      { id: "b", quando: "x", nome: "sem resultado" },
      { id: "c", quando: "x", resultado: { formula: 1, total: "x" } },
      "texto",
      null,
    ],
  });
  assert.equal(lido.length, 1);
  assert.equal(lido[0].nome, "Furtividade");
  assert.equal(lido[0].resultado.total, 14);
  assert.deepEqual(normalizarHistorico(null), []);
  assert.deepEqual(normalizarHistorico({ itens: 5 }), []);
});

test("ficha: ataques são lidos com valores seguros", () => {
  const lida = normalizarFicha(
    {
      dados: {
        ataques: [
          { id: "a1", nome: "Espada longa", bonus: 5, dano: "1d8+3", tipoDano: "cortante" },
          { id: "a1", nome: "Id repetido", bonus: 999, dano: 7 },
          { nome: 3 },
          null,
          "x",
        ],
      },
    },
    "abcdef123456",
  );
  assert.equal(lida.dados.ataques.length, 3);
  assert.equal(lida.dados.ataques[0].dano, "1d8+3");
  assert.equal(lida.dados.ataques[1].bonus, 50);
  assert.equal(lida.dados.ataques[1].dano, "");
  assert.equal(new Set(lida.dados.ataques.map((a) => a.id)).size, 3);
  assert.deepEqual(criarFichaVazia({ nome: "A", versaoRegras: "2014", multiclasse: false }).dados.ataques, []);
});

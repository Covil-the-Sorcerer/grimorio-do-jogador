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

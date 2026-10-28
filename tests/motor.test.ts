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

// ---------- CA sem armadura e regras novas ----------
import { permiteEspecializacao } from "../src/systems/dnd5e/2014/especializacao";

test("D&D: CA de Bárbaro, Monge e Linhagem Dracônica sem armadura", () => {
  const d = dadosVazios();
  d.atributos.des = 14; // +2
  d.atributos.con = 16; // +3
  d.atributos.sab = 12; // +1
  assert.equal(calcularTudo(dnd5e2014, d).ca.efetivo, 12);
  d.defesaSemArmadura.barbaro = 1;
  assert.equal(calcularTudo(dnd5e2014, d).ca.efetivo, 15);
  d.defesaSemArmadura.barbaro = 0;
  d.defesaSemArmadura.monge = 1;
  assert.equal(calcularTudo(dnd5e2014, d).ca.efetivo, 13);
  d.defesaSemArmadura.monge = 0;
  d.defesaSemArmadura.draconico = 1;
  assert.equal(calcularTudo(dnd5e2014, d).ca.efetivo, 15); // 13 + DES
  d.sobrescritas.ca = 20;
  assert.equal(calcularTudo(dnd5e2014, d).ca.efetivo, 20);
});

test("ficha: deslocamento aceita meio ponto e campos novos têm padrão", () => {
  const lida = normalizarFicha({ dados: { deslocamento: 7.5 } }, "abcdef123456");
  assert.equal(lida.dados.deslocamento, 7.5);
  assert.equal(normalizarFicha({ dados: { deslocamento: 7.26 } }, "abcdef123456").dados.deslocamento, 7.5);
  assert.equal(normalizarFicha({ dados: { deslocamento: "x" } }, "abcdef123456").dados.deslocamento, 9);
  assert.deepEqual(lida.dados.defesaSemArmadura, { barbaro: 0, monge: 0, draconico: 0 });
  assert.equal(lida.dados.origem.classeId, "");
  assert.equal(normalizarFicha({ dados: { defesaSemArmadura: { barbaro: 5 } } }, "abcdef123456").dados.defesaSemArmadura.barbaro, 1);
});

test("D&D: especialização só para Bardo e Ladino", () => {
  const d = dadosVazios();
  assert.equal(permiteEspecializacao(d), false);
  d.classe = "Guerreiro";
  assert.equal(permiteEspecializacao(d), false);
  d.classe = "Ladino";
  assert.equal(permiteEspecializacao(d), true);
  d.classe = "  bardo ";
  assert.equal(permiteEspecializacao(d), true);
  d.classe = "Ladina";
  assert.equal(permiteEspecializacao(d), true);
  d.classe = "Rogue";
  assert.equal(permiteEspecializacao(d), true);
  d.classe = "Bardoso";
  assert.equal(permiteEspecializacao(d), false);
  d.classe = "Guerreiro";
  d.origem.classeId = "ladino";
  assert.equal(permiteEspecializacao(d), true);
});

// ---------- Criação guiada ----------
import {
  PERSONALIZADA,
  atributosFinais,
  escolhasIniciais,
  gruposDePericias,
  montarFicha,
  periciasBloqueadas,
  periciasConcedidas,
  periciasProficientes,
  previa,
  problemasDoPasso,
  trocarClasse,
  trocarRaca,
  type EscolhasCriacao,
} from "../src/systems/dnd5e/2014/criacao";
import { RACAS_SRD } from "../src/systems/dnd5e/2014/srd/racas";
import { CLASSES_SRD } from "../src/systems/dnd5e/2014/srd/classes";
import { ANTECEDENTES_SRD } from "../src/systems/dnd5e/2014/srd/antecedentes";
import { ANCESTRAIS_DRACONICOS, ESTILOS_DE_LUTA, IDIOMAS_PADRAO } from "../src/systems/dnd5e/2014/srd/geral";

let contadorDeIds = 0;
const idsDeTeste = () => `id-de-teste-${++contadorDeIds}`;

function guerreiroAnaoDaColina(): EscolhasCriacao {
  let e = escolhasIniciais();
  e.nome = "Thorin";
  e = trocarRaca(e, "anao");
  e.subRacaId = "anaoColina";
  e.ferramentaRaca = "Ferramentas de pedreiro";
  e = trocarClasse(e, "guerreiro");
  e.estiloDeLutaId = "defesa";
  e.periciasClasse = ["atletismo", "percepcao"];
  e.antecedenteId = "acolito";
  e.idiomasAntecedente = ["Élfico", "Gigante"];
  e.atributosBase = { for: 15, des: 12, con: 14, int: 8, sab: 10, car: 10 };
  return e;
}

test("criação: os dados do SRD estão consistentes", () => {
  const atributos = new Set(dnd5e2014.atributos.map((a) => a.id));
  const pericias = new Set(dnd5e2014.pericias.map((p) => p.id));
  const ids = new Set<string>();
  for (const r of RACAS_SRD) {
    assert.ok(!ids.has(r.id), `raça repetida ${r.id}`);
    ids.add(r.id);
    for (const id of Object.keys(r.bonusAtributos)) assert.ok(atributos.has(id), `${r.nome}: atributo ${id}`);
    for (const id of r.periciasFixas) assert.ok(pericias.has(id), `${r.nome}: perícia ${id}`);
    assert.ok(r.deslocamento > 0 && r.deslocamento * 2 === Math.round(r.deslocamento * 2), `${r.nome}: deslocamento`);
    for (const s of r.subRacas) {
      assert.ok(!ids.has(s.id), `sub-raça repetida ${s.id}`);
      ids.add(s.id);
      for (const id of Object.keys(s.bonusAtributos)) assert.ok(atributos.has(id), `${s.nome}: atributo ${id}`);
    }
    for (const i of r.idiomas) assert.ok(IDIOMAS_PADRAO.includes(i), `${r.nome}: idioma ${i}`);
  }
  assert.equal(RACAS_SRD.length, 9);
  const classes = new Set<string>();
  for (const c of CLASSES_SRD) {
    assert.ok(!classes.has(c.id), `classe repetida ${c.id}`);
    classes.add(c.id);
    assert.ok([6, 8, 10, 12].includes(c.dadoDeVida), `${c.nome}: dado de vida`);
    assert.equal(c.resistencias.length, 2, `${c.nome}: resistências`);
    for (const id of c.resistencias) assert.ok(atributos.has(id), `${c.nome}: resistência ${id}`);
    for (const id of c.opcoesPericias) assert.ok(pericias.has(id), `${c.nome}: perícia ${id}`);
    if (c.opcoesPericias.length > 0) {
      assert.ok(c.opcoesPericias.length >= c.quantidadePericias, `${c.nome}: poucas opções de perícia`);
    }
    assert.ok(c.tracos.length > 0, `${c.nome}: sem características`);
  }
  assert.equal(CLASSES_SRD.length, 12);
  for (const a of ANTECEDENTES_SRD) for (const id of a.pericias) assert.ok(pericias.has(id));
  assert.equal(ANCESTRAIS_DRACONICOS.length, 10);
  assert.equal(ESTILOS_DE_LUTA.length, 6);
});

test("criação: Anão da Colina Guerreiro Acólito", () => {
  const esc = guerreiroAnaoDaColina();
  assert.deepEqual(problemasDoPasso("revisao", esc), []);
  const final = atributosFinais(esc);
  assert.equal(final.con, 16); // 14 + 2
  assert.equal(final.sab, 11); // 10 + 1
  assert.equal(final.for, 15);

  const f = montarFicha(esc, idsDeTeste);
  assert.equal(f.nome, "Thorin");
  assert.equal(f.dados.raca, "Anão da Colina");
  assert.equal(f.dados.classe, "Guerreiro");
  assert.equal(f.dados.antecedente, "Acólito");
  assert.equal(f.dados.nivel, 1);
  assert.equal(f.dados.deslocamento, 7.5);
  // PV: d10 + CON (+3) + Tenacidade Anã (+1)
  assert.equal(f.dados.vida.maximo, 14);
  assert.equal(f.dados.vida.atual, 14);
  assert.equal(f.dados.proficiencia.resistencias.for, 1);
  assert.equal(f.dados.proficiencia.resistencias.con, 1);
  assert.equal(f.dados.proficiencia.resistencias.des, 0);
  for (const id of ["atletismo", "percepcao", "intuicao", "religiao"]) assert.equal(f.dados.proficiencia.pericias[id], 1, id);
  assert.equal(f.dados.proficiencia.pericias.furtividade, 0);
  assert.ok(f.dados.outrasProficiencias.armaduras.includes("Armaduras pesadas"));
  assert.ok(f.dados.outrasProficiencias.armas.includes("Machados de batalha"));
  assert.ok(f.dados.outrasProficiencias.ferramentas.includes("Ferramentas de pedreiro"));
  assert.deepEqual(f.dados.idiomas, ["Comum", "Anão", "Élfico", "Gigante"]);
  const nomes = f.dados.habilidades.map((h) => h.nome);
  for (const esperado of ["Visão no Escuro", "Tenacidade Anã", "Retomar o Fôlego", "Estilo de Luta: Defesa", "Abrigo dos Fiéis"]) {
    assert.ok(nomes.includes(esperado), `faltou ${esperado}`);
  }
  assert.equal(new Set(f.dados.habilidades.map((h) => h.id)).size, f.dados.habilidades.length);
  assert.equal(f.dados.origem.classeId, "guerreiro");
  // a ficha montada é válida para o motor e para a leitura
  const lida = normalizarFicha({ ...f, id: "x", dados: f.dados }, "abcdef123456");
  assert.doesNotThrow(() => calcularTudo(dnd5e2014, lida.dados));
  assert.equal(calcularTudo(dnd5e2014, f.dados).ca.efetivo, 11); // 10 + DES(+1)
});

test("criação: Bárbaro tem a CA sem armadura correta", () => {
  let e = escolhasIniciais();
  e = trocarRaca(e, "humano");
  e.idiomasRaca = ["Orc"];
  e = trocarClasse(e, "barbaro");
  e.periciasClasse = ["atletismo", "sobrevivencia"];
  e.antecedenteId = "acolito";
  e.idiomasAntecedente = ["Anão", "Goblin"];
  e.atributosBase = { for: 15, des: 14, con: 15, int: 8, sab: 10, car: 8 };
  assert.deepEqual(problemasDoPasso("revisao", e), []);
  const f = montarFicha(e, idsDeTeste);
  assert.equal(f.dados.defesaSemArmadura.barbaro, 1);
  // humano +1 em tudo: DES 15 (+2), CON 16 (+3) => 10 + 2 + 3 = 15
  assert.equal(calcularTudo(dnd5e2014, f.dados).ca.efetivo, 15);
  // PV: d12 + CON(+3) = 15
  assert.equal(f.dados.vida.maximo, 15);
});

test("criação: Meio-Elfo Ladino com especialização e bônus livres", () => {
  let e = escolhasIniciais();
  e = trocarRaca(e, "meioElfo");
  e.bonusLivres = ["des", "con"];
  e.idiomasRaca = ["Anão"];
  e.periciasRaca = ["persuasao", "enganacao"];
  e = trocarClasse(e, "ladino");
  e.periciasClasse = ["furtividade", "prestidigitacao", "acrobacia", "investigacao"];
  e.especializacao = ["furtividade", "persuasao"];
  e.antecedenteId = "acolito";
  e.idiomasAntecedente = ["Gnômico", "Halfling"];
  e.atributosBase = { for: 8, des: 15, con: 13, int: 12, sab: 10, car: 14 };
  assert.deepEqual(problemasDoPasso("revisao", e), []);
  const final = atributosFinais(e);
  assert.equal(final.car, 16);
  assert.equal(final.des, 16);
  assert.equal(final.con, 14);
  const f = montarFicha(e, idsDeTeste);
  assert.equal(f.dados.proficiencia.pericias.furtividade, 2);
  assert.equal(f.dados.proficiencia.pericias.persuasao, 2);
  assert.equal(f.dados.proficiencia.pericias.acrobacia, 1);
  assert.ok(f.dados.idiomas.includes("Gíria de Ladrão"));
  assert.equal(f.dados.vida.maximo, 8 + 2);
  // furtividade com especialização: DES +3 e bônus 2*2
  assert.equal(calcularTudo(dnd5e2014, f.dados)["pericia.furtividade"].efetivo, 3 + 4);
});

test("criação: Draconato Feiticeiro (Linhagem Dracônica)", () => {
  let e = escolhasIniciais();
  e = trocarRaca(e, "draconato");
  e.ancestralId = "azul";
  e = trocarClasse(e, "feiticeiro");
  e.subclasseId = "linhagemDraconica";
  e.periciasClasse = ["arcanismo", "persuasao"];
  e.antecedenteId = "acolito";
  e.idiomasAntecedente = ["Silvestre", "Primordial"];
  e.atributosBase = { for: 8, des: 14, con: 14, int: 10, sab: 10, car: 15 };
  assert.deepEqual(problemasDoPasso("revisao", e), []);
  const f = montarFicha(e, idsDeTeste);
  assert.equal(f.dados.raca, "Draconato (Azul)");
  assert.equal(f.dados.defesaSemArmadura.draconico, 1);
  // PV: d6 + CON(+2) + Resiliência Dracônica(+1)
  assert.equal(f.dados.vida.maximo, 6 + 2 + 1);
  // CA: 13 + DES(+2)
  assert.equal(calcularTudo(dnd5e2014, f.dados).ca.efetivo, 15);
  const sopro = f.dados.habilidades.find((h) => h.nome === "Arma de Sopro");
  assert.ok(sopro && sopro.descricao.includes("relâmpago") && sopro.descricao.includes("Destreza"));
  assert.ok(f.dados.idiomas.includes("Dracônico"));
  assert.equal(previa(e).vidaMaxima, 9);
});

test("criação: perguntas obrigatórias aparecem como problemas", () => {
  const e = escolhasIniciais();
  assert.deepEqual(problemasDoPasso("nome", e), []);
  assert.deepEqual(problemasDoPasso("raca", e), ["Escolha uma raça."]);
  assert.deepEqual(problemasDoPasso("classe", e), ["Escolha uma classe."]);
  assert.deepEqual(problemasDoPasso("antecedente", e), ["Escolha um antecedente."]);
  assert.ok(problemasDoPasso("revisao", e).length >= 3);

  let r = trocarRaca(e, "elfo");
  assert.ok(problemasDoPasso("raca", r).some((p) => p.includes("sub-raça")));
  r.subRacaId = "altoElfo";
  assert.ok(problemasDoPasso("raca", r).some((p) => p.includes("idioma")));
  r.idiomasRaca = ["Anão"];
  assert.deepEqual(problemasDoPasso("raca", r), []);

  let m = trocarRaca(e, "meioElfo");
  assert.ok(problemasDoPasso("raca", m).some((p) => p.includes("atributos diferentes")));
  m.bonusLivres = ["car", "des"]; // Carisma não vale (já recebe +2)
  assert.ok(problemasDoPasso("raca", m).some((p) => p.includes("atributos diferentes")));
  m.bonusLivres = ["des", "des"];
  assert.ok(problemasDoPasso("raca", m).some((p) => p.includes("atributos diferentes")));

  let c = trocarClasse(e, "clerigo");
  assert.ok(problemasDoPasso("classe", c).some((p) => p.includes("Domínio Divino")));
  c.subclasseId = PERSONALIZADA;
  assert.ok(problemasDoPasso("classe", c).some((p) => p.includes("Dê um nome")));
  c.subclassePersonalizada = "Domínio da Guerra";
  assert.deepEqual(problemasDoPasso("classe", c), []);
  assert.ok(problemasDoPasso("classe", trocarClasse(e, "guerreiro")).some((p) => p.includes("estilo de luta")));
});

test("criação: perícias não podem se repetir entre origens", () => {
  let e = escolhasIniciais();
  e = trocarRaca(e, "elfo"); // Percepção concedida
  e.subRacaId = "altoElfo";
  e = trocarClasse(e, "patrulheiro"); // escolhe 3, a lista inclui Percepção
  e.antecedenteId = "acolito"; // Intuição e Religião
  assert.deepEqual(periciasConcedidas(e).map((p) => p.id).sort(), ["intuicao", "percepcao", "religiao"]);
  const bloqueadas = periciasBloqueadas(e, "classe");
  assert.ok(bloqueadas.has("percepcao") && bloqueadas.has("intuicao"));
  e.periciasClasse = ["atletismo", "natureza", "percepcao"];
  assert.ok(problemasDoPasso("pericias", e).some((p) => p.includes("Percepção não pode")));
  e.periciasClasse = ["atletismo", "natureza", "furtividade"];
  assert.deepEqual(problemasDoPasso("pericias", e), []);
  assert.equal(periciasProficientes(e).length, 6);
  e.periciasClasse = ["atletismo"];
  assert.ok(problemasDoPasso("pericias", e).some((p) => p.includes("escolha 3")));
});

test("criação: trocar de raça ou classe limpa as escolhas dependentes", () => {
  let e = escolhasIniciais();
  e = trocarRaca(e, "meioElfo");
  e.bonusLivres = ["des", "con"];
  e.idiomasRaca = ["Anão"];
  e.periciasRaca = ["persuasao", "enganacao"];
  e = trocarRaca(e, "humano");
  assert.deepEqual(e.bonusLivres, []);
  assert.deepEqual(e.periciasRaca, []);
  assert.deepEqual(e.idiomasRaca, []);
  // as escolhas antigas não vazam para a ficha
  assert.equal(periciasProficientes(e).length, 0);

  e = trocarClasse(e, "ladino");
  e.periciasClasse = ["furtividade", "acrobacia", "atletismo", "percepcao"];
  e.especializacao = ["furtividade", "acrobacia"];
  e = trocarClasse(e, "mago");
  assert.deepEqual(e.periciasClasse, []);
  assert.deepEqual(e.especializacao, []);
  assert.equal(trocarClasse(e, "mago"), e);
});

test("criação: raça, classe e antecedente personalizados", () => {
  let e = escolhasIniciais();
  e = trocarRaca(e, PERSONALIZADA);
  assert.ok(problemasDoPasso("raca", e).some((p) => p.includes("nome")));
  e.racaPersonalizada = {
    nome: "Aasimar",
    deslocamento: 9,
    idiomas: "Comum, Celestial",
    bonus: { for: 0, des: 0, con: 0, int: 0, sab: 1, car: 2 },
    tracos: "Resistência Celestial: resistência a dano necrótico e radiante.",
  };
  assert.deepEqual(problemasDoPasso("raca", e), []);

  e = trocarClasse(e, PERSONALIZADA);
  e.classePersonalizada = { nome: "Artífice", dadoDeVida: 8, resistencias: ["con", "int"], quantidadePericias: 2 };
  assert.deepEqual(problemasDoPasso("classe", e), []);
  e.classePersonalizada.resistencias = ["con", "con"];
  assert.ok(problemasDoPasso("classe", e).some((p) => p.includes("duas resistências")));
  e.classePersonalizada.resistencias = ["con", "int"];
  e.periciasClasse = ["arcanismo", "investigacao"];

  e.antecedenteId = PERSONALIZADA;
  e.antecedentePersonalizado = { nome: "Soldado", pericias: ["atletismo", "intimidacao"] };
  assert.deepEqual(problemasDoPasso("antecedente", e), []);
  assert.equal(gruposDePericias(e).length, 2);
  assert.deepEqual(problemasDoPasso("pericias", e), []);
  e.atributosBase = { for: 10, des: 10, con: 14, int: 15, sab: 10, car: 10 };

  const f = montarFicha(e, idsDeTeste);
  assert.equal(f.dados.raca, "Aasimar");
  assert.equal(f.dados.classe, "Artífice");
  assert.equal(f.dados.antecedente, "Soldado");
  assert.equal(f.dados.atributos.car, 12);
  assert.deepEqual(f.dados.idiomas, ["Comum", "Celestial"]);
  assert.equal(f.dados.vida.maximo, 8 + 2);
  assert.ok(f.dados.habilidades.some((h) => h.nome === "Traços da Raça" && h.origem === "Aasimar"));
  for (const id of ["arcanismo", "investigacao", "atletismo", "intimidacao"]) assert.equal(f.dados.proficiencia.pericias[id], 1);
});

test("criação: atributos fora do limite são recusados e vida mínima é 1", () => {
  const e = guerreiroAnaoDaColina();
  e.atributosBase.for = 25;
  assert.ok(problemasDoPasso("atributos", e).some((p) => p.includes("Força")));
  e.atributosBase.for = 15;
  assert.deepEqual(problemasDoPasso("atributos", e), []);
  let fraco = trocarClasse(escolhasIniciais(), "mago");
  fraco.atributosBase.con = 1; // -5
  assert.equal(previa(fraco).vidaMaxima, 1);
});

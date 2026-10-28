import type { RacaSrd } from "./tipos";

const VISAO_NO_ESCURO = {
  nome: "Visão no Escuro",
  descricao:
    "Você enxerga na penumbra a até 18 m como se fosse luz plena, e no escuro como se fosse penumbra. No escuro, só distingue tons de cinza.",
};

const ANCESTRAL_FEERICO = {
  nome: "Ancestral Feérico",
  descricao: "Você tem vantagem em resistências contra ser enfeitiçado, e magia não pode colocá-lo para dormir.",
};

// Raças do SRD 5.1 (CC-BY-4.0), traduzidas e resumidas. Deslocamentos em metros.
export const RACAS_SRD: RacaSrd[] = [
  {
    id: "anao",
    nome: "Anão",
    descricao: "Resistentes e tradicionais, vivem em fortalezas nas montanhas e são mestres da forja e da pedra.",
    bonusAtributos: { con: 2 },
    bonusLivres: null,
    deslocamento: 7.5,
    idiomas: ["Comum", "Anão"],
    idiomasExtras: 0,
    periciasFixas: [],
    periciasEscolha: 0,
    armasProficientes: ["Machados de batalha", "Machadinhas", "Martelos leves", "Martelos de guerra"],
    ferramentasEscolha: ["Ferramentas de ferreiro", "Suprimentos de cervejeiro", "Ferramentas de pedreiro"],
    tracos: [
      VISAO_NO_ESCURO,
      {
        nome: "Resiliência Anã",
        descricao: "Você tem vantagem em resistências contra veneno e resistência a dano de veneno.",
      },
      {
        nome: "Treinamento Anão em Combate",
        descricao: "Você tem proficiência com machados de batalha, machadinhas, martelos leves e martelos de guerra.",
      },
      {
        nome: "Proficiência com Ferramentas",
        descricao: "Você tem proficiência com uma destas ferramentas de artesão à sua escolha: ferreiro, cervejeiro ou pedreiro.",
      },
      {
        nome: "Especialização em Rochas",
        descricao:
          "Em testes de Inteligência (História) sobre a origem de trabalhos em pedra, você soma o dobro do bônus de proficiência.",
      },
    ],
    subRacas: [
      {
        id: "anaoColina",
        nome: "Anão da Colina",
        descricao: "Sentidos aguçados e grande resistência física.",
        bonusAtributos: { sab: 1 },
        tracos: [
          {
            nome: "Tenacidade Anã",
            descricao: "Seus PV máximos aumentam em 1 e aumentam em 1 a cada nível que você ganhar.",
          },
        ],
        armasProficientes: [],
        ferramentas: [],
        idiomasExtras: 0,
        vidaPorNivel: 1,
      },
    ],
    temAncestralDraconico: false,
  },
  {
    id: "elfo",
    nome: "Elfo",
    descricao: "Graciosos e longevos, ligados à magia e à natureza, com sentidos muito apurados.",
    bonusAtributos: { des: 2 },
    bonusLivres: null,
    deslocamento: 9,
    idiomas: ["Comum", "Élfico"],
    idiomasExtras: 0,
    periciasFixas: ["percepcao"],
    periciasEscolha: 0,
    armasProficientes: [],
    ferramentasEscolha: [],
    tracos: [
      VISAO_NO_ESCURO,
      { nome: "Sentidos Aguçados", descricao: "Você tem proficiência na perícia Percepção." },
      ANCESTRAL_FEERICO,
      {
        nome: "Transe",
        descricao: "Elfos não dormem. Meditam por 4 horas por dia e obtêm os mesmos benefícios de 8 horas de sono.",
      },
    ],
    subRacas: [
      {
        id: "altoElfo",
        nome: "Alto Elfo",
        descricao: "Mente aguçada e domínio básico da magia.",
        bonusAtributos: { int: 1 },
        tracos: [
          {
            nome: "Treinamento Élfico em Armas",
            descricao: "Você tem proficiência com espadas longas, espadas curtas, arcos curtos e arcos longos.",
          },
          {
            nome: "Truque",
            descricao: "Você conhece um truque de mago à sua escolha. Inteligência é seu atributo de conjuração para ele.",
          },
          { nome: "Idioma Extra", descricao: "Você fala, lê e escreve um idioma adicional à sua escolha." },
        ],
        armasProficientes: ["Espadas longas", "Espadas curtas", "Arcos curtos", "Arcos longos"],
        ferramentas: [],
        idiomasExtras: 1,
        vidaPorNivel: 0,
      },
    ],
    temAncestralDraconico: false,
  },
  {
    id: "halfling",
    nome: "Halfling",
    descricao: "Pequenos, alegres e corajosos, apreciam o conforto do lar e têm muita sorte.",
    bonusAtributos: { des: 2 },
    bonusLivres: null,
    deslocamento: 7.5,
    idiomas: ["Comum", "Halfling"],
    idiomasExtras: 0,
    periciasFixas: [],
    periciasEscolha: 0,
    armasProficientes: [],
    ferramentasEscolha: [],
    tracos: [
      {
        nome: "Sortudo",
        descricao: "Ao tirar 1 natural em um ataque, teste de atributo ou resistência, você pode rolar o dado de novo e deve usar o novo resultado.",
      },
      { nome: "Corajoso", descricao: "Você tem vantagem em resistências contra ficar amedrontado." },
      {
        nome: "Agilidade Halfling",
        descricao: "Você pode atravessar o espaço de qualquer criatura que seja de um tamanho maior que o seu.",
      },
    ],
    subRacas: [
      {
        id: "halflingPesLeves",
        nome: "Halfling Pés Leves",
        descricao: "Discretos e sociáveis.",
        bonusAtributos: { car: 1 },
        tracos: [
          {
            nome: "Naturalmente Furtivo",
            descricao:
              "Você pode tentar se esconder mesmo quando estiver obscurecido apenas por uma criatura pelo menos um tamanho maior que o seu.",
          },
        ],
        armasProficientes: [],
        ferramentas: [],
        idiomasExtras: 0,
        vidaPorNivel: 0,
      },
    ],
    temAncestralDraconico: false,
  },
  {
    id: "humano",
    nome: "Humano",
    descricao: "Versáteis e ambiciosos, o povo mais numeroso e adaptável do mundo.",
    bonusAtributos: { for: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 },
    bonusLivres: null,
    deslocamento: 9,
    idiomas: ["Comum"],
    idiomasExtras: 1,
    periciasFixas: [],
    periciasEscolha: 0,
    armasProficientes: [],
    ferramentasEscolha: [],
    tracos: [{ nome: "Idioma Extra", descricao: "Você fala, lê e escreve um idioma adicional à sua escolha." }],
    subRacas: [],
    temAncestralDraconico: false,
  },
  {
    id: "draconato",
    nome: "Draconato",
    descricao: "Herdeiros de dragões, orgulhosos e fortes, capazes de exalar energia destrutiva.",
    bonusAtributos: { for: 2, car: 1 },
    bonusLivres: null,
    deslocamento: 9,
    idiomas: ["Comum", "Dracônico"],
    idiomasExtras: 0,
    periciasFixas: [],
    periciasEscolha: 0,
    armasProficientes: [],
    ferramentasEscolha: [],
    // Os traços dependentes do ancestral (Arma de Sopro e Resistência) são montados na criação.
    tracos: [],
    subRacas: [],
    temAncestralDraconico: true,
  },
  {
    id: "gnomo",
    nome: "Gnomo",
    descricao: "Curiosos e cheios de energia, adoram inventar, estudar e aprender.",
    bonusAtributos: { int: 2 },
    bonusLivres: null,
    deslocamento: 7.5,
    idiomas: ["Comum", "Gnômico"],
    idiomasExtras: 0,
    periciasFixas: [],
    periciasEscolha: 0,
    armasProficientes: [],
    ferramentasEscolha: [],
    tracos: [
      VISAO_NO_ESCURO,
      {
        nome: "Esperteza Gnômica",
        descricao: "Você tem vantagem em resistências de Inteligência, Sabedoria e Carisma contra magia.",
      },
    ],
    subRacas: [
      {
        id: "gnomoRocha",
        nome: "Gnomo da Rocha",
        descricao: "Engenhoso e resistente.",
        bonusAtributos: { con: 1 },
        tracos: [
          {
            nome: "Conhecimento de Artífice",
            descricao:
              "Em testes de Inteligência (História) sobre itens mágicos, objetos alquímicos ou engenhocas, você soma o dobro do bônus de proficiência.",
          },
          {
            nome: "Engenhoqueiro",
            descricao:
              "Você tem proficiência com ferramentas de funileiro e pode construir pequenos mecanismos (brinquedo, isqueiro ou caixa de música).",
          },
        ],
        armasProficientes: [],
        ferramentas: ["Ferramentas de funileiro"],
        idiomasExtras: 0,
        vidaPorNivel: 0,
      },
    ],
    temAncestralDraconico: false,
  },
  {
    id: "meioElfo",
    nome: "Meio-Elfo",
    descricao: "Carismáticos, reúnem o melhor de humanos e elfos e se adaptam a qualquer lugar.",
    bonusAtributos: { car: 2 },
    bonusLivres: { quantidade: 2, valor: 1, excetos: ["car"] },
    deslocamento: 9,
    idiomas: ["Comum", "Élfico"],
    idiomasExtras: 1,
    periciasFixas: [],
    periciasEscolha: 2,
    armasProficientes: [],
    ferramentasEscolha: [],
    tracos: [
      VISAO_NO_ESCURO,
      ANCESTRAL_FEERICO,
      { nome: "Versatilidade em Perícias", descricao: "Você ganha proficiência em duas perícias à sua escolha." },
    ],
    subRacas: [],
    temAncestralDraconico: false,
  },
  {
    id: "meioOrc",
    nome: "Meio-Orc",
    descricao: "Fortes e resistentes, combinam a ferocidade orc com a determinação humana.",
    bonusAtributos: { for: 2, con: 1 },
    bonusLivres: null,
    deslocamento: 9,
    idiomas: ["Comum", "Orc"],
    idiomasExtras: 0,
    periciasFixas: ["intimidacao"],
    periciasEscolha: 0,
    armasProficientes: [],
    ferramentasEscolha: [],
    tracos: [
      VISAO_NO_ESCURO,
      { nome: "Ameaçador", descricao: "Você tem proficiência na perícia Intimidação." },
      {
        nome: "Resistência Implacável",
        descricao:
          "Quando seus PV chegam a 0 sem que você morra na hora, você fica com 1 PV. Só pode usar de novo após um descanso longo.",
      },
      {
        nome: "Ataques Selvagens",
        descricao:
          "Ao causar um acerto crítico com uma arma corpo a corpo, você rola um dado de dano da arma a mais e soma ao dano extra do crítico.",
      },
    ],
    subRacas: [],
    temAncestralDraconico: false,
  },
  {
    id: "tiefling",
    nome: "Tiefling",
    descricao: "Marcados por uma herança infernal, enfrentam a desconfiança com força e astúcia.",
    bonusAtributos: { car: 2, int: 1 },
    bonusLivres: null,
    deslocamento: 9,
    idiomas: ["Comum", "Infernal"],
    idiomasExtras: 0,
    periciasFixas: [],
    periciasEscolha: 0,
    armasProficientes: [],
    ferramentasEscolha: [],
    tracos: [
      VISAO_NO_ESCURO,
      { nome: "Resistência Infernal", descricao: "Você tem resistência a dano de fogo." },
      {
        nome: "Legado Infernal",
        descricao:
          "Você conhece o truque Taumaturgia. No 3º nível, pode conjurar Repreensão Infernal como magia de 2º nível uma vez por descanso longo; no 5º nível, Escuridão uma vez por descanso longo. Carisma é seu atributo de conjuração.",
      },
    ],
    subRacas: [],
    temAncestralDraconico: false,
  },
];

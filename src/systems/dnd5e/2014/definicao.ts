import type {
  DefAtributo,
  DefCalculado,
  DefPericia,
  DefinicaoSistema,
} from "../../../engine/rules/tipos";

// As regras de D&D 5e (2014) escritas como dados. O motor lê isto e monta os cálculos da ficha.

const atributos: DefAtributo[] = [
  { id: "for", nome: "Força", sigla: "FOR" },
  { id: "des", nome: "Destreza", sigla: "DES" },
  { id: "con", nome: "Constituição", sigla: "CON" },
  { id: "int", nome: "Inteligência", sigla: "INT" },
  { id: "sab", nome: "Sabedoria", sigla: "SAB" },
  { id: "car", nome: "Carisma", sigla: "CAR" },
];

const pericias: DefPericia[] = [
  { id: "acrobacia", nome: "Acrobacia", atributo: "des" },
  { id: "adestrarAnimais", nome: "Adestrar Animais", atributo: "sab" },
  { id: "arcanismo", nome: "Arcanismo", atributo: "int" },
  { id: "atletismo", nome: "Atletismo", atributo: "for" },
  { id: "atuacao", nome: "Atuação", atributo: "car" },
  { id: "enganacao", nome: "Enganação", atributo: "car" },
  { id: "furtividade", nome: "Furtividade", atributo: "des" },
  { id: "historia", nome: "História", atributo: "int" },
  { id: "intimidacao", nome: "Intimidação", atributo: "car" },
  { id: "intuicao", nome: "Intuição", atributo: "sab" },
  { id: "investigacao", nome: "Investigação", atributo: "int" },
  { id: "medicina", nome: "Medicina", atributo: "sab" },
  { id: "natureza", nome: "Natureza", atributo: "int" },
  { id: "percepcao", nome: "Percepção", atributo: "sab" },
  { id: "persuasao", nome: "Persuasão", atributo: "car" },
  { id: "prestidigitacao", nome: "Prestidigitação", atributo: "des" },
  { id: "religiao", nome: "Religião", atributo: "int" },
  { id: "sobrevivencia", nome: "Sobrevivência", atributo: "sab" },
];

const calculados: DefCalculado[] = [
  ...atributos.map((a) => ({
    chave: `mod.${a.id}`,
    nome: `Modificador de ${a.nome}`,
    formula: `floor((atributos.${a.id} - 10) / 2)`,
  })),
  {
    chave: "bonusProficiencia",
    nome: "Bônus de proficiência",
    formula: "floor((nivel - 1) / 4) + 2",
  },
  ...atributos.map((a) => ({
    chave: `resistencia.${a.id}`,
    nome: `Resistência de ${a.nome}`,
    formula: `mod.${a.id} + proficiencia.resistencias.${a.id} * bonusProficiencia`,
  })),
  ...pericias.map((p) => ({
    chave: `pericia.${p.id}`,
    nome: p.nome,
    formula: `mod.${p.atributo} + proficiencia.pericias.${p.id} * bonusProficiencia`,
  })),
  { chave: "iniciativa", nome: "Iniciativa", formula: "mod.des" },
  { chave: "ca", nome: "Classe de Armadura", formula: "10 + mod.des" },
  { chave: "percepcaoPassiva", nome: "Percepção passiva", formula: "10 + pericia.percepcao" },
];

export const dnd5e2014: DefinicaoSistema = {
  id: "dnd5e",
  versao: "2014",
  nome: "Dungeons & Dragons 5ª edição (2014)",
  atributos,
  pericias,
  calculados,
};

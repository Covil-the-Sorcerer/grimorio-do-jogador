import type { AncestralDraconico, EstiloDeLuta } from "./tipos";

export const IDIOMAS_PADRAO: string[] = [
  "Comum",
  "Anão",
  "Élfico",
  "Gigante",
  "Gnômico",
  "Goblin",
  "Halfling",
  "Orc",
  "Abissal",
  "Celestial",
  "Dracônico",
  "Fala Profunda",
  "Infernal",
  "Primordial",
  "Silvestre",
  "Subcomum",
];

export const ANCESTRAIS_DRACONICOS: AncestralDraconico[] = [
  { id: "azul", nome: "Azul", tipoDano: "relâmpago", formato: "linha de 1,5 m por 9 m", resistencia: "Destreza" },
  { id: "branco", nome: "Branco", tipoDano: "frio", formato: "cone de 4,5 m", resistencia: "Constituição" },
  { id: "bronze", nome: "Bronze", tipoDano: "relâmpago", formato: "linha de 1,5 m por 9 m", resistencia: "Destreza" },
  { id: "cobre", nome: "Cobre", tipoDano: "ácido", formato: "linha de 1,5 m por 9 m", resistencia: "Destreza" },
  { id: "latao", nome: "Latão", tipoDano: "fogo", formato: "linha de 1,5 m por 9 m", resistencia: "Destreza" },
  { id: "negro", nome: "Negro", tipoDano: "ácido", formato: "linha de 1,5 m por 9 m", resistencia: "Destreza" },
  { id: "ouro", nome: "Ouro", tipoDano: "fogo", formato: "cone de 4,5 m", resistencia: "Destreza" },
  { id: "prata", nome: "Prata", tipoDano: "frio", formato: "cone de 4,5 m", resistencia: "Constituição" },
  { id: "verde", nome: "Verde", tipoDano: "veneno", formato: "cone de 4,5 m", resistencia: "Constituição" },
  { id: "vermelho", nome: "Vermelho", tipoDano: "fogo", formato: "cone de 4,5 m", resistencia: "Destreza" },
];

export const ESTILOS_DE_LUTA: EstiloDeLuta[] = [
  { id: "arquearia", nome: "Arquearia", descricao: "Você ganha +2 nas jogadas de ataque feitas com armas à distância." },
  { id: "defesa", nome: "Defesa", descricao: "Enquanto estiver usando armadura, você ganha +1 na CA." },
  {
    id: "duelismo",
    nome: "Duelismo",
    descricao: "Empunhando uma arma corpo a corpo em uma mão e nenhuma outra arma, você ganha +2 no dano com ela.",
  },
  {
    id: "armasGrandes",
    nome: "Combate com Armas Grandes",
    descricao:
      "Com uma arma corpo a corpo de duas mãos, se tirar 1 ou 2 em um dado de dano, você pode rolar o dado de novo e usar o novo resultado.",
  },
  {
    id: "protecao",
    nome: "Proteção",
    descricao:
      "Usando um escudo, você pode usar sua reação para impor desvantagem no ataque contra um aliado a até 1,5 m de você.",
  },
  {
    id: "duasArmas",
    nome: "Combate com Duas Armas",
    descricao: "Ao lutar com duas armas, você pode somar o modificador de atributo ao dano do segundo ataque.",
  },
];

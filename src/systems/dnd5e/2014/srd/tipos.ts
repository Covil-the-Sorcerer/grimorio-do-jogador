// Formato dos dados de regras (raças, classes, antecedentes) usados na criação guiada.
// O conteúdo vem do SRD 5.1 (licença CC-BY-4.0), traduzido e resumido para o português.

export interface Traco {
  nome: string;
  descricao: string;
}

/** Bônus de atributo por id (for, des, con, int, sab, car). */
export type BonusAtributos = Record<string, number>;

export interface SubRacaSrd {
  id: string;
  nome: string;
  descricao: string;
  bonusAtributos: BonusAtributos;
  tracos: Traco[];
  armasProficientes: string[];
  ferramentas: string[];
  idiomasExtras: number;
  /** PV máximos extras por nível (ex.: Anão da Colina). */
  vidaPorNivel: number;
}

export interface RacaSrd {
  id: string;
  nome: string;
  descricao: string;
  bonusAtributos: BonusAtributos;
  /** Bônus a distribuir à escolha (Meio-Elfo). */
  bonusLivres: { quantidade: number; valor: number; excetos: string[] } | null;
  /** Deslocamento em metros. */
  deslocamento: number;
  idiomas: string[];
  idiomasExtras: number;
  periciasFixas: string[];
  /** Perícias à escolha (qualquer uma). */
  periciasEscolha: number;
  armasProficientes: string[];
  /** Ferramentas entre as quais se escolhe uma (Anão). Vazio = não há escolha. */
  ferramentasEscolha: string[];
  tracos: Traco[];
  subRacas: SubRacaSrd[];
  temAncestralDraconico: boolean;
}

export interface SubclasseSrd {
  id: string;
  nome: string;
  descricao: string;
  tracos: Traco[];
  armaduras: string[];
  idiomas: string[];
  vidaPorNivel: number;
  defesaSemArmadura: "" | "draconico";
}

export interface ClasseSrd {
  id: string;
  nome: string;
  descricao: string;
  dadoDeVida: number;
  resistencias: string[];
  armaduras: string[];
  armas: string[];
  ferramentas: string[];
  quantidadePericias: number;
  /** ids das perícias oferecidas. Vazio = qualquer perícia. */
  opcoesPericias: string[];
  idiomas: string[];
  /** Características do 1º nível. */
  tracos: Traco[];
  defesaSemArmadura: "" | "barbaro" | "monge";
  /** Perícias com especialização já no 1º nível (Ladino). */
  especializacao: number;
  estilosDeLuta: boolean;
  subclasse: { rotulo: string; opcoes: SubclasseSrd[] } | null;
}

export interface AntecedenteSrd {
  id: string;
  nome: string;
  descricao: string;
  pericias: string[];
  idiomasExtras: number;
  tracos: Traco[];
}

export interface AncestralDraconico {
  id: string;
  nome: string;
  tipoDano: string;
  formato: string;
  resistencia: string;
}

export interface EstiloDeLuta {
  id: string;
  nome: string;
  descricao: string;
}

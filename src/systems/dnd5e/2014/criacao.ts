// Regras da criação guiada de ficha (D&D 5e, 2014): escolhas, validação e montagem dos dados.
// Tudo aqui é lógica pura, sem tela, para poder ser testada.
import { dnd5e2014 } from "./definicao";
import { dadosVazios } from "./dados";
import type { DadosDnd5e, Habilidade } from "./tipos";
import { ANTECEDENTES_SRD } from "./srd/antecedentes";
import { CLASSES_SRD } from "./srd/classes";
import { ANCESTRAIS_DRACONICOS, ESTILOS_DE_LUTA } from "./srd/geral";
import { RACAS_SRD } from "./srd/racas";
import type {
  AntecedenteSrd,
  BonusAtributos,
  ClasseSrd,
  RacaSrd,
  SubclasseSrd,
  Traco,
} from "./srd/tipos";

export const PERSONALIZADA = "personalizada";

export interface Personalizado {
  nome: string;
  /** Só para raça: deslocamento em metros. */
  deslocamento: number;
  /** Só para raça: idiomas separados por vírgula. */
  idiomas: string;
  bonus: Record<string, number>;
  tracos: string;
}

export interface ClassePersonalizada {
  nome: string;
  dadoDeVida: number;
  resistencias: string[];
  quantidadePericias: number;
}

export interface AntecedentePersonalizado {
  nome: string;
  pericias: string[];
}

export interface EscolhasCriacao {
  nome: string;
  multiclasse: boolean;

  racaId: string;
  subRacaId: string;
  racaPersonalizada: Personalizado;
  subRacaPersonalizada: Personalizado;
  ancestralId: string;
  bonusLivres: string[];
  idiomasRaca: string[];
  ferramentaRaca: string;
  periciasRaca: string[];

  classeId: string;
  classePersonalizada: ClassePersonalizada;
  subclasseId: string;
  subclassePersonalizada: string;
  estiloDeLutaId: string;
  periciasClasse: string[];
  especializacao: string[];

  antecedenteId: string;
  antecedentePersonalizado: AntecedentePersonalizado;
  idiomasAntecedente: string[];

  atributosBase: Record<string, number>;
}

function personalizadoVazio(): Personalizado {
  const bonus: Record<string, number> = {};
  for (const a of dnd5e2014.atributos) bonus[a.id] = 0;
  return { nome: "", deslocamento: 9, idiomas: "", bonus, tracos: "" };
}

export function escolhasIniciais(): EscolhasCriacao {
  const atributosBase: Record<string, number> = {};
  for (const a of dnd5e2014.atributos) atributosBase[a.id] = 10;
  return {
    nome: "",
    multiclasse: false,
    racaId: "",
    subRacaId: "",
    racaPersonalizada: personalizadoVazio(),
    subRacaPersonalizada: personalizadoVazio(),
    ancestralId: "",
    bonusLivres: [],
    idiomasRaca: [],
    ferramentaRaca: "",
    periciasRaca: [],
    classeId: "",
    classePersonalizada: { nome: "", dadoDeVida: 8, resistencias: [], quantidadePericias: 2 },
    subclasseId: "",
    subclassePersonalizada: "",
    estiloDeLutaId: "",
    periciasClasse: [],
    especializacao: [],
    antecedenteId: "",
    antecedentePersonalizado: { nome: "", pericias: [] },
    idiomasAntecedente: [],
    atributosBase,
  };
}

// ---------- utilidades ----------

function unico(lista: string[]): string[] {
  const vistos = new Set<string>();
  const saida: string[] = [];
  for (const item of lista) {
    const limpo = item.trim();
    if (!limpo) continue;
    const chave = limpo.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(limpo);
  }
  return saida;
}

function modificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

export const TODAS_AS_PERICIAS: string[] = dnd5e2014.pericias.map((p) => p.id);

export function nomeDaPericia(id: string): string {
  return dnd5e2014.pericias.find((p) => p.id === id)?.nome ?? id;
}

export function nomeDoAtributo(id: string): string {
  return dnd5e2014.atributos.find((a) => a.id === id)?.nome ?? id;
}

function tracoPersonalizado(nome: string, texto: string): Traco[] {
  const limpo = texto.trim();
  return limpo ? [{ nome, descricao: limpo }] : [];
}

function somarBonus(...fontes: BonusAtributos[]): BonusAtributos {
  const total: BonusAtributos = {};
  for (const fonte of fontes) {
    for (const [id, valor] of Object.entries(fonte)) {
      if (valor) total[id] = (total[id] ?? 0) + valor;
    }
  }
  return total;
}

// ---------- raça ----------

export interface RacaEfetiva {
  nome: string;
  deslocamento: number;
  bonus: BonusAtributos;
  bonusLivres: RacaSrd["bonusLivres"];
  idiomasFixos: string[];
  idiomasExtras: number;
  periciasFixas: string[];
  periciasEscolha: number;
  armas: string[];
  ferramentas: string[];
  ferramentaEscolha: string[];
  tracos: Traco[];
  vidaPorNivel: number;
  exigeSubRaca: boolean;
  exigeAncestral: boolean;
  /** A raça escolhida (do SRD), quando houver. */
  srd: RacaSrd | null;
}

export function racaDoSrd(id: string): RacaSrd | undefined {
  return RACAS_SRD.find((r) => r.id === id);
}

function tracosDoAncestral(ancestralId: string): Traco[] {
  const a = ANCESTRAIS_DRACONICOS.find((x) => x.id === ancestralId);
  if (!a) {
    return [{ nome: "Ancestral Dracônico", descricao: "Escolha o tipo de dragão do seu ancestral." }];
  }
  return [
    { nome: "Ancestral Dracônico", descricao: `Seu ancestral é um dragão ${a.nome.toLowerCase()}.` },
    {
      nome: "Arma de Sopro",
      descricao:
        `Como ação, você exala energia destrutiva (${a.tipoDano}) em ${a.formato}. Cada criatura na área faz uma resistência de ${a.resistencia} ` +
        "(CD = 8 + modificador de Constituição + bônus de proficiência): sofre 2d6 de dano em falha e metade em sucesso. " +
        "O dano sobe para 3d6 no 6º nível, 4d6 no 11º e 5d6 no 16º. Só pode usar de novo após um descanso curto ou longo.",
    },
    { nome: "Resistência a Dano", descricao: `Você tem resistência a dano de ${a.tipoDano}.` },
  ];
}

export function racaEfetiva(esc: EscolhasCriacao): RacaEfetiva | null {
  if (!esc.racaId) return null;

  if (esc.racaId === PERSONALIZADA) {
    const p = esc.racaPersonalizada;
    return {
      nome: p.nome.trim() || "Raça Personalizada",
      deslocamento: p.deslocamento,
      bonus: somarBonus(p.bonus),
      bonusLivres: null,
      idiomasFixos: unico(p.idiomas.split(",")),
      idiomasExtras: 0,
      periciasFixas: [],
      periciasEscolha: 0,
      armas: [],
      ferramentas: [],
      ferramentaEscolha: [],
      tracos: tracoPersonalizado("Traços da Raça", p.tracos),
      vidaPorNivel: 0,
      exigeSubRaca: false,
      exigeAncestral: false,
      srd: null,
    };
  }

  const raca = racaDoSrd(esc.racaId);
  if (!raca) return null;

  const exigeSubRaca = raca.subRacas.length > 0;
  let nome = raca.nome;
  let bonusSub: BonusAtributos = {};
  let tracosSub: Traco[] = [];
  let armasSub: string[] = [];
  let ferramentasSub: string[] = [];
  let idiomasExtrasSub = 0;
  let vidaPorNivel = 0;

  if (exigeSubRaca && esc.subRacaId === PERSONALIZADA) {
    const p = esc.subRacaPersonalizada;
    nome = p.nome.trim() ? `${raca.nome} (${p.nome.trim()})` : raca.nome;
    bonusSub = somarBonus(p.bonus);
    tracosSub = tracoPersonalizado("Traços da Sub-Raça", p.tracos);
  } else if (exigeSubRaca && esc.subRacaId) {
    const sub = raca.subRacas.find((s) => s.id === esc.subRacaId);
    if (sub) {
      nome = sub.nome;
      bonusSub = sub.bonusAtributos;
      tracosSub = sub.tracos;
      armasSub = sub.armasProficientes;
      ferramentasSub = sub.ferramentas;
      idiomasExtrasSub = sub.idiomasExtras;
      vidaPorNivel = sub.vidaPorNivel;
    }
  }

  let tracos = [...raca.tracos, ...tracosSub];
  if (raca.temAncestralDraconico) {
    tracos = [...tracosDoAncestral(esc.ancestralId), ...tracos];
    const ancestral = ANCESTRAIS_DRACONICOS.find((a) => a.id === esc.ancestralId);
    if (ancestral) nome = `${raca.nome} (${ancestral.nome})`;
  }

  return {
    nome,
    deslocamento: raca.deslocamento,
    bonus: somarBonus(raca.bonusAtributos, bonusSub),
    bonusLivres: raca.bonusLivres,
    idiomasFixos: raca.idiomas,
    idiomasExtras: raca.idiomasExtras + idiomasExtrasSub,
    periciasFixas: raca.periciasFixas,
    periciasEscolha: raca.periciasEscolha,
    armas: unico([...raca.armasProficientes, ...armasSub]),
    ferramentas: ferramentasSub,
    ferramentaEscolha: raca.ferramentasEscolha,
    tracos,
    vidaPorNivel,
    exigeSubRaca,
    exigeAncestral: raca.temAncestralDraconico,
    srd: raca,
  };
}

// ---------- classe ----------

export interface ClasseEfetiva {
  nome: string;
  dadoDeVida: number;
  resistencias: string[];
  armaduras: string[];
  armas: string[];
  ferramentas: string[];
  quantidadePericias: number;
  /** Perícias oferecidas. Vazio = qualquer uma. */
  opcoesPericias: string[];
  idiomas: string[];
  tracos: Traco[];
  defesa: "" | "barbaro" | "monge" | "draconico";
  especializacao: number;
  estilosDeLuta: boolean;
  subclasse: ClasseSrd["subclasse"];
  vidaPorNivel: number;
  srd: ClasseSrd | null;
}

export function classeDoSrd(id: string): ClasseSrd | undefined {
  return CLASSES_SRD.find((c) => c.id === id);
}

export function subclasseEscolhida(esc: EscolhasCriacao): SubclasseSrd | null {
  const classe = classeDoSrd(esc.classeId);
  if (!classe?.subclasse) return null;
  return classe.subclasse.opcoes.find((o) => o.id === esc.subclasseId) ?? null;
}

export function classeEfetiva(esc: EscolhasCriacao): ClasseEfetiva | null {
  if (!esc.classeId) return null;

  if (esc.classeId === PERSONALIZADA) {
    const p = esc.classePersonalizada;
    return {
      nome: p.nome.trim() || "Classe Personalizada",
      dadoDeVida: p.dadoDeVida,
      resistencias: p.resistencias,
      armaduras: [],
      armas: [],
      ferramentas: [],
      quantidadePericias: p.quantidadePericias,
      opcoesPericias: [],
      idiomas: [],
      tracos: [],
      defesa: "",
      especializacao: 0,
      estilosDeLuta: false,
      subclasse: null,
      vidaPorNivel: 0,
      srd: null,
    };
  }

  const classe = classeDoSrd(esc.classeId);
  if (!classe) return null;

  let tracos = [...classe.tracos];
  let armaduras = classe.armaduras;
  let idiomas = classe.idiomas;
  let vidaPorNivel = 0;
  let defesa: ClasseEfetiva["defesa"] = classe.defesaSemArmadura;

  if (classe.subclasse) {
    if (esc.subclasseId === PERSONALIZADA) {
      const nome = esc.subclassePersonalizada.trim();
      tracos = [
        ...tracos,
        {
          nome: `${classe.subclasse.rotulo}: ${nome || "Personalizado"}`,
          descricao: "Escolha personalizada. Anote os detalhes aqui depois.",
        },
      ];
    } else {
      const sub = subclasseEscolhida(esc);
      if (sub) {
        tracos = [...tracos, ...sub.tracos];
        armaduras = unico([...armaduras, ...sub.armaduras]);
        idiomas = unico([...idiomas, ...sub.idiomas]);
        vidaPorNivel = sub.vidaPorNivel;
        if (sub.defesaSemArmadura) defesa = sub.defesaSemArmadura;
      }
    }
  }

  if (classe.estilosDeLuta) {
    const estilo = ESTILOS_DE_LUTA.find((e) => e.id === esc.estiloDeLutaId);
    if (estilo) {
      tracos = [{ nome: `Estilo de Luta: ${estilo.nome}`, descricao: estilo.descricao }, ...tracos];
    }
  }

  return {
    nome: classe.nome,
    dadoDeVida: classe.dadoDeVida,
    resistencias: classe.resistencias,
    armaduras,
    armas: classe.armas,
    ferramentas: classe.ferramentas,
    quantidadePericias: classe.quantidadePericias,
    opcoesPericias: classe.opcoesPericias,
    idiomas,
    tracos,
    defesa,
    especializacao: classe.especializacao,
    estilosDeLuta: classe.estilosDeLuta,
    subclasse: classe.subclasse,
    vidaPorNivel,
    srd: classe,
  };
}

// ---------- antecedente ----------

export interface AntecedenteEfetivo {
  nome: string;
  periciasFixas: string[];
  /** Perícias à escolha (antecedente personalizado). */
  periciasEscolha: number;
  idiomasExtras: number;
  tracos: Traco[];
  srd: AntecedenteSrd | null;
}

export function antecedenteEfetivo(esc: EscolhasCriacao): AntecedenteEfetivo | null {
  if (!esc.antecedenteId) return null;
  if (esc.antecedenteId === PERSONALIZADA) {
    return {
      nome: esc.antecedentePersonalizado.nome.trim() || "Antecedente Personalizado",
      periciasFixas: [],
      periciasEscolha: 2,
      idiomasExtras: 0,
      tracos: [],
      srd: null,
    };
  }
  const a = ANTECEDENTES_SRD.find((x) => x.id === esc.antecedenteId);
  if (!a) return null;
  return {
    nome: a.nome,
    periciasFixas: a.pericias,
    periciasEscolha: 0,
    idiomasExtras: a.idiomasExtras,
    tracos: a.tracos,
    srd: a,
  };
}

// ---------- perícias ----------

export type GrupoDePericias = "raca" | "classe" | "antecedente";

export interface GrupoPericiasInfo {
  grupo: GrupoDePericias;
  titulo: string;
  quantidade: number;
  /** Perícias que podem ser escolhidas neste grupo (antes de tirar as já usadas). */
  opcoes: string[];
}

export function escolhidasDoGrupo(esc: EscolhasCriacao, grupo: GrupoDePericias): string[] {
  if (grupo === "raca") return esc.periciasRaca;
  if (grupo === "classe") return esc.periciasClasse;
  return esc.antecedentePersonalizado.pericias;
}

/** Perícias já garantidas (sem escolha) pela raça e pelo antecedente, com a origem de cada uma. */
export function periciasConcedidas(esc: EscolhasCriacao): { id: string; origem: string }[] {
  const lista: { id: string; origem: string }[] = [];
  const raca = racaEfetiva(esc);
  const antecedente = antecedenteEfetivo(esc);
  if (raca) for (const id of raca.periciasFixas) lista.push({ id, origem: raca.nome });
  if (antecedente) for (const id of antecedente.periciasFixas) lista.push({ id, origem: antecedente.nome });
  return lista;
}

export function gruposDePericias(esc: EscolhasCriacao): GrupoPericiasInfo[] {
  const grupos: GrupoPericiasInfo[] = [];
  const raca = racaEfetiva(esc);
  const classe = classeEfetiva(esc);
  const antecedente = antecedenteEfetivo(esc);

  if (raca && raca.periciasEscolha > 0) {
    grupos.push({
      grupo: "raca",
      titulo: `Perícias da Raça (${raca.nome})`,
      quantidade: raca.periciasEscolha,
      opcoes: TODAS_AS_PERICIAS,
    });
  }
  if (classe && classe.quantidadePericias > 0) {
    grupos.push({
      grupo: "classe",
      titulo: `Perícias da Classe (${classe.nome})`,
      quantidade: classe.quantidadePericias,
      opcoes: classe.opcoesPericias.length > 0 ? classe.opcoesPericias : TODAS_AS_PERICIAS,
    });
  }
  if (antecedente && antecedente.periciasEscolha > 0) {
    grupos.push({
      grupo: "antecedente",
      titulo: `Perícias do Antecedente (${antecedente.nome})`,
      quantidade: antecedente.periciasEscolha,
      opcoes: TODAS_AS_PERICIAS,
    });
  }
  return grupos;
}

/** Perícias que não podem mais ser escolhidas em um grupo (já garantidas ou escolhidas em outro). */
export function periciasBloqueadas(esc: EscolhasCriacao, grupo: GrupoDePericias): Set<string> {
  const bloqueadas = new Set<string>(periciasConcedidas(esc).map((p) => p.id));
  const existentes = new Set(gruposDePericias(esc).map((g) => g.grupo));
  for (const outro of ["raca", "classe", "antecedente"] as const) {
    if (outro === grupo || !existentes.has(outro)) continue;
    for (const id of escolhidasDoGrupo(esc, outro)) bloqueadas.add(id);
  }
  return bloqueadas;
}

/** Todas as perícias em que o personagem terá proficiência. */
export function periciasProficientes(esc: EscolhasCriacao): string[] {
  const ids = new Set<string>(periciasConcedidas(esc).map((p) => p.id));
  // Só conta as escolhas de grupos que existem para a raça, classe e antecedente atuais.
  for (const g of gruposDePericias(esc)) {
    for (const id of escolhidasDoGrupo(esc, g.grupo)) ids.add(id);
  }
  return TODAS_AS_PERICIAS.filter((id) => ids.has(id));
}

// ---------- atributos ----------

export function bonusDeAtributos(esc: EscolhasCriacao): BonusAtributos {
  const raca = racaEfetiva(esc);
  if (!raca) return {};
  const livres: BonusAtributos = {};
  if (raca.bonusLivres) {
    for (const id of esc.bonusLivres) livres[id] = (livres[id] ?? 0) + raca.bonusLivres.valor;
  }
  return somarBonus(raca.bonus, livres);
}

export function atributosFinais(esc: EscolhasCriacao): Record<string, number> {
  const bonus = bonusDeAtributos(esc);
  const final: Record<string, number> = {};
  for (const a of dnd5e2014.atributos) final[a.id] = (esc.atributosBase[a.id] ?? 10) + (bonus[a.id] ?? 0);
  return final;
}

// ---------- idiomas ----------

export function idiomasFinais(esc: EscolhasCriacao): string[] {
  const raca = racaEfetiva(esc);
  const classe = classeEfetiva(esc);
  const antecedente = antecedenteEfetivo(esc);
  return unico([
    ...(raca?.idiomasFixos ?? []),
    ...esc.idiomasRaca.slice(0, raca?.idiomasExtras ?? 0),
    ...esc.idiomasAntecedente.slice(0, antecedente?.idiomasExtras ?? 0),
    ...(classe?.idiomas ?? []),
  ]);
}

// ---------- troca de escolhas (limpa o que dependia da escolha anterior) ----------

export function trocarRaca(esc: EscolhasCriacao, racaId: string): EscolhasCriacao {
  if (racaId === esc.racaId) return esc;
  const limpo = escolhasIniciais();
  return {
    ...esc,
    racaId,
    subRacaId: "",
    subRacaPersonalizada: limpo.subRacaPersonalizada,
    ancestralId: "",
    bonusLivres: [],
    idiomasRaca: [],
    ferramentaRaca: "",
    periciasRaca: [],
    especializacao: [],
  };
}

export function trocarClasse(esc: EscolhasCriacao, classeId: string): EscolhasCriacao {
  if (classeId === esc.classeId) return esc;
  return {
    ...esc,
    classeId,
    subclasseId: "",
    subclassePersonalizada: "",
    estiloDeLutaId: "",
    periciasClasse: [],
    especializacao: [],
  };
}

export function trocarAntecedente(esc: EscolhasCriacao, antecedenteId: string): EscolhasCriacao {
  if (antecedenteId === esc.antecedenteId) return esc;
  return {
    ...esc,
    antecedenteId,
    antecedentePersonalizado: { nome: esc.antecedentePersonalizado.nome, pericias: [] },
    idiomasAntecedente: [],
    especializacao: [],
  };
}

// ---------- passos e validação ----------

export type PassoId = "nome" | "raca" | "classe" | "antecedente" | "atributos" | "pericias" | "revisao";

export const PASSOS: { id: PassoId; rotulo: string }[] = [
  { id: "nome", rotulo: "Nome e Regras" },
  { id: "raca", rotulo: "Raça" },
  { id: "classe", rotulo: "Classe" },
  { id: "antecedente", rotulo: "Antecedente" },
  { id: "atributos", rotulo: "Atributos" },
  { id: "pericias", rotulo: "Perícias" },
  { id: "revisao", rotulo: "Revisão" },
];

function problemasDeRaca(esc: EscolhasCriacao): string[] {
  const p: string[] = [];
  const raca = racaEfetiva(esc);
  if (!raca) return ["Escolha uma raça."];

  if (esc.racaId === PERSONALIZADA) {
    if (!esc.racaPersonalizada.nome.trim()) p.push("Dê um nome à raça personalizada.");
    return p;
  }
  if (raca.exigeSubRaca) {
    if (!esc.subRacaId) p.push("Escolha uma sub-raça.");
    else if (esc.subRacaId === PERSONALIZADA && !esc.subRacaPersonalizada.nome.trim()) {
      p.push("Dê um nome à sub-raça personalizada.");
    }
  }
  if (raca.exigeAncestral && !esc.ancestralId) p.push("Escolha o ancestral dracônico.");
  if (raca.bonusLivres) {
    const { quantidade, excetos } = raca.bonusLivres;
    const validos = esc.bonusLivres.filter((id) => !excetos.includes(id));
    if (validos.length !== quantidade || new Set(validos).size !== quantidade || esc.bonusLivres.length !== quantidade) {
      p.push(`Escolha ${quantidade} atributos diferentes para receber o bônus da raça.`);
    }
  }
  if (raca.idiomasExtras !== esc.idiomasRaca.length) {
    p.push(`Escolha ${raca.idiomasExtras} idioma(s) extra(s) da raça.`);
  }
  if (raca.ferramentaEscolha.length > 0 && !raca.ferramentaEscolha.includes(esc.ferramentaRaca)) {
    p.push("Escolha a ferramenta da raça.");
  }
  return p;
}

function problemasDeClasse(esc: EscolhasCriacao): string[] {
  const p: string[] = [];
  const classe = classeEfetiva(esc);
  if (!classe) return ["Escolha uma classe."];

  if (esc.classeId === PERSONALIZADA) {
    const c = esc.classePersonalizada;
    if (!c.nome.trim()) p.push("Dê um nome à classe personalizada.");
    if (c.resistencias.length !== 2 || c.resistencias[0] === c.resistencias[1]) {
      p.push("Escolha duas resistências diferentes para a classe.");
    }
    return p;
  }
  if (classe.subclasse) {
    if (!esc.subclasseId) p.push(`Escolha: ${classe.subclasse.rotulo}.`);
    else if (esc.subclasseId === PERSONALIZADA && !esc.subclassePersonalizada.trim()) {
      p.push(`Dê um nome a ${classe.subclasse.rotulo}.`);
    }
  }
  if (classe.estilosDeLuta && !esc.estiloDeLutaId) p.push("Escolha um estilo de luta.");
  return p;
}

function problemasDeAntecedente(esc: EscolhasCriacao): string[] {
  const p: string[] = [];
  const a = antecedenteEfetivo(esc);
  if (!a) return ["Escolha um antecedente."];
  if (esc.antecedenteId === PERSONALIZADA && !esc.antecedentePersonalizado.nome.trim()) {
    p.push("Dê um nome ao antecedente personalizado.");
  }
  if (a.idiomasExtras !== esc.idiomasAntecedente.length) {
    p.push(`Escolha ${a.idiomasExtras} idioma(s) do antecedente.`);
  }
  return p;
}

function problemasDeAtributos(esc: EscolhasCriacao): string[] {
  for (const a of dnd5e2014.atributos) {
    const v = esc.atributosBase[a.id];
    if (!Number.isFinite(v) || v < 1 || v > 20) return [`O valor de ${a.nome} precisa estar entre 1 e 20.`];
  }
  return [];
}

function problemasDePericias(esc: EscolhasCriacao): string[] {
  const p: string[] = [];
  const grupos = gruposDePericias(esc);
  for (const g of grupos) {
    const escolhidas = escolhidasDoGrupo(esc, g.grupo);
    if (escolhidas.length !== g.quantidade) {
      p.push(`${g.titulo}: escolha ${g.quantidade} (você escolheu ${escolhidas.length}).`);
    }
    const bloqueadas = periciasBloqueadas(esc, g.grupo);
    for (const id of escolhidas) {
      if (!g.opcoes.includes(id) || bloqueadas.has(id)) {
        p.push(`${nomeDaPericia(id)} não pode ser escolhida aqui.`);
      }
    }
  }
  const classe = classeEfetiva(esc);
  if (classe && classe.especializacao > 0) {
    const proficientes = new Set(periciasProficientes(esc));
    const e = esc.especializacao;
    if (e.length !== classe.especializacao || new Set(e).size !== e.length) {
      p.push(`Especialização: escolha ${classe.especializacao} perícias diferentes.`);
    } else if (e.some((id) => !proficientes.has(id))) {
      p.push("A especialização só vale para perícias em que você tem proficiência.");
    }
  }
  return p;
}

export function problemasDoPasso(passo: PassoId, esc: EscolhasCriacao): string[] {
  switch (passo) {
    case "nome":
      return [];
    case "raca":
      return problemasDeRaca(esc);
    case "classe":
      return problemasDeClasse(esc);
    case "antecedente":
      return problemasDeAntecedente(esc);
    case "atributos":
      return problemasDeAtributos(esc);
    case "pericias":
      return problemasDePericias(esc);
    case "revisao":
      return PASSOS.filter((x) => x.id !== "revisao").flatMap((x) => problemasDoPasso(x.id, esc));
  }
}

// ---------- montagem da ficha ----------

export interface PreviaDaFicha {
  vidaMaxima: number;
  modificadores: Record<string, number>;
}

export function previa(esc: EscolhasCriacao): PreviaDaFicha {
  const finais = atributosFinais(esc);
  const modificadores: Record<string, number> = {};
  for (const a of dnd5e2014.atributos) modificadores[a.id] = modificador(finais[a.id]);

  const raca = racaEfetiva(esc);
  const classe = classeEfetiva(esc);
  const dado = classe?.dadoDeVida ?? 8;
  const bonusVida = (raca?.vidaPorNivel ?? 0) + (classe?.vidaPorNivel ?? 0);
  return { vidaMaxima: Math.max(1, dado + modificadores.con) + bonusVida, modificadores };
}

export interface FichaMontada {
  nome: string;
  versaoRegras: "2014";
  multiclasse: boolean;
  dados: DadosDnd5e;
}

/** Converte as escolhas em dados de ficha de nível 1. Não valida: use problemasDoPasso("revisao"). */
export function montarFicha(esc: EscolhasCriacao, gerarId: () => string): FichaMontada {
  const dados = dadosVazios();
  const raca = racaEfetiva(esc);
  const classe = classeEfetiva(esc);
  const antecedente = antecedenteEfetivo(esc);
  const { vidaMaxima } = previa(esc);

  dados.raca = raca?.nome ?? "";
  dados.classe = classe?.nome ?? "";
  dados.antecedente = antecedente?.nome ?? "";
  dados.nivel = 1;
  dados.atributos = atributosFinais(esc);
  dados.deslocamento = raca?.deslocamento ?? 9;
  dados.vida = { atual: vidaMaxima, maximo: vidaMaxima, temporario: 0 };

  for (const id of classe?.resistencias ?? []) dados.proficiencia.resistencias[id] = 1;
  for (const id of periciasProficientes(esc)) dados.proficiencia.pericias[id] = 1;
  if (classe && classe.especializacao > 0) {
    for (const id of esc.especializacao) dados.proficiencia.pericias[id] = 2;
  }

  dados.outrasProficiencias = {
    armas: unico([...(raca?.armas ?? []), ...(classe?.armas ?? [])]),
    armaduras: unico(classe?.armaduras ?? []),
    ferramentas: unico([
      ...(raca?.ferramentas ?? []),
      ...(raca && raca.ferramentaEscolha.includes(esc.ferramentaRaca) ? [esc.ferramentaRaca] : []),
      ...(classe?.ferramentas ?? []),
    ]),
  };
  dados.idiomas = idiomasFinais(esc);

  const habilidades: Habilidade[] = [];
  const acrescentar = (tracos: Traco[], origem: string) => {
    for (const t of tracos) habilidades.push({ id: gerarId(), nome: t.nome, origem, descricao: t.descricao });
  };
  if (raca) acrescentar(raca.tracos, raca.nome);
  if (classe) acrescentar(classe.tracos, classe.nome);
  if (antecedente) acrescentar(antecedente.tracos, `Antecedente: ${antecedente.nome}`);
  dados.habilidades = habilidades;

  dados.origem = {
    racaId: esc.racaId,
    subRacaId: esc.subRacaId,
    classeId: esc.classeId,
    subclasseId: esc.subclasseId,
    antecedenteId: esc.antecedenteId,
  };
  dados.defesaSemArmadura = {
    barbaro: classe?.defesa === "barbaro" ? 1 : 0,
    monge: classe?.defesa === "monge" ? 1 : 0,
    draconico: classe?.defesa === "draconico" ? 1 : 0,
  };

  return {
    nome: esc.nome.trim() || "Novo personagem",
    versaoRegras: "2014",
    multiclasse: esc.multiclasse,
    dados,
  };
}

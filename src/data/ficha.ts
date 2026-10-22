import { dnd5e2014 } from "../systems/dnd5e/2014/definicao";
import { dadosVazios } from "../systems/dnd5e/2014/dados";
import type { DadosDnd5e } from "../systems/dnd5e/2014/tipos";

export const SCHEMA_ATUAL = 1;

export interface Ficha {
  id: string;
  sistema: "dnd5e";
  versaoRegras: "2014" | "2024";
  regrasDaMesa: { multiclasse: boolean };
  nome: string;
  schemaVersion: number;
  criadaEm: string;
  atualizadaEm: string;
  dados: DadosDnd5e;
}

export interface OpcoesNovaFicha {
  nome: string;
  versaoRegras: "2014" | "2024";
  multiclasse: boolean;
}

/** Gera um identificador aleatório (32 letras e números), usado como nome do arquivo da ficha. */
export function novoId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function idValido(id: string): boolean {
  return /^[a-z0-9-]{8,64}$/.test(id);
}

export function criarFichaVazia(opcoes: OpcoesNovaFicha): Ficha {
  const agora = new Date().toISOString();
  return {
    id: novoId(),
    sistema: "dnd5e",
    versaoRegras: opcoes.versaoRegras,
    regrasDaMesa: { multiclasse: opcoes.multiclasse },
    nome: opcoes.nome.trim() || "Novo personagem",
    schemaVersion: SCHEMA_ATUAL,
    criadaEm: agora,
    atualizadaEm: agora,
    dados: dadosVazios(),
  };
}

// ---------- Leitura defensiva ----------
// Arquivos de ficha podem estar incompletos (versões antigas) ou ter sido editados à mão.
// Tudo que o motor de regras usa precisa ser número válido; o resto é completado com o padrão.

function texto(valor: unknown, padrao: string): string {
  return typeof valor === "string" ? valor : padrao;
}

function numero(valor: unknown, padrao: number, minimo: number, maximo: number): number {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return padrao;
  return Math.min(maximo, Math.max(minimo, Math.trunc(valor)));
}

function registro(valor: unknown): Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

/** Converte o conteúdo lido de um arquivo em uma ficha válida. Lança erro se não for uma ficha. */
export function normalizarFicha(bruto: unknown, idDoArquivo: string): Ficha {
  if (typeof bruto !== "object" || bruto === null || Array.isArray(bruto)) {
    throw new Error("O arquivo não contém uma ficha.");
  }
  const f = bruto as Record<string, unknown>;
  const padrao = dadosVazios();
  const d = registro(f.dados);
  const agora = new Date().toISOString();

  const atributos: Record<string, number> = {};
  const resistencias: Record<string, number> = {};
  const lidosAtributos = registro(d.atributos);
  const prof = registro(d.proficiencia);
  const lidasResistencias = registro(prof.resistencias);
  for (const a of dnd5e2014.atributos) {
    atributos[a.id] = numero(lidosAtributos[a.id], padrao.atributos[a.id], 1, 30);
    resistencias[a.id] = numero(lidasResistencias[a.id], 0, 0, 1);
  }

  const pericias: Record<string, number> = {};
  const lidasPericias = registro(prof.pericias);
  for (const p of dnd5e2014.pericias) {
    pericias[p.id] = numero(lidasPericias[p.id], 0, 0, 2);
  }

  const sobrescritas: Record<string, number> = {};
  for (const [chave, valor] of Object.entries(registro(d.sobrescritas))) {
    if (typeof valor === "number" && Number.isFinite(valor)) sobrescritas[chave] = valor;
  }

  const vida = registro(d.vida);

  return {
    id: idDoArquivo,
    sistema: "dnd5e",
    versaoRegras: f.versaoRegras === "2024" ? "2024" : "2014",
    regrasDaMesa: { multiclasse: registro(f.regrasDaMesa).multiclasse === true },
    nome: texto(f.nome, "Sem nome"),
    schemaVersion: SCHEMA_ATUAL,
    criadaEm: texto(f.criadaEm, agora),
    atualizadaEm: texto(f.atualizadaEm, agora),
    dados: {
      jogador: texto(d.jogador, ""),
      raca: texto(d.raca, ""),
      classe: texto(d.classe, ""),
      antecedente: texto(d.antecedente, ""),
      alinhamento: texto(d.alinhamento, ""),
      nivel: numero(d.nivel, 1, 1, 20),
      atributos,
      proficiencia: { pericias, resistencias },
      sobrescritas,
      vida: {
        atual: numero(vida.atual, padrao.vida.atual, 0, 9999),
        maximo: numero(vida.maximo, padrao.vida.maximo, 0, 9999),
        temporario: numero(vida.temporario, 0, 0, 9999),
      },
      deslocamento: numero(d.deslocamento, padrao.deslocamento, 0, 999),
      anotacoes: texto(d.anotacoes, ""),
    },
  };
}

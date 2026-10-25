import { useSyncExternalStore } from "react";
import { registrarErro } from "../lib/diagnostico";
import { gravarJson, lerJson } from "../storage";
import { novoId } from "./ficha";
import {
  LIMITE_DO_HISTORICO,
  normalizarHistorico,
  type Rolagem,
} from "../engine/dados/historico";
import {
  dobrarDados,
  executar,
  formulaDeTeste,
  interpretar,
  type ModoD20,
} from "../engine/dados/rolar";

const ARQUIVO = "rolagens.json";
const ESPERA_PARA_SALVAR_MS = 500;

export interface EstadoDados {
  itens: Rolagem[];
  modo: ModoD20;
  painelAberto: boolean;
  /** Identificação da rolagem mais recente. */
  ultimaId: string | null;
}

let estado: EstadoDados = { itens: [], modo: "normal", painelAberto: false, ultimaId: null };
const ouvintes = new Set<() => void>();
let temporizador: number | undefined;

function definir(parcial: Partial<EstadoDados>) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

export function useDados(): EstadoDados {
  return useSyncExternalStore(assinar, () => estado, () => estado);
}

function agendarSalvamento() {
  window.clearTimeout(temporizador);
  temporizador = window.setTimeout(() => {
    gravarJson(ARQUIVO, { versao: 1, itens: estado.itens }).catch((erro) =>
      registrarErro("salvar-rolagens", erro),
    );
  }, ESPERA_PARA_SALVAR_MS);
}

/** Lê o histórico guardado ao abrir o app. */
export async function carregarRolagens(): Promise<void> {
  try {
    const bruto = await lerJson<unknown>(ARQUIVO);
    if (bruto) {
      // Se já houve rolagens enquanto lia, mantém as novas na frente.
      const novas = estado.itens;
      const antigas = normalizarHistorico(bruto).filter((a) => !novas.some((n) => n.id === a.id));
      definir({ itens: [...novas, ...antigas].slice(0, LIMITE_DO_HISTORICO) });
    }
  } catch (erro) {
    registrarErro("carregar-rolagens", erro);
  }
}

export type RespostaRolagem = { ok: true; rolagem: Rolagem } | { ok: false; erro: string };

/**
 * Rola uma fórmula (ex.: "2d8+3"), usa o modo atual (normal, vantagem ou desvantagem)
 * e guarda no histórico.
 */
export function rolar(
  formula: string,
  nome: string,
  origem = "",
  opcoes: { critico?: boolean } = {},
): RespostaRolagem {
  try {
    let interpretada = interpretar(formula);
    if (opcoes.critico) interpretada = dobrarDados(interpretada);
    const resultado = executar(interpretada, { modo: estado.modo });
    const rolagem: Rolagem = {
      id: novoId(),
      quando: new Date().toISOString(),
      nome: nome.trim() || resultado.formula,
      origem,
      resultado,
    };
    definir({
      itens: [rolagem, ...estado.itens].slice(0, LIMITE_DO_HISTORICO),
      ultimaId: rolagem.id,
    });
    agendarSalvamento();
    return { ok: true, rolagem };
  } catch (erro) {
    return { ok: false, erro: erro instanceof Error ? erro.message : String(erro) };
  }
}

/** Teste de d20 com modificador (perícia, atributo, resistência, iniciativa, ataque). */
export function rolarTeste(modificador: number, nome: string, origem = ""): RespostaRolagem {
  return rolar(formulaDeTeste(modificador), nome, origem);
}

export function definirModo(modo: ModoD20): void {
  definir({ modo });
}

export function abrirPainel(): void {
  definir({ painelAberto: true });
}

export function fecharPainel(): void {
  definir({ painelAberto: false });
}

export function limparHistorico(): void {
  definir({ itens: [], ultimaId: null });
  agendarSalvamento();
}

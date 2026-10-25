import { useSyncExternalStore } from "react";
import { gravarJson, lerJson } from "../storage";
import { registrarErro } from "./diagnostico";

export type Tema = "light" | "dark";
export type Fonte = "small" | "medium" | "large";

interface Preferencias {
  tema: Tema;
  fonte: Fonte;
}

const ARQUIVO = "preferencias.json";
// Cópia rápida usada só para o app abrir já com o tema certo (ver public/tema-inicial.js).
// A fonte de verdade é o arquivo preferencias.json.
const ESPELHO_TEMA = "gj-tema";
const ESPELHO_FONTE = "gj-fonte";

function normalizar(valor: Partial<Preferencias> | null | undefined): Preferencias {
  return {
    tema: valor?.tema === "dark" ? "dark" : "light",
    fonte: valor?.fonte === "small" || valor?.fonte === "large" ? valor.fonte : "medium",
  };
}

function lerDoDocumento(): Preferencias {
  const raiz = document.documentElement;
  return normalizar({
    tema: raiz.dataset.theme as Tema | undefined,
    fonte: raiz.dataset.fonte as Fonte | undefined,
  });
}

let estado: Preferencias = lerDoDocumento();
const ouvintes = new Set<() => void>();

function aplicar(novo: Preferencias) {
  estado = novo;
  const raiz = document.documentElement;
  raiz.dataset.theme = novo.tema;
  raiz.dataset.fonte = novo.fonte;
  try {
    localStorage.setItem(ESPELHO_TEMA, novo.tema);
    localStorage.setItem(ESPELHO_FONTE, novo.fonte);
  } catch {
    // Sem o espelho, o único efeito é um pequeno piscar de tema ao abrir.
  }
  ouvintes.forEach((avisar) => avisar());
}

async function salvar() {
  try {
    await gravarJson(ARQUIVO, estado);
  } catch (erro) {
    registrarErro("preferencias", erro);
  }
}

/** Lê o arquivo de preferências ao abrir o app. */
export async function carregarPreferencias(): Promise<void> {
  try {
    const salvo = await lerJson<Partial<Preferencias>>(ARQUIVO);
    if (salvo) aplicar(normalizar(salvo));
  } catch (erro) {
    registrarErro("preferencias", erro);
  }
}

export async function escolherTema(tema: Tema): Promise<void> {
  aplicar({ ...estado, tema });
  await salvar();
}

export async function escolherFonte(fonte: Fonte): Promise<void> {
  aplicar({ ...estado, fonte });
  await salvar();
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

// Qualquer tela que use estes ganchos se atualiza quando o tema ou a fonte mudam,
// venha a mudança do botão do cabeçalho ou das Configurações.
export function useTema(): Tema {
  return useSyncExternalStore(assinar, () => estado.tema, () => estado.tema);
}

export function useFonte(): Fonte {
  return useSyncExternalStore(assinar, () => estado.fonte, () => estado.fonte);
}

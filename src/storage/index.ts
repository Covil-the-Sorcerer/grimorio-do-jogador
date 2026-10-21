import type { Armazenamento } from "./armazenamento";
import { ArmazenamentoNavegador } from "./navegador";
import { dentroDoTauri } from "./tauri";
import { ArmazenamentoWindows } from "./windows";

let instancia: Armazenamento | null = null;

/** Devolve o armazenamento certo para onde o app está rodando. */
export function armazenamento(): Armazenamento {
  if (!instancia) {
    instancia = dentroDoTauri() ? new ArmazenamentoWindows() : new ArmazenamentoNavegador();
  }
  return instancia;
}

export function rodandoComoApp(): boolean {
  return dentroDoTauri();
}

/** Lê um arquivo JSON. Devolve null se ele não existir; lança erro se o conteúdo estiver quebrado. */
export async function lerJson<T>(caminho: string): Promise<T | null> {
  const texto = await armazenamento().ler(caminho);
  if (texto === null) return null;
  return JSON.parse(texto) as T;
}

export async function gravarJson(caminho: string, valor: unknown): Promise<void> {
  await armazenamento().gravar(caminho, JSON.stringify(valor, null, 2));
}

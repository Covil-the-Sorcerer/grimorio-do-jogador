import { gravarJson, lerJson } from "../storage";

export interface RegistroErro {
  quando: string;
  origem: string;
  mensagem: string;
  pilha?: string;
}

const ARQUIVO_ERROS = "diagnostico/erros.json";
const MAXIMO = 30;

let erros: RegistroErro[] = [];

function descrever(erro: unknown): { mensagem: string; pilha?: string } {
  if (erro instanceof Error) return { mensagem: erro.message, pilha: erro.stack };
  if (typeof erro === "string") return { mensagem: erro };
  try {
    return { mensagem: JSON.stringify(erro) };
  } catch {
    return { mensagem: String(erro) };
  }
}

/** Guarda o erro na memória e, se possível, em arquivo (para sobreviver se o app fechar). */
export function registrarErro(origem: string, erro: unknown): void {
  const { mensagem, pilha } = descrever(erro);
  erros = [...erros, { quando: new Date().toISOString(), origem, mensagem, pilha }].slice(-MAXIMO);
  // Melhor esforço: se o próprio armazenamento estiver com problema, não faz nada.
  void gravarJson(ARQUIVO_ERROS, erros).catch(() => undefined);
}

export function errosDestaSessao(): RegistroErro[] {
  return erros;
}

/** Erros guardados em arquivo (inclui os de sessões anteriores). */
export async function errosGuardados(): Promise<RegistroErro[]> {
  try {
    return (await lerJson<RegistroErro[]>(ARQUIVO_ERROS)) ?? [];
  } catch {
    return [];
  }
}

/** Liga a captura de erros que ninguém tratou. */
export function iniciarCapturaDeErros(): void {
  window.addEventListener("error", (evento) => {
    registrarErro("janela", evento.error ?? evento.message);
  });
  window.addEventListener("unhandledrejection", (evento) => {
    registrarErro("promessa", evento.reason);
  });
}

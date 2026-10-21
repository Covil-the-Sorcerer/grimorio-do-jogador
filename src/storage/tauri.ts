// Ponte com o Tauri (o "embrulho" que transforma o site em programa de Windows).
// O Tauri expõe window.__TAURI__ quando "withGlobalTauri" está ligado na configuração.
interface TauriGlobal {
  core: {
    invoke: <T>(comando: string, argumentos?: Record<string, unknown>) => Promise<T>;
  };
}

declare global {
  interface Window {
    __TAURI__?: TauriGlobal;
  }
}

export function dentroDoTauri(): boolean {
  return typeof window !== "undefined" && typeof window.__TAURI__?.core?.invoke === "function";
}

export function chamar<T>(comando: string, argumentos?: Record<string, unknown>): Promise<T> {
  const invocar = window.__TAURI__?.core?.invoke;
  if (!invocar) {
    return Promise.reject(new Error("O ambiente do aplicativo (Tauri) não está disponível."));
  }
  return invocar<T>(comando, argumentos);
}

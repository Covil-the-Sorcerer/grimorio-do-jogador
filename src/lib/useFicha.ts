import { useCallback, useEffect, useRef, useState } from "react";
import { lerFicha, salvarFicha } from "../data/fichas";
import type { Ficha } from "../data/ficha";
import { registrarErro } from "./diagnostico";

export type EstadoSalvamento = "salvo" | "salvando" | "erro";

const ESPERA_PARA_SALVAR_MS = 400;

/** Carrega uma ficha e salva sozinho, pouco depois de cada alteração. */
export function useFicha(id: string | undefined) {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvamento, setSalvamento] = useState<EstadoSalvamento>("salvo");

  const fichaAtual = useRef<Ficha | null>(null);
  const pendente = useRef<Ficha | null>(null);
  const temporizador = useRef<number | undefined>(undefined);

  const descarregar = useCallback(async () => {
    window.clearTimeout(temporizador.current);
    temporizador.current = undefined;
    const paraSalvar = pendente.current;
    if (!paraSalvar) return;
    pendente.current = null;
    setSalvamento("salvando");
    try {
      await salvarFicha(paraSalvar);
      if (pendente.current === null) setSalvamento("salvo");
    } catch (e) {
      registrarErro("salvar-ficha", e);
      setSalvamento("erro");
    }
  }, []);

  // Carrega a ficha ao abrir (ou quando o id muda).
  useEffect(() => {
    let cancelado = false;
    fichaAtual.current = null;
    pendente.current = null;
    setFicha(null);
    setErro(null);
    setSalvamento("salvo");
    setCarregando(true);

    if (!id) {
      setCarregando(false);
      setErro("not-found");
      return;
    }

    lerFicha(id)
      .then((lida) => {
        if (cancelado) return;
        if (!lida) {
          setErro("not-found");
        } else {
          fichaAtual.current = lida;
          setFicha(lida);
        }
      })
      .catch((e) => {
        if (cancelado) return;
        registrarErro("abrir-ficha", e);
        setErro(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Ao sair da tela ou esconder a janela, salva o que estiver pendente.
  useEffect(() => {
    const aoEsconder = () => {
      if (document.visibilityState === "hidden") void descarregar();
    };
    document.addEventListener("visibilitychange", aoEsconder);
    window.addEventListener("pagehide", aoEsconder);
    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      window.removeEventListener("pagehide", aoEsconder);
      void descarregar();
    };
  }, [descarregar]);

  const atualizar = useCallback(
    (mutar: (rascunho: Ficha) => void) => {
      const atual = fichaAtual.current;
      if (!atual) return;
      const copia = structuredClone(atual);
      mutar(copia);
      copia.atualizadaEm = new Date().toISOString();
      fichaAtual.current = copia;
      pendente.current = copia;
      setFicha(copia);
      setSalvamento("salvando");
      window.clearTimeout(temporizador.current);
      temporizador.current = window.setTimeout(() => {
        void descarregar();
      }, ESPERA_PARA_SALVAR_MS);
    },
    [descarregar],
  );

  return { ficha, carregando, erro, salvamento, atualizar };
}

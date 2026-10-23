import { useEffect, useState } from "react";
import { lerRetrato } from "../data/retratos";
import { registrarErro } from "./diagnostico";

/** Carrega a imagem de perfil de uma ficha (se existir) e permite trocar o valor mostrado. */
export function useRetrato(id: string | undefined, temRetrato: boolean | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    if (!id || !temRetrato) {
      setUrl(null);
      return;
    }
    lerRetrato(id)
      .then((imagem) => {
        if (!cancelado) setUrl(imagem);
      })
      .catch((erro) => registrarErro("ler-retrato", erro));
    return () => {
      cancelado = true;
    };
  }, [id, temRetrato]);

  return { url, definir: setUrl };
}

import { useEffect, useState } from "react";
import { CartaoRolagem } from "./CartaoRolagem";
import { abrirPainel, useDados } from "../data/rolagens";
import { t } from "../i18n/pt-BR";

const TEMPO_NA_TELA_MS = 6000;

// Mostra por alguns segundos o resultado da última rolagem, quando o painel de dados está fechado.
export function ResultadoRapido() {
  const dados = useDados();
  const [visivelId, setVisivelId] = useState<string | null>(null);

  useEffect(() => {
    if (!dados.ultimaId || dados.painelAberto) return;
    setVisivelId(dados.ultimaId);
    const temporizador = window.setTimeout(() => setVisivelId(null), TEMPO_NA_TELA_MS);
    return () => window.clearTimeout(temporizador);
  }, [dados.ultimaId, dados.painelAberto]);

  if (dados.painelAberto || !visivelId) return null;
  const rolagem = dados.itens.find((item) => item.id === visivelId);
  if (!rolagem) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 right-4 z-40 w-[20rem] max-w-[calc(100vw-2rem)] space-y-2 rounded-xl border border-borda bg-fundo p-2 shadow-xl"
    >
      <CartaoRolagem rolagem={rolagem} />
      <button type="button" className="btn btn-secundario w-full !min-h-[40px]" onClick={abrirPainel}>
        {t.dados.verHistorico}
      </button>
    </div>
  );
}

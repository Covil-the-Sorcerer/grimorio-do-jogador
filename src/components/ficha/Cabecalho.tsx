import { Link } from "react-router-dom";
import { useState } from "react";
import type { PropsAba } from "./tipos";
import { formatarSinal } from "./tipos";
import { CampoNumero } from "../CampoNumero";
import { aplicarCura, aplicarDano } from "../../systems/dnd5e/2014/vida";
import type { EstadoSalvamento } from "../../lib/useFicha";
import { t } from "../../i18n/pt-BR";

const TEXTO_SALVAMENTO: Record<EstadoSalvamento, string> = {
  salvo: t.ficha.salvo,
  salvando: t.ficha.salvando,
  erro: t.ficha.erroSalvar,
};

// Faixa fixa no topo da ficha: nome, PV com botões de dano e cura, CA e iniciativa.
export function Cabecalho({
  ficha,
  calc,
  atualizar,
  salvamento,
}: PropsAba & { salvamento: EstadoSalvamento }) {
  const [quantidade, setQuantidade] = useState(1);
  const { vida, nivel, classe } = ficha.dados;
  const ca = calc.ca;
  const iniciativa = calc.iniciativa;

  return (
    <header className="sticky top-[var(--altura-topo)] z-20 -mx-4 border-b border-borda bg-fundo px-4 pb-3 pt-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/fichas" className="text-sm font-semibold text-destaque underline underline-offset-2">
            {t.ficha.voltarLista}
          </Link>
          <h1 className="truncate text-xl font-bold">{ficha.nome}</h1>
          <p className="truncate text-sm text-suave">
            {t.fichas.nivel} {nivel}
            {classe ? ` · ${classe}` : ""}
          </p>
        </div>
        <span
          role="status"
          className={`shrink-0 text-sm ${salvamento === "erro" ? "font-semibold text-perigo" : "text-suave"}`}
        >
          {TEXTO_SALVAMENTO[salvamento]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-secundario !min-w-[44px] !px-0 text-xl"
            aria-label={`${t.ficha.causarDano}: ${quantidade}`}
            onClick={() =>
              atualizar((f) => {
                f.dados.vida = aplicarDano(f.dados.vida, quantidade);
              })
            }
          >
            −
          </button>
          <div className="min-w-[96px] text-center" aria-live="polite">
            <div className="text-xs font-semibold text-suave">{t.ficha.pv}</div>
            <div className="text-2xl font-bold leading-tight">
              {vida.atual}
              <span className="text-base font-semibold text-suave"> / {vida.maximo}</span>
            </div>
            {vida.temporario > 0 && (
              <div className="text-xs text-suave">
                +{vida.temporario} {t.ficha.pvTemporario}
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secundario !min-w-[44px] !px-0 text-xl"
            aria-label={`${t.ficha.curar}: ${quantidade}`}
            onClick={() =>
              atualizar((f) => {
                f.dados.vida = aplicarCura(f.dados.vida, quantidade);
              })
            }
          >
            +
          </button>
          <div className="w-20">
            <CampoNumero
              valor={quantidade}
              minimo={0}
              maximo={999}
              aoMudar={setQuantidade}
              rotulo={t.ficha.quantidade}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-xs font-semibold text-suave">{t.ficha.ca}</div>
            <div className={`text-2xl font-bold ${ca.sobrescrito ? "text-destaque" : ""}`}>{ca.efetivo}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-suave">{t.ficha.iniciativa}</div>
            <div className={`text-2xl font-bold ${iniciativa.sobrescrito ? "text-destaque" : ""}`}>
              {formatarSinal(iniciativa.efetivo)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

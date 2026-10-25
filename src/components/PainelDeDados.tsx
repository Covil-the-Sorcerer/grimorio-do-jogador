import { useEffect, useState, type FormEvent } from "react";
import { CartaoRolagem } from "./CartaoRolagem";
import { IconeDado } from "./IconeDado";
import { Modal } from "./Modal";
import {
  definirModo,
  fecharPainel,
  limparHistorico,
  rolar,
  useDados,
} from "../data/rolagens";
import type { ModoD20 } from "../engine/dados/rolar";
import { t } from "../i18n/pt-BR";

const DADOS = [4, 6, 8, 10, 12, 20, 100];

const MODOS: { valor: ModoD20; rotulo: string }[] = [
  { valor: "normal", rotulo: t.dados.normal },
  { valor: "vantagem", rotulo: t.dados.vantagem },
  { valor: "desvantagem", rotulo: t.dados.desvantagem },
];

// Painel lateral de dados: dados rápidos, fórmula livre, vantagem/desvantagem e histórico.
export function PainelDeDados() {
  const dados = useDados();
  const [formula, setFormula] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [limpando, setLimpando] = useState(false);

  // Esc fecha o painel (a janela de confirmação tem o próprio Esc).
  useEffect(() => {
    if (limpando) return;
    function aoApertar(evento: KeyboardEvent) {
      if (evento.key === "Escape") fecharPainel();
    }
    window.addEventListener("keydown", aoApertar);
    return () => window.removeEventListener("keydown", aoApertar);
  }, [limpando]);

  function rolarFormula(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const resposta = rolar(formula, formula.replace(/\s+/g, ""), "");
    setErro(resposta.ok ? null : resposta.erro);
  }

  return (
    <aside
      aria-label={t.dados.titulo}
      className="fixed inset-y-0 right-0 z-[55] flex w-[26rem] max-w-full flex-col border-l border-borda bg-fundo shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2 border-b border-borda bg-superficie px-4 py-3">
        <h2 className="text-lg font-bold">{t.dados.titulo}</h2>
        <button
          type="button"
          onClick={fecharPainel}
          className="btn btn-secundario !min-w-[44px] !px-0"
          aria-label={t.dados.fechar}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-2">
          {DADOS.map((lados) => (
            <button
              key={lados}
              type="button"
              onClick={() => rolar(`1d${lados}`, `d${lados}`)}
              aria-label={`${t.dados.rolarDado} d${lados}`}
              title={`${t.dados.rolarDado} d${lados}`}
              className="btn btn-secundario !h-14 !w-14 !min-h-0 !p-0"
            >
              <IconeDado rotulo={`d${lados}`} tamanho={44} />
            </button>
          ))}
        </div>

        <div>
          <div className="mb-1 text-sm font-semibold" id="rotulo-modo">
            {t.dados.modo}
          </div>
          <div role="radiogroup" aria-labelledby="rotulo-modo" className="grid grid-cols-3 gap-2">
            {MODOS.map((modo) => {
              const marcado = dados.modo === modo.valor;
              return (
                <button
                  key={modo.valor}
                  type="button"
                  role="radio"
                  aria-checked={marcado}
                  onClick={() => definirModo(modo.valor)}
                  className={`btn !px-2 text-sm ${marcado ? "btn-primario" : "btn-secundario"}`}
                >
                  {modo.rotulo}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-suave">{t.dados.avisoModo}</p>
        </div>

        <form onSubmit={rolarFormula} className="space-y-2">
          <label htmlFor="formula-dados" className="block text-sm font-semibold">
            {t.dados.formula}
          </label>
          <div className="flex gap-2">
            <input
              id="formula-dados"
              type="text"
              value={formula}
              placeholder={t.dados.formulaDica}
              onChange={(evento) => {
                setFormula(evento.target.value);
                setErro(null);
              }}
              autoComplete="off"
              className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto"
            />
            <button type="submit" className="btn btn-primario">
              {t.dados.rolar}
            </button>
          </div>
          {erro && (
            <p role="alert" className="rounded-lg border border-perigo p-2 text-sm text-perigo">
              {erro}
            </p>
          )}
        </form>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-base font-bold">{t.dados.historico}</h3>
            {dados.itens.length > 0 && (
              <button type="button" className="btn btn-secundario !min-h-[36px] !py-1 text-sm" onClick={() => setLimpando(true)}>
                {t.dados.limpar}
              </button>
            )}
          </div>
          {dados.itens.length === 0 ? (
            <p className="text-sm text-suave">{t.dados.vazio}</p>
          ) : (
            <ul className="space-y-2" aria-live="polite">
              {dados.itens.map((rolagem) => (
                <li key={rolagem.id}>
                  <CartaoRolagem rolagem={rolagem} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {limpando && (
        <Modal titulo={t.dados.limparTitulo} aoFechar={() => setLimpando(false)}>
          <p className="mb-5 text-sm text-suave">{t.dados.limparTexto}</p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secundario" onClick={() => setLimpando(false)}>
              {t.geral.cancelar}
            </button>
            <button
              type="button"
              className="btn btn-primario"
              onClick={() => {
                limparHistorico();
                setLimpando(false);
              }}
            >
              {t.dados.limpar}
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
}

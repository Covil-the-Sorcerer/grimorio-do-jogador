import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "../i18n/pt-BR";

function semMovimento(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Barra de abas com rolagem lateral escondida: quando há abas fora da tela, a ponta correspondente
// fica com um efeito de esmaecer e uma seta (clicável). Ao chegar no limite, o efeito some.
export function AbasRolaveis<I extends string>({
  abas,
  atual,
  aoEscolher,
  rotulo,
}: {
  abas: { id: I; rotulo: string }[];
  atual: I;
  aoEscolher: (id: I) => void;
  rotulo: string;
}) {
  const lista = useRef<HTMLDivElement>(null);
  const [haEsquerda, setHaEsquerda] = useState(false);
  const [haDireita, setHaDireita] = useState(false);

  const medir = useCallback(() => {
    const el = lista.current;
    if (!el) return;
    setHaEsquerda(el.scrollLeft > 1);
    setHaDireita(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
      observador.disconnect();
    };
  }, [medir]);

  // Mantém a aba escolhida sempre à vista.
  useEffect(() => {
    const botao = lista.current?.querySelector<HTMLElement>(`[data-aba="${atual}"]`);
    botao?.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: semMovimento() ? "auto" : "smooth",
    });
  }, [atual]);

  function rolarPara(direcao: 1 | -1) {
    const el = lista.current;
    if (!el) return;
    el.scrollBy({
      left: direcao * el.clientWidth * 0.7,
      behavior: semMovimento() ? "auto" : "smooth",
    });
  }

  return (
    <div className="relative -mx-4">
      <div
        ref={lista}
        role="tablist"
        aria-label={rotulo}
        className="sem-barra flex gap-1 overflow-x-auto border-b border-borda px-4 py-2"
      >
        {abas.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`aba-${item.id}`}
            data-aba={item.id}
            aria-selected={atual === item.id}
            aria-controls="painel-ficha"
            onClick={() => aoEscolher(item.id)}
            onFocus={(evento) =>
              evento.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest" })
            }
            className={`btn shrink-0 whitespace-nowrap ${atual === item.id ? "btn-primario" : "btn-secundario"}`}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      {haEsquerda && (
        <div className="fade-aba fade-aba-esq pointer-events-none absolute inset-y-0 left-0 flex w-16 items-center pl-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => rolarPara(-1)}
            aria-label={t.ficha.abasAnteriores}
            title={t.ficha.abasAnteriores}
            className="seta-aba pointer-events-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {haDireita && (
        <div className="fade-aba fade-aba-dir pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-end pr-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => rolarPara(1)}
            aria-label={t.ficha.abasSeguintes}
            title={t.ficha.abasSeguintes}
            className="seta-aba pointer-events-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

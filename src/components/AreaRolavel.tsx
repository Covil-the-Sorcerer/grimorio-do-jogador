import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { t } from "../i18n/pt-BR";

function semMovimento(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Área com rolagem para baixo sem barra visível: nas bordas com mais conteúdo, aparece um
// esmaecer com uma seta clicável. A barra não ocupa espaço, então nada é espremido.
export function AreaRolavel({
  children,
  className = "",
  classeInterna = "",
}: {
  children: ReactNode;
  className?: string;
  classeInterna?: string;
}) {
  const rolagem = useRef<HTMLDivElement>(null);
  const [haAcima, setHaAcima] = useState(false);
  const [haAbaixo, setHaAbaixo] = useState(false);

  const medir = useCallback(() => {
    const el = rolagem.current;
    if (!el) return;
    setHaAcima(el.scrollTop > 1);
    setHaAbaixo(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = rolagem.current;
    if (!el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    // O conteúdo muda de altura quando entram novos itens (ex.: novas rolagens).
    if (el.firstElementChild) observador.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", medir);
      observador.disconnect();
    };
  }, [medir]);

  function rolarPara(direcao: 1 | -1) {
    const el = rolagem.current;
    if (!el) return;
    el.scrollBy({ top: direcao * el.clientHeight * 0.7, behavior: semMovimento() ? "auto" : "smooth" });
  }

  return (
    <div className={`relative flex min-h-0 flex-col ${className}`}>
      <div ref={rolagem} className="sem-barra min-h-0 flex-1 overflow-y-auto">
        <div className={classeInterna}>{children}</div>
      </div>

      {haAcima && (
        <div className="fade-vert-topo pointer-events-none absolute inset-x-0 top-0 flex h-14 items-start justify-center pt-1">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => rolarPara(-1)}
            aria-label={t.geral.verAcima}
            title={t.geral.verAcima}
            className="seta-aba pointer-events-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {haAbaixo && (
        <div className="fade-vert-base pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-end justify-center pb-1">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => rolarPara(1)}
            aria-label={t.geral.verAbaixo}
            title={t.geral.verAbaixo}
            className="seta-aba pointer-events-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

import { escolherTema, useTema } from "../lib/preferencias";
import { t } from "../i18n/pt-BR";

// Botão rápido para alternar entre tema claro e escuro.
export function ThemeToggle() {
  const tema = useTema();
  const escuro = tema === "dark";
  const rotulo = escuro ? t.tema.paraClaro : t.tema.paraEscuro;

  return (
    <button
      type="button"
      onClick={() => void escolherTema(escuro ? "light" : "dark")}
      className="btn btn-secundario !min-w-[44px] !px-0"
      aria-label={rotulo}
      title={rotulo}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {escuro ? (
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
        ) : (
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

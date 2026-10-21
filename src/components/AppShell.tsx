import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { VERSAO_DO_APP } from "../versao";
import { t } from "../i18n/pt-BR";

const LINKS = [
  { to: "/fichas", rotulo: t.menu.fichas },
  { to: "/homebrew", rotulo: t.menu.homebrew },
  { to: "/configuracoes", rotulo: t.menu.configuracoes },
];

const TELA_LARGA = "(min-width: 1024px)";

// Diz se a janela está larga o bastante para mostrar o menu fixo na lateral.
function useTelaLarga(): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const consulta = window.matchMedia(TELA_LARGA);
      consulta.addEventListener("change", avisar);
      return () => consulta.removeEventListener("change", avisar);
    },
    () => window.matchMedia(TELA_LARGA).matches,
  );
}

// Menu lateral + barra do topo. Em janela larga o menu fica fixo; em janela estreita vira gaveta.
export function AppShell() {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();
  const larga = useTelaLarga();

  // Fecha a gaveta ao trocar de página.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  // Fecha a gaveta com a tecla Esc.
  useEffect(() => {
    if (!aberto) return;
    function aoApertar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    window.addEventListener("keydown", aoApertar);
    return () => window.removeEventListener("keydown", aoApertar);
  }, [aberto]);

  // Menu escondido (fechado e em janela estreita) sai da navegação por teclado.
  const escondido = !larga && !aberto;

  return (
    <div className="min-h-screen lg:flex">
      {aberto && !larga && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setAberto(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="menu-lateral"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-borda bg-superficie transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={escondido}
        {...(escondido ? { inert: true } : {})}
      >
        <div className="flex items-center justify-between gap-2 border-b border-borda px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Logo tamanho={32} />
            <span className="truncate text-lg font-bold">{t.app.nome}</span>
          </div>
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="btn btn-secundario !min-w-[44px] !px-0 lg:hidden"
            aria-label={t.menu.fechar}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2" aria-label={t.menu.principal}>
          <ul className="space-y-1">
            {LINKS.map((item) => {
              const ativo = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={ativo ? "page" : undefined}
                    className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-semibold ${
                      ativo ? "bg-superficie2 text-destaque" : "text-texto hover:bg-superficie2"
                    }`}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-borda px-4 py-3 text-sm text-suave">v{VERSAO_DO_APP}</div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-borda bg-superficie px-3 py-2">
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="btn btn-secundario !min-w-[44px] !px-0 lg:hidden"
            aria-label={t.menu.abrir}
            aria-expanded={aberto}
            aria-controls="menu-lateral"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
            <Logo tamanho={28} />
            <span className="truncate text-lg font-bold">{t.app.nome}</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

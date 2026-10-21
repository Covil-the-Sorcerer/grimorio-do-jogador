import { Component, type ErrorInfo, type ReactNode } from "react";
import { registrarErro } from "../lib/diagnostico";
import { t } from "../i18n/pt-BR";
import { VERSAO_DO_APP } from "../versao";

interface Estado {
  erro: Error | null;
}

// Evita a "tela em branco": se algo quebrar ao desenhar uma tela, mostra o erro de forma legível.
export class ErrorBoundary extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { erro: null };

  static getDerivedStateFromError(erro: Error): Estado {
    return { erro };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    registrarErro("react", erro);
    registrarErro("react-pilha", info.componentStack ?? "");
  }

  render() {
    const { erro } = this.state;
    if (!erro) return this.props.children;

    const relatorio = `Grimório do Jogador v${VERSAO_DO_APP}\n${erro.message}\n\n${erro.stack ?? ""}`;

    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="cartao p-5">
          <h1 className="mb-2 text-xl font-bold">{t.erro.titulo}</h1>
          <p className="mb-4 text-suave">{t.erro.texto}</p>
          <textarea
            readOnly
            value={relatorio}
            rows={10}
            className="mb-4 w-full rounded-lg border border-borda bg-superficie2 p-3 font-mono text-sm text-texto"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button type="button" className="btn btn-primario" onClick={() => window.location.reload()}>
            {t.erro.recarregar}
          </button>
        </div>
      </div>
    );
  }
}

import { Link } from "react-router-dom";
import { VERSAO_DO_APP } from "../versao";
import { t } from "../i18n/pt-BR";

export function Sobre() {
  return (
    <section>
      <Link to="/configuracoes" className="link mb-4 inline-block">
        {t.sobre.voltar}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{t.sobre.titulo}</h1>

      <div className="space-y-4">
        <div className="cartao space-y-2 p-5">
          <h2 className="text-lg font-bold">{t.app.nome}</h2>
          <p className="text-sm text-suave">v{VERSAO_DO_APP}</p>
          <p className="text-sm">{t.sobre.texto}</p>
        </div>

        <div className="cartao space-y-2 p-5">
          <h2 className="text-lg font-bold">{t.sobre.srdTitulo}</h2>
          <p className="text-sm">{t.sobre.srdTexto}</p>
          <p lang="en" className="rounded-lg bg-superficie2 p-3 text-sm">
            {t.sobre.atribuicao}
          </p>
        </div>
      </div>
    </section>
  );
}

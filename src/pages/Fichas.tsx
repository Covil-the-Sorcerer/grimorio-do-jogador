import { t } from "../i18n/pt-BR";

export function Fichas() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t.fichas.titulo}</h1>
        <button type="button" className="btn btn-primario" disabled>
          {t.fichas.novaFicha}
        </button>
      </div>

      <div className="cartao px-5 py-10 text-center">
        <h2 className="text-lg font-bold">{t.fichas.vazioTitulo}</h2>
        <p className="mx-auto mt-2 max-w-sm text-suave">{t.fichas.vazioTexto}</p>
      </div>
    </section>
  );
}

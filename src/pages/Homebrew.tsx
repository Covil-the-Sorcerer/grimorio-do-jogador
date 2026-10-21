import { t } from "../i18n/pt-BR";

export function Homebrew() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">{t.homebrew.titulo}</h1>
      <div className="cartao px-5 py-10 text-center">
        <p className="mx-auto max-w-sm text-suave">{t.homebrew.vazioTexto}</p>
      </div>
    </section>
  );
}

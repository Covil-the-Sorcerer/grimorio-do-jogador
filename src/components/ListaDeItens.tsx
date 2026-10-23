import { useId, useState, type FormEvent } from "react";
import { t } from "../i18n/pt-BR";

// Lista de textos curtos: digite e aperte Enter para adicionar; toque no "x" para remover.
export function ListaDeItens({
  rotulo,
  itens,
  aoMudar,
}: {
  rotulo: string;
  itens: string[];
  aoMudar: (novos: string[]) => void;
}) {
  const id = useId();
  const [texto, setTexto] = useState("");

  function adicionar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const limpo = texto.trim().slice(0, 100);
    if (!limpo) return;
    const jaExiste = itens.some((item) => item.toLowerCase() === limpo.toLowerCase());
    if (!jaExiste) aoMudar([...itens, limpo]);
    setTexto("");
  }

  return (
    <div className="cartao p-5">
      <h2 className="mb-3 text-lg font-bold">{rotulo}</h2>

      {itens.length === 0 ? (
        <p className="mb-3 text-sm text-suave">{t.habil.nenhumItem}</p>
      ) : (
        <ul className="mb-3 flex flex-wrap gap-2">
          {itens.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1 rounded-full border border-borda bg-superficie2 py-1 pl-3 pr-1"
            >
              <span className="break-words">{item}</span>
              <button
                type="button"
                onClick={() => aoMudar(itens.filter((outro) => outro !== item))}
                aria-label={`${t.habil.remover}: ${item}`}
                title={t.habil.remover}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none hover:bg-borda"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={adicionar} className="flex gap-2">
        <label htmlFor={id} className="sr-only">
          {`${rotulo}: ${t.habil.digitarEEnter}`}
        </label>
        <input
          id={id}
          type="text"
          value={texto}
          placeholder={t.habil.digitarEEnter}
          onChange={(evento) => setTexto(evento.target.value)}
          className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto"
        />
        <button type="submit" className="btn btn-secundario">
          {t.habil.adicionar}
        </button>
      </form>
    </div>
  );
}

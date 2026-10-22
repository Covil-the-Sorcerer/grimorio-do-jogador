import { useRef, useState } from "react";
import type { Valor } from "../engine/rules/tipos";
import { t } from "../i18n/pt-BR";

// Mostra um valor calculado pelas regras. Tocar nele permite trocar à mão (override);
// o botão "Voltar ao automático" desfaz a troca.
export function CampoCalculado({
  rotulo,
  valor,
  aoMudar,
  comSinal = false,
}: {
  rotulo: string;
  valor: Valor;
  aoMudar: (novo: number | null) => void;
  comSinal?: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState("");
  const cancelado = useRef(false);

  const mostrar = (n: number) => (comSinal && n > 0 ? `+${n}` : String(n));

  function iniciar() {
    cancelado.current = false;
    setTexto(String(valor.efetivo));
    setEditando(true);
  }

  function confirmar() {
    setEditando(false);
    if (cancelado.current) {
      cancelado.current = false;
      return;
    }
    const numero = Number(texto);
    if (texto.trim() === "" || !Number.isFinite(numero)) return;
    const inteiro = Math.trunc(numero);
    // Digitar o mesmo número que a regra calcula equivale a voltar ao automático.
    aoMudar(inteiro === valor.calculado ? null : inteiro);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {editando ? (
        <input
          autoFocus
          type="number"
          inputMode="numeric"
          aria-label={rotulo}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onFocus={(evento) => evento.currentTarget.select()}
          onBlur={confirmar}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.currentTarget.blur();
            } else if (evento.key === "Escape") {
              cancelado.current = true;
              setEditando(false);
            }
          }}
          className="min-h-[44px] w-24 rounded-lg border-2 border-destaque bg-superficie px-3 py-2 text-center text-lg font-bold text-texto"
        />
      ) : (
        <button
          type="button"
          onClick={iniciar}
          title={t.ficha.tocarEditar}
          aria-label={`${rotulo}: ${mostrar(valor.efetivo)}. ${t.ficha.tocarEditar}`}
          className={`min-h-[44px] min-w-[64px] rounded-lg border px-3 py-2 text-center text-lg font-bold ${
            valor.sobrescrito
              ? "border-destaque bg-superficie2 text-destaque"
              : "border-borda bg-superficie text-texto hover:bg-superficie2"
          }`}
        >
          {mostrar(valor.efetivo)}
        </button>
      )}

      {valor.sobrescrito && !editando && (
        <>
          <span className="rounded-full bg-superficie2 px-2 py-0.5 text-xs font-semibold text-destaque">
            {t.ficha.manual}
          </span>
          <button
            type="button"
            onClick={() => aoMudar(null)}
            aria-label={`${t.ficha.automatico}: ${rotulo}`}
            className="min-h-[44px] rounded-lg px-2 text-sm font-semibold text-destaque underline underline-offset-2"
          >
            {t.ficha.automatico}
          </button>
        </>
      )}
    </div>
  );
}

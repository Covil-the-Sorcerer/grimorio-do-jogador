import { IconeDado } from "./IconeDado";

// Botão pequeno para rolar um d20 ligado a um número da ficha.
export function BotaoRolar({
  aoRolar,
  rotulo,
  texto,
}: {
  aoRolar: () => void;
  /** Texto lido por leitores de tela, ex.: "Rolar Furtividade". */
  rotulo: string;
  texto?: string;
}) {
  return (
    <button
      type="button"
      onClick={aoRolar}
      aria-label={rotulo}
      title={rotulo}
      className="btn btn-secundario !px-2"
    >
      <IconeDado rotulo="d20" tamanho={28} />
      {texto ? <span>{texto}</span> : null}
    </button>
  );
}

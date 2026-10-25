import type { ResultadoRolagem } from "../engine/dados/rolar";
import { t } from "../i18n/pt-BR";

// Mostra como o total foi formado, ex.: "1d20 [15, 8] + 5". Dados descartados aparecem riscados.
export function DetalheRolagem({ resultado }: { resultado: ResultadoRolagem }) {
  return (
    <span className="break-words text-sm text-suave">
      {resultado.grupos.map((grupo, indice) => (
        <span key={indice}>
          {grupo.sinal === -1 ? " − " : indice > 0 ? " + " : ""}
          {grupo.quantidade}d{grupo.lados} [{grupo.resultados.join(", ")}
          {grupo.descartados.length > 0 && (
            <>
              {", "}
              <s title={t.dados.descartado}>{grupo.descartados.join(", ")}</s>
            </>
          )}
          ]
        </span>
      ))}
      {resultado.modificador !== 0 && (
        <span>
          {resultado.modificador > 0 ? " + " : " − "}
          {Math.abs(resultado.modificador)}
        </span>
      )}
    </span>
  );
}

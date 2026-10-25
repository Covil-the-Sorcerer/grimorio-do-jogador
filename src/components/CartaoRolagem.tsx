import type { Rolagem } from "../engine/dados/historico";
import { DetalheRolagem } from "./DetalheRolagem";
import { t } from "../i18n/pt-BR";

function hora(iso: string): string {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "" : data.toLocaleTimeString("pt-BR");
}

// Um resultado de rolagem: nome, total, detalhe da conta e marcas (vantagem, 20 natural...).
export function CartaoRolagem({ rolagem }: { rolagem: Rolagem }) {
  const r = rolagem.resultado;
  const marcas: string[] = [];
  if (r.modo === "vantagem") marcas.push(t.dados.vantagem);
  if (r.modo === "desvantagem") marcas.push(t.dados.desvantagem);
  if (r.natural === 20) marcas.push(t.dados.natural20);
  if (r.natural === 1) marcas.push(t.dados.natural1);

  return (
    <div className="rounded-lg border border-borda bg-superficie p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words font-semibold">{rolagem.nome}</div>
          {rolagem.origem && <div className="truncate text-xs text-suave">{rolagem.origem}</div>}
        </div>
        <div className="shrink-0 text-3xl font-bold leading-none">{r.total}</div>
      </div>
      <div className="mt-1">
        <DetalheRolagem resultado={r} />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {marcas.map((marca) => (
            <span
              key={marca}
              className="rounded-full bg-superficie2 px-2 py-0.5 text-xs font-semibold text-destaque"
            >
              {marca}
            </span>
          ))}
        </div>
        <span className="text-xs text-suave">{hora(rolagem.quando)}</span>
      </div>
    </div>
  );
}

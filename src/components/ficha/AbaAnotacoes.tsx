import type { PropsAba } from "./tipos";
import { t } from "../../i18n/pt-BR";

export function AbaAnotacoes({ ficha, atualizar }: PropsAba) {
  return (
    <div className="cartao p-5">
      <label htmlFor="anotacoes" className="mb-1 block text-sm font-semibold">
        {t.anotacoes.rotulo}
      </label>
      <p className="mb-2 text-sm text-suave">{t.anotacoes.dica}</p>
      <textarea
        id="anotacoes"
        rows={14}
        value={ficha.dados.anotacoes}
        onChange={(evento) => atualizar((f) => void (f.dados.anotacoes = evento.target.value))}
        className="w-full rounded-lg border border-borda bg-superficie p-3 text-base text-texto"
      />
    </div>
  );
}

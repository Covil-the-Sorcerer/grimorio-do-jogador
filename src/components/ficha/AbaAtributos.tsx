import type { PropsAba } from "./tipos";
import { definirSobrescrita } from "./tipos";
import { CampoCalculado } from "../CampoCalculado";
import { CampoNumero } from "../CampoNumero";
import { dnd5e2014 } from "../../systems/dnd5e/2014/definicao";
import { t } from "../../i18n/pt-BR";

export function AbaAtributos({ ficha, calc, atualizar }: PropsAba) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-suave">{t.atributos.dica}</p>

      <div className="cartao flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="font-semibold">{t.atributos.bonusProficiencia}</span>
        <CampoCalculado
          rotulo={t.atributos.bonusProficiencia}
          valor={calc.bonusProficiencia}
          comSinal
          aoMudar={(v) => atualizar((f) => definirSobrescrita(f, "bonusProficiencia", v))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dnd5e2014.atributos.map((a) => {
          const proficiente = ficha.dados.proficiencia.resistencias[a.id] === 1;
          return (
            <div key={a.id} className="cartao space-y-3 p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold">{a.nome}</h2>
                <span className="text-sm font-semibold text-suave">{a.sigla}</span>
              </div>

              <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
                <span className="text-sm text-suave">{t.atributos.valor}</span>
                <CampoNumero
                  valor={ficha.dados.atributos[a.id]}
                  minimo={1}
                  maximo={30}
                  rotulo={`${t.atributos.valor} de ${a.nome}`}
                  aoMudar={(v) => atualizar((f) => void (f.dados.atributos[a.id] = v))}
                />
                <span className="text-sm text-suave">{t.atributos.modificador}</span>
                <CampoCalculado
                  rotulo={`${t.atributos.modificador} de ${a.nome}`}
                  valor={calc[`mod.${a.id}`]}
                  comSinal
                  aoMudar={(v) => atualizar((f) => definirSobrescrita(f, `mod.${a.id}`, v))}
                />
                <span className="text-sm text-suave">{t.atributos.resistencia}</span>
                <CampoCalculado
                  rotulo={`${t.atributos.resistencia} de ${a.nome}`}
                  valor={calc[`resistencia.${a.id}`]}
                  comSinal
                  aoMudar={(v) => atualizar((f) => definirSobrescrita(f, `resistencia.${a.id}`, v))}
                />
              </div>

              <label className="flex min-h-[44px] items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={proficiente}
                  onChange={(evento) =>
                    atualizar((f) => void (f.dados.proficiencia.resistencias[a.id] = evento.target.checked ? 1 : 0))
                  }
                  className="h-5 w-5 accent-[var(--destaque)]"
                />
                {t.atributos.proficienteResistencia}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

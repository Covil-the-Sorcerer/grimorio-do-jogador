import type { PropsAba } from "./tipos";
import { definirSobrescrita } from "./tipos";
import { BotaoRolar } from "../BotaoRolar";
import { CampoCalculado } from "../CampoCalculado";
import { rolarTeste } from "../../data/rolagens";
import { dnd5e2014 } from "../../systems/dnd5e/2014/definicao";
import { permiteEspecializacao } from "../../systems/dnd5e/2014/especializacao";
import { t } from "../../i18n/pt-BR";

const SIMBOLO = ["○", "●", "◆"];
const NOME_NIVEL = [t.pericias.sem, t.pericias.proficiente, t.pericias.especialista];

export function AbaPericias({ ficha, calc, atualizar }: PropsAba) {
  const especializacaoLiberada = permiteEspecializacao(ficha.dados);
  const siglaDe = (id: string) => dnd5e2014.atributos.find((a) => a.id === id)?.sigla ?? "";

  return (
    <div className="space-y-4">
      <p className="text-sm text-suave">
        {especializacaoLiberada ? t.pericias.dica : t.pericias.dicaSemEspecializacao}
      </p>

      <div className="cartao flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="font-semibold">{t.pericias.passiva}</span>
        <CampoCalculado
          rotulo={t.pericias.passiva}
          valor={calc.percepcaoPassiva}
          aoMudar={(v) => atualizar((f) => definirSobrescrita(f, "percepcaoPassiva", v))}
        />
      </div>

      <ul className="cartao divide-y divide-borda">
        {dnd5e2014.pericias.map((p) => {
          const nivel = ficha.dados.proficiencia.pericias[p.id];
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-2">
              <button
                type="button"
                className="btn btn-secundario !min-w-[44px] !px-0 text-lg"
                aria-label={`${p.nome}: ${NOME_NIVEL[nivel]}. Toque para alternar.`}
                title={NOME_NIVEL[nivel]}
                onClick={() =>
                  atualizar((f) => {
                    const atual = f.dados.proficiencia.pericias[p.id];
                    // Especialista só existe para Bardo e Ladino.
                    f.dados.proficiencia.pericias[p.id] = especializacaoLiberada ? (atual + 1) % 3 : atual === 0 ? 1 : 0;
                  })
                }
              >
                {SIMBOLO[nivel]}
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{p.nome}</div>
                <div className="text-xs text-suave">
                  {siglaDe(p.atributo)} · {NOME_NIVEL[nivel]}
                </div>
              </div>
              <BotaoRolar
                rotulo={`${t.pericias.rolar} ${p.nome}`}
                aoRolar={() => rolarTeste(calc[`pericia.${p.id}`].efetivo, p.nome, ficha.nome)}
              />
              <CampoCalculado
                rotulo={p.nome}
                valor={calc[`pericia.${p.id}`]}
                comSinal
                aoMudar={(v) => atualizar((f) => definirSobrescrita(f, `pericia.${p.id}`, v))}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

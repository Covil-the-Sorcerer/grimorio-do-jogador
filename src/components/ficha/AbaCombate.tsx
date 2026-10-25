import type { PropsAba } from "./tipos";
import { definirSobrescrita } from "./tipos";
import { BotaoRolar } from "../BotaoRolar";
import { CampoCalculado } from "../CampoCalculado";
import { SecaoAtaques } from "./SecaoAtaques";
import { rolarTeste } from "../../data/rolagens";
import { CampoNumero } from "../CampoNumero";
import { t } from "../../i18n/pt-BR";

export function AbaCombate(props: PropsAba) {
  const { ficha, calc, atualizar } = props;
  const { vida, deslocamento } = ficha.dados;

  return (
    <div className="space-y-4">
      <div className="cartao p-5">
        <h2 className="mb-3 text-lg font-bold">{t.combate.vida}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">{t.combate.atual}</label>
            <CampoNumero
              valor={vida.atual}
              minimo={0}
              maximo={9999}
              rotulo={`${t.combate.vida}: ${t.combate.atual}`}
              aoMudar={(v) => atualizar((f) => void (f.dados.vida.atual = v))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">{t.combate.maximo}</label>
            <CampoNumero
              valor={vida.maximo}
              minimo={0}
              maximo={9999}
              rotulo={`${t.combate.vida}: ${t.combate.maximo}`}
              aoMudar={(v) => atualizar((f) => void (f.dados.vida.maximo = v))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">{t.combate.temporario}</label>
            <CampoNumero
              valor={vida.temporario}
              minimo={0}
              maximo={9999}
              rotulo={`${t.combate.vida}: ${t.combate.temporario}`}
              aoMudar={(v) => atualizar((f) => void (f.dados.vida.temporario = v))}
            />
          </div>
        </div>
      </div>

      <div className="cartao space-y-3 p-5">
        <h2 className="text-lg font-bold">{t.combate.defesa}</h2>
        <div className="grid grid-cols-[10rem_1fr] items-center gap-3">
          <span className="text-sm font-semibold">{t.ficha.ca}</span>
          <CampoCalculado
            rotulo={t.ficha.ca}
            valor={calc.ca}
            aoMudar={(v) => atualizar((f) => definirSobrescrita(f, "ca", v))}
          />
          <span className="text-sm font-semibold">{t.ficha.iniciativa}</span>
          <div className="flex flex-wrap items-center gap-2">
            <CampoCalculado
              rotulo={t.ficha.iniciativa}
              valor={calc.iniciativa}
              comSinal
              aoMudar={(v) => atualizar((f) => definirSobrescrita(f, "iniciativa", v))}
            />
            <BotaoRolar
              rotulo={t.combate.rolarIniciativa}
              aoRolar={() => rolarTeste(calc.iniciativa.efetivo, t.ficha.iniciativa, ficha.nome)}
            />
          </div>
          <span className="text-sm font-semibold">{t.combate.deslocamento}</span>
          <div className="max-w-[8rem]">
            <CampoNumero
              valor={deslocamento}
              minimo={0}
              maximo={999}
              rotulo={t.combate.deslocamento}
              aoMudar={(v) => atualizar((f) => void (f.dados.deslocamento = v))}
            />
          </div>
        </div>
      </div>

      <SecaoAtaques {...props} />
    </div>
  );
}

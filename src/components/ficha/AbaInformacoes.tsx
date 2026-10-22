import type { PropsAba } from "./tipos";
import { CampoNumero } from "../CampoNumero";
import { CampoTexto } from "../CampoTexto";
import { t } from "../../i18n/pt-BR";

export function AbaInformacoes({ ficha, atualizar }: PropsAba) {
  const d = ficha.dados;

  return (
    <div className="space-y-4">
      <div className="cartao grid gap-4 p-5 sm:grid-cols-2">
        <CampoTexto
          rotulo={t.fichas.nome}
          valor={ficha.nome}
          aoMudar={(v) => atualizar((f) => void (f.nome = v))}
        />
        <CampoTexto
          rotulo={t.info.jogador}
          valor={d.jogador}
          aoMudar={(v) => atualizar((f) => void (f.dados.jogador = v))}
        />
        <CampoTexto
          rotulo={t.info.raca}
          valor={d.raca}
          aoMudar={(v) => atualizar((f) => void (f.dados.raca = v))}
        />
        <CampoTexto
          rotulo={t.info.classe}
          valor={d.classe}
          aoMudar={(v) => atualizar((f) => void (f.dados.classe = v))}
        />
        <CampoTexto
          rotulo={t.info.antecedente}
          valor={d.antecedente}
          aoMudar={(v) => atualizar((f) => void (f.dados.antecedente = v))}
        />
        <CampoTexto
          rotulo={t.info.alinhamento}
          valor={d.alinhamento}
          aoMudar={(v) => atualizar((f) => void (f.dados.alinhamento = v))}
        />
        <div>
          <label className="mb-1 block text-sm font-semibold">{t.info.nivel}</label>
          <CampoNumero
            valor={d.nivel}
            minimo={1}
            maximo={20}
            rotulo={t.info.nivel}
            aoMudar={(v) => atualizar((f) => void (f.dados.nivel = v))}
          />
        </div>
      </div>

      <div className="cartao p-5">
        <h2 className="mb-2 text-lg font-bold">{t.info.regras}</h2>
        <p className="text-sm text-suave">
          {t.info.versao}: D&amp;D 5e ({ficha.versaoRegras})
        </p>
        <p className="text-sm text-suave">
          {ficha.regrasDaMesa.multiclasse ? t.info.multiclasseSim : t.info.multiclasseNao}
        </p>
      </div>
    </div>
  );
}

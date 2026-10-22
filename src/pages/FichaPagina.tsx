import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AbaAnotacoes } from "../components/ficha/AbaAnotacoes";
import { AbaAtributos } from "../components/ficha/AbaAtributos";
import { AbaCombate } from "../components/ficha/AbaCombate";
import { AbaInformacoes } from "../components/ficha/AbaInformacoes";
import { AbaPericias } from "../components/ficha/AbaPericias";
import { Cabecalho } from "../components/ficha/Cabecalho";
import { calcularTudo } from "../engine/rules/calcular";
import { useFicha } from "../lib/useFicha";
import { dnd5e2014 } from "../systems/dnd5e/2014/definicao";
import { t } from "../i18n/pt-BR";

type Aba = "info" | "atributos" | "pericias" | "combate" | "anotacoes";

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "info", rotulo: t.ficha.abaInfo },
  { id: "atributos", rotulo: t.ficha.abaAtributos },
  { id: "pericias", rotulo: t.ficha.abaPericias },
  { id: "combate", rotulo: t.ficha.abaCombate },
  { id: "anotacoes", rotulo: t.ficha.abaAnotacoes },
];

export function FichaPagina() {
  const { id } = useParams<{ id: string }>();
  const { ficha, carregando, erro, salvamento, atualizar } = useFicha(id);
  const [aba, setAba] = useState<Aba>("combate");

  // Recalcula todos os valores das regras sempre que os dados da ficha mudam.
  const calculo = useMemo(() => {
    if (!ficha) return null;
    try {
      return { resultado: calcularTudo(dnd5e2014, ficha.dados), falha: null };
    } catch (e) {
      return { resultado: null, falha: e instanceof Error ? e.message : String(e) };
    }
  }, [ficha]);

  if (carregando) {
    return <p className="text-suave">{t.geral.carregando}</p>;
  }

  if (erro || !ficha) {
    return (
      <section>
        <div className="cartao p-5">
          <p className="mb-3 font-semibold">
            {erro === "not-found" || !erro ? t.ficha.naoEncontrada : t.ficha.erroAbrir}
          </p>
          {erro && erro !== "not-found" && <p className="mb-3 break-words text-sm text-suave">{erro}</p>}
          <Link to="/fichas" className="btn btn-secundario">
            {t.ficha.voltarLista}
          </Link>
        </div>
      </section>
    );
  }

  if (!calculo || !calculo.resultado) {
    return (
      <section>
        <div className="cartao p-5">
          <p className="mb-2 font-semibold">{t.ficha.erroAbrir}</p>
          <p className="mb-3 break-words text-sm text-suave">{calculo?.falha}</p>
          <Link to="/fichas" className="btn btn-secundario">
            {t.ficha.voltarLista}
          </Link>
        </div>
      </section>
    );
  }

  const propriedades = { ficha, calc: calculo.resultado, atualizar };

  return (
    <section>
      <Cabecalho {...propriedades} salvamento={salvamento} />

      <div
        role="tablist"
        aria-label={t.ficha.abas}
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-borda px-4 py-2"
      >
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`aba-${item.id}`}
            aria-selected={aba === item.id}
            aria-controls="painel-ficha"
            onClick={() => setAba(item.id)}
            className={`btn shrink-0 ${aba === item.id ? "btn-primario" : "btn-secundario"}`}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      <div id="painel-ficha" role="tabpanel" aria-labelledby={`aba-${aba}`} className="pt-4">
        {aba === "info" && <AbaInformacoes {...propriedades} />}
        {aba === "atributos" && <AbaAtributos {...propriedades} />}
        {aba === "pericias" && <AbaPericias {...propriedades} />}
        {aba === "combate" && <AbaCombate {...propriedades} />}
        {aba === "anotacoes" && <AbaAnotacoes {...propriedades} />}
      </div>
    </section>
  );
}

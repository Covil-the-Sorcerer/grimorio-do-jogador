import { Link } from "react-router-dom";
import {
  escolherFonte,
  escolherTema,
  useFonte,
  useTema,
  type Fonte,
  type Tema,
} from "../lib/preferencias";
import { t } from "../i18n/pt-BR";

const TEMAS: { valor: Tema; rotulo: string }[] = [
  { valor: "light", rotulo: t.config.claro },
  { valor: "dark", rotulo: t.config.escuro },
];

const FONTES: { valor: Fonte; rotulo: string }[] = [
  { valor: "small", rotulo: t.config.pequeno },
  { valor: "medium", rotulo: t.config.medio },
  { valor: "large", rotulo: t.config.grande },
];

function Opcoes<V extends string>({
  nome,
  opcoes,
  valor,
  aoEscolher,
}: {
  nome: string;
  opcoes: { valor: V; rotulo: string }[];
  valor: V;
  aoEscolher: (v: V) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={nome}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}
    >
      {opcoes.map((opcao) => {
        const marcada = valor === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={marcada}
            onClick={() => aoEscolher(opcao.valor)}
            className={`btn ${marcada ? "btn-primario" : "btn-secundario"}`}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}

export function Configuracoes() {
  const tema = useTema();
  const fonte = useFonte();

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">{t.config.titulo}</h1>

      <div className="space-y-4">
        <div className="cartao p-5">
          <h2 className="mb-3 text-lg font-bold">{t.config.tema}</h2>
          <Opcoes
            nome={t.config.tema}
            opcoes={TEMAS}
            valor={tema}
            aoEscolher={(v) => void escolherTema(v)}
          />
        </div>

        <div className="cartao p-5">
          <h2 className="mb-3 text-lg font-bold">{t.config.fonte}</h2>
          <Opcoes
            nome={t.config.fonte}
            opcoes={FONTES}
            valor={fonte}
            aoEscolher={(v) => void escolherFonte(v)}
          />
          <p className="mt-3 text-sm text-suave">{t.config.aviso}</p>
        </div>

        <div className="cartao p-5">
          <h2 className="mb-1 text-lg font-bold">{t.config.suporte}</h2>
          <p className="mb-3 text-sm text-suave">{t.config.diagnosticoTexto}</p>
          <Link to="/diagnostico" className="btn btn-secundario">
            {t.config.diagnostico}
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PassoAntecedente,
  PassoAtributos,
  PassoClasse,
  PassoNome,
  PassoPericias,
  PassoRaca,
  PassoRevisao,
} from "../components/criacao/Passos";
import { criarFichaGuiada } from "../data/fichas";
import { registrarErro } from "../lib/diagnostico";
import {
  PASSOS,
  escolhasIniciais,
  problemasDoPasso,
  type EscolhasCriacao,
} from "../systems/dnd5e/2014/criacao";
import { t } from "../i18n/pt-BR";

// Criação guiada: um passo por vez, com as opções explicadas e validação antes de avançar.
export function CriacaoGuiada() {
  const navegar = useNavigate();
  const [esc, setEsc] = useState<EscolhasCriacao>(escolhasIniciais);
  const [indice, setIndice] = useState(0);
  const [mostrarProblemas, setMostrarProblemas] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const topo = useRef<HTMLHeadingElement>(null);

  const passo = PASSOS[indice];
  const ultimo = indice === PASSOS.length - 1;
  const problemas = problemasDoPasso(passo.id, esc);

  // Ao mudar de passo, volta ao começo da página.
  useEffect(() => {
    window.scrollTo(0, 0);
    topo.current?.focus();
  }, [indice]);

  // Corrigiu o que faltava? Os avisos somem sozinhos.
  useEffect(() => {
    if (problemas.length === 0) setMostrarProblemas(false);
  }, [problemas.length]);

  function avancar() {
    setErro(null);
    if (problemas.length > 0) {
      setMostrarProblemas(true);
      return;
    }
    setMostrarProblemas(false);
    setIndice((i) => Math.min(i + 1, PASSOS.length - 1));
  }

  function voltar() {
    setErro(null);
    setMostrarProblemas(false);
    setIndice((i) => Math.max(i - 1, 0));
  }

  async function criar() {
    if (problemas.length > 0) {
      setMostrarProblemas(true);
      return;
    }
    setCriando(true);
    setErro(null);
    try {
      const ficha = await criarFichaGuiada(esc);
      navegar(`/ficha/${ficha.id}`);
    } catch (e) {
      registrarErro("criar-ficha-guiada", e);
      setErro(`${t.criacao.erroCriar} ${e instanceof Error ? e.message : String(e)}`);
      setCriando(false);
    }
  }

  const propriedades = { esc, mudar: setEsc };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t.criacao.titulo}</h1>
        <Link to="/fichas" className="btn btn-secundario">
          {t.criacao.cancelar}
        </Link>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold text-suave" aria-live="polite">
          {t.criacao.passoDe} {indice + 1} {t.criacao.de} {PASSOS.length}
        </p>
        <ol className="flex gap-1" aria-label={t.criacao.titulo}>
          {PASSOS.map((item, i) => (
            <li
              key={item.id}
              aria-current={i === indice ? "step" : undefined}
              className={`h-2 flex-1 rounded-full ${i <= indice ? "bg-destaque" : "bg-superficie2"}`}
              title={item.rotulo}
            />
          ))}
        </ol>
      </div>

      <h2 ref={topo} tabIndex={-1} className="mb-4 text-xl font-bold outline-none">
        {passo.rotulo}
      </h2>

      {passo.id === "nome" && <PassoNome {...propriedades} />}
      {passo.id === "raca" && <PassoRaca {...propriedades} />}
      {passo.id === "classe" && <PassoClasse {...propriedades} />}
      {passo.id === "antecedente" && <PassoAntecedente {...propriedades} />}
      {passo.id === "atributos" && <PassoAtributos {...propriedades} />}
      {passo.id === "pericias" && <PassoPericias {...propriedades} />}
      {passo.id === "revisao" && <PassoRevisao esc={esc} />}

      {mostrarProblemas && problemas.length > 0 && passo.id !== "revisao" && (
        <div role="alert" className="mt-4 rounded-lg border border-perigo p-4 text-sm text-perigo">
          <h3 className="mb-1 font-bold">{t.criacao.problemasTitulo}</h3>
          <ul className="list-disc space-y-1 pl-5">
            {problemas.map((problema) => (
              <li key={problema}>{problema}</li>
            ))}
          </ul>
        </div>
      )}
      {erro && (
        <p role="alert" className="mt-4 rounded-lg border border-perigo p-3 text-sm text-perigo">
          {erro}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 mt-6 flex justify-between gap-3 border-t border-borda bg-fundo px-4 py-3">
        <button type="button" className="btn btn-secundario" onClick={voltar} disabled={indice === 0 || criando}>
          {t.criacao.voltar}
        </button>
        {ultimo ? (
          <button type="button" className="btn btn-primario" onClick={() => void criar()} disabled={criando}>
            {criando ? t.criacao.criando : t.criacao.criar}
          </button>
        ) : (
          <button type="button" className="btn btn-primario" onClick={avancar}>
            {t.criacao.continuar}
          </button>
        )}
      </div>
    </section>
  );
}

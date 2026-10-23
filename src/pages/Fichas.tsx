import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "../components/Modal";
import { useRetrato } from "../lib/useRetrato";
import {
  criarFicha,
  duplicarFicha,
  excluirFicha,
  listarFichas,
  type ListaFichas,
  type ResumoFicha,
} from "../data/fichas";
import { registrarErro } from "../lib/diagnostico";
import { t } from "../i18n/pt-BR";

function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}

function dataCurta(iso: string): string {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "" : data.toLocaleDateString("pt-BR");
}

export function Fichas() {
  const navegar = useNavigate();
  const [lista, setLista] = useState<ListaFichas | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [aExcluir, setAExcluir] = useState<ResumoFicha | null>(null);

  const recarregar = useCallback(async () => {
    try {
      setLista(await listarFichas());
      setErro(null);
    } catch (e) {
      registrarErro("listar-fichas", e);
      setErro(mensagemDe(e));
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  async function duplicar(id: string) {
    setAviso(null);
    try {
      await duplicarFicha(id);
      await recarregar();
    } catch (e) {
      registrarErro("duplicar-ficha", e);
      setAviso(`${t.fichas.erroAcao} ${mensagemDe(e)}`);
    }
  }

  async function confirmarExclusao() {
    if (!aExcluir) return;
    const alvo = aExcluir;
    setAExcluir(null);
    setAviso(null);
    try {
      await excluirFicha(alvo.id);
      await recarregar();
    } catch (e) {
      registrarErro("excluir-ficha", e);
      setAviso(`${t.fichas.erroAcao} ${mensagemDe(e)}`);
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t.fichas.titulo}</h1>
        <button type="button" className="btn btn-primario" onClick={() => setCriando(true)}>
          {t.fichas.novaFicha}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mb-4 rounded-lg border border-perigo p-3 text-sm text-perigo">
          {t.fichas.erroListar} {erro}
        </p>
      )}
      {aviso && (
        <p role="alert" className="mb-4 rounded-lg border border-perigo p-3 text-sm text-perigo">
          {aviso}
        </p>
      )}
      {lista && lista.problemas.length > 0 && (
        <p role="status" className="mb-4 rounded-lg border border-borda bg-superficie2 p-3 text-sm">
          {lista.problemas.length} {t.fichas.problemas}
        </p>
      )}

      {!lista && !erro && <p className="text-suave">{t.geral.carregando}</p>}

      {lista && lista.fichas.length === 0 && (
        <div className="cartao px-5 py-10 text-center">
          <h2 className="text-lg font-bold">{t.fichas.vazioTitulo}</h2>
          <p className="mx-auto mt-2 max-w-sm text-suave">{t.fichas.vazioTexto}</p>
        </div>
      )}

      {lista && lista.fichas.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.fichas.map((ficha) => (
            <li key={ficha.id} className="cartao flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <Miniatura ficha={ficha} />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold">{ficha.nome}</h2>
                  <p className="truncate text-sm text-suave">
                    {t.fichas.nivel} {ficha.nivel} · {ficha.classe || t.fichas.semClasse}
                  </p>
                  <p className="text-xs text-suave">
                    {t.fichas.atualizada} {dataCurta(ficha.atualizadaEm)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/ficha/${ficha.id}`} className="btn btn-primario flex-1">
                  {t.fichas.abrir}
                </Link>
                <button type="button" className="btn btn-secundario" onClick={() => void duplicar(ficha.id)}>
                  {t.fichas.duplicar}
                </button>
                <button type="button" className="btn btn-secundario" onClick={() => setAExcluir(ficha)}>
                  {t.fichas.excluir}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {criando && (
        <NovaFichaModal
          aoFechar={() => setCriando(false)}
          aoCriar={(id) => {
            setCriando(false);
            navegar(`/ficha/${id}`);
          }}
        />
      )}

      {aExcluir && (
        <Modal titulo={t.fichas.excluirTitulo} aoFechar={() => setAExcluir(null)}>
          <p className="mb-1 font-semibold">{aExcluir.nome}</p>
          <p className="mb-5 text-sm text-suave">{t.fichas.excluirTexto}</p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secundario" onClick={() => setAExcluir(null)}>
              {t.geral.cancelar}
            </button>
            <button type="button" className="btn btn-primario" onClick={() => void confirmarExclusao()}>
              {t.fichas.excluirConfirmar}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function NovaFichaModal({
  aoFechar,
  aoCriar,
}: {
  aoFechar: () => void;
  aoCriar: (id: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [multiclasse, setMulticlasse] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const ficha = await criarFicha({
        nome: nome.trim() || t.fichas.nomePadrao,
        versaoRegras: "2014",
        multiclasse,
      });
      aoCriar(ficha.id);
    } catch (e) {
      registrarErro("criar-ficha", e);
      setErro(`${t.fichas.erroAcao} ${mensagemDe(e)}`);
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={t.fichas.novaTitulo} aoFechar={aoFechar}>
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="nome-nova-ficha" className="mb-1 block text-sm font-semibold">
            {t.fichas.nome}
          </label>
          <input
            id="nome-nova-ficha"
            type="text"
            autoFocus
            value={nome}
            placeholder={t.fichas.nomePadrao}
            onChange={(evento) => setNome(evento.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-semibold">{t.fichas.regras}</legend>
          <label htmlFor="versao-regras" className="block text-sm text-suave">
            {t.fichas.versao}
          </label>
          <select
            id="versao-regras"
            defaultValue="2014"
            className="min-h-[44px] w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto"
          >
            <option value="2014">{t.fichas.versao2014}</option>
            <option value="2024" disabled>
              {t.fichas.versao2024}
            </option>
          </select>
          <label className="flex min-h-[44px] items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={multiclasse}
              onChange={(evento) => setMulticlasse(evento.target.checked)}
              className="h-5 w-5 accent-[var(--destaque)]"
            />
            {t.fichas.multiclasse}
          </label>
        </fieldset>

        <p className="text-sm text-suave">{t.fichas.avisoCriacao}</p>

        {erro && (
          <p role="alert" className="rounded-lg border border-perigo p-3 text-sm text-perigo">
            {erro}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secundario" onClick={aoFechar}>
            {t.geral.cancelar}
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? t.fichas.criando : t.fichas.criar}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Imagem de perfil no card; sem imagem, mostra a inicial do nome.
function Miniatura({ ficha }: { ficha: ResumoFicha }) {
  const retrato = useRetrato(ficha.id, ficha.temRetrato);
  if (retrato.url) {
    return (
      <img
        src={retrato.url}
        alt=""
        className="h-14 w-14 shrink-0 rounded-lg border border-borda object-cover"
      />
    );
  }
  return (
    <span
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-destaque text-2xl font-bold text-sobredestaque"
      aria-hidden="true"
    >
      {(ficha.nome.trim().charAt(0) || "?").toUpperCase()}
    </span>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  errosDestaSessao,
  errosGuardados,
  registrarErro,
  type RegistroErro,
} from "../lib/diagnostico";
import { armazenamento, rodandoComoApp } from "../storage";
import { VERSAO_DO_APP } from "../versao";
import { t } from "../i18n/pt-BR";

type ResultadoTeste = { ok: boolean; texto: string } | null;

export function Diagnostico() {
  const [pasta, setPasta] = useState("...");
  const [teste, setTeste] = useState<ResultadoTeste>(null);
  const [testando, setTestando] = useState(false);
  const [guardados, setGuardados] = useState<RegistroErro[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const modo = rodandoComoApp() ? t.diag.modoApp : t.diag.modoNavegador;

  useEffect(() => {
    armazenamento()
      .descricao()
      .then(setPasta)
      .catch((erro) => {
        registrarErro("diagnostico", erro);
        setPasta(`Erro ao descobrir a pasta: ${erro instanceof Error ? erro.message : String(erro)}`);
      });
    void errosGuardados().then(setGuardados);
  }, []);

  // Junta os erros desta sessão com os guardados em arquivo, sem repetir.
  const erros = useMemo(() => {
    const todos = [...guardados, ...errosDestaSessao()];
    const vistos = new Set<string>();
    return todos.filter((e) => {
      const chave = `${e.quando}|${e.origem}|${e.mensagem}`;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
  }, [guardados, teste]);

  async function testarGravacao() {
    setTestando(true);
    setTeste(null);
    try {
      const marca = `teste ${new Date().toISOString()}`;
      const arq = armazenamento();
      await arq.gravar("diagnostico/teste.txt", marca);
      const lido = await arq.ler("diagnostico/teste.txt");
      if (lido !== marca) throw new Error("O conteúdo lido é diferente do gravado.");
      setTeste({ ok: true, texto: t.diag.testeOk });
    } catch (erro) {
      registrarErro("teste-de-gravacao", erro);
      const motivo = erro instanceof Error ? erro.message : String(erro);
      setTeste({ ok: false, texto: `${t.diag.testeFalhou}: ${motivo}` });
    } finally {
      setTestando(false);
    }
  }

  const relatorio = [
    `Grimório do Jogador v${VERSAO_DO_APP}`,
    `Modo: ${modo}`,
    `Pasta dos dados: ${pasta}`,
    `Teste de gravação: ${teste ? teste.texto : "não executado"}`,
    `Sistema: ${navigator.userAgent}`,
    `Janela: ${window.innerWidth}x${window.innerHeight}`,
    "",
    erros.length === 0
      ? "Nenhum erro registrado."
      : erros
          .map((e) => `[${e.quando}] (${e.origem}) ${e.mensagem}${e.pilha ? `\n${e.pilha}` : ""}`)
          .join("\n\n"),
  ].join("\n");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(relatorio);
      setAviso(t.diag.copiado);
    } catch {
      setAviso(t.diag.copiarManual);
    }
  }

  return (
    <section>
      <Link to="/configuracoes" className="link mb-4 inline-block">
        {t.diag.voltar}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{t.diag.titulo}</h1>

      <div className="space-y-4">
        <dl className="cartao grid gap-3 p-5 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold">{t.diag.versao}</dt>
          <dd>{VERSAO_DO_APP}</dd>
          <dt className="font-semibold">{t.diag.modo}</dt>
          <dd>{modo}</dd>
          <dt className="font-semibold">{t.diag.pasta}</dt>
          <dd className="break-all">{pasta}</dd>
        </dl>

        <div className="cartao p-5">
          <button type="button" className="btn btn-secundario" onClick={() => void testarGravacao()} disabled={testando}>
            {testando ? t.diag.testando : t.diag.testar}
          </button>
          {teste && (
            <p
              role="status"
              className={`mt-3 rounded-lg border p-3 text-sm ${
                teste.ok ? "border-borda bg-superficie2" : "border-perigo text-perigo"
              }`}
            >
              {teste.texto}
            </p>
          )}
        </div>

        <div className="cartao p-5">
          <h2 className="mb-3 text-lg font-bold">{t.diag.erros}</h2>
          {erros.length === 0 ? (
            <p className="text-sm text-suave">{t.diag.nenhumErro}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {erros.map((e, i) => (
                <li key={`${e.quando}-${i}`} className="rounded-lg border border-borda bg-superficie2 p-3">
                  <div className="text-suave">
                    {e.quando} · {e.origem}
                  </div>
                  <div className="break-words">{e.mensagem}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cartao p-5">
          <h2 className="mb-3 text-lg font-bold">{t.diag.relatorio}</h2>
          <textarea
            readOnly
            value={relatorio}
            rows={10}
            className="mb-3 w-full rounded-lg border border-borda bg-superficie2 p-3 font-mono text-xs text-texto"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button type="button" className="btn btn-primario" onClick={() => void copiar()}>
            {t.diag.copiar}
          </button>
          {aviso && (
            <p role="status" className="mt-3 text-sm text-suave">
              {aviso}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

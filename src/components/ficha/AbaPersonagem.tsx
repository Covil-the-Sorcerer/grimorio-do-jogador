import { useRef, useState, type ChangeEvent } from "react";
import type { PropsAba } from "./tipos";
import { CampoAreaTexto } from "../CampoAreaTexto";
import { removerRetrato, salvarRetrato } from "../../data/retratos";
import { registrarErro } from "../../lib/diagnostico";
import { reduzirImagem } from "../../lib/imagem";
import type { TextosPersonagem } from "../../systems/dnd5e/2014/tipos";
import { t } from "../../i18n/pt-BR";

export interface RetratoDaFicha {
  url: string | null;
  definir: (url: string | null) => void;
}

const CAMPOS: { chave: keyof TextosPersonagem; rotulo: string; linhas: number }[] = [
  { chave: "tracosPersonalidade", rotulo: t.personagem.tracosPersonalidade, linhas: 4 },
  { chave: "ideais", rotulo: t.personagem.ideais, linhas: 4 },
  { chave: "vinculos", rotulo: t.personagem.vinculos, linhas: 4 },
  { chave: "fraquezas", rotulo: t.personagem.fraquezas, linhas: 4 },
  { chave: "historia", rotulo: t.personagem.historia, linhas: 8 },
  { chave: "caracteristicasFisicas", rotulo: t.personagem.caracteristicasFisicas, linhas: 4 },
  { chave: "aliadosOrganizacoes", rotulo: t.personagem.aliadosOrganizacoes, linhas: 4 },
  { chave: "tesouros", rotulo: t.personagem.tesouros, linhas: 4 },
];

export function AbaPersonagem({
  ficha,
  atualizar,
  retrato,
}: PropsAba & { retrato: RetratoDaFicha }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEscolher(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    // Limpa o campo para permitir escolher o mesmo arquivo de novo depois.
    evento.target.value = "";
    if (!arquivo) return;

    setErro(null);
    setProcessando(true);
    try {
      const imagem = await reduzirImagem(arquivo);
      await salvarRetrato(ficha.id, imagem);
      retrato.definir(imagem);
      atualizar((f) => {
        f.temRetrato = true;
      });
    } catch (e) {
      registrarErro("retrato", e);
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setProcessando(false);
    }
  }

  async function remover() {
    setErro(null);
    try {
      await removerRetrato(ficha.id);
      retrato.definir(null);
      atualizar((f) => {
        f.temRetrato = false;
      });
    } catch (e) {
      registrarErro("retrato", e);
      setErro(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="cartao flex flex-wrap items-center gap-5 p-5">
        <div
          className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-borda bg-superficie2 text-sm text-suave"
          aria-label={t.personagem.imagem}
        >
          {retrato.url ? (
            <img src={retrato.url} alt={`${t.personagem.imagem}: ${ficha.nome}`} className="h-full w-full object-cover" />
          ) : (
            <span>{t.personagem.semImagem}</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-lg font-bold">{t.personagem.imagem}</h2>
          <p className="text-sm text-suave">{t.personagem.dicaImagem}</p>
          <input
            ref={entrada}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(evento) => void aoEscolher(evento)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primario"
              disabled={processando}
              onClick={() => entrada.current?.click()}
            >
              {processando ? t.personagem.processando : retrato.url ? t.personagem.trocar : t.personagem.escolher}
            </button>
            {retrato.url && (
              <button type="button" className="btn btn-secundario" onClick={() => void remover()}>
                {t.personagem.remover}
              </button>
            )}
          </div>
          {erro && (
            <p role="alert" className="rounded-lg border border-perigo p-3 text-sm text-perigo">
              {t.personagem.erroImagem} {erro}
            </p>
          )}
        </div>
      </div>

      <div className="cartao grid gap-4 p-5 md:grid-cols-2">
        {CAMPOS.map((campo) => (
          <div key={campo.chave} className={campo.chave === "historia" ? "md:col-span-2" : ""}>
            <CampoAreaTexto
              rotulo={campo.rotulo}
              linhas={campo.linhas}
              valor={ficha.dados.personagem[campo.chave]}
              aoMudar={(v) =>
                atualizar((f) => {
                  f.dados.personagem[campo.chave] = v;
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

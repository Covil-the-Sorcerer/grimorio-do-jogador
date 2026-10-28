import { useId } from "react";
import { CampoAreaTexto } from "../CampoAreaTexto";
import { CampoNumero } from "../CampoNumero";
import { CampoTexto } from "../CampoTexto";
import type { Personalizado } from "../../systems/dnd5e/2014/criacao";
import { dnd5e2014 } from "../../systems/dnd5e/2014/definicao";
import { IDIOMAS_PADRAO } from "../../systems/dnd5e/2014/srd/geral";
import type { Traco } from "../../systems/dnd5e/2014/srd/tipos";
import { t } from "../../i18n/pt-BR";

export interface OpcaoDoGrupo {
  id: string;
  titulo: string;
  descricao: string;
  extra?: string;
}

// Escolha de uma opção entre várias, em cartões com título e descrição curta.
export function GrupoDeOpcoes({
  rotulo,
  opcoes,
  valor,
  aoEscolher,
}: {
  rotulo: string;
  opcoes: OpcaoDoGrupo[];
  valor: string;
  aoEscolher: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="grid gap-2 sm:grid-cols-2">
      {opcoes.map((opcao) => {
        const marcada = valor === opcao.id;
        return (
          <button
            key={opcao.id}
            type="button"
            role="radio"
            aria-checked={marcada}
            onClick={() => aoEscolher(opcao.id)}
            className={`rounded-xl border p-3 text-left ${
              marcada ? "border-2 border-destaque bg-superficie2" : "border-borda bg-superficie hover:bg-superficie2"
            }`}
          >
            <div className="font-bold">{opcao.titulo}</div>
            {opcao.descricao && <div className="text-sm text-suave">{opcao.descricao}</div>}
            {opcao.extra && <div className="mt-1 text-xs font-semibold text-destaque">{opcao.extra}</div>}
          </button>
        );
      })}
    </div>
  );
}

export function ListaDeTracos({ tracos }: { tracos: Traco[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {tracos.map((traco) => (
        <li key={traco.nome}>
          <span className="font-semibold">{traco.nome}.</span> {traco.descricao}
        </li>
      ))}
    </ul>
  );
}

// Escolha de várias opções (até um limite), com caixas de marcar.
export function CaixasDeEscolha({
  rotulo,
  opcoes,
  escolhidas,
  quantidade,
  aoMudar,
}: {
  rotulo: string;
  opcoes: { id: string; rotulo: string; bloqueada?: boolean }[];
  escolhidas: string[];
  quantidade: number;
  aoMudar: (novas: string[]) => void;
}) {
  const cheio = escolhidas.length >= quantidade;
  return (
    <fieldset className="cartao p-4">
      <legend className="px-1 font-bold">{rotulo}</legend>
      <p className="mb-2 text-sm text-suave">
        {t.criacao.escolhidasDe}: {escolhidas.length} / {quantidade}
      </p>
      <div className="grid gap-1 sm:grid-cols-2">
        {opcoes.map((opcao) => {
          const marcada = escolhidas.includes(opcao.id);
          const desabilitada = !marcada && (cheio || opcao.bloqueada === true);
          return (
            <label
              key={opcao.id}
              className={`flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm ${desabilitada ? "opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={marcada}
                disabled={desabilitada}
                onChange={(evento) =>
                  aoMudar(
                    evento.target.checked
                      ? [...escolhidas, opcao.id]
                      : escolhidas.filter((outra) => outra !== opcao.id),
                  )
                }
                className="h-5 w-5 accent-[var(--destaque)]"
              />
              {opcao.rotulo}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// Um ou mais menus para escolher idiomas, sem repetir os que o personagem já tem.
export function SeletorDeIdiomas({
  rotulo,
  quantidade,
  escolhidos,
  fixos,
  aoMudar,
}: {
  rotulo: string;
  quantidade: number;
  escolhidos: string[];
  fixos: string[];
  aoMudar: (novos: string[]) => void;
}) {
  const base = useId();
  const posicoes = Array.from({ length: quantidade }, (_, i) => i);

  function trocar(posicao: number, valor: string) {
    const novos = posicoes
      .map((k) => (k === posicao ? valor : (escolhidos[k] ?? "")))
      .filter((idioma) => idioma !== "");
    aoMudar(novos);
  }

  return (
    <fieldset className="cartao space-y-2 p-4">
      <legend className="px-1 font-bold">{rotulo}</legend>
      {posicoes.map((i) => {
        const valor = escolhidos[i] ?? "";
        const indisponiveis = new Set(
          [...fixos, ...escolhidos.filter((_, k) => k !== i)].map((idioma) => idioma.toLowerCase()),
        );
        return (
          <div key={i}>
            <label htmlFor={`${base}-${i}`} className="sr-only">
              {`${rotulo} ${i + 1}`}
            </label>
            <select
              id={`${base}-${i}`}
              value={valor}
              onChange={(evento) => trocar(i, evento.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto"
            >
              <option value="">{t.criacao.personalizado.escolher}</option>
              {IDIOMAS_PADRAO.filter((idioma) => !indisponiveis.has(idioma.toLowerCase())).map((idioma) => (
                <option key={idioma} value={idioma}>
                  {idioma}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </fieldset>
  );
}

// Formulário de raça ou sub-raça personalizada.
export function FormularioPersonalizado({
  valor,
  aoMudar,
  comDeslocamento,
  comIdiomas,
}: {
  valor: Personalizado;
  aoMudar: (novo: Personalizado) => void;
  comDeslocamento: boolean;
  comIdiomas: boolean;
}) {
  const p = t.criacao.personalizado;
  return (
    <div className="cartao space-y-3 p-4">
      <CampoTexto rotulo={p.nome} valor={valor.nome} aoMudar={(v) => aoMudar({ ...valor, nome: v })} />
      {comDeslocamento && (
        <div>
          <label className="mb-1 block text-sm font-semibold">{p.deslocamento}</label>
          <CampoNumero
            valor={valor.deslocamento}
            minimo={0}
            maximo={60}
            meioPonto
            rotulo={p.deslocamento}
            aoMudar={(v) => aoMudar({ ...valor, deslocamento: v })}
          />
        </div>
      )}
      {comIdiomas && (
        <CampoTexto rotulo={p.idiomas} valor={valor.idiomas} aoMudar={(v) => aoMudar({ ...valor, idiomas: v })} />
      )}
      <fieldset>
        <legend className="mb-1 text-sm font-semibold">{p.bonus}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {dnd5e2014.atributos.map((a) => (
            <div key={a.id}>
              <label className="mb-1 block text-xs text-suave">{a.nome}</label>
              <CampoNumero
                valor={valor.bonus[a.id] ?? 0}
                minimo={-5}
                maximo={5}
                rotulo={`${p.bonus}: ${a.nome}`}
                aoMudar={(v) => aoMudar({ ...valor, bonus: { ...valor.bonus, [a.id]: v } })}
              />
            </div>
          ))}
        </div>
      </fieldset>
      <CampoAreaTexto rotulo={p.tracos} valor={valor.tracos} linhas={4} aoMudar={(v) => aoMudar({ ...valor, tracos: v })} />
    </div>
  );
}

import { useState } from "react";
import type { PropsAba } from "./tipos";
import { BotaoRolar } from "../BotaoRolar";
import { CampoNumero } from "../CampoNumero";
import { CampoTexto } from "../CampoTexto";
import { Modal } from "../Modal";
import { novoId } from "../../data/ficha";
import { rolar, rolarTeste } from "../../data/rolagens";
import { interpretar } from "../../engine/dados/rolar";
import type { Ataque } from "../../systems/dnd5e/2014/tipos";
import { t } from "../../i18n/pt-BR";

function formulaValida(texto: string): boolean {
  try {
    interpretar(texto);
    return true;
  } catch {
    return false;
  }
}

// Lista de ataques da ficha, com botões para rolar o ataque, o dano e o dano crítico.
export function SecaoAtaques({ ficha, atualizar }: PropsAba) {
  const [aRemover, setARemover] = useState<Ataque | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const ataques = ficha.dados.ataques;

  function editar(id: string, mudanca: Partial<Omit<Ataque, "id">>) {
    atualizar((f) => {
      const alvo = f.dados.ataques.find((a) => a.id === id);
      if (alvo) Object.assign(alvo, mudanca);
    });
  }

  function atacar(ataque: Ataque) {
    setAviso(null);
    rolarTeste(ataque.bonus, `${t.ataques.ataqueDe}: ${ataque.nome || t.ataques.semNome}`, ficha.nome);
  }

  function rolarDano(ataque: Ataque, critico: boolean) {
    const nome = ataque.nome || t.ataques.semNome;
    const resposta = rolar(
      ataque.dano,
      `${critico ? t.ataques.danoCriticoDe : t.ataques.danoDe}: ${nome}`,
      ficha.nome,
      { critico },
    );
    setAviso(resposta.ok ? null : `${nome}: ${resposta.erro}`);
  }

  function confirmarRemocao() {
    if (!aRemover) return;
    const id = aRemover.id;
    setARemover(null);
    atualizar((f) => {
      f.dados.ataques = f.dados.ataques.filter((a) => a.id !== id);
    });
  }

  return (
    <div className="cartao space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{t.ataques.titulo}</h2>
        <button
          type="button"
          className="btn btn-primario"
          onClick={() =>
            atualizar((f) => {
              f.dados.ataques.push({ id: novoId(), nome: "", bonus: 0, dano: "", tipoDano: "" });
            })
          }
        >
          {t.ataques.novo}
        </button>
      </div>

      {aviso && (
        <p role="alert" className="rounded-lg border border-perigo p-3 text-sm text-perigo">
          {aviso}
        </p>
      )}

      {ataques.length === 0 && <p className="text-sm text-suave">{t.ataques.nenhum}</p>}

      {ataques.map((ataque) => (
        <div key={ataque.id} className="space-y-3 rounded-lg border border-borda bg-superficie2 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoTexto
              rotulo={t.ataques.nome}
              valor={ataque.nome}
              aoMudar={(v) => editar(ataque.id, { nome: v })}
            />
            <div>
              <label className="mb-1 block text-sm font-semibold">{t.ataques.bonus}</label>
              <CampoNumero
                valor={ataque.bonus}
                minimo={-50}
                maximo={50}
                rotulo={`${t.ataques.bonus}: ${ataque.nome || t.ataques.semNome}`}
                aoMudar={(v) => editar(ataque.id, { bonus: v })}
              />
            </div>
            <div>
              <CampoTexto
                rotulo={t.ataques.dano}
                valor={ataque.dano}
                dica={t.ataques.danoDica}
                aoMudar={(v) => editar(ataque.id, { dano: v.slice(0, 60) })}
              />
              {ataque.dano.trim() !== "" && !formulaValida(ataque.dano) && (
                <p className="mt-1 text-sm text-perigo">{t.ataques.formulaInvalida}</p>
              )}
            </div>
            <CampoTexto
              rotulo={t.ataques.tipoDano}
              valor={ataque.tipoDano}
              aoMudar={(v) => editar(ataque.id, { tipoDano: v.slice(0, 40) })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <BotaoRolar
              aoRolar={() => atacar(ataque)}
              rotulo={`${t.ataques.atacar}: ${ataque.nome || t.ataques.semNome}`}
              texto={t.ataques.atacar}
            />
            <button type="button" className="btn btn-secundario" onClick={() => rolarDano(ataque, false)}>
              {t.ataques.rolarDano}
            </button>
            <button type="button" className="btn btn-secundario" onClick={() => rolarDano(ataque, true)}>
              {t.ataques.danoCritico}
            </button>
            <button type="button" className="btn btn-secundario ml-auto" onClick={() => setARemover(ataque)}>
              {t.ataques.remover}
            </button>
          </div>
        </div>
      ))}

      {aRemover && (
        <Modal titulo={t.ataques.removerTitulo} aoFechar={() => setARemover(null)}>
          <p className="mb-1 font-semibold">{aRemover.nome || t.ataques.semNome}</p>
          <p className="mb-5 text-sm text-suave">{t.ataques.removerTexto}</p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secundario" onClick={() => setARemover(null)}>
              {t.geral.cancelar}
            </button>
            <button type="button" className="btn btn-primario" onClick={confirmarRemocao}>
              {t.ataques.remover}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

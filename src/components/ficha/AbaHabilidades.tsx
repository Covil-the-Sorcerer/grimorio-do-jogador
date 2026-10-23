import { useState } from "react";
import type { PropsAba } from "./tipos";
import { CampoAreaTexto } from "../CampoAreaTexto";
import { CampoTexto } from "../CampoTexto";
import { ListaDeItens } from "../ListaDeItens";
import { Modal } from "../Modal";
import { novoId } from "../../data/ficha";
import type { Habilidade } from "../../systems/dnd5e/2014/tipos";
import { t } from "../../i18n/pt-BR";

export function AbaHabilidades({ ficha, atualizar }: PropsAba) {
  const d = ficha.dados;
  const [aRemover, setARemover] = useState<Habilidade | null>(null);

  function editar(id: string, campo: "nome" | "origem" | "descricao", valor: string) {
    atualizar((f) => {
      const alvo = f.dados.habilidades.find((h) => h.id === id);
      if (alvo) alvo[campo] = valor;
    });
  }

  function confirmarRemocao() {
    if (!aRemover) return;
    const id = aRemover.id;
    setARemover(null);
    atualizar((f) => {
      f.dados.habilidades = f.dados.habilidades.filter((h) => h.id !== id);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ListaDeItens
          rotulo={t.habil.armas}
          itens={d.outrasProficiencias.armas}
          aoMudar={(novos) =>
            atualizar((f) => {
              f.dados.outrasProficiencias.armas = novos;
            })
          }
        />
        <ListaDeItens
          rotulo={t.habil.armaduras}
          itens={d.outrasProficiencias.armaduras}
          aoMudar={(novos) =>
            atualizar((f) => {
              f.dados.outrasProficiencias.armaduras = novos;
            })
          }
        />
        <ListaDeItens
          rotulo={t.habil.ferramentas}
          itens={d.outrasProficiencias.ferramentas}
          aoMudar={(novos) =>
            atualizar((f) => {
              f.dados.outrasProficiencias.ferramentas = novos;
            })
          }
        />
        <ListaDeItens
          rotulo={t.habil.idiomas}
          itens={d.idiomas}
          aoMudar={(novos) =>
            atualizar((f) => {
              f.dados.idiomas = novos;
            })
          }
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{t.habil.habilidades}</h2>
          <button
            type="button"
            className="btn btn-primario"
            onClick={() =>
              atualizar((f) => {
                f.dados.habilidades.push({ id: novoId(), nome: "", origem: "", descricao: "" });
              })
            }
          >
            {t.habil.novaHabilidade}
          </button>
        </div>

        {d.habilidades.length === 0 && (
          <div className="cartao px-5 py-8 text-center text-sm text-suave">{t.habil.nenhumaHabilidade}</div>
        )}

        {d.habilidades.map((habilidade) => (
          <div key={habilidade.id} className="cartao space-y-3 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoTexto
                rotulo={t.habil.nomeHabilidade}
                valor={habilidade.nome}
                aoMudar={(v) => editar(habilidade.id, "nome", v)}
              />
              <CampoTexto
                rotulo={t.habil.origemHabilidade}
                valor={habilidade.origem}
                aoMudar={(v) => editar(habilidade.id, "origem", v)}
              />
            </div>
            <CampoAreaTexto
              rotulo={t.habil.descricaoHabilidade}
              linhas={4}
              valor={habilidade.descricao}
              aoMudar={(v) => editar(habilidade.id, "descricao", v)}
            />
            <div className="flex justify-end">
              <button type="button" className="btn btn-secundario" onClick={() => setARemover(habilidade)}>
                {t.habil.removerHabilidade}
              </button>
            </div>
          </div>
        ))}
      </div>

      {aRemover && (
        <Modal titulo={t.habil.removerHabilidadeTitulo} aoFechar={() => setARemover(null)}>
          <p className="mb-1 font-semibold">{aRemover.nome || t.habil.semNome}</p>
          <p className="mb-5 text-sm text-suave">{t.habil.removerHabilidadeTexto}</p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secundario" onClick={() => setARemover(null)}>
              {t.geral.cancelar}
            </button>
            <button type="button" className="btn btn-primario" onClick={confirmarRemocao}>
              {t.habil.removerHabilidade}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

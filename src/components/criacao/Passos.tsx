import { CampoNumero } from "../CampoNumero";
import { CampoTexto } from "../CampoTexto";
import {
  CaixasDeEscolha,
  FormularioPersonalizado,
  GrupoDeOpcoes,
  ListaDeTracos,
  SeletorDeIdiomas,
} from "./Auxiliares";
import { calcularTudo } from "../../engine/rules/calcular";
import {
  PERSONALIZADA,
  antecedenteEfetivo,
  atributosFinais,
  bonusDeAtributos,
  classeEfetiva,
  escolhidasDoGrupo,
  gruposDePericias,
  montarFicha,
  nomeDaPericia,
  nomeDoAtributo,
  periciasBloqueadas,
  periciasConcedidas,
  periciasProficientes,
  previa,
  problemasDoPasso,
  racaEfetiva,
  trocarAntecedente,
  trocarClasse,
  trocarRaca,
  type EscolhasCriacao,
} from "../../systems/dnd5e/2014/criacao";
import { dnd5e2014 } from "../../systems/dnd5e/2014/definicao";
import { ANTECEDENTES_SRD } from "../../systems/dnd5e/2014/srd/antecedentes";
import { CLASSES_SRD } from "../../systems/dnd5e/2014/srd/classes";
import { ANCESTRAIS_DRACONICOS, ESTILOS_DE_LUTA } from "../../systems/dnd5e/2014/srd/geral";
import { RACAS_SRD } from "../../systems/dnd5e/2014/srd/racas";
import { t } from "../../i18n/pt-BR";

export interface PropsPasso {
  esc: EscolhasCriacao;
  mudar: (novo: EscolhasCriacao) => void;
}

const R = t.criacao.rotulos;

function numeroBR(n: number): string {
  return String(n).replace(".", ",");
}

function descreverBonus(bonus: Record<string, number>): string {
  const valores = dnd5e2014.atributos.map((a) => bonus[a.id] ?? 0);
  if (valores.every((v) => v === 1)) return `+1 ${R.todosOsAtributos}`;
  return dnd5e2014.atributos
    .filter((a) => bonus[a.id])
    .map((a) => `${bonus[a.id] > 0 ? "+" : ""}${bonus[a.id]} ${a.nome}`)
    .join(", ");
}

function sinal(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

const CLASSE_DE_SELECT =
  "min-h-[44px] w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto";

// ---------- 1. Nome e regras ----------
export function PassoNome({ esc, mudar }: PropsPasso) {
  return (
    <div className="space-y-4">
      <p className="text-suave">{t.criacao.nomeTexto}</p>
      <div className="cartao space-y-4 p-4">
        <CampoTexto rotulo={t.criacao.nome} valor={esc.nome} aoMudar={(v) => mudar({ ...esc, nome: v })} />
        <p className="-mt-2 text-sm text-suave">{t.criacao.nomeDica}</p>
        <div>
          <label htmlFor="versao-guiada" className="mb-1 block text-sm font-semibold">
            {t.criacao.versao}
          </label>
          <select id="versao-guiada" defaultValue="2014" className={CLASSE_DE_SELECT}>
            <option value="2014">{t.fichas.versao2014}</option>
            <option value="2024" disabled>
              {t.fichas.versao2024}
            </option>
          </select>
        </div>
        <label className="flex min-h-[44px] items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={esc.multiclasse}
            onChange={(evento) => mudar({ ...esc, multiclasse: evento.target.checked })}
            className="h-5 w-5 accent-[var(--destaque)]"
          />
          {t.criacao.multiclasse}
        </label>
      </div>
    </div>
  );
}

// ---------- 2. Raça ----------
export function PassoRaca({ esc, mudar }: PropsPasso) {
  const raca = racaEfetiva(esc);
  const srd = raca?.srd ?? null;

  const opcoes = [
    ...RACAS_SRD.map((r) => ({
      id: r.id,
      titulo: r.nome,
      descricao: r.descricao,
      extra: `${descreverBonus(r.bonusAtributos)}${r.bonusLivres ? `, +${r.bonusLivres.valor} ${R.emDoisOutros}` : ""}`,
    })),
    { id: PERSONALIZADA, titulo: t.criacao.racaPersonalizada, descricao: t.criacao.racaPersonalizadaTexto },
  ];

  return (
    <div className="space-y-4">
      <GrupoDeOpcoes
        rotulo={t.criacao.raca}
        opcoes={opcoes}
        valor={esc.racaId}
        aoEscolher={(id) => mudar(trocarRaca(esc, id))}
      />

      {esc.racaId === PERSONALIZADA && (
        <FormularioPersonalizado
          valor={esc.racaPersonalizada}
          aoMudar={(v) => mudar({ ...esc, racaPersonalizada: v })}
          comDeslocamento
          comIdiomas
        />
      )}

      {raca && srd && (
        <div className="cartao space-y-2 p-4">
          <h3 className="text-lg font-bold">{srd.nome}</h3>
          <p className="text-sm">
            <span className="font-semibold">{R.deslocamento}:</span> {numeroBR(raca.deslocamento)} m ·{" "}
            <span className="font-semibold">{R.idiomas}:</span> {raca.idiomasFixos.join(", ")}
            {raca.idiomasExtras > 0 ? ` + ${raca.idiomasExtras} ${R.aEscolha}` : ""}
          </p>
          <p className="text-sm">
            <span className="font-semibold">{R.bonus}:</span> {descreverBonus(raca.bonus) || R.nenhuma}
            {raca.bonusLivres ? `, +${raca.bonusLivres.valor} ${R.emDoisOutros}` : ""}
          </p>
          <ListaDeTracos tracos={raca.tracos} />
        </div>
      )}

      {srd && srd.subRacas.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold">{t.criacao.subRaca}</h3>
          <GrupoDeOpcoes
            rotulo={t.criacao.subRaca}
            opcoes={[
              ...srd.subRacas.map((s) => ({
                id: s.id,
                titulo: s.nome,
                descricao: s.descricao,
                extra: descreverBonus(s.bonusAtributos),
              })),
              { id: PERSONALIZADA, titulo: t.criacao.subRacaPersonalizada, descricao: t.criacao.subRacaPersonalizadaTexto },
            ]}
            valor={esc.subRacaId}
            aoEscolher={(id) => mudar({ ...esc, subRacaId: id })}
          />
          {esc.subRacaId === PERSONALIZADA && (
            <FormularioPersonalizado
              valor={esc.subRacaPersonalizada}
              aoMudar={(v) => mudar({ ...esc, subRacaPersonalizada: v })}
              comDeslocamento={false}
              comIdiomas={false}
            />
          )}
        </div>
      )}

      {raca?.exigeAncestral && (
        <div className="space-y-2">
          <h3 className="font-bold">{t.criacao.ancestral}</h3>
          <GrupoDeOpcoes
            rotulo={t.criacao.ancestral}
            opcoes={ANCESTRAIS_DRACONICOS.map((a) => ({
              id: a.id,
              titulo: `Dragão ${a.nome}`,
              descricao: `Sopro de ${a.tipoDano} · ${a.formato} · resistência de ${a.resistencia}`,
            }))}
            valor={esc.ancestralId}
            aoEscolher={(id) => mudar({ ...esc, ancestralId: id })}
          />
        </div>
      )}

      {raca?.bonusLivres && (
        <CaixasDeEscolha
          rotulo={t.criacao.bonusLivres}
          opcoes={dnd5e2014.atributos
            .filter((a) => !raca.bonusLivres?.excetos.includes(a.id))
            .map((a) => ({ id: a.id, rotulo: `${a.nome} (+${raca.bonusLivres?.valor ?? 1})` }))}
          escolhidas={esc.bonusLivres}
          quantidade={raca.bonusLivres.quantidade}
          aoMudar={(novas) => mudar({ ...esc, bonusLivres: novas })}
        />
      )}

      {raca && raca.idiomasExtras > 0 && (
        <SeletorDeIdiomas
          rotulo={t.criacao.idiomasExtras}
          quantidade={raca.idiomasExtras}
          escolhidos={esc.idiomasRaca}
          fixos={raca.idiomasFixos}
          aoMudar={(novos) => mudar({ ...esc, idiomasRaca: novos })}
        />
      )}

      {raca && raca.ferramentaEscolha.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold">{t.criacao.ferramenta}</h3>
          <GrupoDeOpcoes
            rotulo={t.criacao.ferramenta}
            opcoes={raca.ferramentaEscolha.map((f) => ({ id: f, titulo: f, descricao: "" }))}
            valor={esc.ferramentaRaca}
            aoEscolher={(id) => mudar({ ...esc, ferramentaRaca: id })}
          />
        </div>
      )}
    </div>
  );
}

// ---------- 3. Classe ----------
export function PassoClasse({ esc, mudar }: PropsPasso) {
  const classe = classeEfetiva(esc);
  const srd = classe?.srd ?? null;
  const p = t.criacao.personalizado;

  const opcoes = [
    ...CLASSES_SRD.map((c) => ({
      id: c.id,
      titulo: c.nome,
      descricao: c.descricao,
      extra: `d${c.dadoDeVida} · ${c.resistencias.map(nomeDoAtributo).join(" e ")}`,
    })),
    { id: PERSONALIZADA, titulo: t.criacao.classePersonalizada, descricao: t.criacao.classePersonalizadaTexto },
  ];

  const cp = esc.classePersonalizada;
  const lista = (itens: string[]) => (itens.length > 0 ? itens.join(", ") : R.nenhuma);

  return (
    <div className="space-y-4">
      <GrupoDeOpcoes
        rotulo={t.criacao.classe}
        opcoes={opcoes}
        valor={esc.classeId}
        aoEscolher={(id) => mudar(trocarClasse(esc, id))}
      />

      {esc.classeId === PERSONALIZADA && (
        <div className="cartao space-y-3 p-4">
          <CampoTexto
            rotulo={p.nome}
            valor={cp.nome}
            aoMudar={(v) => mudar({ ...esc, classePersonalizada: { ...cp, nome: v } })}
          />
          <div>
            <label htmlFor="dado-classe" className="mb-1 block text-sm font-semibold">
              {p.dadoDeVida}
            </label>
            <select
              id="dado-classe"
              value={cp.dadoDeVida}
              onChange={(evento) =>
                mudar({ ...esc, classePersonalizada: { ...cp, dadoDeVida: Number(evento.target.value) } })
              }
              className={CLASSE_DE_SELECT}
            >
              {[6, 8, 10, 12].map((d) => (
                <option key={d} value={d}>
                  d{d}
                </option>
              ))}
            </select>
          </div>
          {[0, 1].map((i) => (
            <div key={i}>
              <label htmlFor={`resistencia-classe-${i}`} className="mb-1 block text-sm font-semibold">
                {i === 0 ? p.primeira : p.segunda}
              </label>
              <select
                id={`resistencia-classe-${i}`}
                value={cp.resistencias[i] ?? ""}
                onChange={(evento) => {
                  const novas = [cp.resistencias[0] ?? "", cp.resistencias[1] ?? ""];
                  novas[i] = evento.target.value;
                  mudar({ ...esc, classePersonalizada: { ...cp, resistencias: novas.filter((x) => x !== "") } });
                }}
                className={CLASSE_DE_SELECT}
              >
                <option value="">{p.escolher}</option>
                {dnd5e2014.atributos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className="mb-1 block text-sm font-semibold">{p.quantidadePericias}</label>
            <CampoNumero
              valor={cp.quantidadePericias}
              minimo={0}
              maximo={6}
              rotulo={p.quantidadePericias}
              aoMudar={(v) =>
                mudar({ ...esc, classePersonalizada: { ...cp, quantidadePericias: v }, periciasClasse: [] })
              }
            />
          </div>
        </div>
      )}

      {classe && srd && (
        <div className="cartao space-y-2 p-4">
          <h3 className="text-lg font-bold">{srd.nome}</h3>
          <p className="text-sm">
            <span className="font-semibold">{R.dadoDeVida}:</span> d{srd.dadoDeVida} ·{" "}
            <span className="font-semibold">{R.resistencias}:</span> {srd.resistencias.map(nomeDoAtributo).join(", ")}
          </p>
          <p className="text-sm">
            <span className="font-semibold">{R.armaduras}:</span> {lista(classe.armaduras)}
          </p>
          <p className="text-sm">
            <span className="font-semibold">{R.armas}:</span> {lista(srd.armas)}
          </p>
          <p className="text-sm">
            <span className="font-semibold">{R.ferramentas}:</span> {lista(srd.ferramentas)}
          </p>
          <p className="text-sm">
            <span className="font-semibold">{R.pericias}:</span> {R.escolhaNa} {srd.quantidadePericias}{" "}
            {srd.opcoesPericias.length > 0
              ? `${R.entre}: ${srd.opcoesPericias.map(nomeDaPericia).join(", ")}`
              : `(${R.qualquer})`}
          </p>
          <ListaDeTracos tracos={classe.tracos} />
        </div>
      )}

      {srd?.subclasse && (
        <div className="space-y-2">
          <h3 className="font-bold">{srd.subclasse.rotulo}</h3>
          <GrupoDeOpcoes
            rotulo={srd.subclasse.rotulo}
            opcoes={[
              ...srd.subclasse.opcoes.map((o) => ({ id: o.id, titulo: o.nome, descricao: o.descricao })),
              { id: PERSONALIZADA, titulo: "Outro (Personalizado)", descricao: "Para uma escolha fora do SRD." },
            ]}
            valor={esc.subclasseId}
            aoEscolher={(id) => mudar({ ...esc, subclasseId: id })}
          />
          {esc.subclasseId === PERSONALIZADA && (
            <div className="cartao p-4">
              <CampoTexto
                rotulo={p.subclasseNome}
                valor={esc.subclassePersonalizada}
                aoMudar={(v) => mudar({ ...esc, subclassePersonalizada: v })}
              />
            </div>
          )}
        </div>
      )}

      {srd?.estilosDeLuta && (
        <div className="space-y-2">
          <h3 className="font-bold">{t.criacao.estiloDeLuta}</h3>
          <GrupoDeOpcoes
            rotulo={t.criacao.estiloDeLuta}
            opcoes={ESTILOS_DE_LUTA.map((e) => ({ id: e.id, titulo: e.nome, descricao: e.descricao }))}
            valor={esc.estiloDeLutaId}
            aoEscolher={(id) => mudar({ ...esc, estiloDeLutaId: id })}
          />
        </div>
      )}
    </div>
  );
}

// ---------- 4. Antecedente ----------
export function PassoAntecedente({ esc, mudar }: PropsPasso) {
  const antecedente = antecedenteEfetivo(esc);
  const raca = racaEfetiva(esc);

  const opcoes = [
    ...ANTECEDENTES_SRD.map((a) => ({
      id: a.id,
      titulo: a.nome,
      descricao: a.descricao,
      extra: `${R.pericias}: ${a.pericias.map(nomeDaPericia).join(", ")}`,
    })),
    {
      id: PERSONALIZADA,
      titulo: t.criacao.antecedentePersonalizado,
      descricao: t.criacao.antecedentePersonalizadoTexto,
    },
  ];

  return (
    <div className="space-y-4">
      <GrupoDeOpcoes
        rotulo={t.criacao.antecedente}
        opcoes={opcoes}
        valor={esc.antecedenteId}
        aoEscolher={(id) => mudar(trocarAntecedente(esc, id))}
      />

      {esc.antecedenteId === PERSONALIZADA && (
        <div className="cartao space-y-2 p-4">
          <CampoTexto
            rotulo={t.criacao.personalizado.nome}
            valor={esc.antecedentePersonalizado.nome}
            aoMudar={(v) =>
              mudar({ ...esc, antecedentePersonalizado: { ...esc.antecedentePersonalizado, nome: v } })
            }
          />
          <p className="text-sm text-suave">{t.criacao.antecedenteNota}</p>
        </div>
      )}

      {antecedente && antecedente.srd && (
        <div className="cartao space-y-2 p-4">
          <h3 className="text-lg font-bold">{antecedente.nome}</h3>
          <ListaDeTracos tracos={antecedente.tracos} />
        </div>
      )}

      {antecedente && antecedente.idiomasExtras > 0 && (
        <SeletorDeIdiomas
          rotulo={t.criacao.idiomasExtras}
          quantidade={antecedente.idiomasExtras}
          escolhidos={esc.idiomasAntecedente}
          fixos={[...(raca?.idiomasFixos ?? []), ...esc.idiomasRaca]}
          aoMudar={(novos) => mudar({ ...esc, idiomasAntecedente: novos })}
        />
      )}
    </div>
  );
}

// ---------- 5. Atributos ----------
export function PassoAtributos({ esc, mudar }: PropsPasso) {
  const bonus = bonusDeAtributos(esc);
  const finais = atributosFinais(esc);

  return (
    <div className="space-y-4">
      <p className="text-suave">{t.criacao.atributosTexto}</p>
      <p className="text-sm text-suave">{t.criacao.atributosDica}</p>
      <ul className="cartao divide-y divide-borda">
        {dnd5e2014.atributos.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <span className="w-28 font-semibold">{a.nome}</span>
            <div className="w-24">
              <CampoNumero
                valor={esc.atributosBase[a.id] ?? 10}
                minimo={1}
                maximo={20}
                rotulo={`${t.criacao.base}: ${a.nome}`}
                aoMudar={(v) => mudar({ ...esc, atributosBase: { ...esc.atributosBase, [a.id]: v } })}
              />
            </div>
            <span className="text-sm text-suave">
              {t.criacao.bonusRaca} {sinal(bonus[a.id] ?? 0)}
            </span>
            <span className="text-sm">
              {t.criacao.total} <strong>{finais[a.id]}</strong> ({sinal(Math.floor((finais[a.id] - 10) / 2))})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- 6. Perícias ----------
export function PassoPericias({ esc, mudar }: PropsPasso) {
  const concedidas = periciasConcedidas(esc);
  const grupos = gruposDePericias(esc);
  const classe = classeEfetiva(esc);

  function definirGrupo(grupo: "raca" | "classe" | "antecedente", novas: string[]) {
    if (grupo === "raca") mudar({ ...esc, periciasRaca: novas });
    else if (grupo === "classe") mudar({ ...esc, periciasClasse: novas });
    else mudar({ ...esc, antecedentePersonalizado: { ...esc.antecedentePersonalizado, pericias: novas } });
  }

  return (
    <div className="space-y-4">
      <p className="text-suave">{t.criacao.periciasTexto}</p>

      <div className="cartao p-4">
        <h3 className="mb-2 font-bold">{t.criacao.periciasGarantidas}</h3>
        {concedidas.length === 0 ? (
          <p className="text-sm text-suave">{t.criacao.nenhumaGarantida}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {concedidas.map((c) => (
              <li key={c.id}>
                <span className="font-semibold">{nomeDaPericia(c.id)}</span> · {c.origem}
              </li>
            ))}
          </ul>
        )}
      </div>

      {grupos.map((g) => {
        const bloqueadas = periciasBloqueadas(esc, g.grupo);
        return (
          <CaixasDeEscolha
            key={g.grupo}
            rotulo={g.titulo}
            opcoes={g.opcoes.map((id) => ({ id, rotulo: nomeDaPericia(id), bloqueada: bloqueadas.has(id) }))}
            escolhidas={escolhidasDoGrupo(esc, g.grupo)}
            quantidade={g.quantidade}
            aoMudar={(novas) => definirGrupo(g.grupo, novas)}
          />
        );
      })}

      {classe && classe.especializacao > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-suave">{t.criacao.especializacaoTexto}</p>
          <CaixasDeEscolha
            rotulo={t.criacao.especializacao}
            opcoes={periciasProficientes(esc).map((id) => ({ id, rotulo: nomeDaPericia(id) }))}
            escolhidas={esc.especializacao}
            quantidade={classe.especializacao}
            aoMudar={(novas) => mudar({ ...esc, especializacao: novas })}
          />
        </div>
      )}
    </div>
  );
}

// ---------- 7. Revisão ----------
export function PassoRevisao({ esc }: { esc: EscolhasCriacao }) {
  const problemas = problemasDoPasso("revisao", esc);
  const { vidaMaxima } = previa(esc);
  const ficha = montarFicha(esc, () => "previa");
  const calculo = calcularTudo(dnd5e2014, ficha.dados);
  const d = ficha.dados;

  const nomesDasPericias = dnd5e2014.pericias
    .filter((p) => d.proficiencia.pericias[p.id] > 0)
    .map((p) => (d.proficiencia.pericias[p.id] === 2 ? `${p.nome} (${R.especialista})` : p.nome));
  const resistencias = dnd5e2014.atributos.filter((a) => d.proficiencia.resistencias[a.id] === 1).map((a) => a.nome);
  const proficiencias = [...d.outrasProficiencias.armaduras, ...d.outrasProficiencias.armas, ...d.outrasProficiencias.ferramentas];
  const resumo = t.criacao.resumo;

  return (
    <div className="space-y-4">
      <p className="text-suave">{t.criacao.revisaoTexto}</p>

      {problemas.length > 0 && (
        <div role="alert" className="rounded-lg border border-perigo p-4 text-sm text-perigo">
          <h3 className="mb-1 font-bold">{t.criacao.problemasTitulo}</h3>
          <ul className="list-disc space-y-1 pl-5">
            {problemas.map((problema) => (
              <li key={problema}>{problema}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="cartao space-y-3 p-4">
        <h3 className="text-xl font-bold">{ficha.nome}</h3>
        <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[11rem_1fr]">
          <dt className="font-semibold">{resumo.raca}</dt>
          <dd>{d.raca || "—"}</dd>
          <dt className="font-semibold">{resumo.classe}</dt>
          <dd>{d.classe || "—"}</dd>
          <dt className="font-semibold">{resumo.antecedente}</dt>
          <dd>{d.antecedente || "—"}</dd>
          <dt className="font-semibold">{resumo.vida}</dt>
          <dd>{vidaMaxima}</dd>
          <dt className="font-semibold">{resumo.ca}</dt>
          <dd>{calculo.ca.efetivo}</dd>
          <dt className="font-semibold">{resumo.deslocamento}</dt>
          <dd>{numeroBR(d.deslocamento)} m</dd>
          <dt className="font-semibold">{resumo.resistencias}</dt>
          <dd>{resistencias.join(", ") || "—"}</dd>
          <dt className="font-semibold">{resumo.pericias}</dt>
          <dd>{nomesDasPericias.join(", ") || "—"}</dd>
          <dt className="font-semibold">{resumo.idiomas}</dt>
          <dd>{d.idiomas.join(", ") || "—"}</dd>
          <dt className="font-semibold">{resumo.proficiencias}</dt>
          <dd>{proficiencias.join(", ") || "—"}</dd>
          <dt className="font-semibold">{resumo.habilidades}</dt>
          <dd>{d.habilidades.map((h) => h.nome).join(", ") || "—"}</dd>
        </dl>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {dnd5e2014.atributos.map((a) => (
          <div key={a.id} className="cartao p-3 text-center">
            <div className="text-xs font-semibold text-suave">{a.sigla}</div>
            <div className="text-xl font-bold">{d.atributos[a.id]}</div>
            <div className="text-sm text-suave">{sinal(calculo[`mod.${a.id}`].efetivo)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

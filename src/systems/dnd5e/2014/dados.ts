import { dnd5e2014 } from "./definicao";
import type { DadosDnd5e } from "./tipos";

/** Dados de uma ficha em branco. */
export function dadosVazios(): DadosDnd5e {
  const atributos: Record<string, number> = {};
  const resistencias: Record<string, number> = {};
  for (const a of dnd5e2014.atributos) {
    atributos[a.id] = 10;
    resistencias[a.id] = 0;
  }
  const pericias: Record<string, number> = {};
  for (const p of dnd5e2014.pericias) {
    pericias[p.id] = 0;
  }
  return {
    jogador: "",
    raca: "",
    classe: "",
    antecedente: "",
    alinhamento: "",
    nivel: 1,
    atributos,
    proficiencia: { pericias, resistencias },
    sobrescritas: {},
    vida: { atual: 10, maximo: 10, temporario: 0 },
    deslocamento: 9,
    anotacoes: "",
  };
}

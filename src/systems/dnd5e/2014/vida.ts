import type { Vida } from "./tipos";

function inteiroPositivo(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

/** Dano: gasta primeiro os PV temporários e só depois os PV atuais (nunca abaixo de 0). */
export function aplicarDano(vida: Vida, dano: number): Vida {
  const total = inteiroPositivo(dano);
  const absorvido = Math.min(vida.temporario, total);
  const restante = total - absorvido;
  return {
    ...vida,
    temporario: vida.temporario - absorvido,
    atual: Math.max(0, vida.atual - restante),
  };
}

/** Cura: soma aos PV atuais, sem passar do máximo (e sem reduzir quem já está acima dele). */
export function aplicarCura(vida: Vida, cura: number): Vida {
  const total = inteiroPositivo(cura);
  if (vida.atual >= vida.maximo) return vida;
  return { ...vida, atual: Math.min(vida.maximo, vida.atual + total) };
}

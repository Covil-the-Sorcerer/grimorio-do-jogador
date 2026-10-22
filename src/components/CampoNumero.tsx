import { useEffect, useRef, useState, type ChangeEvent } from "react";

function limitar(n: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, n));
}

// Campo de número inteiro que aceita digitação livre e só confirma valores válidos.
export function CampoNumero({
  valor,
  minimo,
  maximo,
  aoMudar,
  rotulo,
  id,
  className = "",
}: {
  valor: number;
  minimo: number;
  maximo: number;
  aoMudar: (novo: number) => void;
  rotulo: string;
  id?: string;
  className?: string;
}) {
  const [texto, setTexto] = useState(String(valor));
  const editando = useRef(false);

  // Enquanto a pessoa digita, não sobrescrevemos o que ela está escrevendo.
  useEffect(() => {
    if (!editando.current) setTexto(String(valor));
  }, [valor]);

  function aoDigitar(evento: ChangeEvent<HTMLInputElement>) {
    const digitado = evento.target.value;
    setTexto(digitado);
    const numero = Number(digitado);
    if (digitado.trim() !== "" && Number.isFinite(numero)) {
      aoMudar(limitar(Math.trunc(numero), minimo, maximo));
    }
  }

  function aoSair() {
    editando.current = false;
    setTexto(String(valor));
  }

  return (
    <input
      id={id}
      type="number"
      inputMode="numeric"
      aria-label={rotulo}
      min={minimo}
      max={maximo}
      value={texto}
      onFocus={(evento) => {
        editando.current = true;
        evento.currentTarget.select();
      }}
      onChange={aoDigitar}
      onBlur={aoSair}
      className={`min-h-[44px] w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto ${className}`}
    />
  );
}

import { useId } from "react";

export function CampoAreaTexto({
  rotulo,
  valor,
  aoMudar,
  linhas = 4,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (novo: string) => void;
  linhas?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {rotulo}
      </label>
      <textarea
        id={id}
        rows={linhas}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="w-full rounded-lg border border-borda bg-superficie p-3 text-base text-texto"
      />
    </div>
  );
}

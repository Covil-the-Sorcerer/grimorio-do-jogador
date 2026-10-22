import { useId } from "react";

export function CampoTexto({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (novo: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {rotulo}
      </label>
      <input
        id={id}
        type="text"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="min-h-[44px] w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto"
      />
    </div>
  );
}

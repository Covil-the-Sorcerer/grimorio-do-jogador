import { useEffect, useId, type ReactNode } from "react";

// Janela de diálogo simples, que fecha com a tecla Esc ou clicando fora dela.
export function Modal({
  titulo,
  aoFechar,
  children,
}: {
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const idTitulo = useId();

  useEffect(() => {
    function aoApertar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }
    window.addEventListener("keydown", aoApertar);
    return () => window.removeEventListener("keydown", aoApertar);
  }, [aoFechar]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={aoFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="cartao max-h-full w-full max-w-md overflow-y-auto p-5 shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 id={idTitulo} className="mb-4 text-xl font-bold">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}

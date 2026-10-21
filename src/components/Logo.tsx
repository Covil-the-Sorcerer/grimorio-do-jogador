// Marca do app: um hexágono (como um dado) com as páginas de um livro aberto.
export function Logo({ tamanho = 32 }: { tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M24 3 42 13.5v21L24 45 6 34.5v-21L24 3Z" fill="var(--destaque)" />
      <path
        d="M24 17.5c-3-2-7-2.6-11-2v15.5c4-.6 8 0 11 2 3-2 7-2.6 11-2V15.5c-4-.6-8 0-11 2Z"
        fill="var(--sobre-destaque)"
      />
      <path d="M24 17.5v15.5" stroke="var(--destaque)" strokeWidth="1.8" />
    </svg>
  );
}

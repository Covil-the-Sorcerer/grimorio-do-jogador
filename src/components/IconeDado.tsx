// Desenho de um dado: hexágono com o nome dentro (ex.: "d20").
export function IconeDado({ rotulo, tamanho = 40 }: { rotulo: string; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        d="M24 3 42 13.5v21L24 45 6 34.5v-21L24 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize={rotulo.length > 3 ? 12 : 15}
        fontWeight="700"
        fill="currentColor"
      >
        {rotulo}
      </text>
    </svg>
  );
}

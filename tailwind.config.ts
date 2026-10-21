import type { Config } from "tailwindcss";

// As cores vêm de variáveis CSS (ver src/index.css): o tema claro/escuro e, no futuro,
// os temas por sistema só trocam valores, sem mexer nos componentes.
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: "var(--fundo)",
        superficie: "var(--superficie)",
        superficie2: "var(--superficie-2)",
        texto: "var(--texto)",
        suave: "var(--texto-suave)",
        borda: "var(--borda)",
        destaque: "var(--destaque)",
        sobredestaque: "var(--sobre-destaque)",
        perigo: "var(--perigo)",
      },
      fontFamily: {
        // Só fontes que já existem no aparelho: nada para carregar, abre rápido.
        sans: ["Segoe UI", "system-ui", "-apple-system", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

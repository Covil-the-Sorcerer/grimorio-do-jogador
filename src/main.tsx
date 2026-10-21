import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { iniciarCapturaDeErros } from "./lib/diagnostico";
import { carregarPreferencias } from "./lib/preferencias";
import "./index.css";

iniciarCapturaDeErros();

const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("Elemento #raiz não encontrado no index.html.");

createRoot(raiz).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// O app abre já com o tema do último uso; aqui lemos o arquivo para confirmar.
void carregarPreferencias();

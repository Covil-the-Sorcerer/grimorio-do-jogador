import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Configuracoes } from "./pages/Configuracoes";
import { Diagnostico } from "./pages/Diagnostico";
import { FichaPagina } from "./pages/FichaPagina";
import { Fichas } from "./pages/Fichas";
import { Homebrew } from "./pages/Homebrew";

// Rotas em modo "hash" (#/fichas): funcionam bem em app empacotado, sem precisar de servidor.
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/fichas" element={<Fichas />} />
          <Route path="/ficha/:id" element={<FichaPagina />} />
          <Route path="/homebrew" element={<Homebrew />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="*" element={<Navigate to="/fichas" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

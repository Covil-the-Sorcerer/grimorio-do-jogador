import type { Armazenamento } from "./armazenamento";
import { chamar } from "./tauri";

// Os comandos abaixo estão em src-tauri/src/lib.rs.
// Todos os caminhos são relativos à pasta de dados do app (ex.: "fichas/abc.json").
export class ArmazenamentoWindows implements Armazenamento {
  ler(caminho: string) {
    return chamar<string | null>("ler_arquivo", { caminho });
  }

  async gravar(caminho: string, conteudo: string) {
    await chamar<void>("gravar_arquivo", { caminho, conteudo });
  }

  listar(pasta: string) {
    return chamar<string[]>("listar_arquivos", { pasta });
  }

  async apagar(caminho: string) {
    await chamar<void>("apagar_arquivo", { caminho });
  }

  descricao() {
    return chamar<string>("caminho_dados");
  }
}

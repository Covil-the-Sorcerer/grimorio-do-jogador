// Contrato único de armazenamento. Hoje existem duas versões:
//  - Windows (app instalado): arquivos na pasta de dados do app;
//  - Navegador: só para desenvolvimento.
// No futuro, uma terceira (Android) implementa o mesmo contrato sem mudar o resto do app.
export interface Armazenamento {
  /** Lê um arquivo de texto. Devolve null se ele não existir. */
  ler(caminho: string): Promise<string | null>;
  /** Grava um arquivo de texto (criando as pastas necessárias, de forma segura). */
  gravar(caminho: string, conteudo: string): Promise<void>;
  /** Lista os nomes dos arquivos de uma pasta. */
  listar(pasta: string): Promise<string[]>;
  /** Apaga um arquivo (sem erro se ele não existir). */
  apagar(caminho: string): Promise<void>;
  /** Texto que descreve onde os dados ficam guardados. */
  descricao(): Promise<string>;
}

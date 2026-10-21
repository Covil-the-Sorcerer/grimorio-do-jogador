import type { Armazenamento } from "./armazenamento";

const PREFIXO = "gj-arquivo:";

// Versão só para desenvolvimento (rodando no navegador). O app de verdade usa a do Windows.
export class ArmazenamentoNavegador implements Armazenamento {
  async ler(caminho: string) {
    return localStorage.getItem(PREFIXO + caminho);
  }

  async gravar(caminho: string, conteudo: string) {
    localStorage.setItem(PREFIXO + caminho, conteudo);
  }

  async listar(pasta: string) {
    const inicio = `${PREFIXO}${pasta}/`;
    const nomes: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave && chave.startsWith(inicio)) {
        const resto = chave.slice(inicio.length);
        if (!resto.includes("/")) nomes.push(resto);
      }
    }
    return nomes.sort();
  }

  async apagar(caminho: string) {
    localStorage.removeItem(PREFIXO + caminho);
  }

  async descricao() {
    return "Armazenamento do navegador (somente para desenvolvimento)";
  }
}

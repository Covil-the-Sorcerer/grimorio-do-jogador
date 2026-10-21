# Grimório do Jogador — versão de Windows (Fases 1 e 2)

App para criar, guardar e usar fichas de RPG de mesa, 100% no seu computador (sem conta, sem internet, sem nuvem).
Esta primeira versão é a **base**: janela do app, menu, tema claro/escuro, tamanho da letra, gravação de arquivos e uma tela de **diagnóstico**. Fichas, dados e regras vêm nas próximas fases.

Você **não precisa instalar nada no seu computador** para gerar o instalador: o GitHub faz isso na nuvem.

## O que cada arquivo faz (resumo)

- `src/` — as telas do app (React).
- `src-tauri/` — o "embrulho" que transforma o app em programa de Windows e grava os arquivos no seu PC.
- `.github/workflows/windows.yml` — a receita que o GitHub segue para montar o instalador.

## Passo a passo

### 1. Criar a conta e o repositório no GitHub
1. Crie uma conta gratuita em https://github.com.
2. Clique em **New repository** (botão verde, ou o **+** no topo).
3. Nome: `grimorio-do-jogador`. Marque **Public** (repositório público não gasta a cota gratuita de compilação; confirme os limites atuais na página do GitHub se preferir deixar privado).
4. Clique em **Create repository**. Não marque nenhuma opção de README.

### 2. Enviar o projeto
1. Descompacte o zip. Dentro dele há uma pasta `grimorio-app`.
2. Na página do repositório recém-criado, clique em **uploading an existing file** (ou **Add file > Upload files**).
3. Abra a pasta `grimorio-app` e **arraste o CONTEÚDO dela** (as pastas `.github`, `public`, `src`, `src-tauri` e os arquivos soltos) para a janela do GitHub. Não arraste a pasta `grimorio-app` em si.
4. Espere terminar de carregar e clique em **Commit changes**.

Confira no repositório: devem aparecer as pastas `.github`, `public`, `src`, `src-tauri` e arquivos como `package.json` e `index.html`. Se `.github` não aparecer, envie-a de novo (ela é essencial).

### 3. Gerar o instalador
1. Clique na aba **Actions** do repositório. Se aparecer um botão de habilitar, habilite.
2. O envio do passo 2 já inicia a compilação sozinho ("Instalador do Windows"). Se não iniciar, escolha o fluxo na lateral e clique em **Run workflow**.
3. Espere. A **primeira vez demora** (de 10 a 25 minutos, aproximadamente), porque baixa e compila muita coisa. As próximas são mais rápidas.
4. Um **círculo verde** é sucesso. Um **X vermelho** é erro (veja o passo 6).

### 4. Baixar e instalar
1. Clique na compilação concluída e, no fim da página, em **Artifacts**, baixe **grimorio-windows** (vem em um zip).
2. Extraia o zip: dentro há o instalador `.exe`.
3. Ao abrir, o Windows pode mostrar "O Windows protegeu seu computador". Clique em **Mais informações** e depois em **Executar assim mesmo**. Isso acontece porque o instalador não tem assinatura paga.
4. O instalador é por usuário (não pede senha de administrador).

### 5. O que testar
1. O app abre numa janela, com menu lateral (Fichas, Homebrew, Configurações).
2. O botão de sol/lua do topo troca o tema; em Configurações, o tema e o tamanho da letra também mudam, e os dois se mantêm iguais entre si.
3. Feche e abra o app: tema e tamanho da letra devem continuar.
4. **Configurações > Abrir diagnóstico > Testar gravação de arquivos**: deve aparecer "Gravação e leitura funcionando", e a **pasta dos dados** deve aparecer (algo como `C:\Users\SEU-NOME\AppData\Roaming\com.grimorio.jogador`).
5. Diminua a janela até ficar estreita (como um celular): o menu vira uma gaveta, aberta pelo botão de três traços.
6. Para reinstalar uma versão nova, rode o instalador novo por cima: os dados continuam.

### 6. Se der erro
- **Erro na compilação (X vermelho):** abra a compilação, clique no passo que falhou (marcado em vermelho), copie o texto do erro e me envie. O primeiro envio provavelmente precisará de ajustes, porque este projeto ainda não foi compilado de verdade.
- **Erro dentro do app:** abra Configurações > Abrir diagnóstico, clique em **Copiar relatório** e envie o texto.
- **Tela em branco ao abrir o app:** me avise com um print.

## Observações
- Os dados ficam em arquivos na pasta mostrada no diagnóstico. Fazer cópia dessa pasta já é uma cópia de segurança (o botão de backup dentro do app chega em uma próxima fase).
- Não mude o identificador `com.grimorio.jogador` (em `src-tauri/tauri.conf.json`): ele define onde os dados ficam e, se mudar, o app não encontra mais as fichas antigas.
- O Android entra depois que o Windows estiver funcionando bem.

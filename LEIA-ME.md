# Grimório do Jogador — versão de Windows (0.3: abas Personagem e Habilidades)

App para criar, guardar e usar fichas de RPG de mesa, 100% no seu computador (sem conta, sem internet, sem nuvem).

## O que há de novo nesta versão

- **Aba "Personagem":** campos de texto para traços de personalidade, ideais, vínculos, fraquezas, história, características físicas, aliados e organizações e tesouros, mais a **imagem de perfil** do personagem.
- **Imagem de perfil:** você escolhe um arquivo (JPG, PNG ou WebP); o app recorta em quadrado, reduz e guarda no aparelho. Ela aparece no topo da ficha e no card da lista. Duplicar uma ficha copia a imagem, e excluir a ficha apaga a imagem.
- **Aba "Habilidades e proficiências":** listas para **armas**, **armaduras e escudos**, **ferramentas e instrumentos** e **idiomas** (digite e aperte Enter para adicionar; toque no × para remover) e **cartões de habilidades** (nome, origem e descrição), com confirmação ao remover.
- **Ordem das abas:** Informações, Personagem, Atributos, Perícias, Combate, Habilidades e proficiências, Anotações.
- A opção de **especialista** nas perícias continua como estava. Quando entrar a criação guiada, ela ficará disponível só para Bardo e Ladino.
- **Mais testes automáticos** do motor de regras e da leitura de fichas (agora 25).
- Fichas criadas na versão anterior continuam abrindo normalmente; os campos novos começam vazios.

Ainda **não** existe: rolagem de dados, criação guiada, magias, inventário, listas de raças e classes, exportar/importar ficha e cópia de segurança.

## Como atualizar o app

1. Descompacte o zip e abra a pasta `grimorio-app`.
2. No repositório do GitHub, clique em **Add file > Upload files**.
3. Arraste o **conteúdo** da pasta `grimorio-app` (as pastas `public`, `src`, `src-tauri`, `tests` e os arquivos soltos). O GitHub substitui os arquivos de mesmo nome. Você **não** precisa mexer na pasta `.github`: o arquivo `windows.yml` que você já criou continua valendo.
4. Clique em **Commit changes**. A compilação começa sozinha (aba **Actions**).
5. Quando ficar verde, baixe o `grimorio-windows` em **Artifacts**, extraia e rode o instalador **por cima** da versão antiga. Suas configurações e fichas continuam.

## O que testar

1. **Atualização:** depois de instalar por cima, suas fichas antigas devem abrir normalmente e ter as abas novas.
2. **Aba Personagem:** escreva um texto em cada campo (inclusive uma história longa). Feche e abra o app e confira que tudo ficou salvo.
3. **Imagem de perfil:** em Personagem, toque em **Escolher imagem** e escolha uma foto. Ela deve aparecer ali, no topo da ficha e no card da lista de fichas. Teste também **Trocar imagem** e **Remover imagem**.
4. **Imagens difíceis:** tente uma foto grande (de celular), um PNG com fundo transparente e um arquivo que não seja imagem (deve aparecer uma mensagem de erro clara, sem travar).
5. **Duplicar e excluir:** duplique uma ficha com imagem (a cópia deve ter a mesma imagem) e exclua uma delas.
6. **Aba Habilidades e proficiências:** adicione armas, armaduras, ferramentas e idiomas pelo campo + Enter. Tente repetir um item (não deve duplicar) e remover com o ×.
7. **Cartões de habilidades:** adicione uma habilidade, preencha nome, origem e descrição, e depois remova (deve pedir confirmação).
8. **Abas em janela estreita:** diminua a janela e veja se a barra de abas rola para o lado e se tudo continua utilizável.
9. **Sem regressão:** confira que atributos, perícias, override, PV e salvamento continuam funcionando.

## Se der erro

- **Erro na compilação (X vermelho):** abra a compilação, clique no passo que falhou, copie o texto do erro e me envie. Se falhar em "Gerar o instalador" logo no começo, o texto mostrará se foi um dos **testes** ou outra coisa.
- **Erro dentro do app:** Configurações > Abrir diagnóstico > Copiar relatório.
- **Imagem que não carrega:** o diagnóstico mostra a mensagem. O arquivo da imagem fica na pasta `retratos`, dentro da pasta de dados.
- **Uma ficha que não abre:** o diagnóstico mostra o motivo. O arquivo da ficha fica na pasta de dados (o caminho aparece no diagnóstico), dentro de `fichas`.

## Observações

- Os dados ficam em arquivos na pasta mostrada no diagnóstico. Copiar a pasta `fichas` já é uma cópia de segurança (o botão de backup dentro do app chega depois).
- Não mude o identificador `com.grimorio.jogador` em `src-tauri/tauri.conf.json`: ele define onde os dados ficam.
- As abas estão em uma barra no topo da ficha. O botão flutuante com grade, previsto no desenho original, pode ser feito depois se você preferir.
- O Android entra depois que o Windows estiver funcionando bem.

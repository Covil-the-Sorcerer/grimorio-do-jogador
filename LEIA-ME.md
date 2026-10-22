# Grimório do Jogador — versão de Windows (0.2: primeiras fichas de D&D 5e)

App para criar, guardar e usar fichas de RPG de mesa, 100% no seu computador (sem conta, sem internet, sem nuvem).

## O que há de novo nesta versão

- **Lista de fichas:** criar, abrir, duplicar e excluir (com confirmação).
- **Nova ficha:** nome e regras da mesa (versão 2014; multiclasse sim/não). A criação guiada chega depois; por enquanto a ficha começa em branco.
- **Ficha de D&D 5e em abas:** Informações, Atributos, Perícias, Combate e Anotações.
- **Cabeçalho fixo** com PV (botões − e + com campo de quantidade), CA e iniciativa.
- **Cálculos automáticos** pelas regras de D&D 5e (2014): modificadores, bônus de proficiência, resistências, perícias, iniciativa, CA e percepção passiva.
- **Override:** toque em qualquer número calculado para trocá-lo à mão. Ele fica marcado como "manual", e o botão "Voltar ao automático" desfaz a troca.
- **Salvamento automático** a cada alteração, em arquivos na pasta de dados do app.
- **Motor de regras:** as regras de D&D agora são dados lidos por um motor próprio, o que prepara a entrada de outros sistemas. Há testes automáticos (rodam antes de cada compilação).

Ainda **não** existe: rolagem de dados, criação guiada, magias, inventário, listas de raças e classes, exportar/importar ficha e cópia de segurança.

## Como atualizar o app

1. Descompacte o zip e abra a pasta `grimorio-app`.
2. No repositório do GitHub, clique em **Add file > Upload files**.
3. Arraste o **conteúdo** da pasta `grimorio-app` (as pastas `public`, `src`, `src-tauri`, `tests` e os arquivos soltos). O GitHub substitui os arquivos de mesmo nome. Você **não** precisa mexer na pasta `.github`: o arquivo `windows.yml` que você já criou continua valendo.
4. Clique em **Commit changes**. A compilação começa sozinha (aba **Actions**).
5. Quando ficar verde, baixe o `grimorio-windows` em **Artifacts**, extraia e rode o instalador **por cima** da versão antiga. Suas configurações e fichas continuam.

## O que testar

1. **Criar uma ficha:** Fichas > Nova ficha > digite um nome, deixe a versão 2014 e crie. Ela abre sozinha.
2. **Atributos:** na aba Atributos, mude a Destreza para 16: o modificador deve virar +3, e a CA e a iniciativa (no cabeçalho) acompanham.
3. **Perícias:** toque no círculo de uma perícia: sem proficiência (○), proficiente (●) e especialista (◆). O número deve mudar (nível 1: bônus +2; especialista soma o dobro).
4. **Override:** na aba Combate, toque no valor da CA, digite 18 e confirme com Enter. Ele fica marcado "manual". Toque em "Voltar ao automático" e ele volta ao valor calculado.
5. **PV:** no cabeçalho, digite uma quantidade e use − e +. Com PV temporários (aba Combate), o dano gasta primeiro os temporários. A cura não passa do máximo.
6. **Salvamento:** olhe o aviso "Salvo" no cabeçalho. Feche o app, abra de novo e confira que tudo continua.
7. **Lista:** volte para Fichas, duplique a ficha, abra a cópia e depois exclua uma delas.
8. **Janela estreita:** diminua a janela até virar "celular" e veja se as abas e o cabeçalho continuam utilizáveis.
9. **Tema e letra grande:** troque o tema e o tamanho da letra e confira a ficha.

## Se der erro

- **Erro na compilação (X vermelho):** abra a compilação, clique no passo que falhou, copie o texto do erro e me envie. Se falhar em "Gerar o instalador" logo no começo, o texto mostrará se foi um dos **testes** ou outra coisa.
- **Erro dentro do app:** Configurações > Abrir diagnóstico > Copiar relatório.
- **Uma ficha que não abre:** o diagnóstico mostra o motivo. O arquivo da ficha fica na pasta de dados (o caminho aparece no diagnóstico), dentro de `fichas`.

## Observações

- Os dados ficam em arquivos na pasta mostrada no diagnóstico. Copiar a pasta `fichas` já é uma cópia de segurança (o botão de backup dentro do app chega depois).
- Não mude o identificador `com.grimorio.jogador` em `src-tauri/tauri.conf.json`: ele define onde os dados ficam.
- As abas estão em uma barra no topo da ficha. O botão flutuante com grade, previsto no desenho original, pode ser feito depois se você preferir.
- O Android entra depois que o Windows estiver funcionando bem.

# Grimório do Jogador — versão de Windows (0.4: rolador de dados)

App para criar, guardar e usar fichas de RPG de mesa, 100% no seu computador (sem conta, sem internet, sem nuvem).

## O que há de novo nesta versão

**Rolador de dados**
- **Botão redondo com um d20** no canto de baixo à direita de qualquer tela: abre o **Painel de Dados**.
- **Dados rápidos:** d4, d6, d8, d10, d12, d20 e d100. Um toque rola o dado escolhido.
- **Fórmula livre:** digite, por exemplo, `2d8+3`, `1d20-1` ou `2d6+1d4+2` e toque em Rolar.
- **Vantagem e desvantagem:** vale para rolagens com 1d20 (rola duas vezes e fica com o maior ou o menor; o dado descartado aparece riscado).
- **Resultado detalhado:** nome da rolagem, total, a conta (dados e modificador), o horário e a marca "20 Natural" ou "1 Natural".
- **Histórico** só seu, com as últimas 100 rolagens, guardado no aparelho. Há botão para limpar.
- **Resultado rápido:** ao rolar com o painel fechado, o resultado aparece por alguns segundos na tela.
- **Rolagens ligadas à ficha:** botão com d20 ao lado de cada **teste de atributo**, **resistência**, **perícia** e da **iniciativa**, já somando o modificador atual (inclusive se você trocou o valor à mão).
- **Ataques (aba Combate):** adicione ataques com nome, bônus, dano (por exemplo `1d8+3`) e tipo de dano. Cada ataque tem **Atacar**, **Rolar Dano** e **Dano Crítico** (que dobra os dados, mas não os bônus).

**Ajustes pedidos**
- **Aba Personagem em duas colunas**, na ordem: Características Físicas | Traços de Personalidade; Ideais | Vínculos; Fraquezas | Aliados e Organizações; Tesouros; História.
- **Nomes de campos, abas, títulos e botões** com inicial maiúscula em cada palavra (e, o, a, os, as, de, do, da, dos, das, em, no, na, com, ou, ao, aos e para ficam em minúsculo no meio). Frases de explicação e avisos seguem como frases normais.
- **Abas sem barra de rolagem:** quando há abas fora da tela, a ponta fica com efeito de esmaecer e uma seta clicável. O efeito some ao chegar no limite. A aba escolhida sempre fica à vista.

**Por dentro:** 37 testes automáticos (motor de regras, leitura de fichas e rolagem de dados), que rodam antes de cada compilação. Fichas das versões anteriores continuam abrindo (a lista de ataques começa vazia).

Ainda **não** existe: criação guiada, magias, inventário, listas de raça e classe, exportar/importar ficha e cópia de segurança.

## Como atualizar o app

1. Descompacte o zip e abra a pasta `grimorio-app`.
2. No repositório do GitHub, clique em **Add file > Upload files**.
3. Arraste o **conteúdo** da pasta `grimorio-app` (as pastas `public`, `src`, `src-tauri`, `tests` e os arquivos soltos). O GitHub substitui os arquivos de mesmo nome. Você **não** precisa mexer na pasta `.github`: o arquivo `windows.yml` que você já criou continua valendo.
4. Clique em **Commit changes**. A compilação começa sozinha (aba **Actions**).
5. Quando ficar verde, baixe o `grimorio-windows` em **Artifacts**, extraia e rode o instalador **por cima** da versão antiga. Suas configurações e fichas continuam.

## O que testar

1. **Atualização:** depois de instalar por cima, suas fichas e a imagem de perfil devem estar como antes.
2. **Painel de dados:** toque no botão redondo. Role cada dado (d4 a d100) e confira se os resultados ficam entre 1 e o número de lados.
3. **Fórmulas:** digite `2d8+3`, `1d20-1`, `1d20 + 5` (com espaços) e `2d6+1d4+2`. Depois tente fórmulas erradas (`2d6 3`, `abc`, `0d6`, `1d2000`): deve aparecer uma mensagem clara.
4. **Vantagem e desvantagem:** escolha **Vantagem**, role `1d20+5` e veja dois dados, um deles riscado (o menor). Faça o mesmo com **Desvantagem** (o maior fica riscado). Com `2d6`, o modo é ignorado.
5. **Natural:** role o d20 várias vezes até aparecer "20 Natural" ou "1 Natural".
6. **Histórico:** feche e abra o app: as rolagens anteriores continuam. Teste **Limpar Histórico** (pede confirmação).
7. **Resultado rápido:** feche o painel, role algo pela ficha e veja o cartão aparecer por alguns segundos. O botão "Ver Histórico" abre o painel.
8. **Ligação com a ficha:** na aba Atributos, toque no d20 ao lado de um modificador e de uma resistência; em Perícias, role uma perícia com proficiência; em Combate, role a iniciativa. Confira se o total bate com o número da ficha. Troque um valor à mão (override) e role de novo: deve usar o valor trocado.
9. **Ataques:** em Combate, adicione um ataque (`Adaga`, bônus 5, dano `1d4+3`). Teste **Atacar**, **Rolar Dano** e **Dano Crítico** (deve rolar 2d4+3). Digite uma fórmula de dano inválida e veja o aviso. Remova o ataque (pede confirmação).
10. **Aba Personagem:** confira a ordem em duas colunas e, ao diminuir a janela, a coluna única.
11. **Nomes:** confira as maiúsculas nos rótulos, abas e botões do app inteiro e me avise se algum ficou fora da regra.
12. **Abas com setas:** diminua a janela até as abas não caberem. Deve aparecer o esmaecer com uma seta à direita; clique nela para rolar, e veja a seta da esquerda aparecer. Ao chegar no fim, a seta da direita some. Teste também com o toque/touchpad e com a tecla Tab.

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

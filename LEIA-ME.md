# Grimório do Jogador — versão de Windows (0.5: criação guiada de ficha)

App para criar, guardar e usar fichas de RPG de mesa, 100% no seu computador (sem conta, sem internet, sem nuvem).

## O que há de novo nesta versão

**Criação guiada de ficha** (botão **Nova Ficha > Criação Guiada**)
Um passo por vez, com as opções explicadas, validação antes de avançar e uma revisão no final:
1. **Nome e Regras:** nome, versão (2014) e multiclasse.
2. **Raça:** as 9 do SRD (Anão, Elfo, Halfling, Humano, Draconato, Gnomo, Meio-Elfo, Meio-Orc, Tiefling), com sub-raça (Anão da Colina, Alto Elfo, Halfling Pés Leves, Gnomo da Rocha), ancestral dracônico, bônus à escolha do Meio-Elfo, idiomas extras e ferramenta do Anão. Há também **Raça Personalizada** e **Sub-Raça Personalizada** (para o Anão da Montanha, por exemplo).
3. **Classe:** as 12 do SRD, com dado de vida, resistências, proficiências e características do 1º nível. Pede o Domínio (Clérigo), a Origem (Feiticeiro), o Patrono (Bruxo) e o Estilo de Luta (Guerreiro). Há também **Classe Personalizada**.
4. **Antecedente:** o Acólito (o SRD traz só esse) e **Antecedente Personalizado**.
5. **Atributos:** você digita o valor base de cada um; o bônus da raça é somado sozinho.
6. **Perícias:** as garantidas pela raça e pelo antecedente já vêm marcadas, e você escolhe as demais (sem repetir). O Ladino escolhe a especialização.
7. **Revisão:** resumo com PV, CA, perícias, idiomas, proficiências e habilidades.

A ficha sai pronta: atributos finais, PV do 1º nível (dado de vida + Constituição + bônus da raça ou da linhagem), resistências e perícias com proficiência, idiomas, proficiências com armas, armaduras e ferramentas, e as características da raça, da classe e do antecedente já como cartões na aba Habilidades e Proficiências. O **deslocamento** da raça vem em metros (7,5 m, por exemplo).

Ainda **não** entram na criação: equipamento inicial e magias (chegam com o inventário e as magias).

**Outras mudanças**
- **Painel de Dados** com rolagem sem barra visível: fade e seta clicável em cima e embaixo quando há mais conteúdo. Nada é espremido.
- **CA sem armadura** de Bárbaro, Monge e Linhagem Dracônica calculada automaticamente (continua dando para trocar à mão).
- **Especialização nas perícias** agora só para Bardo e Ladino (nas outras classes, o círculo alterna só entre sem proficiência e proficiente).
- **Deslocamento** aceita meio ponto (7,5 m).
- **Ficha em Branco** continua existindo (Nova Ficha > Ficha em Branco).
- **Sobre e Licenças** (em Configurações): traz a nota de atribuição exigida pela licença do SRD 5.1 (CC-BY-4.0).
- 50 testes automáticos (agora cobrindo a criação guiada com vários cenários).

## Como atualizar o app

1. Descompacte o zip e abra a pasta `grimorio-app`.
2. No repositório do GitHub, clique em **Add file > Upload files**.
3. Arraste o **conteúdo** da pasta `grimorio-app` (as pastas `public`, `src`, `src-tauri`, `tests` e os arquivos soltos). O GitHub substitui os arquivos de mesmo nome. Você **não** precisa mexer na pasta `.github`: o arquivo `windows.yml` que você já criou continua valendo.
4. Clique em **Commit changes**. A compilação começa sozinha (aba **Actions**).
5. Quando ficar verde, baixe o `grimorio-windows` em **Artifacts**, extraia e rode o instalador **por cima** da versão antiga. Suas configurações e fichas continuam.

## O que testar

1. **Atualização:** suas fichas, imagens e o histórico de dados devem estar como antes.
2. **Painel de Dados:** role vários dados até a lista ficar longa. Não deve aparecer barra de rolagem, e os elementos não devem ser espremidos. Deve aparecer o esmaecer com uma seta embaixo (e, ao rolar, outra em cima); clique nas setas.
3. **Criação guiada completa:** Nova Ficha > Criação Guiada. Monte um **Anão da Colina, Guerreiro, Acólito** (ferramenta de pedreiro, estilo de luta Defesa, 2 perícias de classe, 2 idiomas). Na revisão, confira PV (com Constituição e Tenacidade Anã), CA, deslocamento 7,5 m e idiomas.
4. **Validações:** em cada passo, tente continuar sem escolher: deve aparecer "Falta Resolver" com o que falta. Volte e mude de raça ou classe: as escolhas antigas (perícias, idiomas) devem ser limpas.
5. **Outros cenários:** monte um **Draconato Feiticeiro** (confira o sopro conforme o dragão escolhido, o +1 de PV e a CA 13 + Destreza), um **Bárbaro** (CA = 10 + Destreza + Constituição), um **Monge** (CA com Sabedoria), um **Meio-Elfo Ladino** (bônus à escolha, 2 perícias da raça e especialização).
6. **Personalizados:** crie uma **Raça Personalizada**, uma **Sub-Raça Personalizada** (por exemplo, Anão da Montanha: +2 Força) e uma **Classe Personalizada**.
7. **Ficha criada:** abra a ficha e veja as abas: atributos, perícias, resistências, Habilidades e Proficiências (cartões de características) e a aba Combate (PV).
8. **Especialização:** numa ficha de Guerreiro, o círculo das perícias alterna só entre dois estados. Numa ficha de Ladino ou Bardo, alterna entre três.
9. **Deslocamento:** na aba Combate, digite 7,5 e confira se fica salvo.
10. **Ficha em Branco:** Nova Ficha > Ficha em Branco ainda funciona.
11. **Sobre e Licenças:** Configurações > Sobre e Licenças deve mostrar a nota do SRD.
12. **Sem regressão:** dados, ataques, imagem de perfil, abas com setas e salvamento.

Me avise também se alguma descrição de raça ou classe estiver confusa, errada ou mal traduzida.

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

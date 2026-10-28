import type { ClasseSrd } from "./tipos";

// Classes do SRD 5.1 (CC-BY-4.0): dados do 1º nível, traduzidos e resumidos.
export const CLASSES_SRD: ClasseSrd[] = [
  {
    id: "barbaro",
    nome: "Bárbaro",
    descricao: "Guerreiro feroz, movido pela fúria, que aguenta muito dano e causa ainda mais.",
    dadoDeVida: 12,
    resistencias: ["for", "con"],
    armaduras: ["Armaduras leves", "Armaduras médias", "Escudos"],
    armas: ["Armas simples", "Armas marciais"],
    ferramentas: [],
    quantidadePericias: 2,
    opcoesPericias: ["adestrarAnimais", "atletismo", "intimidacao", "natureza", "percepcao", "sobrevivencia"],
    idiomas: [],
    tracos: [
      {
        nome: "Fúria",
        descricao:
          "Como ação bônus, você entra em fúria por 1 minuto: vantagem em testes e resistências de Força, +2 de dano em ataques corpo a corpo com Força e resistência a dano contundente, cortante e perfurante. No 1º nível você tem 2 usos, recuperados em um descanso longo.",
      },
      {
        nome: "Defesa Sem Armadura",
        descricao: "Sem armadura, sua CA é 10 + modificador de Destreza + modificador de Constituição. Você pode usar escudo.",
      },
    ],
    defesaSemArmadura: "barbaro",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: null,
  },
  {
    id: "bardo",
    nome: "Bardo",
    descricao: "Artista e conjurador que inspira aliados e molda a realidade com música e palavras.",
    dadoDeVida: 8,
    resistencias: ["des", "car"],
    armaduras: ["Armaduras leves"],
    armas: ["Armas simples", "Bestas de mão", "Espadas longas", "Rapieiras", "Espadas curtas"],
    ferramentas: ["Três instrumentos musicais (à escolha)"],
    quantidadePericias: 3,
    opcoesPericias: [],
    idiomas: [],
    tracos: [
      {
        nome: "Conjuração",
        descricao:
          "Você conjura magias de bardo usando Carisma. No 1º nível conhece 2 truques e 4 magias, e tem 2 espaços de magia de 1º nível. Seu foco de conjuração pode ser um instrumento musical.",
      },
      {
        nome: "Inspiração de Bardo",
        descricao:
          "Como ação bônus, você dá a uma criatura a até 18 m que possa ouvi-lo um d6 de Inspiração. Ela pode somá-lo a um teste, ataque ou resistência. Você tem usos iguais ao modificador de Carisma (mínimo 1) por descanso longo.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: null,
  },
  {
    id: "clerigo",
    nome: "Clérigo",
    descricao: "Servo de uma divindade que canaliza poder divino para curar, proteger e combater.",
    dadoDeVida: 8,
    resistencias: ["sab", "car"],
    armaduras: ["Armaduras leves", "Armaduras médias", "Escudos"],
    armas: ["Armas simples"],
    ferramentas: [],
    quantidadePericias: 2,
    opcoesPericias: ["historia", "intuicao", "medicina", "persuasao", "religiao"],
    idiomas: [],
    tracos: [
      {
        nome: "Conjuração",
        descricao:
          "Você conjura magias de clérigo usando Sabedoria. No 1º nível conhece 3 truques e prepara magias a cada descanso longo. Seu foco de conjuração é um símbolo sagrado.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: {
      rotulo: "Domínio Divino",
      opcoes: [
        {
          id: "dominioVida",
          nome: "Domínio da Vida",
          descricao: "Foco em cura e proteção dos vivos.",
          tracos: [
            {
              nome: "Magias de Domínio",
              descricao: "Você sempre tem preparadas as magias Bênção e Curar Ferimentos.",
            },
            {
              nome: "Discípulo da Vida",
              descricao: "Suas magias de cura de 1º nível ou maior restauram 2 + nível da magia PV adicionais.",
            },
          ],
          armaduras: ["Armaduras pesadas"],
          idiomas: [],
          vidaPorNivel: 0,
          defesaSemArmadura: "",
        },
      ],
    },
  },
  {
    id: "druida",
    nome: "Druida",
    descricao: "Guardião da natureza que conjura magias primais e, mais tarde, assume formas de animais.",
    dadoDeVida: 8,
    resistencias: ["int", "sab"],
    armaduras: ["Armaduras leves (não metálicas)", "Armaduras médias (não metálicas)", "Escudos (não metálicos)"],
    armas: ["Clavas", "Adagas", "Dardos", "Azagaias", "Maças", "Bordões", "Cimitarras", "Foices", "Fundas", "Lanças"],
    ferramentas: ["Kit de herbalismo"],
    quantidadePericias: 2,
    opcoesPericias: ["arcanismo", "adestrarAnimais", "intuicao", "medicina", "natureza", "percepcao", "religiao", "sobrevivencia"],
    idiomas: ["Druídico"],
    tracos: [
      {
        nome: "Druídico",
        descricao: "Você conhece o Druídico, o idioma secreto dos druidas, e pode deixar mensagens ocultas com ele.",
      },
      {
        nome: "Conjuração",
        descricao:
          "Você conjura magias de druida usando Sabedoria. No 1º nível conhece 2 truques e prepara magias a cada descanso longo. Seu foco é um foco druídico.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: null,
  },
  {
    id: "guerreiro",
    nome: "Guerreiro",
    descricao: "Mestre das armas e armaduras, resistente e versátil em qualquer combate.",
    dadoDeVida: 10,
    resistencias: ["for", "con"],
    armaduras: ["Armaduras leves", "Armaduras médias", "Armaduras pesadas", "Escudos"],
    armas: ["Armas simples", "Armas marciais"],
    ferramentas: [],
    quantidadePericias: 2,
    opcoesPericias: ["acrobacia", "adestrarAnimais", "atletismo", "historia", "intuicao", "intimidacao", "percepcao", "sobrevivencia"],
    idiomas: [],
    tracos: [
      {
        nome: "Retomar o Fôlego",
        descricao:
          "Como ação bônus, você recupera 1d10 + seu nível de guerreiro em PV. Só pode usar de novo após um descanso curto ou longo.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: true,
    subclasse: null,
  },
  {
    id: "monge",
    nome: "Monge",
    descricao: "Artista marcial que canaliza disciplina e energia interior em ataques rápidos.",
    dadoDeVida: 8,
    resistencias: ["for", "des"],
    armaduras: [],
    armas: ["Armas simples", "Espadas curtas"],
    ferramentas: ["Uma ferramenta de artesão ou um instrumento musical (à escolha)"],
    quantidadePericias: 2,
    opcoesPericias: ["acrobacia", "atletismo", "historia", "intuicao", "religiao", "furtividade"],
    idiomas: [],
    tracos: [
      {
        nome: "Defesa Sem Armadura",
        descricao: "Sem armadura e sem escudo, sua CA é 10 + modificador de Destreza + modificador de Sabedoria.",
      },
      {
        nome: "Artes Marciais",
        descricao:
          "Com ataques desarmados e armas de monge, você pode usar Destreza no lugar de Força e rolar 1d4 de dano no ataque desarmado. Se atacar assim, pode fazer um ataque desarmado como ação bônus.",
      },
    ],
    defesaSemArmadura: "monge",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: null,
  },
  {
    id: "paladino",
    nome: "Paladino",
    descricao: "Guerreiro sagrado que luta por um juramento, com cura e poder divino.",
    dadoDeVida: 10,
    resistencias: ["sab", "car"],
    armaduras: ["Armaduras leves", "Armaduras médias", "Armaduras pesadas", "Escudos"],
    armas: ["Armas simples", "Armas marciais"],
    ferramentas: [],
    quantidadePericias: 2,
    opcoesPericias: ["atletismo", "intuicao", "intimidacao", "medicina", "persuasao", "religiao"],
    idiomas: [],
    tracos: [
      {
        nome: "Sentido Divino",
        descricao:
          "Como ação, você detecta celestiais, ínferos e mortos-vivos a até 18 m que não estejam atrás de cobertura total. Usos: 1 + modificador de Carisma por descanso longo.",
      },
      {
        nome: "Mãos Consagradas",
        descricao: "Você tem uma reserva de cura igual a 5 × seu nível de paladino em PV, que pode gastar para curar com um toque.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: null,
  },
  {
    id: "patrulheiro",
    nome: "Patrulheiro",
    descricao: "Caçador e explorador, especialista em sobreviver e rastrear em terras selvagens.",
    dadoDeVida: 10,
    resistencias: ["for", "des"],
    armaduras: ["Armaduras leves", "Armaduras médias", "Escudos"],
    armas: ["Armas simples", "Armas marciais"],
    ferramentas: [],
    quantidadePericias: 3,
    opcoesPericias: ["adestrarAnimais", "atletismo", "intuicao", "investigacao", "natureza", "percepcao", "furtividade", "sobrevivencia"],
    idiomas: [],
    tracos: [
      {
        nome: "Inimigo Favorito",
        descricao:
          "Escolha um tipo de criatura (por exemplo, bestas ou mortos-vivos). Você tem vantagem em testes para rastreá-las e para lembrar informações sobre elas, e aprende um idioma delas.",
      },
      {
        nome: "Explorador Natural",
        descricao:
          "Escolha um tipo de terreno favorito. Nele, você ganha benefícios de viagem e de busca por alimento, e dobra a proficiência em certos testes.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: null,
  },
  {
    id: "ladino",
    nome: "Ladino",
    descricao: "Especialista em furtividade, perícias e golpes precisos nos pontos fracos do inimigo.",
    dadoDeVida: 8,
    resistencias: ["des", "int"],
    armaduras: ["Armaduras leves"],
    armas: ["Armas simples", "Bestas de mão", "Espadas longas", "Rapieiras", "Espadas curtas"],
    ferramentas: ["Ferramentas de ladrão"],
    quantidadePericias: 4,
    opcoesPericias: [
      "acrobacia",
      "atletismo",
      "enganacao",
      "intuicao",
      "intimidacao",
      "investigacao",
      "percepcao",
      "atuacao",
      "persuasao",
      "prestidigitacao",
      "furtividade",
    ],
    idiomas: ["Gíria de Ladrão"],
    tracos: [
      {
        nome: "Especialização",
        descricao: "Duas perícias em que você tem proficiência passam a somar o dobro do bônus de proficiência.",
      },
      {
        nome: "Ataque Furtivo",
        descricao:
          "Uma vez por turno, você causa 1d6 de dano extra em um ataque com arma de acuidade ou à distância se tiver vantagem no ataque, ou se um aliado estiver a até 1,5 m do alvo e você não tiver desvantagem.",
      },
      {
        nome: "Gíria de Ladrão",
        descricao: "Você conhece o idioma secreto dos ladrões, com sinais e códigos escondidos em conversas comuns.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 2,
    estilosDeLuta: false,
    subclasse: null,
  },
  {
    id: "feiticeiro",
    nome: "Feiticeiro",
    descricao: "Conjurador nato, cujo poder vem de uma linhagem ou de uma força mágica no sangue.",
    dadoDeVida: 6,
    resistencias: ["con", "car"],
    armaduras: [],
    armas: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
    ferramentas: [],
    quantidadePericias: 2,
    opcoesPericias: ["arcanismo", "enganacao", "intuicao", "intimidacao", "persuasao", "religiao"],
    idiomas: [],
    tracos: [
      {
        nome: "Conjuração",
        descricao:
          "Você conjura magias de feiticeiro usando Carisma. No 1º nível conhece 4 truques e 2 magias, e tem 2 espaços de magia de 1º nível. Seu foco é um foco arcano.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: {
      rotulo: "Origem de Feitiçaria",
      opcoes: [
        {
          id: "linhagemDraconica",
          nome: "Linhagem Dracônica",
          descricao: "Seu poder vem do sangue de um dragão antigo.",
          tracos: [
            {
              nome: "Ancestral Dragão",
              descricao:
                "Escolha um tipo de dragão. Você fala Dracônico e, ao interagir com dragões, soma o dobro do bônus de proficiência em testes de Carisma.",
            },
            {
              nome: "Resiliência Dracônica",
              descricao:
                "Seus PV máximos aumentam em 1 e aumentam em 1 a cada nível. Sem armadura, sua CA é 13 + modificador de Destreza.",
            },
          ],
          armaduras: [],
          idiomas: ["Dracônico"],
          vidaPorNivel: 1,
          defesaSemArmadura: "draconico",
        },
      ],
    },
  },
  {
    id: "bruxo",
    nome: "Bruxo",
    descricao: "Conjurador que firmou um pacto com uma entidade poderosa em troca de poder.",
    dadoDeVida: 8,
    resistencias: ["sab", "car"],
    armaduras: ["Armaduras leves"],
    armas: ["Armas simples"],
    ferramentas: [],
    quantidadePericias: 2,
    opcoesPericias: ["arcanismo", "enganacao", "historia", "intimidacao", "investigacao", "natureza", "religiao"],
    idiomas: [],
    tracos: [
      {
        nome: "Magia de Pacto",
        descricao:
          "Você conjura magias de bruxo usando Carisma. No 1º nível conhece 2 truques e 2 magias, e tem 1 espaço de magia, recuperado em descanso curto ou longo. Seu foco é um foco arcano.",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: {
      rotulo: "Patrono Transcendental",
      opcoes: [
        {
          id: "patronoCorruptor",
          nome: "O Corruptor",
          descricao: "Um pacto com um ser das profundezas infernais.",
          tracos: [
            {
              nome: "Magias de Patrono",
              descricao: "Mãos Flamejantes e Comando entram na sua lista de magias de bruxo.",
            },
            {
              nome: "Bênção do Obscuro",
              descricao:
                "Quando você reduz uma criatura hostil a 0 PV, ganha PV temporários iguais ao seu modificador de Carisma + seu nível de bruxo (mínimo 1).",
            },
          ],
          armaduras: [],
          idiomas: [],
          vidaPorNivel: 0,
          defesaSemArmadura: "",
        },
      ],
    },
  },
  {
    id: "mago",
    nome: "Mago",
    descricao: "Estudioso da magia arcana, que aprende feitiços em um grimório e domina o conhecimento.",
    dadoDeVida: 6,
    resistencias: ["int", "sab"],
    armaduras: [],
    armas: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
    ferramentas: [],
    quantidadePericias: 2,
    opcoesPericias: ["arcanismo", "historia", "intuicao", "investigacao", "medicina", "religiao"],
    idiomas: [],
    tracos: [
      {
        nome: "Conjuração",
        descricao:
          "Você conjura magias de mago usando Inteligência. No 1º nível conhece 3 truques, tem 6 magias no grimório e prepara magias a cada descanso longo. Seu foco é um foco arcano.",
      },
      {
        nome: "Recuperação Arcana",
        descricao:
          "Uma vez por dia, após um descanso curto, você recupera espaços de magia cujo nível combinado seja no máximo metade do seu nível de mago (arredondado para cima).",
      },
    ],
    defesaSemArmadura: "",
    especializacao: 0,
    estilosDeLuta: false,
    subclasse: null,
  },
];

export const STUDENT_NAME = "João Lucas Fabiano";

export const CONFIG = {
  studentAge: 9,
  grade: "4º ano EF",
  subject: "Geografia",
  examDate: "2026-06-15",
  questionsPerRound: 8,
  vfPerRound: 2,
  passScore: 7,
  streakRequired: 3,
  maxHearts: 3,
};

export const BASE_QUESTIONS = [
  // —— Modelo 1 (questões 1–8) ——
  {
    id: "m1-q1",
    tema: "Distritos",
    questionText: "Os distritos são:",
    options: [
      "Países que fazem parte do Brasil.",
      "Estados menores.",
      "Divisões administrativas dos municípios.",
      "Regiões que pertencem apenas às capitais.",
    ],
    correctOptionIndex: 2,
    explicacao:
      "Distritos são partes do município usadas para organizar a administração local.",
  },
  {
    id: "m1-q2",
    tema: "Pelotas (RS)",
    questionText: "De acordo com o mapa de Pelotas (RS), o município é dividido em:",
    options: ["7 distritos.", "8 distritos.", "9 distritos.", "10 distritos."],
    correctOptionIndex: 2,
    explicacao: "Pelotas tem 9 distritos, incluindo a Sede e áreas rurais.",
  },
  {
    id: "m1-q3",
    tema: "Pelotas (RS)",
    questionText: "O distrito Sede de Pelotas é caracterizado principalmente por apresentar:",
    options: [
      "Apenas áreas rurais.",
      "Áreas urbanas mais desenvolvidas.",
      "Somente plantações.",
      "Apenas áreas de mata.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "A Sede concentra comércio, serviços e maior parte da população urbana.",
  },
  {
    id: "m1-q4",
    tema: "Elementos naturais",
    questionText: "Qual elemento natural foi identificado na imagem do distrito Rincão da Cruz?",
    options: ["Teatro.", "Museu.", "Mata.", "Hospital."],
    correctOptionIndex: 2,
    explicacao: "Mata é um elemento natural; teatro, museu e hospital são construções.",
  },
  {
    id: "m1-q5",
    tema: "Organograma",
    questionText: "O organograma é uma representação que mostra:",
    options: [
      "A vegetação de um município.",
      "A organização e a hierarquia de cargos.",
      "A localização dos rios.",
      "O clima de uma região.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "Organograma é um desenho que mostra quem ocupa cada cargo e como eles se relacionam.",
  },
  {
    id: "m1-q6",
    tema: "Poder Executivo",
    questionText: "Qual dos cargos abaixo pertence ao Poder Executivo municipal?",
    options: ["Vereador.", "Juiz.", "Prefeito.", "Deputado estadual."],
    correctOptionIndex: 2,
    explicacao: "O prefeito governa o município e faz parte do Poder Executivo.",
  },
  {
    id: "m1-q7",
    tema: "Poder Legislativo",
    questionText: "Os vereadores têm como principal função:",
    options: [
      "Julgar processos.",
      "Criar, modificar e fiscalizar leis municipais.",
      "Governar o estado.",
      "Representar o presidente.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "Vereadores fazem leis na Câmara Municipal e fiscalizam o prefeito.",
  },
  {
    id: "m1-q8",
    tema: "Impostos",
    questionText: "Os impostos arrecadados pelos governos ajudam a financiar:",
    options: [
      "Apenas festas populares.",
      "Apenas salários dos governantes.",
      "Serviços públicos como saúde e educação.",
      "Somente obras particulares.",
    ],
    correctOptionIndex: 2,
    explicacao:
      "Impostos pagam escolas, hospitais, ruas e outros serviços para toda a população.",
  },

  // —— Modelo 2 (questões 9–16) ——
  {
    id: "m2-q1",
    tema: "Merenda escolar",
    questionText:
      "A Lei de Alimentação Escolar determina que parte dos alimentos da merenda escolar seja comprada de:",
    options: [
      "Outros países.",
      "Grandes indústrias estrangeiras.",
      "Pequenos produtores agrícolas.",
      "Empresas privadas internacionais.",
    ],
    correctOptionIndex: 2,
    explicacao:
      "A lei ajuda agricultores da região e garante comida fresca na escola.",
  },
  {
    id: "m2-q2",
    tema: "ODS",
    questionText: "Os Objetivos de Desenvolvimento Sustentável (ODS) foram criados para serem alcançados até:",
    options: ["2025.", "2030.", "2040.", "2050."],
    correctOptionIndex: 1,
    explicacao: "Os ODS da ONU têm meta para o ano de 2030.",
  },
  {
    id: "m2-q3",
    tema: "Urbanização",
    questionText: "O crescimento do espaço urbano pode provocar:",
    options: [
      "Diminuição da população.",
      "Expansão das cidades.",
      "Redução das construções.",
      "Desaparecimento dos bairros.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "Quando a cidade cresce, novos bairros e prédios ocupam mais espaço.",
  },
  {
    id: "m2-q4",
    tema: "Problemas urbanos",
    questionText: "Uma reclamação apresentada pelos moradores do bairro estudado foi:",
    options: [
      "Falta de escolas.",
      "Ausência de hospitais.",
      "Barulho causado pelos bares durante a madrugada.",
      "Excesso de áreas verdes.",
    ],
    correctOptionIndex: 2,
    explicacao: "Barulho à noite atrapalha o descanso e a qualidade de vida.",
  },
  {
    id: "m2-q5",
    tema: "Projeto social",
    questionText: "O projeto Baixo Bahia Futebol Social utiliza o esporte para:",
    options: [
      "Formar atletas profissionais apenas.",
      "Incentivar a convivência e a participação social.",
      "Gerar lucro aos patrocinadores.",
      "Impedir o uso dos espaços públicos.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "O esporte reúne pessoas e fortalece a comunidade, não só busca campeões.",
  },
  {
    id: "m2-q6",
    tema: "Grêmio estudantil",
    questionText: "O grêmio estudantil é importante porque:",
    options: [
      "Escolhe os professores.",
      "Representa os interesses dos estudantes.",
      "Decide as notas dos alunos.",
      "Administra a escola.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "O grêmio leva as ideias dos alunos para a direção e melhora a escola.",
  },
  {
    id: "m2-q7",
    tema: "Cidadania",
    questionText: "Exercitar a cidadania significa:",
    options: [
      "Conhecer direitos e cumprir deveres.",
      "Fazer apenas o que se deseja.",
      "Ignorar regras.",
      "Participar somente das eleições.",
    ],
    correctOptionIndex: 0,
    explicacao:
      "Cidadão responsável conhece seus direitos e cumpre deveres no dia a dia.",
  },
  {
    id: "m2-q8",
    tema: "Espaços públicos",
    questionText: "Os espaços públicos são:",
    options: [
      "Locais privados das famílias.",
      "Áreas de uso coletivo da população.",
      "Espaços exclusivos dos turistas.",
      "Lugares administrados por empresas.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "Praças, ruas e parques são para todos usarem com respeito.",
  },

  // —— Banco extra (17–20 + expansão por tema) ——
  {
    id: "ext-q17",
    tema: "Direito à cidade",
    questionText: 'O termo "Lugar de criança" indica que:',
    options: [
      "Crianças não podem frequentar espaços públicos.",
      "Crianças têm direito à cidade e à participação.",
      "Crianças devem permanecer apenas em casa.",
      "Crianças não precisam cumprir deveres.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "Crianças também pertencem à cidade e podem participar da vida comunitária.",
  },
  {
    id: "ext-q18",
    tema: "Participação política",
    questionText: "Uma forma de participação política apresentada no livro é:",
    options: [
      "Comprar produtos importados.",
      "Participar de conselhos e acompanhar ações do governo.",
      "Viajar para outros municípios.",
      "Frequentar apenas eventos esportivos.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "Conselhos e reuniões públicas permitem opinar sobre o que o governo faz.",
  },
  {
    id: "ext-q19",
    tema: "Lei de Acesso à Informação",
    questionText: "A Lei de Acesso à Informação garante ao cidadão o direito de:",
    options: [
      "Solicitar informações aos órgãos públicos.",
      "Criar leis federais.",
      "Julgar processos.",
      "Cobrar impostos.",
    ],
    correctOptionIndex: 0,
    explicacao:
      "Você pode pedir dados ao governo para saber como o dinheiro público é usado.",
  },
  {
    id: "ext-q20",
    tema: "Administração municipal",
    questionText: "O responsável pela administração do município é o(a):",
    options: ["Governador.", "Presidente.", "Prefeito(a).", "Deputado federal."],
    correctOptionIndex: 2,
    explicacao: "O prefeito ou a prefeita administra a cidade no dia a dia.",
  },
  {
    id: "ext-dist-1",
    tema: "Distritos",
    questionText: "Complete: Os distritos ajudam a organizar o município em áreas menores para facilitar a __________.",
    options: ["administração.", "exportação.", "mineração.", "navegação."],
    correctOptionIndex: 0,
    explicacao: "Dividir em distritos facilita cuidar de cada região do município.",
  },
  {
    id: "ext-dist-2",
    tema: "Pelotas (RS)",
    questionText: "Distritos rurais de Pelotas costumam ter mais:",
    options: [
      "arranha-céus e shoppings.",
      "plantações, criação de animais e áreas abertas.",
      "aeroportos internacionais.",
      "portos de grande porte.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "Áreas rurais têm atividades do campo; a Sede concentra o urbano.",
  },
  {
    id: "ext-poder-1",
    tema: "Poderes municipais",
    questionText: "O Poder Judiciário municipal é representado principalmente por:",
    options: ["vereadores.", "juízes e tribunais.", "prefeitos.", "secretários."],
    correctOptionIndex: 1,
    explicacao: "Juízes julgam conflitos; vereadores e prefeito são outros poderes.",
  },
  {
    id: "ext-poder-2",
    tema: "Organograma",
    questionText: "No organograma da prefeitura, os secretários ficam geralmente:",
    options: [
      "abaixo do prefeito, cuidando de áreas como saúde e educação.",
      "acima do prefeito.",
      "fora de qualquer hierarquia.",
      "apenas na Câmara de Vereadores.",
    ],
    correctOptionIndex: 0,
    explicacao:
      "Secretários respondem ao prefeito e coordenam cada área do governo.",
  },
  {
    id: "ext-imp-1",
    tema: "Impostos",
    questionText: "Pagar impostos é um dever do cidadão porque:",
    options: [
      "substitui a necessidade de leis.",
      "ajuda a manter escolas, hospitais e outras políticas públicas.",
      "elimina a participação política.",
      "serve só para punir as pessoas.",
    ],
    correctOptionIndex: 1,
    explicacao: "Sem arrecadação, o governo não consegue oferecer serviços à população.",
  },
  {
    id: "ext-ods-1",
    tema: "ODS",
    questionText: "Os ODS buscam melhorar:",
    options: [
      "apenas a economia dos países ricos.",
      "a qualidade de vida das pessoas e a preservação do planeta.",
      "somente o trânsito das grandes cidades.",
      "exclusivamente a indústria de celulares.",
    ],
    correctOptionIndex: 1,
    explicacao:
      "São 17 objetivos para acabar com a pobreza, proteger a natureza e promover paz.",
  },
  {
    id: "ext-ods-2",
    tema: "Urbanização",
    questionText: "Quando a cidade cresce muito sem planejamento, pode aumentar:",
    options: [
      "a área de mata nativa no centro.",
      "problemas como trânsito, poluição e falta de espaço.",
      "a quantidade de fazendas no centro urbano.",
      "o silêncio nas ruas centrais.",
    ],
    correctOptionIndex: 1,
    explicacao: "Crescimento desordenado traz desafios para morar bem na cidade.",
  },
  {
    id: "ext-cid-1",
    tema: "Cidadania",
    questionText: "Separar o lixo reciclável é um exemplo de:",
    options: [
      "cidadania ambiental.",
      "desrespeito às leis.",
      "participação apenas dos adultos.",
      "ignorar a comunidade.",
    ],
    correctOptionIndex: 0,
    explicacao: "Reciclar cuida do meio ambiente e ajuda toda a comunidade.",
  },
  {
    id: "ext-cid-2",
    tema: "Espaços públicos",
    questionText: "Cuidar de praças e parques é importante porque:",
    options: [
      "eles pertencem só a quem mora ao lado.",
      "são lugares de convivência e lazer para todos.",
      "devem ser fechados para sempre.",
      "não influenciam a qualidade de vida.",
    ],
    correctOptionIndex: 1,
    explicacao: "Espaços públicos limpos e seguros beneficiam toda a população.",
  },
  {
    id: "ext-cid-3",
    tema: "Grêmio estudantil",
    questionText: "Participar do grêmio estudantil é uma forma de:",
    options: [
      "exercer cidadania dentro da escola.",
      "evitar todas as regras.",
      "substituir os professores.",
      "não opinar sobre nada.",
    ],
    correctOptionIndex: 0,
    explicacao: "O grêmio é um espaço para propor melhorias e dialogar com a escola.",
  },
  {
    id: "ext-lei-1",
    tema: "Lei de Acesso à Informação",
    questionText: "Graças à Lei de Acesso à Informação, os cidadãos podem:",
    options: [
      "acompanhar melhor as ações do poder público.",
      "deixar de pagar impostos.",
      "escolher juízes municipais.",
      "fechar a Câmara de Vereadores.",
    ],
    correctOptionIndex: 0,
    explicacao: "Transparência permite fiscalizar se o governo cumpre suas promessas.",
  },

  // —— Modelo 3 – Parte 2: Verdadeiro ou Falso (questões 21–28) ——
  {
    id: "m3-q1",
    tipo: "vf",
    examNumber: 21,
    tema: "Distritos",
    questionText: "Os distritos são divisões administrativas dos municípios.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 0,
    explicacao: "Verdadeiro — distritos dividem o município em partes menores.",
  },
  {
    id: "m3-q2",
    tipo: "vf",
    examNumber: 22,
    tema: "Poderes municipais",
    questionText: "Os vereadores pertencem ao Poder Judiciário.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 1,
    explicacao: "Falso — vereadores fazem parte do Poder Legislativo municipal.",
  },
  {
    id: "m3-q3",
    tipo: "vf",
    examNumber: 23,
    tema: "Impostos",
    questionText: "Os impostos ajudam a manter serviços públicos.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 0,
    explicacao: "Verdadeiro — saúde, educação e transporte dependem dessa arrecadação.",
  },
  {
    id: "m3-q4",
    tipo: "vf",
    examNumber: 24,
    tema: "ODS",
    questionText:
      "Os ODS têm como objetivo melhorar a qualidade de vida das pessoas e do planeta.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 0,
    explicacao: "Verdadeiro — os 17 objetivos tratam de pessoas, sociedade e natureza.",
  },
  {
    id: "m3-q5",
    tipo: "vf",
    examNumber: 25,
    tema: "Espaços públicos",
    questionText: "Os espaços públicos devem ser utilizados apenas pelos adultos.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 1,
    explicacao: "Falso — crianças também têm direito de usar praças, ruas e parques.",
  },
  {
    id: "m3-q6",
    tipo: "vf",
    examNumber: 26,
    tema: "Grêmio estudantil",
    questionText:
      "O grêmio estudantil incentiva a participação dos estudantes na vida escolar.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 0,
    explicacao: "Verdadeiro — o grêmio representa os alunos e propõe melhorias.",
  },
  {
    id: "m3-q7",
    tipo: "vf",
    examNumber: 27,
    tema: "Cidadania",
    questionText:
      "Crianças podem exercer a cidadania por meio de atitudes responsáveis no dia a dia.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 0,
    explicacao:
      "Verdadeiro — respeitar regras, reciclar e colaborar já são atos de cidadania.",
  },
  {
    id: "m3-q8",
    tipo: "vf",
    examNumber: 28,
    tema: "Lei de Acesso à Informação",
    questionText:
      "A Lei de Acesso à Informação permite que os cidadãos acompanhem ações do poder público.",
    options: ["Verdadeiro", "Falso"],
    correctOptionIndex: 0,
    explicacao: "Verdadeiro — a lei garante pedidos de informação aos órgãos públicos.",
  },
];

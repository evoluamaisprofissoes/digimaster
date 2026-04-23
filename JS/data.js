// =========================================
// DigiMaster — Banco de Textos e Dados
// =========================================

const TEXTS = {

  basico: [
    "aaa bbb ccc ddd eee fff ggg hhh iii jjj kkk lll mmm nnn ooo ppp qqq rrr sss ttt uuu vvv www xxx yyy zzz",
    "a e i o u aa ee ii oo uu ba be bi bo bu ca ce ci co cu da de di do du fa fe fi fo fu",
    "sol lua mar rio pé mão dia luz sol mar lua rio dia nuvem vento fogo água terra verde azul",
    "gato rato pato bola sala mala faca casa cama fada vale base leal real mala pela rela tela",
    "bola pula fala sala fada cama bode code roda modo lodo dedo medo sedo medo pelo pelo melo",
    "asa asa usa ana ana ola ola ela ela ale ale ali ali ala ala ame ame ama ame ame ali ali",
    "porta cama mesa vela sala cola bola mala capa faca roda moda coda soda toda boda poda roda",
  ],

  intermediario: [
    "A informática está presente em todos os aspectos da vida moderna. Computadores, celulares e tablets fazem parte do cotidiano de bilhões de pessoas ao redor do mundo.",
    "O teclado QWERTY foi inventado no século dezenove para máquinas de escrever. Hoje é o padrão mundial para digitação em computadores e dispositivos móveis.",
    "Aprender a digitar corretamente aumenta a produtividade em até cinquenta por cento. A prática diária de quinze minutos pode transformar sua habilidade em poucas semanas.",
    "A internet revolucionou a comunicação humana. Em segundos, é possível enviar mensagens, arquivos e vídeos para qualquer lugar do planeta, conectando pessoas de culturas diferentes.",
    "Os processadores modernos executam bilhões de operações por segundo. Essa velocidade extraordinária permite rodar programas complexos, jogos e inteligência artificial em tempo real.",
    "O Brasil é um dos países com maior número de usuários de redes sociais no mundo. Plataformas como Instagram, Facebook e TikTok fazem parte da rotina de milhões de brasileiros.",
    "Segurança digital é um tema cada vez mais importante. Senhas fortes, autenticação em dois fatores e backups regulares são práticas essenciais para proteger seus dados pessoais.",
    "O mercado de tecnologia cresce a cada ano no Brasil. Programadores, analistas de dados e especialistas em segurança digital estão entre os profissionais mais requisitados atualmente.",
    "Linguagens de programação como Python, JavaScript e Java são fundamentais para o desenvolvimento de sistemas, aplicativos e soluções digitais para empresas de todos os setores.",
    "A computação em nuvem permite armazenar e acessar dados de qualquer lugar com internet. Empresas de todos os tamanhos utilizam serviços como Google Drive, OneDrive e Amazon Web Services.",
  ],

  avancado: [
    "A inteligência artificial está transformando profundamente o mercado de trabalho global. Algoritmos de aprendizado de máquina já superam humanos em tarefas específicas como diagnóstico médico por imagem, análise financeira e tradução de idiomas. No entanto, especialistas concordam que a criatividade, empatia e pensamento crítico continuam sendo diferenciais humanos insubstituíveis.",
    "O conceito de Internet das Coisas, ou IoT, refere-se à conexão de objetos do cotidiano à internet. Geladeiras que fazem pedidos automaticamente, carros que se comunicam com semáforos e casas inteligentes que ajustam temperatura e iluminação sozinhas são exemplos dessa revolução tecnológica que já transforma cidades e residências ao redor do mundo.",
    "A computação quântica promete resolver problemas que os computadores convencionais levariam milhares de anos para processar. Utilizando princípios da física quântica como superposição e entrelaçamento, os qubits podem representar múltiplos estados simultaneamente, abrindo possibilidades revolucionárias para criptografia, medicina e logística.",
    "O agronegócio brasileiro está cada vez mais tecnológico. Drones que monitoram plantações, sensores de solo que analisam nutrientes em tempo real, algoritmos que preveem colheitas e sistemas de irrigação automatizados estão transformando o campo. O Brasil é referência mundial em tecnologia agrícola de precisão.",
    "Cibersegurança é uma das áreas que mais cresce no mercado de tecnologia. Com o aumento dos ataques de ransomware e phishing, empresas investem bilhões em proteção digital. Profissionais de segurança da informação são altamente valorizados e podem trabalhar remotamente para organizações em qualquer parte do mundo.",
    "O desenvolvimento de aplicativos móveis transformou hábitos de consumo, comunicação e trabalho. Hoje existem mais de três milhões de aplicativos disponíveis nas lojas digitais, cobrindo desde finanças pessoais até controle de saúde, educação à distância e plataformas de delivery que revolucionaram o setor de alimentação.",
    "Blockchain é uma tecnologia de registro distribuído que garante transparência e segurança em transações digitais. Além das criptomoedas, a tecnologia tem aplicações em contratos inteligentes, rastreamento de cadeias de suprimentos, votação eletrônica segura e autenticação de documentos, prometendo revolutionar setores como bancos, saúde e logística.",
    "A realidade aumentada e a realidade virtual estão criando novas formas de interação digital. No setor educacional, alunos podem realizar experimentos científicos virtuais, visitar monumentos históricos ou explorar o corpo humano em três dimensões. No varejo, clientes experimentam virtualmente roupas, móveis e óculos antes de comprar.",
    "O 5G representa um salto qualitativo nas comunicações sem fio. Com velocidades até cem vezes superiores ao 4G e latência mínima, essa tecnologia viabiliza carros autônomos, cirurgias robóticas remotas, fábricas totalmente automatizadas e cidades inteligentes integradas. O Brasil está em processo de expansão gradual da rede 5G em todo território nacional.",
    "Programação funcional é um paradigma que trata o desenvolvimento de software como a avaliação de funções matemáticas. Linguagens como Haskell, Erlang e Clojure, assim como funcionalidades funcionais em Python e JavaScript, permitem escrever código mais previsível, testável e paralelizável, tornando sistemas complexos mais confiáveis.",
  ],

  numeros: [
    "1 2 3 4 5 6 7 8 9 0 11 22 33 44 55 66 77 88 99 00 111 222 333 444 555",
    "100 200 300 400 500 600 700 800 900 1000 2000 3000 4000 5000 10000",
    "3.14 2.71 1.41 1.73 0.99 3.99 99.90 100.00 250.75 1234.56 9999.99",
    "Tel: (65) 3322-1100 CEP: 78305-000 CNPJ: 12.345.678/0001-99 CPF: 123.456.789-00",
    "2024 + 1 = 2025 | 100 x 5 = 500 | 1000 / 4 = 250 | 999 - 888 = 111",
    "IP: 192.168.1.1 Porta: 8080 RAM: 16GB ROM: 512GB CPU: 3.6GHz GPU: 8GB",
    "a1b2c3d4e5 f6g7h8i9j0 k1l2m3n4o5 p6q7r8s9t0 u1v2w3x4y5z6",
  ]
};

const TIPS = [
  {
    tag: "Curiosidade",
    title: "A origem do mouse de computador",
    text: "O mouse foi inventado por Douglas Engelbart em 1964. O primeiro protótipo era de madeira e tinha apenas um botão. Só ficou popular nos anos 1980 com o Macintosh da Apple."
  },
  {
    tag: "Tech News",
    title: "Python é a linguagem mais popular",
    text: "Segundo o índice TIOBE, Python ultrapassou Java e C para se tornar a linguagem de programação mais popular do mundo, impulsionada pelo boom em inteligência artificial e ciência de dados."
  },
  {
    tag: "Dica de Produtividade",
    title: "Atalhos de teclado economizam tempo",
    text: "Usuários que dominam atalhos de teclado como Ctrl+C, Ctrl+V, Alt+Tab e Win+D podem ganhar até 30 minutos de produtividade por dia em comparação com quem usa apenas o mouse."
  },
  {
    tag: "Curiosidade",
    title: "O primeiro e-mail foi enviado em 1971",
    text: "Ray Tomlinson enviou o primeiro e-mail da história em 1971. Ele também foi responsável por popularizar o uso do símbolo @ para separar o nome do usuário do servidor."
  },
  {
    tag: "Tech News",
    title: "Inteligência Artificial no agronegócio",
    text: "O Brasil está na vanguarda do uso de IA no campo. Startups brasileiras desenvolvem soluções de visão computacional para detectar pragas, doenças em plantações e otimizar irrigação."
  },
  {
    tag: "Curiosidade",
    title: "O nome 'bug' vem de um inseto real",
    text: "Em 1947, Grace Hopper encontrou uma mariposa real presa em um relé do computador Harvard Mark II causando uma falha. O inseto foi colado no diário de operações com a nota 'primeiro bug real encontrado'."
  },
  {
    tag: "Dica",
    title: "Posição correta ao digitar",
    text: "Mantenha os pulsos retos e os cotovelos em ângulo de 90 graus. A posição correta previne lesões como LER (Lesão por Esforço Repetitivo) e tendinite, comuns em trabalhadores de escritório."
  },
  {
    tag: "Tech News",
    title: "Crescimento do mercado de TI no Brasil",
    text: "O setor de tecnologia da informação cresceu mais de 12% no Brasil em 2023, gerando centenas de milhares de novos empregos. A demanda por profissionais de TI supera a oferta em todas as regiões."
  },
  {
    tag: "Curiosidade",
    title: "O QWERTY foi feito para ser lento?",
    text: "Um mito popular diz que o layout QWERTY foi projetado para lentidão. Na verdade, foi desenvolvido para separar letras frequentemente usadas juntas e reduzir travamentos mecânicos das máquinas de escrever dos anos 1870."
  },
  {
    tag: "Tech",
    title: "Memória RAM vs SSD: qual é mais rápido?",
    text: "A RAM é muito mais rápida que o SSD, operando em nanossegundos contra microssegundos. Porém, a RAM perde dados ao desligar o computador. Ter os dois em quantidade adequada é essencial para bom desempenho."
  },
  {
    tag: "Dica",
    title: "Salve seu trabalho sempre!",
    text: "O atalho Ctrl+S é um dos mais importantes. Profissionais experientes desenvolvem o hábito de salvar documentos a cada 5 minutos. A regra 3-2-1 de backup recomenda 3 cópias, em 2 mídias diferentes, 1 fora do local."
  },
  {
    tag: "Curiosidade",
    title: "Quantos bytes tem uma foto?",
    text: "Uma foto de smartphone moderno ocupa cerca de 3 a 5 megabytes. Um terabyte armazena aproximadamente 200.000 fotos. Os servidores do Google e Facebook armazenam quintilhões de bytes de dados."
  }
];

const FEEDBACK_MESSAGES = {
  excellent: [
    "🏆 Incrível! Você está no nível de um digitador profissional!",
    "🔥 Excepcional! Sua velocidade e precisão são impressionantes!",
    "⭐ Fantástico! Continue assim e você estará entre os melhores!"
  ],
  great: [
    "👏 Muito bem! Você tem uma ótima habilidade de digitação!",
    "💪 Excelente resultado! Sua prática está claramente valendo a pena!",
    "✨ Ótimo trabalho! Você está melhorando muito rapidamente!"
  ],
  good: [
    "👍 Bom trabalho! Você está no caminho certo!",
    "📈 Resultado positivo! Continue praticando para melhorar ainda mais!",
    "🎯 Bom desempenho! Foque em reduzir os erros para ganhar mais velocidade."
  ],
  keep_going: [
    "🌱 Continue praticando! Com dedicação você vai melhorar muito!",
    "💡 Não desanime! Todo especialista já foi um iniciante. Pratique diariamente!",
    "🔑 A consistência é a chave! 15 minutos de prática por dia fazem a diferença."
  ]
};

function getFeedback(wpm, accuracy) {
  if (wpm >= 60 && accuracy >= 95) return randomItem(FEEDBACK_MESSAGES.excellent);
  if (wpm >= 40 && accuracy >= 90) return randomItem(FEEDBACK_MESSAGES.great);
  if (wpm >= 25 && accuracy >= 85) return randomItem(FEEDBACK_MESSAGES.good);
  return randomItem(FEEDBACK_MESSAGES.keep_going);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomText(level) {
  const pool = TEXTS[level] || TEXTS.intermediario;
  return randomItem(pool);
}

const LEVEL_GOALS = {
  basico: { wpm: 20, accuracy: 85, duration: 60, label: '20 WPM • 85%' },
  intermediario: { wpm: 35, accuracy: 90, duration: 75, label: '35 WPM • 90%' },
  avancado: { wpm: 55, accuracy: 95, duration: 90, label: '55 WPM • 95%' },
  numeros: { wpm: 30, accuracy: 90, duration: 75, label: '30 WPM • 90%' }
};

// =========================================
// DigiMaster — Sistema de Lições
// =========================================

const LESSONS = {
  basico: {
    title: '🌱 Nível Básico',
    desc: 'Aprenda a posicionar os dedos e comece com as teclas fundamentais. Cada lição foca em grupos específicos de teclas.',
    color: 'var(--rgb-4)',
    lessons: [
      {
        id: 'b1',
        num: 1,
        icon: '🏠',
        title: 'Posição Home — ASDF',
        desc: 'As teclas âncora da mão esquerda. Dedinho em A, anelar em S, médio em D, indicador em F.',
        keys: ['a','s','d','f'],
        homeKeys: ['a','s','d','f'],
        text: 'aaa sss ddd fff asd fds sad fas daf sdf fda asd sfa daf fas sdf aaa fff ddd sss asdf fdsa',
        xp: 50,
        tip: 'Mantenha os dedos relaxados sobre as teclas. O polegar fica sobre a barra de espaço.'
      },
      {
        id: 'b2',
        num: 2,
        icon: '🏠',
        title: 'Posição Home — JKL;',
        desc: 'As teclas âncora da mão direita. Indicador em J, médio em K, anelar em L, dedinho em Ç.',
        keys: ['j','k','l',';'],
        homeKeys: ['j','k','l'],
        text: 'jjj kkk lll jkl lkj kjl jlk lkj kjl jjj lll kkk jkl lkj jlk kjl jkl lkj kjl jkl lkj',
        xp: 50,
        tip: 'Sinta as marcas em F e J — elas indicam a posição home sem precisar olhar.'
      },
      {
        id: 'b3',
        num: 3,
        icon: '✌️',
        title: 'Mãos Juntas — ASDF + JKL',
        desc: 'Combine as duas mãos na posição home. Pratique alternando entre elas.',
        keys: ['a','s','d','f','j','k','l'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'asdf jkl fads lkj sdf jkl adf jlk dsa klj fja skd lad fkj sdf jkl asdf jkl fdsa lkj',
        xp: 75,
        tip: 'Alterne as mãos de forma rítmica. Isso é a base de uma boa digitação.'
      },
      {
        id: 'b4',
        num: 4,
        icon: '⬆️',
        title: 'Fila do Meio — GH',
        desc: 'As teclas G e H ficam no centro e são alcançadas pelos indicadores ao se mover para o centro.',
        keys: ['g','h'],
        homeKeys: ['f','j'],
        text: 'ggg hhh ghg hgh ggh hhg ghh ggh fgh jhk gah hag gfh jhk ghj hgf asg jhk dfg lkh',
        xp: 60,
        tip: 'G é alcançado pelo indicador esquerdo saindo de F. H é alcançado pelo indicador direito saindo de J.'
      },
      {
        id: 'b5',
        num: 5,
        icon: '🔤',
        title: 'Fila Superior — QWE / UIO',
        desc: 'As teclas da fileira superior mais usadas. Mova os dedos para cima a partir da posição home.',
        keys: ['q','w','e','u','i','o'],
        homeKeys: ['a','s','d','j','k','l'],
        text: 'que owi woe ieu qui oew uio qwe owe uiq oiq eqo iuw qoi euw oiw eqw iou wue qio',
        xp: 80,
        tip: 'Após pressionar uma tecla superior, retorne imediatamente à posição home.'
      },
      {
        id: 'b6',
        num: 6,
        icon: '🔡',
        title: 'Fila Superior — RT / YU',
        desc: 'As teclas R, T (indicador esquerdo) e Y, U (indicador direito) requerem extensão dos indicadores.',
        keys: ['r','t','y','u'],
        homeKeys: ['f','j'],
        text: 'rrt tty yyu urt try yur rty uyt ryu tyr yut rtu ytr uyr tyr ryu tuy ryt yur tru',
        xp: 80,
        tip: 'R e T são pressionados pelo indicador esquerdo. Y e U pelo indicador direito.'
      },
      {
        id: 'b7',
        num: 7,
        icon: '⬇️',
        title: 'Fila Inferior — ZXCV / NM',
        desc: 'As teclas da fileira inferior. Flexione os dedos para baixo a partir da posição home.',
        keys: ['z','x','c','v','n','m'],
        homeKeys: ['a','s','d','f','j','k'],
        text: 'zzz xxx ccc vvv nnn mmm znm vxc cxz nmv vcx mnz xzc vnm cxz vmn zxc nmv cxz mnv',
        xp: 80,
        tip: 'Z usa o dedinho esquerdo. M usa o dedo médio direito. Não levante os pulsos.'
      },
      {
        id: 'b8',
        num: 8,
        icon: '📝',
        title: 'Palavras Básicas I',
        desc: 'Pratique as primeiras palavras reais usando todas as letras aprendidas até agora.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'sol lua mar rio voz mão dia cor luz noz asa mel fel cal mal mal sal cal ral tal wal',
        xp: 100,
        tip: 'Foque em precisão, não em velocidade. A velocidade vem naturalmente com a prática.'
      },
      {
        id: 'b9',
        num: 9,
        icon: '📝',
        title: 'Palavras Básicas II',
        desc: 'Mais palavras comuns para consolidar o aprendizado das teclas básicas.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'casa sala mesa vela faca cola mala bola cama roda moda soda toda boca loca foca roca',
        xp: 100,
        tip: 'Tente manter um ritmo constante. Pausas longas entre teclas atrapalham a fluência.'
      },
      {
        id: 'b10',
        num: 10,
        icon: '🏆',
        title: 'Desafio Básico',
        desc: 'Teste final do nível básico. Combine tudo que aprendeu em um exercício completo.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'asdf jkl ghi mno pqr stu vwx yz casa sala mesa faca bola vela mala roda soda cola moda',
        xp: 150,
        tip: 'Você chegou ao desafio básico! Mantenha os dedos na posição home e respire fundo.',
        isChallenge: true
      }
    ]
  },

  intermediario: {
    title: '⚡ Nível Intermediário',
    desc: 'Desenvolva velocidade e ritmo com palavras e frases completas. Foco em textos naturais.',
    color: 'var(--rgb-5)',
    lessons: [
      {
        id: 'i1',
        num: 1,
        icon: '⌨️',
        title: 'Uso do Shift — Maiúsculas',
        desc: 'Use o Shift com a mão oposta. Para letras da mão direita, use Shift esquerdo e vice-versa.',
        keys: ['A','S','D','F','J','K','L'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'Ana Sol Lua Mar Rio Dia Cor Luz Asa Mel Fel Cal Mal Sal Ala Ela Ola Ali Ame Ame',
        xp: 80,
        tip: 'Mantenha o Shift pressionado enquanto digita a letra maiúscula, depois solte ambas.'
      },
      {
        id: 'i2',
        num: 2,
        icon: '🔤',
        title: 'Letras com Acento — Vogais',
        desc: 'Pratique as vogais acentuadas comuns no português: á, é, í, ó, ú, ã, õ.',
        keys: ['á','é','í','ó','ú','ã','õ'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'árvore étnico íntimo ótimo único irmão botões ação nação função atenção condição missão',
        xp: 90,
        tip: 'No teclado ABNT, os acentos ficam próximos às teclas da mão direita. Memorize a posição.'
      },
      {
        id: 'i3',
        num: 3,
        icon: '📱',
        title: 'Palavras de Tecnologia',
        desc: 'Termos técnicos de informática que você usará no dia a dia profissional.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'mouse teclado monitor arquivo pasta login senha email backup sistema disco rede dados nuvem',
        xp: 100,
        tip: 'Palavras técnicas em inglês são muito usadas em TI. Fique confortável com elas.'
      },
      {
        id: 'i4',
        num: 4,
        icon: '🔢',
        title: 'Pontuação Básica',
        desc: 'Ponto, vírgula, dois-pontos e ponto-e-vírgula são essenciais em qualquer texto.',
        keys: ['.', ',', ':', ';'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'Olá, mundo. Como vai? Tudo bem; espero que sim. Nome: Maria. Data: hoje. Lista: um, dois, três.',
        xp: 90,
        tip: 'Vírgula e ponto ficam na mão direita. Não mude a posição da mão ao acessá-los.'
      },
      {
        id: 'i5',
        num: 5,
        icon: '📝',
        title: 'Frases Completas I',
        desc: 'Pratique com frases reais do cotidiano profissional.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'O computador é uma ferramenta essencial no trabalho moderno. Salve seus arquivos regularmente.',
        xp: 110,
        tip: 'Leia a próxima palavra antes de terminar a atual. Isso ajuda a manter o ritmo.'
      },
      {
        id: 'i6',
        num: 6,
        icon: '📝',
        title: 'Frases Completas II',
        desc: 'Continue praticando com frases mais longas e complexas.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'A internet conecta pessoas de todo o mundo. Aprenda a digitar bem para ser mais produtivo.',
        xp: 110,
        tip: 'Se errar, continue digitando. Não se preocupe com erros isolados no início.'
      },
      {
        id: 'i7',
        num: 7,
        icon: '💼',
        title: 'Vocabulário Profissional',
        desc: 'Palavras e expressões usadas no ambiente de trabalho e em documentos.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'relatório reunião proposta cliente contrato prazo orçamento projeto equipe resultado análise',
        xp: 110,
        tip: 'Pratique palavras longas separadamente antes de incluí-las em frases completas.'
      },
      {
        id: 'i8',
        num: 8,
        icon: '🏆',
        title: 'Desafio Intermediário',
        desc: 'Parágrafo completo sobre tecnologia. Meta: 35 WPM com 90% de precisão.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'A tecnologia transformou o mercado de trabalho. Saber digitar com velocidade e precisão é um diferencial competitivo. Pratique diariamente e evolua suas habilidades profissionais.',
        xp: 200,
        tip: 'Foque na precisão primeiro. Se conseguir 90% de acerto, a velocidade virá naturalmente.',
        isChallenge: true
      }
    ]
  },

  avancado: {
    title: '🔥 Nível Avançado',
    desc: 'Textos longos sobre tecnologia, informática e inovação. Meta: 60+ WPM com 95% de precisão.',
    color: 'var(--rgb-1)',
    lessons: [
      {
        id: 'a1',
        num: 1,
        icon: '🚀',
        title: 'Velocidade com Precisão',
        desc: 'Textos fluidos sobre tecnologia para desenvolver ritmo e consistência.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'A inteligência artificial está revolucionando diversos setores da economia global, desde saúde até educação e logística.',
        xp: 150,
        tip: 'Em textos longos, mantenha o ritmo constante. Picos de velocidade causam mais erros.'
      },
      {
        id: 'a2',
        num: 2,
        icon: '💻',
        title: 'Linguagens de Programação',
        desc: 'Termos e palavras-chave usados em programação. Caracteres especiais incluídos.',
        keys: ['_','-','=','+'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'Python JavaScript HTML CSS SQL Java function class return import export const let var if else while for',
        xp: 160,
        tip: 'Programadores digitam muito. Uma boa velocidade de digitação acelera o desenvolvimento.'
      },
      {
        id: 'a3',
        num: 3,
        icon: '🌐',
        title: 'Texto Técnico — Redes',
        desc: 'Vocabulário e conceitos de redes de computadores e internet.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'Redes de computadores permitem o compartilhamento de recursos e informações entre dispositivos conectados por meio de protocolos de comunicação padronizados como TCP IP e HTTP.',
        xp: 170,
        tip: 'Textos técnicos têm vocabulário específico. Quanto mais você os pratica, mais familiar fica.'
      },
      {
        id: 'a4',
        num: 4,
        icon: '🔒',
        title: 'Texto Técnico — Segurança',
        desc: 'Termos e conceitos de segurança da informação e cibersegurança.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'A segurança da informação protege dados contra acessos não autorizados. Senhas fortes, autenticação em dois fatores e criptografia são práticas essenciais para qualquer profissional.',
        xp: 170,
        tip: 'Palavras compostas como cibersegurança e criptografia precisam de atenção especial.'
      },
      {
        id: 'a5',
        num: 5,
        icon: '🤖',
        title: 'Texto Técnico — Inteligência Artificial',
        desc: 'Parágrafo sobre IA e aprendizado de máquina para praticar vocabulário especializado.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'O aprendizado de máquina permite que sistemas computacionais aprendam padrões a partir de dados sem serem explicitamente programados. Redes neurais profundas alcançam desempenho impressionante.',
        xp: 180,
        tip: 'Se errar em palavras técnicas, anote-as e pratique individualmente antes da próxima sessão.'
      },
      {
        id: 'a6',
        num: 6,
        icon: '🏆',
        title: 'Desafio Avançado',
        desc: 'Texto longo e fluido. Meta: 55 WPM com 95% de precisão. O teste definitivo.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'A transformação digital está redefinindo a forma como empresas operam e se relacionam com clientes. Profissionais que dominam ferramentas tecnológicas, digitam com agilidade e compreendem conceitos de informática possuem vantagem competitiva significativa no mercado de trabalho atual.',
        xp: 300,
        tip: 'Você chegou ao desafio máximo! Respire fundo, mantenha o ritmo e confie no seu treinamento.',
        isChallenge: true
      }
    ]
  },

  numeros: {
    title: '🔢 Números e Símbolos',
    desc: 'Domine o teclado numérico e os caracteres especiais essenciais para planilhas, códigos e documentos.',
    color: 'var(--rgb-6)',
    lessons: [
      {
        id: 'n1',
        num: 1,
        icon: '1️⃣',
        title: 'Números 1 a 5',
        desc: 'Fileira numérica superior — primeira metade. Use os dedos da mão esquerda.',
        keys: ['1','2','3','4','5'],
        homeKeys: ['a','s','d','f'],
        text: '1 2 3 4 5 12 23 34 45 51 123 234 345 451 512 1234 2345 3451 4512 5123 11 22 33 44 55',
        xp: 70,
        tip: 'Para a fileira numérica, a mão esquerda cobre 1-5 e a direita cobre 6-0.'
      },
      {
        id: 'n2',
        num: 2,
        icon: '6️⃣',
        title: 'Números 6 a 0',
        desc: 'Fileira numérica superior — segunda metade. Use os dedos da mão direita.',
        keys: ['6','7','8','9','0'],
        homeKeys: ['j','k','l'],
        text: '6 7 8 9 0 67 78 89 90 06 678 789 890 906 067 6789 7890 8906 9067 0678 66 77 88 99 00',
        xp: 70,
        tip: 'O polegar não é usado nos números. Use os quatro dedos e estique para as teclas distantes.'
      },
      {
        id: 'n3',
        num: 3,
        icon: '🔢',
        title: 'Todos os Números',
        desc: 'Pratique todos os dígitos de 0 a 9 misturados, simulando situações reais.',
        keys: ['0','1','2','3','4','5','6','7','8','9'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: '1984 2023 2024 2025 1024 4096 8192 1000 9999 3141 2718 1618 7777 1234 5678 9012 3456',
        xp: 90,
        tip: 'Datas, anos e valores numéricos são os usos mais comuns. Treine com números reais.'
      },
      {
        id: 'n4',
        num: 4,
        icon: '📊',
        title: 'Valores Monetários',
        desc: 'Pratique digitação de valores financeiros com ponto e vírgula decimais.',
        keys: ['R','$','.', ','],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'R$ 1.500,00 R$ 299,90 R$ 4.750,00 R$ 89,99 R$ 12.000,00 R$ 450,75 R$ 3.200,50',
        xp: 100,
        tip: 'Em planilhas e sistemas financeiros, a precisão nos valores é absolutamente crítica.'
      },
      {
        id: 'n5',
        num: 5,
        icon: '📞',
        title: 'Telefones e CEPs',
        desc: 'Formatos comuns de documentos: telefones, CEP, CNPJ e datas.',
        keys: ['(',')','-','/'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: '(65) 3322-1100 (11) 99999-0000 78305-000 79000-000 12.345.678/0001-99 01/01/2025',
        xp: 110,
        tip: 'Parênteses, hífens e barras são muito usados em formulários. Pratique sem olhar para o teclado.'
      },
      {
        id: 'n6',
        num: 6,
        icon: '⌨️',
        title: 'Símbolos Especiais',
        desc: 'Caracteres especiais usados em programação, e-mails e documentos técnicos.',
        keys: ['@','#','%','&','*','_'],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'email@dominio.com.br usuario@empresa.net #tecnologia #informatica 50% 100% C&A R&D user_name config_file',
        xp: 120,
        tip: 'O @ é essencial para e-mails. # para hashtags e linguagens como C#. _ é muito usado em programação.'
      },
      {
        id: 'n7',
        num: 7,
        icon: '🏆',
        title: 'Desafio Números',
        desc: 'Mistura de números, símbolos e texto. Simulação de dados reais do cotidiano.',
        keys: [],
        homeKeys: ['a','s','d','f','j','k','l'],
        text: 'Pedido #1234 | Cliente: João Silva | Tel: (65) 99999-0000 | Valor: R$ 1.500,00 | Venc: 31/01/2025',
        xp: 200,
        tip: 'Parabéns por chegar ao desafio de números! Este é o formato real de registros profissionais.',
        isChallenge: true
      }
    ]
  }
};

const LESSONS_STORAGE_KEY = 'digimaster_lessons';

function loadLessonsProgress() {
  try { return JSON.parse(localStorage.getItem(LESSONS_STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveLessonComplete(lessonId, wpm, accuracy) {
  // Local
  const progress = loadLessonsProgress();
  if (!progress[lessonId] || progress[lessonId].wpm < wpm) {
    progress[lessonId] = { completed: true, wpm, accuracy, date: new Date().toISOString() };
  }
  localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(progress));
  // Cloud
  if (typeof saveLessonCloud === 'function') {
    saveLessonCloud(lessonId, wpm, accuracy);
  }
}

function isLessonUnlocked(levelKey, lessonIndex) {
  if (lessonIndex === 0) return true;
  const levelLessons = LESSONS[levelKey].lessons;
  const prevLesson = levelLessons[lessonIndex - 1];
  const progress = loadLessonsProgress();
  return !!progress[prevLesson.id];
}

// ---- Active Lesson State ----
let activeLessonData = null;

function startLesson(levelKey, lessonId) {
  const levelData = LESSONS[levelKey];
  const lesson = levelData.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  activeLessonData = { levelKey, lesson };

  // Set the practice text and level
  currentLevel = levelKey;
  currentText = lesson.text;

  // Update the UI
  const banner = document.getElementById('activeLessonBanner');
  const albTitle = document.getElementById('albTitle');
  const albSub = document.getElementById('albSub');
  const albIcon = document.getElementById('albIcon');

  if (banner) {
    albIcon.textContent = lesson.icon;
    albTitle.textContent = `Lição ${lesson.num}: ${lesson.title}`;
    albSub.textContent = lesson.tip || 'Complete para registrar progresso';
    banner.classList.add('visible');
  }

  // Update level select
  const levelSel = document.getElementById('levelSelect');
  if (levelSel) levelSel.value = levelKey;

  // Navigate to practice
  navigateTo('practice');

  // Show tip toast
  showToast(`📖 ${lesson.title} — Iniciado!`);
}

function clearActiveLesson() {
  activeLessonData = null;
  const banner = document.getElementById('activeLessonBanner');
  if (banner) banner.classList.remove('visible');
}

function checkLessonCompletion(wpm, accuracy) {
  if (!activeLessonData) return;
  const { levelKey, lesson } = activeLessonData;

  saveLessonComplete(lesson.id, wpm, accuracy);

  showToast(`🏆 Lição concluída! ${wpm} WPM — ${accuracy}% precisão`);
  clearActiveLesson();

  // Refresh lessons panel if open
  renderLessonsPanel(levelKey);
}

// ---- Render Lessons ----
function renderLessons() {
  renderLessonsTabs();
  renderLessonsPanel('basico');
}

function renderLessonsTabs() {
  const tabs = document.querySelectorAll('.lesson-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLessonsPanel(tab.dataset.tab);
    });
  });
}

function renderLessonsPanel(levelKey) {
  const container = document.getElementById('lessonsPanels');
  if (!container) return;

  const levelData = LESSONS[levelKey];
  const progress = loadLessonsProgress();

  // Count completed
  const completedCount = levelData.lessons.filter(l => progress[l.id]).length;
  const totalCount = levelData.lessons.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  container.innerHTML = `
    <div class="lessons-panel active">
      <div class="lessons-panel-header">
        <h2 style="color:${levelData.color}">${levelData.title}</h2>
        <p>${levelData.desc}</p>
        <div style="margin-top:12px;display:flex;align-items:center;gap:12px">
          <div style="flex:1;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${levelData.color};border-radius:2px;transition:width 0.5s;box-shadow:0 0 8px ${levelData.color}"></div>
          </div>
          <span style="font-family:var(--font-title);font-size:12px;color:${levelData.color};letter-spacing:1px;flex-shrink:0">${completedCount}/${totalCount} concluídas</span>
        </div>
      </div>
      <div class="lessons-grid">
        ${levelData.lessons.map((lesson, idx) => renderLessonCard(lesson, idx, levelKey, progress)).join('')}
      </div>
    </div>
  `;
}

function renderLessonCard(lesson, idx, levelKey, progress) {
  const done = !!progress[lesson.id];
  const unlocked = isLessonUnlocked(levelKey, idx);
  const best = progress[lesson.id];

  const keyPreviews = lesson.keys.length > 0
    ? lesson.keys.slice(0, 8).map(k => `<span class="lesson-key-preview ${lesson.homeKeys.includes(k) ? 'home' : ''}">${k.toUpperCase()}</span>`).join('')
    : lesson.homeKeys.slice(0, 6).map(k => `<span class="lesson-key-preview home">${k.toUpperCase()}</span>`).join('');

  const btnClass = !unlocked ? 'locked-btn' : '';
  const btnText = !unlocked ? '🔒 Bloqueado' : done ? '↺ Repetir' : '▶ Iniciar';
  const cardClass = done ? 'completed' : !unlocked ? 'locked' : '';

  const challengeTag = lesson.isChallenge ? `<span style="background:rgba(255,45,120,0.15);border:1px solid rgba(255,45,120,0.3);color:var(--rgb-1);font-family:var(--font-ui);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:100px">🏆 Desafio</span>` : '';

  const bestDisplay = best ? `<span style="font-family:var(--font-title);font-size:11px;color:var(--correct);letter-spacing:1px">✓ ${best.wpm} WPM ${best.accuracy}%</span>` : '';

  return `
    <div class="lesson-card ${cardClass}" onclick="${unlocked ? `startLesson('${levelKey}','${lesson.id}')` : ''}">
      <div class="lesson-num">
        <span>LIÇÃO ${lesson.num} ${challengeTag}</span>
        <span class="lesson-badge ${done ? 'done' : ''}">${lesson.icon}</span>
      </div>
      <h3>${lesson.title}</h3>
      <p>${lesson.desc}</p>
      <div class="lesson-keys">${keyPreviews}</div>
      <div class="lesson-footer">
        <div>
          <div class="lesson-xp">XP: <span>+${lesson.xp}</span></div>
          ${bestDisplay}
        </div>
        <button class="lesson-play-btn ${btnClass}" onclick="event.stopPropagation();${unlocked ? `startLesson('${levelKey}','${lesson.id}')` : ''}">${btnText}</button>
      </div>
      <div class="lesson-progress">
        <div class="lesson-progress-fill" style="width:${done ? '100' : '0'}%"></div>
      </div>
    </div>
  `;
}

// ---- Toast ----
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

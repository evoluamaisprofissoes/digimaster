// =========================================
// DigiMaster — Sistema de Lições
// =========================================

const LESSONS = {
  basico: {
    title: '🌱 Nível Básico',
    desc: 'Aprenda a posição home, coordenação e primeiras palavras.',
    color: 'var(--rgb-4)',
    lessons: [
      { id:'b0', num:0, icon:'🏠', title:'Introdução — Posição Home', desc:'Fundação da digitação.', keys:['a','s','d','f','j','k','l'], homeKeys:['a','s','d','f','j','k','l'], text:'aaa sss ddd fff jjj kkk lll aaa jjj sss kkk ddd lll fff jjj asdf jkl fdsa lkj asdf jkl', xp:30, tip:'Sinta as marcas em F e J.', goalWpm:12, goalAccuracy:80, duration:60, isIntro:true },
      { id:'b1', num:1, icon:'✋', title:'Mão Esquerda — ASDF', desc:'Dedos da mão esquerda.', keys:['a','s','d','f'], homeKeys:['a','s','d','f'], text:'aaa sss ddd fff aaa sss ddd fff asd fds sad fas daf sdf fda sfa daf fas sdf aaa fff ddd sss asdf fdsa sadf dsaf', xp:50, tip:'Relaxe os dedos.', goalWpm:14, goalAccuracy:82, duration:60 },
      { id:'b2', num:2, icon:'🤚', title:'Mão Direita — JKL', desc:'Dedos da mão direita.', keys:['j','k','l'], homeKeys:['j','k','l'], text:'jjj kkk lll jjj kkk lll jkl lkj kjl jlk lkj kjl jjj lll kkk jkl lkj jlk kjl jkl lkj kjl jkl lkj', xp:50, tip:'Retorne sempre à home.', goalWpm:14, goalAccuracy:82, duration:60 },
      { id:'b3', num:3, icon:'👐', title:'Mãos Juntas', desc:'Coordenação entre as duas mãos.', keys:['a','s','d','f','j','k','l'], homeKeys:['a','s','d','f','j','k','l'], text:'asdf jkl fads lkj sdf jkl adf jlk dsa klj fja skd lad fkj sdf jkl asdf jkl fdsa lkj asdf jkl', xp:75, tip:'Mantenha ritmo estável.', goalWpm:16, goalAccuracy:84, duration:60 },
      { id:'b4', num:4, icon:'⬆️', title:'Teclas GH', desc:'Centro do teclado.', keys:['g','h'], homeKeys:['f','j'], text:'ggg hhh ghg hgh ggh hhg ghh ggh fgh jhk gah hag gfh jhk ghj hgf asg jhk dfg lkh asdfgh jklhg', xp:60, tip:'Após G e H, volte para F e J.', goalWpm:16, goalAccuracy:84, duration:60 },
      { id:'b5', num:5, icon:'📝', title:'Palavras Básicas I', desc:'Primeiras palavras reais.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'sol lua mar rio voz mao dia cor luz noz asa mel fel cal mal sal ala ela ola ali ame amo ave', xp:100, tip:'Precisão primeiro.', goalWpm:18, goalAccuracy:85, duration:75 },
      { id:'b6', num:6, icon:'🏆', title:'Desafio Básico', desc:'Meta: 20 WPM com 85% de precisão.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'asdf jkl casa sala mesa faca bola vela mala roda soda cola moda dia sol lua mar rio voz cor luz', xp:150, tip:'Confie no treino.', goalWpm:20, goalAccuracy:85, duration:75, isChallenge:true }
    ]
  },
  intermediario: {
    title: '⚡ Nível Intermediário',
    desc: 'Frases reais, vocabulário profissional e mais velocidade.',
    color: 'var(--rgb-5)',
    lessons: [
      { id:'i1', num:1, icon:'⌨️', title:'Uso do Shift', desc:'Maiúsculas e nomes próprios.', keys:['A','S','D','F','J','K','L'], homeKeys:['a','s','d','f','j','k','l'], text:'Ana Sol Lua Mar Rio Dia Cor Luz Jose Maria Pedro Carlos Silva', xp:80, tip:'Use Shift com a mão oposta.', goalWpm:24, goalAccuracy:88, duration:75 },
      { id:'i2', num:2, icon:'📱', title:'Palavras de Tecnologia', desc:'Vocabulário de informática.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'mouse teclado monitor arquivo pasta login senha email backup sistema disco rede dados nuvem', xp:100, tip:'Familiarize-se com termos técnicos.', goalWpm:26, goalAccuracy:88, duration:75 },
      { id:'i3', num:3, icon:'🔢', title:'Pontuação Básica', desc:'Ponto, vírgula e dois-pontos.', keys:['.',',',':',';'], homeKeys:['a','s','d','f','j','k','l'], text:'Ola mundo. Como vai? Tudo bem. Nome: Maria. Data: hoje. Lista: um, dois, tres.', xp:90, tip:'Pontuação exige controle fino.', goalWpm:28, goalAccuracy:89, duration:75 },
      { id:'i4', num:4, icon:'📝', title:'Frases Completas', desc:'Textos do cotidiano profissional.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'O computador e uma ferramenta essencial no trabalho moderno. Salve seus arquivos regularmente.', xp:110, tip:'Leia a próxima palavra antes de terminar a atual.', goalWpm:30, goalAccuracy:90, duration:80 },
      { id:'i5', num:5, icon:'💼', title:'Vocabulário Profissional', desc:'Documentos e ambiente de trabalho.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'relatorio reuniao proposta cliente contrato prazo orcamento projeto equipe resultado analise', xp:110, tip:'Ritmo constante.', goalWpm:32, goalAccuracy:90, duration:80 },
      { id:'i6', num:6, icon:'🏆', title:'Desafio Intermediário', desc:'Meta: 35 WPM com 90% de precisão.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A tecnologia transformou o mercado de trabalho. Saber digitar com velocidade e precisao e um diferencial. Pratique diariamente e evolua suas habilidades profissionais.', xp:200, tip:'Consistência vence pressa.', goalWpm:35, goalAccuracy:90, duration:90, isChallenge:true }
    ]
  },
  avancado: {
    title: '🔥 Nível Avançado',
    desc: 'Textos longos, técnicos e com alta exigência.',
    color: 'var(--rgb-1)',
    lessons: [
      { id:'a1', num:1, icon:'🚀', title:'Velocidade com Precisão', desc:'Texto fluido sobre tecnologia.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A inteligencia artificial esta revolucionando diversos setores da economia global desde saude ate educacao e logistica.', xp:150, tip:'Ritmo controlado.', goalWpm:42, goalAccuracy:92, duration:90 },
      { id:'a2', num:2, icon:'💻', title:'Linguagens de Programação', desc:'Termos comuns de programação.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Python JavaScript HTML CSS SQL Java function class return import export const let var if else while for', xp:160, tip:'Não corra nas palavras em inglês.', goalWpm:45, goalAccuracy:93, duration:90 },
      { id:'a3', num:3, icon:'🔒', title:'Segurança da Informação', desc:'Vocabulário técnico.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A seguranca da informacao protege dados contra acessos nao autorizados. Senhas fortes e autenticacao em dois fatores sao praticas essenciais.', xp:170, tip:'Respire e mantenha a postura.', goalWpm:48, goalAccuracy:94, duration:90 },
      { id:'a4', num:4, icon:'🤖', title:'Inteligência Artificial', desc:'Parágrafo sobre aprendizado de máquina.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'O aprendizado de maquina permite que sistemas computacionais aprendam padroes a partir de dados sem serem explicitamente programados para cada tarefa especifica.', xp:180, tip:'Textos longos exigem cadência.', goalWpm:50, goalAccuracy:94, duration:95 },
      { id:'a5', num:5, icon:'🏆', title:'Desafio Avançado', desc:'Meta: 55 WPM com 95% de precisão.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A transformacao digital esta redefinindo a forma como empresas operam e se relacionam com clientes. Profissionais que dominam ferramentas tecnologicas e digitam com agilidade possuem vantagem competitiva significativa no mercado de trabalho atual.', xp:300, tip:'Foco e constância.', goalWpm:55, goalAccuracy:95, duration:100, isChallenge:true }
    ]
  },
  numeros: {
    title: '🔢 Números e Símbolos',
    desc: 'Planilhas, valores, telefones e caracteres especiais.',
    color: 'var(--rgb-6)',
    lessons: [
      { id:'n1', num:1, icon:'1️⃣', title:'Números 1 a 5', desc:'Primeira metade da fileira numérica.', keys:['1','2','3','4','5'], homeKeys:['a','s','d','f'], text:'1 2 3 4 5 12 23 34 45 51 123 234 345 451 512 1234 2345', xp:70, tip:'Retorne para home após cada número.', goalWpm:22, goalAccuracy:88, duration:70 },
      { id:'n2', num:2, icon:'6️⃣', title:'Números 6 a 0', desc:'Segunda metade da fileira numérica.', keys:['6','7','8','9','0'], homeKeys:['j','k','l'], text:'6 7 8 9 0 67 78 89 90 06 678 789 890 906 067 6789', xp:70, tip:'Precisão primeiro.', goalWpm:22, goalAccuracy:88, duration:70 },
      { id:'n3', num:3, icon:'📊', title:'Valores Monetários', desc:'Valores financeiros e separadores.', keys:['R','$','.',','], homeKeys:['a','s','d','f','j','k','l'], text:'R$ 1.500,00 R$ 299,90 R$ 4.750,00 R$ 89,99 R$ 12.000,00 R$ 450,75', xp:100, tip:'Muito usado em planilhas.', goalWpm:26, goalAccuracy:90, duration:80 },
      { id:'n4', num:4, icon:'📞', title:'Telefones e Datas', desc:'Formatos comuns do dia a dia.', keys:['(',')','-','/'], homeKeys:['a','s','d','f','j','k','l'], text:'(65) 3322-1100 (11) 99999-0000 78305-000 01/01/2025 31/12/2024', xp:110, tip:'Formulários exigem capricho.', goalWpm:28, goalAccuracy:90, duration:80 },
      { id:'n5', num:5, icon:'🏆', title:'Desafio Números', desc:'Meta: 30 WPM com 90% de precisão.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Pedido 1234 Cliente Joao Silva Tel (65) 99999-0000 Valor R$ 1.500,00 Venc 31/01/2025', xp:200, tip:'Simulação real.', goalWpm:30, goalAccuracy:90, duration:90, isChallenge:true }
    ]
  }
};

const LESSONS_STORAGE_KEY = 'digimaster_lessons';
let activeLessonData = null;

function loadLessonsProgress() {
  try { return JSON.parse(localStorage.getItem(LESSONS_STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveLessonComplete(lessonId, wpm, accuracy, passedGoal = true) {
  const progress = loadLessonsProgress();
  const prev = progress[lessonId];
  if (!prev || wpm > prev.wpm || (wpm === prev.wpm && accuracy > prev.accuracy)) {
    progress[lessonId] = { completed: true, wpm, accuracy, passedGoal, date: new Date().toISOString() };
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(progress));
  }
  if (typeof saveLessonCloud === 'function') saveLessonCloud(lessonId, wpm, accuracy, passedGoal);
}

function isLessonUnlocked(levelKey, lessonIndex) {
  if (lessonIndex === 0) return true;
  const prevLesson = LESSONS[levelKey].lessons[lessonIndex - 1];
  const progress = loadLessonsProgress();
  return !!progress[prevLesson.id];
}

function startLesson(levelKey, lessonId) {
  const lesson = LESSONS[levelKey].lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  activeLessonData = { levelKey, lesson };
  currentLevel = levelKey;
  currentMode = 'text';
  const levelSel = document.getElementById('levelSelect');
  const modeSel = document.getElementById('modeSelect');
  const durSel = document.getElementById('durationSelect');
  if (levelSel) levelSel.value = levelKey;
  if (modeSel) modeSel.value = 'text';
  if (durSel) durSel.value = String(lesson.duration || LEVEL_GOALS[levelKey].duration || 60);
  const banner = document.getElementById('activeLessonBanner');
  if (banner) banner.classList.add('visible');
  document.getElementById('albIcon').textContent = lesson.icon;
  document.getElementById('albTitle').textContent = `Lição ${lesson.num}: ${lesson.title}`;
  document.getElementById('albSub').textContent = lesson.tip || 'Complete a lição para registrar o progresso';
  document.getElementById('lessonGoalBox').textContent = `Meta: ${lesson.goalWpm} WPM • ${lesson.goalAccuracy}%`;
  const liveGoal = document.getElementById('liveGoal');
  if (liveGoal) liveGoal.textContent = `${lesson.goalWpm}/${lesson.goalAccuracy}%`;
  navigateTo('practice');
  showToast(`📖 Lição ${lesson.num} iniciada`);
}

function clearActiveLesson() {
  activeLessonData = null;
  const banner = document.getElementById('activeLessonBanner');
  if (banner) banner.classList.remove('visible');
  const liveGoal = document.getElementById('liveGoal');
  if (liveGoal) liveGoal.textContent = '—';
}

function checkLessonCompletion(wpm, accuracy) {
  if (!activeLessonData) return { hadLesson: false, passedGoal: false };
  const { levelKey, lesson } = activeLessonData;
  const passedGoal = wpm >= lesson.goalWpm && accuracy >= lesson.goalAccuracy;
  saveLessonComplete(lesson.id, wpm, accuracy, passedGoal);
  showToast(passedGoal ? `🏆 Lição concluída com meta batida!` : `✅ Lição registrada. Você pode repetir para bater a meta.`);
  renderLessonsPanel(levelKey);
  clearActiveLesson();
  return { hadLesson: true, passedGoal, lesson };
}

function renderLessons() {
  renderLessonsTabs();
  const activeTab = document.querySelector('.lesson-tab.active')?.dataset.tab || 'basico';
  renderLessonsPanel(activeTab);
}

function renderLessonsTabs() {
  document.querySelectorAll('.lesson-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.lesson-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLessonsPanel(tab.dataset.tab);
    };
  });
}

function renderLessonsPanel(levelKey) {
  const container = document.getElementById('lessonsPanels');
  if (!container) return;
  const levelData = LESSONS[levelKey];
  const progress = loadLessonsProgress();
  const completedCount = levelData.lessons.filter(l => progress[l.id]).length;
  const pct = Math.round((completedCount / levelData.lessons.length) * 100);

  container.innerHTML = `
    <div class="lessons-panel active">
      <div class="lessons-panel-header">
        <h2 style="color:${levelData.color}">${levelData.title}</h2>
        <p>${levelData.desc}</p>
        <div style="margin-top:12px;display:flex;align-items:center;gap:12px">
          <div style="flex:1;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${levelData.color};border-radius:2px"></div></div>
          <span style="font-family:var(--font-title);font-size:12px;color:${levelData.color};letter-spacing:1px;flex-shrink:0">${completedCount}/${levelData.lessons.length} concluídas</span>
        </div>
      </div>
      <div class="lessons-grid">${levelData.lessons.map((lesson, idx) => renderLessonCard(lesson, idx, levelKey, progress)).join('')}</div>
    </div>`;
}

function renderLessonCard(lesson, idx, levelKey, progress) {
  const done = !!progress[lesson.id];
  const unlocked = isLessonUnlocked(levelKey, idx);
  const best = progress[lesson.id];
  const keyPreviews = lesson.keys.length ? lesson.keys.slice(0, 8).map(k => `<span class="lesson-key-preview ${lesson.homeKeys.includes(k.toLowerCase()) ? 'home' : ''}">${k.toUpperCase()}</span>`).join('') : lesson.homeKeys.slice(0, 6).map(k => `<span class="lesson-key-preview home">${k.toUpperCase()}</span>`).join('');
  const introTag = lesson.isIntro ? `<span class="lesson-badge-tag intro-tag">Introdução</span>` : '';
  const challengeTag = lesson.isChallenge ? `<span class="lesson-badge-tag challenge-tag">Desafio</span>` : '';
  const bestDisplay = best ? `<div class="lesson-best">✓ Melhor: ${best.wpm} WPM · ${best.accuracy}%${best.passedGoal ? ' · Meta batida' : ''}</div>` : '';
  const clickAction = unlocked ? `startLesson('${levelKey}','${lesson.id}')` : '';
  return `
    <div class="lesson-card ${done ? 'completed' : !unlocked ? 'locked' : ''}" onclick="${clickAction}">
      <div class="lesson-num"><span>LIÇÃO ${lesson.num} ${introTag}${challengeTag}</span><span class="lesson-badge-icon">${lesson.icon}${done ? ' ✅' : ''}</span></div>
      <h3>${lesson.title}</h3>
      <p>${lesson.desc}</p>
      <div class="lesson-keys">${keyPreviews}</div>
      <div class="lesson-footer">
        <div>
          <div class="lesson-xp">XP: <span>+${lesson.xp}</span></div>
          <div class="lesson-best">Meta: ${lesson.goalWpm} WPM · ${lesson.goalAccuracy}% · ${lesson.duration}s</div>
          ${bestDisplay}
        </div>
        <button class="lesson-play-btn ${!unlocked ? 'locked-btn' : ''}" onclick="event.stopPropagation();${clickAction}">${!unlocked ? '🔒 Bloqueado' : done ? '↺ Repetir' : '▶ Iniciar'}</button>
      </div>
      <div class="lesson-progress"><div class="lesson-progress-fill" style="width:${done ? '100' : '0'}%"></div></div>
    </div>`;
}

function hasCompletedAllChallenges() {
  const progress = loadLessonsProgress();
  const allChallenges = Object.values(LESSONS).flatMap(group => group.lessons.filter(l => l.isChallenge));
  return allChallenges.every(lesson => progress[lesson.id] && progress[lesson.id].passedGoal);
}

function getCompletedLessonsCount() {
  return Object.keys(loadLessonsProgress()).length;
}

function getTotalLessonsCount() {
  return Object.values(LESSONS).reduce((acc, group) => acc + group.lessons.length, 0);
}

function getChallengeSummary() {
  const progress = loadLessonsProgress();
  const challenges = Object.values(LESSONS).flatMap(group => group.lessons.filter(l => l.isChallenge));
  return challenges.map(ch => ({ lesson: ch, progress: progress[ch.id] || null }));
}

window.checkWelcome = function() {
  if (!window.currentUser) return;
  const key = `digimaster_hide_welcome_${window.currentUser.uid}`;
  if (localStorage.getItem(key) !== '1') {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) overlay.classList.add('open');
  }
};

window.showWelcome = function() {
  if (!window.currentUser) {
    showToast('Faça login para iniciar e ver o lembrete inicial.');
    return;
  }
  const overlay = document.getElementById('welcomeOverlay');
  if (overlay) overlay.classList.add('open');
};

window.closeWelcome = function(savePreference = false) {
  const overlay = document.getElementById('welcomeOverlay');
  if (overlay) overlay.classList.remove('open');
  if (savePreference && window.currentUser) {
    const checked = document.getElementById('dontShowAgain')?.checked;
    const key = `digimaster_hide_welcome_${window.currentUser.uid}`;
    if (checked) localStorage.setItem(key, '1');
    else localStorage.removeItem(key);
  }
};

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

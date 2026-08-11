// =========================================
// DigiMaster - Firebase Auth + Firestore v3
// Evolua+ Profissoes
// =========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc,
  collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7WFaELI6h349TnHRbGXLDpQsUPrXUtio",
  authDomain: "digimaster-evolua-a57f0.firebaseapp.com",
  projectId: "digimaster-evolua-a57f0",
  storageBucket: "digimaster-evolua-a57f0.firebasestorage.app",
  messagingSenderId: "536548803200",
  appId: "1:536548803200:web:6c1e09bb82f74ceb641c65"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window._firestoreDb = db;
window._firestoreLib = {
  collection, getDocs, orderBy, query, limit,
  doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp
};
window.currentUser = null;
window.isDigimasterAdmin = false;

const CORPORATE_ADMIN_DOMAIN = '@evoluaprofissoes.com.br';

// =========================================
// AUTH STATE + ADMIN ACCESS
// =========================================
onAuthStateChanged(auth, async (user) => {
  window.currentUser = user;

  if (user) {
    await ensureUserDoc(user);
    renderUserUI(user);
    ensureMobileSignout();
    await syncFromCloud(user.uid);

    window.isDigimasterAdmin = await checkAdminAccess(user);
    const adminBtn = document.getElementById('adminNavBtn');
    if (adminBtn) adminBtn.style.display = window.isDigimasterAdmin ? 'block' : 'none';

    const skip = localStorage.getItem('digimaster_hands_seen') === 'true';
    if (!skip && typeof window.showHandsModal === 'function') {
      setTimeout(() => window.showHandsModal(), 800);
    }
  } else {
    window.isDigimasterAdmin = false;
    renderLoggedOutUI();
    removeMobileSignout();
    const adminBtn = document.getElementById('adminNavBtn');
    if (adminBtn) adminBtn.style.display = 'none';
  }
});

async function checkAdminAccess(user) {
  if (!user) return false;
  const corporate = !!user.email && user.email.toLowerCase().endsWith(CORPORATE_ADMIN_DOMAIN);
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return corporate || (snap.exists() && snap.data()?.active !== false);
  } catch (e) {
    console.warn('Admin check failed:', e);
    return corporate;
  }
}

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || 'Aluno',
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      totalSessions: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      completedLessons: 0
    });
    return;
  }

  const current = snap.data() || {};
  const patch = {};
  if (user.displayName && current.name !== user.displayName) patch.name = user.displayName;
  if (user.email && current.email !== user.email) patch.email = user.email;
  if (user.photoURL && current.photoURL !== user.photoURL) patch.photoURL = user.photoURL;
  if (Object.keys(patch).length) await updateDoc(ref, patch);
}

// =========================================
// SIGN IN / OUT
// =========================================
window.signInWithGoogle = async function() {
  try {
    showAuthLoading(true);
    await signInWithPopup(auth, provider);
    closeAuthModal();
  } catch (e) {
    console.warn(e);
    showAuthError('Erro ao entrar com Google. Tente novamente.');
  } finally {
    showAuthLoading(false);
  }
};

window.signInWithEmail = async function() {
  const email = document.getElementById('authEmail')?.value?.trim();
  const pass = document.getElementById('authPass')?.value;
  if (!email || !pass) {
    showAuthError('Preencha e-mail e senha.');
    return;
  }

  try {
    showAuthLoading(true);
    await signInWithEmailAndPassword(auth, email, pass);
    closeAuthModal();
  } catch (e) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      showAuthError('E-mail ou senha incorretos.');
    } else {
      showAuthError('Erro ao entrar. Verifique seus dados.');
    }
  } finally {
    showAuthLoading(false);
  }
};

window.signUpWithEmail = async function() {
  const name = document.getElementById('authName')?.value?.trim();
  const email = document.getElementById('authEmail')?.value?.trim();
  const pass = document.getElementById('authPass')?.value;

  if (!name || !email || !pass) {
    showAuthError('Preencha todos os campos.');
    return;
  }
  if (pass.length < 6) {
    showAuthError('Senha precisa ter pelo menos 6 caracteres.');
    return;
  }

  try {
    showAuthLoading(true);
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      photoURL: cred.user.photoURL || null,
      createdAt: serverTimestamp(),
      totalSessions: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      completedLessons: 0
    }, { merge: true });
    closeAuthModal();
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      showAuthError('E-mail já cadastrado. Faça login.');
    } else {
      console.warn(e);
      showAuthError('Erro ao criar conta. Tente novamente.');
    }
  } finally {
    showAuthLoading(false);
  }
};

window.doSignOut = async function() {
  await signOut(auth);
  window.currentUser = null;
  window.isDigimasterAdmin = false;
  if (typeof window.navigateTo === 'function') window.navigateTo('home');
  if (typeof window.showToast === 'function') window.showToast('👋 Até logo!');
};

// =========================================
// CLOUD SYNC
// =========================================
window.saveSessionCloud = async function(data) {
  if (!window.currentUser) return;
  const uid = window.currentUser.uid;

  try {
    const mode = document.getElementById('modeSelect')?.value || 'words';
    const duration = Number(document.getElementById('durationSelect')?.value || 60);

    await addDoc(collection(db, 'users', uid, 'sessions'), {
      ...data,
      mode,
      duration,
      timestamp: serverTimestamp()
    });

    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const userData = snap.data() || {};

    await updateDoc(userRef, {
      totalSessions: (userData.totalSessions || 0) + 1,
      bestWpm: Math.max(userData.bestWpm || 0, data.wpm),
      bestAccuracy: Math.max(userData.bestAccuracy || 0, data.accuracy),
      lastSession: serverTimestamp(),
      lastMode: mode,
      lastDuration: duration
    });
  } catch (e) {
    console.warn('Cloud save failed:', e);
  }
};

window.saveLessonCloud = async function(lessonId, wpm, accuracy) {
  if (!window.currentUser) return;
  const uid = window.currentUser.uid;

  try {
    const ref = doc(db, 'users', uid, 'lessons', lessonId);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? snap.data() : null;

    if (!prev || (prev.wpm || 0) < wpm) {
      await setDoc(ref, {
        lessonId,
        wpm,
        accuracy,
        completedAt: serverTimestamp()
      });
    }

    const lessonSnap = await getDocs(collection(db, 'users', uid, 'lessons'));
    await updateDoc(doc(db, 'users', uid), {
      completedLessons: lessonSnap.size,
      lastLesson: lessonId,
      lastLessonAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Lesson cloud save failed:', e);
  }
};

async function syncFromCloud(uid) {
  try {
    const sessRef = collection(db, 'users', uid, 'sessions');
    const sessSnap = await getDocs(query(sessRef, orderBy('timestamp', 'desc'), limit(200)));
    const sessions = [];

    sessSnap.forEach(d => {
      const data = d.data();
      sessions.push({
        wpm: data.wpm,
        accuracy: data.accuracy,
        errors: data.errors,
        words: data.words,
        level: data.level,
        mode: data.mode,
        duration: data.duration,
        date: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    if (sessions.length) {
      localStorage.setItem('digimaster_sessions', JSON.stringify(sessions.reverse()));
    }

    const lesRef = collection(db, 'users', uid, 'lessons');
    const lesSnap = await getDocs(lesRef);
    const lp = {};

    lesSnap.forEach(d => {
      const data = d.data();
      lp[data.lessonId] = {
        completed: true,
        wpm: data.wpm,
        accuracy: data.accuracy,
        date: data.completedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    if (Object.keys(lp).length) {
      localStorage.setItem('digimaster_lessons', JSON.stringify(lp));
    }

    if (typeof window.renderStats === 'function') window.renderStats();
    if (typeof window.renderLessons === 'function') window.renderLessons();
    if (typeof window.showToast === 'function') window.showToast('☁️ Progresso sincronizado!');
  } catch (e) {
    console.warn('Sync failed:', e);
  }
}

// =========================================
// UI HELPERS
// =========================================
function renderUserUI(user) {
  const area = document.getElementById('authArea');
  if (!area) return;

  const photo = user.photoURL
    ? `<img src="${escapeHtml(user.photoURL)}" class="user-avatar" alt="Perfil" />`
    : `<div class="user-avatar-placeholder">${escapeHtml((user.displayName || 'A')[0].toUpperCase())}</div>`;

  area.innerHTML = `
    <div class="user-chip">
      ${photo}
      <span class="user-name">${escapeHtml(user.displayName || user.email || 'Aluno')}</span>
      <button class="btn-signout" onclick="doSignOut()">Sair</button>
    </div>
  `;
}

function renderLoggedOutUI() {
  const area = document.getElementById('authArea');
  if (!area) return;
  area.innerHTML = `<button class="btn-login" onclick="openAuthModal('login')">Entrar / Cadastrar</button>`;
}

function ensureMobileSignout() {
  const header = document.querySelector('.header-inner');
  if (!header || document.getElementById('dmMobileSignout')) return;

  const btn = document.createElement('button');
  btn.id = 'dmMobileSignout';
  btn.className = 'dm-mobile-signout';
  btn.type = 'button';
  btn.innerHTML = '↪ Sair';
  btn.addEventListener('click', () => window.doSignOut());
  header.appendChild(btn);
}

function removeMobileSignout() {
  document.getElementById('dmMobileSignout')?.remove();
}

window.openAuthModal = function(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('open');
    switchAuthMode(mode);
  }
};

window.closeAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
  clearAuthError();
};

window.switchAuthMode = function(mode) {
  const lp = document.getElementById('loginPanel');
  const sp = document.getElementById('signupPanel');
  const tl = document.getElementById('tabLogin');
  const ts = document.getElementById('tabSignup');

  if (mode === 'login') {
    if (lp) lp.style.display = 'flex';
    if (sp) sp.style.display = 'none';
    if (tl) tl.classList.add('active');
    if (ts) ts.classList.remove('active');
  } else {
    if (lp) lp.style.display = 'none';
    if (sp) sp.style.display = 'flex';
    if (tl) tl.classList.remove('active');
    if (ts) ts.classList.add('active');
  }
  clearAuthError();
};

function showAuthError(msg) {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = msg;
    el.style.display = 'block';
  });
}

function clearAuthError() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function showAuthLoading(loading) {
  document.querySelectorAll('.auth-submit-btn').forEach(b => {
    b.disabled = loading;
    b.style.opacity = loading ? '0.6' : '1';
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// =========================================
// DIGIMASTER 2.1 - PRACTICE ENHANCEMENTS
// =========================================
const EXTENDED_WORDS = {
  basico: [
    'casa mesa sala porta janela livro pasta tecla mouse tela aluno curso aula escola treino ritmo foco pratica evolua',
    'gato pato rato bola cola mala vela roda dado dedo lago mapa nome soma vida dia noite luz som cor voz tempo',
    'arquivo pasta login senha dados rede nuvem email texto fonte pagina bloco curso aluno prova nota aula tarefa',
    'atender vender falar ouvir ajudar cliente caixa estoque loja pedido prazo valor troco conta ficha nome telefone'
  ],
  intermediario: [
    'cliente proposta orçamento contrato relatório reunião agenda planilha cadastro atendimento processo resultado equipe tarefa prazo meta análise desempenho',
    'computador teclado monitor impressora sistema aplicativo navegador arquivo backup segurança senha autenticação internet rede servidor nuvem produtividade',
    'administração financeiro marketing vendas recursos humanos logística estoque compras atendimento planejamento organização comunicação liderança qualidade',
    'estudo prática consistência velocidade precisão concentração postura disciplina rotina aprendizado evolução habilidade profissional oportunidade carreira'
  ],
  avancado: [
    'automação inteligência artificial análise de dados cibersegurança computação em nuvem desenvolvimento integração algoritmo infraestrutura governança produtividade transformação digital',
    'planejamento estratégico indicadores de desempenho experiência do cliente gestão de projetos melhoria contínua tomada de decisão comunicação corporativa liderança colaboração inovação',
    'banco de dados arquitetura de software interface programação protocolo autenticação criptografia virtualização escalabilidade disponibilidade observabilidade manutenção implantação',
    'mercado trabalho qualificação empregabilidade competência repertório adaptação pensamento crítico resolução de problemas criatividade responsabilidade autonomia comunicação'
  ],
  numeros: [
    '10 20 30 40 50 60 70 80 90 100 125 250 375 500 750 1000 1500 2500 5000 10000',
    'R$ 19,90 R$ 49,90 R$ 99,00 R$ 149,90 R$ 299,00 R$ 799,90 R$ 1.500,00 R$ 2.750,50',
    '(65) 99999-1234 (11) 98888-5678 78280-000 78305-000 01/08/2026 10/08/2026 31/12/2026',
    'pedido 1024 nota 4587 cliente 0021 item 17 quantidade 24 desconto 10% total R$ 899,00 parcela 06 vencimento 10/09/2026'
  ]
};

const EXTENDED_TEXTS = {
  basico: [
    'A prática de digitação melhora quando o aluno mantém um ritmo calmo e constante. O objetivo no início não é correr. O mais importante é usar os dedos corretos, evitar olhar para o teclado e reduzir os erros a cada tentativa. Com alguns minutos de treino por dia, os movimentos ficam mais naturais e a velocidade começa a crescer.',
    'No ambiente de trabalho, digitar bem ajuda em tarefas simples como preencher cadastros, escrever mensagens, registrar pedidos e organizar informações. Uma pessoa que domina o teclado consegue dedicar mais atenção ao conteúdo do que ao esforço de encontrar cada tecla.',
    'O computador faz parte de muitas profissões. Atendimento, vendas, administração, estoque, farmácia e serviços financeiros usam sistemas que exigem digitação. Aprender a escrever com precisão no teclado é uma habilidade prática que acompanha o profissional durante toda a carreira.',
    'Treinar todos os dias por pouco tempo costuma ser melhor do que fazer uma sessão longa apenas uma vez por semana. A repetição ajuda o cérebro e as mãos a memorizar os movimentos. Aos poucos, o aluno deixa de pensar em cada tecla e passa a digitar palavras inteiras com mais confiança.'
  ],
  intermediario: [
    'A produtividade no trabalho depende de pequenas habilidades que se somam ao longo do dia. Saber digitar com velocidade e precisão reduz o tempo gasto em e-mails, relatórios, sistemas de atendimento, planilhas e cadastros. Quando a digitação deixa de exigir esforço consciente, o profissional consegue concentrar energia na qualidade da informação e na solução do problema.',
    'Organização digital é uma competência importante em qualquer empresa. Criar nomes claros para arquivos, manter pastas bem estruturadas, utilizar senhas fortes e fazer cópias de segurança reduz perdas de tempo e evita muitos problemas. A tecnologia entrega melhores resultados quando existe método por trás do uso das ferramentas.',
    'Um bom atendimento começa antes da resposta ao cliente. É preciso ouvir, registrar corretamente os dados, entender a necessidade e comunicar a solução de maneira clara. Em sistemas de atendimento, erros de digitação podem gerar telefones incorretos, valores errados e informações incompletas. Por isso, precisão e atenção caminham juntas.',
    'Planilhas são usadas para controlar vendas, estoque, despesas, metas e indicadores. Mesmo quem não trabalha diretamente no setor financeiro costuma lidar com números e registros. Digitar valores corretamente, revisar informações e dominar atalhos básicos pode tornar a rotina muito mais rápida e segura.',
    'A aprendizagem profissional acontece pela combinação de teoria e prática. Assistir a uma aula ajuda a entender o conceito, mas é a execução repetida que cria habilidade. Na digitação, essa diferença é evidente: quanto mais o aluno pratica corretamente, mais automática se torna a movimentação dos dedos.'
  ],
  avancado: [
    'A transformação digital não acontece apenas quando uma empresa compra novos computadores ou contrata um sistema. Ela exige mudança de processos, integração de informações, capacitação das pessoas e decisões baseadas em dados. Profissionais capazes de aprender novas ferramentas rapidamente têm vantagem porque conseguem adaptar a rotina sem perder produtividade e ainda ajudam a equipe a explorar melhor os recursos disponíveis.',
    'A inteligência artificial está ampliando a capacidade de automatizar tarefas repetitivas, analisar grandes volumes de informação e apoiar decisões. Isso não elimina a importância das habilidades humanas. Comunicação, pensamento crítico, responsabilidade, criatividade e conhecimento do contexto continuam essenciais para avaliar resultados e utilizar a tecnologia de forma adequada.',
    'Cibersegurança depende tanto de tecnologia quanto de comportamento. Senhas reutilizadas, links maliciosos, arquivos desconhecidos e dispositivos sem atualização podem abrir espaço para ataques. Empresas reduzem riscos quando combinam ferramentas de proteção com treinamento frequente, políticas claras e uma cultura em que as pessoas sabem reconhecer situações suspeitas.',
    'Dados de qualidade permitem enxergar padrões que seriam difíceis de perceber apenas pela experiência. Indicadores de vendas, produtividade, satisfação e custos ajudam gestores a comparar períodos, testar hipóteses e definir prioridades. O valor do dado, porém, depende de registros corretos, critérios consistentes e capacidade de interpretar as informações antes de tomar uma decisão.',
    'O desenvolvimento profissional exige capacidade de aprender continuamente. Ferramentas mudam, processos evoluem e novas funções surgem com rapidez. Quem constrói uma base sólida em tecnologia, comunicação e resolução de problemas consegue aproveitar melhor cursos, treinamentos e experiências práticas, transformando conhecimento em desempenho real.'
  ],
  numeros: [
    'Relatório 08/2026. Foram registrados 125 atendimentos, 47 vendas e faturamento de R$ 18.745,90. A meta mensal é de R$ 25.000,00. Restam 12 dias úteis para atingir 100% do objetivo. O ticket médio atual é de R$ 398,85 e a taxa de conversão registrada foi de 37,6%.',
    'Pedido 45821. Cliente 00374. Quantidade 18 unidades. Valor unitário R$ 49,90. Subtotal R$ 898,20. Desconto 10%. Total final R$ 808,38. Pagamento em 3 parcelas de R$ 269,46 com vencimentos em 10/08/2026, 10/09/2026 e 10/10/2026.',
    'Cadastro: telefone (65) 99999-1234, CEP 78305-000, protocolo 202608104587, atendimento iniciado às 14:35 e finalizado às 15:12. Foram enviados 3 arquivos, registrados 2 contatos e agendado retorno para 17/08/2026 às 09:30.',
    'Estoque inicial 1.250 unidades. Entradas 375 unidades. Saídas 842 unidades. Estoque final 783 unidades. Custo médio R$ 27,45. Valor estimado do estoque R$ 21.493,35. Ponto de reposição definido em 350 unidades.'
  ]
};

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function installPracticeModes() {
  const modeSelect = document.getElementById('modeSelect');
  const durationSelect = document.getElementById('durationSelect');
  const controls = document.querySelector('.practice-controls');

  if (durationSelect) {
    [
      ['180', '3min'],
      ['300', '5min'],
      ['600', '10min'],
      ['900', '15min']
    ].forEach(([value, label]) => {
      if (!durationSelect.querySelector(`option[value="${value}"]`)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        durationSelect.appendChild(option);
      }
    });
  }

  if (modeSelect && !modeSelect.querySelector('option[value="custom"]')) {
    const option = document.createElement('option');
    option.value = 'custom';
    option.textContent = 'Texto personalizado';
    modeSelect.appendChild(option);
  }

  if (controls && !document.getElementById('customTextPanel')) {
    const panel = document.createElement('div');
    panel.id = 'customTextPanel';
    panel.className = 'custom-text-panel';
    panel.innerHTML = `
      <div class="custom-text-head">
        <div>
          <strong>📝 Texto personalizado</strong>
          <span>Cole qualquer conteúdo para praticar digitação.</span>
        </div>
        <span id="customTextCount">0 caracteres</span>
      </div>
      <textarea id="customPracticeText" maxlength="12000" placeholder="Cole ou digite aqui o texto que deseja usar na prática..."></textarea>
      <div class="custom-text-actions">
        <span>Quebras de linha são convertidas em espaços automaticamente.</span>
        <button type="button" class="btn-secondary" id="customApplyBtn">Aplicar texto</button>
      </div>
    `;
    controls.insertAdjacentElement('afterend', panel);

    const textarea = panel.querySelector('#customPracticeText');
    const count = panel.querySelector('#customTextCount');
    textarea?.addEventListener('input', () => {
      if (count) count.textContent = `${textarea.value.length} caracteres`;
      localStorage.setItem('digimaster_custom_text', textarea.value);
    });
    if (textarea) textarea.value = localStorage.getItem('digimaster_custom_text') || '';
    if (count && textarea) count.textContent = `${textarea.value.length} caracteres`;

    panel.querySelector('#customApplyBtn')?.addEventListener('click', () => {
      if (!textarea?.value.trim()) {
        if (typeof window.showToast === 'function') window.showToast('⚠️ Digite ou cole um texto primeiro.');
        return;
      }
      if (modeSelect) modeSelect.value = 'custom';
      updateCustomTextVisibility();
      if (typeof window.changeMode === 'function') window.changeMode();
      if (typeof window.showToast === 'function') window.showToast('📝 Texto personalizado aplicado!');
    });
  }

  modeSelect?.addEventListener('change', updateCustomTextVisibility);
  updateCustomTextVisibility();

  const originalGetRandomText = window.getRandomText;
  if (typeof originalGetRandomText === 'function' && !window.__digimasterTextModeInstalled) {
    window.__digimasterTextModeInstalled = true;
    window.getRandomText = function(level) {
      const mode = document.getElementById('modeSelect')?.value || 'words';
      const normalizedLevel = EXTENDED_TEXTS[level] ? level : 'intermediario';

      if (mode === 'custom') {
        const raw = document.getElementById('customPracticeText')?.value || '';
        const clean = raw.replace(/\s+/g, ' ').trim();
        return clean || originalGetRandomText(level);
      }

      if (mode === 'text') {
        return randomFrom(EXTENDED_TEXTS[normalizedLevel]);
      }

      if (mode === 'time') {
        const pool = EXTENDED_TEXTS[normalizedLevel];
        return [randomFrom(pool), randomFrom(pool), randomFrom(pool)].join(' ');
      }

      if (mode === 'words' && EXTENDED_WORDS[normalizedLevel]) {
        return Math.random() < 0.65
          ? randomFrom(EXTENDED_WORDS[normalizedLevel])
          : originalGetRandomText(level);
      }

      return originalGetRandomText(level);
    };
  }
}

function updateCustomTextVisibility() {
  const panel = document.getElementById('customTextPanel');
  const mode = document.getElementById('modeSelect')?.value;
  if (panel) panel.style.display = mode === 'custom' ? 'block' : 'none';
}

function extendLessonsCatalog() {
  try {
    if (typeof LESSONS === 'undefined') return;

    const extras = {
      basico: [
        { id:'b11', num:11, icon:'🔁', title:'Consolidação de Teclas', desc:'Reforce todas as fileiras com sequências variadas e ritmo constante.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'asdf jkl qwer uiop zxcv nm casa mesa sala porta janela livro tecla mouse tela curso aluno pratica ritmo foco', xp:120, tip:'Mantenha os dedos sempre voltando para a posição home.' },
        { id:'b12', num:12, icon:'🧩', title:'Palavras do Cotidiano', desc:'Treine palavras comuns para transformar movimentos em memória muscular.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'casa escola trabalho amigo familia mercado cidade rua bairro telefone mensagem arquivo pasta agenda tarefa cliente produto', xp:120, tip:'Leia a próxima palavra enquanto termina a atual.' },
        { id:'b13', num:13, icon:'💼', title:'Vocabulário de Trabalho', desc:'Palavras simples usadas em atendimento e rotinas administrativas.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'nome cadastro cliente pedido valor prazo caixa venda compra estoque conta ficha nota curso aula prova equipe meta', xp:130, tip:'Priorize a precisão em nomes, valores e registros.' },
        { id:'b14', num:14, icon:'✍️', title:'Frases Curtas', desc:'Passe de palavras isoladas para frases completas e naturais.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'O aluno pratica todos os dias. A escola prepara para o trabalho. O cliente precisa de uma resposta clara. O arquivo deve ser salvo na pasta correta.', xp:140, tip:'Use a barra de espaço com o polegar e mantenha o ritmo.' },
        { id:'b15', num:15, icon:'🏁', title:'Desafio de Fluência Básica', desc:'Texto maior para consolidar o nível antes de avançar.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Digitar bem exige pratica e paciencia. No inicio o aluno deve pensar mais na precisao do que na velocidade. Com treino frequente os dedos aprendem o caminho das teclas e o texto passa a fluir com mais naturalidade.', xp:220, tip:'Complete o texto sem olhar para o teclado sempre que possível.', isChallenge:true }
      ],
      intermediario: [
        { id:'i9', num:9, icon:'📧', title:'E-mails Profissionais', desc:'Pratique frases comuns em mensagens de trabalho.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Bom dia. Segue em anexo o relatório solicitado. Por favor confirme o recebimento e informe se precisar de algum ajuste. Ficamos à disposição para esclarecer dúvidas e dar continuidade ao atendimento.', xp:150, tip:'Pontuação e acentuação fazem parte da precisão profissional.' },
        { id:'i10', num:10, icon:'📊', title:'Rotina Administrativa', desc:'Texto com vocabulário de documentos, prazos e organização.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A rotina administrativa exige organização de documentos, atualização de cadastros, controle de prazos, comunicação com clientes e registro correto das informações nos sistemas da empresa.', xp:160, tip:'Mantenha velocidade constante em palavras mais longas.' },
        { id:'i11', num:11, icon:'🛒', title:'Atendimento e Vendas', desc:'Treine situações comuns de contato com clientes.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Um bom atendimento começa com atenção. Registre o nome do cliente, confirme os dados, entenda a necessidade e apresente a solução com clareza. Antes de finalizar, revise valores, prazos e formas de pagamento.', xp:160, tip:'Em dados importantes, precisão vale mais do que velocidade.' },
        { id:'i12', num:12, icon:'🗂️', title:'Organização Digital', desc:'Texto mais longo para trabalhar fluência e leitura antecipada.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Arquivos bem organizados economizam tempo. Use nomes claros, separe documentos por assunto e mantenha cópias de segurança dos materiais importantes. Uma estrutura simples de pastas facilita o trabalho individual e a colaboração com toda a equipe.', xp:170, tip:'Tente enxergar duas ou três palavras à frente.' },
        { id:'i13', num:13, icon:'🏁', title:'Desafio Intermediário II', desc:'Texto contínuo com foco em ritmo, precisão e produtividade.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Profissionais que digitam com agilidade conseguem registrar informações, responder mensagens e trabalhar em sistemas com menos esforço. A velocidade é útil, mas deve caminhar junto com a precisão. Um dado digitado de forma errada pode gerar retrabalho, atrasos e problemas no atendimento.', xp:260, tip:'Busque pelo menos 90% de precisão durante todo o texto.', isChallenge:true }
      ],
      avancado: [
        { id:'a7', num:7, icon:'📈', title:'Indicadores e Decisão', desc:'Texto corporativo com termos de análise e gestão.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Indicadores de desempenho ajudam empresas a acompanhar resultados e identificar oportunidades de melhoria. Dados de vendas, produtividade, satisfação e custos precisam ser registrados com consistência para que gestores possam comparar períodos e tomar decisões melhores.', xp:200, tip:'Evite acelerar demais em termos técnicos.' },
        { id:'a8', num:8, icon:'☁️', title:'Computação em Nuvem', desc:'Pratique um texto técnico mais longo e fluido.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A computação em nuvem permite acessar sistemas, arquivos e serviços pela internet sem depender de um único computador físico. Empresas utilizam essa estrutura para ampliar disponibilidade, facilitar colaboração e ajustar recursos conforme a demanda.', xp:210, tip:'Mantenha cadência estável e antecipe a leitura.' },
        { id:'a9', num:9, icon:'🛡️', title:'Cultura de Cibersegurança', desc:'Texto especializado sobre comportamento e proteção de dados.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A segurança da informação depende de ferramentas e também do comportamento das pessoas. Senhas fortes, autenticação em dois fatores, atualizações frequentes e atenção a mensagens suspeitas reduzem riscos. Treinamento contínuo transforma cada colaborador em parte da proteção digital.', xp:220, tip:'Observe acentos, pontuação e palavras compostas.' },
        { id:'a10', num:10, icon:'🤖', title:'IA no Trabalho', desc:'Texto avançado sobre uso responsável de inteligência artificial.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A inteligência artificial pode resumir documentos, apoiar análises, automatizar tarefas repetitivas e acelerar a criação de conteúdo. O profissional continua responsável por revisar resultados, proteger informações sensíveis e aplicar pensamento crítico antes de transformar uma sugestão automática em decisão.', xp:230, tip:'Foque em precisão mesmo quando o texto estiver fluindo rápido.' },
        { id:'a11', num:11, icon:'🏁', title:'Desafio Profissional', desc:'Sessão longa que combina tecnologia, negócios e produtividade.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A transformação digital exige mais do que novas ferramentas. Processos precisam ser revistos, pessoas precisam aprender e informações precisam circular com qualidade. Profissionais capazes de combinar domínio tecnológico, comunicação e pensamento crítico se adaptam melhor às mudanças e ajudam suas equipes a alcançar resultados consistentes.', xp:350, tip:'Meta sugerida: 60 WPM com pelo menos 95% de precisão.', isChallenge:true }
      ],
      numeros: [
        { id:'n8', num:8, icon:'🧾', title:'Pedidos e Notas', desc:'Treine códigos, quantidades e valores em um registro realista.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Pedido 45821 Nota 1027 Cliente 00374 Quantidade 18 Valor unitario R$ 49,90 Total R$ 898,20 Desconto 10% Valor final R$ 808,38', xp:140, tip:'Confira cada número antes de avançar.' },
        { id:'n9', num:9, icon:'📅', title:'Datas e Horários', desc:'Pratique formatos comuns de agenda e atendimento.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'10/08/2026 14:30 11/08/2026 08:15 17/08/2026 09:45 31/08/2026 18:00 01/09/2026 07:30 10/09/2026 16:20', xp:140, tip:'Barras e dois-pontos precisam de precisão.' },
        { id:'n10', num:10, icon:'📦', title:'Controle de Estoque', desc:'Misture códigos, entradas, saídas e saldos.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Produto 1024 Estoque inicial 1250 Entrada 375 Saida 842 Saldo 783 Custo R$ 27,45 Valor total R$ 21.493,35 Reposicao 350 unidades', xp:150, tip:'Mantenha atenção aos separadores decimais.' },
        { id:'n11', num:11, icon:'💳', title:'Parcelas e Vencimentos', desc:'Simule registros financeiros com valores e datas.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Total R$ 1.497,00 Entrada R$ 300,00 Saldo R$ 1.197,00 Parcela 1 R$ 399,00 10/09/2026 Parcela 2 R$ 399,00 10/10/2026 Parcela 3 R$ 399,00 10/11/2026', xp:160, tip:'Em valores financeiros, um caractere errado muda tudo.' },
        { id:'n12', num:12, icon:'🏁', title:'Desafio Numérico Profissional', desc:'Combine documentos, contato, valores, datas e percentuais.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Protocolo 202608104587 Cliente 00374 Tel (65) 99999-1234 CEP 78305-000 Pedido 45821 Total R$ 2.750,50 Desconto 8% Vencimento 10/09/2026 Atendimento 14:35', xp:260, tip:'Precisão máxima: revise números visualmente enquanto digita.', isChallenge:true }
      ]
    };

    Object.entries(extras).forEach(([level, items]) => {
      if (!LESSONS[level]?.lessons) return;
      items.forEach(item => {
        if (!LESSONS[level].lessons.some(existing => existing.id === item.id)) {
          LESSONS[level].lessons.push(item);
        }
      });
    });
  } catch (e) {
    console.warn('Could not extend lessons:', e);
  }
}

// =========================================
// ADMIN DASHBOARD ENHANCEMENTS
// =========================================
function enhanceAdminDashboard() {
  const screen = document.getElementById('screen-admin');
  if (!screen || screen.dataset.enhanced === '1') return;
  screen.dataset.enhanced = '1';

  screen.innerHTML = `
    <div class="admin-wrapper">
      <div class="admin-header">
        <div>
          <h2 class="section-title" style="margin-top:0;margin-bottom:8px">👨‍🏫 Dashboard Administrativo</h2>
          <p style="color:var(--text2);font-size:14px">Acompanhe atividade, velocidade, precisão e evolução dos alunos.</p>
        </div>
      </div>

      <div class="admin-summary" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
        <div class="admin-stat-card"><div class="admin-stat-val" id="adminTotalAlunos">—</div><div class="admin-stat-label">Alunos</div></div>
        <div class="admin-stat-card"><div class="admin-stat-val" id="adminMediaWpm">—</div><div class="admin-stat-label">WPM médio</div></div>
        <div class="admin-stat-card"><div class="admin-stat-val" id="adminMediaAcc">—</div><div class="admin-stat-label">Precisão média</div></div>
        <div class="admin-stat-card"><div class="admin-stat-val" id="adminTotalSessoes">—</div><div class="admin-stat-label">Sessões</div></div>
      </div>

      <div class="admin-toolbar">
        <input class="admin-search" type="search" placeholder="Buscar aluno por nome ou e-mail" oninput="filterAdminTable(this.value)" />
        <div class="admin-sort-group">
          <button class="rank-filter-btn active" onclick="sortAdmin('wpm',this)">WPM</button>
          <button class="rank-filter-btn" onclick="sortAdmin('accuracy',this)">Precisão</button>
          <button class="rank-filter-btn" onclick="sortAdmin('sessions',this)">Sessões</button>
          <button class="rank-filter-btn" onclick="sortAdmin('last',this)">Atividade</button>
        </div>
        <div class="admin-actions">
          <button class="btn-secondary" onclick="loadAdminData()">🔄 Atualizar</button>
          <button class="btn-secondary" onclick="exportAdminCSV()">📥 Exportar CSV</button>
        </div>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th><th>Aluno</th><th>E-mail</th><th>Melhor WPM</th>
              <th>Precisão</th><th>Sessões</th><th>Última atividade</th><th>Status</th>
            </tr>
          </thead>
          <tbody id="adminBody"></tbody>
        </table>
        <div class="admin-empty" id="adminEmpty" style="display:none">Nenhum aluno cadastrado ainda.</div>
      </div>
    </div>

    <div class="admin-detail-overlay" id="adminDetailModal" onclick="if(event.target===this)closeAdminDetail()">
      <div class="admin-detail-card">
        <button class="admin-detail-close" onclick="closeAdminDetail()">✕</button>
        <div id="adminDetailContent"></div>
      </div>
    </div>
  `;
}

window.closeAdminDetail = function() {
  const modal = document.getElementById('adminDetailModal');
  if (modal) modal.style.display = 'none';
};

window.showAdminDetail = async function(uid) {
  if (!window.isDigimasterAdmin) {
    if (typeof window.showToast === 'function') window.showToast('🔒 Acesso restrito ao administrador.');
    return;
  }

  const modal = document.getElementById('adminDetailModal');
  const content = document.getElementById('adminDetailContent');
  if (!modal || !content) return;

  modal.style.display = 'flex';
  content.innerHTML = '<div class="admin-detail-loading">⏳ Carregando desempenho...</div>';

  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) throw new Error('Aluno não encontrado.');
    const user = userSnap.data();

    const sessionSnap = await getDocs(query(
      collection(db, 'users', uid, 'sessions'),
      orderBy('timestamp', 'desc'),
      limit(20)
    ));
    const sessions = [];
    sessionSnap.forEach(item => sessions.push(item.data()));

    const lessonSnap = await getDocs(collection(db, 'users', uid, 'lessons'));
    const lessons = [];
    lessonSnap.forEach(item => lessons.push(item.data()));

    const avgWpm = sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + (s.wpm || 0), 0) / sessions.length)
      : 0;
    const avgAcc = sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length)
      : 0;
    const levelMap = {
      basico: '🌱 Básico',
      intermediario: '⚡ Intermediário',
      avancado: '🔥 Avançado',
      numeros: '🔢 Números'
    };
    const modeMap = {
      words: 'Palavras',
      text: 'Texto',
      time: 'Tempo livre',
      custom: 'Personalizado'
    };

    const historyRows = sessions.length
      ? sessions.map(s => {
          const date = s.timestamp?.toDate?.()?.toLocaleString('pt-BR', {
            day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'
          }) || '—';
          const duration = s.duration ? `${Math.round(s.duration / 60 * 10) / 10} min` : '—';
          return `
            <tr>
              <td>${date}</td>
              <td class="best-wpm">${s.wpm || 0}</td>
              <td>${s.accuracy || 0}%</td>
              <td>${s.errors || 0}</td>
              <td>${escapeHtml(levelMap[s.level] || s.level || '—')}</td>
              <td>${escapeHtml(modeMap[s.mode] || s.mode || '—')}</td>
              <td>${duration}</td>
            </tr>`;
        }).join('')
      : '<tr><td colspan="7" style="text-align:center;color:var(--text3)">Nenhuma sessão registrada.</td></tr>';

    const lessonRows = lessons.length
      ? lessons
          .sort((a, b) => String(a.lessonId).localeCompare(String(b.lessonId), 'pt-BR', { numeric:true }))
          .map(l => `<span class="admin-lesson-chip">${escapeHtml(l.lessonId)} · ${l.wpm || 0} WPM · ${l.accuracy || 0}%</span>`)
          .join('')
      : '<span style="color:var(--text3);font-size:13px">Nenhuma lição concluída.</span>';

    content.innerHTML = `
      <div class="admin-student-head">
        ${user.photoURL
          ? `<img src="${escapeHtml(user.photoURL)}" class="admin-student-avatar" alt="Aluno">`
          : `<div class="admin-student-avatar admin-student-avatar-fallback">${escapeHtml((user.name || 'A')[0].toUpperCase())}</div>`}
        <div>
          <h3>${escapeHtml(user.name || 'Aluno')}</h3>
          <p>${escapeHtml(user.email || '')}</p>
        </div>
      </div>

      <div class="admin-detail-metrics">
        <div><strong>${user.bestWpm || 0}</strong><span>Melhor WPM</span></div>
        <div><strong>${avgWpm}</strong><span>WPM médio</span></div>
        <div><strong>${avgAcc}%</strong><span>Precisão média</span></div>
        <div><strong>${user.totalSessions || sessions.length}</strong><span>Sessões</span></div>
        <div><strong>${lessons.length}</strong><span>Lições concluídas</span></div>
      </div>

      <h4 class="admin-detail-title">📚 Progresso nas lições</h4>
      <div class="admin-lessons-list">${lessonRows}</div>

      <h4 class="admin-detail-title">📊 Últimas 20 sessões</h4>
      <div class="admin-table-wrap">
        <table class="admin-table admin-detail-table">
          <thead><tr><th>Data</th><th>WPM</th><th>Precisão</th><th>Erros</th><th>Nível</th><th>Modo</th><th>Tempo</th></tr></thead>
          <tbody>${historyRows}</tbody>
        </table>
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="admin-detail-loading" style="color:var(--wrong)">Erro ao carregar aluno: ${escapeHtml(e.message)}</div>`;
  }
};

function injectEnhancementStyles() {
  if (document.getElementById('digimasterEnhancementStyles')) return;
  const style = document.createElement('style');
  style.id = 'digimasterEnhancementStyles';
  style.textContent = `
    .dm-mobile-signout{display:none;background:rgba(255,45,120,.08);border:1px solid rgba(255,45,120,.35);color:var(--wrong);font-family:var(--font-ui);font-weight:700;padding:7px 12px;border-radius:8px;cursor:pointer;white-space:nowrap}
    .custom-text-panel{display:none;background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px;margin:0 0 18px}
    .custom-text-head,.custom-text-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .custom-text-head strong{font-family:var(--font-ui);font-size:15px;color:var(--text)}
    .custom-text-head span,.custom-text-actions span{font-size:12px;color:var(--text3)}
    .custom-text-head>div{display:flex;flex-direction:column;gap:3px}
    #customPracticeText{width:100%;min-height:130px;margin:12px 0;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:14px;resize:vertical;font-family:var(--font-body);line-height:1.6;outline:none}
    #customPracticeText:focus{border-color:var(--accent);box-shadow:0 0 14px rgba(0,207,255,.12)}
    .admin-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 18px}
    .admin-search{flex:1;min-width:230px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:10px 12px;outline:none}
    .admin-search:focus{border-color:var(--accent)}
    .admin-sort-group,.admin-actions{display:flex;gap:7px;flex-wrap:wrap}
    .admin-detail-overlay{position:fixed;inset:0;background:rgba(4,6,12,.9);backdrop-filter:blur(8px);z-index:3000;display:none;align-items:center;justify-content:center;padding:20px}
    .admin-detail-card{position:relative;width:min(1050px,96vw);max-height:88vh;overflow:auto;background:var(--bg2);border:1px solid var(--border2);border-radius:18px;padding:28px;box-shadow:0 30px 100px rgba(0,0,0,.65)}
    .admin-detail-close{position:absolute;right:16px;top:14px;background:transparent;border:0;color:var(--text2);font-size:18px;cursor:pointer}
    .admin-detail-loading{text-align:center;padding:44px 20px;color:var(--text2)}
    .admin-student-head{display:flex;align-items:center;gap:14px;padding-right:36px;margin-bottom:20px}
    .admin-student-head h3{font-family:var(--font-title);font-size:19px;margin:0 0 4px}
    .admin-student-head p{color:var(--text3);font-size:13px;margin:0}
    .admin-student-avatar{width:58px;height:58px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)}
    .admin-student-avatar-fallback{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--accent),var(--accent3));color:#000;font-family:var(--font-title);font-weight:900}
    .admin-detail-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:22px}
    .admin-detail-metrics>div{background:var(--bg3);border:1px solid var(--border);border-radius:11px;padding:14px;text-align:center}
    .admin-detail-metrics strong{display:block;font-family:var(--font-title);font-size:22px;color:var(--accent)}
    .admin-detail-metrics span{display:block;margin-top:4px;color:var(--text3);font-size:10px;letter-spacing:.8px;text-transform:uppercase}
    .admin-detail-title{font-family:var(--font-title);font-size:12px;color:var(--text2);letter-spacing:1px;text-transform:uppercase;margin:18px 0 10px}
    .admin-lessons-list{display:flex;gap:8px;flex-wrap:wrap}
    .admin-lesson-chip{background:rgba(0,207,255,.07);border:1px solid rgba(0,207,255,.2);color:var(--text2);padding:6px 9px;border-radius:999px;font-size:11px}
    .admin-detail-table td{white-space:nowrap}
    @media(max-width:768px){
      .dm-mobile-signout{display:inline-flex;align-items:center;justify-content:center}
      .header-inner{gap:8px;padding:0 12px}
      .nav-tabs{overflow-x:auto;max-width:100%;scrollbar-width:none}
      .nav-tabs::-webkit-scrollbar{display:none}
      .admin-detail-card{padding:22px 14px}
      .admin-toolbar{align-items:stretch}
      .admin-search{min-width:100%}
    }
  `;
  document.head.appendChild(style);
}

function initEnhancements() {
  injectEnhancementStyles();
  installPracticeModes();
  extendLessonsCatalog();
  enhanceAdminDashboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}

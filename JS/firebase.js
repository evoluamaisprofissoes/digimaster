// =========================================
// DigiMaster — Firebase Auth + Firestore
// =========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, GoogleAuthProvider, signOut, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query,
  orderBy, limit, getDocs, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB7WFaELI6h349TnHRbGXLDpQsUPrXUtio',
  authDomain: 'digimaster-evolua-a57f0.firebaseapp.com',
  projectId: 'digimaster-evolua-a57f0',
  storageBucket: 'digimaster-evolua-a57f0.firebasestorage.app',
  messagingSenderId: '536548803200',
  appId: '1:536548803200:web:6c1e09bb82f74ceb641c65'
};

const ADMIN_EMAILS = [
  'SEU_EMAIL_ADMIN@gmail.com'
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

window.currentUser = null;
window.isAdminUser = false;

onAuthStateChanged(auth, async (user) => {
  window.currentUser = user;
  window.isAdminUser = !!(user?.email && ADMIN_EMAILS.includes(user.email));
  if (user) {
    await ensureUserDoc(user);
    renderUserUI(user);
    await syncFromCloud(user.uid);
    await refreshCloudSummaries();
    setTimeout(() => window.checkWelcome?.(), 400);
  } else {
    renderLoggedOutUI();
    toggleAdminSection(false);
    renderRankingMessage('Faça login para carregar o ranking.');
  }
});

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const baseData = {
    name: user.displayName || 'Aluno',
    email: user.email,
    photoURL: user.photoURL || null,
    isAdmin: !!(user.email && ADMIN_EMAILS.includes(user.email)),
    updatedAt: serverTimestamp()
  };
  if (!snap.exists()) {
    await setDoc(ref, {
      ...baseData,
      createdAt: serverTimestamp(),
      totalSessions: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      completedLessons: 0,
      challengeCompleted: false
    });
  } else {
    await updateDoc(ref, baseData);
  }
  await setDoc(doc(db, 'publicProfiles', user.uid), {
    name: user.displayName || 'Aluno',
    email: user.email,
    photoURL: user.photoURL || null,
    bestWpm: snap.exists() ? (snap.data().bestWpm || 0) : 0,
    totalSessions: snap.exists() ? (snap.data().totalSessions || 0) : 0,
    avgAccuracy: snap.exists() ? (snap.data().avgAccuracy || 0) : 0,
    completedLessons: snap.exists() ? (snap.data().completedLessons || 0) : 0,
    challengeCompleted: snap.exists() ? !!snap.data().challengeCompleted : false,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

window.signInWithGoogle = async function() {
  try { showAuthLoading(true); await signInWithPopup(auth, provider); closeAuthModal(); }
  catch (e) { console.error(e); showAuthError('Erro ao entrar com Google. Verifique o domínio autorizado no Firebase.'); }
  finally { showAuthLoading(false); }
};

window.signInWithEmail = async function() {
  const email = document.getElementById('authEmail')?.value?.trim();
  const pass = document.getElementById('authPass')?.value;
  if (!email || !pass) return showAuthError('Preencha e-mail e senha.');
  try { showAuthLoading(true); await signInWithEmailAndPassword(auth, email, pass); closeAuthModal(); }
  catch (e) { console.error(e); showAuthError('E-mail ou senha incorretos.'); }
  finally { showAuthLoading(false); }
};

window.signUpWithEmail = async function() {
  const name = document.getElementById('authName')?.value?.trim();
  const email = document.getElementById('authEmailSignup')?.value?.trim();
  const pass = document.getElementById('authPassSignup')?.value;
  if (!name || !email || !pass) return showAuthError('Preencha todos os campos.', true);
  if (pass.length < 6) return showAuthError('A senha precisa ter pelo menos 6 caracteres.', true);
  try {
    showAuthLoading(true);
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    await ensureUserDoc({ ...cred.user, displayName: name });
    closeAuthModal();
  } catch (e) {
    console.error(e);
    showAuthError(e.code === 'auth/email-already-in-use' ? 'Este e-mail já está cadastrado.' : 'Erro ao criar conta.', true);
  } finally { showAuthLoading(false); }
};

window.doSignOut = async function() {
  await signOut(auth);
  showToast('👋 Até logo!');
};

window.saveSessionCloud = async function(data) {
  if (!window.currentUser) return;
  try {
    await addDoc(collection(db, 'users', window.currentUser.uid, 'sessions'), { ...data, timestamp: serverTimestamp() });
    await refreshCloudSummaries();
  } catch (e) { console.warn('Cloud save failed:', e); }
};

window.saveLessonCloud = async function(lessonId, wpm, accuracy, passedGoal = true) {
  if (!window.currentUser) return;
  try {
    const ref = doc(db, 'users', window.currentUser.uid, 'lessons', lessonId);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? snap.data() : null;
    if (!prev || prev.wpm < wpm || (prev.wpm === wpm && prev.accuracy < accuracy)) {
      await setDoc(ref, { lessonId, wpm, accuracy, passedGoal, completedAt: serverTimestamp() }, { merge: true });
    }
    await refreshCloudSummaries();
  } catch (e) { console.warn('Lesson save failed:', e); }
};

async function syncFromCloud(uid) {
  try {
    const sessSnap = await getDocs(query(collection(db, 'users', uid, 'sessions'), orderBy('timestamp', 'desc'), limit(100)));
    const sessions = [];
    sessSnap.forEach(d => {
      const data = d.data();
      sessions.push({ wpm:data.wpm, accuracy:data.accuracy, errors:data.errors, words:data.words, level:data.level, date:data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString() });
    });
    if (sessions.length) localStorage.setItem('digimaster_sessions', JSON.stringify(sessions.reverse()));

    const lesSnap = await getDocs(collection(db, 'users', uid, 'lessons'));
    const lessonsProgress = {};
    lesSnap.forEach(d => {
      const data = d.data();
      lessonsProgress[data.lessonId] = { completed:true, wpm:data.wpm, accuracy:data.accuracy, passedGoal:!!data.passedGoal, date:data.completedAt?.toDate?.()?.toISOString() || new Date().toISOString() };
    });
    if (Object.keys(lessonsProgress).length) localStorage.setItem('digimaster_lessons', JSON.stringify(lessonsProgress));
    window.renderStats?.();
    window.renderLessons?.();
  } catch (e) { console.warn('Sync failed:', e); }
}

window.refreshCloudSummaries = async function() {
  if (!window.currentUser) return;
  try {
    const uid = window.currentUser.uid;
    const sessions = window.loadSessions ? window.loadSessions() : JSON.parse(localStorage.getItem('digimaster_sessions') || '[]');
    const lessons = window.loadLessonsProgress ? window.loadLessonsProgress() : JSON.parse(localStorage.getItem('digimaster_lessons') || '{}');
    const bestWpm = sessions.length ? Math.max(...sessions.map(s => s.wpm || 0)) : 0;
    const avgAccuracy = sessions.length ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / sessions.length) : 0;
    const completedLessons = Object.keys(lessons).length;
    const challengeCompleted = window.hasCompletedAllChallenges ? window.hasCompletedAllChallenges() : false;

    await setDoc(doc(db, 'users', uid), {
      name: window.currentUser.displayName || 'Aluno',
      email: window.currentUser.email,
      photoURL: window.currentUser.photoURL || null,
      totalSessions: sessions.length,
      bestWpm,
      avgAccuracy,
      completedLessons,
      challengeCompleted,
      isAdmin: window.isAdminUser,
      lastSession: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'publicProfiles', uid), {
      name: window.currentUser.displayName || 'Aluno',
      photoURL: window.currentUser.photoURL || null,
      bestWpm,
      totalSessions: sessions.length,
      avgAccuracy,
      completedLessons,
      challengeCompleted,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await renderRanking();
    if (window.isAdminUser) await renderAdminPanel();
  } catch (e) { console.warn('Summary refresh failed:', e); }
};

window.renderRanking = async function() {
  if (!window.currentUser) return renderRankingMessage('Faça login para carregar o ranking.');
  try {
    const list = document.getElementById('rankingList');
    const empty = document.getElementById('rankingEmpty');
    const snap = await getDocs(query(collection(db, 'publicProfiles'), orderBy('bestWpm', 'desc'), limit(20)));
    if (snap.empty) return renderRankingMessage('Ainda não há alunos suficientes no ranking.');
    empty.style.display = 'none';
    list.innerHTML = '';
    let pos = 1;
    snap.forEach(docSnap => {
      const item = docSnap.data();
      const avatar = item.photoURL ? `<img class="ranking-avatar" src="${item.photoURL}" alt="${item.name}">` : `<div class="ranking-avatar-fallback">${(item.name || 'A')[0].toUpperCase()}</div>`;
      const me = docSnap.id === window.currentUser.uid ? ' (você)' : '';
      list.insertAdjacentHTML('beforeend', `
        <div class="ranking-item">
          <div class="ranking-pos">${pos}</div>
          <div class="ranking-user">${avatar}<div><div class="ranking-name">${item.name || 'Aluno'}${me}</div><div class="ranking-meta">${item.completedLessons || 0} lições • ${item.avgAccuracy || 0}% precisão média</div></div></div>
          <div class="ranking-pill">${item.bestWpm || 0} WPM</div>
          <div class="ranking-pill">${item.totalSessions || 0} sessões</div>
        </div>`);
      pos++;
    });
  } catch (e) {
    console.error(e);
    renderRankingMessage('Não foi possível carregar o ranking.');
  }
};

window.renderAdminPanel = async function() {
  toggleAdminSection(window.isAdminUser);
  if (!window.isAdminUser) return;
  try {
    const body = document.getElementById('adminTableBody');
    const empty = document.getElementById('adminEmpty');
    const snap = await getDocs(query(collection(db, 'users'), orderBy('completedLessons', 'desc'), limit(100)));
    body.innerHTML = '';
    if (snap.empty) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    snap.forEach(docSnap => {
      const u = docSnap.data();
      body.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${u.name || 'Aluno'}</td>
          <td>${u.totalSessions || 0}</td>
          <td class="wpm-cell">${u.bestWpm || 0}</td>
          <td>${u.completedLessons || 0}</td>
          <td>${u.avgAccuracy || 0}%</td>
          <td>${u.updatedAt?.toDate ? u.updatedAt.toDate().toLocaleDateString('pt-BR') : '—'}</td>
        </tr>`);
    });
  } catch (e) {
    console.error(e);
    document.getElementById('adminEmpty').style.display = 'block';
  }
};

function toggleAdminSection(show) {
  document.getElementById('adminPanelSection')?.classList.toggle('hidden', !show);
}

function renderRankingMessage(message) {
  const list = document.getElementById('rankingList');
  const empty = document.getElementById('rankingEmpty');
  if (list) list.innerHTML = '';
  if (empty) { empty.style.display = 'block'; empty.textContent = message; }
}

function renderUserUI(user) {
  const area = document.getElementById('authArea');
  const photo = user.photoURL ? `<img src="${user.photoURL}" class="user-avatar" />` : `<div class="user-avatar-placeholder">${(user.displayName || 'A')[0].toUpperCase()}</div>`;
  area.innerHTML = `<div class="user-chip">${photo}<span class="user-name">${user.displayName || user.email}</span>${window.isAdminUser ? '<span class="cloud-badge">Admin</span>' : '<span class="cloud-badge">☁️ Nuvem</span>'}<button class="btn-signout" onclick="doSignOut()">Sair</button></div>`;
}

function renderLoggedOutUI() {
  document.getElementById('authArea').innerHTML = `<button class="btn-login" onclick="openAuthModal('login')">Entrar / Cadastrar</button>`;
}

window.openAuthModal = function(mode = 'login') {
  document.getElementById('authModal')?.classList.add('open');
  switchAuthMode(mode);
};
window.closeAuthModal = function() {
  document.getElementById('authModal')?.classList.remove('open');
  clearAuthError();
};
window.switchAuthMode = function(mode) {
  document.getElementById('loginPanel').style.display = mode === 'login' ? 'flex' : 'none';
  document.getElementById('signupPanel').style.display = mode === 'login' ? 'none' : 'flex';
  document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
  document.getElementById('tabSignup').classList.toggle('active', mode !== 'login');
  clearAuthError();
};

function showAuthError(msg, signup = false) {
  const el = document.getElementById(signup ? 'authErrorSignup' : 'authError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearAuthError() {
  ['authError', 'authErrorSignup'].forEach(id => { const el = document.getElementById(id); if (el) { el.textContent = ''; el.style.display = 'none'; } });
}
function showAuthLoading(loading) {
  document.querySelectorAll('.auth-submit-btn, .btn-google').forEach(btn => { btn.disabled = loading; btn.style.opacity = loading ? '0.6' : '1'; });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

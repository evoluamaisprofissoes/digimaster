// =========================================
// DigiMaster — Firebase Auth + Firestore v2
// By Evolua+ Profissões
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

// ---- Config ----
const firebaseConfig = {
  apiKey: "AIzaSyB7WFaELI6h349TnHRbGXLDpQsUPrXUtio",
  authDomain: "digimaster-evolua-a57f0.firebaseapp.com",
  projectId: "digimaster-evolua-a57f0",
  storageBucket: "digimaster-evolua-a57f0.firebasestorage.app",
  messagingSenderId: "536548803200",
  appId: "1:536548803200:web:6c1e09bb82f74ceb641c65"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();

// Exporta db e lib para módulos não-ES (ranking.js, admin)
window._firestoreDb  = db;
window._firestoreLib = { collection, getDocs, orderBy, query, limit, doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp };

// UID do admin (seu e-mail ou UID do Firebase — ajuste conforme necessário)
const ADMIN_UIDS = ['COLOQUE_SEU_UID_AQUI'];

window.currentUser = null;

// =========================================
// AUTH STATE
// =========================================
onAuthStateChanged(auth, async (user) => {
  window.currentUser = user;
  if (user) {
    await ensureUserDoc(user);
    renderUserUI(user);
    await syncFromCloud(user.uid);

    // Verifica se é admin
    const isAdmin = ADMIN_UIDS.includes(user.uid) || user.email?.endsWith('@evoluaprofissoes.com.br');
    const adminBtn = document.getElementById('adminNavBtn');
    if (adminBtn) adminBtn.style.display = isAdmin ? 'block' : 'none';

    // Mostra modal de posição das mãos se necessário
    const skip = localStorage.getItem('digimaster_hands_seen') === 'true';
    if (!skip) {
      setTimeout(() => showHandsModal(), 800);
    }
  } else {
    renderLoggedOutUI();
    const adminBtn = document.getElementById('adminNavBtn');
    if (adminBtn) adminBtn.style.display = 'none';
  }
});

async function ensureUserDoc(user) {
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || 'Aluno',
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      totalSessions: 0,
      bestWpm: 0,
      bestAccuracy: 0
    });
  }
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
    showAuthError('Erro ao entrar com Google. Tente novamente.');
  } finally {
    showAuthLoading(false);
  }
};

window.signInWithEmail = async function() {
  const email = document.getElementById('authEmail')?.value?.trim();
  const pass  = document.getElementById('authPass')?.value;
  if (!email || !pass) { showAuthError('Preencha e-mail e senha.'); return; }
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
  const name  = document.getElementById('authName')?.value?.trim();
  const email = document.getElementById('authEmail')?.value?.trim();
  const pass  = document.getElementById('authPass')?.value;
  if (!name || !email || !pass) { showAuthError('Preencha todos os campos.'); return; }
  if (pass.length < 6) { showAuthError('Senha precisa ter pelo menos 6 caracteres.'); return; }
  try {
    showAuthLoading(true);
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    closeAuthModal();
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      showAuthError('E-mail já cadastrado. Faça login.');
    } else {
      showAuthError('Erro ao criar conta. Tente novamente.');
    }
  } finally {
    showAuthLoading(false);
  }
};

window.doSignOut = async function() {
  await signOut(auth);
  window.currentUser = null;
  showToast('👋 Até logo!');
};

// =========================================
// CLOUD SYNC
// =========================================
window.saveSessionCloud = async function(data) {
  if (!window.currentUser) return;
  const uid = window.currentUser.uid;
  try {
    await addDoc(collection(db, 'users', uid, 'sessions'), {
      ...data, timestamp: serverTimestamp()
    });
    const userRef  = doc(db, 'users', uid);
    const snap     = await getDoc(userRef);
    const userData = snap.data() || {};
    await updateDoc(userRef, {
      totalSessions: (userData.totalSessions || 0) + 1,
      bestWpm: Math.max(userData.bestWpm || 0, data.wpm),
      bestAccuracy: Math.max(userData.bestAccuracy || 0, data.accuracy),
      lastSession: serverTimestamp()
    });
  } catch(e) { console.warn('Cloud save failed:', e); }
};

window.saveLessonCloud = async function(lessonId, wpm, accuracy) {
  if (!window.currentUser) return;
  const uid = window.currentUser.uid;
  try {
    const ref  = doc(db, 'users', uid, 'lessons', lessonId);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? snap.data() : null;
    if (!prev || prev.wpm < wpm) {
      await setDoc(ref, { lessonId, wpm, accuracy, completedAt: serverTimestamp() });
    }
  } catch(e) { console.warn('Lesson cloud save failed:', e); }
};

async function syncFromCloud(uid) {
  try {
    // Sessões
    const sessRef  = collection(db, 'users', uid, 'sessions');
    const sessSnap = await getDocs(query(sessRef, orderBy('timestamp','desc'), limit(100)));
    const sessions = [];
    sessSnap.forEach(d => {
      const data = d.data();
      sessions.push({
        wpm: data.wpm, accuracy: data.accuracy,
        errors: data.errors, words: data.words, level: data.level,
        date: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    if (sessions.length) localStorage.setItem('digimaster_sessions', JSON.stringify(sessions.reverse()));

    // Lições
    const lesRef  = collection(db, 'users', uid, 'lessons');
    const lesSnap = await getDocs(lesRef);
    const lp = {};
    lesSnap.forEach(d => {
      const data = d.data();
      lp[data.lessonId] = {
        completed: true, wpm: data.wpm, accuracy: data.accuracy,
        date: data.completedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    if (Object.keys(lp).length) localStorage.setItem('digimaster_lessons', JSON.stringify(lp));

    if (typeof renderStats    === 'function') renderStats();
    if (typeof renderLessons  === 'function') renderLessons();
    showToast('☁️ Progresso sincronizado!');
  } catch(e) { console.warn('Sync failed:', e); }
}

// =========================================
// UI HELPERS
// =========================================
function renderUserUI(user) {
  const area = document.getElementById('authArea');
  if (!area) return;
  const photo = user.photoURL
    ? `<img src="${user.photoURL}" class="user-avatar" />`
    : `<div class="user-avatar-placeholder">${(user.displayName||'A')[0].toUpperCase()}</div>`;
  area.innerHTML = `
    <div class="user-chip">
      ${photo}
      <span class="user-name">${user.displayName || user.email}</span>
      <button class="btn-signout" onclick="doSignOut()">Sair</button>
    </div>
  `;
}

function renderLoggedOutUI() {
  const area = document.getElementById('authArea');
  if (!area) return;
  area.innerHTML = `<button class="btn-login" onclick="openAuthModal('login')">Entrar / Cadastrar</button>`;
}

window.openAuthModal = function(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (modal) { modal.classList.add('open'); switchAuthMode(mode); }
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
  const el = document.getElementById('authError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearAuthError() {
  const el = document.getElementById('authError');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function showAuthLoading(loading) {
  document.querySelectorAll('.auth-submit-btn').forEach(b => {
    b.disabled = loading; b.style.opacity = loading ? '0.6' : '1';
  });
}

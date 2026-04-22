// =========================================
// DigiMaster — Firebase Auth (Google Login)
// =========================================

// Importado via CDN no index.html (modo compat)
const firebaseConfig = {
  apiKey: "AIzaSyB7WFaELI6h349TnHRbGXLDpQsUPrXUtio",
  authDomain: "digimaster-evolua-a57f0.firebaseapp.com",
  projectId: "digimaster-evolua-a57f0",
  storageBucket: "digimaster-evolua-a57f0.firebasestorage.app",
  messagingSenderId: "536548803200",
  appId: "1:536548803200:web:6c1e09bb82f74ceb641c65"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// ---- Login com Google ----
function loginWithGoogle() {
  const btn = document.getElementById('loginBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="login-spinner"></span> Entrando...';
  }
  auth.signInWithPopup(provider).catch((err) => {
    console.error('Erro no login:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" /> Entrar com Google';
    }
  });
}

// ---- Logout ----
function logout() {
  auth.signOut();
}

// ---- Observer de estado ----
auth.onAuthStateChanged((user) => {
  const loginScreen  = document.getElementById('loginScreen');
  const appContainer = document.getElementById('appContainer');

  if (user) {
    // Usuário logado — esconde tela de login, mostra app
    if (loginScreen)  loginScreen.style.display  = 'none';
    if (appContainer) appContainer.style.display = 'block';

    // Atualiza header com foto e nome
    const headerUser = document.getElementById('headerUser');
    const headerAvatar = document.getElementById('headerAvatar');
    const headerName   = document.getElementById('headerName');

    if (headerUser)   headerUser.style.display  = 'flex';
    if (headerAvatar) headerAvatar.src = user.photoURL || '';
    if (headerName)   headerName.textContent = user.displayName ? user.displayName.split(' ')[0] : 'Usuário';

  } else {
    // Não logado — mostra tela de login, esconde app
    if (loginScreen)  loginScreen.style.display  = 'flex';
    if (appContainer) appContainer.style.display = 'none';

    const headerUser = document.getElementById('headerUser');
    if (headerUser) headerUser.style.display = 'none';
  }
});

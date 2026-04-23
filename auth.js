// =========================================
// DigiMaster — Firebase Auth
// =========================================

const firebaseConfig = {
  apiKey: "AIzaSyB7WFaELI6h349TnHRbGXLDpQsUPrXUtio",
  authDomain: "digimaster-evolua-a57f0.firebaseapp.com",
  projectId: "digimaster-evolua-a57f0",
  storageBucket: "digimaster-evolua-a57f0.firebasestorage.app",
  messagingSenderId: "536548803200",
  appId: "1:536548803200:web:6c1e09bb82f74ceb641c65"
};

firebase.initializeApp(firebaseConfig);
const auth     = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// ---- Login ----
function loginWithGoogle() {
  const btn = document.getElementById('loginBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #ccc;border-top-color:#333;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px"></span> Entrando...';
  }
  auth.signInWithPopup(provider).catch(err => {
    console.error('Erro no login:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" style="vertical-align:middle;margin-right:10px"/> Entrar com Google';
    }
  });
}

// ---- Logout ----
function logout() {
  auth.signOut();
}

// ---- Observer ----
auth.onAuthStateChanged(user => {
  const loginScreen  = document.getElementById('loginScreen');
  const appContainer = document.getElementById('appContainer');
  const headerUser   = document.getElementById('headerUser');
  const headerAvatar = document.getElementById('headerAvatar');
  const headerName   = document.getElementById('headerName');

  if (user) {
    if (loginScreen)  loginScreen.style.display  = 'none';
    if (appContainer) appContainer.style.display = 'block';
    if (headerUser)   headerUser.style.display   = 'flex';
    if (headerAvatar && user.photoURL) headerAvatar.src = user.photoURL;
    if (headerName)   headerName.textContent = (user.displayName || 'Usuário').split(' ')[0];
  } else {
    if (loginScreen)  loginScreen.style.display  = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    if (headerUser)   headerUser.style.display   = 'none';
  }
});

// =========================================
// DigiMaster — Firebase Auth (Google Login)
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
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// ---- Login ----
function loginWithGoogle() {
  const btn = document.getElementById('btnGoogleLogin');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
  auth.signInWithPopup(provider).catch((err) => {
    console.error('Erro login:', err);
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  });
}

// ---- Logout ----
function logout() {
  auth.signOut();
}

// ---- Estado do usuário ----
auth.onAuthStateChanged((user) => {
  const btnLogin  = document.getElementById('btnGoogleLogin');
  const headerUser   = document.getElementById('headerUser');
  const headerAvatar = document.getElementById('headerAvatar');
  const headerName   = document.getElementById('headerName');

  if (user) {
    if (btnLogin)    btnLogin.style.display    = 'none';
    if (headerUser)  headerUser.style.display  = 'flex';
    if (headerAvatar) headerAvatar.src = user.photoURL || '';
    if (headerName)  headerName.textContent = user.displayName
      ? user.displayName.split(' ')[0] : 'Usuário';
  } else {
    if (btnLogin)   btnLogin.style.display   = 'flex';
    if (headerUser) headerUser.style.display = 'none';
  }
});

// =========================================
// DigiMaster - Firebase Auth + Firestore v4.1
// Evolua+ Profissões
// Progresso por nível + limpeza segura no logoff
// =========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';


// =========================================
// FIREBASE
// =========================================

const firebaseConfig = {
  apiKey: 'AIzaSyB7WFaELI6h349TnHRbGXLDpQsUPrXUtio',
  authDomain: 'digimaster-evolua-a57f0.firebaseapp.com',
  projectId: 'digimaster-evolua-a57f0',
  storageBucket: 'digimaster-evolua-a57f0.firebasestorage.app',
  messagingSenderId: '536548803200',
  appId: '1:536548803200:web:6c1e09bb82f74ceb641c65'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window._firestoreDb = db;

window._firestoreLib = {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp
};

window.currentUser = null;
window.isDigimasterAdmin = false;


// =========================================
// CONFIGURAÇÕES
// =========================================

const ADMIN_EMAILS = [
  'evoluamaisprofissoes@gmail.com'
];

const MIN_ACCURACY = Number(
  window.DIGIMASTER_MIN_ACCURACY || 80
);


// =========================================
// LIMPEZA SEGURA DO PAINEL ADMIN
// =========================================

function resetAdminState(clearData = true) {

  if (
    typeof window.resetAdminPanelState ===
    'function'
  ) {

    window.resetAdminPanelState({
      clearData
    });

    return;
  }


  // Fallback caso ranking.js
  // ainda não tenha inicializado.

  const modal =
    document.getElementById(
      'adminDetailModal'
    );


  const content =
    document.getElementById(
      'adminDetailContent'
    );


  if (modal) {

    modal.style.display =
      'none';


    modal.setAttribute(
      'aria-hidden',
      'true'
    );

  }


  if (content) {

    content.innerHTML =
      '';

  }


  document.body
    .classList
    .remove(
      'dm-modal-open'
    );

}


// =========================================
// LIMPAR CACHE LOCAL DO USUÁRIO
// Evita que outro login veja dados da conta
// anterior antes da sincronização.
// =========================================

function clearUserLocalCache() {

  localStorage.removeItem(
    'digimaster_sessions'
  );


  localStorage.removeItem(
    'digimaster_lessons'
  );

}


// =========================================
// ADMIN
// =========================================

async function checkAdminAccess(
  user
) {

  if (!user) {

    return false;

  }


  const email =

    String(
      user.email ||
      ''
    )
      .trim()
      .toLowerCase();


  if (
    ADMIN_EMAILS.includes(
      email
    )
  ) {

    return true;

  }


  try {

    const snap =
      await getDoc(

        doc(
          db,
          'admins',
          user.uid
        )

      );


    return (

      snap.exists() &&

      snap.data()?.active !==
      false

    );

  }

  catch (error) {

    console.warn(
      'Admin check:',
      error
    );


    return false;

  }

}


// =========================================
// ESTADO DE AUTENTICAÇÃO
// =========================================

onAuthStateChanged(

  auth,

  async user => {


    // Sempre encerra qualquer ficha
    // administrativa pendurada
    // da sessão anterior.

    resetAdminState(
      true
    );


    window.currentUser =
      user;


    // =====================================
    // DESLOGADO
    // =====================================

    if (!user) {

      window.isDigimasterAdmin =
        false;


      clearUserLocalCache();


      renderLoggedOutUI();


      removeMobileSignout();


      const adminBtn =
        document.getElementById(
          'adminNavBtn'
        );


      if (adminBtn) {

        adminBtn.style.display =
          'none';

      }


      return;

    }


    // =====================================
    // LOGADO
    // =====================================

    try {


      // Remove qualquer cache
      // da conta anterior.

      clearUserLocalCache();


      await ensureUserDoc(
        user
      );


      renderUserUI(
        user
      );


      ensureMobileSignout();


      await syncFromCloud(
        user.uid
      );


      window.isDigimasterAdmin =

        await checkAdminAccess(
          user
        );


      const adminBtn =
        document.getElementById(
          'adminNavBtn'
        );


      if (adminBtn) {

        adminBtn.style.display =

          window.isDigimasterAdmin

            ? 'block'

            : 'none';

      }


      const skipHands =

        localStorage.getItem(
          'digimaster_hands_seen'
        )

        ===

        'true';


      if (

        !skipHands &&

        typeof window.showHandsModal ===
        'function'

      ) {

        setTimeout(

          () =>
            window.showHandsModal(),

          700

        );

      }

    }

    catch (error) {

      console.error(

        'Erro ao iniciar usuário:',

        error

      );

    }

  }

);


// =========================================
// CRIAR / ATUALIZAR PERFIL
// =========================================

async function ensureUserDoc(
  user
) {

  const userRef =

    doc(
      db,
      'users',
      user.uid
    );


  const userSnap =

    await getDoc(
      userRef
    );


  // =====================================
  // PRIMEIRO ACESSO
  // =====================================

  if (!userSnap.exists()) {

    await setDoc(

      userRef,

      {

        name:

          user.displayName ||

          'Aluno',

        email:

          user.email ||

          '',

        photoURL:

          user.photoURL ||

          null,

        createdAt:
          serverTimestamp(),

        totalSessions:
          0,

        bestWpm:
          0,

        bestAccuracy:
          0,

        completedLessons:
          0,

        levelProgress:
          {},

        levelCompletions:
          {}

      }

    );


    return;

  }


  // =====================================
  // ATUALIZAR PERFIL
  // =====================================

  const current =
    userSnap.data() ||
    {};


  const patch =
    {};


  if (

    user.displayName &&

    current.name !==
      user.displayName

  ) {

    patch.name =
      user.displayName;

  }


  if (

    user.email &&

    current.email !==
      user.email

  ) {

    patch.email =
      user.email;

  }


  if (

    user.photoURL &&

    current.photoURL !==
      user.photoURL

  ) {

    patch.photoURL =
      user.photoURL;

  }


  if (
    Object.keys(
      patch
    ).length
  ) {

    await updateDoc(

      userRef,

      patch

    );

  }

}


// =========================================
// LOGIN GOOGLE
// =========================================

window.signInWithGoogle =
async function () {

  try {

    resetAdminState(
      true
    );


    showAuthLoading(
      true
    );


    await signInWithPopup(

      auth,

      provider

    );


    window
      .closeAuthModal
      ?.();

  }

  catch (error) {

    console.error(
      error
    );


    showAuthError(

      'Erro ao entrar com Google. Tente novamente.'

    );

  }

  finally {

    showAuthLoading(
      false
    );

  }

};


// =========================================
// LOGIN E-MAIL
// =========================================

window.signInWithEmail =
async function () {

  const email =

    document
      .getElementById(
        'authEmail'
      )
      ?.value
      ?.trim();


  const password =

    document
      .getElementById(
        'authPass'
      )
      ?.value;


  if (
    !email ||
    !password
  ) {

    showAuthError(

      'Preencha e-mail e senha.'

    );


    return;

  }


  try {

    resetAdminState(
      true
    );


    showAuthLoading(
      true
    );


    await signInWithEmailAndPassword(

      auth,

      email,

      password

    );


    window
      .closeAuthModal
      ?.();

  }

  catch (error) {

    console.error(
      error
    );


    showAuthError(

      (
        error.code ===
          'auth/user-not-found'

        ||

        error.code ===
          'auth/invalid-credential'
      )

        ?

        'E-mail ou senha incorretos.'

        :

        'Erro ao entrar. Verifique seus dados.'

    );

  }

  finally {

    showAuthLoading(
      false
    );

  }

};


// =========================================
// CADASTRO
// =========================================

window.signUpWithEmail =
async function () {

  const name =

    document
      .getElementById(
        'authName'
      )
      ?.value
      ?.trim();


  const email =

    document
      .getElementById(
        'authEmailSignup'
      )
      ?.value
      ?.trim()

    ||

    document
      .getElementById(
        'authEmail'
      )
      ?.value
      ?.trim();


  const password =

    document
      .getElementById(
        'authPassSignup'
      )
      ?.value

    ||

    document
      .getElementById(
        'authPass'
      )
      ?.value;


  if (

    !name ||

    !email ||

    !password

  ) {

    showAuthError(

      'Preencha todos os campos.'

    );


    return;

  }


  if (
    password.length <
    6
  ) {

    showAuthError(

      'A senha precisa ter pelo menos 6 caracteres.'

    );


    return;

  }


  try {

    resetAdminState(
      true
    );


    showAuthLoading(
      true
    );


    const credential =

      await createUserWithEmailAndPassword(

        auth,

        email,

        password

      );


    await updateProfile(

      credential.user,

      {
        displayName:
          name
      }

    );


    await setDoc(

      doc(

        db,

        'users',

        credential.user.uid

      ),

      {

        name,

        email,

        photoURL:

          credential.user
            .photoURL

          ||

          null,

        createdAt:
          serverTimestamp(),

        totalSessions:
          0,

        bestWpm:
          0,

        bestAccuracy:
          0,

        completedLessons:
          0,

        levelProgress:
          {},

        levelCompletions:
          {}

      },

      {
        merge:
          true
      }

    );


    window
      .closeAuthModal
      ?.();

  }

  catch (error) {

    console.error(
      error
    );


    showAuthError(

      error.code ===
        'auth/email-already-in-use'

        ?

        'E-mail já cadastrado. Faça login.'

        :

        'Erro ao criar conta. Tente novamente.'

    );

  }

  finally {

    showAuthLoading(
      false
    );

  }

};


// =========================================
// LOGOFF
// =========================================

window.doSignOut =
async function () {

  try {


    // Fecha a ficha imediatamente,
    // antes mesmo de esperar o Firebase.

    resetAdminState(
      true
    );


    // Remove dados locais associados
    // ao usuário atual.

    clearUserLocalCache();


    await signOut(
      auth
    );


    window.currentUser =
      null;


    window.isDigimasterAdmin =
      false;


    const adminBtn =
      document.getElementById(
        'adminNavBtn'
      );


    if (adminBtn) {

      adminBtn.style.display =
        'none';

    }


    if (
      typeof window.navigateTo ===
      'function'
    ) {

      window.navigateTo(
        'home'
      );

    }


    window
      .showToast
      ?.(
        '👋 Até logo!'
      );

  }

  catch (error) {

    console.error(

      'Erro no logoff:',

      error

    );

  }

};


// =========================================
// SALVAR SESSÃO
// =========================================

window.saveSessionCloud =
async function (
  data
) {

  if (
    !window.currentUser
  ) {

    return;

  }


  const uid =
    window.currentUser.uid;


  const mode =

    document
      .getElementById(
        'modeSelect'
      )
      ?.value

    ||

    'words';


  const duration =

    Number(

      document
        .getElementById(
          'durationSelect'
        )
        ?.value

      ||

      60

    );


  try {

    await addDoc(

      collection(

        db,

        'users',

        uid,

        'sessions'

      ),

      {

        ...data,

        mode,

        duration,

        timestamp:
          serverTimestamp()

      }

    );


    const userRef =

      doc(

        db,

        'users',

        uid

      );


    const snap =
      await getDoc(
        userRef
      );


    const userData =
      snap.data() ||
      {};


    await updateDoc(

      userRef,

      {

        totalSessions:

          Number(
            userData
              .totalSessions ||
            0
          )

          +

          1,


        bestWpm:

          Math.max(

            Number(
              userData
                .bestWpm ||
              0
            ),

            Number(
              data.wpm ||
              0
            )

          ),


        bestAccuracy:

          Math.max(

            Number(
              userData
                .bestAccuracy ||
              0
            ),

            Number(
              data.accuracy ||
              0
            )

          ),


        lastSession:
          serverTimestamp(),


        lastMode:
          mode,


        lastDuration:
          duration

      }

    );

  }

  catch (error) {

    console.warn(

      'Falha ao salvar sessão na nuvem:',

      error

    );

  }

};


// =========================================
// IDENTIFICAR NÍVEL DA LIÇÃO
// =========================================

function lessonLevelFromId(
  lessonId
) {

  const prefix =

    String(
      lessonId ||
      ''
    )
      .charAt(0)
      .toLowerCase();


  return (

    {

      b:
        'basico',

      i:
        'intermediario',

      a:
        'avancado',

      n:
        'numeros'

    }

  )[prefix]

  ||

  null;

}


// =========================================
// CONVERTER DATA / TIMESTAMP
// =========================================

function timestampMillis(
  value
) {

  if (!value) {

    return 0;

  }


  if (
    typeof value.toMillis ===
    'function'
  ) {

    return value.toMillis();

  }


  if (
    typeof value.toDate ===
    'function'
  ) {

    return value
      .toDate()
      .getTime();

  }


  const date =
    new Date(
      value
    );


  return Number.isNaN(
    date.getTime()
  )

    ?

    0

    :

    date.getTime();

}


// =========================================
// ATUALIZAR PROGRESSO DOS NÍVEIS
// =========================================

async function refreshLevelSummary(
  uid,
  currentLessonId
) {

  const config =

    window
      .DIGIMASTER_LEVEL_CONFIG

    ||

    {};


  const userRef =

    doc(

      db,

      'users',

      uid

    );


  const userSnap =

    await getDoc(
      userRef
    );


  const userData =

    userSnap.data()

    ||

    {};


  const previousCompletions =

    userData
      .levelCompletions

    ||

    {};


  const newCompletions = {

    ...previousCompletions

  };


  const levelProgress =
    {};


  const newlyCompleted =
    [];


  const lessonsSnap =

    await getDocs(

      collection(

        db,

        'users',

        uid,

        'lessons'

      )

    );


  const lessonRecords =
    [];


  lessonsSnap.forEach(

    item => {

      lessonRecords.push({

        id:
          item.id,

        ...item.data()

      });

    }

  );


  for (

    const [
      levelKey,
      level
    ]

    of

    Object.entries(
      config
    )

  ) {


    const ids =

      new Set(

        level.ids ||
        []

      );


    const passed =

      lessonRecords.filter(

        item =>

          ids.has(

            item.lessonId

            ||

            item.id

          )

          &&

          Number(
            item.accuracy ||
            0
          )

          >=

          MIN_ACCURACY

      );


    const total =

      Number(

        level.total

        ||

        ids.size

        ||

        0

      );


    const completed =
      passed.length;


    const isComplete =

      total > 0

      &&

      completed >=
      total;


    const percent =

      total

        ?

        Math.min(

          100,

          Math.round(

            completed /
            total *
            100

          )

        )

        :

        0;


    levelProgress[
      levelKey
    ] = {

      completed,

      total,

      percent,

      isComplete

    };


    // PRIMEIRA CONCLUSÃO DO NÍVEL

    if (

      isComplete

      &&

      !previousCompletions[
        levelKey
      ]?.completedAt

    ) {


      let latestRecord =
        null;


      let latestMs =
        0;


      for (
        const item
        of passed
      ) {

        const candidate =

          item.firstCompletedAt

          ||

          item.completedAt;


        const ms =

          timestampMillis(
            candidate
          );


        if (
          ms >= latestMs
        ) {

          latestMs =
            ms;


          latestRecord =
            candidate;

        }

      }


      newCompletions[
        levelKey
      ] = {

        completed:
          true,


        completedAt:

          latestRecord

          ||

          serverTimestamp(),


        totalLessons:
          total,


        minAccuracy:
          MIN_ACCURACY

      };


      newlyCompleted.push(
        levelKey
      );

    }

  }


  const totalCompletedLessons =

    lessonRecords.filter(

      item =>

        Number(
          item.accuracy ||
          0
        )

        >=

        MIN_ACCURACY

    ).length;


  await setDoc(

    userRef,

    {

      completedLessons:
        totalCompletedLessons,


      lastLesson:
        currentLessonId,


      lastLessonAt:
        serverTimestamp(),


      levelProgress,


      levelCompletions:
        newCompletions

    },

    {
      merge:
        true
    }

  );


  if (
    newlyCompleted.length
  ) {

    const labels =

      newlyCompleted
        .map(

          key =>

            config[key]
              ?.title

            ||

            key

        )
        .join(
          ', '
        );


    window
      .showToast
      ?.(
        `🎓 Nível concluído: ${labels}! Certificação liberada.`
      );

  }

}


// =========================================
// SALVAR LIÇÃO
// =========================================

window.saveLessonCloud =
async function (
  lessonId,
  wpm,
  accuracy
) {

  if (
    !window.currentUser
  ) {

    return;

  }


  if (

    Number(
      accuracy ||
      0
    )

    <

    MIN_ACCURACY

  ) {

    return;

  }


  const uid =
    window.currentUser.uid;


  const level =

    lessonLevelFromId(
      lessonId
    );


  try {

    const lessonRef =

      doc(

        db,

        'users',

        uid,

        'lessons',

        lessonId

      );


    const snap =

      await getDoc(
        lessonRef
      );


    const previous =

      snap.exists()

        ?

        snap.data()

        :

        null;


    // PRIMEIRA CONCLUSÃO

    if (!previous) {

      await setDoc(

        lessonRef,

        {

          lessonId,

          level,


          wpm:

            Number(
              wpm ||
              0
            ),


          accuracy:

            Number(
              accuracy ||
              0
            ),


          completedAt:
            serverTimestamp(),


          firstCompletedAt:
            serverTimestamp(),


          updatedAt:
            serverTimestamp()

        }

      );

    }


    // REPETIÇÃO

    else {

      await setDoc(

        lessonRef,

        {

          lessonId,


          level:

            previous.level

            ||

            level,


          wpm:

            Math.max(

              Number(
                previous.wpm ||
                0
              ),

              Number(
                wpm ||
                0
              )

            ),


          accuracy:

            Math.max(

              Number(
                previous.accuracy ||
                0
              ),

              Number(
                accuracy ||
                0
              )

            ),


          completedAt:

            previous.completedAt

            ||

            previous.firstCompletedAt

            ||

            serverTimestamp(),


          firstCompletedAt:

            previous.firstCompletedAt

            ||

            previous.completedAt

            ||

            serverTimestamp(),


          updatedAt:
            serverTimestamp()

        },

        {
          merge:
            true
        }

      );

    }


    await refreshLevelSummary(

      uid,

      lessonId

    );

  }

  catch (error) {

    console.warn(

      'Falha ao salvar lição na nuvem:',

      error

    );

  }

};


// =========================================
// SINCRONIZAR NUVEM
// =========================================

async function syncFromCloud(
  uid
) {

  try {


    // =====================================
    // SESSÕES
    // =====================================

    const sessionSnap =

      await getDocs(

        query(

          collection(

            db,

            'users',

            uid,

            'sessions'

          ),

          orderBy(
            'timestamp',
            'desc'
          ),

          limit(
            200
          )

        )

      );


    const sessions =
      [];


    sessionSnap.forEach(

      item => {

        const data =
          item.data();


        sessions.push({

          wpm:
            data.wpm,


          accuracy:
            data.accuracy,


          errors:
            data.errors,


          words:
            data.words,


          level:
            data.level,


          mode:
            data.mode,


          duration:
            data.duration,


          date:

            data.timestamp
              ?.toDate
              ?.()
              ?.toISOString()

            ||

            new Date()
              .toISOString()

        });

      }

    );


    localStorage.setItem(

      'digimaster_sessions',

      JSON.stringify(

        sessions.reverse()

      )

    );


    // =====================================
    // LIÇÕES
    // =====================================

    const lessonSnap =

      await getDocs(

        collection(

          db,

          'users',

          uid,

          'lessons'

        )

      );


    const lessonsProgress =
      {};


    lessonSnap.forEach(

      item => {

        const data =
          item.data();


        const first =

          data.firstCompletedAt

          ||

          data.completedAt;


        lessonsProgress[

          data.lessonId

          ||

          item.id

        ] = {


          completed:

            Number(
              data.accuracy ||
              0
            )

            >=

            MIN_ACCURACY,


          wpm:
            data.wpm,


          accuracy:
            data.accuracy,


          date:

            first
              ?.toDate
              ?.()
              ?.toISOString()

            ||

            new Date()
              .toISOString(),


          firstCompletedAt:

            first
              ?.toDate
              ?.()
              ?.toISOString()

            ||

            null

        };

      }

    );


    localStorage.setItem(

      'digimaster_lessons',

      JSON.stringify(
        lessonsProgress
      )

    );


    window
      .renderStats
      ?.();


    window
      .renderLessons
      ?.();


    window
      .updateCertificateUI
      ?.();

  }

  catch (error) {

    console.warn(

      'Falha na sincronização:',

      error

    );

  }

}


// =========================================
// PROTEÇÃO HTML
// =========================================

function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )

    .replaceAll(
      '&',
      '&amp;'
    )

    .replaceAll(
      '<',
      '&lt;'
    )

    .replaceAll(
      '>',
      '&gt;'
    )

    .replaceAll(
      '"',
      '&quot;'
    )

    .replaceAll(
      "'",
      '&#039;'
    );

}


// =========================================
// INTERFACE LOGADO
// =========================================

function renderUserUI(
  user
) {

  const area =

    document.getElementById(
      'authArea'
    );


  if (!area) {

    return;

  }


  const name =

    user.displayName

    ||

    user.email

    ||

    'Aluno';


  const initial =

    escapeHtml(

      name
        .charAt(0)
        .toUpperCase()

    );


  const photo =

    user.photoURL

      ?

      `

        <img
          src="${escapeHtml(
            user.photoURL
          )}"
          class="user-avatar"
          alt="Perfil"
        >

      `

      :

      `

        <div
          class="user-avatar-placeholder"
        >
          ${initial}
        </div>

      `;


  area.innerHTML = `

    <div class="user-chip">

      ${photo}

      <span class="user-name">

        ${escapeHtml(
          name
        )}

      </span>

      <button
        class="btn-signout"
        type="button"
        onclick="doSignOut()"
      >
        Sair
      </button>

    </div>

  `;

}


// =========================================
// INTERFACE DESLOGADO
// =========================================

function renderLoggedOutUI() {

  const area =

    document.getElementById(
      'authArea'
    );


  if (!area) {

    return;

  }


  area.innerHTML = `

    <button
      class="btn-login"
      type="button"
      onclick="openAuthModal('login')"
    >
      Entrar / Cadastrar
    </button>

  `;

}


// =========================================
// LOGOFF MOBILE
// =========================================

function ensureMobileSignout() {

  const header =

    document.querySelector(
      '.header-inner'
    );


  if (

    !header ||

    document.getElementById(
      'dmMobileSignout'
    )

  ) {

    return;

  }


  const button =

    document.createElement(
      'button'
    );


  button.id =
    'dmMobileSignout';


  button.className =
    'dm-mobile-signout';


  button.type =
    'button';


  button.textContent =
    '↪ Sair';


  button.addEventListener(

    'click',

    () =>
      window.doSignOut()

  );


  header.appendChild(
    button
  );

}


function removeMobileSignout() {

  document
    .getElementById(
      'dmMobileSignout'
    )
    ?.remove();

}


// =========================================
// MODAL LOGIN
// =========================================

window.openAuthModal =
function (
  mode = 'login'
) {

  resetAdminState(
    false
  );


  const modal =

    document.getElementById(
      'authModal'
    );


  if (!modal) {

    return;

  }


  modal.classList.add(
    'open'
  );


  window.switchAuthMode(
    mode
  );

};


window.closeAuthModal =
function () {

  document
    .getElementById(
      'authModal'
    )
    ?.classList
    .remove(
      'open'
    );


  clearAuthError();

};


window.switchAuthMode =
function (
  mode
) {

  const loginPanel =

    document.getElementById(
      'loginPanel'
    );


  const signupPanel =

    document.getElementById(
      'signupPanel'
    );


  const tabLogin =

    document.getElementById(
      'tabLogin'
    );


  const tabSignup =

    document.getElementById(
      'tabSignup'
    );


  const isLogin =

    mode ===
    'login';


  if (loginPanel) {

    loginPanel.style.display =

      isLogin

        ? 'flex'

        : 'none';

  }


  if (signupPanel) {

    signupPanel.style.display =

      isLogin

        ? 'none'

        : 'flex';

  }


  tabLogin
    ?.classList
    .toggle(
      'active',
      isLogin
    );


  tabSignup
    ?.classList
    .toggle(
      'active',
      !isLogin
    );


  clearAuthError();

};


// =========================================
// ERROS LOGIN
// =========================================

function showAuthError(
  message
) {

  document
    .querySelectorAll(
      '.auth-error'
    )
    .forEach(

      element => {

        element.textContent =
          message;


        element.style.display =
          'block';

      }

    );

}


function clearAuthError() {

  document
    .querySelectorAll(
      '.auth-error'
    )
    .forEach(

      element => {

        element.textContent =
          '';


        element.style.display =
          'none';

      }

    );

}


function showAuthLoading(
  loading
) {

  document
    .querySelectorAll(
      '.auth-submit-btn'
    )
    .forEach(

      button => {

        button.disabled =
          loading;


        button.style.opacity =

          loading

            ? '.6'

            : '1';

      }

    );

}


// =========================================
// PALAVRAS EXTRAS
// =========================================

const EXTRA_WORDS = {

  basico: [

    'casa mesa sala porta janela livro pasta tecla mouse tela aluno curso aula escola treino ritmo foco pratica evolua',

    'arquivo pasta login senha dados rede nuvem email texto fonte pagina bloco curso aluno prova nota aula tarefa',

    'atender vender falar ouvir ajudar cliente caixa estoque loja pedido prazo valor troco conta ficha nome telefone'

  ],


  intermediario: [

    'cliente proposta orçamento contrato relatório reunião agenda planilha cadastro atendimento processo resultado equipe tarefa prazo meta análise desempenho',

    'computador teclado monitor impressora sistema aplicativo navegador arquivo backup segurança senha autenticação internet rede servidor nuvem produtividade',

    'administração financeiro marketing vendas recursos humanos logística estoque compras atendimento planejamento organização comunicação liderança qualidade'

  ],


  avancado: [

    'automação inteligência artificial análise de dados cibersegurança computação em nuvem desenvolvimento integração algoritmo infraestrutura governança produtividade transformação digital',

    'planejamento estratégico indicadores de desempenho experiência do cliente gestão de projetos melhoria contínua tomada de decisão comunicação corporativa liderança colaboração inovação',

    'banco de dados arquitetura de software interface programação protocolo autenticação criptografia virtualização escalabilidade disponibilidade observabilidade manutenção implantação'

  ],


  numeros: [

    '10 20 30 40 50 60 70 80 90 100 125 250 375 500 750 1000 1500 2500 5000 10000',

    'R$ 19,90 R$ 49,90 R$ 99,00 R$ 149,90 R$ 299,00 R$ 799,90 R$ 1.500,00 R$ 2.750,50',

    '(65) 99999-1234 (11) 98888-5678 78280-000 78305-000 01/08/2026 10/08/2026 31/12/2026'

  ]

};


// =========================================
// TEXTOS EXTRAS
// =========================================

const EXTRA_TEXTS = {

  basico: [

    'A prática de digitação melhora quando o aluno mantém um ritmo calmo e constante. O mais importante no início é usar os dedos corretos, evitar olhar para o teclado e reduzir os erros a cada tentativa.',

    'No ambiente de trabalho, digitar bem ajuda em tarefas como preencher cadastros, escrever mensagens, registrar pedidos e organizar informações.',

    'Treinar todos os dias por pouco tempo ajuda o cérebro e as mãos a memorizar os movimentos. Aos poucos, a digitação se torna mais natural.'

  ],


  intermediario: [

    'A produtividade no trabalho depende de pequenas habilidades que se somam ao longo do dia. Digitar com velocidade e precisão reduz o tempo gasto em e-mails, relatórios, sistemas e cadastros.',

    'Organização digital é uma competência importante. Criar nomes claros para arquivos, manter pastas estruturadas e fazer cópias de segurança reduz perdas de tempo.',

    'Um bom atendimento exige ouvir, registrar corretamente os dados, entender a necessidade e comunicar a solução de maneira clara.'

  ],


  avancado: [

    'A transformação digital exige mudança de processos, integração de informações, capacitação das pessoas e decisões baseadas em dados.',

    'A inteligência artificial amplia a capacidade de automatizar tarefas e analisar informações, enquanto pensamento crítico e responsabilidade continuam essenciais.',

    'Cibersegurança depende tanto de tecnologia quanto de comportamento. Senhas fortes, atualizações e atenção a mensagens suspeitas reduzem riscos.'

  ],


  numeros: [

    'Relatório 08/2026. Foram registrados 125 atendimentos, 47 vendas e faturamento de R$ 18.745,90. A meta mensal é de R$ 25.000,00.',

    'Pedido 45821. Cliente 00374. Quantidade 18 unidades. Valor unitário R$ 49,90. Subtotal R$ 898,20. Desconto 10%. Total R$ 808,38.',

    'Cadastro: telefone (65) 99999-1234, CEP 78305-000, protocolo 202608104587, atendimento iniciado às 14:35 e finalizado às 15:12.'

  ]

};


// =========================================
// ITEM ALEATÓRIO
// =========================================

function randomFrom(
  list
) {

  return list[

    Math.floor(

      Math.random() *

      list.length

    )

  ];

}


// =========================================
// TEXTO PERSONALIZADO
// =========================================

function updateCustomTextVisibility() {

  const panel =

    document.getElementById(
      'customTextPanel'
    );


  const mode =

    document
      .getElementById(
        'modeSelect'
      )
      ?.value;


  if (panel) {

    panel.style.display =

      mode ===
      'custom'

        ? 'block'

        : 'none';

  }

}


// =========================================
// MELHORIAS DA PRÁTICA
// =========================================

function installPracticeEnhancements() {

  const durationSelect =

    document.getElementById(
      'durationSelect'
    );


  const modeSelect =

    document.getElementById(
      'modeSelect'
    );


  const controls =

    document.querySelector(
      '.practice-controls'
    );


  // =====================================
  // NOVOS TEMPOS
  // =====================================

  if (
    durationSelect
  ) {

    [

      [
        '180',
        '3min'
      ],

      [
        '300',
        '5min'
      ],

      [
        '600',
        '10min'
      ],

      [
        '900',
        '15min'
      ]

    ].forEach(

      (
        [
          value,
          label
        ]
      ) => {

        if (

          !durationSelect
            .querySelector(

              `option[value="${value}"]`

            )

        ) {

          const option =

            document.createElement(
              'option'
            );


          option.value =
            value;


          option.textContent =
            label;


          durationSelect
            .appendChild(
              option
            );

        }

      }

    );

  }


  // =====================================
  // MODO PERSONALIZADO
  // =====================================

  if (

    modeSelect &&

    !modeSelect
      .querySelector(
        'option[value="custom"]'
      )

  ) {

    const option =

      document.createElement(
        'option'
      );


    option.value =
      'custom';


    option.textContent =
      'Texto personalizado';


    modeSelect.appendChild(
      option
    );

  }


  // =====================================
  // CAMPO DO TEXTO PERSONALIZADO
  // =====================================

  if (

    controls &&

    !document.getElementById(
      'customTextPanel'
    )

  ) {

    const panel =

      document.createElement(
        'div'
      );


    panel.id =
      'customTextPanel';


    panel.className =
      'custom-text-panel';


    panel.innerHTML = `

      <div class="custom-text-head">

        <div>

          <strong>
            📝 Texto personalizado
          </strong>

          <span>
            Cole qualquer conteúdo para praticar.
          </span>

        </div>

        <span id="customTextCount">
          0 caracteres
        </span>

      </div>


      <textarea
        id="customPracticeText"
        maxlength="12000"
        placeholder="Cole ou digite aqui o texto para praticar..."
      ></textarea>


      <div class="custom-text-actions">

        <span>
          O texto fica salvo neste navegador.
        </span>

        <button
          type="button"
          class="btn-secondary"
          id="customApplyBtn"
        >
          Aplicar texto
        </button>

      </div>

    `;


    controls.insertAdjacentElement(

      'afterend',

      panel

    );


    const textarea =

      panel.querySelector(
        '#customPracticeText'
      );


    const count =

      panel.querySelector(
        '#customTextCount'
      );


    if (
      textarea
    ) {

      textarea.value =

        localStorage.getItem(
          'digimaster_custom_text'
        )

        ||

        '';


      if (
        count
      ) {

        count.textContent =

          `${textarea.value.length} caracteres`;

      }


      textarea.addEventListener(

        'input',

        () => {

          localStorage.setItem(

            'digimaster_custom_text',

            textarea.value

          );


          if (
            count
          ) {

            count.textContent =

              `${textarea.value.length} caracteres`;

          }

        }

      );

    }


    panel
      .querySelector(
        '#customApplyBtn'
      )
      ?.addEventListener(

        'click',

        () => {

          if (

            !textarea
              ?.value
              .trim()

          ) {

            window
              .showToast
              ?.(
                '⚠️ Digite ou cole um texto primeiro.'
              );


            return;

          }


          if (
            modeSelect
          ) {

            modeSelect.value =
              'custom';

          }


          updateCustomTextVisibility();


          window
            .changeMode
            ?.();


          window
            .showToast
            ?.(
              '📝 Texto personalizado aplicado!'
            );

        }

      );

  }


  modeSelect
    ?.addEventListener(

      'change',

      updateCustomTextVisibility

    );


  updateCustomTextVisibility();


  // =====================================
  // CONTROLAR TEXTOS
  // =====================================

  const originalGetRandomText =

    window.getRandomText;


  if (

    typeof originalGetRandomText ===
      'function'

    &&

    !window
      .__digimasterTextModeInstalled

  ) {

    window
      .__digimasterTextModeInstalled =
      true;


    window.getRandomText =

      function (
        level
      ) {

        const mode =

          document
            .getElementById(
              'modeSelect'
            )
            ?.value

          ||

          'words';


        const safeLevel =

          EXTRA_TEXTS[
            level
          ]

            ? level

            : 'intermediario';


        // PERSONALIZADO

        if (
          mode ===
          'custom'
        ) {

          const clean =

            (

              document
                .getElementById(
                  'customPracticeText'
                )
                ?.value

              ||

              ''

            )

              .replace(
                /\s+/g,
                ' '
              )

              .trim();


          return (

            clean

            ||

            originalGetRandomText(
              level
            )

          );

        }


        // TEXTO

        if (
          mode ===
          'text'
        ) {

          return randomFrom(

            EXTRA_TEXTS[
              safeLevel
            ]

          );

        }


        // TEMPO LIVRE

        if (
          mode ===
          'time'
        ) {

          const pool =

            EXTRA_TEXTS[
              safeLevel
            ];


          return [

            randomFrom(
              pool
            ),

            randomFrom(
              pool
            ),

            randomFrom(
              pool
            )

          ].join(
            ' '
          );

        }


        // PALAVRAS

        if (

          mode ===
            'words'

          &&

          EXTRA_WORDS[
            safeLevel
          ]

          &&

          Math.random() <
          0.7

        ) {

          return randomFrom(

            EXTRA_WORDS[
              safeLevel
            ]

          );

        }


        return originalGetRandomText(
          level
        );

      };

  }

}


// =========================================
// ESTILOS EXTRAS
// =========================================

function injectStyles() {

  if (

    document.getElementById(
      'digimasterFirebaseStyles'
    )

  ) {

    return;

  }


  const style =

    document.createElement(
      'style'
    );


  style.id =
    'digimasterFirebaseStyles';


  style.textContent = `

    .dm-mobile-signout{

      display:none;

      background:
        rgba(255,45,120,.08);

      border:
        1px solid
        rgba(255,45,120,.35);

      color:
        var(--wrong);

      font-family:
        var(--font-ui);

      font-weight:
        700;

      padding:
        7px 12px;

      border-radius:
        8px;

      cursor:
        pointer;

      white-space:
        nowrap;

    }


    .custom-text-panel{

      display:none;

      background:
        var(--bg2);

      border:
        1px solid
        var(--border);

      border-radius:
        14px;

      padding:
        18px;

      margin:
        0 0 18px;

    }


    .custom-text-head,
    .custom-text-actions{

      display:flex;

      align-items:center;

      justify-content:
        space-between;

      gap:
        12px;

      flex-wrap:
        wrap;

    }


    .custom-text-head > div{

      display:flex;

      flex-direction:
        column;

      gap:
        3px;

    }


    .custom-text-head strong{

      font-family:
        var(--font-ui);

      font-size:
        15px;

    }


    .custom-text-head span,
    .custom-text-actions span{

      font-size:
        12px;

      color:
        var(--text3);

    }


    #customPracticeText{

      width:
        100%;

      min-height:
        130px;

      margin:
        12px 0;

      background:
        var(--bg3);

      border:
        1px solid
        var(--border);

      color:
        var(--text);

      border-radius:
        10px;

      padding:
        14px;

      resize:
        vertical;

      font-family:
        var(--font-body);

      line-height:
        1.6;

      outline:
        none;

    }


    #customPracticeText:focus{

      border-color:
        var(--accent);

      box-shadow:
        0 0 14px
        rgba(0,207,255,.12);

    }


    @media(
      max-width:
      768px
    ){

      #authArea{

        display:
          none !important;

      }


      .dm-mobile-signout{

        display:
          inline-flex;

        align-items:
          center;

        justify-content:
          center;

      }


      .header-inner{

        gap:
          8px;

        padding:
          0 12px;

      }


      .nav-tabs{

        overflow-x:
          auto;

        max-width:
          100%;

        scrollbar-width:
          none;

      }


      .nav-tabs::-webkit-scrollbar{

        display:
          none;

      }

    }

  `;


  document.head
    .appendChild(
      style
    );

}


// =========================================
// INICIALIZAÇÃO
// =========================================

function initEnhancements() {

  injectStyles();


  installPracticeEnhancements();

}


if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(

    'DOMContentLoaded',

    initEnhancements

  );

}

else {

  initEnhancements();

}

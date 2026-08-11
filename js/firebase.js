// =========================================
// DigiMaster - Firebase Auth + Firestore v3.1
// Evolua+ Profissoes
// =========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

  apiKey: "AIzaSyB7WFaELI6h349TnHRbGXLDpQsUPrXUtio",

  authDomain:
    "digimaster-evolua-a57f0.firebaseapp.com",

  projectId:
    "digimaster-evolua-a57f0",

  storageBucket:
    "digimaster-evolua-a57f0.firebasestorage.app",

  messagingSenderId:
    "536548803200",

  appId:
    "1:536548803200:web:6c1e09bb82f74ceb641c65"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// =========================================
// COMPARTILHAR FIRESTORE COM OUTROS SCRIPTS
// =========================================

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
// ADMINISTRADORES
// =========================================

const ADMIN_EMAILS = [

  "evoluamaisprofissoes@gmail.com"

];


const CORPORATE_ADMIN_DOMAIN =
  "@evoluaprofissoes.com.br";


// =========================================
// VERIFICAR ADMINISTRADOR
// =========================================

async function checkAdminAccess(user) {

  if (!user) return false;


  const email = String(
    user.email || ""
  )
    .trim()
    .toLowerCase();


  const directAdmin =
    ADMIN_EMAILS.includes(email);


  const corporateAdmin =
    email.endsWith(
      CORPORATE_ADMIN_DOMAIN
    );


  // Também permite cadastrar admins
  // futuramente em:
  //
  // admins/{UID}
  //
  // active: true

  try {

    const adminSnap =
      await getDoc(
        doc(
          db,
          "admins",
          user.uid
        )
      );


    const registeredAdmin =
      adminSnap.exists() &&
      adminSnap.data()?.active !== false;


    return (
      directAdmin ||
      corporateAdmin ||
      registeredAdmin
    );

  }

  catch (error) {

    console.warn(
      "Admin check:",
      error
    );


    // Mesmo que a regra de /admins
    // ainda não esteja configurada,
    // seu Gmail continua funcionando.

    return (
      directAdmin ||
      corporateAdmin
    );

  }

}


// =========================================
// ESTADO DO LOGIN
// =========================================

onAuthStateChanged(

  auth,

  async (user) => {

    window.currentUser = user;


    // -------------------------
    // USUÁRIO DESLOGADO
    // -------------------------

    if (!user) {

      window.isDigimasterAdmin =
        false;


      renderLoggedOutUI();

      removeMobileSignout();


      const adminBtn =
        document.getElementById(
          "adminNavBtn"
        );


      if (adminBtn) {

        adminBtn.style.display =
          "none";

      }


      return;

    }


    // -------------------------
    // USUÁRIO LOGADO
    // -------------------------

    try {

      await ensureUserDoc(user);


      renderUserUI(user);


      ensureMobileSignout();


      await syncFromCloud(
        user.uid
      );


      window.isDigimasterAdmin =
        await checkAdminAccess(user);


      const adminBtn =
        document.getElementById(
          "adminNavBtn"
        );


      if (adminBtn) {

        adminBtn.style.display =
          window.isDigimasterAdmin
            ? "block"
            : "none";

      }


      const skipHands =
        localStorage.getItem(
          "digimaster_hands_seen"
        ) === "true";


      if (
        !skipHands &&
        typeof window.showHandsModal ===
          "function"
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
        "Erro ao iniciar usuário:",
        error
      );

    }

  }

);


// =========================================
// CRIAR / ATUALIZAR PERFIL DO ALUNO
// =========================================

async function ensureUserDoc(user) {

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );


  const userSnap =
    await getDoc(userRef);


  // -------------------------
  // PRIMEIRO ACESSO
  // -------------------------

  if (!userSnap.exists()) {

    await setDoc(
      userRef,
      {

        name:
          user.displayName ||
          "Aluno",

        email:
          user.email ||
          "",

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
          0

      }
    );


    return;

  }


  // -------------------------
  // ATUALIZAR DADOS
  // -------------------------

  const current =
    userSnap.data() ||
    {};


  const patch = {};


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
    Object.keys(patch)
      .length
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

      showAuthLoading(true);


      await signInWithPopup(
        auth,
        provider
      );


      window.closeAuthModal?.();

    }

    catch (error) {

      console.error(error);


      showAuthError(
        "Erro ao entrar com Google. Tente novamente."
      );

    }

    finally {

      showAuthLoading(false);

    }

  };


// =========================================
// LOGIN E-MAIL E SENHA
// =========================================

window.signInWithEmail =
  async function () {

    const email =
      document
        .getElementById(
          "authEmail"
        )
        ?.value
        ?.trim();


    const password =
      document
        .getElementById(
          "authPass"
        )
        ?.value;


    if (
      !email ||
      !password
    ) {

      showAuthError(
        "Preencha e-mail e senha."
      );

      return;

    }


    try {

      showAuthLoading(true);


      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      window.closeAuthModal?.();

    }

    catch (error) {

      console.error(error);


      if (
        error.code ===
          "auth/user-not-found" ||
        error.code ===
          "auth/invalid-credential"
      ) {

        showAuthError(
          "E-mail ou senha incorretos."
        );

      }

      else {

        showAuthError(
          "Erro ao entrar. Verifique seus dados."
        );

      }

    }

    finally {

      showAuthLoading(false);

    }

  };


// =========================================
// CRIAR CONTA
// =========================================

window.signUpWithEmail =
  async function () {

    const name =
      document
        .getElementById(
          "authName"
        )
        ?.value
        ?.trim();


    const email =
      (
        document
          .getElementById(
            "authEmailSignup"
          )
          ?.value
          ?.trim()
        ||
        document
          .getElementById(
            "authEmail"
          )
          ?.value
          ?.trim()
      );


    const password =
      (
        document
          .getElementById(
            "authPassSignup"
          )
          ?.value
        ||
        document
          .getElementById(
            "authPass"
          )
          ?.value
      );


    if (
      !name ||
      !email ||
      !password
    ) {

      showAuthError(
        "Preencha todos os campos."
      );

      return;

    }


    if (
      password.length < 6
    ) {

      showAuthError(
        "A senha precisa ter pelo menos 6 caracteres."
      );

      return;

    }


    try {

      showAuthLoading(true);


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
          "users",
          credential.user.uid
        ),

        {

          name,

          email,

          photoURL:
            credential.user
              .photoURL ||
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
            0

        },

        {
          merge:
            true
        }

      );


      window.closeAuthModal?.();

    }

    catch (error) {

      console.error(error);


      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        showAuthError(
          "E-mail já cadastrado. Faça login."
        );

      }

      else {

        showAuthError(
          "Erro ao criar conta. Tente novamente."
        );

      }

    }

    finally {

      showAuthLoading(false);

    }

  };


// =========================================
// LOGOFF
// =========================================

window.doSignOut =
  async function () {

    try {

      await signOut(auth);


      window.currentUser =
        null;


      window.isDigimasterAdmin =
        false;


      const adminBtn =
        document.getElementById(
          "adminNavBtn"
        );


      if (adminBtn) {

        adminBtn.style.display =
          "none";

      }


      if (
        typeof window.navigateTo ===
        "function"
      ) {

        window.navigateTo(
          "home"
        );

      }


      if (
        typeof window.showToast ===
        "function"
      ) {

        window.showToast(
          "👋 Até logo!"
        );

      }

    }

    catch (error) {

      console.error(
        "Erro no logoff:",
        error
      );

    }

  };


// =========================================
// SALVAR SESSÃO
// =========================================

window.saveSessionCloud =
  async function (data) {

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
          "modeSelect"
        )
        ?.value ||
      "words";


    const duration =
      Number(
        document
          .getElementById(
            "durationSelect"
          )
          ?.value ||
        60
      );


    try {

      await addDoc(

        collection(
          db,
          "users",
          uid,
          "sessions"
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
          "users",
          uid
        );


      const userSnap =
        await getDoc(
          userRef
        );


      const userData =
        userSnap.data() ||
        {};


      await updateDoc(

        userRef,

        {

          totalSessions:
            (
              userData
                .totalSessions ||
              0
            ) + 1,

          bestWpm:
            Math.max(
              userData
                .bestWpm ||
              0,
              Number(
                data.wpm ||
                0
              )
            ),

          bestAccuracy:
            Math.max(
              userData
                .bestAccuracy ||
              0,
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
        "Falha ao salvar sessão na nuvem:",
        error
      );

    }

  };


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


    const uid =
      window.currentUser.uid;


    try {

      const lessonRef =
        doc(
          db,
          "users",
          uid,
          "lessons",
          lessonId
        );


      const lessonSnap =
        await getDoc(
          lessonRef
        );


      const previous =
        lessonSnap.exists()
          ? lessonSnap.data()
          : null;


      if (
        !previous ||
        Number(
          previous.wpm ||
          0
        ) <
        Number(
          wpm ||
          0
        )
      ) {

        await setDoc(

          lessonRef,

          {

            lessonId,

            wpm,

            accuracy,

            completedAt:
              serverTimestamp()

          }

        );

      }


      const allLessons =
        await getDocs(

          collection(
            db,
            "users",
            uid,
            "lessons"
          )

        );


      await updateDoc(

        doc(
          db,
          "users",
          uid
        ),

        {

          completedLessons:
            allLessons.size,

          lastLesson:
            lessonId,

          lastLessonAt:
            serverTimestamp()

        }

      );

    }

    catch (error) {

      console.warn(
        "Falha ao salvar lição na nuvem:",
        error
      );

    }

  };


// =========================================
// SINCRONIZAR PROGRESSO
// =========================================

async function syncFromCloud(
  uid
) {

  try {

    const sessionSnap =
      await getDocs(

        query(

          collection(
            db,
            "users",
            uid,
            "sessions"
          ),

          orderBy(
            "timestamp",
            "desc"
          ),

          limit(
            200
          )

        )

      );


    const sessions = [];


    sessionSnap.forEach(
      (item) => {

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
              ?.toDate?.()
              ?.toISOString()
            ||
            new Date()
              .toISOString()

        });

      }
    );


    if (
      sessions.length
    ) {

      localStorage.setItem(

        "digimaster_sessions",

        JSON.stringify(
          sessions.reverse()
        )

      );

    }


    const lessonSnap =
      await getDocs(

        collection(
          db,
          "users",
          uid,
          "lessons"
        )

      );


    const lessonsProgress =
      {};


    lessonSnap.forEach(
      (item) => {

        const data =
          item.data();


        lessonsProgress[
          data.lessonId
        ] = {

          completed:
            true,

          wpm:
            data.wpm,

          accuracy:
            data.accuracy,

          date:
            data.completedAt
              ?.toDate?.()
              ?.toISOString()
            ||
            new Date()
              .toISOString()

        };

      }
    );


    if (
      Object.keys(
        lessonsProgress
      ).length
    ) {

      localStorage.setItem(

        "digimaster_lessons",

        JSON.stringify(
          lessonsProgress
        )

      );

    }


    if (
      typeof window.renderStats ===
      "function"
    ) {

      window.renderStats();

    }


    if (
      typeof window.renderLessons ===
      "function"
    ) {

      window.renderLessons();

    }

  }

  catch (error) {

    console.warn(
      "Falha na sincronização:",
      error
    );

  }

}


// =========================================
// INTERFACE DO USUÁRIO
// =========================================

function renderUserUI(
  user
) {

  const area =
    document.getElementById(
      "authArea"
    );


  if (!area) {

    return;

  }


  const initial =
    escapeHtml(

      (
        user.displayName ||
        user.email ||
        "A"
      )
        .charAt(0)
        .toUpperCase()

    );


  const photo =
    user.photoURL

      ?

      `<img
        src="${escapeHtml(
          user.photoURL
        )}"
        class="user-avatar"
        alt="Perfil"
      >`

      :

      `<div
        class="user-avatar-placeholder"
      >${initial}</div>`;


  area.innerHTML = `

    <div class="user-chip">

      ${photo}

      <span class="user-name">
        ${escapeHtml(
          user.displayName ||
          user.email ||
          "Aluno"
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
      "authArea"
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
// LOGOFF NO CELULAR
// =========================================

function ensureMobileSignout() {

  const header =
    document.querySelector(
      ".header-inner"
    );


  if (
    !header ||
    document.getElementById(
      "dmMobileSignout"
    )
  ) {

    return;

  }


  const button =
    document.createElement(
      "button"
    );


  button.id =
    "dmMobileSignout";


  button.className =
    "dm-mobile-signout";


  button.type =
    "button";


  button.textContent =
    "↪ Sair";


  button.addEventListener(

    "click",

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
      "dmMobileSignout"
    )
    ?.remove();

}


// =========================================
// MODAL DE LOGIN
// =========================================

window.openAuthModal =
  function (
    mode = "login"
  ) {

    const modal =
      document.getElementById(
        "authModal"
      );


    if (!modal) {

      return;

    }


    modal.classList.add(
      "open"
    );


    window.switchAuthMode(
      mode
    );

  };


window.closeAuthModal =
  function () {

    const modal =
      document.getElementById(
        "authModal"
      );


    if (modal) {

      modal.classList.remove(
        "open"
      );

    }


    clearAuthError();

  };


window.switchAuthMode =
  function (mode) {

    const loginPanel =
      document.getElementById(
        "loginPanel"
      );


    const signupPanel =
      document.getElementById(
        "signupPanel"
      );


    const tabLogin =
      document.getElementById(
        "tabLogin"
      );


    const tabSignup =
      document.getElementById(
        "tabSignup"
      );


    if (
      mode === "login"
    ) {

      if (loginPanel) {

        loginPanel.style.display =
          "flex";

      }


      if (signupPanel) {

        signupPanel.style.display =
          "none";

      }


      tabLogin
        ?.classList
        .add(
          "active"
        );


      tabSignup
        ?.classList
        .remove(
          "active"
        );

    }

    else {

      if (loginPanel) {

        loginPanel.style.display =
          "none";

      }


      if (signupPanel) {

        signupPanel.style.display =
          "flex";

      }


      tabLogin
        ?.classList
        .remove(
          "active"
        );


      tabSignup
        ?.classList
        .add(
          "active"
        );

    }


    clearAuthError();

  };


// =========================================
// ERROS DO LOGIN
// =========================================

function showAuthError(
  message
) {

  document
    .querySelectorAll(
      ".auth-error"
    )
    .forEach(
      (element) => {

        element.textContent =
          message;


        element.style.display =
          "block";

      }
    );

}


function clearAuthError() {

  document
    .querySelectorAll(
      ".auth-error"
    )
    .forEach(
      (element) => {

        element.textContent =
          "";


        element.style.display =
          "none";

      }
    );

}


function showAuthLoading(
  loading
) {

  document
    .querySelectorAll(
      ".auth-submit-btn"
    )
    .forEach(
      (button) => {

        button.disabled =
          loading;


        button.style.opacity =
          loading
            ? "0.6"
            : "1";

      }
    );

}


// =========================================
// PROTEÇÃO DE HTML
// =========================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// =========================================
// BANCO EXTRA DE PALAVRAS
// =========================================

const EXTRA_WORDS = {

  basico: [

    "casa mesa sala porta janela livro pasta tecla mouse tela aluno curso aula escola treino ritmo foco pratica evolua",

    "gato pato rato bola cola mala vela roda dado dedo lago mapa nome soma vida dia noite luz som cor voz tempo",

    "arquivo pasta login senha dados rede nuvem email texto fonte pagina bloco curso aluno prova nota aula tarefa",

    "atender vender falar ouvir ajudar cliente caixa estoque loja pedido prazo valor troco conta ficha nome telefone"

  ],


  intermediario: [

    "cliente proposta orçamento contrato relatório reunião agenda planilha cadastro atendimento processo resultado equipe tarefa prazo meta análise desempenho",

    "computador teclado monitor impressora sistema aplicativo navegador arquivo backup segurança senha autenticação internet rede servidor nuvem produtividade",

    "administração financeiro marketing vendas recursos humanos logística estoque compras atendimento planejamento organização comunicação liderança qualidade",

    "estudo prática consistência velocidade precisão concentração postura disciplina rotina aprendizado evolução habilidade profissional oportunidade carreira"

  ],


  avancado: [

    "automação inteligência artificial análise de dados cibersegurança computação em nuvem desenvolvimento integração algoritmo infraestrutura governança produtividade transformação digital",

    "planejamento estratégico indicadores de desempenho experiência do cliente gestão de projetos melhoria contínua tomada de decisão comunicação corporativa liderança colaboração inovação",

    "banco de dados arquitetura de software interface programação protocolo autenticação criptografia virtualização escalabilidade disponibilidade observabilidade manutenção implantação",

    "mercado trabalho qualificação empregabilidade competência repertório adaptação pensamento crítico resolução de problemas criatividade responsabilidade autonomia comunicação"

  ],


  numeros: [

    "10 20 30 40 50 60 70 80 90 100 125 250 375 500 750 1000 1500 2500 5000 10000",

    "R$ 19,90 R$ 49,90 R$ 99,00 R$ 149,90 R$ 299,00 R$ 799,90 R$ 1.500,00 R$ 2.750,50",

    "(65) 99999-1234 (11) 98888-5678 78280-000 78305-000 01/08/2026 10/08/2026 31/12/2026",

    "pedido 1024 nota 4587 cliente 0021 item 17 quantidade 24 desconto 10% total R$ 899,00 parcela 06 vencimento 10/09/2026"

  ]

};


// =========================================
// BANCO EXTRA DE TEXTOS
// =========================================

const EXTRA_TEXTS = {

  basico: [

    "A prática de digitação melhora quando o aluno mantém um ritmo calmo e constante. O objetivo no início não é correr. O mais importante é usar os dedos corretos, evitar olhar para o teclado e reduzir os erros a cada tentativa. Com alguns minutos de treino por dia, os movimentos ficam mais naturais e a velocidade começa a crescer.",

    "No ambiente de trabalho, digitar bem ajuda em tarefas simples como preencher cadastros, escrever mensagens, registrar pedidos e organizar informações. Uma pessoa que domina o teclado consegue dedicar mais atenção ao conteúdo do que ao esforço de encontrar cada tecla.",

    "O computador faz parte de muitas profissões. Atendimento, vendas, administração, estoque, farmácia e serviços financeiros usam sistemas que exigem digitação. Aprender a escrever com precisão no teclado é uma habilidade prática que acompanha o profissional durante toda a carreira.",

    "Treinar todos os dias por pouco tempo costuma ser melhor do que fazer uma sessão longa apenas uma vez por semana. A repetição ajuda o cérebro e as mãos a memorizar os movimentos. Aos poucos, o aluno deixa de pensar em cada tecla e passa a digitar palavras inteiras com mais confiança."

  ],


  intermediario: [

    "A produtividade no trabalho depende de pequenas habilidades que se somam ao longo do dia. Saber digitar com velocidade e precisão reduz o tempo gasto em e-mails, relatórios, sistemas de atendimento, planilhas e cadastros. Quando a digitação deixa de exigir esforço consciente, o profissional consegue concentrar energia na qualidade da informação e na solução do problema.",

    "Organização digital é uma competência importante em qualquer empresa. Criar nomes claros para arquivos, manter pastas bem estruturadas, utilizar senhas fortes e fazer cópias de segurança reduz perdas de tempo e evita muitos problemas. A tecnologia entrega melhores resultados quando existe método por trás do uso das ferramentas.",

    "Um bom atendimento começa antes da resposta ao cliente. É preciso ouvir, registrar corretamente os dados, entender a necessidade e comunicar a solução de maneira clara. Em sistemas de atendimento, erros de digitação podem gerar telefones incorretos, valores errados e informações incompletas. Por isso, precisão e atenção caminham juntas.",

    "Planilhas são usadas para controlar vendas, estoque, despesas, metas e indicadores. Mesmo quem não trabalha diretamente no setor financeiro costuma lidar com números e registros. Digitar valores corretamente, revisar informações e dominar atalhos básicos pode tornar a rotina muito mais rápida e segura.",

    "A aprendizagem profissional acontece pela combinação de teoria e prática. Assistir a uma aula ajuda a entender o conceito, mas é a execução repetida que cria habilidade. Na digitação, essa diferença é evidente: quanto mais o aluno pratica corretamente, mais automática se torna a movimentação dos dedos."

  ],


  avancado: [

    "A transformação digital não acontece apenas quando uma empresa compra novos computadores ou contrata um sistema. Ela exige mudança de processos, integração de informações, capacitação das pessoas e decisões baseadas em dados. Profissionais capazes de aprender novas ferramentas rapidamente têm vantagem porque conseguem adaptar a rotina sem perder produtividade.",

    "A inteligência artificial está ampliando a capacidade de automatizar tarefas repetitivas, analisar grandes volumes de informação e apoiar decisões. Comunicação, pensamento crítico, responsabilidade, criatividade e conhecimento do contexto continuam essenciais para avaliar resultados e utilizar a tecnologia de forma adequada.",

    "Cibersegurança depende tanto de tecnologia quanto de comportamento. Senhas reutilizadas, links maliciosos, arquivos desconhecidos e dispositivos sem atualização podem abrir espaço para ataques. Empresas reduzem riscos quando combinam ferramentas de proteção com treinamento frequente e políticas claras.",

    "Dados de qualidade permitem enxergar padrões que seriam difíceis de perceber apenas pela experiência. Indicadores de vendas, produtividade, satisfação e custos ajudam gestores a comparar períodos, testar hipóteses e definir prioridades. O valor do dado depende de registros corretos e interpretação adequada.",

    "O desenvolvimento profissional exige capacidade de aprender continuamente. Ferramentas mudam, processos evoluem e novas funções surgem com rapidez. Quem constrói uma base sólida em tecnologia, comunicação e resolução de problemas consegue aproveitar melhor cursos, treinamentos e experiências práticas."

  ],


  numeros: [

    "Relatório 08/2026. Foram registrados 125 atendimentos, 47 vendas e faturamento de R$ 18.745,90. A meta mensal é de R$ 25.000,00. Restam 12 dias úteis para atingir 100% do objetivo. O ticket médio atual é de R$ 398,85 e a taxa de conversão foi de 37,6%.",

    "Pedido 45821. Cliente 00374. Quantidade 18 unidades. Valor unitário R$ 49,90. Subtotal R$ 898,20. Desconto 10%. Total final R$ 808,38. Pagamento em 3 parcelas de R$ 269,46 com vencimentos em 10/08/2026, 10/09/2026 e 10/10/2026.",

    "Cadastro: telefone (65) 99999-1234, CEP 78305-000, protocolo 202608104587, atendimento iniciado às 14:35 e finalizado às 15:12. Foram enviados 3 arquivos, registrados 2 contatos e agendado retorno para 17/08/2026 às 09:30.",

    "Estoque inicial 1.250 unidades. Entradas 375 unidades. Saídas 842 unidades. Estoque final 783 unidades. Custo médio R$ 27,45. Valor estimado do estoque R$ 21.493,35. Ponto de reposição definido em 350 unidades."

  ]

};


// =========================================
// ESCOLHER ITEM ALEATÓRIO
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
// NOVOS MODOS E TEMPOS
// =========================================

function installPracticeEnhancements() {

  const durationSelect =
    document.getElementById(
      "durationSelect"
    );


  const modeSelect =
    document.getElementById(
      "modeSelect"
    );


  const controls =
    document.querySelector(
      ".practice-controls"
    );


  // -------------------------
  // NOVOS TEMPOS
  // -------------------------

  if (durationSelect) {

    [

      [
        "180",
        "3min"
      ],

      [
        "300",
        "5min"
      ],

      [
        "600",
        "10min"
      ],

      [
        "900",
        "15min"
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
              "option"
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


  // -------------------------
  // TEXTO PERSONALIZADO
  // -------------------------

  if (
    modeSelect &&
    !modeSelect
      .querySelector(
        'option[value="custom"]'
      )
  ) {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      "custom";


    option.textContent =
      "Texto personalizado";


    modeSelect.appendChild(
      option
    );

  }


  // -------------------------
  // CAMPO DE TEXTO
  // -------------------------

  if (
    controls &&
    !document.getElementById(
      "customTextPanel"
    )
  ) {

    const panel =
      document.createElement(
        "div"
      );


    panel.id =
      "customTextPanel";


    panel.className =
      "custom-text-panel";


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
      "afterend",
      panel
    );


    const textarea =
      panel.querySelector(
        "#customPracticeText"
      );


    const count =
      panel.querySelector(
        "#customTextCount"
      );


    if (textarea) {

      textarea.value =
        localStorage.getItem(
          "digimaster_custom_text"
        ) ||
        "";


      if (count) {

        count.textContent =
          `${textarea.value.length} caracteres`;

      }


      textarea.addEventListener(

        "input",

        () => {

          localStorage.setItem(
            "digimaster_custom_text",
            textarea.value
          );


          if (count) {

            count.textContent =
              `${textarea.value.length} caracteres`;

          }

        }

      );

    }


    panel
      .querySelector(
        "#customApplyBtn"
      )
      ?.addEventListener(

        "click",

        () => {

          if (
            !textarea
              ?.value
              .trim()
          ) {

            window.showToast?.(
              "⚠️ Digite ou cole um texto primeiro."
            );

            return;

          }


          if (modeSelect) {

            modeSelect.value =
              "custom";

          }


          updateCustomTextVisibility();


          window.changeMode?.();


          window.showToast?.(
            "📝 Texto personalizado aplicado!"
          );

        }

      );

  }


  modeSelect
    ?.addEventListener(
      "change",
      updateCustomTextVisibility
    );


  updateCustomTextVisibility();


  // -------------------------
  // CONTROLAR TEXTOS
  // -------------------------

  const originalGetRandomText =
    window.getRandomText;


  if (
    typeof originalGetRandomText ===
      "function" &&
    !window.__digimasterTextModeInstalled
  ) {

    window.__digimasterTextModeInstalled =
      true;


    window.getRandomText =
      function (level) {

        const mode =
          document
            .getElementById(
              "modeSelect"
            )
            ?.value ||
          "words";


        const safeLevel =
          EXTRA_TEXTS[level]
            ? level
            : "intermediario";


        // TEXTO PERSONALIZADO

        if (
          mode ===
          "custom"
        ) {

          const raw =
            document
              .getElementById(
                "customPracticeText"
              )
              ?.value ||
            "";


          const clean =
            raw
              .replace(
                /\s+/g,
                " "
              )
              .trim();


          return (
            clean ||
            originalGetRandomText(
              level
            )
          );

        }


        // TEXTO LONGO

        if (
          mode ===
          "text"
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
          "time"
        ) {

          const pool =
            EXTRA_TEXTS[
              safeLevel
            ];


          return [

            randomFrom(pool),

            randomFrom(pool),

            randomFrom(pool)

          ].join(" ");

        }


        // PALAVRAS

        if (
          mode ===
            "words" &&
          EXTRA_WORDS[
            safeLevel
          ]
        ) {

          return (
            Math.random() <
            0.7
          )

            ?

            randomFrom(
              EXTRA_WORDS[
                safeLevel
              ]
            )

            :

            originalGetRandomText(
              level
            );

        }


        return originalGetRandomText(
          level
        );

      };

  }

}


// =========================================
// MOSTRAR TEXTO PERSONALIZADO
// =========================================

function updateCustomTextVisibility() {

  const panel =
    document.getElementById(
      "customTextPanel"
    );


  const mode =
    document
      .getElementById(
        "modeSelect"
      )
      ?.value;


  if (panel) {

    panel.style.display =
      mode === "custom"
        ? "block"
        : "none";

  }

}


// =========================================
// 20 NOVAS LIÇÕES
// =========================================

function extendLessonsCatalog() {

  try {

    if (
      typeof LESSONS ===
      "undefined"
    ) {

      return;

    }


    const extraLessons = {

      // =====================
      // BÁSICO
      // =====================

      basico: [

        {

          id: "b11",

          num: 11,

          icon: "🔁",

          title:
            "Consolidação de Teclas",

          desc:
            "Reforce todas as fileiras com sequências variadas.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "asdf jkl qwer uiop zxcv nm casa mesa sala porta janela livro tecla mouse tela curso aluno pratica ritmo foco",

          xp: 120,

          tip:
            "Volte sempre para a posição home."

        },


        {

          id: "b12",

          num: 12,

          icon: "🧩",

          title:
            "Palavras do Cotidiano",

          desc:
            "Treine palavras comuns e memória muscular.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "casa escola trabalho amigo familia mercado cidade rua bairro telefone mensagem arquivo pasta agenda tarefa cliente produto",

          xp: 120,

          tip:
            "Leia a próxima palavra enquanto termina a atual."

        },


        {

          id: "b13",

          num: 13,

          icon: "💼",

          title:
            "Vocabulário de Trabalho",

          desc:
            "Palavras usadas em atendimento e administração.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "nome cadastro cliente pedido valor prazo caixa venda compra estoque conta ficha nota curso aula prova equipe meta",

          xp: 130,

          tip:
            "Priorize precisão nos registros."

        },


        {

          id: "b14",

          num: 14,

          icon: "✍️",

          title:
            "Frases Curtas",

          desc:
            "Passe de palavras isoladas para frases completas.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "O aluno pratica todos os dias. A escola prepara para o trabalho. O cliente precisa de uma resposta clara. O arquivo deve ser salvo na pasta correta.",

          xp: 140,

          tip:
            "Mantenha ritmo constante."

        },


        {

          id: "b15",

          num: 15,

          icon: "🏁",

          title:
            "Desafio de Fluência Básica",

          desc:
            "Texto maior para consolidar o nível básico.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Digitar bem exige pratica e paciencia. No inicio o aluno deve pensar mais na precisao do que na velocidade. Com treino frequente os dedos aprendem o caminho das teclas e o texto passa a fluir com mais naturalidade.",

          xp: 220,

          tip:
            "Evite olhar para o teclado.",

          isChallenge:
            true

        }

      ],


      // =====================
      // INTERMEDIÁRIO
      // =====================

      intermediario: [

        {

          id: "i9",

          num: 9,

          icon: "📧",

          title:
            "E-mails Profissionais",

          desc:
            "Pratique mensagens de trabalho.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Bom dia. Segue em anexo o relatório solicitado. Por favor confirme o recebimento e informe se precisar de algum ajuste. Ficamos à disposição para esclarecer dúvidas e dar continuidade ao atendimento.",

          xp: 150,

          tip:
            "Cuide da pontuação e acentuação."

        },


        {

          id: "i10",

          num: 10,

          icon: "📊",

          title:
            "Rotina Administrativa",

          desc:
            "Documentos, prazos e organização.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "A rotina administrativa exige organização de documentos, atualização de cadastros, controle de prazos, comunicação com clientes e registro correto das informações nos sistemas da empresa.",

          xp: 160,

          tip:
            "Mantenha velocidade constante."

        },


        {

          id: "i11",

          num: 11,

          icon: "🛒",

          title:
            "Atendimento e Vendas",

          desc:
            "Situações comuns de contato com clientes.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Um bom atendimento começa com atenção. Registre o nome do cliente, confirme os dados, entenda a necessidade e apresente a solução com clareza. Antes de finalizar, revise valores, prazos e formas de pagamento.",

          xp: 160,

          tip:
            "Precisão vale mais do que pressa."

        },


        {

          id: "i12",

          num: 12,

          icon: "🗂️",

          title:
            "Organização Digital",

          desc:
            "Fluência com um texto mais longo.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Arquivos bem organizados economizam tempo. Use nomes claros, separe documentos por assunto e mantenha cópias de segurança dos materiais importantes. Uma estrutura simples de pastas facilita o trabalho individual e a colaboração com toda a equipe.",

          xp: 170,

          tip:
            "Leia algumas palavras à frente."

        },


        {

          id: "i13",

          num: 13,

          icon: "🏁",

          title:
            "Desafio Intermediário II",

          desc:
            "Ritmo, precisão e produtividade.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Profissionais que digitam com agilidade conseguem registrar informações, responder mensagens e trabalhar em sistemas com menos esforço. A velocidade é útil, mas deve caminhar junto com a precisão. Um dado digitado de forma errada pode gerar retrabalho e atrasos.",

          xp: 260,

          tip:
            "Busque pelo menos 90% de precisão.",

          isChallenge:
            true

        }

      ],


      // =====================
      // AVANÇADO
      // =====================

      avancado: [

        {

          id: "a7",

          num: 7,

          icon: "📈",

          title:
            "Indicadores e Decisão",

          desc:
            "Análise e gestão empresarial.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Indicadores de desempenho ajudam empresas a acompanhar resultados e identificar oportunidades de melhoria. Dados de vendas, produtividade, satisfação e custos precisam ser registrados com consistência para que gestores possam comparar períodos e tomar decisões melhores.",

          xp: 200,

          tip:
            "Evite acelerar em termos técnicos."

        },


        {

          id: "a8",

          num: 8,

          icon: "☁️",

          title:
            "Computação em Nuvem",

          desc:
            "Texto técnico longo e fluido.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "A computação em nuvem permite acessar sistemas, arquivos e serviços pela internet sem depender de um único computador físico. Empresas utilizam essa estrutura para ampliar disponibilidade, facilitar colaboração e ajustar recursos conforme a demanda.",

          xp: 210,

          tip:
            "Mantenha cadência estável."

        },


        {

          id: "a9",

          num: 9,

          icon: "🛡️",

          title:
            "Cultura de Cibersegurança",

          desc:
            "Comportamento e proteção de dados.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "A segurança da informação depende de ferramentas e também do comportamento das pessoas. Senhas fortes, autenticação em dois fatores, atualizações frequentes e atenção a mensagens suspeitas reduzem riscos. Treinamento contínuo transforma cada colaborador em parte da proteção digital.",

          xp: 220,

          tip:
            "Observe acentos e pontuação."

        },


        {

          id: "a10",

          num: 10,

          icon: "🤖",

          title:
            "IA no Trabalho",

          desc:
            "Uso responsável de inteligência artificial.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "A inteligência artificial pode resumir documentos, apoiar análises, automatizar tarefas repetitivas e acelerar a criação de conteúdo. O profissional continua responsável por revisar resultados, proteger informações sensíveis e aplicar pensamento crítico antes de transformar uma sugestão automática em decisão.",

          xp: 230,

          tip:
            "Mantenha precisão mesmo em alta velocidade."

        },


        {

          id: "a11",

          num: 11,

          icon: "🏁",

          title:
            "Desafio Profissional",

          desc:
            "Tecnologia, negócios e produtividade.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "A transformação digital exige mais do que novas ferramentas. Processos precisam ser revistos, pessoas precisam aprender e informações precisam circular com qualidade. Profissionais capazes de combinar domínio tecnológico, comunicação e pensamento crítico se adaptam melhor às mudanças.",

          xp: 350,

          tip:
            "Meta: 60 WPM e 95% de precisão.",

          isChallenge:
            true

        }

      ],


      // =====================
      // NÚMEROS
      // =====================

      numeros: [

        {

          id: "n8",

          num: 8,

          icon: "🧾",

          title:
            "Pedidos e Notas",

          desc:
            "Códigos, quantidades e valores.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Pedido 45821 Nota 1027 Cliente 00374 Quantidade 18 Valor unitario R$ 49,90 Total R$ 898,20 Desconto 10% Valor final R$ 808,38",

          xp: 140,

          tip:
            "Confira cada número antes de avançar."

        },


        {

          id: "n9",

          num: 9,

          icon: "📅",

          title:
            "Datas e Horários",

          desc:
            "Agenda e atendimento.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "10/08/2026 14:30 11/08/2026 08:15 17/08/2026 09:45 31/08/2026 18:00 01/09/2026 07:30 10/09/2026 16:20",

          xp: 140,

          tip:
            "Cuide das barras e dos dois-pontos."

        },


        {

          id: "n10",

          num: 10,

          icon: "📦",

          title:
            "Controle de Estoque",

          desc:
            "Entradas, saídas e saldos.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Produto 1024 Estoque inicial 1250 Entrada 375 Saida 842 Saldo 783 Custo R$ 27,45 Valor total R$ 21.493,35 Reposicao 350 unidades",

          xp: 150,

          tip:
            "Atenção aos separadores decimais."

        },


        {

          id: "n11",

          num: 11,

          icon: "💳",

          title:
            "Parcelas e Vencimentos",

          desc:
            "Valores e datas financeiras.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Total R$ 1.497,00 Entrada R$ 300,00 Saldo R$ 1.197,00 Parcela 1 R$ 399,00 10/09/2026 Parcela 2 R$ 399,00 10/10/2026 Parcela 3 R$ 399,00 10/11/2026",

          xp: 160,

          tip:
            "Um caractere errado muda o valor."

        },


        {

          id: "n12",

          num: 12,

          icon: "🏁",

          title:
            "Desafio Numérico Profissional",

          desc:
            "Documentos, contatos e valores.",

          keys: [],

          homeKeys:
            [
              "a",
              "s",
              "d",
              "f",
              "j",
              "k",
              "l"
            ],

          text:
            "Protocolo 202608104587 Cliente 00374 Tel (65) 99999-1234 CEP 78305-000 Pedido 45821 Total R$ 2.750,50 Desconto 8% Vencimento 10/09/2026 Atendimento 14:35",

          xp: 260,

          tip:
            "Busque precisão máxima.",

          isChallenge:
            true

        }

      ]

    };


    // -------------------------
    // ADICIONAR SEM DUPLICAR
    // -------------------------

    Object
      .entries(
        extraLessons
      )
      .forEach(

        (
          [
            level,
            items
          ]
        ) => {

          if (
            !LESSONS[level]
              ?.lessons
          ) {

            return;

          }


          items.forEach(
            (lesson) => {

              const alreadyExists =
                LESSONS[
                  level
                ]
                  .lessons
                  .some(
                    (
                      existing
                    ) =>
                      existing.id ===
                      lesson.id
                  );


              if (
                !alreadyExists
              ) {

                LESSONS[
                  level
                ]
                  .lessons
                  .push(
                    lesson
                  );

              }

            }
          );

        }

      );

  }

  catch (error) {

    console.warn(
      "Não foi possível adicionar novas lições:",
      error
    );

  }

}


// =========================================
// DASHBOARD ADMINISTRATIVO
// =========================================

function enhanceAdminDashboard() {

  const screen =
    document.getElementById(
      "screen-admin"
    );


  if (
    !screen ||
    screen.dataset.enhanced ===
      "1"
  ) {

    return;

  }


  screen.dataset.enhanced =
    "1";


  screen.innerHTML = `

    <div class="admin-wrapper">

      <div class="admin-header">

        <h2
          class="section-title"
          style="
            margin-top:0;
            margin-bottom:8px
          "
        >
          👨‍🏫 Dashboard Administrativo
        </h2>

        <p
          style="
            color:var(--text2);
            font-size:14px;
            margin-bottom:18px
          "
        >
          Acompanhe atividade, velocidade,
          precisão e evolução dos alunos.
        </p>

      </div>


      <div
        class="admin-summary"
        style="
          grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              150px,
              1fr
            )
          )
        "
      >

        <div class="admin-stat-card">

          <div
            class="admin-stat-val"
            id="adminTotalAlunos"
          >
            —
          </div>

          <div class="admin-stat-label">
            Alunos
          </div>

        </div>


        <div class="admin-stat-card">

          <div
            class="admin-stat-val"
            id="adminMediaWpm"
          >
            —
          </div>

          <div class="admin-stat-label">
            WPM médio
          </div>

        </div>


        <div class="admin-stat-card">

          <div
            class="admin-stat-val"
            id="adminMediaAcc"
          >
            —
          </div>

          <div class="admin-stat-label">
            Precisão média
          </div>

        </div>


        <div class="admin-stat-card">

          <div
            class="admin-stat-val"
            id="adminTotalSessoes"
          >
            —
          </div>

          <div class="admin-stat-label">
            Sessões
          </div>

        </div>

      </div>


      <div class="admin-toolbar">

        <input
          class="admin-search"
          type="search"
          placeholder="Buscar por nome ou e-mail"
          oninput="
            filterAdminTable(
              this.value
            )
          "
        >


        <div class="admin-sort-group">

          <button
            class="rank-filter-btn active"
            type="button"
            onclick="
              sortAdmin(
                'wpm',
                this
              )
            "
          >
            WPM
          </button>


          <button
            class="rank-filter-btn"
            type="button"
            onclick="
              sortAdmin(
                'accuracy',
                this
              )
            "
          >
            Precisão
          </button>


          <button
            class="rank-filter-btn"
            type="button"
            onclick="
              sortAdmin(
                'sessions',
                this
              )
            "
          >
            Sessões
          </button>


          <button
            class="rank-filter-btn"
            type="button"
            onclick="
              sortAdmin(
                'last',
                this
              )
            "
          >
            Atividade
          </button>

        </div>


        <div class="admin-actions">

          <button
            class="btn-secondary"
            type="button"
            onclick="
              loadAdminData()
            "
          >
            🔄 Atualizar
          </button>


          <button
            class="btn-secondary"
            type="button"
            onclick="
              exportAdminCSV()
            "
          >
            📥 CSV
          </button>

        </div>

      </div>


      <div class="admin-table-wrap">

        <table class="admin-table">

          <thead>

            <tr>

              <th>
                #
              </th>

              <th>
                Aluno
              </th>

              <th>
                E-mail
              </th>

              <th>
                Melhor WPM
              </th>

              <th>
                Precisão
              </th>

              <th>
                Sessões
              </th>

              <th>
                Última atividade
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody id="adminBody">
          </tbody>

        </table>


        <div
          class="admin-empty"
          id="adminEmpty"
          style="display:none"
        >
          Nenhum aluno cadastrado ainda.
        </div>

      </div>

    </div>


    <div
      class="admin-detail-overlay"
      id="adminDetailModal"
      onclick="
        if(
          event.target === this
        )
        closeAdminDetail()
      "
    >

      <div class="admin-detail-card">

        <button
          class="admin-detail-close"
          type="button"
          onclick="
            closeAdminDetail()
          "
        >
          ✕
        </button>

        <div id="adminDetailContent">
        </div>

      </div>

    </div>

  `;

}


// =========================================
// ESTILOS EXTRAS
// =========================================

function injectEnhancementStyles() {

  if (
    document.getElementById(
      "digimasterEnhancementStyles"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "digimasterEnhancementStyles";


  style.textContent = `

    .dm-mobile-signout{

      display:none;

      background:
        rgba(
          255,
          45,
          120,
          .08
        );

      border:
        1px solid
        rgba(
          255,
          45,
          120,
          .35
        );

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

      color:
        var(--text);

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
        rgba(
          0,
          207,
          255,
          .12
        );

    }


    .admin-toolbar{

      display:flex;

      align-items:
        center;

      gap:
        10px;

      flex-wrap:
        wrap;

      margin:
        0 0 18px;

    }


    .admin-search{

      flex:
        1;

      min-width:
        230px;

      background:
        var(--bg3);

      border:
        1px solid
        var(--border);

      color:
        var(--text);

      border-radius:
        9px;

      padding:
        10px 12px;

      outline:
        none;

    }


    .admin-search:focus{

      border-color:
        var(--accent);

    }


    .admin-sort-group,
    .admin-actions{

      display:flex;

      gap:
        7px;

      flex-wrap:
        wrap;

    }


    .admin-detail-overlay{

      position:
        fixed;

      inset:
        0;

      background:
        rgba(
          4,
          6,
          12,
          .9
        );

      backdrop-filter:
        blur(8px);

      z-index:
        3000;

      display:
        none;

      align-items:
        center;

      justify-content:
        center;

      padding:
        20px;

    }


    .admin-detail-card{

      position:
        relative;

      width:
        min(
          1050px,
          96vw
        );

      max-height:
        88vh;

      overflow:
        auto;

      background:
        var(--bg2);

      border:
        1px solid
        var(--border2);

      border-radius:
        18px;

      padding:
        28px;

      box-shadow:
        0 30px 100px
        rgba(
          0,
          0,
          0,
          .65
        );

    }


    .admin-detail-close{

      position:
        absolute;

      right:
        16px;

      top:
        14px;

      background:
        transparent;

      border:
        0;

      color:
        var(--text2);

      font-size:
        18px;

      cursor:
        pointer;

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


      .admin-toolbar{

        align-items:
          stretch;

      }


      .admin-search{

        min-width:
          100%;

      }


      .admin-detail-card{

        padding:
          22px 14px;

      }

    }

  `;


  document.head.appendChild(
    style
  );

}


// =========================================
// INICIALIZAR MELHORIAS
// =========================================

function initEnhancements() {

  injectEnhancementStyles();

  installPracticeEnhancements();

  extendLessonsCatalog();

  enhanceAdminDashboard();

}


// =========================================
// INICIAR
// =========================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(

    "DOMContentLoaded",

    initEnhancements

  );

}

else {

  initEnhancements();

}

// =========================================
// DigiMaster — App Principal v2.1
// Auto-scroll durante a digitação
// =========================================


// =========================================
// STATE
// =========================================

let currentText = '';
let currentIndex = 0;

let startTime = null;
let timerInterval = null;

let totalErrors = 0;
let errorSet = new Set();

let sessionActive = false;
let sessionDuration = 60;

let elapsedSeconds = 0;

let currentLevel = 'intermediario';
let currentMode = 'words';

let charSpans = [];

let inputLocked = false;
let lastAlertPlayed = false;


// Guarda a posição vertical
// da última linha do cursor.
let lastCursorLineTop = -1;



// =========================================
// MODAL POSIÇÃO DAS MÃOS
// =========================================

window.showHandsModal = function () {

  const overlay =
    document.getElementById(
      'handsOverlay'
    );

  if (overlay) {
    overlay.classList.add(
      'open'
    );
  }

};


window.closeHandsModal = function () {

  const overlay =
    document.getElementById(
      'handsOverlay'
    );

  if (overlay) {
    overlay.classList.remove(
      'open'
    );
  }

};


window.saveDontShowHands =
  function (checked) {

    if (checked) {

      localStorage.setItem(
        'digimaster_hands_seen',
        'true'
      );

    } else {

      localStorage.removeItem(
        'digimaster_hands_seen'
      );

    }

  };



// =========================================
// WELCOME MODAL
// =========================================

function initWelcome() {

  // lessons.js já controla
  // a exibição inicial.

}


window.closeWelcome =
  function () {

    const overlay =
      document.getElementById(
        'welcomeOverlay'
      );

    if (overlay) {

      overlay.classList.remove(
        'open'
      );

      overlay.style.display =
        'none';

    }

  };


window.saveDontShow =
  function (checked) {

    if (checked) {

      localStorage.setItem(
        'digimaster_hide_welcome',
        '1'
      );

    } else {

      localStorage.removeItem(
        'digimaster_hide_welcome'
      );

    }

  };


window.showWelcome =
  function () {

    const overlay =
      document.getElementById(
        'welcomeOverlay'
      );

    if (overlay) {

      overlay.style.display = '';

      overlay.classList.add(
        'open'
      );

    }

  };



// =========================================
// NAVEGAÇÃO
// =========================================

function navigateTo(screenId) {

  document
    .querySelectorAll(
      '.screen'
    )
    .forEach(
      screen =>
        screen.classList.remove(
          'active'
        )
    );


  document
    .querySelectorAll(
      '.nav-btn'
    )
    .forEach(
      button =>
        button.classList.remove(
          'active'
        )
    );


  const screen =
    document.getElementById(
      'screen-' + screenId
    );


  if (screen) {

    screen.classList.add(
      'active'
    );

  }


  const button =
    document.querySelector(
      `.nav-btn[data-screen="${screenId}"]`
    );


  if (button) {

    button.classList.add(
      'active'
    );

  }


  const keyboard =
    document.getElementById(
      'vkbWrapper'
    );


  if (keyboard) {

    keyboard.style.display =
      screenId === 'practice'
        ? 'block'
        : 'none';

  }


  if (
    screenId === 'stats'
  ) {

    renderStats();

  }


  if (
    screenId === 'lessons'
  ) {

    renderLessons();

  }


  if (
    screenId === 'ranking'
  ) {

    loadRanking(
      'wpm',
      document.querySelector(
        '.rank-filter-btn'
      )
    );

  }


  if (
    screenId === 'admin'
  ) {

    loadAdminData();

  }


  if (
    screenId === 'practice'
  ) {

    setTimeout(
      setupSession,
      100
    );

  }

}



// =========================================
// INICIAR UM NÍVEL
// =========================================

function startLevel(level) {

  currentLevel = level;


  navigateTo(
    'practice'
  );


  const select =
    document.getElementById(
      'levelSelect'
    );


  if (select) {

    select.value =
      level;

  }

}



// =========================================
// CONFIGURAR SESSÃO
// =========================================

function setupSession() {

  if (
    typeof activeLessonData !==
      'undefined' &&
    activeLessonData
  ) {

    currentText =
      activeLessonData
        .lesson
        .text;

  } else {

    currentText =
      getRandomText(
        currentLevel
      );

  }


  currentIndex = 0;

  totalErrors = 0;

  errorSet =
    new Set();

  startTime = null;

  sessionActive = false;

  inputLocked = false;

  elapsedSeconds = 0;

  lastAlertPlayed = false;

  lastCursorLineTop = -1;


  sessionDuration =
    parseInt(

      document
        .getElementById(
          'durationSelect'
        )
        ?.value

      ||

      60

    );


  clearInterval(
    timerInterval
  );


  // Volta o texto para
  // o início da caixa.

  const textContainer =
    document.querySelector(
      '.text-display-container'
    );


  if (textContainer) {

    textContainer.scrollTop =
      0;

  }


  renderText();


  updateLiveStats(
    0,
    100,
    0,
    sessionDuration,
    0
  );


  const progress =
    document.getElementById(
      'progressFill'
    );


  if (progress) {

    progress.style.width =
      '0%';

  }


  const resultPanel =
    document.getElementById(
      'resultPanel'
    );


  if (resultPanel) {

    resultPanel.classList.add(
      'hidden'
    );

  }


  const clickToStart =
    document.getElementById(
      'clickToStart'
    );


  if (clickToStart) {

    clickToStart.classList.remove(
      'hidden'
    );

  }


  const container =
    document.querySelector(
      '.text-display-container'
    );


  if (container) {

    container.classList.remove(
      'focused'
    );

  }


  if (currentText.length) {

    highlightKey(
      currentText[0]
    );

  }

}



// =========================================
// RESET
// =========================================

function resetSession() {

  setupSession();

}



// =========================================
// TROCAR NÍVEL
// =========================================

function changeLevel() {

  currentLevel =

    document
      .getElementById(
        'levelSelect'
      )
      ?.value

    ||

    'intermediario';


  resetSession();

}



// =========================================
// TROCAR MODO
// =========================================

function changeMode() {

  currentMode =

    document
      .getElementById(
        'modeSelect'
      )
      ?.value

    ||

    'words';


  resetSession();

}



// =========================================
// RENDERIZAR TEXTO
// =========================================

function renderText() {

  const display =
    document.getElementById(
      'textDisplay'
    );


  if (!display) {

    return;

  }


  display.innerHTML = '';

  charSpans = [];


  for (
    let i = 0;
    i < currentText.length;
    i++
  ) {

    const span =
      document.createElement(
        'span'
      );


    span.className =
      'char' +
      (
        i === 0
          ? ' cursor'
          : ''
      );


    span.textContent =

      currentText[i] === ' '

        ? '\u00A0'

        : currentText[i];


    display.appendChild(
      span
    );


    charSpans.push(
      span
    );

  }

}



// =========================================
// AUTO-SCROLL DO TEXTO
// =========================================

function keepCursorVisible() {

  const container =
    document.querySelector(
      '.text-display-container'
    );


  if (!container) {

    return;

  }


  if (
    currentIndex >=
    charSpans.length
  ) {

    return;

  }


  const cursor =
    charSpans[
      currentIndex
    ];


  if (!cursor) {

    return;

  }


  // offsetTop indica em qual
  // linha vertical o caractere está.

  const currentLineTop =
    cursor.offsetTop;


  // Não precisamos mover a caixa
  // a cada letra.
  // Só quando mudar de linha.

  if (
    currentLineTop ===
    lastCursorLineTop
  ) {

    return;

  }


  lastCursorLineTop =
    currentLineTop;


  // Deixa a linha atual
  // aproximadamente no meio
  // inferior da caixa.
  //
  // Assim o aluno sempre consegue
  // enxergar também as próximas linhas.

  const targetScroll =
    Math.max(

      0,

      currentLineTop -

      (
        container.clientHeight *
        0.38
      )

    );


  container.scrollTo({

    top:
      targetScroll,

    left:
      0,

    behavior:
      'smooth'

  });

}



// =========================================
// FOCO DE DIGITAÇÃO
// =========================================

function focusInput() {

  const input =
    document.getElementById(
      'typingInput'
    );


  const clickToStart =
    document.getElementById(
      'clickToStart'
    );


  const container =
    document.querySelector(
      '.text-display-container'
    );


  if (input) {

    input.focus();

  }


  if (clickToStart) {

    clickToStart.classList.add(
      'hidden'
    );

  }


  if (container) {

    container.classList.add(
      'focused'
    );

  }

}



// =========================================
// DIGITAÇÃO
// =========================================

function handleInput(e) {

  if (inputLocked) {

    return;

  }


  const input =
    document.getElementById(
      'typingInput'
    );


  if (!input) {

    return;

  }


  const typed =
    input.value;


  if (!typed.length) {

    return;

  }


  const char =
    typed[
      typed.length - 1
    ];



  // =====================================
  // PRIMEIRA TECLA INICIA CRONÔMETRO
  // =====================================

  if (!startTime) {

    startTime =
      Date.now();


    startTimers();

  }



  flashKey(
    char
  );


  const expected =
    currentText[
      currentIndex
    ];



  // =====================================
  // ACERTO
  // =====================================

  if (
    char === expected
  ) {

    if (
      charSpans[
        currentIndex
      ]
    ) {

      charSpans[
        currentIndex
      ].className =
        'char correct';

    }


    if (
      typeof playCorrect ===
      'function'
    ) {

      playCorrect();

    }


    currentIndex++;

  }


  // =====================================
  // ERRO
  // =====================================

  else {

    if (
      charSpans[
        currentIndex
      ]
    ) {

      charSpans[
        currentIndex
      ].className =
        'char wrong';

    }


    totalErrors++;


    errorSet.add(
      currentIndex
    );


    if (
      typeof playError ===
      'function'
    ) {

      playError();

    }


    currentIndex++;

  }



  // =====================================
  // PRÓXIMO CARACTERE
  // =====================================

  if (
    currentIndex <
    charSpans.length
  ) {

    charSpans[
      currentIndex
    ]
      .classList
      .add(
        'cursor'
      );


    highlightKey(
      currentText[
        currentIndex
      ]
    );


    // Aqui está a correção principal.
    //
    // A cada avanço verificamos
    // se o cursor entrou em outra linha.

    requestAnimationFrame(
      () => {

        keepCursorVisible();

      }
    );

  }



  // =====================================
  // BARRA DE PROGRESSO
  // =====================================

  const percentage =

    (
      currentIndex /
      currentText.length
    )

    *

    100;


  const fill =
    document.getElementById(
      'progressFill'
    );


  if (fill) {

    fill.style.width =
      percentage +
      '%';

  }



  // Limpa input invisível.

  input.value = '';



  // =====================================
  // TERMINOU O TEXTO DISPONÍVEL
  // =====================================

  if (
    currentIndex >=
    currentText.length
  ) {

    currentText +=

      ' ' +

      getRandomText(
        currentLevel
      );


    renderTextAppend();

  }



  updateLiveStatsFromState();

}



// =========================================
// ADICIONAR NOVO TEXTO
// =========================================

function renderTextAppend() {

  const display =
    document.getElementById(
      'textDisplay'
    );


  if (!display) {

    return;

  }


  display.innerHTML = '';

  charSpans = [];


  for (
    let i = 0;
    i < currentText.length;
    i++
  ) {

    const span =
      document.createElement(
        'span'
      );


    let className =
      'char';


    if (
      i < currentIndex
    ) {

      className +=

        errorSet.has(i)

          ? ' wrong'

          : ' correct';

    }


    if (
      i === currentIndex
    ) {

      className +=
        ' cursor';

    }


    span.className =
      className;


    span.textContent =

      currentText[i] === ' '

        ? '\u00A0'

        : currentText[i];


    display.appendChild(
      span
    );


    charSpans.push(
      span
    );

  }


  // O DOM foi reconstruído.
  // Força nova leitura da posição.

  lastCursorLineTop =
    -1;


  requestAnimationFrame(
    () => {

      keepCursorVisible();

    }
  );

}



// =========================================
// CRONÔMETRO
// =========================================

function startTimers() {

  sessionActive = true;

  elapsedSeconds = 0;


  timerInterval =
    setInterval(

      () => {

        elapsedSeconds++;


        const remaining =
          sessionDuration -
          elapsedSeconds;



        // =================================
        // TERMINOU
        // =================================

        if (
          remaining <= 0
        ) {

          endSession();

          return;

        }



        // =================================
        // ALERTA DOS 10 SEGUNDOS
        // =================================

        if (
          remaining === 10 &&
          !lastAlertPlayed
        ) {

          lastAlertPlayed =
            true;


          if (
            typeof playAlert ===
            'function'
          ) {

            playAlert();

          }

        }



        const timerChip =
          document.querySelector(
            '.timer-chip .stat-chip-val'
          );


        if (timerChip) {

          timerChip.textContent =
            remaining +
            's';


          timerChip.style.color =

            remaining <= 10

              ? 'var(--wrong)'

              : 'var(--text)';

        }



        updateLiveStatsFromState();

      },

      1000

    );

}



// =========================================
// ATUALIZAR MÉTRICAS
// =========================================

function updateLiveStatsFromState() {

  if (!startTime) {

    return;

  }


  const elapsed =

    (
      Date.now() -
      startTime
    )

    /

    1000

    /

    60;


  const words =
    currentIndex /
    5;


  const wpm =

    elapsed > 0

      ?

      Math.round(
        words /
        elapsed
      )

      :

      0;


  const accuracy =

    currentIndex > 0

      ?

      Math.round(

        (
          (
            currentIndex -
            totalErrors
          )

          /

          currentIndex
        )

        *

        100

      )

      :

      100;


  const wordCount =
    Math.floor(
      currentIndex /
      5
    );


  const remaining =
    sessionDuration -
    elapsedSeconds;


  updateLiveStats(

    wpm,

    accuracy,

    totalErrors,

    Math.max(
      remaining,
      0
    ),

    wordCount

  );



  // Atualiza indicador
  // da home.

  const homeWpm =
    document.getElementById(
      'heroWpm'
    );


  const homeRing =
    document.getElementById(
      'heroRing'
    );


  if (homeWpm) {

    homeWpm.textContent =
      wpm;

  }


  if (homeRing) {

    const percentage =
      Math.min(
        wpm /
        100,
        1
      );


    homeRing.setAttribute(

      'stroke-dasharray',

      (
        percentage *
        314
      )

      +

      ' 314'

    );

  }

}



// =========================================
// MOSTRAR MÉTRICAS
// =========================================

function updateLiveStats(
  wpm,
  accuracy,
  errors,
  timer,
  words
) {

  const element =
    id =>
      document.getElementById(
        id
      );


  if (
    element(
      'liveWpm'
    )
  ) {

    element(
      'liveWpm'
    ).innerHTML =

      wpm +

      ' <small>WPM</small>';

  }


  if (
    element(
      'liveAcc'
    )
  ) {

    element(
      'liveAcc'
    ).innerHTML =

      accuracy +

      ' <small>%</small>';

  }


  if (
    element(
      'liveErrors'
    )
  ) {

    element(
      'liveErrors'
    ).textContent =
      errors;

  }


  if (
    element(
      'liveTimer'
    )
  ) {

    element(
      'liveTimer'
    ).textContent =

      timer +
      's';

  }


  if (
    element(
      'liveWords'
    )
  ) {

    element(
      'liveWords'
    ).textContent =
      words;

  }

}



// =========================================
// ENCERRAR SESSÃO
// =========================================

function endSession() {

  clearInterval(
    timerInterval
  );


  inputLocked = true;

  sessionActive = false;


  const input =
    document.getElementById(
      'typingInput'
    );


  if (input) {

    input.blur();

  }


  if (!startTime) {

    return;

  }



  const elapsed =

    (
      Date.now() -
      startTime
    )

    /

    1000

    /

    60;


  const words =
    currentIndex /
    5;


  const wpm =

    elapsed > 0

      ?

      Math.round(
        words /
        elapsed
      )

      :

      0;


  const accuracy =

    currentIndex > 0

      ?

      Math.round(

        (
          (
            currentIndex -
            totalErrors
          )

          /

          currentIndex
        )

        *

        100

      )

      :

      100;


  const wordCount =
    Math.floor(
      currentIndex /
      5
    );



  // =====================================
  // SALVAR LOCAL
  // =====================================

  saveSession({

    wpm,

    accuracy,

    errors:
      totalErrors,

    words:
      wordCount,

    level:
      currentLevel

  });



  // =====================================
  // SALVAR FIREBASE
  // =====================================

  if (
    typeof saveSessionCloud ===
    'function'
  ) {

    saveSessionCloud({

      wpm,

      accuracy,

      errors:
        totalErrors,

      words:
        wordCount,

      level:
        currentLevel

    });

  }



  // =====================================
  // LIÇÃO
  // =====================================

  checkLessonCompletion(
    wpm,
    accuracy
  );



  if (
    typeof playComplete ===
    'function'
  ) {

    playComplete();

  }



  // =====================================
  // RESULTADO
  // =====================================

  const resultPanel =
    document.getElementById(
      'resultPanel'
    );


  if (resultPanel) {

    const resWpm =
      document.getElementById(
        'resWpm'
      );


    const resAcc =
      document.getElementById(
        'resAcc'
      );


    const resErrors =
      document.getElementById(
        'resErrors'
      );


    const resWords =
      document.getElementById(
        'resWords'
      );


    const feedback =
      document.getElementById(
        'resultFeedback'
      );


    if (resWpm) {

      resWpm.textContent =
        wpm +
        ' WPM';

    }


    if (resAcc) {

      resAcc.textContent =
        accuracy +
        '%';

    }


    if (resErrors) {

      resErrors.textContent =
        totalErrors;

    }


    if (resWords) {

      resWords.textContent =
        wordCount;

    }


    if (feedback) {

      feedback.textContent =
        getFeedback(
          wpm,
          accuracy
        );

    }


    resultPanel
      .classList
      .remove(
        'hidden'
      );


    resultPanel.scrollIntoView({

      behavior:
        'smooth',

      block:
        'nearest'

    });

  }



  highlightKey(
    null
  );


  const fill =
    document.getElementById(
      'progressFill'
    );


  if (fill) {

    fill.style.width =
      '100%';

  }

}



// =========================================
// DICAS DA HOME
// =========================================

function renderTips() {

  const container =
    document.getElementById(
      'tipsCarousel'
    );


  if (!container) {

    return;

  }


  container.innerHTML =

    TIPS
      .map(
        tip => `

          <div class="tip-card">

            <div class="tip-tag">
              ${tip.tag}
            </div>

            <h4>
              ${tip.title}
            </h4>

            <p>
              ${tip.text}
            </p>

          </div>

        `
      )
      .join('');

}



// =========================================
// TECLADO FÍSICO
// =========================================

function handleKeydown(e) {

  const practiceScreen =
    document.getElementById(
      'screen-practice'
    );


  if (
    practiceScreen
      ?.classList
      .contains(
        'active'
      )
  ) {

    const input =
      document.getElementById(
        'typingInput'
      );


    if (
      document.activeElement !==
        input &&
      !inputLocked
    ) {

      if (

        e.key.length === 1 &&

        !e.ctrlKey &&

        !e.altKey &&

        !e.metaKey

      ) {

        focusInput();

      }

    }

  }

}



// =========================================
// INIT
// =========================================

document.addEventListener(

  'DOMContentLoaded',

  () => {


    // =====================================
    // TECLADO VIRTUAL
    // =====================================

    buildKeyboard();



    // =====================================
    // DICAS
    // =====================================

    renderTips();



    // =====================================
    // MENU
    // =====================================

    document
      .querySelectorAll(
        '.nav-btn'
      )
      .forEach(
        button => {

          button.addEventListener(

            'click',

            () => {

              navigateTo(
                button.dataset.screen
              );

            }

          );

        }
      );



    // =====================================
    // INPUT DE DIGITAÇÃO
    // =====================================

    const input =
      document.getElementById(
        'typingInput'
      );


    if (input) {

      input.addEventListener(
        'input',
        handleInput
      );


      input.addEventListener(

        'keydown',

        e => {

          if (
            e.key === 'Tab'
          ) {

            e.preventDefault();

          }

        }

      );

    }



    // =====================================
    // CLIQUE NA CAIXA
    // =====================================

    const container =
      document.querySelector(
        '.text-display-container'
      );


    if (container) {

      container.addEventListener(

        'click',

        focusInput

      );

    }



    // =====================================
    // TECLADO GLOBAL
    // =====================================

    document.addEventListener(
      'keydown',
      handleKeydown
    );



    // =====================================
    // HOME
    // =====================================

    navigateTo(
      'home'
    );



    // =====================================
    // BOAS-VINDAS
    // =====================================

    if (
      typeof checkWelcome ===
      'function'
    ) {

      setTimeout(
        checkWelcome,
        200
      );

    }


    initWelcome();



    // =====================================
    // MELHOR WPM NA HOME
    // =====================================

    setTimeout(

      () => {

        const ring =
          document.getElementById(
            'heroRing'
          );


        const sessions =
          loadSessions();


        if (
          ring &&
          sessions.length
        ) {

          const bestWpm =
            Math.max(

              ...sessions.map(
                session =>
                  session.wpm
              )

            );


          const percentage =
            Math.min(

              bestWpm /
              100,

              1

            );


          ring.setAttribute(

            'stroke-dasharray',

            (
              percentage *
              314
            )

            +

            ' 314'

          );


          const heroWpm =
            document.getElementById(
              'heroWpm'
            );


          if (heroWpm) {

            heroWpm.textContent =
              bestWpm;

          }

        }

      },

      600

    );

  }

);

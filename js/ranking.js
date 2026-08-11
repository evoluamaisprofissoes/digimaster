// =========================================
// DigiMaster - Ranking + Painel do Professor v4.1
// Progresso por nível + certificação + navegação segura
// =========================================

const DM_LEVEL_META = {
  basico: { icon: '🌱', label: 'Básico', short: 'BAS' },
  intermediario: { icon: '⚡', label: 'Intermediário', short: 'INT' },
  avancado: { icon: '🔥', label: 'Avançado', short: 'AVA' },
  numeros: { icon: '🔢', label: 'Números & Símbolos', short: 'NUM' }
};

let _adminData = [];
let _adminSearch = '';
let _adminFilter = 'all';
let _activeAdminUid = null;
const _adminDetailCache = {};


// =========================================
// HELPERS
// =========================================

function dmEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function dmTimestampMs(value) {

  if (!value) {
    return 0;
  }


  if (typeof value.toMillis === 'function') {

    return value.toMillis();

  }


  if (typeof value.toDate === 'function') {

    return value
      .toDate()
      .getTime();

  }


  const date =
    new Date(value);


  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();

}


function dmToDate(value) {

  const ms =
    dmTimestampMs(value);


  return ms
    ? new Date(ms)
    : null;

}


function dmFormatDate(
  value,
  withTime = true
) {

  const date =
    dmToDate(value);


  if (!date) {
    return '—';
  }


  return date.toLocaleDateString(

    'pt-BR',

    withTime

      ? {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }

      : {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }

  );

}


// =========================================
// CONFIGURAÇÃO DOS NÍVEIS
// =========================================

function dmLevelConfig() {

  return window
    .DIGIMASTER_LEVEL_CONFIG

    || {

      basico: {

        title: 'Básico',

        total: 16,

        ids: Array.from(
          { length: 16 },
          (_, i) => `b${i}`
        )

      },


      intermediario: {

        title: 'Intermediário',

        total: 13,

        ids: Array.from(
          { length: 13 },
          (_, i) => `i${i + 1}`
        )

      },


      avancado: {

        title: 'Avançado',

        total: 11,

        ids: Array.from(
          { length: 11 },
          (_, i) => `a${i + 1}`
        )

      },


      numeros: {

        title: 'Números & Símbolos',

        total: 12,

        ids: Array.from(
          { length: 12 },
          (_, i) => `n${i + 1}`
        )

      }

    };

}


// =========================================
// STATUS DO NÍVEL
// =========================================

function dmUserLevelStatus(
  user,
  key
) {

  if (
    user?._detailLevels?.[key]
  ) {

    return user
      ._detailLevels[key];

  }


  const config =
    dmLevelConfig()[key]
    || {};


  const progress =
    user?.levelProgress?.[key]
    || {};


  const completion =
    user?.levelCompletions?.[key]
    || {};


  const total =
    Number(

      progress.total
      || config.total
      || 0

    );


  const completed =
    Number(

      progress.completed
      || 0

    );


  const isComplete =

    !!completion.completedAt

    || progress.isComplete === true

    || (
      total > 0
      && completed >= total
    );


  const percent =

    isComplete

      ? 100

      : Number(

          progress.percent

          || (
            total

              ? Math.round(
                  completed
                  / total
                  * 100
                )

              : 0
          )

        );


  return {

    total,

    completed:

      isComplete
      && completed === 0

        ? total

        : completed,

    isComplete,

    percent,

    completedAt:
      completion.completedAt
      || null,

    bestWpm: 0,

    avgAccuracy: 0

  };

}


// =========================================
// RANKING
// =========================================

window.loadRanking =
async function (
  field = 'wpm',
  btn = null
) {

  document
    .querySelectorAll(
      '.rank-filter-btn'
    )
    .forEach(

      button =>
        button
          .classList
          .remove(
            'active'
          )

    );


  if (btn) {

    btn.classList.add(
      'active'
    );

  }


  const list =
    document.getElementById(
      'rankingList'
    );


  const myPos =
    document.getElementById(
      'rankingMyPos'
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    '<div class="ranking-loading">⏳ Carregando ranking...</div>';


  if (myPos) {

    myPos.textContent =
      '';

  }


  const db =
    window._firestoreDb;


  const lib =
    window._firestoreLib;


  if (
    !db
    || !lib
  ) {

    renderLocalRanking(
      field
    );

    return;

  }


  try {

    const {
      collection,
      getDocs,
      orderBy,
      query,
      limit
    } = lib;


    const fieldMap = {

      wpm: 'bestWpm',

      accuracy:
        'bestAccuracy',

      sessions:
        'totalSessions'

    };


    const key =
      fieldMap[field]
      || 'bestWpm';


    const snap =
      await getDocs(

        query(

          collection(
            db,
            'users'
          ),

          orderBy(
            key,
            'desc'
          ),

          limit(50)

        )

      );


    const users =
      [];


    snap.forEach(

      item =>

        users.push({

          uid: item.id,

          ...item.data()

        })

    );


    renderRankingUI(
      users,
      field
    );


    if (
      window.currentUser
      && myPos
    ) {

      const index =
        users.findIndex(

          user =>
            user.uid ===
            window.currentUser.uid

        );


      myPos.textContent =

        index >= 0

          ? `Sua posição: #${index + 1} de ${users.length} alunos`

          : 'Complete uma sessão para entrar no ranking!';

    }

  }

  catch (error) {

    console.warn(
      'Ranking online indisponível:',
      error
    );


    renderLocalRanking(
      field
    );

  }

};


// =========================================
// RANKING LOCAL
// =========================================

function renderLocalRanking(
  field
) {

  const list =
    document.getElementById(
      'rankingList'
    );


  const myPos =
    document.getElementById(
      'rankingMyPos'
    );


  if (!list) {
    return;
  }


  const sessions =

    typeof loadSessions ===
      'function'

      ? loadSessions()

      : [];


  if (!sessions.length) {

    list.innerHTML =

      '<div class="ranking-loading">Entre com sua conta para ver o ranking da turma.</div>';


    return;

  }


  const name =

    window.currentUser
      ?.displayName

    || 'Você';


  const bestWpm =

    Math.max(

      ...sessions.map(

        session =>

          Number(
            session.wpm
            || 0
          )

      )

    );


  const avgAcc =

    Math.round(

      sessions.reduce(

        (
          total,
          session
        ) =>

          total
          + Number(
              session.accuracy
              || 0
            ),

        0

      )

      / sessions.length

    );


  renderRankingUI(

    [

      {

        uid: 'me',

        name,

        bestWpm,

        totalSessions:
          sessions.length,

        bestAccuracy:
          avgAcc,

        isMe: true

      }

    ],

    field

  );


  if (myPos) {

    myPos.textContent =

      'Ranking local. Entre com sua conta para sincronizar seus resultados.';

  }

}


// =========================================
// INTERFACE DO RANKING
// =========================================

function renderRankingUI(
  users,
  field
) {

  const list =
    document.getElementById(
      'rankingList'
    );


  if (!list) {
    return;
  }


  if (!users.length) {

    list.innerHTML =

      '<div class="ranking-loading">Nenhum aluno no ranking ainda.</div>';


    return;

  }


  const fieldKey = {

    wpm:
      'bestWpm',

    accuracy:
      'bestAccuracy',

    sessions:
      'totalSessions'

  };


  const fieldLabel = {

    wpm:
      'WPM',

    accuracy:
      '%',

    sessions:
      'sessões'

  };


  const key =
    fieldKey[field]
    || 'bestWpm';


  const label =
    fieldLabel[field]
    || 'WPM';


  const medals = [
    '🥇',
    '🥈',
    '🥉'
  ];


  list.innerHTML =

    users

      .map(

        (
          user,
          index
        ) => {


          const isMe =

            user.isMe

            || (
              window.currentUser

              && user.uid ===
                window.currentUser.uid
            );


          const avatar =

            user.photoURL

              ? `

                <img
                  src="${dmEscape(
                    user.photoURL
                  )}"
                  style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    border-radius:50%
                  "
                >

              `

              : dmEscape(

                  (
                    user.name
                    || 'A'
                  )[0]
                    .toUpperCase()

                );


          return `

            <div
              class="
                rank-item

                ${
                  index === 0

                    ? 'rank-1'

                    : index === 1

                      ? 'rank-2'

                      : index === 2

                        ? 'rank-3'

                        : ''
                }

                ${
                  isMe
                    ? 'is-me'
                    : ''
                }
              "
            >

              <div
                class="rank-pos"
              >

                ${
                  medals[index]
                  || '#' + (index + 1)
                }

              </div>


              <div
                class="rank-avatar"
              >

                ${avatar}

              </div>


              <div
                class="rank-info"
              >

                <div
                  class="rank-name"
                >

                  ${dmEscape(
                    user.name
                    || 'Aluno'
                  )}

                  ${
                    isMe

                      ? `
                        <span
                          style="
                            color:var(--accent);
                            font-size:11px
                          "
                        >
                          (você)
                        </span>
                      `

                      : ''
                  }

                </div>


                <div
                  class="rank-sub"
                >

                  ${
                    Number(
                      user.totalSessions
                      || 0
                    )
                  }

                  sessões ·

                  ${
                    Number(
                      user.bestAccuracy
                      || 0
                    )
                  }%

                  precisão

                </div>

              </div>


              <div
                style="
                  text-align:right
                "
              >

                <div
                  class="rank-val"
                >

                  ${
                    Number(
                      user[key]
                      || 0
                    )
                  }

                </div>


                <div
                  class="rank-val-label"
                >

                  ${label}

                </div>

              </div>

            </div>

          `;

        }

      )

      .join('');

}


// =========================================
// CRIAR PAINEL ADMIN
// =========================================

function ensureAdminDashboard() {

  const screen =
    document.getElementById(
      'screen-admin'
    );


  if (
    !screen

    || screen.dataset.dmAdminV41 ===
      '1'
  ) {

    return;

  }


  screen.dataset.dmAdminV41 =
    '1';


  screen.innerHTML = `

    <div
      class="dm-admin-wrap"
    >


      <div
        class="dm-admin-titlebar"
      >

        <div>

          <div
            class="dm-admin-kicker"
          >
            👨‍🏫 PAINEL ADMINISTRATIVO
          </div>


          <h2>
            Acompanhamento dos alunos
          </h2>


          <p>
            Desempenho, progresso das lições
            e níveis liberados para certificação.
          </p>

        </div>


        <button
          class="btn-secondary"
          onclick="exportAdminCSV()"
        >
          📥 Exportar CSV
        </button>

      </div>


      <div
        class="dm-admin-summary"
      >

        <div
          class="dm-summary-card"
        >

          <strong
            id="adminTotalAlunos"
          >
            0
          </strong>

          <span>
            ALUNOS
          </span>

        </div>


        <div
          class="dm-summary-card"
        >

          <strong
            id="adminMediaWpm"
          >
            —
          </strong>

          <span>
            MÉDIA WPM
          </span>

        </div>


        <div
          class="dm-summary-card"
        >

          <strong
            id="adminMediaAcc"
          >
            —
          </strong>

          <span>
            PRECISÃO MÉDIA
          </span>

        </div>


        <div
          class="dm-summary-card"
        >

          <strong
            id="adminCertReady"
          >
            0
          </strong>

          <span>
            NÍVEIS CONCLUÍDOS
          </span>

        </div>

      </div>


      <div
        class="dm-admin-controls"
      >

        <input
          id="adminSearch"
          type="search"
          placeholder="🔎 Buscar aluno ou e-mail..."
          oninput="filterAdminTable(this.value)"
        >


        <select
          id="adminLevelFilter"
          onchange="filterAdminLevel(this.value)"
        >

          <option
            value="all"
          >
            Todos os alunos
          </option>

          <option
            value="ready"
          >
            Com nível concluído
          </option>

          <option
            value="basico"
          >
            Básico concluído
          </option>

          <option
            value="intermediario"
          >
            Intermediário concluído
          </option>

          <option
            value="avancado"
          >
            Avançado concluído
          </option>

          <option
            value="numeros"
          >
            Números concluído
          </option>

        </select>


        <div
          class="dm-admin-sort"
        >

          <button
            class="active"
            onclick="sortAdmin('wpm',this)"
          >
            WPM
          </button>

          <button
            onclick="sortAdmin('accuracy',this)"
          >
            Precisão
          </button>

          <button
            onclick="sortAdmin('sessions',this)"
          >
            Sessões
          </button>

          <button
            onclick="sortAdmin('last',this)"
          >
            Atividade
          </button>

          <button
            onclick="sortAdmin('name',this)"
          >
            Nome
          </button>

        </div>

      </div>


      <div
        class="dm-admin-table-wrap"
      >

        <table
          class="dm-admin-table"
        >

          <thead>

            <tr>

              <th>#</th>

              <th>
                Aluno
              </th>

              <th>
                WPM
              </th>

              <th>
                Precisão
              </th>

              <th>
                Sessões
              </th>

              <th>
                Progresso / Certificação
              </th>

              <th>
                Última atividade
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody
            id="adminBody"
          >
          </tbody>

        </table>

      </div>


      <div
        id="adminEmpty"
        class="dm-admin-empty"
        style="
          display:none
        "
      >
        Nenhum aluno encontrado.
      </div>

    </div>


    <div
      id="adminDetailModal"
      class="dm-detail-overlay"
      style="
        display:none
      "
      aria-hidden="true"
      onclick="
        if(event.target===this)
        closeAdminDetail()
      "
    >

      <div
        class="dm-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ficha do aluno"
      >


        <div
          class="dm-detail-toolbar"
        >

          <button
            class="dm-back-btn"
            type="button"
            onclick="closeAdminDetail()"
          >
            ← Voltar ao painel
          </button>


          <span
            class="dm-detail-toolbar-title"
          >
            Ficha do aluno
          </span>


          <button
            class="dm-detail-close"
            type="button"
            aria-label="Fechar ficha"
            title="Fechar"
            onclick="closeAdminDetail()"
          >
            ✕
          </button>

        </div>


        <div
          id="adminDetailContent"
        >
        </div>

      </div>

    </div>

  `;

}


// =========================================
// FECHAR / RESETAR FICHA
// =========================================

window.closeAdminDetail =
function () {

  const overlay =
    document.getElementById(
      'adminDetailModal'
    );


  const content =
    document.getElementById(
      'adminDetailContent'
    );


  const modalCard =
    overlay
      ?.querySelector(
        '.dm-detail-modal'
      );


  if (overlay) {

    overlay.style.display =
      'none';


    overlay.setAttribute(
      'aria-hidden',
      'true'
    );

  }


  if (content) {

    content.innerHTML =
      '';

  }


  if (modalCard) {

    modalCard.scrollTop =
      0;

  }


  _activeAdminUid =
    null;


  document.body
    .classList
    .remove(
      'dm-modal-open'
    );

};


// =========================================
// RESET COMPLETO DO PAINEL
// Usado também pelo Firebase no logoff.
// =========================================

window.resetAdminPanelState =
function (
  options = {}
) {

  const clearData =
    options.clearData ===
    true;


  window.closeAdminDetail();


  _adminSearch =
    '';


  _adminFilter =
    'all';


  const searchInput =
    document.getElementById(
      'adminSearch'
    );


  const levelFilter =
    document.getElementById(
      'adminLevelFilter'
    );


  if (searchInput) {

    searchInput.value =
      '';

  }


  if (levelFilter) {

    levelFilter.value =
      'all';

  }


  if (clearData) {

    _adminData =
      [];


    Object
      .keys(
        _adminDetailCache
      )
      .forEach(

        key => {

          delete _adminDetailCache[
            key
          ];

        }

      );


    const body =
      document.getElementById(
        'adminBody'
      );


    const empty =
      document.getElementById(
        'adminEmpty'
      );


    if (body) {

      body.innerHTML =
        '';

    }


    if (empty) {

      empty.style.display =
        'none';

    }

  }

};


// =========================================
// CARREGAR ALUNOS
// =========================================

window.loadAdminData =
async function () {

  ensureAdminDashboard();


  // Toda entrada no painel
  // começa na lista de alunos.

  window.closeAdminDetail();


  const body =
    document.getElementById(
      'adminBody'
    );


  if (!body) {
    return;
  }


  body.innerHTML = `

    <tr>

      <td
        colspan="8"
        class="dm-admin-message"
      >
        ⏳ Carregando alunos...
      </td>

    </tr>

  `;


  const db =
    window._firestoreDb;


  const lib =
    window._firestoreLib;


  if (
    !db
    || !lib
  ) {

    body.innerHTML = `

      <tr>

        <td
          colspan="8"
          class="
            dm-admin-message
            dm-error
          "
        >
          ⚠️ Firebase não conectado.
        </td>

      </tr>

    `;


    return;

  }


  try {

    const {
      collection,
      getDocs,
      orderBy,
      query
    } = lib;


    const snap =
      await getDocs(

        query(

          collection(
            db,
            'users'
          ),

          orderBy(
            'bestWpm',
            'desc'
          )

        )

      );


    _adminData =
      [];


    snap.forEach(

      item => {

        _adminData.push({

          uid:
            item.id,

          ...item.data()

        });

      }

    );


    // =====================================
    // CARREGAR LIÇÕES DE CADA ALUNO
    // =====================================

    await Promise.all(

      _adminData.map(

        async user => {

          try {

            const lessonSnap =
              await getDocs(

                collection(

                  db,

                  'users',

                  user.uid,

                  'lessons'

                )

              );


            const records =
              [];


            lessonSnap.forEach(

              item => {

                records.push({

                  id:
                    item.id,

                  ...item.data()

                });

              }

            );


            user._lessonRecords =
              records;


            user._detailLevels =

              computeLevelDetails(

                user,

                records

              );

          }

          catch (error) {

            console.warn(

              'Progresso de '
              + user.uid,

              error

            );

          }

        }

      )

    );


    _updateAdminSummary(
      _adminData
    );


    _applyAdminFilters();

  }

  catch (error) {

    body.innerHTML = `

      <tr>

        <td
          colspan="8"
          class="
            dm-admin-message
            dm-error
          "
        >

          Erro ao carregar alunos:

          ${dmEscape(
            error.message
          )}

        </td>

      </tr>

    `;

  }

};


// =========================================
// RESUMO
// =========================================

function _updateAdminSummary(
  users
) {

  const totalWpm =

    users.reduce(

      (
        total,
        user
      ) =>

        total
        + Number(
            user.bestWpm
            || 0
          ),

      0

    );


  const totalAccuracy =

    users.reduce(

      (
        total,
        user
      ) =>

        total
        + Number(
            user.bestAccuracy
            || 0
          ),

      0

    );


  let completedLevels =
    0;


  users.forEach(

    user => {

      Object
        .keys(
          DM_LEVEL_META
        )
        .forEach(

          key => {

            if (
              dmUserLevelStatus(
                user,
                key
              )
                .isComplete
            ) {

              completedLevels++;

            }

          }

        );

    }

  );


  const element =
    id =>
      document.getElementById(
        id
      );


  if (
    element(
      'adminTotalAlunos'
    )
  ) {

    element(
      'adminTotalAlunos'
    )
      .textContent =
      users.length;

  }


  if (
    element(
      'adminMediaWpm'
    )
  ) {

    element(
      'adminMediaWpm'
    )
      .textContent =

      users.length

        ? Math.round(
            totalWpm
            / users.length
          )
          + ' WPM'

        : '—';

  }


  if (
    element(
      'adminMediaAcc'
    )
  ) {

    element(
      'adminMediaAcc'
    )
      .textContent =

      users.length

        ? Math.round(
            totalAccuracy
            / users.length
          )
          + '%'

        : '—';

  }


  if (
    element(
      'adminCertReady'
    )
  ) {

    element(
      'adminCertReady'
    )
      .textContent =
      completedLevels;

  }

}


// =========================================
// FILTROS
// =========================================

function _applyAdminFilters() {

  let users =
    [
      ..._adminData
    ];


  const search =

    _adminSearch
      .trim()
      .toLowerCase();


  if (search) {

    users =
      users.filter(

        user =>

          String(
            user.name
            || ''
          )
            .toLowerCase()
            .includes(
              search
            )

          ||

          String(
            user.email
            || ''
          )
            .toLowerCase()
            .includes(
              search
            )

      );

  }


  if (
    _adminFilter ===
    'ready'
  ) {

    users =
      users.filter(

        user =>

          Object
            .keys(
              DM_LEVEL_META
            )
            .some(

              key =>

                dmUserLevelStatus(
                  user,
                  key
                )
                  .isComplete

            )

      );

  }


  else if (
    DM_LEVEL_META[
      _adminFilter
    ]
  ) {

    users =
      users.filter(

        user =>

          dmUserLevelStatus(

            user,

            _adminFilter

          )
            .isComplete

      );

  }


  _renderAdminTable(
    users
  );

}


// =========================================
// TABELA
// =========================================

function _renderAdminTable(
  users
) {

  const body =
    document.getElementById(
      'adminBody'
    );


  const empty =
    document.getElementById(
      'adminEmpty'
    );


  if (!body) {
    return;
  }


  if (!users.length) {

    body.innerHTML =
      '';


    if (empty) {

      empty.style.display =
        'block';

    }


    return;

  }


  if (empty) {

    empty.style.display =
      'none';

  }


  body.innerHTML =

    users

      .map(

        (
          user,
          index
        ) => {


          const last =

            user.lastSession

            || user.lastLessonAt;


          const days =

            last

              ? (
                  Date.now()
                  - dmTimestampMs(
                      last
                    )
                )
                / 86400000

              : Infinity;


          let status =
            '⚪ Inativo';


          let statusClass =
            'inactive';


          if (
            days < 1
          ) {

            status =
              '🟢 Hoje';

            statusClass =
              'today';

          }


          else if (
            days < 7
          ) {

            status =
              '🟡 Esta semana';

            statusClass =
              'week';

          }


          else if (
            days < 30
          ) {

            status =
              '🟠 Este mês';

            statusClass =
              'month';

          }


          const avatar =

            user.photoURL

              ? `

                <img
                  src="${dmEscape(
                    user.photoURL
                  )}"
                >

              `

              : `

                <span>

                  ${dmEscape(

                    (
                      user.name
                      || 'A'
                    )[0]
                      .toUpperCase()

                  )}

                </span>

              `;


          const pills =

            Object
              .entries(
                DM_LEVEL_META
              )
              .map(

                (
                  [
                    key,
                    meta
                  ]
                ) => {


                  const progress =

                    dmUserLevelStatus(

                      user,

                      key

                    );


                  if (
                    progress.isComplete
                  ) {

                    return `

                      <span
                        class="
                          dm-level-pill
                          complete
                        "
                        title="
                          ${meta.label}
                          concluído
                        "
                      >

                        ${meta.icon} ✓

                      </span>

                    `;

                  }


                  if (
                    progress.completed >
                    0
                  ) {

                    return `

                      <span
                        class="
                          dm-level-pill
                          progress
                        "
                        title="
                          ${meta.label}:
                          ${progress.completed}/${progress.total}
                        "
                      >

                        ${meta.icon}
                        ${progress.percent}%

                      </span>

                    `;

                  }


                  return `

                    <span
                      class="
                        dm-level-pill
                        idle
                      "
                    >

                      ${meta.icon}
                      0%

                    </span>

                  `;

                }

              )

              .join('');


          return `

            <tr
              onclick="
                showAdminDetail(
                  '${user.uid}'
                )
              "
              title="
                Clique para abrir a ficha do aluno
              "
            >

              <td>
                ${index + 1}
              </td>


              <td>

                <div
                  class="dm-student-cell"
                >

                  <div
                    class="dm-student-avatar"
                  >
                    ${avatar}
                  </div>


                  <div>

                    <strong>

                      ${dmEscape(
                        user.name
                        || 'Aluno'
                      )}

                    </strong>


                    <small>

                      ${dmEscape(
                        user.email
                        || '—'
                      )}

                    </small>

                  </div>

                </div>

              </td>


              <td>

                <strong
                  class="dm-wpm"
                >

                  ${Number(
                    user.bestWpm
                    || 0
                  )}

                </strong>

              </td>


              <td>

                <span
                  class="
                    dm-acc

                    ${
                      Number(
                        user.bestAccuracy
                        || 0
                      ) >= 90

                        ? 'good'

                        : Number(
                            user.bestAccuracy
                            || 0
                          ) >= 80

                          ? 'ok'

                          : 'low'
                    }
                  "
                >

                  ${Number(
                    user.bestAccuracy
                    || 0
                  )}%

                </span>

              </td>


              <td>

                ${Number(
                  user.totalSessions
                  || 0
                )}

              </td>


              <td>

                <div
                  class="dm-level-pills"
                >
                  ${pills}
                </div>

              </td>


              <td
                class="dm-date-cell"
              >

                ${dmFormatDate(
                  last,
                  true
                )}

              </td>


              <td>

                <span
                  class="
                    dm-activity
                    ${statusClass}
                  "
                >

                  ${status}

                </span>

              </td>

            </tr>

          `;

        }

      )

      .join('');

}


// =========================================
// BUSCA
// =========================================

window.filterAdminTable =
function (
  value
) {

  _adminSearch =
    value
    || '';


  _applyAdminFilters();

};


// =========================================
// FILTRO NÍVEL
// =========================================

window.filterAdminLevel =
function (
  value
) {

  _adminFilter =
    value
    || 'all';


  _applyAdminFilters();

};


// =========================================
// ORDENAÇÃO
// =========================================

window.sortAdmin =
function (
  field,
  button
) {

  document
    .querySelectorAll(
      '.dm-admin-sort button'
    )
    .forEach(

      item =>
        item
          .classList
          .remove(
            'active'
          )

    );


  button
    ?.classList
    .add(
      'active'
    );


  _adminData.sort(

    (
      a,
      b
    ) => {


      if (
        field ===
        'wpm'
      ) {

        return (

          Number(
            b.bestWpm
            || 0
          )

          -

          Number(
            a.bestWpm
            || 0
          )

        );

      }


      if (
        field ===
        'accuracy'
      ) {

        return (

          Number(
            b.bestAccuracy
            || 0
          )

          -

          Number(
            a.bestAccuracy
            || 0
          )

        );

      }


      if (
        field ===
        'sessions'
      ) {

        return (

          Number(
            b.totalSessions
            || 0
          )

          -

          Number(
            a.totalSessions
            || 0
          )

        );

      }


      if (
        field ===
        'name'
      ) {

        return String(
          a.name
          || ''
        )
          .localeCompare(

            String(
              b.name
              || ''
            ),

            'pt-BR'

          );

      }


      if (
        field ===
        'last'
      ) {

        return (

          dmTimestampMs(

            b.lastSession
            || b.lastLessonAt

          )

          -

          dmTimestampMs(

            a.lastSession
            || a.lastLessonAt

          )

        );

      }


      return 0;

    }

  );


  _applyAdminFilters();

};


// =========================================
// CALCULAR PROGRESSO
// =========================================

function computeLevelDetails(
  user,
  records
) {

  const result =
    {};


  const config =
    dmLevelConfig();


  const minAccuracy =

    Number(

      window
        .DIGIMASTER_MIN_ACCURACY

      || 80

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

        level.ids
        || []

      );


    const allRecords =

      records.filter(

        record =>

          ids.has(

            record.lessonId

            || record.id

          )

      );


    const passed =

      allRecords.filter(

        record =>

          Number(
            record.accuracy
            || 0
          )

          >=

          minAccuracy

      );


    const total =

      Number(

        level.total

        || ids.size

        || 0

      );


    const completed =
      passed.length;


    const isComplete =

      total > 0

      && completed >=
      total;


    const percent =

      total

        ? Math.min(

            100,

            Math.round(

              completed
              / total
              * 100

            )

          )

        : 0;


    let derivedCompletion =
      null;


    if (
      isComplete
    ) {

      let latest =
        0;


      passed.forEach(

        record => {

          latest =
            Math.max(

              latest,

              dmTimestampMs(

                record.firstCompletedAt

                || record.completedAt

              )

            );

        }

      );


      if (latest) {

        derivedCompletion =
          new Date(
            latest
          );

      }

    }


    const bestWpm =

      passed.length

        ? Math.max(

            ...passed.map(

              record =>

                Number(
                  record.wpm
                  || 0
                )

            )

          )

        : 0;


    const avgAccuracy =

      passed.length

        ? Math.round(

            passed.reduce(

              (
                totalValue,
                record
              ) =>

                totalValue

                + Number(
                    record.accuracy
                    || 0
                  ),

              0

            )

            / passed.length

          )

        : 0;


    result[
      levelKey
    ] = {

      completed,

      total,

      percent,

      isComplete,

      completedAt:

        user
          ?.levelCompletions
          ?.[levelKey]
          ?.completedAt

        || derivedCompletion,

      bestWpm,

      avgAccuracy

    };

  }


  return result;

}


// =========================================
// FICHA DO ALUNO
// =========================================

window.showAdminDetail =
async function (
  uid
) {

  const overlay =
    document.getElementById(
      'adminDetailModal'
    );


  const content =
    document.getElementById(
      'adminDetailContent'
    );


  const modalCard =
    overlay
      ?.querySelector(
        '.dm-detail-modal'
      );


  const user =
    _adminData.find(

      item =>
        item.uid ===
        uid

    );


  if (
    !overlay
    || !content
    || !user
  ) {

    return;

  }


  // Marca quem está aberto.
  // Isso evita uma resposta atrasada
  // de outro aluno aparecer depois.

  _activeAdminUid =
    uid;


  overlay.style.display =
    'flex';


  overlay.setAttribute(
    'aria-hidden',
    'false'
  );


  document.body
    .classList
    .add(
      'dm-modal-open'
    );


  if (modalCard) {

    modalCard.scrollTop =
      0;

  }


  content.innerHTML = `

    <div
      class="dm-detail-loading"
    >
      ⏳ Carregando ficha completa...
    </div>

  `;


  const db =
    window._firestoreDb;


  const lib =
    window._firestoreLib;


  const sessions =
    [];


  const lessons = [

    ...(
      user._lessonRecords
      || []
    )

  ];


  try {

    if (
      db
      && lib
    ) {

      const {
        collection,
        getDocs,
        orderBy,
        query,
        limit
      } = lib;


      try {

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

              limit(10)

            )

          );


        sessionSnap.forEach(

          item => {

            sessions.push({

              id:
                item.id,

              ...item.data()

            });

          }

        );

      }

      catch (error) {

        console.warn(

          'Não foi possível carregar as sessões:',

          error

        );

      }


      if (
        !lessons.length
      ) {

        const lessonSnap =
          await getDocs(

            collection(

              db,

              'users',

              uid,

              'lessons'

            )

          );


        lessonSnap.forEach(

          item => {

            lessons.push({

              id:
                item.id,

              ...item.data()

            });

          }

        );

      }

    }

  }

  catch (error) {

    if (
      _activeAdminUid !==
      uid
    ) {

      return;

    }


    content.innerHTML = `

      <div
        class="
          dm-admin-message
          dm-error
        "
      >

        Erro ao carregar ficha:

        ${dmEscape(
          error.message
        )}

      </div>

    `;


    return;

  }


  // Se o professor já fechou a ficha
  // ou abriu outro aluno enquanto
  // o Firebase carregava, abandona.
  if (
    _activeAdminUid !==
    uid
  ) {

    return;

  }


  const levels =

    computeLevelDetails(

      user,

      lessons

    );


  _adminDetailCache[
    uid
  ] = {

    user,

    sessions,

    lessons,

    levels

  };


  const avatar =

    user.photoURL

      ? `

        <img
          class="dm-detail-avatar"
          src="${dmEscape(
            user.photoURL
          )}"
        >

      `

      : `

        <div
          class="
            dm-detail-avatar
            dm-detail-avatar-letter
          "
        >

          ${dmEscape(

            (
              user.name
              || 'A'
            )[0]
              .toUpperCase()

          )}

        </div>

      `;


  const levelCards =

    Object
      .entries(
        DM_LEVEL_META
      )
      .map(

        (
          [
            levelKey,
            meta
          ]
        ) => {


          const progress =
            levels[
              levelKey
            ];


          const missing =

            Math.max(

              0,

              progress.total
              - progress.completed

            );


          return `

            <div
              class="
                dm-level-card

                ${
                  progress.isComplete
                    ? 'complete'
                    : ''
                }
              "
            >


              <div
                class="dm-level-card-head"
              >

                <div>

                  <span
                    class="dm-level-icon"
                  >
                    ${meta.icon}
                  </span>

                  <strong>
                    ${meta.label}
                  </strong>

                </div>


                <span
                  class="dm-level-count"
                >

                  ${progress.completed}/${progress.total}

                </span>

              </div>


              <div
                class="dm-level-bar"
              >

                <span
                  style="
                    width:${progress.percent}%
                  "
                >
                </span>

              </div>


              <div
                class="dm-level-percent"
              >

                ${progress.percent}%
                concluído

              </div>


              ${
                progress.isComplete

                  ? `

                    <div
                      class="dm-level-done"
                    >
                      ✅ NÍVEL CONCLUÍDO
                    </div>


                    <div
                      class="dm-level-date"
                    >

                      Conclusão:

                      ${dmFormatDate(
                        progress.completedAt,
                        true
                      )}

                    </div>


                    <div
                      class="dm-level-stats"
                    >

                      Melhor WPM:

                      <b>
                        ${progress.bestWpm}
                      </b>

                      ·

                      Precisão média:

                      <b>
                        ${progress.avgAccuracy}%
                      </b>

                    </div>


                    <button
                      class="dm-cert-btn"
                      onclick="
                        generateLevelCertificate(
                          '${uid}',
                          '${levelKey}'
                        )
                      "
                    >

                      📜 Gerar certificado
                      ${meta.label}

                    </button>

                  `

                  : `

                    <div
                      class="dm-level-pending"
                    >

                      🟡 Em andamento ·
                      faltam
                      ${missing}

                      ${
                        missing === 1
                          ? 'lição'
                          : 'lições'
                      }

                    </div>


                    <div
                      class="dm-level-stats"
                    >

                      Melhor WPM:

                      <b>
                        ${progress.bestWpm}
                      </b>

                      ·

                      Precisão média:

                      <b>
                        ${progress.avgAccuracy}%
                      </b>

                    </div>

                  `
              }

            </div>

          `;

        }

      )

      .join('');


  const history =

    sessions.length

      ? `

        <div
          class="dm-session-table-wrap"
        >

          <table
            class="dm-session-table"
          >

            <thead>

              <tr>

                <th>
                  Data
                </th>

                <th>
                  WPM
                </th>

                <th>
                  Precisão
                </th>

                <th>
                  Erros
                </th>

                <th>
                  Nível
                </th>

              </tr>

            </thead>


            <tbody>

              ${

                sessions

                  .map(

                    session => {


                      const meta =

                        DM_LEVEL_META[
                          session.level
                        ]

                        || {

                          icon:
                            '⌨️',

                          label:
                            session.level
                            || 'Livre'

                        };


                      return `

                        <tr>

                          <td>

                            ${dmFormatDate(
                              session.timestamp,
                              true
                            )}

                          </td>


                          <td>

                            <b>

                              ${Number(
                                session.wpm
                                || 0
                              )}

                            </b>

                          </td>


                          <td>

                            ${Number(
                              session.accuracy
                              || 0
                            )}%

                          </td>


                          <td>

                            ${Number(
                              session.errors
                              || 0
                            )}

                          </td>


                          <td>

                            ${meta.icon}
                            ${meta.label}

                          </td>

                        </tr>

                      `;

                    }

                  )

                  .join('')

              }

            </tbody>

          </table>

        </div>

      `

      : `

        <div
          class="dm-no-data"
        >
          Nenhuma sessão registrada.
        </div>

      `;


  content.innerHTML = `

    <div
      class="dm-detail-header"
    >

      ${avatar}


      <div>

        <h2>

          ${dmEscape(
            user.name
            || 'Aluno'
          )}

        </h2>


        <p>

          ${dmEscape(
            user.email
            || '—'
          )}

        </p>


        <span>

          Última atividade:

          ${dmFormatDate(

            user.lastSession
            || user.lastLessonAt,

            true

          )}

        </span>

      </div>

    </div>


    <div
      class="dm-detail-metrics"
    >

      <div>

        <strong>

          ${Number(
            user.bestWpm
            || 0
          )}

        </strong>

        <span>
          MELHOR WPM
        </span>

      </div>


      <div>

        <strong>

          ${Number(
            user.bestAccuracy
            || 0
          )}%

        </strong>

        <span>
          PRECISÃO MÁX.
        </span>

      </div>


      <div>

        <strong>

          ${Number(
            user.totalSessions
            || 0
          )}

        </strong>

        <span>
          SESSÕES
        </span>

      </div>


      <div>

        <strong>

          ${
            lessons.filter(

              lesson =>

                Number(
                  lesson.accuracy
                  || 0
                )

                >=

                Number(
                  window
                    .DIGIMASTER_MIN_ACCURACY
                  || 80
                )

            ).length
          }

        </strong>

        <span>
          LIÇÕES CONCLUÍDAS
        </span>

      </div>

    </div>


    <div
      class="dm-section-title"
    >
      🎓 Progresso e certificações
    </div>


    <div
      class="dm-level-grid"
    >

      ${levelCards}

    </div>


    <div
      class="dm-section-title"
    >
      📊 Últimas 10 sessões
    </div>


    ${history}

  `;


  // Sempre começa no topo.

  requestAnimationFrame(

    () => {

      if (
        _activeAdminUid === uid
        && modalCard
      ) {

        modalCard.scrollTop =
          0;

      }

    }

  );

};


// =========================================
// CERTIFICADO POR NÍVEL
// =========================================

window.generateLevelCertificate =
function (
  uid,
  levelKey
) {

  const cached =
    _adminDetailCache[
      uid
    ];


  const meta =
    DM_LEVEL_META[
      levelKey
    ];


  const level =
    cached
      ?.levels
      ?.[levelKey];


  const user =
    cached
      ?.user;


  if (
    !cached
    || !meta
    || !level
    || !user
  ) {

    window
      .showToast
      ?.(
        '⚠️ Abra a ficha do aluno novamente.'
      );


    return;

  }


  if (
    !level.isComplete
  ) {

    window
      .showToast
      ?.(
        '⚠️ Este nível ainda não foi concluído.'
      );


    return;

  }


  const JsPDF =
    window.jspdf
      ?.jsPDF;


  if (!JsPDF) {

    window
      .showToast
      ?.(
        '⚠️ Gerador de PDF não carregado. Atualize a página.'
      );


    return;

  }


  const completionDate =

    dmToDate(
      level.completedAt
    )

    || new Date();


  const completionText =

    completionDate
      .toLocaleDateString(

        'pt-BR',

        {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }

      );


  const issueText =

    new Date()
      .toLocaleDateString(

        'pt-BR',

        {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }

      );


  const code =

    `DM-${meta.short}-${
      String(uid)
        .slice(
          0,
          8
        )
        .toUpperCase()
    }-${
      completionDate
        .toISOString()
        .slice(
          0,
          10
        )
        .replaceAll(
          '-',
          ''
        )
    }`;


  const pdf =

    new JsPDF({

      orientation:
        'landscape',

      unit:
        'mm',

      format:
        'a4'

    });


  const W =
    297;


  const H =
    210;


  // Fundo

  pdf.setFillColor(
    12,
    12,
    20
  );


  pdf.rect(
    0,
    0,
    W,
    H,
    'F'
  );


  // Moldura

  pdf.setDrawColor(
    122,
    60,
    255
  );


  pdf.setLineWidth(
    2.2
  );


  pdf.rect(
    10,
    10,
    W - 20,
    H - 20
  );


  pdf.setDrawColor(
    0,
    207,
    255
  );


  pdf.setLineWidth(
    0.5
  );


  pdf.rect(
    15,
    15,
    W - 30,
    H - 30
  );


  // Marca

  pdf.setTextColor(
    255,
    255,
    255
  );


  pdf.setFont(
    'helvetica',
    'bold'
  );


  pdf.setFontSize(
    15
  );


  pdf.text(

    'EVOLUA+ PROFISSOES',

    W / 2,

    34,

    {
      align:
        'center'
    }

  );


  // Título

  pdf.setTextColor(
    0,
    207,
    255
  );


  pdf.setFontSize(
    31
  );


  pdf.text(

    'CERTIFICADO DIGIMASTER',

    W / 2,

    58,

    {
      align:
        'center'
    }

  );


  // Texto

  pdf.setTextColor(
    210,
    210,
    220
  );


  pdf.setFont(
    'helvetica',
    'normal'
  );


  pdf.setFontSize(
    12
  );


  pdf.text(

    'Certificamos que',

    W / 2,

    77,

    {
      align:
        'center'
    }

  );


  // Nome

  pdf.setTextColor(
    255,
    255,
    255
  );


  pdf.setFont(
    'helvetica',
    'bold'
  );


  pdf.setFontSize(
    25
  );


  pdf.text(

    String(
      user.name
      || 'Aluno'
    ),

    W / 2,

    94,

    {
      align:
        'center'
    }

  );


  // Descrição

  pdf.setTextColor(
    210,
    210,
    220
  );


  pdf.setFont(
    'helvetica',
    'normal'
  );


  pdf.setFontSize(
    12
  );


  pdf.text(

    'concluiu com aproveitamento todas as licoes do nivel',

    W / 2,

    110,

    {
      align:
        'center'
    }

  );


  // Nível

  pdf.setTextColor(
    255,
    205,
    60
  );


  pdf.setFont(
    'helvetica',
    'bold'
  );


  pdf.setFontSize(
    22
  );


  pdf.text(

    `DIGIMASTER ${meta.label.toUpperCase()}`,

    W / 2,

    127,

    {
      align:
        'center'
    }

  );


  // Dados

  pdf.setTextColor(
    205,
    205,
    215
  );


  pdf.setFont(
    'helvetica',
    'normal'
  );


  pdf.setFontSize(
    10.5
  );


  pdf.text(

    `Conclusao: ${completionText}   |   ${level.total} licoes   |   Criterio minimo: ${Number(
      window.DIGIMASTER_MIN_ACCURACY
      || 80
    )}% de precisao`,

    W / 2,

    143,

    {
      align:
        'center'
    }

  );


  pdf.text(

    `Melhor WPM nas licoes: ${level.bestWpm}   |   Precisao media: ${level.avgAccuracy}%`,

    W / 2,

    153,

    {
      align:
        'center'
    }

  );


  // Assinaturas

  pdf.setDrawColor(
    100,
    100,
    125
  );


  pdf.line(
    48,
    170,
    118,
    170
  );


  pdf.line(
    179,
    170,
    249,
    170
  );


  pdf.setTextColor(
    175,
    175,
    190
  );


  pdf.setFontSize(
    9
  );


  pdf.text(

    'Evolua+ Profissoes',

    83,

    176,

    {
      align:
        'center'
    }

  );


  pdf.text(

    'Responsavel pela certificacao',

    214,

    176,

    {
      align:
        'center'
    }

  );


  // Código

  pdf.setTextColor(
    125,
    125,
    145
  );


  pdf.setFontSize(
    8
  );


  pdf.text(

    `Emitido em ${issueText}   |   Codigo: ${code}`,

    W / 2,

    190,

    {
      align:
        'center'
    }

  );


  const safeName =

    String(
      user.name
      || 'aluno'
    )

      .normalize(
        'NFD'
      )

      .replace(
        /[\u0300-\u036f]/g,
        ''
      )

      .replace(
        /[^a-zA-Z0-9]+/g,
        '-'
      )

      .replace(
        /^-|-$/g,
        ''
      )

      .toLowerCase();


  pdf.save(

    `certificado-digimaster-${levelKey}-${safeName || 'aluno'}.pdf`

  );


  window
    .showToast
    ?.(
      `📜 Certificado ${meta.label} gerado!`
    );

};


// =========================================
// EXPORTAR CSV
// =========================================

window.exportAdminCSV =
function () {

  if (
    !_adminData.length
  ) {

    window
      .showToast
      ?.(
        '⚠️ Carregue os dados primeiro.'
      );


    return;

  }


  const header = [

    '#',

    'Nome',

    'Email',

    'Melhor WPM',

    'Precisão Máx.',

    'Sessões',

    'Última Atividade',

    'Básico',

    'Data Básico',

    'Intermediário',

    'Data Intermediário',

    'Avançado',

    'Data Avançado',

    'Números',

    'Data Números'

  ];


  const rows =

    _adminData.map(

      (
        user,
        index
      ) => {


        const values = [

          index + 1,

          user.name
          || '',

          user.email
          || '',

          Number(
            user.bestWpm
            || 0
          ),

          Number(
            user.bestAccuracy
            || 0
          )
          + '%',

          Number(
            user.totalSessions
            || 0
          ),

          dmFormatDate(

            user.lastSession

            || user.lastLessonAt,

            true

          )

        ];


        Object
          .keys(
            DM_LEVEL_META
          )
          .forEach(

            key => {


              const progress =

                dmUserLevelStatus(

                  user,

                  key

                );


              values.push(

                progress.isComplete

                  ? 'CONCLUÍDO'

                  : `${progress.completed}/${progress.total}`

              );


              values.push(

                progress.isComplete

                  ? dmFormatDate(
                      progress.completedAt,
                      true
                    )

                  : '—'

              );

            }

          );


        return values;

      }

    );


  const csv =

    [
      header,
      ...rows
    ]

      .map(

        row =>

          row
            .map(

              value =>

                `"${

                  String(
                    value
                  )
                    .replaceAll(
                      '"',
                      '""'
                    )

                }"`

            )
            .join(';')

      )

      .join('\n');


  const blob =

    new Blob(

      [
        '\uFEFF'
        + csv
      ],

      {
        type:
          'text/csv;charset=utf-8;'
      }

    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      'a'
    );


  link.href =
    url;


  link.download =

    `digimaster-alunos-${
      new Date()
        .toLocaleDateString(
          'pt-BR'
        )
        .replace(
          /\//g,
          '-'
        )
    }.csv`;


  link.click();


  URL.revokeObjectURL(
    url
  );


  window
    .showToast
    ?.(
      '📥 CSV exportado!'
    );

};


// =========================================
// ESTILOS DO PAINEL
// =========================================

function injectAdminStyles() {

  if (
    document.getElementById(
      'dmAdminStylesV41'
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      'style'
    );


  style.id =
    'dmAdminStylesV41';


  style.textContent = `

    .dm-admin-wrap{

      max-width:1400px;

      margin:0 auto;

      padding:10px 0 40px;

    }


    .dm-admin-titlebar{

      display:flex;

      align-items:flex-start;

      justify-content:space-between;

      gap:20px;

      margin-bottom:20px;

    }


    .dm-admin-titlebar h2{

      margin:4px 0 5px;

      font-family:var(--font-title);

      font-size:26px;

    }


    .dm-admin-titlebar p{

      margin:0;

      color:var(--text3);

      font-size:13px;

    }


    .dm-admin-kicker{

      font-family:var(--font-title);

      font-size:11px;

      letter-spacing:1.6px;

      color:var(--accent);

    }


    .dm-admin-summary{

      display:grid;

      grid-template-columns:
        repeat(4,1fr);

      gap:12px;

      margin-bottom:16px;

    }


    .dm-summary-card{

      background:var(--bg2);

      border:
        1px solid
        var(--border);

      border-radius:12px;

      padding:17px;

      text-align:center;

    }


    .dm-summary-card strong{

      display:block;

      font-family:var(--font-title);

      font-size:25px;

      color:var(--accent);

    }


    .dm-summary-card span{

      display:block;

      margin-top:4px;

      color:var(--text3);

      font-size:10px;

      letter-spacing:1px;

    }


    .dm-admin-controls{

      display:flex;

      align-items:center;

      gap:10px;

      flex-wrap:wrap;

      background:var(--bg2);

      border:
        1px solid
        var(--border);

      padding:12px;

      border-radius:12px;

      margin-bottom:14px;

    }


    .dm-admin-controls input,
    .dm-admin-controls select{

      background:var(--bg3);

      border:
        1px solid
        var(--border);

      color:var(--text);

      border-radius:8px;

      padding:10px 12px;

      outline:none;

    }


    .dm-admin-controls input{

      min-width:260px;

      flex:1;

    }


    .dm-admin-sort{

      display:flex;

      gap:5px;

      flex-wrap:wrap;

    }


    .dm-admin-sort button{

      background:var(--bg3);

      border:
        1px solid
        var(--border);

      color:var(--text2);

      padding:8px 10px;

      border-radius:7px;

      cursor:pointer;

      font-size:11px;

    }


    .dm-admin-sort button.active{

      border-color:var(--accent);

      color:var(--accent);

    }


    .dm-admin-table-wrap{

      overflow:auto;

      border:
        1px solid
        var(--border);

      border-radius:12px;

      background:var(--bg2);

    }


    .dm-admin-table{

      width:100%;

      border-collapse:collapse;

      min-width:1000px;

    }


    .dm-admin-table th{

      text-align:left;

      padding:11px 12px;

      color:var(--text3);

      font-size:10px;

      letter-spacing:1px;

      background:var(--bg3);

      border-bottom:
        1px solid
        var(--border);

    }


    .dm-admin-table td{

      padding:11px 12px;

      border-bottom:
        1px solid
        var(--bg3);

      font-size:12px;

      color:var(--text2);

    }


    .dm-admin-table tbody tr{

      cursor:pointer;

    }


    .dm-admin-table tbody tr:hover{

      background:
        rgba(
          0,
          207,
          255,
          .045
        );

    }


    .dm-student-cell{

      display:flex;

      align-items:center;

      gap:9px;

      min-width:210px;

    }


    .dm-student-cell strong{

      display:block;

      color:var(--text);

      font-size:12px;

    }


    .dm-student-cell small{

      display:block;

      color:var(--text3);

      font-size:10px;

      margin-top:2px;

    }


    .dm-student-avatar{

      width:30px;

      height:30px;

      flex:
        0 0 30px;

      border-radius:50%;

      background:
        linear-gradient(
          135deg,
          var(--accent),
          var(--accent3)
        );

      display:flex;

      align-items:center;

      justify-content:center;

      color:#05050a;

      font-weight:800;

      overflow:hidden;

    }


    .dm-student-avatar img{

      width:100%;

      height:100%;

      object-fit:cover;

    }


    .dm-wpm{

      font-family:var(--font-title);

      color:var(--accent);

      font-size:15px;

    }


    .dm-acc.good{

      color:var(--correct);

    }


    .dm-acc.ok{

      color:#ffe26a;

    }


    .dm-acc.low{

      color:var(--wrong);

    }


    .dm-level-pills{

      display:flex;

      gap:4px;

      flex-wrap:wrap;

      min-width:210px;

    }


    .dm-level-pill{

      padding:4px 6px;

      border-radius:999px;

      font-size:9px;

      border:
        1px solid
        var(--border);

      white-space:nowrap;

    }


    .dm-level-pill.complete{

      color:var(--correct);

      border-color:
        rgba(
          0,
          255,
          170,
          .35
        );

    }


    .dm-level-pill.progress{

      color:#ffe26a;

    }


    .dm-level-pill.idle{

      color:var(--text3);

    }


    .dm-date-cell{

      white-space:nowrap;

      color:
        var(--text3)
        !important;

    }


    .dm-activity.today{

      color:var(--correct);

    }


    .dm-activity.week{

      color:#ffe26a;

    }


    .dm-activity.month{

      color:#ff9d45;

    }


    .dm-activity.inactive{

      color:var(--text3);

    }


    .dm-admin-message{

      text-align:center
        !important;

      padding:28px
        !important;

      color:var(--text3)
        !important;

    }


    .dm-error{

      color:var(--wrong)
        !important;

    }


    .dm-admin-empty{

      text-align:center;

      color:var(--text3);

      padding:26px;

    }


    /* ==================================
       MODAL DA FICHA
       ================================== */

    .dm-detail-overlay{

      position:fixed;

      inset:0;

      z-index:20000;

      background:
        rgba(
          0,
          0,
          0,
          .82
        );

      backdrop-filter:
        blur(6px);

      align-items:center;

      justify-content:center;

      padding:
        78px
        20px
        20px;

      overflow:auto;

    }


    .dm-detail-modal{

      position:relative;

      width:
        min(
          980px,
          100%
        );

      max-height:
        calc(
          100vh
          - 100px
        );

      overflow:auto;

      background:
        var(--bg2);

      border:
        1px solid
        var(--border);

      border-radius:16px;

      box-shadow:
        0 22px 70px
        rgba(
          0,
          0,
          0,
          .55
        );

    }


    /* Barra fica presa no topo
       durante toda rolagem */

    .dm-detail-toolbar{

      position:sticky;

      top:0;

      z-index:5;

      display:grid;

      grid-template-columns:
        1fr
        auto
        1fr;

      align-items:center;

      gap:12px;

      min-height:56px;

      padding:
        10px
        14px;

      background:
        rgba(
          10,
          14,
          29,
          .97
        );

      border-bottom:
        1px solid
        var(--border);

      backdrop-filter:
        blur(10px);

    }


    .dm-back-btn{

      justify-self:start;

      background:
        rgba(
          0,
          207,
          255,
          .08
        );

      border:
        1px solid
        rgba(
          0,
          207,
          255,
          .28
        );

      color:
        var(--accent);

      border-radius:9px;

      padding:
        9px 12px;

      cursor:pointer;

      font-weight:800;

      font-size:11px;

    }


    .dm-back-btn:hover{

      background:
        rgba(
          0,
          207,
          255,
          .14
        );

    }


    .dm-detail-toolbar-title{

      font-family:
        var(--font-title);

      font-size:11px;

      letter-spacing:1px;

      color:var(--text2);

      white-space:nowrap;

    }


    .dm-detail-close{

      justify-self:end;

      width:38px;

      height:38px;

      display:flex;

      align-items:center;

      justify-content:center;

      background:
        rgba(
          255,
          60,
          105,
          .08
        );

      border:
        1px solid
        rgba(
          255,
          60,
          105,
          .28
        );

      border-radius:9px;

      color:var(--wrong);

      font-size:17px;

      cursor:pointer;

    }


    .dm-detail-close:hover{

      background:
        rgba(
          255,
          60,
          105,
          .14
        );

    }


    #adminDetailContent{

      padding:
        22px
        24px
        26px;

    }


    .dm-modal-open{

      overflow:hidden;

    }


    .dm-detail-loading{

      text-align:center;

      padding:40px;

      color:var(--text3);

    }


    .dm-detail-header{

      display:flex;

      align-items:center;

      gap:16px;

      margin-bottom:18px;

    }


    .dm-detail-header h2{

      margin:
        0 0 4px;

      font-family:
        var(--font-title);

      font-size:21px;

    }


    .dm-detail-header p,
    .dm-detail-header span{

      margin:0;

      color:var(--text3);

      font-size:11px;

    }


    .dm-detail-avatar{

      width:60px;

      height:60px;

      border-radius:50%;

      object-fit:cover;

      border:
        2px solid
        var(--accent);

    }


    .dm-detail-avatar-letter{

      display:flex;

      align-items:center;

      justify-content:center;

      background:
        linear-gradient(
          135deg,
          var(--accent),
          var(--accent3)
        );

      color:#05050a;

      font-size:24px;

      font-weight:900;

    }


    .dm-detail-metrics{

      display:grid;

      grid-template-columns:
        repeat(
          4,
          1fr
        );

      gap:10px;

      margin-bottom:22px;

    }


    .dm-detail-metrics > div{

      background:
        var(--bg3);

      border:
        1px solid
        var(--border);

      border-radius:10px;

      padding:13px;

      text-align:center;

    }


    .dm-detail-metrics strong{

      display:block;

      font-family:
        var(--font-title);

      font-size:20px;

      color:var(--accent);

    }


    .dm-detail-metrics span{

      font-size:9px;

      color:var(--text3);

    }


    .dm-section-title{

      font-family:
        var(--font-title);

      font-size:12px;

      letter-spacing:1px;

      color:var(--text2);

      padding-top:15px;

      margin:
        12px 0;

      border-top:
        1px solid
        var(--border);

    }


    .dm-level-grid{

      display:grid;

      grid-template-columns:
        repeat(
          2,
          1fr
        );

      gap:12px;

    }


    .dm-level-card{

      background:
        var(--bg3);

      border:
        1px solid
        var(--border);

      border-radius:12px;

      padding:15px;

    }


    .dm-level-card.complete{

      border-color:
        rgba(
          0,
          255,
          170,
          .35
        );

    }


    .dm-level-card-head{

      display:flex;

      justify-content:
        space-between;

    }


    .dm-level-bar{

      height:5px;

      background:
        var(--bg);

      border-radius:999px;

      overflow:hidden;

      margin:
        11px 0 5px;

    }


    .dm-level-bar span{

      display:block;

      height:100%;

      background:
        linear-gradient(
          90deg,
          var(--accent),
          var(--accent3)
        );

    }


    .dm-level-percent,
    .dm-level-date,
    .dm-level-pending,
    .dm-level-stats{

      font-size:10.5px;

      color:var(--text3);

      margin-top:5px;

    }


    .dm-level-done{

      margin-top:11px;

      color:
        var(--correct);

      font-weight:800;

      font-size:11px;

    }


    .dm-level-pending{

      color:#ffe26a;

    }


    .dm-cert-btn{

      margin-top:11px;

      width:100%;

      border:
        1px solid
        rgba(
          0,
          255,
          170,
          .35
        );

      background:
        rgba(
          0,
          255,
          170,
          .08
        );

      color:
        var(--correct);

      border-radius:8px;

      padding:9px;

      cursor:pointer;

      font-weight:700;

    }


    .dm-session-table-wrap{

      overflow:auto;

    }


    .dm-session-table{

      width:100%;

      border-collapse:collapse;

      font-size:11px;

    }


    .dm-session-table th,
    .dm-session-table td{

      text-align:left;

      padding:8px;

      border-bottom:
        1px solid
        var(--border);

      color:var(--text2);

    }


    .dm-no-data{

      color:var(--text3);

      font-size:12px;

      padding:
        10px 0;

    }


    @media(
      max-width:800px
    ){

      .dm-admin-summary{

        grid-template-columns:
          repeat(
            2,
            1fr
          );

      }


      .dm-admin-titlebar{

        flex-direction:
          column;

      }


      .dm-level-grid{

        grid-template-columns:
          1fr;

      }


      .dm-detail-metrics{

        grid-template-columns:
          repeat(
            2,
            1fr
          );

      }


      .dm-admin-controls input{

        min-width:100%;

      }


      .dm-detail-overlay{

        padding:
          64px
          8px
          8px;

        align-items:
          flex-start;

      }


      .dm-detail-modal{

        max-height:
          calc(
            100vh
            - 72px
          );

        border-radius:12px;

      }


      .dm-detail-toolbar{

        grid-template-columns:
          auto
          1fr
          auto;

        padding:8px;

      }


      .dm-detail-toolbar-title{

        text-align:center;

        font-size:9px;

      }


      .dm-back-btn{

        padding:
          8px 9px;

        font-size:10px;

      }


      #adminDetailContent{

        padding:
          16px
          13px
          20px;

      }

    }

  `;


  document.head
    .appendChild(
      style
    );

}


// =========================================
// SEGURANÇA DE NAVEGAÇÃO
// =========================================

function bindAdminNavigationSafety() {

  if (
    window
      .__dmAdminNavigationBound
  ) {

    return;

  }


  window
    .__dmAdminNavigationBound =
    true;


  // ESC fecha a ficha.

  document.addEventListener(

    'keydown',

    event => {

      if (

        event.key ===
          'Escape'

        && _activeAdminUid

      ) {

        window.closeAdminDetail();

      }

    }

  );


  // Ao clicar novamente em PAINEL,
  // garante que mostramos a lista
  // e não a última ficha aberta.

  document.addEventListener(

    'click',

    event => {

      const panelButton =

        event.target.closest(
          '#adminNavBtn'
        );


      if (panelButton) {

        window.closeAdminDetail();

      }

    },

    true

  );

}


// =========================================
// INICIALIZAÇÃO
// =========================================

function initRankingAdmin() {

  injectAdminStyles();


  ensureAdminDashboard();


  bindAdminNavigationSafety();


  // Em qualquer refresh,
  // iniciamos sem ficha selecionada.

  window.closeAdminDetail();

}


if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(

    'DOMContentLoaded',

    initRankingAdmin

  );

}

else {

  initRankingAdmin();

}

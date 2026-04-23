// =========================================
// DigiMaster — Ranking de Alunos
// =========================================

let currentRankField = 'wpm';

window.loadRanking = async function(field = 'wpm', btn = null) {
  currentRankField = field;

  // Atualiza botões de filtro
  document.querySelectorAll('.rank-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const list = document.getElementById('rankingList');
  const myPos = document.getElementById('rankingMyPos');
  if (!list) return;

  list.innerHTML = '<div class="ranking-loading">⏳ Carregando ranking...</div>';
  if (myPos) myPos.textContent = '';

  // Se não tem Firebase disponível, mostra ranking local
  if (typeof getFirestore === 'undefined' && typeof window._db === 'undefined') {
    renderLocalRanking(field);
    return;
  }

  try {
    await renderCloudRanking(field);
  } catch(e) {
    renderLocalRanking(field);
  }
};

// Ranking via Firestore (requer Firebase)
async function renderCloudRanking(field) {
  const list = document.getElementById('rankingList');
  const myPos = document.getElementById('rankingMyPos');

  // Acessa db via window (exportado pelo firebase.js)
  const db = window._firestoreDb;
  if (!db) { renderLocalRanking(field); return; }

  const { collection, getDocs, orderBy, query, limit } = window._firestoreLib;

  const fieldMap = { wpm: 'bestWpm', accuracy: 'bestAccuracy', sessions: 'totalSessions' };
  const dbField = fieldMap[field] || 'bestWpm';

  const q = query(collection(db, 'users'), orderBy(dbField, 'desc'), limit(50));
  const snap = await getDocs(q);

  const users = [];
  snap.forEach(doc => {
    const d = doc.data();
    users.push({ uid: doc.id, name: d.name || 'Aluno', photo: d.photoURL, bestWpm: d.bestWpm || 0, totalSessions: d.totalSessions || 0, bestAccuracy: d.bestAccuracy || 0 });
  });

  renderRankingUI(users, field);

  // Posição do usuário atual
  if (window.currentUser && myPos) {
    const myIndex = users.findIndex(u => u.uid === window.currentUser.uid);
    if (myIndex >= 0) {
      myPos.textContent = `Sua posição: #${myIndex + 1} de ${users.length} alunos`;
    } else {
      myPos.textContent = 'Complete uma sessão para aparecer no ranking!';
    }
  }
}

// Ranking local (fallback / sem login)
function renderLocalRanking(field) {
  const sessions = loadSessions();
  if (!sessions.length) {
    document.getElementById('rankingList').innerHTML = '<div class="ranking-loading">Nenhuma sessão registrada ainda. Pratique para aparecer no ranking!</div>';
    return;
  }

  const myName = window.currentUser?.displayName || 'Você';
  const bestWpm = sessions.length ? Math.max(...sessions.map(s => s.wpm)) : 0;
  const avgAcc  = sessions.length ? Math.round(sessions.reduce((a,s) => a+s.accuracy,0)/sessions.length) : 0;

  const mockUsers = [
    { uid: 'me', name: myName, bestWpm, totalSessions: sessions.length, bestAccuracy: avgAcc, isMe: true },
  ];

  renderRankingUI(mockUsers, field);
  document.getElementById('rankingMyPos').textContent = 'Entre com o Google para ver o ranking completo da turma!';
}

function renderRankingUI(users, field) {
  const list = document.getElementById('rankingList');
  if (!users.length) {
    list.innerHTML = '<div class="ranking-loading">Nenhum aluno no ranking ainda.</div>';
    return;
  }

  const fieldLabel = { wpm: 'WPM', accuracy: '%', sessions: 'sessões' };
  const fieldKey   = { wpm: 'bestWpm', accuracy: 'bestAccuracy', sessions: 'totalSessions' };
  const key = fieldKey[field] || 'bestWpm';
  const label = fieldLabel[field] || 'WPM';

  const medals = ['🥇','🥈','🥉'];
  const posClass = ['rank-1','rank-2','rank-3'];

  list.innerHTML = users.map((u, i) => {
    const isMe = u.isMe || (window.currentUser && u.uid === window.currentUser.uid);
    const posLabel = medals[i] || `#${i+1}`;
    const posC = posClass[i] || '';
    const meC = isMe ? 'is-me' : '';
    const val = u[key] || 0;

    const initial = (u.name || 'A')[0].toUpperCase();
    const avatarHtml = u.photo
      ? `<img src="${u.photo}" alt="${u.name}" />`
      : initial;

    return `
      <div class="rank-item ${posC} ${meC}">
        <div class="rank-pos ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${posLabel}</div>
        <div class="rank-avatar">${avatarHtml}</div>
        <div class="rank-info">
          <div class="rank-name">${u.name}${isMe ? ' <span style="color:var(--accent);font-size:11px">(você)</span>' : ''}</div>
          <div class="rank-sub">${u.totalSessions || 0} sessões · ${u.bestAccuracy || 0}% precisão</div>
        </div>
        <div>
          <div class="rank-val">${val}</div>
          <div class="rank-val-label">${label}</div>
        </div>
      </div>
    `;
  }).join('');
}

// =========================================
// PAINEL DO PROFESSOR (Admin)
// =========================================
window.loadAdminData = async function() {
  const body  = document.getElementById('adminBody');
  const empty = document.getElementById('adminEmpty');
  if (!body) return;

  body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text2)">⏳ Carregando...</td></tr>';

  const db  = window._firestoreDb;
  const lib = window._firestoreLib;

  if (!db || !lib) {
    body.innerHTML = '';
    if (empty) { empty.style.display = 'block'; empty.textContent = 'Firebase não conectado. Faça login para ver os dados.'; }
    return;
  }

  try {
    const { collection, getDocs, orderBy, query } = lib;
    const snap = await getDocs(query(collection(db, 'users'), orderBy('bestWpm', 'desc')));
    const users = [];
    snap.forEach(doc => users.push({ uid: doc.id, ...doc.data() }));

    if (!users.length) {
      body.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    const totalWpm = users.reduce((a, u) => a + (u.bestWpm || 0), 0);
    const avgWpm   = Math.round(totalWpm / users.length);
    const totalSes = users.reduce((a, u) => a + (u.totalSessions || 0), 0);

    const ta = document.getElementById('adminTotalAlunos');
    const mw = document.getElementById('adminMediaWpm');
    const ts = document.getElementById('adminTotalSessoes');
    if (ta) ta.textContent = users.length;
    if (mw) mw.textContent = avgWpm + ' WPM';
    if (ts) ts.textContent = totalSes;

    body.innerHTML = users.map((u, i) => {
      const last = u.lastSession?.toDate
        ? u.lastSession.toDate().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
        : '—';
      return `
        <tr>
          <td>${i + 1}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              ${u.photoURL ? `<img src="${u.photoURL}" style="width:28px;height:28px;border-radius:50%;object-fit:cover">` : `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${(u.name||'A')[0].toUpperCase()}</div>`}
              ${u.name || '—'}
            </div>
          </td>
          <td style="color:var(--text3);font-size:12px">${u.email || '—'}</td>
          <td class="best-wpm">${u.bestWpm || 0} WPM</td>
          <td>${u.totalSessions || 0}</td>
          <td style="font-size:12px;color:var(--text3)">${last}</td>
        </tr>
      `;
    }).join('');

  } catch(e) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--wrong)">Erro ao carregar dados: ${e.message}</td></tr>`;
  }
};

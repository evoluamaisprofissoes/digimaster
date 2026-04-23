// =========================================
// DigiMaster — Ranking + Painel do Professor
// =========================================

// =========================================
// RANKING
// =========================================
window.loadRanking = async function(field = 'wpm', btn = null) {
  document.querySelectorAll('.rank-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const list  = document.getElementById('rankingList');
  const myPos = document.getElementById('rankingMyPos');
  if (!list) return;

  list.innerHTML = '<div class="ranking-loading">⏳ Carregando ranking...</div>';
  if (myPos) myPos.textContent = '';

  const db  = window._firestoreDb;
  const lib = window._firestoreLib;
  if (!db || !lib) { renderLocalRanking(field); return; }

  try {
    const { collection, getDocs, orderBy, query, limit } = lib;
    const fieldMap = { wpm: 'bestWpm', accuracy: 'bestAccuracy', sessions: 'totalSessions' };
    const key = fieldMap[field] || 'bestWpm';
    const q   = query(collection(db, 'users'), orderBy(key, 'desc'), limit(50));
    const snap = await getDocs(q);
    const users = [];
    snap.forEach(doc => users.push({ uid: doc.id, ...doc.data() }));
    renderRankingUI(users, field);
    if (window.currentUser && myPos) {
      const idx = users.findIndex(u => u.uid === window.currentUser.uid);
      myPos.textContent = idx >= 0
        ? `Sua posição: #${idx + 1} de ${users.length} alunos`
        : 'Complete uma sessão para entrar no ranking!';
    }
  } catch(e) { renderLocalRanking(field); }
};

function renderLocalRanking(field) {
  const list     = document.getElementById('rankingList');
  const myPos    = document.getElementById('rankingMyPos');
  const sessions = typeof loadSessions === 'function' ? loadSessions() : [];
  if (!sessions.length) {
    list.innerHTML = '<div class="ranking-loading">Entre com Google para ver o ranking da turma!</div>';
    return;
  }
  const myName  = window.currentUser?.displayName || 'Você';
  const bestWpm = Math.max(...sessions.map(s => s.wpm));
  const avgAcc  = Math.round(sessions.reduce((a,s) => a + s.accuracy, 0) / sessions.length);
  renderRankingUI([{ uid:'me', name:myName, bestWpm, totalSessions:sessions.length, bestAccuracy:avgAcc, isMe:true }], field);
  if (myPos) myPos.textContent = 'Entre com Google para ver o ranking completo da turma!';
}

function renderRankingUI(users, field) {
  const list = document.getElementById('rankingList');
  if (!users.length) { list.innerHTML = '<div class="ranking-loading">Nenhum aluno no ranking ainda.</div>'; return; }
  const fieldKey   = { wpm:'bestWpm', accuracy:'bestAccuracy', sessions:'totalSessions' };
  const fieldLabel = { wpm:'WPM', accuracy:'%', sessions:'sessões' };
  const key   = fieldKey[field]   || 'bestWpm';
  const label = fieldLabel[field] || 'WPM';
  const medals    = ['🥇','🥈','🥉'];
  const posClass  = ['rank-1','rank-2','rank-3'];

  list.innerHTML = users.map((u, i) => {
    const isMe   = u.isMe || (window.currentUser && u.uid === window.currentUser.uid);
    const val    = u[key] || 0;
    const avatar = u.photoURL
      ? `<img src="${u.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
      : (u.name||'A')[0].toUpperCase();
    return `<div class="rank-item ${posClass[i]||''} ${isMe?'is-me':''}">
      <div class="rank-pos ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${medals[i]||'#'+(i+1)}</div>
      <div class="rank-avatar">${avatar}</div>
      <div class="rank-info">
        <div class="rank-name">${u.name||'Aluno'}${isMe?' <span style="color:var(--accent);font-size:11px">(você)</span>':''}</div>
        <div class="rank-sub">${u.totalSessions||0} sessões · ${u.bestAccuracy||0}% precisão</div>
      </div>
      <div style="text-align:right">
        <div class="rank-val">${val}</div>
        <div class="rank-val-label">${label}</div>
      </div>
    </div>`;
  }).join('');
}

// =========================================
// PAINEL DO PROFESSOR
// =========================================
let _adminData = [];

window.loadAdminData = async function() {
  const body  = document.getElementById('adminBody');
  const empty = document.getElementById('adminEmpty');
  if (!body) return;
  body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text2)">⏳ Carregando dados...</td></tr>`;

  const db  = window._firestoreDb;
  const lib = window._firestoreLib;
  if (!db || !lib) {
    body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--wrong)">⚠️ Firebase não conectado. Faça login como professor.</td></tr>`;
    return;
  }
  try {
    const { collection, getDocs, orderBy, query } = lib;
    const snap = await getDocs(query(collection(db, 'users'), orderBy('bestWpm','desc')));
    _adminData = [];
    snap.forEach(doc => _adminData.push({ uid: doc.id, ...doc.data() }));
    _renderAdminTable(_adminData);
    _updateAdminSummary(_adminData);
  } catch(e) {
    body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--wrong)">Erro: ${e.message}</td></tr>`;
  }
};

function _updateAdminSummary(users) {
  const totalWpm = users.reduce((a,u) => a + (u.bestWpm||0), 0);
  const totalAcc = users.reduce((a,u) => a + (u.bestAccuracy||0), 0);
  const totalSes = users.reduce((a,u) => a + (u.totalSessions||0), 0);
  const el = id => document.getElementById(id);
  if (el('adminTotalAlunos'))  el('adminTotalAlunos').textContent  = users.length;
  if (el('adminMediaWpm'))     el('adminMediaWpm').textContent     = users.length ? Math.round(totalWpm/users.length)+' WPM' : '—';
  if (el('adminMediaAcc'))     el('adminMediaAcc').textContent     = users.length ? Math.round(totalAcc/users.length)+'%' : '—';
  if (el('adminTotalSessoes')) el('adminTotalSessoes').textContent = totalSes;
}

function _renderAdminTable(users) {
  const body  = document.getElementById('adminBody');
  const empty = document.getElementById('adminEmpty');
  if (!body) return;
  if (!users.length) { body.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';

  body.innerHTML = users.map((u, i) => {
    const last = u.lastSession?.toDate
      ? u.lastSession.toDate().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})
      : '—';
    let status = '⚪ Inativo', statusColor = 'var(--text3)';
    if (u.lastSession?.toDate) {
      const dias = (Date.now() - u.lastSession.toDate().getTime()) / (1000*60*60*24);
      if (dias < 1)   { status = '🟢 Hoje';        statusColor = 'var(--correct)'; }
      else if (dias<7){ status = '🟡 Esta semana'; statusColor = '#ffe600'; }
      else if (dias<30){ status= '🟠 Este mês';    statusColor = '#ff6b00'; }
    }
    const wpm   = u.bestWpm || 0;
    const nivel = wpm>=60?'🔥 Avançado':wpm>=35?'⚡ Interm.':wpm>=15?'🌱 Básico':'🆕 Iniciante';
    const avatar = u.photoURL
      ? `<img src="${u.photoURL}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px">`
      : `<span style="display:inline-flex;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent3));align-items:center;justify-content:center;font-size:12px;font-weight:700;margin-right:8px;vertical-align:middle">${(u.name||'A')[0].toUpperCase()}</span>`;

    return `<tr style="cursor:pointer" onclick="showAdminDetail('${u.uid}')" title="Clique para ver detalhes do aluno">
      <td style="color:var(--text3)">${i+1}</td>
      <td>${avatar}<span style="font-weight:600">${u.name||'—'}</span></td>
      <td style="color:var(--text3);font-size:12px">${u.email||'—'}</td>
      <td class="best-wpm">${wpm} <small style="font-size:10px;color:var(--text3)">${nivel}</small></td>
      <td style="color:${(u.bestAccuracy||0)>=90?'var(--correct)':(u.bestAccuracy||0)>=75?'var(--text)':'var(--wrong)'}">${u.bestAccuracy||0}%</td>
      <td>${u.totalSessions||0}</td>
      <td style="font-size:12px;color:var(--text3)">${last}</td>
      <td style="color:${statusColor};font-size:12px">${status}</td>
    </tr>`;
  }).join('');
}

window.sortAdmin = function(field, btn) {
  document.querySelectorAll('[onclick^="sortAdmin"]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const sorted = [..._adminData].sort((a,b) => {
    if (field==='wpm')      return (b.bestWpm||0)      - (a.bestWpm||0);
    if (field==='accuracy') return (b.bestAccuracy||0)  - (a.bestAccuracy||0);
    if (field==='sessions') return (b.totalSessions||0) - (a.totalSessions||0);
    if (field==='name')     return (a.name||'').localeCompare(b.name||'');
    if (field==='last') {
      const ta = a.lastSession?.toDate?.()?.getTime()||0;
      const tb = b.lastSession?.toDate?.()?.getTime()||0;
      return tb - ta;
    }
    return 0;
  });
  _renderAdminTable(sorted);
};

window.filterAdminTable = function(term) {
  if (!term.trim()) { _renderAdminTable(_adminData); return; }
  const t = term.toLowerCase();
  _renderAdminTable(_adminData.filter(u =>
    (u.name||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t)
  ));
};

window.showAdminDetail = async function(uid) {
  const modal   = document.getElementById('adminDetailModal');
  const content = document.getElementById('adminDetailContent');
  if (!modal || !content) return;
  const user = _adminData.find(u => u.uid === uid);
  if (!user) return;

  modal.style.display = 'flex';
  content.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text2)">⏳ Carregando histórico...</div>`;

  const db  = window._firestoreDb;
  const lib = window._firestoreLib;
  let sessionsHtml = '<p style="color:var(--text3)">Nenhuma sessão registrada.</p>';

  if (db && lib) {
    try {
      const { collection, getDocs, orderBy, query, limit } = lib;
      const snap = await getDocs(query(collection(db,'users',uid,'sessions'), orderBy('timestamp','desc'), limit(10)));
      const sessions = [];
      snap.forEach(d => sessions.push(d.data()));
      if (sessions.length) {
        const levelMap = {basico:'🌱 Básico',intermediario:'⚡ Interm.',avancado:'🔥 Avançado',numeros:'🔢 Números'};
        sessionsHtml = `<table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr>
            ${['DATA','WPM','PRECISÃO','ERROS','NÍVEL'].map(h=>`<th style="text-align:left;padding:6px 10px;color:var(--text3);font-size:11px;letter-spacing:1px;border-bottom:1px solid var(--border)">${h}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${sessions.map(s => {
              const dt = s.timestamp?.toDate?.()?.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})||'—';
              return `<tr>
                <td style="padding:7px 10px;color:var(--text3);border-bottom:1px solid var(--bg3)">${dt}</td>
                <td style="padding:7px 10px;font-family:var(--font-title);color:var(--accent);border-bottom:1px solid var(--bg3)">${s.wpm}</td>
                <td style="padding:7px 10px;color:${s.accuracy>=90?'var(--correct)':s.accuracy>=75?'var(--text)':'var(--wrong)'};border-bottom:1px solid var(--bg3)">${s.accuracy}%</td>
                <td style="padding:7px 10px;color:${s.errors>5?'var(--wrong)':'var(--text2)'};border-bottom:1px solid var(--bg3)">${s.errors||0}</td>
                <td style="padding:7px 10px;border-bottom:1px solid var(--bg3)">${levelMap[s.level]||s.level||'—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
      }
    } catch(e) { sessionsHtml = `<p style="color:var(--wrong)">Erro: ${e.message}</p>`; }
  }

  const wpm   = user.bestWpm || 0;
  const acc   = user.bestAccuracy || 0;
  const nivel = wpm>=60?'🔥 Avançado':wpm>=35?'⚡ Intermediário':wpm>=15?'🌱 Básico':'🆕 Iniciante';
  const lastDate = user.lastSession?.toDate?.()?.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})||'Nunca';

  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      ${user.photoURL
        ? `<img src="${user.photoURL}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)">`
        : `<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent3));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#000">${(user.name||'A')[0].toUpperCase()}</div>`}
      <div>
        <div style="font-family:var(--font-title);font-size:18px;color:var(--text)">${user.name||'—'}</div>
        <div style="font-size:13px;color:var(--text3)">${user.email||'—'}</div>
        <div style="font-size:12px;color:var(--accent);margin-top:4px">${nivel}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
        <div style="font-family:var(--font-title);font-size:22px;color:var(--accent)">${wpm}</div>
        <div style="font-size:10px;color:var(--text3);letter-spacing:1px;margin-top:2px">MELHOR WPM</div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
        <div style="font-family:var(--font-title);font-size:22px;color:${acc>=90?'var(--correct)':acc>=75?'var(--text)':'var(--wrong)'}">${acc}%</div>
        <div style="font-size:10px;color:var(--text3);letter-spacing:1px;margin-top:2px">PRECISÃO MÁX.</div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
        <div style="font-family:var(--font-title);font-size:22px;color:var(--text)">${user.totalSessions||0}</div>
        <div style="font-size:10px;color:var(--text3);letter-spacing:1px;margin-top:2px">SESSÕES</div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Última atividade: <span style="color:var(--text2)">${lastDate}</span></div>
    <div style="font-family:var(--font-title);font-size:11px;color:var(--text2);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;border-top:1px solid var(--border);padding-top:16px">
      📊 Últimas 10 sessões
    </div>
    ${sessionsHtml}`;
};

window.closeAdminDetail = function() {
  const m = document.getElementById('adminDetailModal');
  if (m) m.style.display = 'none';
};

window.exportAdminCSV = function() {
  if (!_adminData.length) { if(typeof showToast==='function') showToast('⚠️ Carregue os dados primeiro!'); return; }
  const header = ['#','Nome','Email','Melhor WPM','Precisão Máx.','Sessões','Última Atividade'];
  const rows = _adminData.map((u,i) => [
    i+1, u.name||'', u.email||'', u.bestWpm||0,
    (u.bestAccuracy||0)+'%', u.totalSessions||0,
    u.lastSession?.toDate?.()?.toLocaleDateString('pt-BR')||'—'
  ]);
  const csv  = [header,...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `digimaster-alunos-${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  if(typeof showToast==='function') showToast('📥 CSV exportado!');
};

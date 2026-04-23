// =========================================
// DigiMaster — Estatísticas
// =========================================

const STORAGE_KEY = 'digimaster_sessions';

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveSession(data) {
  const sessions = loadSessions();
  sessions.push({ ...data, date: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function clearStats() {
  if (confirm('Tem certeza que deseja apagar todo o histórico de sessões?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderStats();
  }
}

function renderStats() {
  const sessions = loadSessions();

  // Summary
  const bestWpm = sessions.length ? Math.max(...sessions.map(s => s.wpm)) : 0;
  const avgWpm = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length) : 0;
  const avgAcc = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length) : 0;

  document.getElementById('statBestWpm').textContent = bestWpm ? bestWpm + ' WPM' : '—';
  document.getElementById('statAvgWpm').textContent  = avgWpm  ? avgWpm  + ' WPM' : '—';
  document.getElementById('statAvgAcc').textContent  = avgAcc  ? avgAcc  + '%'    : '—';
  document.getElementById('statSessions').textContent = sessions.length;

  renderWpmChart(sessions);
  renderAccBars(sessions);
  renderHistory(sessions);
}

function renderWpmChart(sessions) {
  const canvas = document.getElementById('wpmChart');
  const emptyEl = document.getElementById('chartEmpty');
  if (!canvas) return;

  const recent = sessions.slice(-20);

  if (recent.length < 2) {
    canvas.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }

  canvas.style.display = 'block';
  emptyEl.style.display = 'none';

  const ctx = canvas.getContext('2d');
  const W = canvas.parentElement.offsetWidth;
  const H = 200;
  canvas.width = W;
  canvas.height = H;

  const wpms = recent.map(s => s.wpm);
  const maxV = Math.max(...wpms, 1);
  const minV = 0;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = '#1f2d48';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    const val = Math.round(maxV - (maxV * i / 4));
    ctx.fillStyle = '#4a5a72';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  // Line
  const points = wpms.map((v, i) => ({
    x: pad.left + (i / (wpms.length - 1)) * chartW,
    y: pad.top + chartH - ((v - minV) / (maxV - minV || 1)) * chartH
  }));

  // Fill gradient
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, 'rgba(0,212,255,0.3)');
  grad.addColorStop(1, 'rgba(0,212,255,0)');

  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
  ctx.lineTo(points[0].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke
  ctx.beginPath();
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Dots
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();
    ctx.strokeStyle = '#0a0e17';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#7a8ba8';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(i + 1, p.x, pad.top + chartH + 18);
  });
}

function renderAccBars(sessions) {
  const container = document.getElementById('accBars');
  if (!container) return;
  container.innerHTML = '';

  const buckets = [
    { label: '<70%', min: 0, max: 70 },
    { label: '70-79', min: 70, max: 80 },
    { label: '80-89', min: 80, max: 90 },
    { label: '90-94', min: 90, max: 95 },
    { label: '95-99', min: 95, max: 100 },
    { label: '100%', min: 100, max: 101 }
  ];

  const counts = buckets.map(b => sessions.filter(s => s.accuracy >= b.min && s.accuracy < b.max).length);
  const maxCount = Math.max(...counts, 1);

  buckets.forEach((b, i) => {
    const group = document.createElement('div');
    group.className = 'acc-bar-group';
    const pct = (counts[i] / maxCount) * 90;

    group.innerHTML = `
      <div class="acc-bar" style="height:${Math.max(pct, 4)}px;background:${counts[i] > 0 ? 'var(--accent)' : 'rgba(0,212,255,0.15)'}"></div>
      <div class="acc-bar-label">${b.label}</div>
    `;
    container.appendChild(group);
  });
}

function renderHistory(sessions) {
  const tbody = document.getElementById('historyBody');
  const empty = document.getElementById('historyEmpty');
  if (!tbody) return;

  if (!sessions.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const reversed = [...sessions].reverse();
  tbody.innerHTML = reversed.slice(0, 50).map((s, i) => `
    <tr>
      <td>${reversed.length - i}</td>
      <td>${new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
      <td>${levelLabel(s.level)}</td>
      <td class="wpm-cell">${s.wpm}</td>
      <td style="color:${s.accuracy >= 95 ? 'var(--correct)' : s.accuracy >= 80 ? 'var(--text)' : 'var(--wrong)'}">${s.accuracy}%</td>
      <td style="color:${s.errors > 5 ? 'var(--wrong)' : 'var(--text2)'}">${s.errors}</td>
    </tr>
  `).join('');
}

function levelLabel(l) {
  const map = { basico: '🌱 Básico', intermediario: '⚡ Interm.', avancado: '🔥 Avançado', numeros: '🔢 Números' };
  return map[l] || l;
}

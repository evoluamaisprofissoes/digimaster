// =========================================
// DigiMaster — App Principal
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
let soundEnabled = localStorage.getItem('digimaster_sound') !== '0';

const audioCtx = window.AudioContext ? new AudioContext() : null;

function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + screenId)?.classList.add('active');
  document.querySelector(`.nav-btn[data-screen="${screenId}"]`)?.classList.add('active');
  const vkb = document.getElementById('vkbWrapper');
  if (vkb) vkb.style.display = screenId === 'practice' ? 'block' : 'none';
  if (screenId === 'stats') renderStats();
  if (screenId === 'lessons') renderLessons();
  if (screenId === 'practice') setTimeout(setupSession, 80);
}

function startLevel(level) {
  currentLevel = level;
  const sel = document.getElementById('levelSelect');
  if (sel) sel.value = level;
  navigateTo('practice');
}

function getSessionGoal() {
  if (activeLessonData?.lesson) {
    return {
      wpm: activeLessonData.lesson.goalWpm,
      accuracy: activeLessonData.lesson.goalAccuracy,
      label: `${activeLessonData.lesson.goalWpm}/${activeLessonData.lesson.goalAccuracy}%`
    };
  }
  const base = LEVEL_GOALS[currentLevel] || LEVEL_GOALS.intermediario;
  return { wpm: base.wpm, accuracy: base.accuracy, label: `${base.wpm}/${base.accuracy}%` };
}

function setupSession() {
  if (activeLessonData?.lesson) {
    currentText = activeLessonData.lesson.text;
    currentMode = 'text';
  } else {
    currentText = getRandomText(currentLevel);
  }
  currentIndex = 0;
  totalErrors = 0;
  errorSet = new Set();
  startTime = null;
  sessionActive = false;
  inputLocked = false;
  elapsedSeconds = 0;
  sessionDuration = parseInt(document.getElementById('durationSelect')?.value || (LEVEL_GOALS[currentLevel]?.duration || 60), 10);
  clearInterval(timerInterval);
  renderText();
  const goal = getSessionGoal();
  updateLiveStats(0, 100, 0, sessionDuration, 0);
  document.getElementById('liveGoal').textContent = goal.label;
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('resultPanel')?.classList.add('hidden');
  document.getElementById('clickToStart')?.classList.remove('hidden');
  document.querySelector('.text-display-container')?.classList.remove('focused');
  highlightKey(currentText[0]);
  updateSoundUI();
}

function resetSession() { setupSession(); }
function changeLevel() { currentLevel = document.getElementById('levelSelect')?.value || 'intermediario'; if (!activeLessonData) resetSession(); }
function changeMode() { if (!activeLessonData) { currentMode = document.getElementById('modeSelect')?.value || 'words'; resetSession(); } }

function renderText() {
  const display = document.getElementById('textDisplay');
  if (!display) return;
  display.innerHTML = '';
  charSpans = [];
  for (let i = 0; i < currentText.length; i++) {
    const span = document.createElement('span');
    span.className = 'char' + (i === 0 ? ' cursor' : '');
    span.textContent = currentText[i] === ' ' ? '\u00A0' : currentText[i];
    display.appendChild(span);
    charSpans.push(span);
  }
}

function renderTextAppend() {
  const display = document.getElementById('textDisplay');
  if (!display) return;
  display.innerHTML = '';
  charSpans = [];
  for (let i = 0; i < currentText.length; i++) {
    const span = document.createElement('span');
    let cls = 'char';
    if (i < currentIndex) cls += errorSet.has(i) ? ' wrong' : ' correct';
    if (i === currentIndex) cls += ' cursor';
    span.className = cls;
    span.textContent = currentText[i] === ' ' ? '\u00A0' : currentText[i];
    display.appendChild(span);
    charSpans.push(span);
  }
  charSpans[currentIndex]?.scrollIntoView({ block:'center', behavior:'smooth' });
}

function focusInput() {
  const input = document.getElementById('typingInput');
  input?.focus();
  document.getElementById('clickToStart')?.classList.add('hidden');
  document.querySelector('.text-display-container')?.classList.add('focused');
}

function playTone(type) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const config = {
      correct: { freq: 880, dur: 0.03, vol: 0.03 },
      error: { freq: 180, dur: 0.08, vol: 0.05 },
      success: { freq: 660, dur: 0.14, vol: 0.05 }
    }[type] || { freq: 500, dur: 0.05, vol: 0.03 };
    osc.frequency.value = config.freq;
    osc.type = type === 'error' ? 'square' : 'sine';
    gain.gain.value = config.vol;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + config.dur);
    osc.stop(audioCtx.currentTime + config.dur);
  } catch {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('digimaster_sound', soundEnabled ? '1' : '0');
  updateSoundUI();
  if (soundEnabled) playTone('correct');
}

function updateSoundUI() {
  const btn = document.getElementById('soundToggleBtn');
  if (btn) btn.textContent = soundEnabled ? '🔊 Ligado' : '🔇 Desligado';
}

function handleInput() {
  if (inputLocked) return;
  const input = document.getElementById('typingInput');
  if (!input) return;
  const typed = input.value;
  if (!typed.length) return;
  const char = typed[typed.length - 1];
  if (!startTime) { startTime = Date.now(); startTimers(); }
  flashKey(char);
  const expected = currentText[currentIndex];
  if (char === expected) {
    charSpans[currentIndex].className = 'char correct';
    playTone('correct');
  } else {
    charSpans[currentIndex].className = 'char wrong';
    totalErrors++;
    errorSet.add(currentIndex);
    playTone('error');
  }
  currentIndex++;
  if (currentIndex < charSpans.length) {
    charSpans[currentIndex].classList.add('cursor');
    highlightKey(currentText[currentIndex]);
  }
  const pct = (currentIndex / currentText.length) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  input.value = '';
  if (currentIndex >= currentText.length) {
    if (currentMode === 'words' && !activeLessonData) {
      currentText += ' ' + getRandomText(currentLevel);
      renderTextAppend();
    } else {
      endSession();
      return;
    }
  }
  updateLiveStatsFromState();
}

function startTimers() {
  sessionActive = true;
  elapsedSeconds = 0;
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    const remaining = sessionDuration - elapsedSeconds;
    if (remaining <= 0) { endSession(); return; }
    updateLiveStatsFromState();
  }, 1000);
}

function updateLiveStatsFromState() {
  if (!startTime) return;
  const elapsed = (Date.now() - startTime) / 1000 / 60;
  const words = currentIndex / 5;
  const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
  const accuracy = currentIndex > 0 ? Math.round(((currentIndex - totalErrors) / currentIndex) * 100) : 100;
  const wordCount = Math.floor(currentIndex / 5);
  const remaining = sessionDuration - elapsedSeconds;
  updateLiveStats(wpm, accuracy, totalErrors, Math.max(remaining, 0), wordCount);
  document.getElementById('heroWpm').textContent = wpm;
  const pct = Math.min(wpm / 100, 1);
  document.getElementById('heroRing')?.setAttribute('stroke-dasharray', `${pct * 314} 314`);
}

function updateLiveStats(wpm, acc, errors, timer, words) {
  document.getElementById('liveWpm').innerHTML = `${wpm} <small>WPM</small>`;
  document.getElementById('liveAcc').innerHTML = `${acc} <small>%</small>`;
  document.getElementById('liveErrors').textContent = errors;
  document.getElementById('liveTimer').textContent = `${timer}s`;
  document.getElementById('liveWords').textContent = words;
}

function endSession() {
  clearInterval(timerInterval);
  inputLocked = true;
  sessionActive = false;
  document.getElementById('typingInput')?.blur();
  if (!startTime) return;
  const elapsed = (Date.now() - startTime) / 1000 / 60;
  const words = currentIndex / 5;
  const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
  const accuracy = currentIndex > 0 ? Math.round(((currentIndex - totalErrors) / currentIndex) * 100) : 100;
  const wordCount = Math.floor(currentIndex / 5);
  const summary = { wpm, accuracy, errors: totalErrors, words: wordCount, level: currentLevel };
  saveSession(summary);
  if (typeof saveSessionCloud === 'function') saveSessionCloud(summary);
  const lessonOutcome = checkLessonCompletion(wpm, accuracy);
  const goal = lessonOutcome.hadLesson && lessonOutcome.lesson ? { wpm: lessonOutcome.lesson.goalWpm, accuracy: lessonOutcome.lesson.goalAccuracy } : getSessionGoal();
  const passed = wpm >= goal.wpm && accuracy >= goal.accuracy;
  playTone('success');
  showResult(summary, passed, goal, lessonOutcome);
  highlightKey(null);
  document.getElementById('progressFill').style.width = '100%';
}

function showResult(summary, passed, goal, lessonOutcome) {
  const resultPanel = document.getElementById('resultPanel');
  document.getElementById('resWpm').textContent = `${summary.wpm} WPM`;
  document.getElementById('resAcc').textContent = `${summary.accuracy}%`;
  document.getElementById('resErrors').textContent = summary.errors;
  document.getElementById('resWords').textContent = summary.words;
  document.getElementById('resultFeedback').textContent = getFeedback(summary.wpm, summary.accuracy);
  const goalBox = document.getElementById('resultGoalStatus');
  goalBox.className = `result-goal-status ${passed ? 'pass' : 'fail'}`;
  goalBox.textContent = lessonOutcome.hadLesson
    ? (passed ? `Meta da lição batida: ${goal.wpm} WPM e ${goal.accuracy}% de precisão.` : `Lição registrada, mas a meta era ${goal.wpm} WPM e ${goal.accuracy}% de precisão.`)
    : `Meta sugerida do nível: ${goal.wpm} WPM e ${goal.accuracy}% de precisão.`;
  const certBtn = document.getElementById('certificateBtn');
  certBtn.classList.toggle('hidden', !hasCompletedAllChallenges());
  resultPanel.classList.remove('hidden');
  resultPanel.scrollIntoView({ behavior:'smooth', block:'nearest' });
  if (typeof window.refreshCloudSummaries === 'function') setTimeout(() => window.refreshCloudSummaries(), 400);
}

function renderTips() {
  const container = document.getElementById('tipsCarousel');
  if (!container) return;
  container.innerHTML = TIPS.map(tip => `<div class="tip-card"><div class="tip-tag">${tip.tag}</div><h4>${tip.title}</h4><p>${tip.text}</p></div>`).join('');
}

function handleKeydown(e) {
  if (document.getElementById('screen-practice').classList.contains('active')) {
    const input = document.getElementById('typingInput');
    if (document.activeElement !== input && !inputLocked && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) focusInput();
  }
}

async function imageToDataUrl(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function generateCertificate() {
  if (!window.currentUser) {
    showToast('Faça login para gerar o certificado.');
    return;
  }
  if (!hasCompletedAllChallenges()) {
    showToast('Conclua todos os desafios com meta batida para liberar o certificado.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
  const W = 297, H = 210;
  pdf.setFillColor(8, 12, 24); pdf.rect(0, 0, W, H, 'F');
  pdf.setDrawColor(0, 207, 255); pdf.setLineWidth(1.4); pdf.rect(8, 8, W - 16, H - 16);
  pdf.setDrawColor(168, 85, 247); pdf.setLineWidth(0.3); pdf.rect(12, 12, W - 24, H - 24);
  const logoData = await imageToDataUrl('assets/logo.png');
  if (logoData) pdf.addImage(logoData, 'PNG', 18, 18, 34, 34);
  pdf.setTextColor(232, 240, 255);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(25); pdf.text('CERTIFICADO DE CONCLUSÃO', W/2, 34, { align:'center' });
  pdf.setFontSize(11); pdf.setTextColor(140, 170, 220); pdf.text('DigiMaster — by Evolua+ Profissões', W/2, 42, { align:'center' });
  pdf.setTextColor(255,255,255); pdf.setFontSize(16); pdf.text('Certificamos que', W/2, 74, { align:'center' });
  pdf.setFont('times', 'bold'); pdf.setFontSize(28); pdf.setTextColor(0, 207, 255); pdf.text(window.currentUser.displayName || 'Aluno(a)', W/2, 92, { align:'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(14); pdf.setTextColor(232,240,255);
  pdf.text('concluiu com êxito todos os desafios do treinamento de digitação DigiMaster,', W/2, 110, { align:'center' });
  pdf.text('demonstrando evolução em velocidade, precisão e disciplina prática.', W/2, 119, { align:'center' });
  const sessions = loadSessions();
  const bestWpm = sessions.length ? Math.max(...sessions.map(s => s.wpm)) : 0;
  const avgAcc = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length) : 0;
  pdf.setFillColor(18, 28, 48); pdf.roundedRect(70, 132, 157, 24, 4, 4, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(255,230,0); pdf.text(`Melhor WPM: ${bestWpm}    •    Precisão média: ${avgAcc}%`, W/2, 147, { align:'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(180, 195, 220); pdf.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, 30, 183);
  pdf.line(200, 178, 270, 178); pdf.text('Evolua+ Profissões', 235, 184, { align:'center' });
  pdf.save(`certificado-digimaster-${(window.currentUser.displayName || 'aluno').replace(/\s+/g,'-').toLowerCase()}.pdf`);
}
window.generateCertificate = generateCertificate;
window.toggleSound = toggleSound;
window.focusInput = focusInput;
window.navigateTo = navigateTo;
window.startLevel = startLevel;
window.resetSession = resetSession;
window.changeLevel = changeLevel;
window.changeMode = changeMode;

document.addEventListener('DOMContentLoaded', () => {
  buildKeyboard();
  renderTips();
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => navigateTo(btn.dataset.screen)));
  const input = document.getElementById('typingInput');
  if (input) {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', e => { if (e.key === 'Tab') e.preventDefault(); });
  }
  document.querySelector('.text-display-container')?.addEventListener('click', focusInput);
  document.addEventListener('keydown', handleKeydown);
  navigateTo('home');
  updateSoundUI();
  const sessions = loadSessions();
  if (sessions.length) {
    const bestWpm = Math.max(...sessions.map(s => s.wpm));
    const pct = Math.min(bestWpm / 100, 1);
    document.getElementById('heroRing')?.setAttribute('stroke-dasharray', `${pct * 314} 314`);
    document.getElementById('heroWpm').textContent = bestWpm;
  }
});

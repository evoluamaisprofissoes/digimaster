// =========================================
// DigiMaster — App Principal
// =========================================

// ---- State ----
let currentText = '';
let currentIndex = 0;
let startTime = null;
let timerInterval = null;
let statsInterval = null;
let totalErrors = 0;
let errorSet = new Set();
let sessionActive = false;
let sessionDuration = 60;
let elapsedSeconds = 0;
let currentLevel = 'intermediario';
let currentMode = 'words';
let charSpans = [];
let inputLocked = false;

// ---- Navigation ----
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const screen = document.getElementById('screen-' + screenId);
  if (screen) screen.classList.add('active');
  const btn = document.querySelector(`.nav-btn[data-screen="${screenId}"]`);
  if (btn) btn.classList.add('active');

  // Show/hide keyboard
  const vkb = document.getElementById('vkbWrapper');
  if (vkb) vkb.style.display = screenId === 'practice' ? 'block' : 'none';

  if (screenId === 'stats') renderStats();
  if (screenId === 'practice') {
    setTimeout(setupSession, 100);
    setTimeout(updatePracticeBottomPadding, 150);
  }
}

function startLevel(level) {
  currentLevel = level;
  navigateTo('practice');
  const sel = document.getElementById('levelSelect');
  if (sel) sel.value = level;
}

// ---- Session Setup ----
function setupSession() {
  currentText = getRandomText(currentLevel);
  currentIndex = 0;
  totalErrors = 0;
  errorSet = new Set();
  startTime = null;
  sessionActive = false;
  inputLocked = false;
  elapsedSeconds = 0;

  sessionDuration = parseInt(document.getElementById('durationSelect')?.value || 60);

  clearInterval(timerInterval);
  clearInterval(statsInterval);

  renderText();
  updateLiveStats(0, 100, 0, sessionDuration, 0);
  document.getElementById('progressFill').style.width = '0%';

  const resultPanel = document.getElementById('resultPanel');
  if (resultPanel) resultPanel.classList.add('hidden');

  const clickToStart = document.getElementById('clickToStart');
  if (clickToStart) clickToStart.classList.remove('hidden');

  const container = document.querySelector('.text-display-container');
  if (container) container.classList.remove('focused');

  highlightKey(currentText[0]);
}

function resetSession() {
  setupSession();
}

function changeLevel() {
  currentLevel = document.getElementById('levelSelect')?.value || 'intermediario';
  resetSession();
}

function changeMode() {
  currentMode = document.getElementById('modeSelect')?.value || 'words';
  resetSession();
}

// ---- Render Text ----
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

// ---- Focus & Input ----
function focusInput() {
  const input = document.getElementById('typingInput');
  const clickToStart = document.getElementById('clickToStart');
  const container = document.querySelector('.text-display-container');

  if (input) input.focus();
  if (clickToStart) clickToStart.classList.add('hidden');
  if (container) container.classList.add('focused');
}

// ---- Typing Logic ----
function handleInput(e) {
  if (inputLocked) return;

  const input = document.getElementById('typingInput');
  if (!input) return;

  const typed = input.value;
  if (!typed.length) return;

  const char = typed[typed.length - 1];

  // Start timer on first keystroke
  if (!startTime) {
    startTime = Date.now();
    startTimers();
  }

  // Flash the key
  flashKey(char);

  const expected = currentText[currentIndex];

  if (char === expected) {
    charSpans[currentIndex].className = 'char correct';
    currentIndex++;
  } else {
    charSpans[currentIndex].className = 'char wrong';
    totalErrors++;
    errorSet.add(currentIndex);
    currentIndex++;
  }

  // Move cursor
  if (currentIndex < charSpans.length) {
    charSpans[currentIndex].classList.add('cursor');
    highlightKey(currentText[currentIndex]);
  }

  // Update progress
  const pct = (currentIndex / currentText.length) * 100;
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = pct + '%';

  // Clear input to keep it from growing
  input.value = '';

  // Check completion
  if (currentIndex >= currentText.length) {
    if (currentMode === 'words') {
      // In word mode: load next text seamlessly
      currentText += ' ' + getRandomText(currentLevel);
      renderTextAppend();
    } else {
      endSession();
    }
  }

  // Update live stats
  updateLiveStatsFromState();
}

function renderTextAppend() {
  const display = document.getElementById('textDisplay');
  if (!display) return;

  // Re-render with new text keeping existing state
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

  // Scroll to cursor
  if (charSpans[currentIndex]) {
    charSpans[currentIndex].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

// ---- Timers ----
function startTimers() {
  sessionActive = true;
  elapsedSeconds = 0;

  timerInterval = setInterval(() => {
    elapsedSeconds++;
    const remaining = sessionDuration - elapsedSeconds;

    if (remaining <= 0) {
      endSession();
      return;
    }

    // Urgent color when < 10s
    const timerChip = document.querySelector('.timer-chip .stat-chip-val');
    if (timerChip) {
      timerChip.textContent = remaining + 's';
      timerChip.style.color = remaining <= 10 ? 'var(--wrong)' : 'var(--text)';
    }

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

  // Update home ring for fun
  const homeWpm = document.getElementById('heroWpm');
  const homeRing = document.getElementById('heroRing');
  if (homeWpm) homeWpm.textContent = wpm;
  if (homeRing) {
    const pct = Math.min(wpm / 100, 1);
    homeRing.setAttribute('stroke-dasharray', (pct * 314) + ' 314');
  }
}

function updateLiveStats(wpm, acc, errors, timer, words) {
  const el = (id) => document.getElementById(id);
  if (el('liveWpm')) el('liveWpm').innerHTML = wpm + ' <small>WPM</small>';
  if (el('liveAcc')) el('liveAcc').innerHTML = acc + ' <small>%</small>';
  if (el('liveErrors')) el('liveErrors').textContent = errors;
  if (el('liveTimer')) el('liveTimer').textContent = timer + 's';
  if (el('liveWords')) el('liveWords').textContent = words;
}

// ---- End Session ----
function endSession() {
  clearInterval(timerInterval);
  clearInterval(statsInterval);
  inputLocked = true;
  sessionActive = false;

  const input = document.getElementById('typingInput');
  if (input) input.blur();

  if (!startTime) return;

  const elapsed = (Date.now() - startTime) / 1000 / 60;
  const words = currentIndex / 5;
  const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
  const accuracy = currentIndex > 0 ? Math.round(((currentIndex - totalErrors) / currentIndex) * 100) : 100;
  const wordCount = Math.floor(currentIndex / 5);

  // Save session
  saveSession({ wpm, accuracy, errors: totalErrors, words: wordCount, level: currentLevel });

  // Show result
  const resultPanel = document.getElementById('resultPanel');
  if (resultPanel) {
    document.getElementById('resWpm').textContent = wpm + ' WPM';
    document.getElementById('resAcc').textContent = accuracy + '%';
    document.getElementById('resErrors').textContent = totalErrors;
    document.getElementById('resWords').textContent = wordCount;
    document.getElementById('resultFeedback').textContent = getFeedback(wpm, accuracy);
    resultPanel.classList.remove('hidden');
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  highlightKey(null);
  document.getElementById('progressFill').style.width = '100%';
}

// ---- Tips Carousel ----
function renderTips() {
  const container = document.getElementById('tipsCarousel');
  if (!container) return;
  container.innerHTML = TIPS.map(tip => `
    <div class="tip-card">
      <div class="tip-tag">${tip.tag}</div>
      <h4>${tip.title}</h4>
      <p>${tip.text}</p>
    </div>
  `).join('');
}

// ---- Keyboard Event Handler ----
function handleKeydown(e) {
  if (document.getElementById('screen-practice').classList.contains('active')) {
    const input = document.getElementById('typingInput');
    if (document.activeElement !== input && !inputLocked) {
      // Re-focus if user types anywhere on practice screen
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        focusInput();
      }
    }
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Build keyboard
  buildKeyboard();

  // Render tips
  renderTips();

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  // Typing input
  const input = document.getElementById('typingInput');
  if (input) {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', (e) => {
      // Prevent default for tab to keep focus
      if (e.key === 'Tab') e.preventDefault();
    });
  }

  // Text display click
  const container = document.querySelector('.text-display-container');
  if (container) {
    container.addEventListener('click', focusInput);
  }

  // Global keydown
  document.addEventListener('keydown', handleKeydown);

  // Initial screen
  navigateTo('home');

  // Animate hero ring on load
  setTimeout(() => {
    const ring = document.getElementById('heroRing');
    const sessions = loadSessions();
    if (ring && sessions.length) {
      const bestWpm = Math.max(...sessions.map(s => s.wpm));
      const pct = Math.min(bestWpm / 100, 1);
      ring.setAttribute('stroke-dasharray', (pct * 314) + ' 314');
      document.getElementById('heroWpm').textContent = bestWpm;
    }
  }, 500);
});

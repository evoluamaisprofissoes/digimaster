// =========================================
// DigiMaster — Teclado Virtual
// =========================================

const KEYBOARD_LAYOUT = [
  [
    { label: 'Esc', code: 'Escape', w: 'wide-1-5' },
    { label: '1', code: 'Digit1' }, { label: '2', code: 'Digit2' },
    { label: '3', code: 'Digit3' }, { label: '4', code: 'Digit4' },
    { label: '5', code: 'Digit5' }, { label: '6', code: 'Digit6' },
    { label: '7', code: 'Digit7' }, { label: '8', code: 'Digit8' },
    { label: '9', code: 'Digit9' }, { label: '0', code: 'Digit0' },
    { label: '-', code: 'Minus' }, { label: '=', code: 'Equal' },
    { label: '⌫', code: 'Backspace', w: 'wide-2' }
  ],
  [
    { label: 'Tab', code: 'Tab', w: 'wide-1-5' },
    { label: 'Q', code: 'KeyQ' }, { label: 'W', code: 'KeyW' },
    { label: 'E', code: 'KeyE' }, { label: 'R', code: 'KeyR' },
    { label: 'T', code: 'KeyT' }, { label: 'Y', code: 'KeyY' },
    { label: 'U', code: 'KeyU' }, { label: 'I', code: 'KeyI' },
    { label: 'O', code: 'KeyO' }, { label: 'P', code: 'KeyP' },
    { label: '[', code: 'BracketLeft' }, { label: ']', code: 'BracketRight' },
    { label: 'Enter', code: 'Enter', w: 'wide-2' }
  ],
  [
    { label: 'Caps', code: 'CapsLock', w: 'wide-2' },
    { label: 'A', code: 'KeyA', home: true }, { label: 'S', code: 'KeyS' },
    { label: 'D', code: 'KeyD' }, { label: 'F', code: 'KeyF', home: true },
    { label: 'G', code: 'KeyG' }, { label: 'H', code: 'KeyH' },
    { label: 'J', code: 'KeyJ', home: true }, { label: 'K', code: 'KeyK' },
    { label: 'L', code: 'KeyL' }, { label: ';', code: 'Semicolon' },
    { label: "'", code: 'Quote' },
    { label: 'Enter', code: 'Enter', w: 'wide-2-5' }
  ],
  [
    { label: '⇧', code: 'ShiftLeft', w: 'wide-2-5' },
    { label: 'Z', code: 'KeyZ' }, { label: 'X', code: 'KeyX' },
    { label: 'C', code: 'KeyC' }, { label: 'V', code: 'KeyV' },
    { label: 'B', code: 'KeyB' }, { label: 'N', code: 'KeyN' },
    { label: 'M', code: 'KeyM' },
    { label: ',', code: 'Comma' }, { label: '.', code: 'Period' },
    { label: '/', code: 'Slash' },
    { label: '⇧', code: 'ShiftRight', w: 'wide-3' }
  ],
  [
    { label: 'Ctrl', code: 'ControlLeft', w: 'wide-1-5' },
    { label: 'Alt', code: 'AltLeft', w: 'wide-1-5' },
    { label: 'SPACE', code: 'Space', w: 'space' },
    { label: 'Alt', code: 'AltRight', w: 'wide-1-5' },
    { label: 'Ctrl', code: 'ControlRight', w: 'wide-1-5' }
  ]
];

const CHAR_TO_CODE = {
  'a':'KeyA','b':'KeyB','c':'KeyC','d':'KeyD','e':'KeyE',
  'f':'KeyF','g':'KeyG','h':'KeyH','i':'KeyI','j':'KeyJ',
  'k':'KeyK','l':'KeyL','m':'KeyM','n':'KeyN','o':'KeyO',
  'p':'KeyP','q':'KeyQ','r':'KeyR','s':'KeyS','t':'KeyT',
  'u':'KeyU','v':'KeyV','w':'KeyW','x':'KeyX','y':'KeyY',
  'z':'KeyZ',' ':'Space','1':'Digit1','2':'Digit2','3':'Digit3',
  '4':'Digit4','5':'Digit5','6':'Digit6','7':'Digit7','8':'Digit8',
  '9':'Digit9','0':'Digit0','.':'Period',',':'Comma','-':'Minus',
  '/':'Slash',';':'Semicolon',"'":'Quote','=':'Equal',
  '[':'BracketLeft',']':'BracketRight',
};

let keyElements = {};
let vkbVisible = true;
let isFloating = false;

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isResizing = false;
let resizeDir = '';
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartW = 0;
let resizeStartH = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;

function buildKeyboard() {
  const container = document.getElementById('vkbKeys');
  if (!container) return;
  container.innerHTML = '';
  keyElements = {};

  KEYBOARD_LAYOUT.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'key-row';
    row.forEach(keyDef => {
      const keyEl = document.createElement('div');
      keyEl.className = 'key' + (keyDef.w ? ' ' + keyDef.w : '') + (keyDef.home ? ' home-key' : '');
      keyEl.textContent = keyDef.label;
      keyEl.dataset.code = keyDef.code;
      rowEl.appendChild(keyEl);
      keyElements[keyDef.code] = keyEl;
    });
    container.appendChild(rowEl);
  });

  initDragAndResize();
  setTimeout(updatePracticeBottomPadding, 50);
}

function highlightKey(char) {
  Object.values(keyElements).forEach(el => el.classList.remove('active-key'));
  if (!char) return;
  const code = CHAR_TO_CODE[char.toLowerCase()];
  if (code && keyElements[code]) keyElements[code].classList.add('active-key');
}

function flashKey(char) {
  const code = CHAR_TO_CODE[(char || '').toLowerCase()];
  if (code && keyElements[code]) {
    const el = keyElements[code];
    el.classList.add('pressed-key');
    setTimeout(() => el.classList.remove('pressed-key'), 120);
  }
}

function toggleVkb() {
  const wrapper = document.getElementById('vkbWrapper');
  if (!wrapper) return;
  wrapper.classList.toggle('minimized');
  vkbVisible = !wrapper.classList.contains('minimized');
  setTimeout(updatePracticeBottomPadding, 50);
}

function dockVkb() {
  const wrapper = document.getElementById('vkbWrapper');
  const indicator = document.getElementById('vkbDockIndicator');
  if (!wrapper) return;
  isFloating = false;
  wrapper.classList.remove('floating');
  wrapper.style.cssText = '';
  if (indicator) indicator.textContent = 'FIXO';
  setTimeout(updatePracticeBottomPadding, 50);
}

function updatePracticeBottomPadding() {
  const wrapper = document.getElementById('vkbWrapper');
  const practiceScreen = document.getElementById('screen-practice');
  if (!wrapper || !practiceScreen) return;

  if (!isFloating && vkbVisible && practiceScreen.classList.contains('active')) {
    const h = wrapper.offsetHeight;
    practiceScreen.style.paddingBottom = (h + 20) + 'px';
  } else {
    practiceScreen.style.paddingBottom = '100px';
  }
}

function initDragAndResize() {
  const wrapper    = document.getElementById('vkbWrapper');
  const header     = document.getElementById('vkbHeader');
  const resizeTop  = document.getElementById('vkbResizeTop');
  const resizeLeft = document.getElementById('vkbResizeLeft');
  const resizeRight= document.getElementById('vkbResizeRight');
  const resizeTL   = document.getElementById('vkbResizeTL');
  const resizeTR   = document.getElementById('vkbResizeTR');
  if (!wrapper || !header) return;

  // ---- DRAG ----
  function startDrag(clientX, clientY) {
    const rect = wrapper.getBoundingClientRect();

    if (!isFloating) {
      isFloating = true;
      wrapper.classList.add('floating');
      const w = Math.max(rect.width, 580);
      wrapper.style.width  = w + 'px';
      wrapper.style.height = rect.height + 'px';
      wrapper.style.top    = rect.top  + 'px';
      wrapper.style.left   = rect.left + 'px';
      wrapper.style.bottom = 'auto';
      wrapper.style.right  = 'auto';
      const indicator = document.getElementById('vkbDockIndicator');
      if (indicator) indicator.textContent = 'LIVRE';
      updatePracticeBottomPadding();
    }

    isDragging = true;
    const r2 = wrapper.getBoundingClientRect();
    dragOffsetX = clientX - r2.left;
    dragOffsetY = clientY - r2.top;
    wrapper.style.transition = 'none';
  }

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.vkb-btn') || e.target.closest('.vkb-resize-handle')) return;
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  });

  header.addEventListener('touchstart', (e) => {
    if (e.target.closest('.vkb-btn') || e.target.closest('.vkb-resize-handle')) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  }, { passive: false });

  // ---- RESIZE ----
  function startResize(clientX, clientY, dir) {
    isResizing = true;
    resizeDir = dir;
    const rect = wrapper.getBoundingClientRect();
    resizeStartX    = clientX;
    resizeStartY    = clientY;
    resizeStartW    = rect.width;
    resizeStartH    = rect.height;
    resizeStartLeft = rect.left;
    resizeStartTop  = rect.top;

    if (!isFloating && dir !== 'top') {
      isFloating = true;
      wrapper.classList.add('floating');
      wrapper.style.width  = rect.width  + 'px';
      wrapper.style.height = rect.height + 'px';
      wrapper.style.top    = rect.top    + 'px';
      wrapper.style.left   = rect.left   + 'px';
      wrapper.style.bottom = 'auto';
      wrapper.style.right  = 'auto';
      const indicator = document.getElementById('vkbDockIndicator');
      if (indicator) indicator.textContent = 'LIVRE';
    }
    wrapper.style.transition = 'none';
  }

  function bindResize(el, dir) {
    if (!el) return;
    el.addEventListener('mousedown', (e) => {
      startResize(e.clientX, e.clientY, dir);
      e.preventDefault(); e.stopPropagation();
    });
    el.addEventListener('touchstart', (e) => {
      startResize(e.touches[0].clientX, e.touches[0].clientY, dir);
      e.preventDefault();
    }, { passive: false });
  }

  bindResize(resizeTop,   'top');
  bindResize(resizeLeft,  'left');
  bindResize(resizeRight, 'right');
  bindResize(resizeTL,    'tl');
  bindResize(resizeTR,    'tr');

  // ---- MOVE ----
  function onMove(clientX, clientY) {
    if (isDragging) {
      const x = clientX - dragOffsetX;
      const y = clientY - dragOffsetY;
      const maxX = window.innerWidth  - wrapper.offsetWidth;
      const maxY = window.innerHeight - wrapper.offsetHeight;
      wrapper.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      wrapper.style.top  = Math.max(0, Math.min(y, maxY)) + 'px';
    }

    if (isResizing) {
      const dx = clientX - resizeStartX;
      const dy = clientY - resizeStartY;
      const minW = 320, minH = 80;

      if (!isFloating && resizeDir === 'top') {
        const newH = Math.max(minH, resizeStartH - dy);
        wrapper.style.height = newH + 'px';
        updatePracticeBottomPadding();
        return;
      }

      let newW = resizeStartW, newH = resizeStartH;
      let newL = resizeStartLeft, newT = resizeStartTop;

      if (resizeDir === 'right' || resizeDir === 'tr') newW = Math.max(minW, resizeStartW + dx);
      if (resizeDir === 'left'  || resizeDir === 'tl') {
        newW = Math.max(minW, resizeStartW - dx);
        newL = resizeStartLeft + (resizeStartW - newW);
      }
      if (resizeDir === 'top' || resizeDir === 'tl' || resizeDir === 'tr') {
        newH = Math.max(minH, resizeStartH - dy);
        newT = resizeStartTop + (resizeStartH - newH);
      }

      wrapper.style.width  = newW + 'px';
      wrapper.style.left   = newL + 'px';
      if (resizeDir !== 'right' && resizeDir !== 'left') {
        wrapper.style.height = newH + 'px';
        wrapper.style.top    = newT + 'px';
      }
    }
  }

  document.addEventListener('mousemove', (e) => {
    if (isDragging || isResizing) onMove(e.clientX, e.clientY);
  });
  document.addEventListener('touchmove', (e) => {
    if (isDragging || isResizing) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  function onEnd() {
    const wasActive = isDragging || isResizing;
    isDragging = false;
    isResizing = false;
    resizeDir = '';
    wrapper.style.transition = '';
    if (wasActive) updatePracticeBottomPadding();
  }

  document.addEventListener('mouseup',  onEnd);
  document.addEventListener('touchend', onEnd);
}

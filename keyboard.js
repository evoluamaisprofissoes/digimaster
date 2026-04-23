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
let vkbVisible  = true;
let isFloating  = false;

// Estado de drag
let isDragging  = false;
let dragOffX = 0, dragOffY = 0;

// Estado de resize
let isResizing  = false;
let resizeDir   = '';
let rsX=0, rsY=0, rsW=0, rsH=0, rsL=0, rsT=0;

// ---- Build ----
function buildKeyboard() {
  const container = document.getElementById('vkbKeys');
  if (!container) return;
  container.innerHTML = '';
  keyElements = {};

  KEYBOARD_LAYOUT.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'key-row';
    row.forEach(k => {
      const el = document.createElement('div');
      el.className = 'key' + (k.w ? ' '+k.w : '') + (k.home ? ' home-key' : '');
      el.textContent = k.label;
      el.dataset.code = k.code;
      rowEl.appendChild(el);
      keyElements[k.code] = el;
    });
    container.appendChild(rowEl);
  });

  _initInteraction();
  setTimeout(_updatePadding, 60);
}

// ---- Highlight / Flash ----
function highlightKey(char) {
  Object.values(keyElements).forEach(e => e.classList.remove('active-key'));
  if (!char) return;
  const code = CHAR_TO_CODE[char.toLowerCase()];
  if (code && keyElements[code]) keyElements[code].classList.add('active-key');
}

function flashKey(char) {
  const code = CHAR_TO_CODE[(char||'').toLowerCase()];
  if (code && keyElements[code]) {
    keyElements[code].classList.add('pressed-key');
    setTimeout(() => keyElements[code].classList.remove('pressed-key'), 120);
  }
}

// ---- Toggle minimizar ----
function toggleVkb() {
  const w = document.getElementById('vkbWrapper');
  if (!w) return;
  w.classList.toggle('minimized');
  vkbVisible = !w.classList.contains('minimized');
  setTimeout(_updatePadding, 60);
}

// ---- Dock: volta ao modo fixo na base ----
function dockVkb() {
  const w = document.getElementById('vkbWrapper');
  const badge = document.getElementById('vkbBadge');
  if (!w) return;
  isFloating = false;
  w.classList.remove('floating');
  w.style.cssText = '';           // remove left/top/width/height inline
  if (badge) badge.textContent = 'FIXO';
  setTimeout(_updatePadding, 60);
}

// ---- Atualiza padding inferior da tela de prática ----
function _updatePadding() {
  const w  = document.getElementById('vkbWrapper');
  const ps = document.getElementById('screen-practice');
  if (!w || !ps) return;
  if (!isFloating && vkbVisible && ps.classList.contains('active')) {
    ps.style.paddingBottom = (w.offsetHeight + 16) + 'px';
  } else {
    ps.style.paddingBottom = '';
  }
}

// ---- Interação (drag + resize) ----
function _initInteraction() {
  const wrapper = document.getElementById('vkbWrapper');
  const header  = document.getElementById('vkbHeader');
  if (!wrapper || !header) return;

  // --- DRAG pelo header ---
  function startDrag(cx, cy) {
    if (!isFloating) _makeFloat(wrapper);
    isDragging = true;
    const r = wrapper.getBoundingClientRect();
    dragOffX = cx - r.left;
    dragOffY = cy - r.top;
    wrapper.style.transition = 'none';
  }

  header.addEventListener('mousedown', e => {
    if (e.target.closest('.vkb-btn,.vkb-resize-handle')) return;
    startDrag(e.clientX, e.clientY); e.preventDefault();
  });
  header.addEventListener('touchstart', e => {
    if (e.target.closest('.vkb-btn,.vkb-resize-handle')) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault();
  }, {passive:false});

  // --- RESIZE pelas alças ---
  function startResize(cx, cy, dir) {
    // resize-top no modo dockado apenas muda altura
    if (!isFloating && dir !== 'top') _makeFloat(wrapper);
    isResizing = true; resizeDir = dir;
    const r = wrapper.getBoundingClientRect();
    rsX=cx; rsY=cy; rsW=r.width; rsH=r.height; rsL=r.left; rsT=r.top;
    wrapper.style.transition = 'none';
  }

  function bindResize(id, dir) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('mousedown', e => { startResize(e.clientX, e.clientY, dir); e.preventDefault(); e.stopPropagation(); });
    el.addEventListener('touchstart', e => { startResize(e.touches[0].clientX, e.touches[0].clientY, dir); e.preventDefault(); }, {passive:false});
  }
  bindResize('vkbResizeTop',   'top');
  bindResize('vkbResizeLeft',  'left');
  bindResize('vkbResizeRight', 'right');
  bindResize('vkbResizeBL',    'bl');
  bindResize('vkbResizeBR',    'br');

  // --- MOUSEMOVE / TOUCHMOVE ---
  function onMove(cx, cy) {
    if (isDragging) {
      const maxX = window.innerWidth  - wrapper.offsetWidth;
      const maxY = window.innerHeight - wrapper.offsetHeight;
      wrapper.style.left = Math.max(0, Math.min(cx - dragOffX, maxX)) + 'px';
      wrapper.style.top  = Math.max(0, Math.min(cy - dragOffY, maxY)) + 'px';
    }

    if (isResizing) {
      const dx = cx - rsX, dy = cy - rsY;
      const MIN_W = 320, MIN_H = 80;

      if (!isFloating && resizeDir === 'top') {
        // dockado: só altura (arrasta pra cima = maior)
        const newH = Math.max(MIN_H, rsH - dy);
        wrapper.style.height = newH + 'px';
        _updatePadding();
        return;
      }

      let nW = rsW, nH = rsH, nL = rsL, nT = rsT;

      if (resizeDir === 'right' || resizeDir === 'br') nW = Math.max(MIN_W, rsW + dx);
      if (resizeDir === 'left'  || resizeDir === 'bl') {
        nW = Math.max(MIN_W, rsW - dx);
        nL = rsL + (rsW - nW);
      }
      if (resizeDir === 'br' || resizeDir === 'bl') {
        nH = Math.max(MIN_H, rsH + dy);
      }
      if (resizeDir === 'top') {
        nH = Math.max(MIN_H, rsH - dy);
        nT = rsT + (rsH - nH);
      }

      if (resizeDir !== 'top') wrapper.style.width = nW + 'px';
      if (nL !== rsL) wrapper.style.left = nL + 'px';
      if (nH !== rsH) wrapper.style.height = nH + 'px';
      if (nT !== rsT) wrapper.style.top  = nT + 'px';
    }
  }

  document.addEventListener('mousemove', e => { if (isDragging||isResizing) onMove(e.clientX, e.clientY); });
  document.addEventListener('touchmove', e => { if (isDragging||isResizing) onMove(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});

  function onEnd() {
    const was = isDragging || isResizing;
    isDragging = isResizing = false; resizeDir = '';
    wrapper.style.transition = '';
    if (was) _updatePadding();
  }
  document.addEventListener('mouseup',  onEnd);
  document.addEventListener('touchend', onEnd);
}

// ---- Converte para floating ----
function _makeFloat(wrapper) {
  const r = wrapper.getBoundingClientRect();
  isFloating = true;
  wrapper.classList.add('floating');
  wrapper.style.width  = Math.max(r.width, 580) + 'px';
  wrapper.style.height = r.height + 'px';
  wrapper.style.left   = r.left + 'px';
  wrapper.style.top    = r.top  + 'px';
  wrapper.style.bottom = 'auto';
  wrapper.style.right  = 'auto';
  const badge = document.getElementById('vkbBadge');
  if (badge) badge.textContent = 'LIVRE';
  _updatePadding();
}

// Compatibilidade com toggleVkbSize (chamada no HTML original)
function toggleVkbSize() { /* substituído pelo resize manual */ }

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

// Mapeamento de caracteres para keyCodes
const CHAR_TO_CODE = {
  'a': 'KeyA', 'b': 'KeyB', 'c': 'KeyC', 'd': 'KeyD', 'e': 'KeyE',
  'f': 'KeyF', 'g': 'KeyG', 'h': 'KeyH', 'i': 'KeyI', 'j': 'KeyJ',
  'k': 'KeyK', 'l': 'KeyL', 'm': 'KeyM', 'n': 'KeyN', 'o': 'KeyO',
  'p': 'KeyP', 'q': 'KeyQ', 'r': 'KeyR', 's': 'KeyS', 't': 'KeyT',
  'u': 'KeyU', 'v': 'KeyV', 'w': 'KeyW', 'x': 'KeyX', 'y': 'KeyY',
  'z': 'KeyZ', ' ': 'Space', '1': 'Digit1', '2': 'Digit2', '3': 'Digit3',
  '4': 'Digit4', '5': 'Digit5', '6': 'Digit6', '7': 'Digit7', '8': 'Digit8',
  '9': 'Digit9', '0': 'Digit0', '.': 'Period', ',': 'Comma', '-': 'Minus',
  '/': 'Slash', ';': 'Semicolon', "'": 'Quote', '=': 'Equal',
  '[': 'BracketLeft', ']': 'BracketRight',
};

let keyElements = {}; // code -> DOM element
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let vkbVisible = true;

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

  // Tamanho padrão: médio
  const wrapper = document.getElementById('vkbWrapper');
  if (wrapper) {
    VKB_SIZES.forEach(s => wrapper.classList.remove(s));
    wrapper.classList.add('size-md');
    vkbSizeIndex = 1;
  }

  initDrag();
}

function highlightKey(char) {
  // Clear previous highlights
  Object.values(keyElements).forEach(el => {
    el.classList.remove('active-key');
  });

  if (!char) return;

  const lower = char.toLowerCase();
  const code = CHAR_TO_CODE[lower];
  if (code && keyElements[code]) {
    keyElements[code].classList.add('active-key');
  }
}

function flashKey(char) {
  const lower = (char || '').toLowerCase();
  const code = CHAR_TO_CODE[lower];
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
}

const VKB_SIZES = ['size-lg', 'size-md', 'size-sm'];
const VKB_SIZE_LABELS = ['⊞ Grande', '⊟ Médio', '⊠ Pequeno'];
let vkbSizeIndex = 0;

function toggleVkbSize() {
  const wrapper = document.getElementById('vkbWrapper');
  const btn = document.querySelector('.vkb-btn[onclick="toggleVkbSize()"]');
  if (!wrapper) return;

  // Remove tamanho atual
  VKB_SIZES.forEach(s => wrapper.classList.remove(s));

  // Avança para próximo tamanho
  vkbSizeIndex = (vkbSizeIndex + 1) % VKB_SIZES.length;
  wrapper.classList.add(VKB_SIZES[vkbSizeIndex]);

  // Atualiza tooltip do botão
  if (btn) btn.title = VKB_SIZE_LABELS[(vkbSizeIndex + 1) % VKB_SIZES.length];
}

function initDrag() {
  const header = document.getElementById('vkbHeader');
  const wrapper = document.getElementById('vkbWrapper');
  if (!header || !wrapper) return;

  // Make wrapper absolutely positioned for dragging
  let posX = null, posY = null;

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.vkb-btn')) return;
    isDragging = true;

    const rect = wrapper.getBoundingClientRect();

    // Switch from fixed to absolute positioning on first drag
    if (wrapper.style.position !== 'fixed' && !posX) {
      posX = rect.left;
      posY = rect.top;
    }

    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    wrapper.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.clientX - dragOffsetX;
    const y = e.clientY - dragOffsetY;

    // Clamp to viewport
    const maxX = window.innerWidth - wrapper.offsetWidth;
    const maxY = window.innerHeight - wrapper.offsetHeight;
    const cx = Math.max(0, Math.min(x, maxX));
    const cy = Math.max(0, Math.min(y, maxY));

    wrapper.style.left = cx + 'px';
    wrapper.style.top = cy + 'px';
    wrapper.style.right = 'auto';
    wrapper.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    wrapper.style.transition = '';
  });

  // Touch support
  header.addEventListener('touchstart', (e) => {
    if (e.target.closest('.vkb-btn')) return;
    const touch = e.touches[0];
    const rect = wrapper.getBoundingClientRect();
    isDragging = true;
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const x = touch.clientX - dragOffsetX;
    const y = touch.clientY - dragOffsetY;
    const maxX = window.innerWidth - wrapper.offsetWidth;
    const maxY = window.innerHeight - wrapper.offsetHeight;
    wrapper.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    wrapper.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    wrapper.style.right = 'auto';
    wrapper.style.bottom = 'auto';
  }, { passive: true });

  document.addEventListener('touchend', () => { isDragging = false; });
}

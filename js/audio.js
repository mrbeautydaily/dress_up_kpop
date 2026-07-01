// ────────────────────────────────────────────────────────────
// AUDIO SYSTEM
// ────────────────────────────────────────────────────────────

let _actx       = null;
let _masterGain = null;
let soundOn     = true;

function actx() {
  if (!_actx) {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _actx.createGain();
    _masterGain.gain.value = 0.8;
    _masterGain.connect(_actx.destination);
  }
  return _actx;
}

// Low-level: play a sine-wave tone
function tone(freq, vol, dur, delay = 0, type = 'sine') {
  if (!soundOn) return;
  const c = actx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  o.connect(g); g.connect(_masterGain);
  const t = c.currentTime + delay;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.01);
}

// ── Sound effects ────────────────────────────────────────────

function sfxEquip() {
  [[523,.22,.18,0],[659,.18,.18,.07],[784,.15,.2,.14],[1046,.13,.28,.21]]
    .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
}
function sfxUnlock() {
  [[880,.28,.13,0],[1108,.24,.13,.06],[1318,.2,.18,.12],[1760,.16,.32,.18]]
    .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
}
function sfxClick() { tone(1100,.1,.06); }

function sfxRunway() {
  if (!soundOn) return;
  const c = actx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(300, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.35);
  g.gain.setValueAtTime(0.22, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.45);
  o.connect(g); g.connect(_masterGain);
  o.start(); o.stop(c.currentTime + 0.46);
}
function sfxScore(trendMatches) {
  if (trendMatches >= 2) {
    [[523,.28,.18,0],[659,.28,.18,.09],[784,.28,.18,.18],
     [1046,.32,.15,.28],[1318,.28,.4,.36]]
      .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
  } else if (trendMatches === 1) {
    [[523,.22,.18,0],[659,.22,.18,.09],[784,.22,.28,.18]]
      .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
  } else {
    [[350,.18,.28,0],[294,.18,.38,.14]].forEach(([f,v,d,dt]) => tone(f,v,d,dt));
  }
}

// ── BGM — Web Audio API (не вызывает системный медиаплеер) ───
let _bgmBuffer = null;   // decoded AudioBuffer
let _bgmSource = null;   // активный BufferSourceNode
let _bgmGain   = null;   // gain-нода для громкости BGM
let _bgmRawAB  = null;   // сырой ArrayBuffer (загружен заранее)

// Загружаем MP3 как байты заранее, без AudioContext
fetch('sound.mp3').then(r => r.arrayBuffer()).then(ab => { _bgmRawAB = ab; }).catch(() => {});

async function _decodeBGM() {
  if (_bgmBuffer) return true;
  if (!_bgmRawAB) return false;
  try {
    _bgmBuffer = await actx().decodeAudioData(_bgmRawAB.slice(0));
    return true;
  } catch(e) { return false; }
}

function _startBGMSource() {
  if (!_bgmBuffer) return;
  const ctx = actx();
  if (!_bgmGain) {
    _bgmGain = ctx.createGain();
    _bgmGain.gain.value = 0.18;
    _bgmGain.connect(_masterGain);
  }
  _bgmSource = ctx.createBufferSource();
  _bgmSource.buffer = _bgmBuffer;
  _bgmSource.loop = true;
  _bgmSource.connect(_bgmGain);
  _bgmSource.start(0);
}

function startBGM() {
  if (!soundOn) return;
  if (_bgmBuffer) { _startBGMSource(); return; }
  _decodeBGM().then(ok => { if (ok && soundOn) _startBGMSource(); });
}
function stopBGM() {
  if (_bgmSource) { try { _bgmSource.stop(); } catch(e) {} _bgmSource = null; }
}
function pauseBGM() { /* AudioContext.suspend() в _audioPause уже останавливает вывод */ }
function resumeBGM() { /* AudioContext.resume() в _audioResume уже возобновляет вывод */ }

// ── Sound toggle ─────────────────────────────────────────────

function toggleSound() {
  soundOn = !soundOn;
  try { localStorage.setItem('kpop_sound', soundOn ? '1' : '0'); } catch(e) {}
  const btn = $('btn-sound');
  if (btn) {
    btn.classList.toggle('muted', !soundOn);
  }
  if (soundOn) { if (_actx) _actx.resume(); actx(); startBGM(); sfxClick(); }
  else { pauseBGM(); stopBGM(); }
}

function initAudio() {
  soundOn = localStorage.getItem('kpop_sound') !== '0';
  const btn = $('btn-sound');
  if (btn) {
    btn.classList.toggle('muted', !soundOn);
  }
  // Браузеры запрещают AudioContext до первого жеста пользователя
  document.addEventListener('click', function onFirstClick() {
    actx();
    if (soundOn) startBGM();
    document.removeEventListener('click', onFirstClick);
  }, { once: true });
}

// ────────────────────────────────────────────────────────────
// SPARKLE EFFECT
// ────────────────────────────────────────────────────────────

const SPARKLE_EMOJIS = ['✨','⭐','💫','🌟','💖','💕','💗','💓','🩷','💝','❤️','🌸'];

function spawnSparkles(count = 6, targetEl = null) {
  const modal = $('score-modal');
  const useModal = modal && !modal.classList.contains('hidden');
  const container = useModal ? $('modal-sparkles') : $('sparkles');
  if (!container) return;

  let originX = null;
  let originY = null;

  if (targetEl) {
    const targetRect = targetEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    originX = targetRect.left - containerRect.left + targetRect.width / 2;
    originY = targetRect.top - containerRect.top + targetRect.height / 2;
  }

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('img');
      el.src = 'Items/UI/heart.png';
      el.className = 'sparkle';
      el.style.width = '1.25rem';
      el.style.height = '1.25rem';
      el.style.objectFit = 'contain';
      
      if (originX !== null && originY !== null) {
        el.style.left = originX + 'px';
        el.style.top = originY + 'px';
        
        // Radial velocity explosion
        const angle = Math.random() * Math.PI * 2;
        const speed = 45 + Math.random() * 90;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        
        el.style.setProperty('--dx', dx + 'px');
        el.style.setProperty('--dy', dy + 'px');
      } else {
        const x  = 20 + Math.random() * 60;
        const y  = 10 + Math.random() * 80;
        el.style.left = x + '%';
        el.style.top  = y + '%';
        el.style.setProperty('--dx', (Math.random() - 0.5) * 80 + 'px');
        el.style.setProperty('--dy', -(20 + Math.random() * 60) + 'px');
      }
      
      container.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 40);
  }
}


// Synthesize a camera shutter click sound using Web Audio API
function sfxCameraClick() {
  if (!soundOn) return;
  try {
    const ctx = _actx || new (window.AudioContext || window.webkitAudioContext)();
    if (!ctx) return;
    
    // Resume audio context if suspended (needed for user interactions in browsers)
    if (ctx.state === 'suspended') ctx.resume();

    // Create white noise buffer
    const bufferSize = ctx.sampleRate * 0.12; // 120ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter to simulate mechanical sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.5;
    
    // Volume envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.7, ctx.currentTime + 0.008); // Sharp click
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09); // Quick decay
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch(e) {
    console.warn("Failed to play camera click sfx:", e);
  }
}

// Visual screen flash overlay and click audio effect
function triggerCameraFlash(onDone) {
  const flash = $('camera-flash');
  if (!flash) {
    onDone();
    return;
  }
  
  // Play camera click audio
  sfxCameraClick();
  
  // Show white overlay instantly
  flash.classList.remove('hidden');
  flash.style.transition = 'none';
  flash.style.opacity = '1';
  
  // Force reflow
  void flash.offsetWidth;
  
  // Fade out
  setTimeout(() => {
    flash.style.transition = 'opacity 0.35s ease-out';
    flash.style.opacity = '0';
    
    // Hide completely after transition completes
    setTimeout(() => {
      flash.classList.add('hidden');
    }, 350);
    
    // Callback triggers early during fade-out for snappy feel
    onDone();
  }, 60);
}

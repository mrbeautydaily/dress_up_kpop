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
  // Classic UI click (1100 Hz +/- 50 Hz, sine wave) for equipping clothing
  const freq = 1050 + Math.random() * 100;
  tone(freq, .15, .03, 0, 'sine');
}
function sfxUnlock() {
  // Balanced middle-high register magical progression
  [[440,.22,.15,0],[587,.18,.15,.05],[659,.16,.15,.10],[880,.14,.20,.15],[1046,.11,.30,.20]]
    .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
}
function sfxClick() { 
  // High-pitch micro tick (2000 Hz +/- 100 Hz, sine wave) for category shifts and UI clicks
  const freq = 1900 + Math.random() * 200;
  tone(freq, .10, .01, 0, 'sine'); 
}
function sfxScore(trendMatches) {
  if (trendMatches >= 2) {
    // Balanced G-major arpeggio for high scores
    [[392,.24,.18,0],[494,.24,.18,.09],[587,.24,.18,.18],
     [784,.26,.15,.28],[988,.24,.40,.36]]
      .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
  } else if (trendMatches === 1) {
    // Balanced warm G-major triad
    [[392,.20,.18,0],[494,.20,.18,.09],[587,.20,.28,.18]]
      .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
  } else {
    // Balanced mild disappointment slide (D4 to A3)
    [[294,.16,.28,0],[220,.16,.38,.14]].forEach(([f,v,d,dt]) => tone(f,v,d,dt));
  }
}

// ── BGM — HTML5 Audio Mini Player (plays all tracks) ───────────

const MUSIC_PLAYLIST = [
  { name: 'K-Pop Star Theme', file: 'sound.mp3' },
  { name: 'Cotton Cloud Boutique', file: 'Cotton Cloud Boutique.mp3' },
  { name: 'Cotton Cloud Boutique (Alt)', file: 'Cotton Cloud Boutique (1).mp3' },
  { name: 'Cute Boutique', file: 'Cute Boutique.mp3' },
  { name: 'Cute Boutique (Alt)', file: 'Cute Boutique (1).mp3' },
  { name: 'Dress Up Boutique', file: 'Dress Up Boutique.mp3' },
  { name: 'Dress Up Day', file: 'Dress Up Day.mp3' },
  { name: 'Dress Up Day (Alt)', file: 'Dress Up Day (1).mp3' },
  { name: 'Glassy Drift', file: 'Glassy Drift.mp3' },
  { name: 'Glossy Glow', file: 'Glossy Glow.mp3' },
  { name: 'Soft Boutique', file: 'Soft Boutique.mp3' },
  { name: 'Soft Boutique (Alt)', file: 'Soft Boutique (1).mp3' },
  { name: 'Soft Pastel Boutique', file: 'Soft Pastel Boutique.mp3' },
  { name: 'Soft Pastel Boutique (Alt 1)', file: 'Soft Pastel Boutique (1).mp3' },
  { name: 'Soft Pastel Boutique (Alt 2)', file: 'Soft Pastel Boutique (2).mp3' }
];

let _currentTrackIndex = 0;
let _musicAudio = new Audio();
_musicAudio.volume = 0.2; // Default starting volume (gentle)
let _isPlaying = false;
let _isShuffle = false;
let _isRepeat = false; // loops single track if true

// Active playlist and deleted tracks states
let _activePlaylist = [];
let _deletedSongs = new Set();
let _likedSongs = new Set();

function loadLikedSongs() {
  try {
    const data = localStorage.getItem('kpop_liked_songs');
    if (data) {
      const arr = JSON.parse(data);
      _likedSongs = new Set(arr);
    }
  } catch (e) {
    console.warn("Failed to load liked songs:", e);
  }
}

function saveLikedSongs() {
  try {
    localStorage.setItem('kpop_liked_songs', JSON.stringify(Array.from(_likedSongs)));
  } catch (e) {
    console.warn("Failed to save liked songs:", e);
  }
}

function loadDeletedSongs() {
  try {
    const data = localStorage.getItem('kpop_deleted_songs');
    if (data) {
      const arr = JSON.parse(data);
      _deletedSongs = new Set(arr);
    }
  } catch (e) {
    console.warn("Failed to load deleted songs:", e);
  }
}

function saveDeletedSongs() {
  try {
    localStorage.setItem('kpop_deleted_songs', JSON.stringify(Array.from(_deletedSongs)));
  } catch (e) {
    console.warn("Failed to save deleted songs:", e);
  }
}

function rebuildActivePlaylist() {
  _activePlaylist = MUSIC_PLAYLIST.filter(track => !_deletedSongs.has(track.file));
}

// UI Elements references
function mpGetElements() {
  return {
    container: $('mini-player'),
    panel: $('mp-panel'),
    toggleBtn: $('mp-disc-toggle'),
    closeBtn: $('mp-close-btn'),
    title: $('mp-track-title'),
    likeBtn: $('mp-btn-like'),
    playBtn: $('mp-btn-play'),
    playIcon: $('mp-play-icon'),
    pauseIcon: $('mp-pause-icon'),
    prevBtn: $('mp-btn-prev'),
    nextBtn: $('mp-btn-next'),
    shuffleBtn: $('mp-btn-shuffle'),
    repeatBtn: $('mp-btn-repeat'),
    volumeBtn: $('mp-btn-volume'),
    volumeSlider: $('mp-volume-slider'),
    volumeOnIcon: $('mp-vol-on-icon'),
    volumeMuteIcon: $('mp-vol-mute-icon'),
    playlistBtn: $('mp-btn-playlist'),
    playlistPanel: $('mp-playlist-panel'),
    playlistList: $('mp-playlist-list'),
    playlistResetBtn: $('mp-playlist-reset'),
    progressContainer: $('mp-progress-container'),
    progressBar: $('mp-progress-bar'),
    currentTimeLabel: $('mp-time-current'),
    totalTimeLabel: $('mp-time-total')
  };
}

// Convert seconds to MM:SS
function mpFormatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize player UI and listeners
function initMiniPlayer() {
  const el = mpGetElements();
  if (!el.container) return;

  // Load state and build active list
  loadLikedSongs();
  loadDeletedSongs();
  rebuildActivePlaylist();

  // Toggle Panel Open/Close
  el.toggleBtn.addEventListener('click', () => {
    sfxClick();
    el.panel.classList.toggle('hidden');
    // Scroll active item into view when opening panel
    if (!el.panel.classList.contains('hidden')) {
      const activeItem = el.playlistList.querySelector('.mp-playlist-item.active');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  });

  el.closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sfxClick();
    el.panel.classList.add('hidden');
  });

  // Like button
  if (el.likeBtn) {
    el.likeBtn.addEventListener('click', () => {
      sfxClick();
      toggleLike();
    });
  }

  // Play/Pause button
  el.playBtn.addEventListener('click', () => {
    sfxClick();
    if (_isPlaying) {
      pauseMusic();
    } else {
      // If we are playing from a fresh start, resume audio context if suspended
      if (_actx && _actx.state === 'suspended') _actx.resume();
      playMusic();
    }
  });

  // Prev/Next buttons
  el.prevBtn.addEventListener('click', () => { sfxClick(); prevTrack(); });
  el.nextBtn.addEventListener('click', () => { sfxClick(); nextTrack(); });

  // Shuffle toggle
  el.shuffleBtn.addEventListener('click', () => {
    sfxClick();
    _isShuffle = !_isShuffle;
    el.shuffleBtn.classList.toggle('active', _isShuffle);
  });

  // Repeat toggle
  el.repeatBtn.addEventListener('click', () => {
    sfxClick();
    _isRepeat = !_isRepeat;
    el.repeatBtn.classList.toggle('active', _isRepeat);
  });

  // Volume slider
  el.volumeSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    _musicAudio.volume = vol;
    _musicAudio.muted = false;
    updateVolumeUI(vol, false);
  });

  // Mute toggle button
  el.volumeBtn.addEventListener('click', () => {
    sfxClick();
    _musicAudio.muted = !_musicAudio.muted;
    updateVolumeUI(_musicAudio.volume, _musicAudio.muted);
  });

  // Toggle Playlist panel
  el.playlistBtn.addEventListener('click', () => {
    sfxClick();
    el.playlistPanel.classList.toggle('hidden');
    el.playlistBtn.classList.toggle('active', !el.playlistPanel.classList.contains('hidden'));
  });

  // Playlist Reset button
  if (el.playlistResetBtn) {
    el.playlistResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sfxClick();
      resetPlaylist();
    });
  }

  // Seeking on progress bar
  el.progressContainer.addEventListener('click', (e) => {
    const rect = el.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    if (_musicAudio.duration) {
      _musicAudio.currentTime = percentage * _musicAudio.duration;
    }
  });

  // Populate Playlist
  populatePlaylistUI();

  // Load first track (silent setup)
  loadTrack(_currentTrackIndex, false);

  // Audio Event Listeners
  _musicAudio.addEventListener('timeupdate', () => {
    if (!_musicAudio.duration) return;
    const percent = (_musicAudio.currentTime / _musicAudio.duration) * 100;
    el.progressBar.style.width = percent + '%';
    el.currentTimeLabel.textContent = mpFormatTime(_musicAudio.currentTime);
  });

  _musicAudio.addEventListener('loadedmetadata', () => {
    el.totalTimeLabel.textContent = mpFormatTime(_musicAudio.duration);
    updateMarqueeState();
  });

  _musicAudio.addEventListener('ended', () => {
    if (_isRepeat) {
      _musicAudio.currentTime = 0;
      _musicAudio.play().catch(() => {});
    } else {
      nextTrack();
    }
  });

  // Handle errors or missing files gracefully
  _musicAudio.addEventListener('error', () => {
    if (_activePlaylist.length > 0) {
      console.warn(`Failed to load audio: ${_activePlaylist[_currentTrackIndex]?.file}, skipping to next.`);
      setTimeout(() => { nextTrack(); }, 1000);
    }
  });
}

function updateVolumeUI(volume, isMuted) {
  const el = mpGetElements();
  if (!el.volumeSlider) return;

  el.volumeSlider.value = isMuted ? 0 : volume;

  if (isMuted || volume === 0) {
    el.volumeOnIcon.classList.add('hidden');
    el.volumeMuteIcon.classList.remove('hidden');
  } else {
    el.volumeOnIcon.classList.remove('hidden');
    el.volumeMuteIcon.classList.add('hidden');
  }
}

function toggleLike() {
  if (_activePlaylist.length === 0) return;
  const track = _activePlaylist[_currentTrackIndex];
  const el = mpGetElements();
  if (_likedSongs.has(track.file)) {
    _likedSongs.delete(track.file);
  } else {
    _likedSongs.add(track.file);
    if (el.likeBtn) {
      // Explode cute heart sparkles on like!
      spawnSparkles(6, el.likeBtn);
    }
  }
  saveLikedSongs();
  updateLikeUI();
  populatePlaylistUI();
}

function updateLikeUI() {
  const el = mpGetElements();
  if (!el.likeBtn) return;
  if (_activePlaylist.length === 0) {
    el.likeBtn.classList.remove('liked');
    return;
  }
  const track = _activePlaylist[_currentTrackIndex];
  const isLiked = _likedSongs.has(track.file);
  el.likeBtn.classList.toggle('liked', isLiked);
}

function deleteTrackFromPlaylist(filename) {
  const currentTrack = _activePlaylist[_currentTrackIndex];
  const isCurrent = currentTrack && currentTrack.file === filename;

  _deletedSongs.add(filename);
  saveDeletedSongs();
  rebuildActivePlaylist();

  if (isCurrent) {
    if (_activePlaylist.length > 0) {
      if (_currentTrackIndex >= _activePlaylist.length) {
        _currentTrackIndex = 0;
      }
      loadTrack(_currentTrackIndex, _isPlaying);
    } else {
      loadTrack(0, false);
    }
  } else {
    if (currentTrack) {
      const newIndex = _activePlaylist.findIndex(t => t.file === currentTrack.file);
      if (newIndex !== -1) {
        _currentTrackIndex = newIndex;
      }
    }
    populatePlaylistUI();
  }
}

function resetPlaylist() {
  _deletedSongs.clear();
  saveDeletedSongs();
  rebuildActivePlaylist();
  populatePlaylistUI();
  _currentTrackIndex = 0;
  loadTrack(0, _isPlaying);
}

function populatePlaylistUI() {
  const el = mpGetElements();
  if (!el.playlistList) return;

  el.playlistList.innerHTML = '';
  
  if (_activePlaylist.length === 0) {
    el.playlistList.innerHTML = `
      <div style="font-size: 10px; color: var(--text-muted); text-align: center; padding: 12px; font-weight: 700;">
        Плейлист пуст
      </div>
    `;
    return;
  }

  _activePlaylist.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = 'mp-playlist-item';
    if (index === _currentTrackIndex) item.className += ' active';
    item.dataset.index = index;

    const isLiked = _likedSongs.has(track.file);

    item.innerHTML = `
      <span class="mp-playlist-item-num">${(index + 1).toString().padStart(2, '0')}</span>
      <span class="mp-playlist-item-title">${track.name}</span>
      <span class="mp-playlist-item-like ${isLiked ? 'liked' : ''}">
        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </span>
      <span class="mp-playlist-item-delete" title="Исключить трек">
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.mp-playlist-item-delete')) return;
      sfxClick();
      playTrack(index);
    });

    const delBtn = item.querySelector('.mp-playlist-item-delete');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sfxClick();
        deleteTrackFromPlaylist(track.file);
      });
    }

    el.playlistList.appendChild(item);
  });
}

function updatePlaylistActiveUI() {
  const el = mpGetElements();
  if (!el.playlistList) return;

  const items = el.playlistList.querySelectorAll('.mp-playlist-item');
  items.forEach((item, index) => {
    if (index === _currentTrackIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function updateMarqueeState() {
  const el = mpGetElements();
  if (!el.title) return;

  // Temporarily remove marquee class to measure actual size
  el.title.classList.remove('marquee');
  el.title.style.left = '0';

  const containerWidth = el.title.parentElement.offsetWidth;
  const textWidth = el.title.offsetWidth;

  if (textWidth > containerWidth) {
    el.title.classList.add('marquee');
  }
}

function loadTrack(index, autoplay = true) {
  const el = mpGetElements();
  
  if (_activePlaylist.length === 0) {
    if (el.title) el.title.textContent = 'Нет треков';
    _musicAudio.src = '';
    _musicAudio.load();
    pauseMusic(false);
    updatePlaylistActiveUI();
    updateLikeUI();
    return;
  }

  if (index < 0 || index >= _activePlaylist.length) {
    index = 0;
  }
  _currentTrackIndex = index;

  const track = _activePlaylist[index];
  if (el.title) el.title.textContent = track.name;

  _musicAudio.src = 'audio/' + track.file;
  _musicAudio.load();

  updatePlaylistActiveUI();
  updateLikeUI();

  if (autoplay && soundOn) {
    playMusic();
  } else {
    pauseMusic(false); // set state without calling HTML5 pause if already paused
  }

  // System Media Session Integration
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: 'K-Pop Star Maker',
      album: 'Eclipse Soundtrack',
      artwork: [
        { src: 'Items/UI/profile_image.jpg', sizes: '64x64', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', playMusic);
    navigator.mediaSession.setActionHandler('pause', pauseMusic);
    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
  }
}

function playTrack(index) {
  loadTrack(index, true);
}

function playMusic() {
  if (!soundOn || _activePlaylist.length === 0) return;
  _isPlaying = true;
  
  const el = mpGetElements();
  if (el.container) el.container.classList.add('playing');
  if (el.playIcon) {
    el.playIcon.classList.add('hidden');
    el.pauseIcon.classList.remove('hidden');
  }

  _musicAudio.play().catch(err => {
    console.warn("Audio play blocked by browser. Awaiting user interaction.", err);
    _isPlaying = false;
    if (el.container) el.container.classList.remove('playing');
    if (el.playIcon) {
      el.playIcon.classList.remove('hidden');
      el.pauseIcon.classList.add('hidden');
    }
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = 'playing';
  }
}

function pauseMusic(callHtmlPause = true) {
  _isPlaying = false;

  const el = mpGetElements();
  if (el.container) el.container.classList.remove('playing');
  if (el.playIcon) {
    el.playIcon.classList.remove('hidden');
    el.pauseIcon.classList.add('hidden');
  }

  if (callHtmlPause) {
    _musicAudio.pause();
  }

  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = 'paused';
  }
}

function nextTrack() {
  if (_activePlaylist.length === 0) return;
  if (_isShuffle) {
    const randomIndex = Math.floor(Math.random() * _activePlaylist.length);
    playTrack(randomIndex);
  } else {
    const nextIndex = (_currentTrackIndex + 1) % _activePlaylist.length;
    playTrack(nextIndex);
  }
}

function prevTrack() {
  if (_activePlaylist.length === 0) return;
  // If track has been playing for more than 3 seconds, restart it. Otherwise go to previous.
  if (_musicAudio.currentTime > 3) {
    _musicAudio.currentTime = 0;
  } else {
    const prevIndex = (_currentTrackIndex - 1 + _activePlaylist.length) % _activePlaylist.length;
    playTrack(prevIndex);
  }
}

function startBGM() {
  if (!soundOn) return;
  playMusic();
}

function stopBGM() {
  pauseMusic();
}

function pauseBGM() {
  pauseMusic();
}

function resumeBGM() {
  if (soundOn) playMusic();
}

// ── Sound toggle ─────────────────────────────────────────────

function toggleSound() {
  soundOn = !soundOn;
  try { localStorage.setItem('kpop_sound', soundOn ? '1' : '0'); } catch(e) {}
  const btn = $('btn-sound');
  if (btn) {
    btn.classList.toggle('muted', !soundOn);
  }
  if (soundOn) {
    if (_actx) _actx.resume();
    actx();
    playMusic();
    sfxClick();
  } else {
    pauseMusic();
  }
}

function initAudio() {
  soundOn = localStorage.getItem('kpop_sound') !== '0';
  const btn = $('btn-sound');
  if (btn) {
    btn.classList.toggle('muted', !soundOn);
  }
  
  // Initialize mini player controls and list
  initMiniPlayer();

  // Unlock audio contexts and start music on first user click
  document.addEventListener('click', function onFirstClick() {
    actx();
    if (soundOn) playMusic();
    document.removeEventListener('click', onFirstClick);
  }, { once: true });
}

// ────────────────────────────────────────────────────────────
// SPARKLE EFFECT
// ────────────────────────────────────────────────────────────

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

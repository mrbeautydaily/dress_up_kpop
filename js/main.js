// ────────────────────────────────────────────────────────────
// LOADING SCREEN
// ────────────────────────────────────────────────────────────

function getAllImageSrcs() {
  const srcs = new Set();
  srcs.add('Items/body/body_new.png');
  BACKGROUNDS.forEach(bg => srcs.add(bg));
  Object.values(clothes).forEach(category => {
    category.forEach(item => { if (item.src) srcs.add(item.src); });
  });
  return [...srcs];
}

// Глобальный кеш — держим ссылки на Image чтобы GC не удалил до рендера
const _imgCache = Object.create(null);

function preloadImages(srcs, onProgress) {
  return new Promise(resolve => {
    if (!srcs.length) { resolve(); return; }
    let done = 0;
    const finish = () => {
      done++;
      onProgress(done / srcs.length);
      if (done >= srcs.length) resolve();
    };
    srcs.forEach(src => {
      // Уже в кеше — не грузим повторно
      if (_imgCache[src]) { finish(); return; }
      const img = new Image();
      _imgCache[src] = img;   // сохраняем ссылку — защита от GC
      img.onload  = finish;
      img.onerror = finish;   // ошибка тоже считается — не блокируем загрузку
      img.src = src;
    });
  });
}

// <link rel="preload"> — браузер начинает качать на высшем приоритете
// ещё до того, как JS дойдёт до new Image()
function injectPreloadLinks(srcs) {
  const frag = document.createDocumentFragment();
  srcs.forEach(src => {
    const link = document.createElement('link');
    link.rel  = 'preload';
    link.as   = 'image';
    link.href = src;
    frag.appendChild(link);
  });
  document.head.appendChild(frag);
}

async function runLoadingScreen() {
  const bar = $('loading-bar');
  bar.style.width = '5%';

  const srcs = getAllImageSrcs();

  // Сообщаем браузеру о всех картинках сразу — они начинают качаться параллельно
  injectPreloadLinks(srcs);

  await preloadImages(srcs, ratio => {
    bar.style.width = (5 + ratio * 85) + '%';
  });

  bar.style.width = '90%';
}

// ────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// п. 1.10.2 — блокировка браузерной прокрутки и swipe-to-refresh
// п. 1.6.2.7 — блокировка выделения текста и контекстного меню
// ────────────────────────────────────────────────────────────
(function blockBrowserGestures() {
  // Контекстное меню (правая кнопка / long-press)
  document.addEventListener('contextmenu', e => e.preventDefault());

  // touchmove с passive:false позволяет вызывать preventDefault,
  // что блокирует pull-to-refresh и вертикальный overscroll браузера.
  // Скролл внутри .scrollable-zone разрешён через touch-action: pan-y в CSS.
  document.addEventListener('touchmove', e => {
    // Разрешаем если у цели есть прокручиваемый родитель (вертикальный или горизонтальный)
    let el = e.target;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const oy = style.overflowY;
      const ox = style.overflowX;
      const canScrollV = (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight;
      const canScrollH = (ox === 'auto' || ox === 'scroll') && el.scrollWidth  > el.clientWidth;
      if (canScrollV || canScrollH) return;
      el = el.parentElement;
    }
    e.preventDefault();
  }, { passive: false });
})();

async function init() {
  // Apply browser-detected language to loading screen immediately
  applyLoadingTranslations();

  await runLoadingScreen();

  // Init SDK — may refine lang to Yandex-authoritative value
  await initYandexSDK();

  // Complete the progress bar
  const bar = $('loading-bar');
  if (bar) bar.style.width = '100%';

  // Загружаем прогресс ДО initPayments, чтобы restorePurchases не перезаписал данные
  await loadProgress();
  loadOutfit();
  loadSchoolProgress();

  // Инициализируем платежи после загрузки прогресса (п. 1.13.1)
  await initPayments();

  buildCharacterLayers();
  renderAllLayers();
  updateOutfitName();
  updateStageBackground('photoshoot');

  // Apply full translations (lang now finalised)
  applyTranslations();

  // Wire up buttons
  const cardToggle = $('assignment-card-toggle');
  if (cardToggle) {
    cardToggle.addEventListener('click', () => {
      sfxClick();
      $('assignment-banner').classList.toggle('collapsed');
      setTimeout(() => {
        adjustAssignmentBannerWidth();
        adjustStageCounters();
      }, 0);
    });
  }

  // Auto-collapse assignment banner on very narrow screens to prevent overlapping the character
  window.addEventListener('resize', () => {
    const banner = $('assignment-banner');
    if (banner && !banner.classList.contains('hidden') && window.innerWidth < 768) {
      banner.classList.add('collapsed');
    }
    adjustAssignmentBannerWidth();
    adjustStageCounters();
  });
  // Trigger once on load
  if (window.innerWidth < 768) {
    const banner = $('assignment-banner');
    if (banner) banner.classList.add('collapsed');
  }
  setTimeout(() => {
    adjustAssignmentBannerWidth();
    adjustStageCounters();
  }, 100);



  $('stars-display').addEventListener('click', () => { sfxClick(); showShopModal(); });
  $('btn-runway').addEventListener('click', onRunwayClick);
  $('shop-close').addEventListener('click', () => { sfxClick(); $('shop-modal').classList.add('hidden'); });
  $('btn-sound').addEventListener('click', toggleSound);
  $('btn-share-score').addEventListener('click', () => { sfxClick(); shareOutfit(); });
  $('btn-share-stage').addEventListener('click', () => { sfxClick(); shareOutfit(); });
  $('btn-random-stage').addEventListener('click', () => { sfxClick(); randomOutfit(); });
  $('btn-prev-bg').addEventListener('click', () => { sfxClick(); changeBackground(-1); });

  // --- Dynamic Proportional Scaling for Panel Controls ---
  function fitPanelControls() {
    const outer = $('panel-controls');
    const inner = $('panel-controls-inner');
    if (!outer || !inner) return;

    // Temporarily remove transform to measure natural sizes
    inner.style.transform = 'none';

    // In mobile view (absolute positioned), we don't necessarily want to force scaling,
    // but the CSS handles width: auto. Let's still protect against extreme overflow.
    
    // Get available width from the outer container (subtracting padding)
    const computedStyle = window.getComputedStyle(outer);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const availableWidth = outer.clientWidth - paddingLeft - paddingRight;

    // Get the required physical width of the inner content
    const requiredWidth = inner.scrollWidth;

    if (requiredWidth > availableWidth && availableWidth > 0) {
      // If it doesn't fit, scale it down proportionally
      const scale = availableWidth / requiredWidth;
      inner.style.transform = `scale(${scale})`;
    } else {
      // It fits perfectly, keep natural size
      inner.style.transform = 'none';
    }
  }

  // Use ResizeObserver to watch for changes to the panel's physical size
  const panelResizeObserver = new ResizeObserver(() => {
    fitPanelControls();
  });
  const panelControlsEl = $('panel-controls');
  if (panelControlsEl) {
    panelResizeObserver.observe(panelControlsEl);
    // Initial fit
    fitPanelControls();
  }
  // Also hook into window resize just in case fonts load later and change inner width
  window.addEventListener('resize', fitPanelControls);
  $('btn-next-bg').addEventListener('click', () => { sfxClick(); changeBackground(1); });
  updateLikesDisplay();
  initAudio();


  // Initialize developer tools panel
  initDevPanel();



  // Hide loading, show intro or game
  const loadingEl = $('loading-screen');
  loadingEl.style.transition = 'opacity .4s ease';
  loadingEl.style.opacity = '0';
  loadingEl.addEventListener('transitionend', () => {
    loadingEl.remove();
    if (!localStorage.getItem('kpop_intro_done')) {
      showIntro();
      markGameReady();
    } else {
      $('game').classList.remove('hidden');
      startSchoolMode();
      checkDailyLogin();
      markGameReady();
    }
  }, { once: true });
}

// ────────────────────────────────────────────────────────────
// DEVELOPER TOOLS PANEL
// ────────────────────────────────────────────────────────────

function initDevPanel() {
  const trigger = $('dev-panel-trigger');
  const panel = $('dev-panel');
  const closeBtn = $('dev-panel-close');
  const resetBtn = $('dev-panel-reset');
  const charSlider = $('dev-char-scale');
  const charVal = $('dev-char-scale-val');
  const charYSlider = $('dev-char-y');
  const charYVal = $('dev-char-y-val');
  const bgSlider = $('dev-bg-scale');
  const bgVal = $('dev-bg-scale-val');
  const bgYSlider = $('dev-bg-y');
  const bgYVal = $('dev-bg-y-val');
  const bgBlurSlider = $('dev-bg-blur');
  const bgBlurVal = $('dev-bg-blur-val');
  const bgDimSlider = $('dev-bg-dim');
  const bgDimVal = $('dev-bg-dim-val');
  const auraOpacitySlider = $('dev-aura-opacity');
  const auraOpacityVal = $('dev-aura-opacity-val');
  const auraColorSelect = $('dev-aura-color');

  if (!trigger || !panel || !closeBtn || !charSlider || !charYSlider || !bgSlider || !bgYSlider || !bgBlurSlider || !bgDimSlider || !auraOpacitySlider || !auraColorSelect) return;

  // Toggle dev panel view
  trigger.addEventListener('click', () => {
    panel.classList.toggle('closed');
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.add('closed');
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.classList.contains('closed')) {
      panel.classList.add('closed');
    }
  });

  // Load values from localStorage
  const savedCharScale = localStorage.getItem('dev_char_scale') || '1.15';
  const savedCharY = localStorage.getItem('dev_char_y') || '30';
  const savedBgScale = localStorage.getItem('dev_bg_scale') || '0.95';
  const savedBgY = localStorage.getItem('dev_bg_y') || '0';
  const savedBgBlur = localStorage.getItem('dev_bg_blur') || '1';
  const savedBgDim = localStorage.getItem('dev_bg_dim') || '5';
  const savedAuraOpacity = localStorage.getItem('dev_aura-opacity') || '40';
  const savedAuraColor = localStorage.getItem('dev_aura-color') || 'warm';

  // Apply scales and values initially
  applyCharScale(savedCharScale);
  applyCharY(savedCharY);
  applyBgScale(savedBgScale);
  applyBgY(savedBgY);
  applyBgBlur(savedBgBlur);
  applyBgDim(savedBgDim);
  applyAuraOpacity(savedAuraOpacity);
  applyAuraColor(savedAuraColor);

  // Sync sliders
  charSlider.value = savedCharScale;
  charVal.textContent = parseFloat(savedCharScale).toFixed(2) + 'x';
  
  charYSlider.value = savedCharY;
  charYVal.textContent = savedCharY + 'px';

  bgSlider.value = savedBgScale;
  bgVal.textContent = parseFloat(savedBgScale).toFixed(2) + 'x';

  bgYSlider.value = savedBgY;
  bgYVal.textContent = savedBgY + 'px';

  bgBlurSlider.value = savedBgBlur;
  bgBlurVal.textContent = parseFloat(savedBgBlur).toFixed(1) + 'px';

  bgDimSlider.value = savedBgDim;
  bgDimVal.textContent = savedBgDim + '%';

  auraOpacitySlider.value = savedAuraOpacity;
  auraOpacityVal.textContent = savedAuraOpacity + '%';

  auraColorSelect.value = savedAuraColor;

  // Slider change listeners
  charSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyCharScale(val);
    charVal.textContent = parseFloat(val).toFixed(2) + 'x';
    localStorage.setItem('dev_char_scale', val);
  });

  charYSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyCharY(val);
    charYVal.textContent = val + 'px';
    localStorage.setItem('dev_char_y', val);
  });

  bgSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyBgScale(val);
    bgVal.textContent = parseFloat(val).toFixed(2) + 'x';
    localStorage.setItem('dev_bg_scale', val);
  });

  bgYSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyBgY(val);
    bgYVal.textContent = val + 'px';
    localStorage.setItem('dev_bg_y', val);
  });

  bgBlurSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyBgBlur(val);
    bgBlurVal.textContent = parseFloat(val).toFixed(1) + 'px';
    localStorage.setItem('dev_bg_blur', val);
  });

  bgDimSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyBgDim(val);
    bgDimVal.textContent = val + '%';
    localStorage.setItem('dev_bg_dim', val);
  });

  auraOpacitySlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyAuraOpacity(val);
    auraOpacityVal.textContent = val + '%';
    localStorage.setItem('dev_aura-opacity', val);
  });

  auraColorSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    applyAuraColor(val);
    localStorage.setItem('dev_aura-color', val);
  });

  // Reset function
  resetBtn.addEventListener('click', () => {
    applyCharScale('1.15');
    applyCharY('30');
    applyBgScale('0.95');
    applyBgY('0');
    applyBgBlur('1');
    applyBgDim('5');
    applyAuraOpacity('40');
    applyAuraColor('warm');
    
    charSlider.value = '1.15';
    charVal.textContent = '1.15x';
    
    charYSlider.value = '30';
    charYVal.textContent = '30px';

    bgSlider.value = '0.95';
    bgVal.textContent = '0.95x';

    bgYSlider.value = '0';
    bgYVal.textContent = '0px';

    bgBlurSlider.value = '1';
    bgBlurVal.textContent = '1.0px';

    bgDimSlider.value = '5';
    bgDimVal.textContent = '5%';

    auraOpacitySlider.value = '40';
    auraOpacityVal.textContent = '40%';

    auraColorSelect.value = 'warm';
    
    localStorage.setItem('dev_char_scale', '1.15');
    localStorage.setItem('dev_char_y', '30');
    localStorage.setItem('dev_bg_scale', '0.95');
    localStorage.setItem('dev_bg_y', '0');
    localStorage.setItem('dev_bg_blur', '1');
    localStorage.setItem('dev_bg_dim', '5');
    localStorage.setItem('dev_aura-opacity', '40');
    localStorage.setItem('dev_aura-color', 'warm');
  });

  function applyCharScale(val) {
    document.documentElement.style.setProperty('--char-scale', val);
  }

  function applyCharY(val) {
    document.documentElement.style.setProperty('--char-y', val + 'px');
  }

  function applyBgScale(val) {
    document.documentElement.style.setProperty('--bg-scale', val);
  }

  function applyBgY(val) {
    document.documentElement.style.setProperty('--bg-y', val + 'px');
  }

  function applyBgBlur(val) {
    document.documentElement.style.setProperty('--bg-blur', val + 'px');
  }

  function applyBgDim(val) {
    const brightness = (1 - parseFloat(val) / 100).toFixed(2);
    document.documentElement.style.setProperty('--bg-brightness', brightness);
  }

  function applyAuraOpacity(val) {
    const opacity = (parseFloat(val) / 100).toFixed(2);
    document.documentElement.style.setProperty('--char-aura-opacity', opacity);
  }

  function applyAuraColor(val) {
    let gradient = '';
    if (val === 'warm') {
      gradient = 'radial-gradient(ellipse at center, rgba(255, 253, 240, 0.6) 0%, rgba(255, 240, 210, 0.35) 45%, rgba(255, 240, 210, 0.1) 70%, transparent 85%)';
    } else if (val === 'white') {
      gradient = 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0.1) 70%, transparent 85%)';
    } else if (val === 'purple') {
      gradient = 'radial-gradient(ellipse at center, rgba(228, 174, 252, 0.55) 0%, rgba(161, 72, 200, 0.3) 45%, rgba(161, 72, 200, 0.1) 70%, transparent 85%)';
    } else if (val === 'pink') {
      gradient = 'radial-gradient(ellipse at center, rgba(253, 171, 213, 0.55) 0%, rgba(209, 71, 141, 0.3) 45%, rgba(209, 71, 141, 0.1) 70%, transparent 85%)';
    } else if (val === 'dark') {
      gradient = 'radial-gradient(ellipse at center, rgba(16, 4, 28, 0.6) 0%, rgba(30, 8, 50, 0.3) 45%, rgba(30, 8, 50, 0.1) 70%, transparent 85%)';
    }
    document.documentElement.style.setProperty('--char-aura-gradient', gradient);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

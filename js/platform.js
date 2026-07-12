// ────────────────────────────────────────────────────────────
// YANDEX GAMES SDK
// ────────────────────────────────────────────────────────────

let ysdk       = null;
let _player    = null;
let _adShowing = false;
let _gameReadySent = false;

window.isGamePausedByYandex = false;
window.yandexResumeCallbacks = [];

let deviceType = 'desktop';
let isMobileDevice = false;

window.isIOSDevice = false;

function applyIOSHiding() {
  if (window.isIOSDevice && !window.iosHiddenApplied) {
    window.iosHiddenApplied = true;
    console.log('[Device] iOS detected. Hiding share buttons.');
    const style = document.createElement('style');
    style.innerHTML = '#btn-share-stage, #btn-share-score { display: none !important; }';
    document.head.appendChild(style);
  }
}

// Initial check via User Agent (runs immediately)
const initialUaCheck = navigator.userAgent.toLowerCase();
if (/iphone|ipad|ipod/i.test(initialUaCheck) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
  window.isIOSDevice = true;
  applyIOSHiding();
}

function detectDevice() {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  }

  const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (hasTouch && (window.innerWidth <= 1024 || window.innerHeight <= 1024)) {
    if (deviceType === 'desktop') {
      deviceType = 'mobile';
    }
  }

  // Эмуляция мобильного устройства для локального тестирования (без телефона и Device Emulator)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
    deviceType = 'mobile';
    console.log('[Dev] Эмуляция мобильного устройства включена');
  }

  document.body.classList.remove('device-desktop', 'device-mobile', 'device-tablet', 'device-tv', 'is-mobile', 'is-desktop');
  document.body.classList.add('device-' + deviceType);
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    document.body.classList.add('is-mobile');
    isMobileDevice = true;
  } else {
    document.body.classList.add('is-desktop');
    isMobileDevice = false;
  }
  
  console.log('[Device] Initial detection:', deviceType, '| is-mobile:', isMobileDevice);
}

// Run immediately since script is at the bottom of the body
detectDevice();

/**
 * On mobile/tablet: move btn-sound and btn-share-stage from the
 * category panel into #mobile-stage-btns (bottom-right of the game stage).
 * On desktop: do nothing — buttons stay in #category-panel.
 * Called once after Yandex SDK finalises device detection.
 */
function relocateButtonsForMobile() {
  if (!isMobileDevice) return;

  const container = document.getElementById('mobile-stage-btns');
  const btnShare  = document.getElementById('btn-share-stage');
  const btnSound  = document.getElementById('btn-sound');

  if (!container) return;

  // Move buttons into the stage container
  if (btnShare) container.appendChild(btnShare);
  if (btnSound) container.appendChild(btnSound);

  // Activate the container (makes it visible via CSS)
  container.classList.add('active');

  console.log('[Mobile] Sound & screenshot buttons moved to game stage');
}

function markGameReady() {
  if (_gameReadySent) return;
  _gameReadySent = true;
  try { ysdk?.features?.LoadingAPI?.ready(); } catch (e) { console.warn('[YaGames] LoadingAPI.ready error:', e); }
}

async function initYandexSDK() {
  if (typeof YaGames === 'undefined') {
    console.log('[i18n] YaGames SDK not found — browser lang:', lang);
    return;
  }
  try {
    ysdk = await YaGames.init();

    // Refine device detection using Yandex SDK
    if (ysdk && ysdk.deviceInfo) {
      let type = ysdk.deviceInfo.type; // 'desktop', 'mobile', 'tablet', 'tv'
      
      // Override YSDK detection if the user agent is explicitly mobile (e.g. Chrome Device Emulator)
      const ua = navigator.userAgent.toLowerCase();
      const isUAMobile = /mobile|android|iphone|ipad|phone/i.test(ua);
      if (isUAMobile && (type === 'desktop' || type === 'tv')) {
        type = 'mobile';
      }

      // Эмуляция мобильного устройства для локального тестирования
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
        type = 'mobile';
      }

      console.log('[Device] YSDK detected type:', type);
      deviceType = type;
      document.body.classList.remove('device-desktop', 'device-mobile', 'device-tablet', 'device-tv', 'is-mobile', 'is-desktop');
      document.body.classList.add('device-' + type);
      if (type === 'mobile' || type === 'tablet') {
        document.body.classList.add('is-mobile');
        isMobileDevice = true;
      } else {
        document.body.classList.add('is-desktop');
        isMobileDevice = false;
      }
    }

    const i18n    = ysdk.environment.i18n;
    
    // Check for iOS via YSDK environment if available
    if (ysdk.environment && ysdk.environment.browser && ysdk.environment.browser.os === 'iOS') {
      window.isIOSDevice = true;
      applyIOSHiding();
    }

    const sdkLang = i18n && i18n.lang ? i18n.lang : '';
    const sdkTld  = i18n && i18n.tld  ? i18n.tld  : '';

    console.log('[i18n] SDK ready — lang:', sdkLang, '| tld:', sdkTld);

    // Умное определение для СНГ (Языки и Домены)
    const cisLangs = ['ru', 'be', 'kk', 'uk', 'uz', 'az', 'hy', 'ka', 'mo', 'tg', 'tk', 'ky'];
    const cisTlds  = ['ru', 'by', 'kz', 'ua', 'uz', 'az', 'am', 'ge', 'md', 'tj', 'tm', 'kg'];

    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');

    if (urlLang) {
      lang = cisLangs.includes(urlLang) ? 'ru' : 'en';
    } else if (sdkLang) {
      lang = cisLangs.includes(sdkLang) ? 'ru' : 'en';
    } else if (sdkTld) {
      lang = cisTlds.includes(sdkTld) ? 'ru' : 'en';
    }
    // если SDK ничего не дал и параметров нет — остаётся результат detectLangFromBrowser()

    console.log('[i18n] Language set to:', lang);

    // Получаем объект игрока для серверного сохранения прогресса (п. 1.13.3)
    try { _player = await ysdk.getPlayer({ scopes: false }); } catch (e) { console.warn('[Player] getPlayer error:', e); }

    // Пауза звука при сворачивании / смене вкладки (требование модерации Яндекс)
    const _audioPause = () => { if (_actx) _actx.suspend(); pauseBGM(); };
    const _audioResume = () => { if (_adShowing || window.isGamePausedByYandex) return; if (soundOn) { if (_actx) _actx.resume(); resumeBGM(); } };

    // Обработка событий паузы от Яндекса (реклама, покупки)
    ysdk.on('game_api_pause', () => {
      console.log('[YaGames] game_api_pause fired');
      window.isGamePausedByYandex = true;
      _audioPause();
    });

    ysdk.on('game_api_resume', () => {
      console.log('[YaGames] game_api_resume fired');
      window.isGamePausedByYandex = false;
      _audioResume();
      // Запускаем отложенные действия, которые ждали конца рекламы
      if (window.yandexResumeCallbacks.length > 0) {
        window.yandexResumeCallbacks.forEach(cb => cb());
        window.yandexResumeCallbacks = [];
      }
    });

    // Основной способ — срабатывает на смену вкладки, сворачивание, меню вкладок
    document.addEventListener('visibilitychange', () => {
      document.hidden ? _audioPause() : _audioResume();
    });

    // Страховка для мобильных браузеров (Android / некоторые WebView)
    window.addEventListener('pagehide', _audioPause);
    window.addEventListener('pageshow', _audioResume);

    // Страховка для десктопа — потеря фокуса окном браузера
    window.addEventListener('blur', _audioPause);
    window.addEventListener('focus', _audioResume);

  } catch (e) {
    console.warn('[YaGames] init error:', e);
  }
}

function showFullscreenAd(onDone) {
  if (!ysdk) { if (onDone) onDone(); return; }
  if (_adShowing) { if (onDone) onDone(); return; }
  _adShowing = true;
  if (_actx) _actx.suspend();
  pauseBGM();

  let _adDone = false;
  const finish = () => {
    if (_adDone) return;
    _adDone = true;
    _adShowing = false;
    if (_actx && soundOn) _actx.resume();
    resumeBGM();
    if (onDone) onDone();
  };

  const fallback = setTimeout(() => {
    if (_adDone) return;
    _adDone = true;
    _adShowing = false;
    if (onDone) onDone();
  }, 8000);

  ysdk.adv.showFullscreenAdv({
    callbacks: {
      onOpen:   () => { clearTimeout(fallback); if (_actx) _actx.suspend(); pauseBGM(); },
      onClose:  () => { clearTimeout(fallback); finish(); },
      onOffline:() => { clearTimeout(fallback); finish(); },
      onError:  () => { clearTimeout(fallback); finish(); },
    },
  });
}

// ────────────────────────────────────────────────────────────
// IN-APP PURCHASES — Яндекс Игры Payments
// ────────────────────────────────────────────────────────────

let _payments = null;
let _catalog  = []; // реальные данные о товарах из каталога Яндекса

// Пакеты звёзд (теперь дают лайки). id должны совпадать с продуктами в консоли Яндекс Игр.
async function initPayments() {
  if (!ysdk) return;
  try {
    // signed: false — клиентский режим (серверная верификация не используется)
    _payments = await ysdk.getPayments({ signed: false });
    // Загружаем каталог чтобы показывать реальные цены из консоли Яндекса
    _catalog = await _payments.getCatalog();
    console.log('[Payments] catalog loaded:', _catalog.map(c => c.id));
    if (_catalog.length === 0) {
      console.warn('[Payments] catalog is empty — продукты не созданы в консоли Яндекс Игр');
    }
    await restorePurchases();
  } catch (e) {
    console.warn('[Payments] unavailable:', e);
  }
}

async function restorePurchases() {
  if (!_payments) return;
  try {
    const purchases = await _payments.getPurchases();
    for (const p of purchases) {
      const pkg = STAR_PACKAGES.find(pk => pk.id === p.productID);
      if (pkg) addStars(pkg.stars + pkg.bonus);
      // Сохраняем данные ДО consumePurchase — покупка удаляется безвозвратно (п. 1.13.1)
      await saveProgress();
      await _payments.consumePurchase(p.purchaseToken);
    }
  } catch (e) {
    console.warn('[Payments] restorePurchases error:', e);
  }
}

async function buyStarPackage(pkg, cardEl) {
  cardEl.classList.add('loading');
  try {
    if (_payments) {
      // Проверяем что продукт есть в каталоге прежде чем делать запрос
      const inCatalog = _catalog.find(c => c.id === pkg.id);
      if (!inCatalog) {
        console.error(`[Payments] product "${pkg.id}" not found in catalog. Catalog IDs:`, _catalog.map(c => c.id));
        showToast(lang === 'ru' ? '⚠️ Продукт не настроен в консоли' : '⚠️ Product not set up in console', 'error');
        return;
      }
      const purchase = await _payments.purchase({ id: pkg.id });
      grantStarPackage(pkg);
      // Сохраняем данные ДО consumePurchase — покупка удаляется безвозвратно
      await saveProgress();
      await _payments.consumePurchase(purchase.purchaseToken);
    } else {
      // Dev-режим без SDK — симулируем покупку
      grantStarPackage(pkg);
    }
    $('shop-modal').classList.add('hidden');
  } catch (e) {
    console.error('[Payments] purchase error:', e);
    if (e && e.code !== 'UserCanceled') {
      showToast(lang === 'ru' ? 'Ошибка покупки' : 'Purchase failed', 'error');
    }
  } finally {
    cardEl.classList.remove('loading');
  }
}

function grantStarPackage(pkg) {
  const total = pkg.stars + pkg.bonus;
  addStars(total);
  buildItemsGrid(activeCategory);
  spawnSparkles(14, null, 'star');
  sfxUnlock();
  const msg = pkg.bonus > 0
    ? (lang === 'ru' ? `+${formatStars(pkg.stars)} <img src="Items/UI/star.png" class="inline-heart" alt="star"> и +${formatStars(pkg.bonus)} бонус!` : `+${formatStars(pkg.stars)} <img src="Items/UI/star.png" class="inline-heart" alt="star"> + ${formatStars(pkg.bonus)} bonus!`)
    : `+${formatStars(pkg.stars)} <img src="Items/UI/star.png" class="inline-heart" alt="star">`;
  showToast(msg, 'reward');
}

function showShopModal() {
  const modal = $('shop-modal');
  const container = $('shop-packages');
  container.innerHTML = '';

  const titleEl = $('shop-title');
  const subtitleEl = $('shop-subtitle');
  if (titleEl) titleEl.textContent = lang === 'ru' ? 'Магазин' : 'Shop';
  if (subtitleEl) subtitleEl.textContent = lang === 'ru' ? 'Покупай звёзды и разблокируй весь гардероб!' : 'Buy stars and unlock the entire wardrobe!';

  // ── Кнопка "1000 звёзд за рекламу" (во всю ширину, сверху) ──
  const adCard = document.createElement('div');
  adCard.className = 'shop-ad-card';
  adCard.innerHTML = `
    <img src="Items/UI/shop_ad_tv.png" class="shop-ad-icon-img" alt="ad icon">
    <span class="shop-ad-text">
      <b>+50 <img src="Items/UI/star.png" class="inline-heart" alt="star"></b> — ${lang === 'ru' ? 'смотри рекламу и забирай' : 'watch an ad and claim'}
    </span>
    <span class="shop-ad-btn">${lang === 'ru' ? 'Смотреть' : 'Watch'}</span>`;
  adCard.addEventListener('click', () => {
    if (_adShowing) return;
    $('shop-modal').classList.add('hidden');
    adCard.classList.add('loading');
    if (typeof ysdk !== 'undefined' && ysdk && ysdk.adv) {
      _adShowing = true;
      if (_actx) _actx.suspend(); pauseBGM();
      let _rewarded = false;
      ysdk.adv.showRewardedVideo({
        callbacks: {
          onRewarded: () => { _rewarded = true; },
          onClose: () => {
            _adShowing = false;
            adCard.classList.remove('loading');
            if (_actx && soundOn) _actx.resume(); resumeBGM();
            if (_rewarded) { addStars(50); spawnSparkles(8, null, 'star'); showToast('+50 <img src="Items/UI/star.png" class="inline-heart" alt="star">', 'reward'); }
          },
          onError: () => {
            _adShowing = false;
            adCard.classList.remove('loading');
            if (_actx && soundOn) _actx.resume(); resumeBGM();
            showToast(lang === 'ru' ? 'Реклама недоступна' : 'Ad unavailable', 'error');
          },
        },
      });
    } else {
      addStars(50); spawnSparkles(8, null, 'star'); showToast('+50 <img src="Items/UI/star.png" class="inline-heart" alt="star"> (dev)', 'reward');
      adCard.classList.remove('loading');
    }
  });
  container.appendChild(adCard);

  // ── Пакеты звёзд (сетка 2×2) ──
  const grid = document.createElement('div');
  grid.className = 'shop-grid';

  STAR_PACKAGES.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'shop-card' + (pkg.popular ? ' popular' : '');

    const bonusLine = pkg.bonus > 0
      ? `<div class="shop-card-bonus">+${formatStars(pkg.bonus)} ${lang === 'ru' ? 'бонус!' : 'bonus!'}</div>`
      : `<div class="shop-card-bonus"></div>`;

    const badgeHtml = pkg.popular
      ? `<div class="shop-card-badge">${lang === 'ru' ? 'Хит' : 'Popular'}</div>`
      : '';

    const catalogPrice = (_catalog.find(c => c.id === pkg.id) || {}).price;
    const displayPrice = catalogPrice || (lang === 'ru' ? pkg.priceRu : pkg.priceEn);

    card.innerHTML = `
      ${badgeHtml}
      <div class="shop-card-icon-container">
        <img src="${pkg.icon}" class="shop-card-icon-img" alt="pack icon">
      </div>
      <div class="shop-card-stars">${formatStars(pkg.stars + pkg.bonus)} <img src="Items/UI/star.png" class="inline-heart" alt="star"></div>
      ${bonusLine}
      <div class="shop-card-price">${displayPrice}</div>`;

    card.addEventListener('click', () => buyStarPackage(pkg, card));
    grid.appendChild(card);
  });

  container.appendChild(grid);
  modal.classList.remove('hidden');
}


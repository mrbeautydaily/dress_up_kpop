// ────────────────────────────────────────────────────────────
// YANDEX GAMES SDK
// ────────────────────────────────────────────────────────────

let ysdk       = null;
let _player    = null;
let _adShowing = false;
let _gameReadySent = false;

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

    const i18n    = ysdk.environment.i18n;
    const sdkLang = i18n && i18n.lang ? i18n.lang : '';
    const sdkTld  = i18n && i18n.tld  ? i18n.tld  : '';

    console.log('[i18n] SDK ready — lang:', sdkLang, '| tld:', sdkTld);

    // sdkLang отражает ?lang= из URL — он главный
    if (sdkLang) {
      lang = sdkLang === 'ru' ? 'ru' : 'en';
    } else {
      // lang не задан явно → используем домен как подсказку
      const ruTlds = ['ru', 'kz', 'by', 'ua', 'uz', 'az', 'am', 'ge', 'md', 'tj', 'tm'];
      if (ruTlds.includes(sdkTld)) lang = 'ru';
    }
    // если SDK ничего не дал — остаётся результат detectLangFromBrowser()

    console.log('[i18n] Language set to:', lang);

    // Получаем объект игрока для серверного сохранения прогресса (п. 1.13.3)
    try { _player = await ysdk.getPlayer({ scopes: false }); } catch (e) { console.warn('[Player] getPlayer error:', e); }

    // Пауза звука при сворачивании / смене вкладки (требование модерации Яндекс)
    const _audioPause = () => { if (_actx) _actx.suspend(); pauseBGM(); };
    const _audioResume = () => { if (_adShowing) return; if (soundOn) { if (_actx) _actx.resume(); resumeBGM(); } };

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
      if (pkg) addLikes(pkg.likes + pkg.bonus);
      // Консумируем все покупки, даже неизвестные (п. 1.13.1)
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
        showToast(lang === 'ru' ? '⚠️ Продукт не настроен в консоли' : '⚠️ Product not set up in console');
        return;
      }
      const purchase = await _payments.purchase({ id: pkg.id });
      grantStarPackage(pkg);
      await _payments.consumePurchase(purchase.purchaseToken);
    } else {
      // Dev-режим без SDK — симулируем покупку
      grantStarPackage(pkg);
    }
    $('shop-modal').classList.add('hidden');
  } catch (e) {
    console.error('[Payments] purchase error:', e);
    if (e && e.code !== 'UserCanceled') {
      showToast(lang === 'ru' ? 'Ошибка покупки' : 'Purchase failed');
    }
  } finally {
    cardEl.classList.remove('loading');
  }
}

function grantStarPackage(pkg) {
  const total = pkg.likes + pkg.bonus;
  addLikes(total);
  buildItemsGrid(activeCategory);
  spawnSparkles(14);
  sfxUnlock();
  const msg = pkg.bonus > 0
    ? (lang === 'ru' ? `+${formatLikes(pkg.likes)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart"> и +${formatLikes(pkg.bonus)} бонус!` : `+${formatLikes(pkg.likes)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart"> + ${formatLikes(pkg.bonus)} bonus!`)
    : `+${formatLikes(pkg.likes)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart">`;
  showToast(msg);
}

function showShopModal() {
  const modal = $('shop-modal');
  const container = $('shop-packages');
  container.innerHTML = '';

  const titleEl = $('shop-title');
  const subtitleEl = $('shop-subtitle');
  if (titleEl) titleEl.textContent = lang === 'ru' ? 'Магазин лайков' : 'Like Shop';
  if (subtitleEl) subtitleEl.textContent = lang === 'ru' ? 'Набирай популярность и открывай новые вещи!' : 'Grow your popularity and unlock new items!';

  // ── Кнопка "1000 лайков за рекламу" (во всю ширину, сверху) ──
  const adCard = document.createElement('div');
  adCard.className = 'shop-ad-card';
  adCard.innerHTML = `
    <img src="Items/UI/shop_ad_tv.png" class="shop-ad-icon-img" alt="ad icon">
    <span class="shop-ad-text">
      <b>+1 000 <img src="Items/UI/heart.png" class="inline-heart" alt="heart"></b> — ${lang === 'ru' ? 'за просмотр рекламы' : 'watch an ad'}
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
            if (_rewarded) { addLikes(1000); spawnSparkles(8); showToast('+1 000 <img src="Items/UI/heart.png" class="inline-heart" alt="heart">'); }
          },
          onError: () => {
            _adShowing = false;
            adCard.classList.remove('loading');
            if (_actx && soundOn) _actx.resume(); resumeBGM();
            showToast(lang === 'ru' ? 'Реклама недоступна' : 'Ad unavailable');
          },
        },
      });
    } else {
      addLikes(1000); spawnSparkles(8); showToast('+1 000 <img src="Items/UI/heart.png" class="inline-heart" alt="heart"> (dev)');
      adCard.classList.remove('loading');
    }
  });
  container.appendChild(adCard);

  // ── Пакеты лайков (сетка 2×2) ──
  const grid = document.createElement('div');
  grid.className = 'shop-grid';

  STAR_PACKAGES.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'shop-card' + (pkg.popular ? ' popular' : '');

    const bonusLine = pkg.bonus > 0
      ? `<div class="shop-card-bonus">+${formatLikes(pkg.bonus)} ${lang === 'ru' ? 'бонус!' : 'bonus!'}</div>`
      : `<div class="shop-card-bonus"></div>`;

    const badgeHtml = pkg.popular
      ? `<div class="shop-card-badge">${lang === 'ru' ? '🔥 Хит' : '🔥 Popular'}</div>`
      : '';

    card.innerHTML = `
      ${badgeHtml}
      <img src="${pkg.icon}" class="shop-card-icon-img" alt="pack icon">
      <div class="shop-card-stars">${formatLikes(pkg.likes + pkg.bonus)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart"></div>
      ${bonusLine}
      <div class="shop-card-price">${(_catalog.find(c=>c.id===pkg.id)||{}).price||"—"}</div>`;

    card.addEventListener('click', () => buyStarPackage(pkg, card));
    grid.appendChild(card);
  });

  container.appendChild(grid);
  modal.classList.remove('hidden');
}


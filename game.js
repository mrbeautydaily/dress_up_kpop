/* ============================================================
   K-POP SCHOOL — game.js
   Bilingual (RU / EN), language auto-detected via Yandex SDK
   or browser navigator.language.
   ============================================================ */

'use strict';

// ────────────────────────────────────────────────────────────
// LOCALISATION
// ────────────────────────────────────────────────────────────

let lang = detectLangFromBrowser(); // set early; refined after SDK init
let scoreAutoScrollTimer = null;

function detectLangFromBrowser() {
  // 1. URL-параметр ?lang=ru — Яндекс Игры передают его в URL
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) return urlLang === 'ru' ? 'ru' : 'en';

  // 2. Язык браузера
  const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return nav.startsWith('ru') ? 'ru' : 'en';
}

function t(key) {
  return (T[lang] && T[lang][key] !== undefined ? T[lang][key] : T.en[key]) || key;
}

const T = {
  en: {
    // Loading
    loadingTitle:  'K-Pop Idol: Star Maker',
    loadingText:   'Preparing your K-Pop group debut...',
    // Header
    gameTitle:     '✨ K-Pop Star Maker ✨',
    btnRandom:     '🎲 Random',
    btnReset:      '🔄 Reset',
    btnSave:       '💾 Save',
    btnSaved:      '✅ Saved!',
    btnSchool:     '🌟 Career',
    btnSchoolOn:   '🌟 Career ON',
    btnRunway:     'Publish Post',
    // Panels
    categoryLabel: 'Category',
    itemsLabel:    'Items',
    catHair:       'Hair',
    catTops:       'Tops',
    catBottoms:    'Bottoms',
    catShoes:      'Shoes',
    catSocks:      'Socks',
    catAcc:        'Acc.',
    // Banner
    bannerDayLesson: '#{d}',
    // Score screen
    scoreResults:    '📍 {title}',
    scoreRequired:   'Outfit: {f}/{t} slots · Trend: {tags} ({m}/{r})',
    scoreRepeat:     'Same outfit? Fans noticed! 👀',
    scoreNaked:      'Forgot to get dressed? 😮',
    scoreFreePost:   'Free Style Day! Dress however you like! 💕',
    btnNextClass:    '➡ Next Post',
    btnSeeResults:   '🌟 Day Results!',
    // Summary
    summaryTitle:    'Post #{d} Complete!',
    summaryDayScore: 'New followers: +{s}',
    summaryRankLine: '{pts} followers',
    summaryNextRank: 'Next goal: {at}',
    summaryMaxRank:  '👑 1 MILLION! K-Pop Legends!',
    btnNewDay:       '➡ Next Post',
    btnExitSchool:   '🎨 Free Style Mode',
    // Ranks
    rankTrainee:     '🌱 Nugu (Rookies)',
    rankDebut:       '💖 Rising Stars',
    rankIdol:        '🌟 Chart Toppers',
    rankStar:        '👑 K-Pop Legends',
    // Outfit names (free mode)
    adj: ['Sparkly','Dreamy','Fierce','Sweet','Chic','Bold','Pastel','Glam','Iconic','Fresh'],
    noun:['Idol','Star','Diva','Queen','Vision','Dream','Look','Vibe','Moment','Era'],
  },
  ru: {
    // Loading
    loadingTitle:  'Путь к славе: K-Pop',
    loadingText:   'Готовим дебют твоей K-Pop группы...',
    // Header
    gameTitle:     '✨ K-Pop: Путь к славе ✨',
    btnRandom:     '🎲 Случайно',
    btnReset:      '🔄 Сброс',
    btnSave:       '💾 Сохранить',
    btnSaved:      '✅ Сохранено!',
    btnSchool:     '🌟 Карьера',
    btnSchoolOn:   '🌟 Карьера ВКЛ',
    btnRunway:     'Опубликовать',
    // Panels
    categoryLabel: 'Категория',
    itemsLabel:    'Вещи',
    catHair:       'Волосы',
    catTops:       'Топы',
    catBottoms:    'Низ',
    catShoes:      'Обувь',
    catSocks:      'Носки',
    catAcc:        'Акс.',
    // Banner
    bannerDayLesson: '#{d}',
    // Score screen
    scoreResults:    '📍 {title}',
    scoreRequired:   'Образ: {f}/{t} слотов · Тренд: {tags} ({m}/{r})',
    scoreRepeat:     'Тот же наряд? Фанаты заметили! 👀',
    scoreNaked:      'Забыла одеться? 😮',
    scoreFreePost:   'День свободного стиля! Одевайся как хочешь! 💕',
    btnNextClass:    '➡ Следующий пост',
    btnSeeResults:   '🌟 Итоги дня!',
    // Summary
    summaryTitle:    'Пост #{d} завершен!',
    summaryDayScore: 'Новые подписчики: +{s}',
    summaryRankLine: '{pts} подписчиков',
    summaryNextRank: 'Цель: {at}',
    summaryMaxRank:  '👑 1 МИЛЛИОН! Легенды K-Pop!',
    btnNewDay:       '➡ Следующий пост',
    btnExitSchool:   '🎨 Свободный стиль',
    // Ranks
    rankTrainee:     '🌱 Nugu (Новички)',
    rankDebut:       '💖 Восходящие звёзды',
    rankIdol:        '🌟 Лидеры чартов',
    rankStar:        '👑 K-Pop Легенды',
    // Outfit names (free mode)
    adj:  ['Сверкающий','Мечтательный','Дерзкий','Сладкий','Шикарный','Смелый','Пастельный','Гламурный','Культовый','Свежий'],
    noun: ['Идол','Звезда','Дива','Королева','Образ','Мечта','Лук','Вайб','Момент','Эпоха'],
  },
};

/// Template helper: t('key', {d:1, l:2})
function tf(key, vars) {
  let s = t(key);
  if (vars) Object.keys(vars).forEach(k => { s = s.replaceAll('{' + k + '}', vars[k]); });
  return s;
}

function formatFollowers(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function formatShortNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
  return String(n);
}

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
const STAR_PACKAGES = [
  { id: 'stars_30',  likes:  3000, bonus: 0,     icon: '❤️' },
  { id: 'stars_150', likes: 15000, bonus: 0,     icon: '💖' },
  { id: 'stars_300', likes: 30000, bonus: 3000,  icon: '💝', popular: true },
  { id: 'stars_600', likes: 60000, bonus: 10000, icon: '💕' },
];

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
    ? (lang === 'ru' ? `+${formatLikes(pkg.likes)} ❤️ и +${formatLikes(pkg.bonus)} бонус!` : `+${formatLikes(pkg.likes)} ❤️ + ${formatLikes(pkg.bonus)} bonus!`)
    : `+${formatLikes(pkg.likes)} ❤️`;
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
    <span class="shop-ad-icon">📺</span>
    <span class="shop-ad-text">
      <b>+1 000 ❤️</b> — ${lang === 'ru' ? 'за просмотр рекламы' : 'watch an ad'}
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
            if (_rewarded) { addLikes(1000); spawnSparkles(8); showToast('+1 000 ❤️'); }
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
      addLikes(1000); spawnSparkles(8); showToast('+1 000 ❤️ (dev)');
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
      <div class="shop-card-icon">${pkg.icon}</div>
      <div class="shop-card-stars">${formatLikes(pkg.likes + pkg.bonus)} ❤️</div>
      ${bonusLine}
      <div class="shop-card-price">${(_catalog.find(c=>c.id===pkg.id)||{}).price||"—"}</div>`;

    card.addEventListener('click', () => buyStarPackage(pkg, card));
    grid.appendChild(card);
  });

  container.appendChild(grid);
  modal.classList.remove('hidden');
}

// ────────────────────────────────────────────────────────────
// CLOTHES DATA
/// Each item: name (EN), name_ru (RU), tags, pos, src
// ────────────────────────────────────────────────────────────

const clothes = {

  // ── HAIR ──────────────────────────────────────────────────
  hair: [
    { id:'blunt_bob_pink_headband', name:'Pink Headband Bob', name_ru:'Каре с розовым ободком', src:'Items/Hair/blunt_bob_pink_headband.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','kpop'] },
    { id:'boxer_braids', name:'Boxer Braids', name_ru:'Боксерские косички', src:'Items/Hair/boxer_braids.png', pos:{left:0,top:0,width:100}, tags:['sporty','bold','kpop'] },
    { id:'double_space_buns_pastel_lavender', name:'Lavender Buns', name_ru:'Лавандовые пучки', src:'Items/Hair/double_space_buns_pastel_lavender.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','kpop'] },
    { id:'gothic_kpop_hair_1', name:'Gothic K-Pop I', name_ru:'Готический K-Pop I', src:'Items/Hair/gothic_kpop_hair_1.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold','kpop'] },
    { id:'gothic_kpop_hair_2', name:'Gothic K-Pop II', name_ru:'Готический K-Pop II', src:'Items/Hair/gothic_kpop_hair_2.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold','kpop'] },
    { id:'gothic_wolf_cut', name:'Gothic Wolf Cut', name_ru:'Готический вульф-кат', src:'Items/Hair/gothic_wolf_cut.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'wavy_side_braids', name:'Wavy Side Braids', name_ru:'Волнистые косички набок', src:'Items/Hair/wavy_side_braids.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'] },
    { id:'hair_with_butterfly_clips', name:'Butterfly Clips Hair', name_ru:'Заколки-бабочки', src:'Items/Hair/hair_with_butterfly_clips.png', pos:{left:0,top:0,width:100}, tags:['cute','kpop'] },
    { id:'idol_dark_highlights', name:'Dark Highlights Idol', name_ru:'Идол с мелированием', src:'Items/Hair/idol_dark_highlights.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'] },
    { id:'kpop_double_pigtails', name:'Double Pigtails', name_ru:'Два хвостика', src:'Items/Hair/kpop_double_pigtails.png', pos:{left:0,top:0,width:100}, tags:['cute','kpop'] },
    { id:'kpop_double_space_buns', name:'Double Space Buns', name_ru:'Двойные пучки', src:'Items/Hair/kpop_double_space_buns.png', pos:{left:0,top:0,width:100}, tags:['cute','kpop'] },
    { id:'kpop_classic_hair', name:'Classic K-Pop Hair', name_ru:'Классический K-Pop', src:'Items/Hair/kpop_classic_hair.png', pos:{left:0,top:0,width:100}, tags:['kpop','elegant'] },
    { id:'kpop_cloud_scrunchie', name:'Cloud Scrunchie Hair', name_ru:'Резинка-облако', src:'Items/Hair/kpop_cloud_scrunchie.png', pos:{left:0,top:0,width:100}, tags:['cute','kpop'] },
    { id:'chestnut_brown_waves', name:'Chestnut Brown Waves', name_ru:'Каштановые волны', src:'Items/Hair/chestnut_brown_waves.png', pos:{left:0,top:0,width:100}, tags:['casual','school'] },
    { id:'split_dye_hair_1', name:'Split Dye I', name_ru:'Двухцветное окрашивание I', src:'Items/Hair/split_dye_hair_1.png', pos:{left:0,top:0,width:100}, tags:['bold','kpop'] },
    { id:'split_dye_hair_2', name:'Split Dye II', name_ru:'Двухцветное окрашивание II', src:'Items/Hair/split_dye_hair_2.png', pos:{left:0,top:0,width:100}, tags:['bold','kpop'] },
    { id:'messy_high_bun_ginger', name:'Ginger Messy Bun', name_ru:'Рыжий небрежный пучок', src:'Items/Hair/messy_high_bun_ginger.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'] },
    { id:'pastel_pink_bob', name:'Pastel Pink Bob', name_ru:'Розовое каре', src:'Items/Hair/pastel_pink_bob.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel'] },
    { id:'ponytail_black_velvet_bow', name:'Velvet Bow Ponytail', name_ru:'Хвост с бархатным бантом', src:'Items/Hair/ponytail_black_velvet_bow.png', pos:{left:0,top:0,width:100}, tags:['elegant','formal','school'] },
    { id:'sleek_ponytail', name:'Sleek Ponytail', name_ru:'Гладкий хвост', src:'Items/Hair/sleek_ponytail.png', pos:{left:0,top:0,width:100}, tags:['elegant','formal','sporty'] },
    { id:'spiky_pixie_teal_blue', name:'Teal Spiky Pixie', name_ru:'Синий колючий пикси', src:'Items/Hair/spiky_pixie_teal_blue.png', pos:{left:0,top:0,width:100}, tags:['bold','kpop'] }
  ],

  // ── TOPS ─────────────────────────────────────────────────
  tops: [
    { id:'top_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'top_dress_new_1', name:'K-Pop Dress', name_ru:'K-Pop платье', src:'Items/Dress/dress_new_1.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute','pastel','formal','elegant'], sub:'dresses' },
    { id:'black_lace_crop_top', name:'Black Lace Crop Top', name_ru:'Черный кружевной кроп-топ', src:'Items/Shirt/black_lace_crop_top.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'blouses' },
    { id:'kpop_sequin_crop_top', name:'Sequin Crop Top', name_ru:'Кроп-топ с пайетками', src:'Items/Shirt/kpop_sequin_crop_top.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','pastel','cute'], sub:'blouses' },
    { id:'casual_hoodie', name:'Oversized Hoodie', name_ru:'Объемное худи', src:'Items/Shirt/casual_hoodie.png', pos:{left:0,top:0,width:100}, tags:['casual','sporty'], sub:'blouses' },
    { id:'pink_y2k_cardigan', name:'Pink Y2K Cardigan', name_ru:'Розовый Y2K кардиган', src:'Items/Shirt/pink_y2k_cardigan.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','kpop'], sub:'blouses' },
    { id:'gothic_mini_dress', name:'Gothic Mini Dress', name_ru:'Готическое mini-платье', src:'Items/Dress/gothic_mini_dress.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'dresses' },
    { id:'navy_sailor_dress', name:'Navy Sailor Dress', name_ru:'Синее матросское платье', src:'Items/Dress/navy_sailor_dress.png', pos:{left:0,top:0,width:100}, tags:['school','cute','formal'], sub:'dresses' },
    { id:'pink_sequin_dress', name:'Pink Sequin Dress', name_ru:'Розовое блестящее платье', src:'Items/Dress/pink_sequin_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','elegant','pastel','cute'], sub:'dresses' },
    { id:'school_uniform_dress', name:'School Uniform Dress', name_ru:'Школьная форма', src:'Items/Dress/school_uniform_dress.png', pos:{left:0,top:0,width:100}, tags:['school','formal','casual'], sub:'blouses' },
    { id:'silver_bodycon_dress', name:'Silver Bodycon Dress', name_ru:'Серебристое облегающее платье', src:'Items/Dress/silver_bodycon_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','elegant'], sub:'dresses' },
    
    // 16 новых топов
    { id:'athletic_track_jacket', name:'Athletic Track Jacket', name_ru:'Спортивная ветровка', src:'Items/Shirt/athletic_track_jacket.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'blouses' },
    { id:'beige_cable_sweater', name:'Beige Cable Sweater', name_ru:'Бежевый вязаный свитер', src:'Items/Shirt/beige_cable_sweater.png', pos:{left:0,top:0,width:100}, tags:['casual','pastel'], sub:'blouses' },
    { id:'crimson_corset', name:'Crimson Corset', name_ru:'Малиновый корсет', src:'Items/Shirt/crimson_corset.png', pos:{left:0,top:0,width:100}, tags:['bold','elegant','kpop'], sub:'blouses' },
    { id:'cropped_black_leather_jacket', name:'Cropped Leather Jacket', name_ru:'Черная кожаная косуха', src:'Items/Shirt/cropped_black_leather_jacket.png', pos:{left:0,top:0,width:100}, tags:['bold','dark','gothic'], sub:'blouses' },
    { id:'cropped_cardigan', name:'Cropped Cardigan', name_ru:'Укороченный кардиган', src:'Items/Shirt/cropped_cardigan.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel'], sub:'blouses' },
    { id:'futuristic_crop_top', name:'Futuristic Crop Top', name_ru:'Футуристичный кроп-топ', src:'Items/Shirt/futuristic_crop_top.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'], sub:'blouses' },
    { id:'gothic_velvet_top_1', name:'Gothic Velvet Top I', name_ru:'Готический бархатный топ I', src:'Items/Shirt/gothic_velvet_top_1.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'blouses' },
    { id:'gothic_velvet_top_2', name:'Gothic Velvet Top II', name_ru:'Готический бархатный топ II', src:'Items/Shirt/gothic_velvet_top_2.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'blouses' },
    { id:'grunge_knit_sweater', name:'Grunge Knit Sweater', name_ru:'Гранжевый рваный свитер', src:'Items/Shirt/grunge_knit_sweater.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','casual'], sub:'blouses' },
    { id:'kpop_stage_top', name:'K-Pop Stage Top', name_ru:'Сценический кроп-топ', src:'Items/Shirt/kpop_stage_top.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','cute'], sub:'blouses' },
    { id:'kpop_top_set_lavender', name:'Lavender Stage Top', name_ru:'Лавандовый топ-сет', src:'Items/Shirt/kpop_top_set_lavender.png', pos:{left:0,top:0,width:100}, tags:['kpop','pastel','cute'], sub:'blouses' },
    { id:'lavender_sweatshirt', name:'Lavender Sweatshirt', name_ru:'Лавандовый свитшот', src:'Items/Shirt/lavender_sweatshirt.png', pos:{left:0,top:0,width:100}, tags:['casual','pastel'], sub:'blouses' },
    { id:'layered_cherry_top', name:'Cherry Print Top', name_ru:'Топ с вишневым принтом', src:'Items/Shirt/layered_cherry_top.png', pos:{left:0,top:0,width:100}, tags:['cute','casual'], sub:'blouses' },
    { id:'navy_sweater_vest', name:'Navy Sweater Vest', name_ru:'Школьный вязаный жилет', src:'Items/Shirt/navy_sweater_vest.png', pos:{left:0,top:0,width:100}, tags:['school','formal','casual'], sub:'blouses' },
    { id:'puffer_vest_tshirt', name:'Puffer Vest Over T-Shirt', name_ru:'Дутый жилет с футболкой', src:'Items/Shirt/puffer_vest_tshirt.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'blouses' },
    { id:'white_blouse_black_bow', name:'White Blouse with Bow', name_ru:'Блузка с черным бантом', src:'Items/Shirt/white_blouse_black_bow.png', pos:{left:0,top:0,width:100}, tags:['school','formal','elegant'], sub:'blouses' },

    // 13 новых платьев
    { id:'beige_cable_knit_dress', name:'Beige Cable-Knit Dress', name_ru:'Бежевое вязаное платье', src:'Items/Dress/beige_cable_knit_dress.png', pos:{left:0,top:0,width:100}, tags:['casual','pastel','elegant'], sub:'dresses' },
    { id:'gothic_lolita_dress_1', name:'Gothic Lolita Dress I', name_ru:'Платье Готическая Лолита I', src:'Items/Dress/gothic_lolita_dress_1.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','cute'], sub:'dresses' },
    { id:'gothic_lolita_dress_2', name:'Gothic Lolita Dress II', name_ru:'Платье Готическая Лолита II', src:'Items/Dress/gothic_lolita_dress_2.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','cute'], sub:'dresses' },
    { id:'gothic_stage_dress', name:'Gothic Stage Dress', name_ru:'Сценическое готик-платье', src:'Items/Dress/gothic_stage_dress.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold','kpop'], sub:'dresses' },
    { id:'kpop_stage_dress', name:'K-Pop Stage Dress', name_ru:'Яркое сценическое платье', src:'Items/Dress/kpop_stage_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','cute'], sub:'dresses' },
    { id:'tank_dress_with_jacket', name:'Tank Dress with Jacket', name_ru:'Платье с курткой', src:'Items/Dress/tank_dress_with_jacket.png', pos:{left:0,top:0,width:100}, tags:['casual','sporty'], sub:'dresses' },
    { id:'simple_mini_dress', name:'Simple Mini Dress', name_ru:'Простое мини-платье', src:'Items/Dress/simple_mini_dress.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'dresses' },
    { id:'navy_chiffon_star_dress', name:'Navy Chiffon Star Dress', name_ru:'Шифоновое платье со звездами', src:'Items/Dress/navy_chiffon_star_dress.png', pos:{left:0,top:0,width:100}, tags:['elegant','pastel','kpop'], sub:'dresses' },
    { id:'pinafore_dress_blouse', name:'Pinafore School Dress', name_ru:'Сарафан поверх блузки', src:'Items/Dress/pinafore_dress_blouse.png', pos:{left:0,top:0,width:100}, tags:['school','formal','cute'], sub:'dresses' },
    { id:'polo_mini_dress', name:'Polo Mini Dress', name_ru:'Спортивное платье-поло', src:'Items/Dress/polo_mini_dress.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'dresses' },
    { id:'red_tartan_plaid_dress', name:'Red Tartan Plaid Dress', name_ru:'Платье в красную клетку', src:'Items/Dress/red_tartan_plaid_dress.png', pos:{left:0,top:0,width:100}, tags:['school','casual','cute'], sub:'dresses' },
    { id:'ribbed_knit_pastel_dress', name:'Ribbed Knit Pastel Dress', name_ru:'Трикотажное нежное платье', src:'Items/Dress/ribbed_knit_pastel_dress.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','casual'], sub:'dresses' },
    { id:'sleeveless_sequin_dress', name:'Sleeveless Sequin Dress', name_ru:'Серебристое платье без рукавов', src:'Items/Dress/sleeveless_sequin_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','elegant','bold'], sub:'dresses' }
  ],

  // ── BOTTOMS ───────────────────────────────────────────────
  bottoms: [
    { id:'bot_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'athletic_joggers', name:'Athletic Joggers', name_ru:'Спортивные джоггеры', src:'Items/Legs/Jeans/athletic_joggers.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'pants' },
    { id:'gothic_shorts', name:'Gothic Leather Shorts', name_ru:'Готические шорты', src:'Items/Legs/Jeans/gothic_shorts.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'pants' },
    { id:'y2k_cargo_pants', name:'Y2K Cargo Pants', name_ru:'Широкие брюки карго', src:'Items/Legs/Jeans/y2k_cargo_pants.png', pos:{left:0,top:0,width:100}, tags:['casual','bold','sporty'], sub:'pants' },
    { id:'kpop_ruffled_skirt', name:'Ruffled Mini Skirt', name_ru:'Мини-юбка с оборками', src:'Items/Legs/Skirt/kpop_ruffled_skirt.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute','pastel'], sub:'skirts' },
    { id:'kpop_plaid_skirt', name:'Plaid Pleated Skirt', name_ru:'Плиссированная юбка в клетку', src:'Items/Legs/Skirt/kpop_plaid_skirt.png', pos:{left:0,top:0,width:100}, tags:['school','cute','formal'], sub:'skirts' },
    { id:'kpop_style_skirt_1', name:'K-Pop Skirt I', name_ru:'K-Pop юбка I', src:'Items/Legs/Skirt/kpop_style_skirt_1.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute'], sub:'skirts' },
    { id:'kpop_style_skirt_2', name:'K-Pop Skirt II', name_ru:'K-Pop юбка II', src:'Items/Legs/Skirt/kpop_style_skirt_2.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'], sub:'skirts' },
    { id:'kpop_style_skirt_3', name:'K-Pop Skirt III', name_ru:'K-Pop юбка III', src:'Items/Legs/Skirt/kpop_style_skirt_3.png', pos:{left:0,top:0,width:100}, tags:['kpop','elegant'], sub:'skirts' },
    { id:'pleated_mini_skirt_classic', name:'Classic Pleated Skirt', name_ru:'Классическая плиссированная юбка', src:'Items/Legs/Skirt/pleated_mini_skirt_classic.png', pos:{left:0,top:0,width:100}, tags:['school','casual'], sub:'skirts' },
    
    // 4 новых брюк/шорт
    { id:'classic_pants', name:'Classic Trousers', name_ru:'Классические брюки', src:'Items/Legs/Jeans/classic_pants.png', pos:{left:0,top:0,width:100}, tags:['formal','school','casual'], sub:'pants' },
    { id:'running_shorts', name:'Running Shorts', name_ru:'Спортивные шорты', src:'Items/Legs/Jeans/running_shorts.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'pants' },
    { id:'tailored_shorts', name:'Tailored Shorts', name_ru:'Строгие шорты', src:'Items/Legs/Jeans/tailored_shorts.png', pos:{left:0,top:0,width:100}, tags:['formal','school'], sub:'pants' },
    { id:'stylish_cargo_pants', name:'Stylish Cargo Pants', name_ru:'Стильные брюки карго', src:'Items/Legs/Jeans/stylish_cargo_pants.png', pos:{left:0,top:0,width:100}, tags:['casual','bold','sporty'], sub:'pants' },

    // 6 новых юбок
    { id:'mini_skirt_basic_1', name:'Basic Mini Skirt I', name_ru:'Базовая мини-юбка I', src:'Items/Legs/Skirt/mini_skirt_basic_1.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'skirts' },
    { id:'mini_skirt_basic_2', name:'Basic Mini Skirt II', name_ru:'Базовая мини-юбка II', src:'Items/Legs/Skirt/mini_skirt_basic_2.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'skirts' },
    { id:'navy_chiffon_skirt', name:'Navy Chiffon Skirt', name_ru:'Синяя шифоновая юбка', src:'Items/Legs/Skirt/navy_chiffon_skirt.png', pos:{left:0,top:0,width:100}, tags:['elegant','cute','pastel'], sub:'skirts' },
    { id:'pleated_mini_skirt_new', name:'Pleated Mini Skirt', name_ru:'Плиссированная мини-юбка', src:'Items/Legs/Skirt/pleated_mini_skirt_new.png', pos:{left:0,top:0,width:100}, tags:['school','casual','cute'], sub:'skirts' },
    { id:'silver_metallic_skirt', name:'Silver Metallic Skirt', name_ru:'Серебристая блестящая юбка', src:'Items/Legs/Skirt/silver_metallic_skirt.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'], sub:'skirts' },
    { id:'y2k_denim_mini_skirt', name:'Y2K Denim Mini Skirt', name_ru:'Джинсовая мини-юбка Y2K', src:'Items/Legs/Skirt/y2k_denim_mini_skirt.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'skirts' }
  ],

  // ── SHOES ─────────────────────────────────────────────────
  shoes: [
    { id:'shoe_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'gothic_combat_boots', name:'Gothic Combat Boots', name_ru:'Готические армейские ботинки', src:'Items/Shoes/gothic_combat_boots.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'classic_loafers', name:'Classic Loafers', name_ru:'Классические лоферы', src:'Items/Shoes/classic_loafers.png', pos:{left:0,top:0,width:100}, tags:['school','formal','elegant'] },
    { id:'pink_hightop_sneakers', name:'Pink High-Top Sneakers', name_ru:'Розовые высокие кеды', src:'Items/Shoes/pink_hightop_sneakers.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','sporty'] },
    { id:'sporty_sneakers', name:'Sporty Sneakers', name_ru:'Спортивные кроссовки', src:'Items/Shoes/sporty_sneakers.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'] },
    { id:'white_high_heels', name:'White High Heels', name_ru:'Белые лаковые туфли', src:'Items/Shoes/white_high_heels.png', pos:{left:0,top:0,width:100}, tags:['elegant','formal','kpop'] },
    
    // 15 новых пар обуви
    { id:'black_sneakers', name:'Black Sneakers', name_ru:'Черные кеды', src:'Items/Shoes/black_sneakers.png', pos:{left:0,top:0,width:100}, tags:['casual','sporty'] },
    { id:'classic_boots', name:'Classic Boots', name_ru:'Осенние ботинки', src:'Items/Shoes/classic_boots.png', pos:{left:0,top:0,width:100}, tags:['casual','school'] },
    { id:'brown_oxford_shoes', name:'Brown Oxford Shoes', name_ru:'Коричневые оксфорды', src:'Items/Shoes/brown_oxford_shoes.png', pos:{left:0,top:0,width:100}, tags:['school','formal','elegant'] },
    { id:'futuristic_boots', name:'Futuristic Boots', name_ru:'Футуристичные сапоги', src:'Items/Shoes/futuristic_boots.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'] },
    { id:'gothic_high_boots', name:'Gothic High Boots', name_ru:'Высокие готические сапоги', src:'Items/Shoes/gothic_high_boots.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'gothic_combat_boots_2', name:'Gothic Combat Boots II', name_ru:'Готические ботинки II', src:'Items/Shoes/gothic_combat_boots_2.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'gothic_creeper_shoes', name:'Gothic Creeper Shoes', name_ru:'Готические криперы', src:'Items/Shoes/gothic_creeper_shoes.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','casual'] },
    { id:'glam_high_heels', name:'Glam High Heels', name_ru:'Элегантные туфли на шпильке', src:'Items/Shoes/glam_high_heels.png', pos:{left:0,top:0,width:100}, tags:['elegant','formal','kpop'] },
    { id:'loafers_new', name:'Classic Black Loafers', name_ru:'Черные лоферы', src:'Items/Shoes/loafers_new.png', pos:{left:0,top:0,width:100}, tags:['school','formal'] },
    { id:'mary_jane_shoes', name:'Mary Jane Shoes', name_ru:'Туфли Мэри Джейн', src:'Items/Shoes/mary_jane_shoes.png', pos:{left:0,top:0,width:100}, tags:['school','cute','formal'] },
    { id:'pink_mary_jane_shoes', name:'Pink Mary Jane Shoes', name_ru:'Розовые туфли Мэри Джейн', src:'Items/Shoes/pink_mary_jane_shoes.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel'] },
    { id:'silver_metallic_boots', name:'Silver Metallic Boots', name_ru:'Серебристые сапоги', src:'Items/Shoes/silver_metallic_boots.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','elegant'] },
    { id:'sneakers_basic', name:'Basic Sneakers', name_ru:'Базовые кроссовки', src:'Items/Shoes/sneakers_basic.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'] },
    { id:'white_red_sneakers', name:'White & Red Sneakers', name_ru:'Бело-красные кроссовки', src:'Items/Shoes/white_red_sneakers.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual','kpop'] }
  ],

  // ── ACCESSORIES ───────────────────────────────────────────
  socks: [
    { id:'sock_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'gothic_fishnet_stockings', name:'Fishnet Stockings', name_ru:'Колготки в сеточку', src:'Items/Socks/gothic_fishnet_stockings.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'white_frilly_socks', name:'Frilly Knee-High Socks', name_ru:'Гольфы с рюшами', src:'Items/Socks/white_frilly_socks.png', pos:{left:0,top:0,width:100}, tags:['cute','school','pastel'] },
    { id:'y2k_overknee_socks', name:'Y2K Over-Knee Socks', name_ru:'Гольфы выше колена Y2K', src:'Items/Socks/y2k_overknee_socks.png', pos:{left:0,top:0,width:100}, tags:['casual','cute','school'] },
    
    // 5 новых носков
    { id:'gothic_thigh_high_stockings', name:'Gothic Thigh-High Stockings', name_ru:'Готические чулки', src:'Items/Socks/gothic_thigh_high_stockings.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'kpop_patterned_stockings', name:'K-Pop Patterned Stockings', name_ru:'K-Pop колготки', src:'Items/Socks/kpop_patterned_stockings.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute','bold'] },
    { id:'casual_white_socks', name:'Casual White Socks', name_ru:'Белые носки', src:'Items/Socks/casual_white_socks.png', pos:{left:0,top:0,width:100}, tags:['casual','school'] },
    { id:'stage_glitter_tights', name:'Stage Glitter Tights', name_ru:'Блестящие колготки', src:'Items/Socks/stage_glitter_tights.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','elegant'] },
    { id:'striped_sporty_socks', name:'Striped Sporty Socks', name_ru:'Спортивные носки в полоску', src:'Items/Socks/striped_sporty_socks.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'] },
    
    // Новейшие гольфы
    { id:'white_knee_high_socks_classic', name:'Classic White Knee-High Socks', name_ru:'Классические белые гольфы', src:'Items/Socks/white_knee_high_socks_classic.png', pos:{left:0,top:0,width:100}, tags:['school','formal','cute'] }
  ],

  accessories: [
    { id:'acc_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'gothic_cross_choker', name:'Gothic Cross Choker', name_ru:'Готический чокер с крестом', src:'Items/Accessories/gothic_cross_choker.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'accessories_headphones', name:'Idol Headphones', name_ru:'Наушники идола', src:'Items/Accessories/accessories_headphones.png', pos:{left:0,top:0,width:100}, tags:['kpop','casual','sporty'] },
    
    // 3 новых аксессуара
    { id:'cyber_goggles', name:'Cyber Goggles', name_ru:'Кибер-очки', src:'Items/Accessories/cyber_goggles.png', pos:{left:0,top:0,width:100}, tags:['bold','kpop'] },
    { id:'headphones_on_head', name:'Stylish Headphones', name_ru:'Стильные наушники', src:'Items/Accessories/headphones_on_head.png', pos:{left:0,top:0,width:100}, tags:['kpop','casual','sporty'] },
    { id:'pink_heart_bag', name:'Pink Heart Bag', name_ru:'Розовая сумка-сердце', src:'Items/Accessories/pink_heart_bag.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','kpop'] }
  ],
};

// ────────────────────────────────────────────────────────────
// PROGRESSION — ITEMS & COSTS
// ────────────────────────────────────────────────────────────

const FREE_ITEMS = new Set([
  'blunt_bob_pink_headband',
  'wavy_side_braids',
  'kpop_double_pigtails',
  'chestnut_brown_waves',
  'messy_high_bun_ginger',
  'sleek_ponytail',
  'top_none', 'top_dress_new_1',
  'bot_none',
  'shoe_none',
  'sock_none',
  'acc_none',
  
  // Ранее добавленные бесплатные вещи
  'kpop_sequin_crop_top',
  'casual_hoodie',
  'navy_sailor_dress',
  'school_uniform_dress',
  'athletic_joggers',
  'kpop_plaid_skirt',
  'pleated_mini_skirt_classic',
  'classic_loafers',
  'sporty_sneakers',
  'white_frilly_socks',
  'y2k_overknee_socks',
  'accessories_headphones',

  // Новые бесплатные вещи из 54 ассетов
  'athletic_track_jacket',
  'beige_cable_sweater',
  'cropped_cardigan',
  'lavender_sweatshirt',
  'layered_cherry_top',
  'navy_sweater_vest',
  'puffer_vest_tshirt',
  'white_blouse_black_bow',
  'tank_dress_with_jacket',
  'simple_mini_dress',
  'pinafore_dress_blouse',
  'polo_mini_dress',
  'red_tartan_plaid_dress',
  'classic_pants',
  'running_shorts',
  'tailored_shorts',
  'mini_skirt_basic_1',
  'mini_skirt_basic_2',
  'pleated_mini_skirt_new',
  'y2k_denim_mini_skirt',
  'black_sneakers',
  'classic_boots',
  'brown_oxford_shoes',
  'loafers_new',
  'mary_jane_shoes',
  'sneakers_basic',
  'white_red_sneakers',
  
  // Новейшие бесплатные вещи (носки и аксессуары)
  'casual_white_socks',
  'striped_sporty_socks',
  'headphones_on_head',
  'white_knee_high_socks_classic'
]);

const ITEM_COSTS = {
  'boxer_braids': 30,
  'double_space_buns_pastel_lavender': 35,
  'gothic_kpop_hair_1': 40,
  'gothic_kpop_hair_2': 40,
  'gothic_wolf_cut': 35,
  'hair_with_butterfly_clips': 25,
  'idol_dark_highlights': 30,
  'kpop_double_space_buns': 30,
  'kpop_classic_hair': 40,
  'kpop_cloud_scrunchie': 25,
  'split_dye_hair_1': 45,
  'split_dye_hair_2': 45,
  'pastel_pink_bob': 20,
  'ponytail_black_velvet_bow': 30,
  'spiky_pixie_teal_blue': 30,
  
  // Ранее добавленные платные вещи
  'black_lace_crop_top': 25,
  'pink_y2k_cardigan': 30,
  'gothic_mini_dress': 40,
  'pink_sequin_dress': 35,
  'silver_bodycon_dress': 45,
  'gothic_shorts': 30,
  'y2k_cargo_pants': 35,
  'kpop_ruffled_skirt': 30,
  'kpop_style_skirt_1': 25,
  'kpop_style_skirt_2': 25,
  'kpop_style_skirt_3': 25,
  'gothic_combat_boots': 30,
  'pink_hightop_sneakers': 20,
  'white_high_heels': 35,
  'gothic_fishnet_stockings': 20,
  'gothic_cross_choker': 15,

  // Новые платные вещи из 54 ассетов
  'crimson_corset': 30,
  'cropped_black_leather_jacket': 35,
  'futuristic_crop_top': 25,
  'gothic_velvet_top_1': 30,
  'gothic_velvet_top_2': 30,
  'grunge_knit_sweater': 25,
  'kpop_stage_top': 30,
  'kpop_top_set_lavender': 30,
  'beige_cable_knit_dress': 35,
  'gothic_lolita_dress_1': 45,
  'gothic_lolita_dress_2': 45,
  'gothic_stage_dress': 50,
  'kpop_stage_dress': 40,
  'navy_chiffon_star_dress': 35,
  'ribbed_knit_pastel_dress': 30,
  'sleeveless_sequin_dress': 40,
  'stylish_cargo_pants': 30,
  'navy_chiffon_skirt': 25,
  'silver_metallic_skirt': 30,
  'futuristic_boots': 35,
  'gothic_high_boots': 40,
  'gothic_combat_boots_2': 30,
  'gothic_creeper_shoes': 25,
  'glam_high_heels': 35,
  'pink_mary_jane_shoes': 20,
  'silver_metallic_boots': 35,
  
  // Новейшие платные вещи
  'gothic_thigh_high_stockings': 20,
  'kpop_patterned_stockings': 25,
  'stage_glitter_tights': 30,
  'cyber_goggles': 20,
  'pink_heart_bag': 25
};

// Вещи за рекламу (можно также купить за звёзды)
const AD_ITEMS = new Set([]);

// Эксклюзивная вещь только за отзыв
const REVIEW_ITEM = null; // Black Mesh Cocktail

// ────────────────────────────────────────────────────────────
// PROGRESSION — SAVE / LOAD
// ────────────────────────────────────────────────────────────

const PROG_KEY = 'kpop_progress_v1';

let prog = {
  likes: 12000, likesEarned: 12000,
  unlocked: [],
  achievements: {},
  loginStreak: 0, lastLoginDate: '',
  dailyTaskId: '', dailyTaskDone: false, dailyTaskDate: '',
  totalLessons: 0, highScore: 0,
  runwayCount: 0,
  perfectCount: 0,
  dailyTasksCompleted: 0,
};

async function loadProgress() {
  // Сначала читаем локальный кэш
  try { const s = localStorage.getItem(PROG_KEY); if (s) prog = { ...prog, ...JSON.parse(s) }; } catch(e) {}
  // Затем перезаписываем серверными данными (п. 1.13.3)
  if (_player) {
    try {
      const data = await _player.getData(['prog']);
      if (data && data.prog) {
        prog = { ...prog, ...data.prog };
        localStorage.setItem(PROG_KEY, JSON.stringify(prog));
      }
    } catch(e) { console.warn('[Player] getData error:', e); }
  }
  // Миграция: если у игрока старые сохранения со звёздами, переводим их в лайки (1 звезда = 100 лайков)
  if (prog.likes === undefined) {
    if (prog.stars !== undefined) {
      prog.likes = prog.stars * 100;
      prog.likesEarned = (prog.starsEarned || prog.stars) * 100;
    } else {
      prog.likes = 12000;
      prog.likesEarned = 12000;
    }
  }
}
function saveProgress() {
  try { localStorage.setItem(PROG_KEY, JSON.stringify(prog)); } catch(e) {}
  if (_player) {
    _player.setData({ prog }, true).catch(e => console.warn('[Player] setData error:', e));
  }
}

function isUnlocked(itemId) {
  if (AD_ITEMS.has(itemId) || itemId === REVIEW_ITEM) {
    return prog.unlocked.includes(itemId);
  }
  return FREE_ITEMS.has(itemId) || prog.unlocked.includes(itemId);
}
function itemCost(itemId) { return ITEM_COSTS[itemId] ?? 0; }
function itemLikesCost(itemId) { return (ITEM_COSTS[itemId] ?? 0) * 100; }

function formatLikes(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// ────────────────────────────────────────────────────────────
// PROGRESSION — LIKES
// ────────────────────────────────────────────────────────────

function addLikes(n) {
  prog.likes = (prog.likes || 0) + n;
  prog.likesEarned = (prog.likesEarned || 0) + n;
  saveProgress();
  updateLikesDisplay();
}


function updateLikesDisplay() {
  const el = $('stars-count');
  if (el) el.textContent = formatLikes(prog.likes);
}

function updateFollowersDisplay() {
  const el = $('followers-count');
  if (el) el.textContent = formatFollowers(school.totalFollowers);
}

// ────────────────────────────────────────────────────────────
// PROGRESSION — UNLOCK / BUY
// ────────────────────────────────────────────────────────────

let _buyPending = null;

function tryEquipOrBuy(category, itemId) {
  if (isUnlocked(itemId)) { equipItem(category, itemId); hideBuyBar(); return; }

  // Ad-unlock items
  if (AD_ITEMS.has(itemId)) {
    _buyPending = itemId;
    showBuyBar(category, itemId, 0);
    return;
  }

  // Review-exclusive item
  if (itemId === REVIEW_ITEM) {
    _buyPending = itemId;
    showBuyBar(category, itemId, 0);
    return;
  }

  const cost = getDailyDealLikesCost(itemId);
  _buyPending = itemId;
  showBuyBar(category, itemId, cost);
}

function showBuyBar(category, itemId, cost) {
  let bar = $('buy-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'buy-bar';
    $('items-panel').appendChild(bar);
  }
  const item = findItem(category, itemId);
  const isDeal = itemId === getDailyDealId();
  const origCost = itemLikesCost(itemId);
  const isAd = AD_ITEMS.has(itemId);
  const isReview = itemId === REVIEW_ITEM;

  bar.className = 'buy-bar';

  if (isAd) {
    bar.innerHTML = `
      <div class="buy-bar-name">📺 ${iName(item)}</div>
      <div class="buy-bar-ad-hint">${lang === 'ru' ? 'Смотри рекламу — получи вещь бесплатно!' : 'Watch an ad — get this item for free!'}</div>
      <div class="buy-bar-row">
        <button class="buy-bar-btn buy-confirm buy-ad-btn" id="buy-bar-yes">
          ${lang === 'ru' ? '📺 Смотреть рекламу' : '📺 Watch Ad'}
        </button>
        <button class="buy-bar-btn buy-cancel" id="buy-bar-no">✕</button>
      </div>`;
    bar.classList.remove('hidden');
    document.getElementById('buy-bar-yes').onclick = e => {
      e.stopPropagation(); showAdForItem(category, itemId);
    };
  } else if (isReview) {
    bar.innerHTML = `
      <div class="buy-bar-name">✍️ ${iName(item)}</div>
      <div class="buy-bar-ad-hint">${lang === 'ru' ? 'Эксклюзив! Оставь отзыв — получи вещь!' : 'Exclusive! Leave a review — get this item!'}</div>
      <div class="buy-bar-row">
        <button class="buy-bar-btn buy-confirm buy-review-btn" id="buy-bar-yes">
          ${lang === 'ru' ? '✍️ Оставить отзыв' : '✍️ Leave Review'}
        </button>
        <button class="buy-bar-btn buy-cancel" id="buy-bar-no">✕</button>
      </div>`;
    bar.classList.remove('hidden');
    document.getElementById('buy-bar-yes').onclick = e => {
      e.stopPropagation(); showReviewForItem(category, itemId);
    };
  } else {
    const canBuy = prog.likes >= cost;
    const shopHint = !canBuy
      ? `<button class="buy-bar-gem-hint" id="buy-bar-shop">
           💖 ${lang === 'ru' ? 'Купить лайки' : 'Buy Likes'}
         </button>`
      : '';
    bar.innerHTML = `
      <div class="buy-bar-name">${iName(item)}${isDeal ? ' 🔥' : ''}</div>
      ${isDeal ? `<div class="buy-bar-deal">${formatLikes(origCost)} ❤️ → <b>${formatLikes(cost)} ❤️</b></div>` : ''}
      <div class="buy-bar-row">
        <button class="buy-bar-btn buy-confirm${canBuy ? '' : ' cant-buy'}" id="buy-bar-yes">
          ${canBuy ? (lang === 'ru' ? `Купить ${formatLikes(cost)} ❤️` : `Buy ${formatLikes(cost)} ❤️`) : (lang === 'ru' ? `Нужно ${formatLikes(cost)} ❤️` : `Need ${formatLikes(cost)} ❤️`)}
        </button>
        <button class="buy-bar-btn buy-cancel" id="buy-bar-no">✕</button>
      </div>
      ${shopHint}`;
    bar.classList.remove('hidden');
    document.getElementById('buy-bar-yes').onclick = e => {
      e.stopPropagation();
      if (!canBuy) return;
      _buyPending = null; hideBuyBar();
      prog.likes -= cost;
      prog.unlocked.push(itemId);
      saveProgress(); updateLikesDisplay();
      equipItem(category, itemId);
      buildItemsGrid(activeCategory);
      spawnSparkles(8);
      sfxUnlock();
      checkAchievements();
    };
    if (!canBuy && document.getElementById('buy-bar-shop')) {
      document.getElementById('buy-bar-shop').onclick = e => {
        e.stopPropagation(); _buyPending = null; hideBuyBar(); showShopModal();
      };
    }
  }

  document.getElementById('buy-bar-no').onclick = e => {
    e.stopPropagation(); _buyPending = null; hideBuyBar();
  };
}

function hideBuyBar() {
  const bar = $('buy-bar');
  if (bar) bar.classList.add('hidden');
}

// ────────────────────────────────────────────────────────────
// CONTEXT HINTS  (floating tooltips pointing to UI buttons)
// ────────────────────────────────────────────────────────────

let _ctxHintEl    = null;
let _ctxHintTimer = null;
let _runwayHintCooldown = false;

// Подсказки показываются только один раз за всё время (хранится в localStorage)
const HINT_KEY = 'kpop_hints_v1';
function _loadHintFlags() {
  try { return JSON.parse(localStorage.getItem(HINT_KEY) || '{}'); } catch { return {}; }
}
function _hintShown(name) { return !!_loadHintFlags()[name]; }
function _markHintShown(name) {
  const flags = _loadHintFlags();
  flags[name] = true;
  localStorage.setItem(HINT_KEY, JSON.stringify(flags));
}

function showCtxHint(targetId, text, duration) {
  duration = duration || 4200;
  hideCtxHint();

  const targetEl = $(targetId);
  if (!targetEl || targetEl.classList.contains('hidden')) return;

  const hint = document.createElement('div');
  hint.className = 'ctx-hint';
  hint.innerHTML = text;
  document.body.appendChild(hint);
  _ctxHintEl = hint;

  // Position below the target button
  const rect   = targetEl.getBoundingClientRect();
  const hintW  = 220;
  let left = rect.left + rect.width / 2 - hintW / 2;
  left = Math.max(6, Math.min(left, window.innerWidth - hintW - 6));
  const top  = rect.bottom + 10;

  hint.style.left = left + 'px';
  hint.style.top  = top  + 'px';

  // Arrow tip points to center of button
  const arrowLeft = rect.left + rect.width / 2 - left;
  hint.style.setProperty('--arrow-left', Math.max(14, Math.min(arrowLeft, hintW - 14)) + 'px');

  _ctxHintTimer = setTimeout(hideCtxHint, duration);
}

function hideCtxHint() {
  clearTimeout(_ctxHintTimer);
  if (_ctxHintEl) {
    _ctxHintEl.classList.add('ctx-hint-out');
    const el = _ctxHintEl;
    _ctxHintEl = null;
    setTimeout(() => el.remove(), 320);
  }
}

// Вспомогательная: добавляет класс анимации и убирает его по окончании
function _nudgeBtn(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

// Показываем/скрываем кнопку runway в зависимости от режима и наряда
function updateRunwayBtn() {
  const btn = $('btn-runway');
  if (!btn) return;
  const show = school.active || countFilledSlots() >= 3;
  btn.classList.toggle('hidden', !show);
}

// Runway hint: тултип в первый раз, мягкое покачивание в следующие разы
function checkRunwayHint() {
  if (_runwayHintCooldown) return;

  const btn = $('btn-runway');
  if (!btn || btn.classList.contains('hidden') || btn.disabled) return;

  if (countFilledSlots() < 3) return;

  _runwayHintCooldown = true;
  setTimeout(() => { _runwayHintCooldown = false; }, 8000);

  if (!_hintShown('runway')) {
    _markHintShown('runway');
    _nudgeBtn(btn, 'hint-extra-pulse');
    const text = lang === 'ru'
      ? '✨ Образ собран!<br>Нажми <b>🌟 На подиум!</b>'
      : '✨ Outfit ready!<br>Tap <b>🌟 Runway!</b>';
    showCtxHint('btn-runway', text, 5000);
  } else {
    _nudgeBtn(btn, 'hint-nudge');
  }
}

// Stars hint: тултип в первый раз, мягкое покачивание в следующие разы
function triggerStarsHint() {
  const starsBtn = $('stars-display');

  if (!_hintShown('stars')) {
    // Первый раз — яркий пульс + тултип
    _markHintShown('stars');
    _nudgeBtn(starsBtn, 'hint-pulse');
    const hasAdOption = [...AD_ITEMS].some(id => !isUnlocked(id));
    const text = hasAdOption
      ? (lang === 'ru'
          ? '💡 Нажми <b>❤️</b> чтобы купить лайки<br>или получи вещи <b>бесплатно</b> за рекламу!'
          : '💡 Tap <b>❤️</b> to buy Likes<br>or get items <b>free</b> by watching ads!')
      : (lang === 'ru'
          ? '💡 Нажми <b>❤️</b> чтобы купить лайки!'
          : '💡 Tap <b>❤️</b> to buy more Likes!');
    showCtxHint('stars-display', text, 5000);
  } else {
    // Повторные разы — мягкое покачивание без тултипа
    _nudgeBtn(starsBtn, 'hint-nudge');
  }
}

function unlockItemFree(category, itemId) {
  _buyPending = null;
  hideBuyBar();
  if (prog.unlocked.includes(itemId)) return;
  prog.unlocked.push(itemId);
  saveProgress();
  equipItem(category, itemId);
  buildItemsGrid(activeCategory);
  spawnSparkles(12);
  sfxUnlock();
  checkAchievements();
  spawnSparkles(16);
}

function showAdForItem(category, itemId) {
  if (_adShowing) return;
  if (typeof ysdk !== 'undefined' && ysdk && ysdk.adv) {
    _adShowing = true;
    if (_actx) _actx.suspend(); pauseBGM();
    let _rewarded = false;
    ysdk.adv.showRewardedVideo({
      callbacks: {
        onRewarded: () => { _rewarded = true; },
        onClose: () => {
          _adShowing = false;
          if (_actx && soundOn) _actx.resume(); resumeBGM();
          if (_rewarded) unlockItemFree(category, itemId);
        },
        onError: () => {
          _adShowing = false;
          if (_actx && soundOn) _actx.resume(); resumeBGM();
          showToast(lang === 'ru' ? 'Реклама недоступна' : 'Ad unavailable');
        },
      },
    });
  } else {
    unlockItemFree(category, itemId);
  }
}

function showReviewForItem(category, itemId) {
  if (typeof ysdk !== 'undefined' && ysdk.feedback) {
    ysdk.feedback.canReview().then(({ value, reason }) => {
      if (value) {
        ysdk.feedback.requestReview().then(({ feedbackSent }) => {
          if (feedbackSent) {
            unlockItemFree(category, itemId);
          } else {
            showToast(lang === 'ru' ? 'Отзыв не отправлен' : 'Review not submitted');
          }
        });
      } else {
        const msg = reason === 'GAME_RATED'
          ? (lang === 'ru' ? 'Ты уже оставлял отзыв!' : 'You already left a review!')
          : (lang === 'ru' ? 'Отзыв недоступен' : 'Review not available');
        // If already reviewed previously, still reward (user was honest)
        if (reason === 'GAME_RATED') unlockItemFree(category, itemId);
        else showToast(msg);
      }
    });
  } else {
    // Dev fallback
    unlockItemFree(category, itemId);
  }
}

function showToast(msg) {
  let el = $('game-toast');
  if (!el) { el = document.createElement('div'); el.id = 'game-toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = 'game-toast';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = 'game-toast hidden', 2000);
}

// ────────────────────────────────────────────────────────────
// PROGRESSION — DAILY DEAL & TASK
// ────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().slice(0, 10); }

function dateHash(s) {
  let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h);
}

function getDailyDealId() {
  const ids = Object.keys(ITEM_COSTS);
  return ids[dateHash(todayStr()) % ids.length];
}

function getDailyDealCost(itemId) {
  return itemId === getDailyDealId() ? Math.ceil(itemCost(itemId) / 2) : itemCost(itemId);
}

function getDailyDealLikesCost(itemId) {
  return itemId === getDailyDealId() ? Math.ceil(itemLikesCost(itemId) / 2) : itemLikesCost(itemId);
}

function refreshDailyTask(today) {
  if (prog.dailyTaskDate === today) return;
  prog.dailyTaskId   = ASSIGNMENTS[dateHash(today) % ASSIGNMENTS.length].id;
  prog.dailyTaskDone = false;
  prog.dailyTaskDate = today;
  saveProgress();
}

// ────────────────────────────────────────────────────────────
// PROGRESSION — DAILY LOGIN
// ────────────────────────────────────────────────────────────

function checkDailyLogin() {
  const today = todayStr();
  refreshDailyTask(today);
  if (prog.lastLoginDate === today) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  prog.loginStreak  = prog.lastLoginDate === yesterday.toISOString().slice(0, 10)
    ? prog.loginStreak + 1 : 1;
  prog.lastLoginDate = today;
  saveProgress();
  const reward = (10 + Math.min((prog.loginStreak - 1) * 3, 15)) * 100;
  addLikes(reward);
  checkAchievements();
  showDailyLoginPopup(reward);
}

function showDailyLoginPopup(reward) {
  const popup = $('daily-login-popup');
  if (!popup) return;
  const titleEl = popup.querySelector('.daily-title');
  if (titleEl) titleEl.textContent = lang === 'ru' ? '❤️ Ежедневный бонус!' : '❤️ Daily Bonus!';
  const collectBtn = $('daily-collect-btn');
  if (collectBtn) collectBtn.textContent = lang === 'ru' ? '✨ Забрать!' : '✨ Collect!';
  $('daily-stars-reward').textContent = '+' + formatLikes(reward) + ' ❤️';
  $('daily-streak-text').textContent  = lang === 'ru'
    ? `День ${prog.loginStreak} подряд 🔥`
    : `Day ${prog.loginStreak} streak 🔥`;
  popup.classList.remove('hidden');
  sfxDailyBonus();
  if (collectBtn) collectBtn.onclick = () => { popup.classList.add('hidden'); sfxClick(); };
}

// ────────────────────────────────────────────────────────────
// PROGRESSION — ACHIEVEMENTS
// ────────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  // ── Первые шаги ──────────────────────────────────────────
  { id:'first_look',    icon:'👗', reward:1500,
    name:'First Look',         name_ru:'Первый образ',
    desc:'Wear something in every slot',      desc_ru:'Надень что-нибудь в каждую категорию',
    check:() => Object.keys(clothes).every(cat => equipped[cat] !== clothes[cat][0].id) },
  { id:'first_unlock',  icon:'🛒', reward:1000,
    name:'First Purchase',     name_ru:'Первая покупка',
    desc:'Unlock your first item',            desc_ru:'Купи первую вещь',
    check:() => prog.unlocked.length >= 1 },
  { id:'school_start',  icon:'📚', reward:2000,
    name:"School's In",        name_ru:'Первый звонок',
    desc:'Complete your first lesson',        desc_ru:'Пройди первый урок',
    check:() => prog.totalLessons >= 1 },
  { id:'runway_debut',  icon:'🌟', reward:2000,
    name:'Runway Debut',       name_ru:'Дебют на подиуме',
    desc:'Walk the runway for the first time',desc_ru:'Выйди на подиум в первый раз',
    check:() => (prog.runwayCount || 0) >= 1 },

  // ── Оценки ───────────────────────────────────────────────
  { id:'grade_b',       icon:'📝', reward:2000,
    name:'Honor Roll',         name_ru:'Хорошистка',
    desc:'Earn 75+ points in a post',          desc_ru:'Набери 75+ очков за пост',
    check:() => prog.highScore >= 75 },
  { id:'grade_a',       icon:'⭐', reward:3000,
    name:'A-Student',          name_ru:'Отличница',
    desc:'Earn 90+ points in a post',          desc_ru:'Набери 90+ очков за пост',
    check:() => prog.highScore >= 90 },
  { id:'perfect',       icon:'💯', reward:5000,
    name:'Perfection!',        name_ru:'Совершенство!',
    desc:'Earn 100 points in a post',          desc_ru:'Набери 100 очков за пост',
    check:() => prog.highScore >= 100 },
  { id:'perfect_3',     icon:'🏅', reward:6000,
    name:'Triple Perfect',     name_ru:'Три идеала',
    desc:'Earn 100 points three times',        desc_ru:'Набери 100 очков за пост три раза',
    check:() => (prog.perfectCount || 0) >= 3 },

  // ── Уроки ────────────────────────────────────────────────
  { id:'fashionista',   icon:'👑', reward:4000,
    name:'Fashionista',        name_ru:'Фэшионистка',
    desc:'Complete 5 lessons',                desc_ru:'Пройди 5 уроков',
    check:() => prog.totalLessons >= 5 },
  { id:'lessons_10',    icon:'📖', reward:5000,
    name:'Dedicated Student',  name_ru:'Прилежная студентка',
    desc:'Complete 10 lessons',               desc_ru:'Пройди 10 уроков',
    check:() => prog.totalLessons >= 10 },
  { id:'lessons_25',    icon:'🎓', reward:8000,
    name:'Class President',    name_ru:'Президент класса',
    desc:'Complete 25 lessons',               desc_ru:'Пройди 25 уроков',
    check:() => prog.totalLessons >= 25 },
  { id:'lessons_50',    icon:'🏆', reward:8000,
    name:'School Legend',      name_ru:'Легенда школы',
    desc:'Complete 50 lessons',               desc_ru:'Пройди 50 уроков',
    check:() => prog.totalLessons >= 50 },
  { id:'lessons_100',   icon:'👸', reward:12000,
    name:'K-Pop Icon',         name_ru:'K-Pop Икона',
    desc:'Complete 100 lessons',              desc_ru:'Пройди 100 уроков',
    check:() => prog.totalLessons >= 100 },

  // ── Подиум ───────────────────────────────────────────────
  { id:'runway_5',      icon:'✨', reward:4000,
    name:'Runway Regular',     name_ru:'Завсегдатай подиума',
    desc:'Walk the runway 5 times',           desc_ru:'Выйди на подиум 5 раз',
    check:() => (prog.runwayCount || 0) >= 5 },
  { id:'runway_10',     icon:'💫', reward:6000,
    name:'Catwalk Queen',      name_ru:'Королева подиума',
    desc:'Walk the runway 10 times',          desc_ru:'Выйди на подиум 10 раз',
    check:() => (prog.runwayCount || 0) >= 10 },
  { id:'runway_25',     icon:'🦋', reward:6000,
    name:'Supermodel',         name_ru:'Супермодель',
    desc:'Walk the runway 25 times',          desc_ru:'Выйди на подиум 25 раз',
    check:() => (prog.runwayCount || 0) >= 25 },

  // ── Гардероб ─────────────────────────────────────────────
  { id:'shopper',       icon:'🛍️', reward:3500,
    name:'Shopaholic',         name_ru:'Шопоголик',
    desc:'Unlock 5 items',                    desc_ru:'Купи 5 вещей',
    check:() => prog.unlocked.length >= 5 },
  { id:'wardrobe_10',   icon:'👚', reward:5000,
    name:'Fashion Lover',      name_ru:'Любительница моды',
    desc:'Unlock 10 items',                   desc_ru:'Купи 10 вещей',
    check:() => prog.unlocked.length >= 10 },
  { id:'wardrobe_20',   icon:'🧥', reward:5500,
    name:'Style Expert',       name_ru:'Эксперт стиля',
    desc:'Unlock 20 items',                   desc_ru:'Купи 20 вещей',
    check:() => prog.unlocked.length >= 20 },
  { id:'wardrobe_35',   icon:'💎', reward:7000,
    name:'Closet Legend',      name_ru:'Легенда гардероба',
    desc:'Unlock 35 items',                   desc_ru:'Купи 35 вещей',
    check:() => prog.unlocked.length >= 35 },

  // ── Серия дней ───────────────────────────────────────────
  { id:'streak_3',      icon:'🔥', reward:3000,
    name:'3-Day Streak',       name_ru:'3 дня подряд',
    desc:'Play 3 days in a row',              desc_ru:'Заходи 3 дня подряд',
    check:() => prog.loginStreak >= 3 },
  { id:'streak_7',      icon:'🌟', reward:6000,
    name:'Week Warrior',       name_ru:'Неделя без пропусков',
    desc:'Play 7 days in a row',              desc_ru:'Заходи 7 дней подряд',
    check:() => prog.loginStreak >= 7 },
  { id:'streak_14',     icon:'💖', reward:6000,
    name:'Fortnight Fan',      name_ru:'Две недели подряд',
    desc:'Play 14 days in a row',             desc_ru:'Заходи 14 дней подряд',
    check:() => prog.loginStreak >= 14 },
  { id:'streak_30',     icon:'👑', reward:10000,
    name:'Idol Dedication',    name_ru:'Преданность идола',
    desc:'Play 30 days in a row',             desc_ru:'Заходи 30 дней подряд',
    check:() => prog.loginStreak >= 30 },

  // ── Ежедневные задания ───────────────────────────────────
  { id:'daily_done',    icon:'📅', reward:2000,
    name:'Daily Devotee',      name_ru:'Первое задание',
    desc:'Complete a daily challenge',        desc_ru:'Выполни первое ежедневное задание',
    check:() => (prog.dailyTasksCompleted || 0) >= 1 },
  { id:'daily_5',       icon:'📆', reward:4000,
    name:'Routine Builder',    name_ru:'Привычка — вторая натура',
    desc:'Complete 5 daily challenges',       desc_ru:'Выполни 5 ежедневных заданий',
    check:() => (prog.dailyTasksCompleted || 0) >= 5 },
  { id:'daily_10',      icon:'🗓️', reward:6000,
    name:'Daily Champion',     name_ru:'Чемпион дня',
    desc:'Complete 10 daily challenges',      desc_ru:'Выполни 10 ежедневных заданий',
    check:() => (prog.dailyTasksCompleted || 0) >= 10 },
  { id:'daily_30',      icon:'🏅', reward:10000,
    name:'Monthly Master',     name_ru:'Мастер месяца',
    desc:'Complete 30 daily challenges',      desc_ru:'Выполни 30 ежедневных заданий',
    check:() => (prog.dailyTasksCompleted || 0) >= 30 },

  // ── Лайки (бывшие Звёзды) ───────────────────────────────────────────────
  { id:'star200',       icon:'💫', reward:2500,
    name:'Like Collector',     name_ru:'Коллекционер лайков',
    desc:'Earn 20,000 likes total',           desc_ru:'Заработай 20 000 лайков суммарно',
    check:() => (prog.likesEarned || 0) >= 20000 },
  { id:'star500',       icon:'🌠', reward:5000,
    name:'Rising Popularity',   name_ru:'Популярная группа',
    desc:'Earn 50,000 likes total',           desc_ru:'Заработай 50 000 лайков суммарно',
    check:() => (prog.likesEarned || 0) >= 50000 },
  { id:'star1000',      icon:'⭐', reward:6000,
    name:'Crowd Pleaser',      name_ru:'Любимцы публики',
    desc:'Earn 100,000 likes total',          desc_ru:'Заработай 100 000 лайков суммарно',
    check:() => (prog.likesEarned || 0) >= 100000 },
  { id:'star2500',      icon:'🌟', reward:0,
    name:'Global Idols',       name_ru:'Мировые кумиры',
    desc:'Earn 250,000 likes total',          desc_ru:'Заработай 250 000 лайков суммарно',
    check:() => (prog.likesEarned || 0) >= 250000 },
];

function checkAchievements() {
  return; // Achievements are disabled
}

function setAchievementDot(visible) {
  const btn = $('btn-achievements');
  if (!btn) return;
  let dot = btn.querySelector('.notif-dot');
  if (visible && !dot) {
    dot = document.createElement('span');
    dot.className = 'notif-dot';
    btn.appendChild(dot);
  } else if (!visible && dot) {
    dot.remove();
  }
}

function showAchievementToast(ach) {
  setAchievementDot(true);
  const el = document.createElement('div');
  el.className = 'achievement-toast';
  const name = lang === 'ru' ? ach.name_ru : ach.name;
  el.innerHTML = `<span class="ach-icon">${ach.icon}</span>
    <div><div class="ach-label">${lang === 'ru' ? 'Достижение!' : 'Achievement!'}</div>
    <div class="ach-name">${name}</div>
    ${ach.reward > 0 ? `<div class="ach-reward">+${formatLikes(ach.reward)} ❤️</div>` : ''}</div>`;
  document.body.appendChild(el);
  sfxAchievement();
  setTimeout(() => el.classList.add('ach-out'), 2800);
  setTimeout(() => el.remove(), 3400);
}

function showAchievementsModal() {
  const modal = $('achievements-modal');
  if (!modal) return;

  const titleEl = $('ach-modal-title');
  if (titleEl) titleEl.textContent = lang === 'ru' ? 'Достижения' : 'Achievements';

  // Убираем красную точку — игрок открыл и ознакомился
  setAchievementDot(false);

  const list = $('achievements-list');
  list.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const done = !!prog.achievements[ach.id];
    const desc = lang === 'ru' ? ach.desc_ru : ach.desc;
    const row  = document.createElement('div');
    row.className = 'ach-row' + (done ? ' done' : '');
    row.innerHTML = `
      <div class="ach-row-icon">${done ? ach.icon : '🔒'}</div>
      <div class="ach-row-info">
        <div class="ach-row-name">${lang === 'ru' ? ach.name_ru : ach.name}</div>
        <div class="ach-row-desc">${desc}</div>
      </div>
      ${ach.reward > 0 ? `<div class="ach-row-reward">${done ? '✓' : '+' + formatLikes(ach.reward)} ❤️</div>` : ''}`;
    list.appendChild(row);
  });
  modal.classList.remove('hidden');
}

// ────────────────────────────────────────────────────────────
// LAYER ORDER & CATEGORIES
// ────────────────────────────────────────────────────────────

const LAYER_ORDER = [
  { key:'body',        zIndex:0 },
  { key:'socks',       zIndex:1 },
  { key:'shoes',       zIndex:2 },
  { key:'bottoms',     zIndex:3 },
  { key:'tops',        zIndex:4 },
  { key:'hair',        zIndex:5 },
  { key:'accessories', zIndex:6 },
];

function getCategories() {
  return [
    { key:'hair',        label:t('catHair'),    icon:`<img src="Items/UI/hair.png" class="ui-icon" alt="hair">` },
    { key:'tops',        label:t('catTops'),    icon:`<img src="Items/UI/tops.png" class="ui-icon" alt="tops">` },
    { key:'bottoms',     label:t('catBottoms'), icon:`<img src="Items/UI/bottoms.png" class="ui-icon" alt="bottoms">` },
    { key:'shoes',       label:t('catShoes'),   icon:`<img src="Items/UI/shoes.png" class="ui-icon" alt="shoes">` },
    { key:'socks',       label:t('catSocks'),   icon:`<img src="Items/UI/socks.png" class="ui-icon" alt="socks">` },
    { key:'accessories', label:t('catAcc'),     icon:`<img src="Items/UI/accessories.png" class="ui-icon" alt="accessories">` },
  ];
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — ASSIGNMENTS POOL
// ────────────────────────────────────────────────────────────

const TAG_NAMES_RU = {
  kpop:    'к-поп',
  cute:    'милый',
  bold:    'дерзкий',
  pastel:  'пастельный',
  sporty:  'спортивный',
  casual:  'повседневный',
  school:  'школьный',
  formal:  'официальный',
  elegant: 'элегантный',
  gothic:  'готический',
  dark:    'тёмный',
};

function translateTags(tags) {
  if (lang !== 'ru') return tags;
  return tags.map(t => TAG_NAMES_RU[t] || t);
}

function buildHashtagsHTML(assignment, result) {
  if (!assignment || !result) return '';
  const equippedTags = getEquippedTags();
  const req = assignment.requiredTags || [];
  
  return req.map(t => {
    const matched = equippedTags.includes(t);
    const label = lang === 'ru' ? (TAG_NAMES_RU[t] || t) : t;
    const icon = matched ? '✅' : '❌';
    const tagClass = matched ? 'tag-matched' : 'tag-unmatched';
    return `<span class="hashtag-badge ${tagClass}">#${label} ${icon}</span>`;
  }).join(' ');
}

function getStarsHTML(starsNum) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (starsNum >= i) {
      html += '<span class="star-item filled">★</span>';
    } else if (starsNum >= i - 0.5) {
      html += '<span class="star-item half">☆</span>';
    } else {
      html += '<span class="star-item empty">☆</span>';
    }
  }
  return html;
}

const PROMO_ACTIVITIES = [
  { id:'recording',
    title:'Recording Session',     title_ru:'Запись трека',
    desc: 'Fans want pure charisma and bold vibe for the title track!',
    desc_ru:'Фанаты хотят чистую харизму и дерзкий вайб от заглавного трека!',
    requiredTags:['kpop','bold'] },
  { id:'fitness',
    title:'Fitness & Stretching',  title_ru:'Фитнес и растяжка',
    desc: 'Fans expect a comfortable, sporty outfit for stretching!',
    desc_ru:'Фанаты ждут удобный спортивный лук на растяжке!',
    requiredTags:['sporty','casual'] },
  { id:'photoshoot',
    title:'Album Photoshoot',      title_ru:'Фотосессия для альбома',
    desc: 'Fans expect an elegant, concept-driven outfit for the album book.',
    desc_ru:'Фанаты ждут элегантный концептуальный образ для буклета альбома.',
    requiredTags:['kpop','elegant'] },
  { id:'fansign',
    title:'Fansign Event',         title_ru:'Автограф-сессия',
    desc: 'Meet your fans! They demand an elegant and neat appearance.',
    desc_ru:'Встреться с фанатами! Они ждут элегантный и аккуратный вид.',
    requiredTags:['school','formal'] },
  { id:'variety_show',
    title:'Variety Show',          title_ru:'Развлекательное шоу',
    desc: 'Show a cute, eye-catching look for the television screen! Fans are watching!',
    desc_ru:'Покажи милый, выделяющийся образ для экранов ТВ! Фанаты ждут его!',
    requiredTags:['kpop','cute'] },
  { id:'dance_practice',
    title:'Choreography Practice', title_ru:'Репетиция хореографии',
    desc: 'Show style AND movement. Fans want to see you ready to dance!',
    desc_ru:'Покажи стиль И свободу движений. Фанаты ждут твоей готовности к танцу!',
    requiredTags:['sporty','kpop'] },
  { id:'vlog', // Продюсер Сон отвечает за видео-контент
    title:'Vlog Recording',        title_ru:'Запись влога',
    desc: 'Show your casual everyday style behind-the-scenes to your fans!',
    desc_ru:'Покажи фанатам свой естественный повседневный стиль за кулисами!',
    requiredTags:['casual','cute'] },
  { id:'fans_qa',
    title:'Live with Fans',        title_ru:'Эфир с фанатами',
    desc: 'Live stream time! Fans expect a neat and casual dress for the broadcast.',
    desc_ru:'Время прямого эфира! Фанаты ждут опрятный и повседневный наряд для трансляции.',
    requiredTags:['school','casual'] },
  { id:'dance_challenge',
    title:'Viral Dance Challenge', title_ru:'Вирусный танец',
    desc: 'Record a viral dance! Fans want a bright, trendy look for social media!',
    desc_ru:'Запиши вирусный танец! Фанаты ждут яркий, трендовый образ для соцсетей!',
    requiredTags:['cute','bold'] }
];

const FINAL_STAGES = [
  { id:'live_stage',
    title:'Inkigayo Live Stage',    title_ru:'Выступление на Inkigayo',
    desc: 'Your debut performance! Fans are watching your bold stage style!',
    desc_ru:'Твое дебютное выступление! Фанаты ждут дерзкий сценический стиль!',
    requiredTags:['kpop','bold'] },
  { id:'grand_concert',
    title:'Rookie Awards Stage',   title_ru:'Сцена премии Rookie Awards',
    desc: 'The biggest event! Fans expect maximum elegance and perfection.',
    desc_ru:'Главное событие! Фанаты ждут максимальную элегантность и совершенство.',
    requiredTags:['formal','elegant'] }
];

const FREE_POST = {
  id:'free_style',
  title:'Free Style Post',     title_ru:'Пост в свободном стиле',
  desc: 'Post whatever you like! Your fans love your personal style!',
  desc_ru:'Публикуй что хочешь! Фанаты обожают твой личный стиль!',
  requiredTags:[], isFree: true
};

const ASSIGNMENTS = [...PROMO_ACTIVITIES, ...FINAL_STAGES, FREE_POST];

const ACTIVITY_ICONS = {
  recording: 'recording.png',
  fitness: 'fitness.png',
  photoshoot: 'photoshoot.png',
  fansign: 'fansign.png',
  variety_show: 'variety_show.png',
  dance_practice: 'dance_practice.png',
  vlog: 'vlog.png',
  fans_qa: 'fans_qa.png',
  dance_challenge: 'dance_challenge.png',
  live_stage: 'live_stage.png',
  grand_concert: 'grand_concert.png',
  free_style: 'free_style.png'
};

function getActivityIcon(id) {
  return ACTIVITY_ICONS[id] || 'camera.png';
}

function assignmentTitle(a) { return lang === 'ru' ? a.title_ru : a.title; }
function assignmentDesc(a)  { return lang === 'ru' ? a.desc_ru  : a.desc;  }

// ────────────────────────────────────────────────────────────
// PROGRESSION RANKS
// ────────────────────────────────────────────────────────────

// Likes = followers × random(min..max)
const LIKE_MULTIPLIER = [6, 10];

// Ranks by total followers
const RANKS = [
  { key:'trainee', minFollowers:0,       nextAt:1500,    nameKey:'rankTrainee', emoji:'🌱' },
  { key:'debut',   minFollowers:1500,    nextAt:25000,   nameKey:'rankDebut',   emoji:'⭐' },
  { key:'idol',    minFollowers:25000,   nextAt:150000,  nameKey:'rankIdol',    emoji:'🌟' },
  { key:'star',    minFollowers:150000,  nextAt:1000000, nameKey:'rankStar',    emoji:'👑' },
];

const GOAL_FOLLOWERS = 1000000; // 1M = game finale

function getRank(totalFollowers) {
  for (let i = RANKS.length - 1; i >= 0; i--)
    if (totalFollowers >= RANKS[i].minFollowers) return RANKS[i];
  return RANKS[0];
}

// ────────────────────────────────────────────────────────────
// GAME STATE
// ────────────────────────────────────────────────────────────

const equipped = { hair:'blunt_bob_pink_headband', tops:'top_dress_new_1', bottoms:'bot_none', shoes:'shoe_none', socks:'sock_none', accessories:'acc_none' };
let activeCategory    = 'hair';
// Подкатегории для категорий с разделением
const CATEGORY_SUBS = {
  tops: [
    { key:'blouses', icon:`<img src="Items/UI/blouses.png" alt="Blouses">`, label:'Blouses', label_ru:'Блузки'  },
    { key:'dresses', icon:`<img src="Items/UI/dresses.png" alt="Dresses">`, label:'Dresses', label_ru:'Платья'  },
  ],
  bottoms: [
    { key:'pants',   icon:`<img src="Items/UI/pants.png" alt="Pants">`, label:'Pants',   label_ru:'Брюки'  },
    { key:'skirts',  icon:`<img src="Items/UI/skirts.png" alt="Skirts">`, label:'Skirts',  label_ru:'Юбки'   },
  ],
};

// Активная подкатегория для каждой категории
const activeSub = { tops:'blouses', bottoms:'pants' };

function subLabel(sub) { return lang === 'ru' ? sub.label_ru : sub.label; }

const school = {
  active:             false,
  day:                1,
  lessonIndex:        0,
  schedule:           [],
  lessonScores:       [],    // stars per lesson (0-5)
  totalFollowers:     0,     // total followers (gained across posts)
  totalPosts:         0,     // total published posts
  dayFollowersGained: 0,     // followers gained during current day
};

// ────────────────────────────────────────────────────────────
// DOM HELPER
// ────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

// ────────────────────────────────────────────────────────────
// CHARACTER STAGE
// ────────────────────────────────────────────────────────────

function buildCharacterLayers() {
  const container = $('character-layers');
  container.innerHTML = '';
  
  const auraDiv = document.createElement('div');
  auraDiv.className = 'character-aura';
  container.appendChild(auraDiv);

  const shadowDiv = document.createElement('div');
  shadowDiv.className = 'character-shadow';
  container.appendChild(shadowDiv);

  LAYER_ORDER.forEach(({ key, zIndex }) => {
    const div = document.createElement('div');
    div.id = `layer-${key}`;
    div.style.zIndex = zIndex;
    if (key === 'body') {
      div.style.cssText = 'position:absolute;inset:0;z-index:0;';
      const img = document.createElement('img');
      img.src = 'Items/body/body_new.png';
      img.alt = 'body';
      img.draggable = false;
      img.style.cssText = 'width:100%;height:100%;object-fit:fill;display:block;pointer-events:none;';
      div.appendChild(img);
    } else {
      div.className = 'char-layer';
    }
    container.appendChild(div);
  });
}

function updateLayer(category, item, animate = true) {
  const layerEl = $(`layer-${category}`);
  if (!layerEl) return;
  layerEl.innerHTML = '';

  // Per-item z override: item.z wins over category default
  const defaultZ = LAYER_ORDER.find(l => l.key === category)?.zIndex ?? 0;
  layerEl.style.zIndex = (item && item.z !== undefined) ? item.z : defaultZ;

  if (!item || !item.src || !item.pos) return;
  const { left, top, width } = item.pos;
  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.name;
  img.draggable = false;
  img.style.cssText = `position:absolute;left:${left}%;top:${top}%;width:${width}%;height:auto;pointer-events:none;`;
  if (animate) {
    img.classList.add('layer-animate');
    img.addEventListener('animationend', () => img.classList.remove('layer-animate'), { once:true });
  }
  layerEl.appendChild(img);
}

function renderAllLayers() {
  Object.keys(equipped).forEach(cat => updateLayer(cat, findItem(cat, equipped[cat]), false));
}

function findItem(category, itemId) {
  return (clothes[category] || []).find(i => i.id === itemId) || null;
}

function iName(item) {
  return (lang === 'ru' && item.name_ru) ? item.name_ru : item.name;
}

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
function sfxAchievement() {
  [[523,.28,.18,0],[659,.28,.18,.09],[784,.28,.18,.18],
   [1046,.32,.15,.28],[1318,.28,.4,.36]]
    .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
}
function sfxClick() { tone(1100,.1,.06); }
function sfxDailyBonus() {
  [[392,.28,.18,0],[523,.28,.18,.11],[659,.28,.18,.22],
   [784,.28,.18,.33],[1046,.32,.45,.44]]
    .forEach(([f,v,d,dt]) => tone(f,v,d,dt));
}
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
  if (trendMatches >= 2) sfxAchievement();
  else if (trendMatches === 1) {
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

function spawnSparkles(count = 6) {
  const container = $('sparkles');
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className = 'sparkle';
      el.textContent = SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)];
      const x  = 20 + Math.random() * 60;
      const y  = 10 + Math.random() * 80;
      el.style.left = x + '%';
      el.style.top  = y + '%';
      el.style.setProperty('--dx', (Math.random() - 0.5) * 80 + 'px');
      el.style.setProperty('--dy', -(20 + Math.random() * 60) + 'px');
      container.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 60);
  }
}

// ────────────────────────────────────────────────────────────
// OUTFIT NAME (free mode)
// ────────────────────────────────────────────────────────────

function updateOutfitName() {
  if (school.active) return;
  const adj  = t('adj');
  const noun = t('noun');
  const a = adj[Math.floor(Math.random() * adj.length)];
  const n = noun[Math.floor(Math.random() * noun.length)];
  $('outfit-name-display').textContent = `${a} ${n}`;
  updateStyleProgress();
}

function updateStyleProgress() {
  const bar   = $('style-progress-bar');
  const label = $('style-progress-label');
  if (!bar || !label) return;

  const cats    = Object.keys(clothes);
  const filled  = cats.filter(cat => equipped[cat] && equipped[cat] !== clothes[cat][0].id).length;
  const total   = cats.length;
  const pct     = Math.round((filled / total) * 100);

  bar.style.width = pct + '%';
  bar.style.background = pct === 100
    ? 'linear-gradient(90deg, var(--pink), var(--purple))'
    : 'linear-gradient(90deg, var(--purple), var(--pink))';

  label.textContent = lang === 'ru'
    ? `Образ ${filled}/${total}`
    : `Outfit ${filled}/${total}`;
}

// ────────────────────────────────────────────────────────────
// APPLY TRANSLATIONS TO DOM
// ────────────────────────────────────────────────────────────

function applyTranslations() {
  // Loading screen
  const lt = $('loading-title');
  const lp = $('loading-text');
  if (lt) lt.textContent = t('loadingTitle');
  if (lp) lp.textContent = t('loadingText');

  // Header
  $('header-title').textContent = t('gameTitle');
  const rl = $('btn-runway-label');
  if (rl) rl.textContent = t('btnRunway').replace('🌟 ', '');

  // Rebuild translated lists
  buildCategoryPanel();
  buildItemsGrid(activeCategory);

  // Assignment banner if active
  if (school.active) showAssignmentBanner();
}

// ────────────────────────────────────────────────────────────
// UI — CATEGORY PANEL & ITEMS GRID
// ────────────────────────────────────────────────────────────

function buildCategoryPanel() {
  const list = $('category-list');
  list.innerHTML = '';
  getCategories().forEach(cat => {
    // 1. Wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = `category-item-wrapper ${cat.key === activeCategory ? 'active' : ''}`;
    wrapper.dataset.key = cat.key;

    // 2. Main button with icon
    const btn = document.createElement('button');
    btn.className = `category-item cat-btn ${cat.key === activeCategory ? 'active' : ''}`;
    btn.dataset.key = cat.key;
    btn.innerHTML = `<span class="category-icon cat-icon">${cat.icon}</span>`;
    btn.title = cat.label;

    // 3. Text label
    const label = document.createElement('span');
    label.className = `category-item-label ${cat.key === activeCategory ? 'active' : ''}`;
    label.textContent = cat.label;

    // 4. Click event handler
    btn.addEventListener('click', () => selectCategory(cat.key));

    wrapper.appendChild(btn);
    wrapper.appendChild(label);
    list.appendChild(wrapper);
  });
}

function selectCategory(key) {
  activeCategory = key;
  
  // Update active classes across UI elements
  document.querySelectorAll('.category-item-wrapper').forEach(w => 
    w.classList.toggle('active', w.dataset.key === key)
  );
  document.querySelectorAll('.category-item, .cat-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.key === key)
  );
  document.querySelectorAll('.category-item-label').forEach(l => {
    const wrapper = l.closest('.category-item-wrapper');
    if (wrapper) {
      l.classList.toggle('active', wrapper.dataset.key === key);
    }
  });

  // Reset scroll position when switching categories
  const grid = $('items-grid');
  if (grid) {
    grid.scrollTop = 0;
    grid.scrollLeft = 0;
  }

  buildItemsGrid(key);
}


function buildSubTabs(category) {
  const subs = CATEGORY_SUBS[category];
  let tabs = $('items-sub-tabs');
  if (!tabs) {
    tabs = document.createElement('div');
    tabs.id = 'items-sub-tabs';
    tabs.className = 'sub-tabs';
    $('items-grid').parentNode.insertBefore(tabs, $('items-grid'));
  }
  tabs.innerHTML = '';
  subs.forEach(sub => {
    const btn = document.createElement('button');
    btn.className = 'sub-tab-btn' + (activeSub[category] === sub.key ? ' active' : '');
    btn.innerHTML = sub.icon + '<span>' + subLabel(sub) + '</span>';
    btn.addEventListener('click', () => {
      activeSub[category] = sub.key;
      buildSubTabs(category);
      buildItemsGrid(category);
    });
    tabs.appendChild(btn);
  });
  tabs.style.display = '';
}

function hideSubTabs() {
  const tabs = $('items-sub-tabs');
  if (tabs) tabs.style.display = 'none';
}

// Image cache to avoid performance drops and re-creating Image objects
const imageCache = new Map();
function getCachedImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }
  const img = new Image();
  img.src = src;
  imageCache.set(src, img);
  return img;
}

function drawItemThumbnail(canvas, frontSrc, backSrc) {
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. Get bounding box for the front image
  let bbox = null;
  if (typeof ITEM_BBOXES !== 'undefined' && ITEM_BBOXES[frontSrc]) {
    bbox = { ...ITEM_BBOXES[frontSrc] };
    
    // 2. If there's a back image (e.g., hair behind the head) and we have its bbox, union them
    if (backSrc && ITEM_BBOXES[backSrc]) {
      const backBbox = ITEM_BBOXES[backSrc];
      const minX = Math.min(bbox.x, backBbox.x);
      const minY = Math.min(bbox.y, backBbox.y);
      const maxX = Math.max(bbox.x + bbox.w, backBbox.x + backBbox.w);
      const maxY = Math.max(bbox.y + bbox.h, backBbox.y + backBbox.h);
      bbox = {
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY
      };
    }
  }
  
  const frontImg = getCachedImage(frontSrc);
  let backImg = backSrc ? getCachedImage(backSrc) : null;
  
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fallback if no bbox coordinates found (render full image)
    const finalBbox = bbox || { x: 0, y: 0, w: frontImg.naturalWidth || 941, h: frontImg.naturalHeight || 1672 };
    
    const srcAspect = finalBbox.w / finalBbox.h;
    const destAspect = canvas.width / canvas.height;
    
    let drawW, drawH, drawX, drawY;
    
    // Calculate aspect ratio preservation
    if (srcAspect > destAspect) {
      drawW = canvas.width;
      drawH = canvas.width / srcAspect;
      drawX = 0;
      drawY = (canvas.height - drawH) / 2;
    } else {
      drawH = canvas.height;
      drawW = canvas.height * srcAspect;
      drawX = (canvas.width - drawW) / 2;
      drawY = 0;
    }
    
    // Draw back image if exists
    if (backImg && backImg.complete && backImg.naturalWidth > 0) {
      ctx.drawImage(
        backImg,
        finalBbox.x, finalBbox.y, finalBbox.w, finalBbox.h,
        drawX, drawY, drawW, drawH
      );
    }
    
    // Draw front image
    if (frontImg.complete && frontImg.naturalWidth > 0) {
      ctx.drawImage(
        frontImg,
        finalBbox.x, finalBbox.y, finalBbox.w, finalBbox.h,
        drawX, drawY, drawW, drawH
      );
    }
  };
  
  // Render immediately if images are loaded, or attach listeners
  const frontLoaded = frontImg.complete && frontImg.naturalWidth > 0;
  const backLoaded = !backImg || (backImg.complete && backImg.naturalWidth > 0);
  
  if (frontLoaded && backLoaded) {
    draw();
  } else {
    let loadedCount = 0;
    const targetCount = backImg ? 2 : 1;
    
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === targetCount) {
        draw();
      }
    };
    
    if (!frontImg.complete || frontImg.naturalWidth === 0) {
      frontImg.addEventListener('load', onImageLoad, { once: true });
    } else {
      loadedCount++;
    }
    
    if (backImg && (!backImg.complete || backImg.naturalWidth === 0)) {
      backImg.addEventListener('load', onImageLoad, { once: true });
    } else if (backImg) {
      loadedCount++;
    }
  }
}

function buildItemsGrid(category) {
  const subs = CATEGORY_SUBS[category];
  if (subs) {
    buildSubTabs(category);
  } else {
    hideSubTabs();
  }

  const grid = $('items-grid');
  grid.innerHTML = '';

  const allItems = clothes[category] || [];
  const items = subs
    ? allItems.filter(item => !item.sub || item.sub === activeSub[category])
    : allItems;

  const dealId = getDailyDealId();

  items.forEach(item => {
    const locked = !isUnlocked(item.id);
    const isDeal = locked && item.id === dealId;
    const cost   = isDeal ? getDailyDealLikesCost(item.id) : itemLikesCost(item.id);

    const baseCost = itemCost(item.id);
    let rarityClass = 'rarity-common';
    if (baseCost > 0) {
      if (baseCost <= 25) {
        rarityClass = 'rarity-uncommon';
      } else if (baseCost <= 39) {
        rarityClass = 'rarity-rare';
      } else if (baseCost <= 49) {
        rarityClass = 'rarity-epic';
      } else {
        rarityClass = 'rarity-legendary';
      }
    }

    const isEquipped = equipped[category] === item.id;
    const card = document.createElement('div');
    card.className = 'item-card ' + rarityClass
      + (isEquipped ? ' selected equipped' : '')
      + (locked ? ' locked' : '');
    card.dataset.id = item.id;

    const filterStyle = item.filter ? ` style="filter:${item.filter}"` : '';
    let thumbHTML = '';
    if (item.src) {
      thumbHTML = `<div class="item-thumb-wrapper" style="position: relative;">
          <canvas class="item-thumb" width="120" height="120" style="display: block; width: 100%; height: 100%; pointer-events: none;"${filterStyle}></canvas>
        </div>`;
    } else {
      thumbHTML = `<div class="item-thumb-wrapper" style="display: flex; justify-content: center; align-items: center;">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--card-text)" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>`;
    }

    const isAdItem     = AD_ITEMS.has(item.id);
    const isReviewItem = item.id === REVIEW_ITEM;
    const badge = isDeal
      ? `<div class="item-deal-badge">🔥 ${formatLikes(cost)}❤️</div>`
      : locked && isAdItem
        ? `<div class="item-cost-badge item-ad-badge">📺 ${lang === 'ru' ? 'Реклама' : 'Ad'}</div>`
        : locked && isReviewItem
          ? `<div class="item-cost-badge item-review-badge">✍️ ${lang === 'ru' ? 'Отзыв' : 'Review'}</div>`
          : locked && cost > 0
            ? `<div class="item-cost-badge">${formatLikes(cost)}❤️</div>`
            : '';

    card.innerHTML = `${thumbHTML}${badge}<span class="item-name">${iName(item)}</span>`;
    if (item.src) {
      const canvas = card.querySelector('.item-thumb');
      if (canvas) {
        drawItemThumbnail(canvas, item.src);
      }
    }
    if (isEquipped) {
      const check = document.createElement('div');
      check.className = 'equipped-indicator';
      check.textContent = '✓';
      card.appendChild(check);
    }

    card.addEventListener('click', () => {
      tryEquipOrBuy(category, item.id);
    });
    grid.appendChild(card);
  });
}

// ────────────────────────────────────────────────────────────
// EQUIP LOGIC
// ────────────────────────────────────────────────────────────

function equipItem(category, itemId) {
  if (equipped[category] === itemId) return;
  equipped[category] = itemId;
  const item = findItem(category, itemId);
  updateLayer(category, item, true);

  // Auto-remove bottoms when equipping a dress
  if (category === 'tops' && item && item.sub === 'dresses') {
    if (equipped.bottoms !== 'bot_none') {
      equipped.bottoms = 'bot_none';
      updateLayer('bottoms', findItem('bottoms', 'bot_none'), false);
    }
  }
  // Auto-remove dress when equipping bottoms
  if (category === 'bottoms' && itemId !== 'bot_none') {
    const currentTop = findItem('tops', equipped.tops);
    if (currentTop && currentTop.sub === 'dresses') {
      equipped.tops = 'top_none';
      updateLayer('tops', findItem('tops', 'top_none'), false);
    }
  }

  spawnSparkles(12);
  sfxEquip();
  updateOutfitName();
  document.querySelectorAll('#items-grid .item-card').forEach(card => {
    const isCurrent = card.dataset.id === itemId;
    card.classList.toggle('selected', isCurrent);
    card.classList.toggle('equipped', isCurrent);

    const indicator = card.querySelector('.equipped-indicator');
    if (isCurrent && !indicator) {
      const check = document.createElement('div');
      check.className = 'equipped-indicator';
      check.textContent = '✓';
      card.appendChild(check);
    } else if (!isCurrent && indicator) {
      indicator.remove();
    }
  });
  saveOutfit();
  checkAchievements();
  updateRunwayBtn();
  checkRunwayHint();
}

// ────────────────────────────────────────────────────────────
// RANDOM / RESET
// ────────────────────────────────────────────────────────────

function randomOutfit() {
  let hasDress = false;
  Object.keys(clothes).forEach(cat => {
    const items = clothes[cat];
    let pick;
    if (cat === 'bottoms' && hasDress) {
      pick = items.find(i => i.id === 'bot_none') || items[0];
    } else if (cat === 'accessories' && Math.random() < 0.5) {
      pick = items.find(i => i.id === 'acc_none') || items[0];
    } else if (cat === 'hair') {
      pick = items[Math.floor(Math.random() * items.length)];
    } else {
      pick = items[1 + Math.floor(Math.random() * (items.length - 1))];
    }

    if (cat === 'tops' && pick && pick.sub === 'dresses') {
      hasDress = true;
    }

    equipped[cat] = pick.id;
    updateLayer(cat, pick, true);
  });
  spawnSparkles(14);
  setTimeout(() => spawnSparkles(10), 220);
  updateOutfitName();
  buildItemsGrid(activeCategory);
  saveOutfit();
  updateRunwayBtn();
  checkRunwayHint();
}

function resetOutfit() {
  Object.keys(clothes).forEach(cat => {
    const none = clothes[cat][0];
    equipped[cat] = none.id;
    updateLayer(cat, none, false);
  });
  if (!school.active) { $('outfit-name-display').textContent = ''; updateStyleProgress(); }
  buildItemsGrid(activeCategory);
  saveOutfit();
}

// ────────────────────────────────────────────────────────────
// SAVE / LOAD
// ────────────────────────────────────────────────────────────

const SAVE_KEY        = 'kpop_outfit_v2';
const SCHOOL_SAVE_KEY = 'kpop_school_v1';

function saveOutfit() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(equipped)); } catch(e) {}
}
function loadOutfit() {
  try { const r = localStorage.getItem(SAVE_KEY); if (r) Object.assign(equipped, JSON.parse(r)); } catch(e) {}
  // Migrate: носки/чулки перенесены из accessories → socks
  const movedToSocks = new Set(['acc_stockings','acc_socks','acc_stockings2','acc_stockings3']);
  if (movedToSocks.has(equipped.accessories)) {
    equipped.socks = equipped.accessories;
    equipped.accessories = 'acc_none';
  }
  if (!equipped.socks) equipped.socks = 'sock_none';

  // Auto-resolve dress/bottoms conflict on loaded state
  const topItem = findItem('tops', equipped.tops);
  if (topItem && topItem.sub === 'dresses' && equipped.bottoms !== 'bot_none') {
    equipped.bottoms = 'bot_none';
  }
}
// ────────────────────────────────────────────────────────────
// SHARE OUTFIT — скачать PNG с образом
// ────────────────────────────────────────────────────────────

function loadImageForCanvas(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => {
      // CORS fallback: retry without crossOrigin if anonymous fails
      const retryImg = new Image();
      retryImg.onload  = () => resolve(retryImg);
      retryImg.onerror = () => resolve(null);
      retryImg.src = src;
    };
    img.src = src;
  });
}

async function shareOutfit() {
  const overlay = $('share-generating');
  const genText = $('share-generating-text');
  overlay.classList.remove('hidden');
  if (genText) genText.textContent = lang === 'ru' ? 'Создаём образ...' : 'Creating outfit...';

  try {
    // Берём реальные размеры #stage чтобы процентное позиционирование совпало 1:1
    const stageEl = $('stage');
    const stageRect = stageEl.getBoundingClientRect();
    const srcW = stageRect.width  || 300;
    const srcH = stageRect.height || 500;

    // Масштабируем до 420px по ширине, сохраняя пропорции stage
    const SHARE_W = 420;
    const SHARE_H = Math.round(srcH / srcW * SHARE_W);

    // Волосы имеют top: ~-1.2% (выходят за верхний край stage).
    // Добавляем отступ сверху чтобы они не обрезались в канвасе.
    const TOP_PAD = Math.round(0.05 * SHARE_H); // 5% высоты
    const CANVAS_H = SHARE_H + TOP_PAD;

    const canvas = document.createElement('canvas');
    canvas.width  = SHARE_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');

    // — Фон: градиент (на весь canvas включая TOP_PAD)
    const grad = ctx.createLinearGradient(0, 0, SHARE_W, CANVAS_H);
    grad.addColorStop(0, '#ffd6ec');
    grad.addColorStop(0.5, '#ede9fe');
    grad.addColorStop(1, '#ccfbf1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SHARE_W, CANVAS_H);

    // — Фоновая картинка (студия) с прозрачностью (временно background_1.jpeg)
    const bgImg = await loadImageForCanvas(BACKGROUNDS[currentBackgroundIndex]);
    if (bgImg) {
      ctx.globalAlpha = 0.35;
      ctx.drawImage(bgImg, 0, 0, SHARE_W, CANVAS_H);
      ctx.globalAlpha = 1;
    }

    // — Декоративная рамка
    ctx.save();
    ctx.strokeStyle = 'rgba(168,85,247,0.6)';
    ctx.lineWidth = 5;
    const r = 18;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(SHARE_W - r, 0);
    ctx.arcTo(SHARE_W, 0, SHARE_W, r, r);
    ctx.lineTo(SHARE_W, CANVAS_H - r);
    ctx.arcTo(SHARE_W, CANVAS_H, SHARE_W - r, CANVAS_H, r);
    ctx.lineTo(r, CANVAS_H);
    ctx.arcTo(0, CANVAS_H, 0, CANVAS_H - r, r);
    ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // — Тень персонажа (овал под ногами)
    ctx.save();
    const cx = SHARE_W * 0.52;
    const cy = TOP_PAD + SHARE_H * 0.95; // Соответствует bottom: 5%
    const rx = SHARE_W * 0.3; // 60% ширины -> радиус 30%
    const ry = SHARE_H * 0.0225; // 4.5% высоты -> радиус 2.25%
    
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(0.84, 'rgba(0, 0, 0, 0.15)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // — Тело персонажа: смещено вниз на TOP_PAD, занимает SHARE_H
    const bodyImg = await loadImageForCanvas('Items/body/body_new.png');
    if (bodyImg) ctx.drawImage(bodyImg, 0, TOP_PAD, SHARE_W, SHARE_H);

    // — Слои одежды в правильном z-порядке.
    // Используем item.z (если задан) вместо LAYER_ORDER.zIndex —
    // это точно воспроизводит CSS z-index из игры.
    // При равном z используем DOM-порядок (индекс в LAYER_ORDER) как tiebreaker.
    const sortedLayers = LAYER_ORDER
      .filter(l => l.key !== 'body')
      .map(layer => {
        const itemId = equipped[layer.key];
        const item   = itemId ? findItem(layer.key, itemId) : null;
        const effectiveZ = (item && item.z !== undefined) ? item.z : layer.zIndex;
        const domOrder   = LAYER_ORDER.findIndex(l => l.key === layer.key);
        return { layer, item, effectiveZ, domOrder };
      })
      .sort((a, b) => a.effectiveZ !== b.effectiveZ
        ? a.effectiveZ - b.effectiveZ
        : a.domOrder  - b.domOrder);

    for (const { item } of sortedLayers) {
      if (!item) continue;
      if (!item.src || !item.pos) continue;

      const img = await loadImageForCanvas(item.src);
      if (!img) continue;

      // % от SHARE_H + смещение TOP_PAD — волосы с top:-1.2% теперь не обрезаются
      const { left, top, width } = item.pos;
      const x = left  / 100 * SHARE_W;
      const y = top   / 100 * SHARE_H + TOP_PAD;
      const w = width / 100 * SHARE_W;
      const h = w * (img.naturalHeight / img.naturalWidth);

      if (item.filter) {
        ctx.save();
        ctx.filter = item.filter;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, w, h);
      }
    }

    // — Нижняя плашка с названием игры (локализованная)
    const barH = 48;
    const barY = CANVAS_H - barH;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.beginPath();
    ctx.moveTo(0, barY + 14);
    ctx.arcTo(0, barY, 14, barY, 14);
    ctx.lineTo(SHARE_W - 14, barY);
    ctx.arcTo(SHARE_W, barY, SHARE_W, barY + 14, 14);
    ctx.lineTo(SHARE_W, CANVAS_H);
    ctx.lineTo(0, CANVAS_H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Текст плашки — берём локализованное название из переводов
    ctx.save();
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const gradient2 = ctx.createLinearGradient(0, 0, SHARE_W, 0);
    gradient2.addColorStop(0, '#ff6eb4');
    gradient2.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient2;
    ctx.fillText(t('gameTitle'), SHARE_W / 2, barY + barH / 2);
    ctx.restore();

    // — Скачать
    const link = document.createElement('a');
    link.download = 'kpop-outfit.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

  } catch (e) {
    showToast(lang === 'ru' ? 'Не удалось создать изображение' : 'Could not create image');
  } finally {
    overlay.classList.add('hidden');
  }
}

function saveSchoolProgress() {
  try {
    localStorage.setItem(SCHOOL_SAVE_KEY, JSON.stringify({
      day: school.day,
      totalFollowers: school.totalFollowers,
      totalPosts: school.totalPosts,
      dayFollowersGained: school.dayFollowersGained,
    }));
  } catch(e) {}
  updateFollowersDisplay();
}
function loadSchoolProgress() {
  try {
    const r = localStorage.getItem(SCHOOL_SAVE_KEY);
    if (r) {
      const s = JSON.parse(r);
      school.day = s.day || 1;
      school.totalFollowers = s.totalFollowers || s.totalScore || 0;
      school.totalPosts = s.totalPosts || 0;
      school.dayFollowersGained = s.dayFollowersGained || 0;
    }
  } catch(e) {}
  updateFollowersDisplay();
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — SCORING ENGINE
// ────────────────────────────────────────────────────────────

function getEquippedTags() {
  const tags = [];
  Object.keys(equipped).forEach(cat => {
    const item = findItem(cat, equipped[cat]);
    if (item && item.tags) tags.push(...item.tags);
  });
  return tags;
}

function countFilledSlots() {
  let filled = Object.keys(equipped).filter(cat => { const i = findItem(cat, equipped[cat]); return i && i.src; }).length;
  const topItem = findItem('tops', equipped.tops);
  if (topItem && topItem.sub === 'dresses' && topItem.src) {
    const bottomItem = findItem('bottoms', equipped.bottoms);
    if (!bottomItem || !bottomItem.src) {
      filled = Math.min(filled + 1, 6);
    }
  }
  return filled;
}

function scoreOutfit(assignment) {
  const tags   = getEquippedTags();
  const filled = countFilledSlots();
  const totalSlots = 6;

  // ── Smart naked check ──
  const topItem = findItem('tops', equipped.tops);
  const hasDress = topItem && topItem.sub === 'dresses' && topItem.src;
  const hasTop = topItem && topItem.sub !== 'dresses' && topItem.src;
  const bottomItem = findItem('bottoms', equipped.bottoms);
  const hasBottom = bottomItem && bottomItem.src;
  const isNaked = !hasDress && !(hasTop && hasBottom);

  if (isNaked) {
    return { totalPoints:0, filledPoints:0, trendPoints:0, trendMatches:0, matchedTrendTags: [],
             filled, totalSlots, req:assignment.requiredTags,
             isNaked:true, isRepeat:false, isFreePost:false };
  }

  // ── Filled points (up to 50) ──
  const filledPoints = Math.round((filled / 6) * 50);

  // ── Trend points (up to 50) ──
  let trendMatches = 0;
  let trendPoints = 0;
  let req = [];
  let matchedTrendTags = [];

  if (assignment.isFree) {
    trendMatches = 2; // Auto-perfect match for free posts
    trendPoints = 50;
  } else {
    req = assignment.requiredTags;
    matchedTrendTags = req.filter(t => tags.includes(t));
    trendMatches = matchedTrendTags.length;
    trendPoints = trendMatches * 25;
  }

  const totalPoints = filledPoints + trendPoints;

  return { totalPoints, filledPoints, trendPoints, trendMatches, matchedTrendTags,
           filled, totalSlots, req,
           isNaked:false, isRepeat:false, isFreePost:!!assignment.isFree };
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — FLOW
// ────────────────────────────────────────────────────────────

function buildDaySchedule() {
  const allTasks = [
    PROMO_ACTIVITIES[0], // Recording Session (bold, kpop)
    PROMO_ACTIVITIES[1], // Fitness & Stretching (sporty, casual)
    PROMO_ACTIVITIES[2], // Album Photoshoot (kpop, elegant)
    FREE_POST,            // Free Style Post
    PROMO_ACTIVITIES[3], // Fansign Event (school, formal)
    PROMO_ACTIVITIES[4], // Variety Show (kpop, cute)
    FINAL_STAGES[0],     // Inkigayo Live Stage (kpop, bold)
    PROMO_ACTIVITIES[5], // Choreography Practice (sporty, kpop)
    PROMO_ACTIVITIES[6], // Vlog Recording (casual, cute)
    FREE_POST,            // Free Style Post
    PROMO_ACTIVITIES[7], // Live with Fans (school, casual)
    PROMO_ACTIVITIES[8], // Viral Dance Challenge (cute, bold)
    FINAL_STAGES[1],     // Rookie Awards Stage (formal, elegant)
  ];
  const idx = Math.max(0, school.day - 1) % allTasks.length;
  school.schedule = [allTasks[idx]];
}

function startSchoolMode() {
  school.active       = true;
  school.lessonIndex  = 0;
  school.lessonScores = [];
  buildDaySchedule();
  $('assignment-banner').classList.remove('hidden');
  $('btn-runway').classList.remove('hidden');
  $('outfit-name-display').textContent = '';
  showAssignmentBanner();
  saveSchoolProgress();
}

const BACKGROUNDS = [
  'Background/recording.jpg',
  'Background/fitness.jpg',
  'Background/photoshoot.jpg',
  'Background/fansign.jpg',
  'Background/variety_show.jpg',
  'Background/dance_practice.jpg',
  'Background/vlog.jpg',
  'Background/fans_qa.jpg',
  'Background/dance_challenge.jpg',
  'Background/live_stage.jpg',
  'Background/grand_concert.jpg'
];
let currentBackgroundIndex = 2; // Default to 'Background/photoshoot.jpg'

function updateStageBackground(bgName) {
  const stage = $('stage');
  let bgUrl = '';
  
  if (bgName) {
    bgUrl = `Background/${bgName}.jpg`;
    const idx = BACKGROUNDS.findIndex(b => b.endsWith(`${bgName}.jpg`));
    if (idx !== -1) {
      currentBackgroundIndex = idx;
    }
  } else {
    bgUrl = BACKGROUNDS[currentBackgroundIndex];
  }
  
  if (stage) {
    stage.style.backgroundImage = 'none';
  }
  document.documentElement.style.setProperty('--page-bg', `url('${bgUrl}')`);
}

function changeBackground(direction) {
  currentBackgroundIndex = (currentBackgroundIndex + direction + BACKGROUNDS.length) % BACKGROUNDS.length;
  updateStageBackground();
}

function exitSchoolMode() {
  school.active = false;
  updateStageBackground('photoshoot');
  $('assignment-banner').classList.add('hidden');
  updateRunwayBtn();
  $('outfit-name-display').textContent = '';
  $('summary-modal').classList.add('hidden');
  $('score-modal').classList.add('hidden');
}

function showAssignmentBanner() {
  const a = school.schedule[school.lessonIndex];
  if (!a) return; // guard: schedule not ready yet
  updateStageBackground(a.id);
  
  const iconEl = $('banner-task-icon');
  if (iconEl) {
    iconEl.src = `Items/UI/activities/${getActivityIcon(a.id)}`;
    iconEl.style.display = 'block';
  }

  const subtitleEl = $('banner-task-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = lang === 'ru' ? 'Тема:' : 'Theme:';
  }

  if ($('banner-task-title')) {
    $('banner-task-title').textContent = assignmentTitle(a);
  }
  if ($('banner-task-desc')) {
    $('banner-task-desc').textContent = assignmentDesc(a);
  }
  
  const tagsContainer = $('banner-tags-container');
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    translateTags(a.requiredTags).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag-badge';
      span.textContent = `#${tag}`;
      tagsContainer.appendChild(span);
    });
  }
  
  $('outfit-name-display').textContent = assignmentDesc(a);
}


// ────────────────────────────────────────────────────────────
// SCHOOL MODE — SCORE SCREEN
// ────────────────────────────────────────────────────────────

function animateBar(el, pct, delay = 0) {
  setTimeout(() => { el.style.width = pct + '%'; }, delay);
}

// Smoothly count up raw numbers (e.g. total points, followers)
function animateCounter(el, target, duration = 1000, prefix = '', suffix = '', format = false) {
  if (!el) return;
  const start = 0;
  const startTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
  
  function update() {
    const now = (window.performance && window.performance.now) ? performance.now() : Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing out quad
    const easeProgress = progress * (2 - progress);
    const currentValue = Math.floor(start + easeProgress * (target - start));
    
    let displayValue;
    if (format === 'short') {
      displayValue = formatShortNumber(currentValue);
    } else if (format) {
      displayValue = currentValue.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
    } else {
      displayValue = currentValue;
    }
    el.textContent = prefix + displayValue + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      let finalValue;
      if (format === 'short') {
        finalValue = formatShortNumber(target);
      } else if (format) {
        finalValue = target.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
      } else {
        finalValue = target;
      }
      el.textContent = prefix + finalValue + suffix;
    }
  }
  
  requestAnimationFrame(update);
}

// Smoothly count up stats, supporting "K" formatting for thousands of likes
function animateStatsCounter(el, targetVal, isLikes = false) {
  if (!el) return;
  const duration = 1200; // 1.2 seconds
  const startTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
  
  function update() {
    const now = (window.performance && window.performance.now) ? performance.now() : Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress * (2 - progress); // ease out quad
    
    const current = Math.floor(easeProgress * targetVal);
    
    if (isLikes && targetVal >= 1000) {
      el.textContent = (current / 1000).toFixed(1) + 'K';
    } else {
      el.textContent = current;
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (isLikes && targetVal >= 1000) {
        el.textContent = (targetVal / 1000).toFixed(1) + 'K';
      } else {
        el.textContent = targetVal;
      }
    }
  }
  
  requestAnimationFrame(update);
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

// Render the outfit on canvas with the current studio background (clean without game brandings)
async function captureOutfitImage() {
  try {
    const stageEl = $('stage');
    const stageRect = stageEl.getBoundingClientRect();
    const srcW = stageRect.width  || 300;
    const srcH = stageRect.height || 500;

    const SHARE_W = 420;
    const SHARE_H = Math.round(srcH / srcW * SHARE_W);
    const TOP_PAD = Math.round(0.05 * SHARE_H); // 5% padding for high-sitting hair items
    const CANVAS_H = SHARE_H + TOP_PAD;

    const canvas = document.createElement('canvas');
    canvas.width  = SHARE_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');

    // 1. Draw base gradient background
    const grad = ctx.createLinearGradient(0, 0, SHARE_W, CANVAS_H);
    grad.addColorStop(0, '#ffd6ec');
    grad.addColorStop(0.5, '#ede9fe');
    grad.addColorStop(1, '#ccfbf1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SHARE_W, CANVAS_H);

    // 2. Draw current background image with opacity
    const bgImg = await loadImageForCanvas(BACKGROUNDS[currentBackgroundIndex]);
    if (bgImg) {
      ctx.globalAlpha = 0.45;
      ctx.drawImage(bgImg, 0, 0, SHARE_W, CANVAS_H);
      ctx.globalAlpha = 1;
    }

    // 3. Draw character shadow oval
    ctx.save();
    const cx = SHARE_W * 0.52;
    const cy = TOP_PAD + SHARE_H * 0.95;
    const rx = SHARE_W * 0.3;
    const ry = SHARE_H * 0.0225;
    
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(0.84, 'rgba(0, 0, 0, 0.15)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Draw character body
    const bodyImg = await loadImageForCanvas('Items/body/body_new.png');
    if (bodyImg) ctx.drawImage(bodyImg, 0, TOP_PAD, SHARE_W, SHARE_H);

    // 5. Draw clothes in z-order
    const sortedLayers = LAYER_ORDER
      .filter(l => l.key !== 'body')
      .map(layer => {
        const itemId = equipped[layer.key];
        const item   = itemId ? findItem(layer.key, itemId) : null;
        const effectiveZ = (item && item.z !== undefined) ? item.z : layer.zIndex;
        const domOrder   = LAYER_ORDER.findIndex(l => l.key === layer.key);
        return { layer, item, effectiveZ, domOrder };
      })
      .sort((a, b) => a.effectiveZ !== b.effectiveZ
        ? a.effectiveZ - b.effectiveZ
        : a.domOrder  - b.domOrder);

    for (const { item } of sortedLayers) {
      if (!item || !item.src || !item.pos) continue;
      const img = await loadImageForCanvas(item.src);
      if (!img) continue;

      const { left, top, width } = item.pos;
      const x = left  / 100 * SHARE_W;
      const y = top   / 100 * SHARE_H + TOP_PAD;
      const w = width / 100 * SHARE_W;
      const h = w * (img.naturalHeight / img.naturalWidth);

      if (item.filter) {
        ctx.save();
        ctx.filter = item.filter;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, w, h);
      }
    }

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error("Failed to capture outfit image:", e);
    return '';
  }
}

// Get a stylized post caption based on the activity type
function getPostTextForActivity(activityId) {
  const ruTexts = {
    recording: 'Записываем новый трек на студии! 🎙️ Дерзкий вайб и крутой звук обеспечены. Как вам наш лук сегодня? ✨ #kpop #bold',
    fitness: 'Утренняя тренировка и растяжка перед камбэком! 🧘 Главное — удобство и стиль. Заряжаемся энергией! 👟 #sporty #casual',
    photoshoot: 'Снимаем концепт-фото для нового альбома! 📸 Как вам этот элегантный образ? Будет жарко! 💫 #kpop #elegant',
    fansign: 'Наконец-то встретились с нашими любимыми фанатами на автограф-сессии! 🤝 Спасибо за поддержку и подарки! 💖 #school #formal',
    variety_show: 'Приняли участие в развлекательном шоу! 📺 Было очень весело, ждите эфир! Оцените наш милый стиль 🎀 #kpop #cute',
    dance_practice: 'Отрабатываем хореографию в зале до идеала! 💃 Стиль и свобода движений — наш девиз сегодня! 🎵 #sporty #kpop',
    vlog: 'Снимаем новый влог для вас! 🧋 Покажем наши повседневные будни за кадром. Ждете? 😉 #casual #cute',
    fans_qa: 'Провели уютный прямой эфир и ответили на ваши вопросы! 📱 Вы лучшие, обожаем вас! 💕 #school #casual',
    dance_challenge: 'Записали новый танцевальный челлендж! 🎵 Залетайте в тренды, повторяйте движения! 🌟 #cute #bold',
    live_stage: 'Наше дебютное выступление на Inkigayo! 🎤 Сцена горела, зал кричал, это было незабываемо! 🔥 #kpop #bold',
    grand_concert: 'Выступили на премии Rookie Awards! 🏆 Мы невероятно счастливы и элегантны. Спасибо, наш фандом! 👑 #formal #elegant'
  };

  const enTexts = {
    recording: 'Recording a new hit in the studio! 🎙️ Charisma and bold vibe guaranteed. How do you like our look today? ✨ #kpop #bold',
    fitness: 'Morning stretching and fitness before the comeback! 🧘 Comfort and style is key. Getting energized! 👟 #sporty #casual',
    photoshoot: 'Shooting concept photos for our new album! 📸 How do you like this elegant look? It\'s going to be hot! 💫 #kpop #elegant',
    fansign: 'Finally met our lovely fans at the fansign event! 🤝 Thank you for the support and gifts! 💖 #school #formal',
    variety_show: 'Guest starred on a variety show! 📺 It was super fun, watch out for the broadcast! Rate our cute style 🎀 #kpop #cute',
    dance_practice: 'Practicing our choreography to perfection! 💃 Style and movement are our motto today! 🎵 #sporty #kpop',
    vlog: 'Shooting a new vlog for you! 🧋 Showing our daily life behind the scenes. Are you excited? 😉 #casual #cute',
    fans_qa: 'Had a cozy live stream and answered your questions! 📱 You are the best, love you all! 💕 #school #casual',
    dance_challenge: 'Recorded a new dance challenge! 🎵 Jump into the trends, duplicate the moves! 🌟 #cute #bold',
    live_stage: 'Our debut performance on Inkigayo! 🎤 The stage was on fire, the crowd was loud, unforgettable! 🔥 #kpop #bold',
    grand_concert: 'Performed at the Rookie Awards stage! 🏆 We are incredibly happy and elegant. Thank you, our fandom! 👑 #formal #elegant'
  };

  const pool = lang === 'ru' ? ruTexts : enTexts;
  return pool[activityId] || (lang === 'ru' ? 'Новый пост! ✨ Оцените наш образ для сегодняшней активности!' : 'New post! ✨ Check out our look for today\'s activity!');
}

// Generate three comments from virtual fans based on the scoring results
function generateSocialComments(result, assignment) {
  const nicknames = [
    '@kpop_star_fan', '@yuri_bias_forever', '@kpop_lover_xx', '@idol_vibe',
    '@knetizen_99', '@kpop_queen', '@fandom_leader', '@bias_wrecker',
    '@kpop_dance_crew', '@starlight_kpop', '@weverse_enjoyer', '@multifan_life',
    '@kpop_aesthetic', '@hallyu_wave', '@blink_army', '@midzy_once'
  ];
  const emojis = ['🐼', '🦊', '🐰', '🐱', '🐻', '🐨', '🐯', '🦄', '💖', '✨', '🎵'];
  const nicknameAvatars = {
    '@kpop_star_fan': 'Avatars/avatar_1.png',
    '@yuri_bias_forever': 'Avatars/avatar_2.png',
    '@kpop_lover_xx': 'Avatars/avatar_3.png',
    '@idol_vibe': 'Avatars/avatar_4.png',
    '@knetizen_99': 'Avatars/avatar_5.png',
    '@kpop_queen': 'Avatars/avatar_6.png',
    '@fandom_leader': 'Avatars/avatar_7.png',
    '@bias_wrecker': 'Avatars/avatar_8.png',
    '@kpop_dance_crew': 'Avatars/avatar_9.png',
    '@starlight_kpop': 'Avatars/avatar_10.png',
    '@weverse_enjoyer': 'Avatars/avatar_11.png',
    '@multifan_life': 'Avatars/avatar_12.png',
    '@kpop_aesthetic': 'Avatars/avatar_13.png',
    '@hallyu_wave': 'Avatars/avatar_14.png',
    '@blink_army': 'Avatars/avatar_15.png',
    '@midzy_once': 'Avatars/avatar_16.png'
  };

  const commentsData = result ? [
    { type: 'style', val: result.trendMatches },
    { type: 'rating', val: result.totalPoints },
    { type: 'special' }
  ] : [
    { type: 'style', val: 0, isFreeMode: true },
    { type: 'rating', val: 100, isFreeMode: true },
    { type: 'special', isFreeMode: true }
  ];

  return commentsData.map(c => {
    const nick = nicknames[Math.floor(Math.random() * nicknames.length)];
    const avatar = nicknameAvatars[nick] || 'Avatars/avatar_1.png';
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    let text = '';

    if (c.type === 'style') {
      if (c.isFreeMode || (result && result.isFreePost)) {
        text = lang === 'ru'
          ? 'Свободный день — свободный стиль! Выглядит отлично! 💕'
          : 'Free style day! Looks great! 💕';
      } else if (result && result.isNaked) {
        text = lang === 'ru'
          ? 'Разве тренды разрешают ходить раздетой? 😮'
          : 'Do trends allow going naked? 😮';
      } else {
        const trendMatches = c.val;
        const poolRu = trendMatches >= 2
          ? ['Этот образ идеально подходит под тренды! 😍', 'Стиль передан на 100% круто! 🔥', 'Трендовый лук, прямо в точку! 🔥']
          : trendMatches >= 1
          ? ['Миленько, но хотелось бы больше вещей в тему.', 'Образ аккуратный, но не хватает яркого трендового акцента.']
          : ['Совсем не попали в стиль события... 😢', 'Странный выбор вещей, концепт провален.', 'Она точно знала, куда одевается?'];
        const poolEn = trendMatches >= 2
          ? ['This outfit is absolutely perfect for the trends! 😍', 'The style is captured perfectly! 🔥', 'Super trendy look, right on target! 🔥']
          : trendMatches >= 1
          ? ['Cute, but I wanted more matching vibes.', 'The outfit is neat, but lacks a bright trend accent.']
          : ['This outfit doesn\'t suit the event at all... 😢', 'Strange choice of items, concept missed.', 'Did she know where she was going?'];

        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      }
    } else if (c.type === 'rating') {
      if (result && result.isNaked) {
        text = lang === 'ru' ? 'Ужасно, где одежда? 😢' : 'Terrible, where is the clothing? 😢';
      } else {
        const score = c.val;
        const poolRu = score >= 90
          ? ['🔥 Лучший образ за всю историю! Вирусный хит!', 'Шедевр! Фанаты сходят с ума! 😍✨', 'Просто разрыв! Мой биас прекрасен! 💖']
          : score >= 75
          ? ['✨ Очень красивый и стильный образ! Лайк!', 'Фанаты в восторге, образ получился супер!', 'Хороший пост, делюсь со всеми друзьями! 🥰']
          : score >= 50
          ? ['Вполне неплохой наряд, фанаты одобряют 👍', 'Хороший лук, мне нравится!', 'Симпатично! Лайк от меня. 🥰']
          : ['Нормально, но бывало и лучше 😕', 'Обычный образ, ничего особенного.', 'Пойдет, но можно было постараться сильнее.'];
        const poolEn = score >= 90
          ? ['🔥 Best look ever! Absolute viral hit!', 'Masterpiece! Fans are going crazy! 😍✨', 'Absolute perfection! My bias is gorgeous! 💖']
          : score >= 75
          ? ['✨ Very beautiful and stylish outfit! Liked!', 'Fans love it, the outfit is super cool!', 'Nice post, sharing with all my friends! 🥰']
          : score >= 50
          ? ['Quite a decent outfit, fans approve 👍', 'Good look, I like it!', 'Cute! Liked. 🥰']
          : ['It\'s okay, but could be better 😕', 'Ordinary look, nothing special.', 'Fine, but could be much better.'];

        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      }
    } else if (c.type === 'special') {
      if (c.isFreeMode) {
        text = lang === 'ru' ? 'Очень эстетично выглядит! ✨' : 'Looks very aesthetic! ✨';
      } else if (result && result.isNaked) {
        const poolRu = ['Забыла одеться? Кто-нибудь, дайте ей пальто! 😮', 'Эм... почему наряд такой пустой? Мы голые? 😮', 'Где юбка/брюки? Образ абсолютно не завершен.'];
        const poolEn = ['Forgot to get dressed? Someone give her a coat! 😮', 'Um... why so empty? Are we naked? 😮', 'Where is the skirt/pants? Cohesion is missing.'];
        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      } else if (result && result.isRepeat) {
        const poolRu = ['Этот образ мы уже видели! Повторяешься 👀', 'Опять то же самое? Фанаты заметили! 👀', 'Нужно больше разнообразия, не пости одно и то же!'];
        const poolEn = ['We have already seen this outfit! Repeating yourself 👀', 'Same outfit again? Fans noticed! 👀', 'Need more variety, don\'t post the same look twice!'];
        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      } else if (result && result.isFreePost) {
        const poolRu = ['Люблю, когда она сама выбирает одежду! 💕', 'Свободный стиль ей так идет! 🥰', 'Самый естественный и милый пост! 💕'];
        const poolEn = ['Love it when she chooses her own clothes! 💕', 'Free style suits her so well! 🥰', 'The most natural and cute post! 💕'];
        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      } else {
        if (result && result.filled >= result.totalSlots) {
          const poolRu = ['Полный образ! Всё продумано до мелочей! 🌟', 'Вау, каждый слот заполнен — идеально! 🔥', 'Собрала полный лук, вот это старание! ✨'];
          const poolEn = ['Full outfit! Every detail is perfect! 🌟', 'Wow, every slot is filled — perfection! 🔥', 'Complete look, that\'s dedication! ✨'];
          const pool = lang === 'ru' ? poolRu : poolEn;
          text = pool[Math.floor(Math.random() * pool.length)];
        } else {
          const poolRu = ['Приятный пост, лайк от меня!', 'Прикольно, жду новые посты!', 'Очень эстетично выглядит. ✨'];
          const poolEn = ['Nice post, liked!', 'Cool, waiting for new posts!', 'Looks very aesthetic. ✨'];
          const pool = lang === 'ru' ? poolRu : poolEn;
          text = pool[Math.floor(Math.random() * pool.length)];
        }
      }
    }

    return { nick, emoji, avatar, text, scoreHtml: '' };
  });
}

function showScoreScreen(assignment, result, earned, socialStats) {
  const picker = $('emoji-picker');
  const isFree = !assignment || !result;
  const authorName = 'eclipse';

  // Clear any existing auto-scroll timer on screen load
  if (scoreAutoScrollTimer) {
    clearInterval(scoreAutoScrollTimer);
    scoreAutoScrollTimer = null;
  }

  const startAutoScroll = () => {
    if (scoreAutoScrollTimer) clearInterval(scoreAutoScrollTimer);
    scoreAutoScrollTimer = setInterval(() => {
      const nextBtn = $('overlay-comment-next');
      if (nextBtn) {
        nextBtn.click();
      }
    }, 8000); // 8 seconds is optimal for reading short fan comments!
  };

  const stopAutoScroll = () => {
    if (scoreAutoScrollTimer) {
      clearInterval(scoreAutoScrollTimer);
      scoreAutoScrollTimer = null;
    }
  };
  
  const authorLeft = $('score-author-name-left');
  if (authorLeft) authorLeft.textContent = authorName;
  const authorRight = $('score-author-name');
  if (authorRight) authorRight.textContent = authorName;

  // Set post time dynamically
  const timeText = $('score-meta-time-text');
  if (timeText) {
    timeText.textContent = lang === 'ru' ? '2ч' : '2h';
  }

  // Set location in Instagram-like header
  const locationEl = $('score-location-left');
  if (locationEl) {
    if (isFree) {
      locationEl.textContent = lang === 'ru' ? 'Свободная фотосессия' : 'Free Photoshoot';
    } else {
      let locText = 'Seoul, South Korea';
      if (assignment.id === 'live_stage') {
        locText = lang === 'ru' ? 'Сцена SBS Inkigayo' : 'SBS Inkigayo Stage';
      } else if (assignment.id === 'grand_concert') {
        locText = lang === 'ru' ? 'Премия Rookie Music Awards' : 'Rookie Music Awards';
      } else if (assignment.id === 'dance_practice') {
        locText = lang === 'ru' ? 'Танцевальная студия' : 'K-Pop Practice Studio';
      } else if (assignment.id === 'fansign') {
        locText = lang === 'ru' ? 'Автограф-сессия в Каннаме' : 'Gangnam Fansign Hall';
      } else if (assignment.id === 'vlog') {
        locText = lang === 'ru' ? 'Уютное кафе' : 'Cozy Cafe';
      } else if (assignment.id === 'fans_qa') {
        locText = lang === 'ru' ? 'Прямой эфир' : 'Live Broadcast';
      } else if (assignment.id === 'photoshoot') {
        locText = lang === 'ru' ? 'Фотостудия в Сеуле' : 'Seoul Photo Studio';
      }
      locationEl.textContent = locText;
    }
  }

  // Handle likes display next to the like button
  const likesCountEl = $('instagram-likes-count-new');
  let currentLikesVal = 0;
  if (likesCountEl) {
    if (isFree) {
      currentLikesVal = Math.floor(Math.random() * 1000) + 250;
    } else {
      currentLikesVal = earned || 0;
    }
    likesCountEl.textContent = '0';
    setTimeout(() => animateCounter(likesCountEl, currentLikesVal, 900, '', '', true), 800);
  }

  // Set shares/reposts count (random number from 15 to 85)
  let currentSharesVal = isFree ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 70) + 15;
  const sharesCountEl = $('instagram-shares-count-new');
  if (sharesCountEl) {
    sharesCountEl.textContent = '0';
    setTimeout(() => animateCounter(sharesCountEl, currentSharesVal, 900, '', '', true), 800);
  }

  // Interactive like button for the Instagram post
  const postLikeBtn = $('instagram-post-like-btn');
  if (postLikeBtn) {
    postLikeBtn.classList.add('liked');
    
    let postLiked = true;
    postLikeBtn.onclick = (e) => {
      e.stopPropagation();
      sfxClick();
      postLiked = !postLiked;
      if (postLiked) {
        postLikeBtn.classList.add('liked');
        if (likesCountEl) {
          likesCountEl.textContent = formatLikes(currentLikesVal);
        }
      } else {
        postLikeBtn.classList.remove('liked');
        if (likesCountEl) {
          likesCountEl.textContent = formatLikes(currentLikesVal - 1);
        }
      }
    };
  }

  // Interactive bookmark button for the Instagram post
  const postBookmarkBtn = $('instagram-post-bookmark-btn');
  if (postBookmarkBtn) {
    postBookmarkBtn.classList.remove('saved');
    let postBookmarked = false;
    postBookmarkBtn.onclick = (e) => {
      e.stopPropagation();
      sfxClick();
      postBookmarked = !postBookmarked;
      if (postBookmarked) {
        postBookmarkBtn.classList.add('saved');
      } else {
        postBookmarkBtn.classList.remove('saved');
      }
    };
  }

  // Interactive share button for the Instagram post
  const postShareBtn = $('instagram-post-share-btn');
  if (postShareBtn) {
    let postShared = false;
    postShareBtn.onclick = (e) => {
      e.stopPropagation();
      sfxClick();
      
      // Trigger fly-away animation
      postShareBtn.classList.remove('sharing');
      void postShareBtn.offsetWidth; // Trigger reflow to restart CSS animation
      postShareBtn.classList.add('sharing');
      
      // Clean up sharing class after animation completes
      setTimeout(() => {
        postShareBtn.classList.remove('sharing');
      }, 500);

      // Increment share count only once per view
      if (!postShared) {
        postShared = true;
        currentSharesVal++;
        if (sharesCountEl) {
          sharesCountEl.textContent = formatLikes(currentSharesVal);
        }
      }
    };
  }

  // Clone stage for post preview
  const container = $('score-post-image-container');
  if (container) {
    container.innerHTML = '';
    const originalStage = $('stage');
    if (originalStage) {
      const clonedStage = originalStage.cloneNode(true);
      clonedStage.id = 'cloned-stage';
      
      // Clean up cloned stage IDs to avoid duplicate ID issues
      const charLayers = clonedStage.querySelector('#character-layers');
      if (charLayers) {
        charLayers.id = 'cloned-character-layers';
        charLayers.classList.add('cloned-character-layers');
      }
      
      const layerBody = clonedStage.querySelector('#layer-body');
      if (layerBody) {
        layerBody.id = 'cloned-layer-body';
        layerBody.classList.add('cloned-layer-body');
      }
      
      // Prefix all other IDs in the cloned element to prevent duplicates
      clonedStage.querySelectorAll('[id]').forEach(el => {
        if (el.id !== 'cloned-stage' && el.id !== 'cloned-character-layers' && el.id !== 'cloned-layer-body') {
          el.id = 'cloned-' + el.id;
        }
      });
      
      // Strip the layer-animate class to make sure images are not stuck at opacity 0
      clonedStage.querySelectorAll('.layer-animate').forEach(img => {
        img.classList.remove('layer-animate');
      });
      
      // Remove sparkles from the post picture (they are animated and might look weird static)
      const sparkles = clonedStage.querySelector('#cloned-sparkles');
      if (sparkles) {
        sparkles.remove();
      }
      
      // Reset styling rules to lock aspect ratio and prevent squishing
      clonedStage.style.height = '100%';
      clonedStage.style.width = 'auto';
      clonedStage.style.aspectRatio = '768 / 1376';
      clonedStage.style.position = 'absolute';
      clonedStage.style.top = '50%';
      clonedStage.style.left = '50%';
      clonedStage.style.transform = 'translate(-50%, -50%)';
      clonedStage.style.display = 'block';
      clonedStage.style.maxWidth = 'none';
      clonedStage.style.maxHeight = 'none';
      
      // Set background image on both container and clonedStage to be absolutely sure it renders
      const bgUrl = BACKGROUNDS[currentBackgroundIndex];
      container.style.backgroundImage = `url('${bgUrl}')`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      
      clonedStage.style.backgroundImage = `url('${bgUrl}')`;
      clonedStage.style.backgroundSize = 'cover';
      clonedStage.style.backgroundPosition = 'center';
      
      container.appendChild(clonedStage);
    }
  }

  // Handle Free vs School mode layout
  const resultsBlock = document.querySelector('.social-results-block');
  const tagInfo = $('score-tag-info');

  const assignTitleEl = $('score-assignment-title');
  const postTextEl = $('score-post-text');
  if (isFree) {
    if (assignTitleEl) {
      assignTitleEl.textContent = lang === 'ru' ? '📍 Свободная фотосессия' : '📍 Free Photoshoot';
    }
    if (postTextEl) {
      postTextEl.textContent = lang === 'ru' 
        ? 'Мой новый образ в свободном стиле! Как вам такое сочетание? 💫 #kpop #freestyle' 
        : 'My new outfit in free style! Do you like this combination? 💫 #kpop #freestyle';
    }
    
    if (tagInfo) tagInfo.style.display = 'none';
    if (resultsBlock) resultsBlock.style.display = 'none';
  } else {
    if (assignTitleEl) {
      assignTitleEl.textContent = tf('scoreResults', { title: assignmentTitle(assignment) });
    }
    if (postTextEl) {
      postTextEl.textContent = getPostTextForActivity(assignment.id);
    }
    
    if (tagInfo) {
      tagInfo.style.display = 'none';
      tagInfo.innerHTML = buildHashtagsHTML(assignment, result);
    }
    if (resultsBlock) resultsBlock.style.display = 'block';
  }

  // Set unit text next to total followers gained
  $('score-total-unit').textContent = lang === 'ru' ? ' подписчиков' : ' followers';

  const socialComments = generateSocialComments(result, assignment);
  
  // Set comments count (which is socialComments.length, usually 3)
  const commentsCountEl = $('instagram-comments-count-new');
  if (commentsCountEl) {
    const commentCount = socialComments ? socialComments.length : 3;
    commentsCountEl.textContent = '0';
    setTimeout(() => animateCounter(commentsCountEl, commentCount, 900, '', '', true), 800);
  }
  
  // Handle rewards display (show in school/promo mode, hide in free mode)
  const rewardRow = $('score-reward-row');
  if (rewardRow) {
    if (isFree) {
      rewardRow.style.display = 'none';
    } else {
      rewardRow.style.display = 'flex';
      const rewardValEl = $('score-reward-value');
      if (rewardValEl) {
        rewardValEl.textContent = '0';
        const likesVal = earned || 0;
        setTimeout(() => animateCounter(rewardValEl, likesVal, 900, '', '', 'short'), 800);
      }
      const likesUnitEl = $('score-likes-unit');
      if (likesUnitEl) {
        likesUnitEl.textContent = lang === 'ru' ? ' лайков' : ' likes';
      }
    }
  }

  if (!isFree) {
    // ── Reset large score counter ──
    const largeScoreEl = $('score-large-score');
    if (largeScoreEl) {
      largeScoreEl.textContent = '0/100';
      largeScoreEl.classList.remove('visible');
    }

    // ── Update score status title ──
    const statusTitleEl = $('score-status-title');
    if (statusTitleEl) {
      statusTitleEl.classList.remove('visible');
      let statusText = '';
      const pts = result.totalPoints;
      if (lang === 'ru') {
        if (pts >= 100) statusText = '👑 Сенсация!';
        else if (pts >= 80) statusText = '🔥 Невероятно!';
        else if (pts >= 60) statusText = '✨ Трендово!';
        else if (pts >= 40) statusText = '👍 Хорошая работа';
        else statusText = '💜 Начало пути';
      } else {
        if (pts >= 100) statusText = '👑 Sensational!';
        else if (pts >= 80) statusText = '🔥 Incredible!';
        else if (pts >= 60) statusText = '✨ Trendy!';
        else if (pts >= 40) statusText = '👍 Good job!';
        else statusText = '💜 Start of the journey';
      }
      statusTitleEl.textContent = statusText;
      
      // Show at the end of the counter animation (approx 1700ms)
      setTimeout(() => {
        statusTitleEl.classList.add('visible');
      }, 1700);
    }

    // ── Populate breakdown rows ──
    const itemsLabel = $('score-items-label');
    const itemsValue = $('score-items-value');
    const trendLabel = $('score-trend-label');
    const trendValue = $('score-trend-value');
    const trendRowEl = $('score-row-trend');
    const breakdownCard = document.querySelector('.score-breakdown');

    if (itemsLabel) {
      itemsLabel.textContent = lang === 'ru'
        ? `Образ: ${result.filled}/${result.totalSlots} вещей`
        : `Outfit: ${result.filled}/${result.totalSlots} items`;
    }
    if (itemsValue) {
      itemsValue.textContent = '0';
      setTimeout(() => animateCounter(itemsValue, result.filledPoints, 600), 300);
    }

    // Trend points row — show always in school mode to clarify addition
    if (trendRowEl) {
      trendRowEl.style.display = 'flex';
      if (result.trendMatches > 0) {
        trendRowEl.classList.add('has-trend');
      } else {
        trendRowEl.classList.remove('has-trend');
      }
      if (trendLabel) {
        trendLabel.style.display = 'inline-flex';
        trendLabel.style.alignItems = 'center';
        trendLabel.style.flexWrap = 'wrap';

        if (lang === 'ru') {
          let html = `<span>Тренд: ${result.trendMatches} совпад.</span>`;
          if (result.matchedTrendTags && result.matchedTrendTags.length > 0) {
            const badges = result.matchedTrendTags.map(t => {
              const label = TAG_NAMES_RU[t] || t;
              return `<span class="hashtag-badge tag-matched" style="margin-left: 6px; margin-top: 0; margin-bottom: 0; display: inline-flex; align-items: center; gap: 4px;">#${label} ✅</span>`;
            }).join('');
            html += badges;
          }
          trendLabel.innerHTML = html;
        } else {
          let html = `<span>Trend: ${result.trendMatches} match${result.trendMatches !== 1 ? 'es' : ''}</span>`;
          if (result.matchedTrendTags && result.matchedTrendTags.length > 0) {
            const badges = result.matchedTrendTags.map(t => {
              return `<span class="hashtag-badge tag-matched" style="margin-left: 6px; margin-top: 0; margin-bottom: 0; display: inline-flex; align-items: center; gap: 4px;">#${t} ✅</span>`;
            }).join('');
            html += badges;
          }
          trendLabel.innerHTML = html;
        }
      }
      if (trendValue) {
        trendValue.textContent = '0';
        setTimeout(() => animateCounter(trendValue, result.trendPoints, 600), 300);
      }
    }



    // Large score with count-up
    if (largeScoreEl) {
      setTimeout(() => {
        largeScoreEl.classList.add('visible');
        animateCounter(largeScoreEl, result.totalPoints, 800, '', '/100');
      }, 500);
    }

    // Viral glow on breakdown card
    if (breakdownCard) {
      breakdownCard.classList.toggle('viral-post', result.trendMatches >= 2);
    }

    // Followers gained with count-up
    const gainedEl = $('score-followers-gained');
    if (gainedEl) {
      gainedEl.textContent = '0';
      const followersVal = socialStats ? socialStats.followers : 0;
      setTimeout(() => animateCounter(gainedEl, followersVal, 900, '', '', 'short'), 800);
    }

    // Update Milestone Progress (1K → 10K → 100K → 500K → 1M)
    const MILESTONES = [1000, 10000, 100000, 500000, 1000000];
    const prevTotal = Math.max(0, school.totalFollowers - (socialStats ? socialStats.followers : 0));

    // Find current milestone bracket
    function getMilestone(followers) {
      let prevM = 0;
      for (const m of MILESTONES) {
        if (followers < m) return { from: prevM, to: m };
        prevM = m;
      }
      return { from: MILESTONES[MILESTONES.length - 2], to: MILESTONES[MILESTONES.length - 1] };
    }

    const curMilestone = getMilestone(school.totalFollowers);
    const prevMilestone = getMilestone(prevTotal);

    const rankBadgeEl = $('score-rank-badge');
    const rankBarEl = $('score-rank-bar');
    const rankNextEl = $('score-rank-next');

    // Show current total as badge
    const rankBadgeValEl = $('score-rank-badge-val');
    if (rankBadgeValEl) {
      rankBadgeValEl.textContent = formatFollowers(school.totalFollowers);
    } else if (rankBadgeEl) {
      rankBadgeEl.textContent = `📊 ${formatFollowers(school.totalFollowers)}`;
    }

    if (school.totalFollowers >= GOAL_FOLLOWERS) {
      if (rankBarEl) {
        const pDenom = prevMilestone.to - prevMilestone.from;
        const prevPct = pDenom > 0 ? ((prevTotal - prevMilestone.from) / pDenom) * 100 : 100;
        rankBarEl.style.width = Math.min(Math.max(0, prevPct), 100) + '%';
        setTimeout(() => { rankBarEl.style.width = '100%'; }, 800);
      }
      if (rankNextEl) {
        rankNextEl.innerHTML = lang === 'ru'
          ? '<span style="color: #d97706; font-weight: 800;">🎉 1 МИЛЛИОН! Легенды K-Pop! 🎉</span>'
          : '<span style="color: #d97706; font-weight: 800;">🎉 1 MILLION! K-Pop Legends! 🎉</span>';
      }
    } else {
      const denom = curMilestone.to - curMilestone.from;
      const pDenom = prevMilestone.to - prevMilestone.from;
      const prevPercent = pDenom > 0 ? ((prevTotal - prevMilestone.from) / pDenom) * 100 : 0;
      const nextPercent = denom > 0 ? ((school.totalFollowers - curMilestone.from) / denom) * 100 : 0;

      if (rankBarEl) {
        // If milestone bracket changed, start from 0
        const startPct = (curMilestone.to !== prevMilestone.to) ? 0 : Math.min(Math.max(0, prevPercent), 100);
        rankBarEl.style.width = startPct + '%';
        setTimeout(() => {
          rankBarEl.style.width = Math.min(Math.max(0, nextPercent), 100) + '%';
        }, 800);
      }

      if (rankNextEl) {
        const remaining = curMilestone.to - school.totalFollowers;
        rankNextEl.textContent = lang === 'ru'
          ? `Цель: ${formatFollowers(curMilestone.to)} · осталось ${formatFollowers(remaining)}`
          : `Goal: ${formatFollowers(curMilestone.to)} · ${formatFollowers(remaining)} left`;
      }
    }
  }

  // Comments slider overlay state
  let activeCommentIndex = 0;
  let isAnimating = false;
  const commentStates = [
    { liked: false, reaction: null },
    { liked: false, reaction: null },
    { liked: false, reaction: null }
  ];
  const commentTimes = [
    lang === 'ru' ? '2м' : '2m',
    lang === 'ru' ? '5м' : '5m',
    lang === 'ru' ? '10м' : '10m'
  ];

  // Inject comments overlay into the new comments container in the left column
  const commentsContainer = $('score-comments-container-left');
  if (commentsContainer && socialComments && socialComments.length > 0) {
    // Remove any existing overlay first to prevent duplicates
    commentsContainer.innerHTML = '';

    commentsContainer.insertAdjacentHTML('beforeend', `
      <div id="score-comment-overlay" class="score-comment-overlay">
        <button class="score-comment-arrow prev-btn" id="overlay-comment-prev" type="button">&lsaquo;</button>
        <div class="score-comment-content">
          <div class="score-comment-main">
            <div class="score-comment-avatar" id="overlay-avatar"></div>
            <div class="score-comment-text-block">
              <span class="score-comment-nick" id="overlay-nick"></span>
              <span class="score-comment-text" id="overlay-comment-text"></span>
            </div>
          </div>
          <div class="score-comment-actions-row">
            <span class="score-comment-time" id="overlay-time"></span>
            <span class="score-comment-action-btn score-like-btn" id="overlay-like-btn"></span>
            <span class="score-comment-action-btn score-reply-btn" id="overlay-reply-btn"></span>
          </div>
        </div>
        <button class="score-comment-arrow next-btn" id="overlay-comment-next" type="button">&rsaquo;</button>
      </div>
    `);

    const updateActiveComment = () => {
      const comment = socialComments[activeCommentIndex];
      if (!comment) return;

      const avatarEl = $('overlay-avatar');
      const nickEl = $('overlay-nick');
      const textEl = $('overlay-comment-text');
      const timeEl = $('overlay-time');
      const likeBtn = $('overlay-like-btn');
      const replyBtn = $('overlay-reply-btn');

      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${comment.avatar || 'Avatars/avatar_1.png'}" alt="avatar" class="score-comment-avatar-img">`;
      }
      if (nickEl) nickEl.textContent = comment.nick;
      if (textEl) textEl.textContent = comment.text;
      if (timeEl) timeEl.textContent = commentTimes[activeCommentIndex] || '2m';

      const state = commentStates[activeCommentIndex];

      if (likeBtn) {
        if (state.liked) {
          likeBtn.textContent = '❤️';
          likeBtn.classList.add('liked');
        } else {
          likeBtn.textContent = lang === 'ru' ? 'Нравится' : 'Like';
          likeBtn.classList.remove('liked');
        }
      }

      if (replyBtn) {
        if (state.reaction) {
          replyBtn.textContent = state.reaction;
          replyBtn.classList.add('has-reaction');
        } else {
          replyBtn.textContent = lang === 'ru' ? 'Ответить' : 'Reply';
          replyBtn.classList.remove('has-reaction');
        }
      }
    };

    // Initialize first comment
    updateActiveComment();
    startAutoScroll();

    // Arrows event listeners
    const prevBtn = $('overlay-comment-prev');
    const nextBtn = $('overlay-comment-next');

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        if (picker) picker.classList.add('hidden');
        startAutoScroll(); // Reset auto scroll timer on manual interaction

        const contentEl = commentsContainer.querySelector('.score-comment-content');
        if (contentEl) {
          isAnimating = true;
          contentEl.classList.remove('comment-slide-next-in', 'comment-slide-next-out', 'comment-slide-prev-in', 'comment-slide-prev-out');
          contentEl.classList.add('comment-slide-prev-out');

          setTimeout(() => {
            activeCommentIndex = (activeCommentIndex - 1 + socialComments.length) % socialComments.length;
            updateActiveComment();
            contentEl.classList.remove('comment-slide-prev-out');
            contentEl.classList.add('comment-slide-prev-in');
            isAnimating = false;
          }, 200);
        } else {
          activeCommentIndex = (activeCommentIndex - 1 + socialComments.length) % socialComments.length;
          updateActiveComment();
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        if (picker) picker.classList.add('hidden');
        startAutoScroll(); // Reset auto scroll timer on manual interaction

        const contentEl = commentsContainer.querySelector('.score-comment-content');
        if (contentEl) {
          isAnimating = true;
          contentEl.classList.remove('comment-slide-next-in', 'comment-slide-next-out', 'comment-slide-prev-in', 'comment-slide-prev-out');
          contentEl.classList.add('comment-slide-next-out');

          setTimeout(() => {
            activeCommentIndex = (activeCommentIndex + 1) % socialComments.length;
            updateActiveComment();
            contentEl.classList.remove('comment-slide-next-out');
            contentEl.classList.add('comment-slide-next-in');
            isAnimating = false;
          }, 200);
        } else {
          activeCommentIndex = (activeCommentIndex + 1) % socialComments.length;
          updateActiveComment();
        }
      };
    }

    const postCommentBtn = $('instagram-post-comment-btn');
    if (postCommentBtn) {
      postCommentBtn.onclick = (e) => {
        e.stopPropagation();
        sfxClick();
        if (nextBtn) {
          nextBtn.click();
        }
      };
    }

    // Interactive actions event listeners
    const likeBtn = $('overlay-like-btn');
    if (likeBtn) {
      likeBtn.onclick = (e) => {
        e.stopPropagation();
        if (picker) picker.classList.add('hidden');
        commentStates[activeCommentIndex].liked = !commentStates[activeCommentIndex].liked;
        updateActiveComment();
      };
    }

    const replyBtn = $('overlay-reply-btn');
    if (replyBtn && picker) {
      replyBtn.onclick = (e) => {
        e.stopPropagation();
        picker.classList.remove('hidden');
        picker.style.visibility = 'hidden';
        const pickerHeight = picker.offsetHeight;
        const pickerWidth = picker.offsetWidth;
        picker.style.visibility = 'visible';

        const rect = replyBtn.getBoundingClientRect();
        picker.style.top = `${rect.top - pickerHeight - 8 + window.scrollY}px`;
        picker.style.left = `${rect.left + (rect.width - pickerWidth) / 2 + window.scrollX}px`;

        const closeHandler = (evt) => {
          if (picker && !picker.contains(evt.target)) {
            picker.classList.add('hidden');
            document.removeEventListener('click', closeHandler);
          }
        };
        setTimeout(() => {
          document.addEventListener('click', closeHandler);
        }, 50);
      };

      const emojiOptions = picker.querySelectorAll('.emoji-option');
      emojiOptions.forEach(opt => {
        opt.onclick = (e) => {
          e.stopPropagation();
          commentStates[activeCommentIndex].reaction = opt.dataset.emoji;
          updateActiveComment();
          picker.classList.add('hidden');
        };
      });

      const clearOpt = picker.querySelector('.emoji-option-clear');
      if (clearOpt) {
        clearOpt.onclick = (e) => {
          e.stopPropagation();
          commentStates[activeCommentIndex].reaction = null;
          updateActiveComment();
          picker.classList.add('hidden');
        };
      }
    }
  }

  // Next / Close button handler
  if (isFree) {
    $('btn-next-lesson').textContent = lang === 'ru' ? 'Закрыть' : 'Close';
    $('btn-next-lesson').onclick = () => {
      stopAutoScroll();
      if (picker) picker.classList.add('hidden');
      $('score-modal').classList.add('hidden');
    };
  } else {
    // Every post is a day. The next button advances to the next day.
    $('btn-next-lesson').textContent = t('btnNewDay');
    $('btn-next-lesson').onclick = () => {
      stopAutoScroll();
      if (picker) picker.classList.add('hidden');
      $('score-modal').classList.add('hidden');
      showFullscreenAd(() => {
        school.day++;
        school.lessonIndex  = 0;
        school.lessonScores = [];
        school.dayFollowersGained = 0;
        buildDaySchedule();
        showAssignmentBanner();
        resetOutfit();
        $('btn-runway').disabled = false;
        saveSchoolProgress();
      });
    };
  }

  $('btn-share-score-label').textContent = lang === 'ru' ? 'Сохранить фото' : 'Save Photo';
  
  // Custom click for sharing/downloading the post image in high res
  $('btn-share-score').onclick = () => {
    // If download is needed, we can trigger the standard save flow
    shareOutfit();
  };

  // ── Удвой награду (только если trendMultiplier >= 1.3 и не свободный режим) ───────────────
  const dblBtn  = $('btn-double-reward');
  const retryBtn = $('btn-retry-lesson');
  retryBtn.classList.add('hidden');

  earned = earned || 0;
  if (!isFree && result.trendMatches >= 1) {
    let doubled = false;
    dblBtn.textContent = lang === 'ru'
      ? `📺 Удвоить награду (+${formatLikes(earned)} ❤️)`
      : `📺 Double reward (+${formatLikes(earned)} ❤️)`;
    dblBtn.classList.remove('hidden');
    dblBtn.onclick = () => {
      if (doubled || _adShowing) return;
      const onRewarded = () => {
        doubled = true;
        dblBtn.classList.add('hidden');
        addLikes(earned);
        spawnSparkles(12);
        showToast(`✨ +${formatLikes(earned)} ❤️ × 2!`);
      };
      if (ysdk) {
        _adShowing = true;
        if (_actx) _actx.suspend(); pauseBGM();
        let _rewarded = false;
        const _onRewarded = onRewarded;
        ysdk.adv.showRewardedVideo({
          callbacks: {
            onRewarded: () => { _rewarded = true; },
            onClose: () => {
              _adShowing = false;
              if (_actx && soundOn) _actx.resume(); resumeBGM();
              if (_rewarded) _onRewarded();
            },
            onError: () => {
              _adShowing = false;
              if (_actx && soundOn) _actx.resume(); resumeBGM();
              showToast(lang === 'ru' ? 'Реклама недоступна' : 'Ad unavailable');
            },
          },
        });
      } else {
        onRewarded();
      }
    };
  } else {
    dblBtn.classList.add('hidden');
  }

  $('score-modal').classList.remove('hidden');
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — DAILY SUMMARY
// ────────────────────────────────────────────────────────────

function showDailySummary() {
  const avgScore = school.lessonScores.length > 0 
    ? Math.round(school.lessonScores.reduce((a, b) => a + b, 0) / school.lessonScores.length)
    : 0;
  saveSchoolProgress();

  const rank     = getRank(school.totalFollowers);
  const nextRank = RANKS[RANKS.indexOf(rank) + 1] || null;
  const gradeEmoji = avgScore >= 200 ? '👑' : avgScore >= 100 ? '🌟' : avgScore >= 60 ? '⭐' : avgScore >= 30 ? '💜' : '🌱';

  $('summary-emoji-big').textContent = gradeEmoji;
  $('summary-title').textContent     = tf('summaryTitle',    { d: school.day });
  $('summary-day-score').textContent = tf('summaryDayScore', { s: formatFollowers(school.dayFollowersGained) });

  const list = $('summary-lessons-list');
  list.innerHTML = '';
  school.schedule.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'summary-lesson-row';
    const starsNum = school.lessonScores[i] || 0;
    const iconName = getActivityIcon(a.id);
    row.innerHTML = `
      <span class="summary-lesson-name" style="display:inline-flex; align-items:center; gap:6px;">
        <img src="Items/UI/activities/${iconName}" class="ui-icon" style="width:16px; height:16px;" alt="">
        ${assignmentTitle(a)}
      </span>
      <span class="summary-lesson-score" style="font-weight:700; color:#a855f7;">${starsNum} ${lang === 'ru' ? 'очк.' : 'pts'}</span>
    `;
    list.appendChild(row);
  });

  $('summary-rank-badge').textContent = tf('summaryRankLine', {
    rank: t(rank.nameKey),
    pts:  formatFollowers(school.totalFollowers),
  });

  if (school.totalFollowers >= GOAL_FOLLOWERS) {
    $('summary-emoji-big').textContent = '🏆';
    $('summary-rank-bar').style.width = '100%';
    const congradText = lang === 'ru' 
      ? '🎉 1 МИЛЛИОН ПОДПИСЧИКОВ! 🎉<br>Вы стали легендами K-Pop!' 
      : '🎉 1 MILLION FOLLOWERS! 🎉<br>You are now ultimate K-Pop Legends!';
    $('summary-rank-next').innerHTML = `<span style="color: #d97706; font-weight: 800; font-size: 1.1rem;">${congradText}</span>`;
  } else if (nextRank) {
    const progress = (school.totalFollowers - rank.minFollowers) / (nextRank.minFollowers - rank.minFollowers);
    setTimeout(() => { $('summary-rank-bar').style.width = Math.min(progress * 100, 100) + '%'; }, 400);
    $('summary-rank-next').textContent = tf('summaryNextRank', { name: t(nextRank.nameKey), at: formatFollowers(nextRank.minFollowers) });
  } else {
    $('summary-rank-bar').style.width = '100%';
    $('summary-rank-next').textContent = t('summaryMaxRank');
  }

  $('btn-new-day').textContent    = t('btnNewDay');
  $('btn-exit-school').textContent= t('btnExitSchool');
  $('summary-modal').classList.remove('hidden');
}

// ────────────────────────────────────────────────────────────
// RUNWAY BUTTON
// ────────────────────────────────────────────────────────────

function onRunwayClick() {
  if (!school.active) {
    // Free mode — snap photo, trigger flash and open post overlay
    hideCtxHint();
    prog.runwayCount = (prog.runwayCount || 0) + 1;
    saveProgress();
    checkAchievements();
    
    // Play shutter sound, trigger visual flash, and clone DOM stage instantly
    $('btn-runway').disabled = true;
    triggerCameraFlash(() => {
      showScoreScreen(null, null, 0);
      $('btn-runway').disabled = false;
    });
    return;
  }
  const assignment = school.schedule[school.lessonIndex];
  if (!assignment) return; // guard: schedule not ready yet
  hideCtxHint();
  $('btn-runway').disabled = true;
  
  const result = scoreOutfit(assignment);
  school.lessonScores.push(result.totalPoints); // Store total points

  // ── Growing reach: quadratic progression targeting 1M followers in ~40 posts ──
  school.totalPosts++;

  // ── Followers earned based on score and quadratic growth: 45 * N^2 ──
  let followers;
  if (result.isNaked) {
    followers = Math.floor(Math.random() * 10) + 1;
  } else {
    const postNum = school.totalPosts;
    const baseFollowers = 45 * postNum * postNum;
    followers = Math.round((result.totalPoints / 100) * baseFollowers);
    if (followers < 1) followers = 1;
  }

  school.totalFollowers += followers;
  school.dayFollowersGained += followers;

  // ── Social likes (display only, not currency) ──
  const [lMin, lMax] = LIKE_MULTIPLIER;
  const likes = followers * (Math.floor(Math.random() * (lMax - lMin + 1)) + lMin);

  // ── Likes reward (currency) ──
  const earned = result.isNaked ? 0 : Math.round(followers * 0.8);

  prog.totalLessons++;
  prog.runwayCount = (prog.runwayCount || 0) + 1;
  if (result.totalPoints > (prog.highScore || 0)) prog.highScore = result.totalPoints;
  if (result.totalPoints >= 100) {
    prog.perfectCount = (prog.perfectCount || 0) + 1;
  }

  // Bonus for daily challenge
  const isDaily = assignment.id === prog.dailyTaskId && !prog.dailyTaskDone;
  if (isDaily) {
    prog.dailyTaskDone = true;
    prog.dailyTasksCompleted = (prog.dailyTasksCompleted || 0) + 1;
  }
  saveProgress();
  const dailyBonus = isDaily ? 1500 : 0;
  addLikes(earned + dailyBonus);
  checkAchievements();
  saveSchoolProgress();

  // Instant shutter click + flash -> show post and results using stage cloning
  triggerCameraFlash(() => {
    showScoreScreen(assignment, result, earned + dailyBonus, { followers, likes });
    sfxScore(result.trendMultiplier);
  });
}

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
    });
  }

  // Auto-collapse assignment banner on very narrow screens to prevent overlapping the character
  window.addEventListener('resize', () => {
    const banner = $('assignment-banner');
    if (banner && !banner.classList.contains('hidden') && window.innerWidth < 768) {
      banner.classList.add('collapsed');
    }
  });
  // Trigger once on load
  if (window.innerWidth < 768) {
    const banner = $('assignment-banner');
    if (banner) banner.classList.add('collapsed');
  }

  $('stars-display').addEventListener('click', () => { sfxClick(); showShopModal(); });
  $('btn-runway').addEventListener('click', onRunwayClick);
  $('btn-achievements').addEventListener('click', () => { sfxClick(); showAchievementsModal(); });
  $('achievements-close').addEventListener('click', () => { sfxClick(); $('achievements-modal').classList.add('hidden'); });
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
  $('btn-new-day').addEventListener('click', () => {
    $('summary-modal').classList.add('hidden');
    school.day++;
    school.lessonIndex  = 0;
    school.lessonScores = [];
    school.dayFollowersGained = 0;
    buildDaySchedule();
    showAssignmentBanner();
    resetOutfit();
    saveSchoolProgress();
  });
  $('btn-exit-school').addEventListener('click', () => {
    exitSchoolMode();
    updateOutfitName();
  });

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
// INTRO DIALOGUE
// ────────────────────────────────────────────────────────────

const INTRO_STEPS = {
  ru: [
    { text: 'Привет! Я Ю На из Eclipse! 👋\nМы только что дебютировали как K-Pop группа!' },
    { text: 'Нас пока никто не знает... 😅\nНо мы будем публиковать посты каждый день и набирать подписчиков!' },
    { text: 'Мне нужна твоя помощь! 💖\nБудь моим стилистом — помогай подбирать крутые образы для публикаций!' },
    { text: 'Каждый пост — это шанс! 📱\nЗаписи, фотосессии, концерты... Чем лучше образ — тем больше фанатов!' },
    { text: 'Наша мечта — 1 000 000 подписчиков! 👑\nОт полных ноунеймов до K-Pop легенд!' },
    { text: 'Ну что, поможешь мне? 🔥💖\nДавай начнём нашу карьеру прямо сейчас!', last: true },
  ],
  en: [
    { text: "Hi! I'm Yu Na from Eclipse! 👋\nWe just debuted as a K-Pop group!" },
    { text: "Nobody knows us yet... 😅\nBut we're going to post every day and build our following!" },
    { text: "I need your help! 💖\nBe my stylist — help me pick the best outfits for our posts!" },
    { text: "Every post is a chance! 📱\nRecordings, photoshoots, concerts... Better looks = more fans!" },
    { text: "Our dream is 1,000,000 followers! 👑\nFrom total nobodies to K-Pop legends!" },
    { text: "So, will you help me? 🔥💖\nLet's start our career right now!", last: true },
  ],
};

let _introStep = 0;
let _introTyping = null;

function buildIntroCharacter() {
  const stage = $('intro-char-stage');
  stage.innerHTML = '';

  const shadowDiv = document.createElement('div');
  shadowDiv.className = 'character-shadow';
  stage.appendChild(shadowDiv);

  // Body (fills entire stage)
  const bodyImg = document.createElement('img');
  bodyImg.src = 'Items/body/body_new.png';
  bodyImg.alt = '';
  bodyImg.draggable = false;
  bodyImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;z-index:0;';
  stage.appendChild(bodyImg);

  // Default intro outfit: hair + shirt + jeans + sneakers
  const introOutfit = [
    { cat: 'hair',       id: 'blunt_bob_pink_headband'  },
    { cat: 'tops',       id: 'top_dress_new_1'  },
    { cat: 'bottoms',    id: 'bot_none'   },
    { cat: 'shoes',      id: 'shoe_none'      },
  ];

  // Сортируем по LAYER_ORDER перед рендером — так же как в основной игре
  const sorted = introOutfit
    .map(({ cat, id }) => {
      const item = findItem(cat, id);
      const layerZ = LAYER_ORDER.find(l => l.key === cat)?.zIndex ?? 1;
      const domOrder = LAYER_ORDER.findIndex(l => l.key === cat);
      return { item, layerZ, domOrder };
    })
    .filter(({ item }) => item && item.src && item.pos)
    .sort((a, b) => a.layerZ !== b.layerZ ? a.layerZ - b.layerZ : a.domOrder - b.domOrder);

  sorted.forEach(({ item, layerZ }) => {
    const { left, top, width } = item.pos;
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = '';
    img.draggable = false;
    img.style.cssText = `position:absolute;left:${left}%;top:${top}%;width:${width}%;height:auto;pointer-events:none;z-index:${layerZ};`;
    stage.appendChild(img);
  });
}

function showIntro() {
  _introStep = 0;
  const overlay = $('intro-overlay');
  overlay.classList.remove('hidden');
  buildIntroCharacter();
  renderIntroStep();
}

function renderIntroStep() {
  const steps = INTRO_STEPS[lang] || INTRO_STEPS.en;
  const step  = steps[_introStep];
  const total = steps.length;

  // Имя персонажа — без корейского, зависит от языка
  const badge = $('intro-name-badge');
  if (badge) badge.textContent = lang === 'ru' ? 'Ю На ✨' : 'Yu Na ✨';

  // Dots
  const dotsEl = $('intro-dots');
  dotsEl.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'intro-dot' + (i === _introStep ? ' active' : '');
    dotsEl.appendChild(d);
  }

  // Button label
  const btn = $('intro-next-btn');
  btn.textContent = step.last
    ? (lang === 'ru' ? '🎉 Начнём!' : '🎉 Let\'s go!')
    : (lang === 'ru' ? 'Далее ➤' : 'Next ➤');

  // Type text animation
  const textEl = $('intro-text');
  textEl.innerHTML = '';
  clearTimeout(_introTyping);

  const fullText = step.text;
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'intro-cursor';
  textEl.appendChild(cursor);

  function typeNext() {
    if (i < fullText.length) {
      const ch = fullText[i++];
      const tn = document.createTextNode(ch === '\n' ? '' : ch);
      if (ch === '\n') {
        textEl.insertBefore(document.createElement('br'), cursor);
      } else {
        textEl.insertBefore(tn, cursor);
      }
      _introTyping = setTimeout(typeNext, ch === '\n' ? 80 : 28);
    } else {
      cursor.remove();
    }
  }
  typeNext();

  // Button click
  btn.onclick = () => {
    clearTimeout(_introTyping);
    const steps2 = INTRO_STEPS[lang] || INTRO_STEPS.en;
    if (_introStep < steps2.length - 1) {
      _introStep++;
      renderIntroStep();
    } else {
      finishIntro();
    }
  };

  // Also allow clicking text area to skip typing / advance
  $('intro-text').onclick = () => {
    if (_introTyping) {
      // Skip typing — show full text at once
      clearTimeout(_introTyping);
      _introTyping = null;
      textEl.innerHTML = fullText.replace(/\n/g, '<br>');
    }
  };
}

function finishIntro() {
  localStorage.setItem('kpop_intro_done', '1');
  const overlay = $('intro-overlay');
  overlay.style.transition = 'opacity .5s ease';
  overlay.style.opacity = '0';
  overlay.addEventListener('transitionend', () => {
    overlay.remove();
    $('game').classList.remove('hidden');
    startSchoolMode();
    checkDailyLogin();
    // Small welcome reward
    addLikes(2000);
    showToast(lang === 'ru' ? '🎉 Добро пожаловать! +2 000 ❤️' : '🎉 Welcome! +2,000 ❤️');
  }, { once: true });
}

function applyLoadingTranslations() {
  const lt = $('loading-title');
  const lp = $('loading-text');
  if (lt) lt.textContent = t('loadingTitle');
  if (lp) lp.textContent = t('loadingText');
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
  const savedBgBlur = localStorage.getItem('dev_bg_blur') || '1.5';
  const savedBgDim = localStorage.getItem('dev_bg_dim') || '15';
  const savedAuraOpacity = localStorage.getItem('dev_aura-opacity') || '70';
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
    applyBgBlur('1.5');
    applyBgDim('15');
    applyAuraOpacity('70');
    applyAuraColor('warm');
    
    charSlider.value = '1.15';
    charVal.textContent = '1.15x';
    
    charYSlider.value = '30';
    charYVal.textContent = '30px';

    bgSlider.value = '0.95';
    bgVal.textContent = '0.95x';

    bgYSlider.value = '0';
    bgYVal.textContent = '0px';

    bgBlurSlider.value = '1.5';
    bgBlurVal.textContent = '1.5px';

    bgDimSlider.value = '15';
    bgDimVal.textContent = '15%';

    auraOpacitySlider.value = '70';
    auraOpacityVal.textContent = '70%';

    auraColorSelect.value = 'warm';
    
    localStorage.setItem('dev_char_scale', '1.15');
    localStorage.setItem('dev_char_y', '30');
    localStorage.setItem('dev_bg_scale', '0.95');
    localStorage.setItem('dev_bg_y', '0');
    localStorage.setItem('dev_bg_blur', '1.5');
    localStorage.setItem('dev_bg_dim', '15');
    localStorage.setItem('dev_aura-opacity', '70');
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

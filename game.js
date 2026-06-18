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
    loadingTitle:  'K-Pop Dress Up',
    loadingText:   'Preparing your idol debut...',
    // Header
    gameTitle:     '✨ K-Pop Dress Up ✨',
    btnRandom:     '🎲 Random',
    btnReset:      '🔄 Reset',
    btnSave:       '💾 Save',
    btnSaved:      '✅ Saved!',
    btnSchool:     '🏫 School',
    btnSchoolOn:   '🏫 School ON',
    btnRunway:     '🌟 Runway!',
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
    bannerDayLesson: 'Day {d} · Lesson {l}/5',
    // Score screen
    scoreResults:    '{title} Results',
    scoreRequired:   'Required style: {tags} · Matched {m}/{r}',
    scoreTagMatch:   'Tag Match',
    scoreComplete:   'Completeness',
    scoreJudgeBonus: 'Judge Bonus',
    scoreLessonPts:  'Lesson Score',
    btnNextClass:    '➡ Next Class',
    btnSeeResults:   '🌟 Day Results!',
    // Summary
    summaryTitle:    'Day {d} Complete!',
    summaryDayScore: 'Day Score: {s} / 500 pts',
    summaryRankLine: '{rank}  ·  Total: {pts} pts',
    summaryNextRank: 'Next rank: {name} at {at} pts',
    summaryMaxRank:  '👑 Maximum rank achieved! Legendary idol!',
    btnNewDay:       '☀️ Next School Day',
    btnExitSchool:   '🎨 Free Style Mode',
    // Ranks
    rankTrainee:     '🌱 Trainee',
    rankDebut:       '⭐ Debut',
    rankIdol:        '🌟 Idol',
    rankStar:        '👑 K-Pop Star',
    // Outfit names (free mode)
    adj: ['Sparkly','Dreamy','Fierce','Sweet','Chic','Bold','Pastel','Glam','Iconic','Fresh'],
    noun:['Idol','Star','Diva','Queen','Vision','Dream','Look','Vibe','Moment','Era'],
  },
  ru: {
    // Loading
    loadingTitle:  'k pop одевалка',
    loadingText:   'Готовим твой дебют идола...',
    // Header
    gameTitle:     '✨ k pop одевалка ✨',
    btnRandom:     '🎲 Случайно',
    btnReset:      '🔄 Сброс',
    btnSave:       '💾 Сохранить',
    btnSaved:      '✅ Сохранено!',
    btnSchool:     '🏫 Учёба',
    btnSchoolOn:   '🏫 Учёба ВКЛ',
    btnRunway:     '🌟 На подиум!',
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
    bannerDayLesson: 'День {d} · Урок {l}/5',
    // Score screen
    scoreResults:    'Итоги: {title}',
    scoreRequired:   'Стиль задания: {tags} · Совпало {m}/{r}',
    scoreTagMatch:   'Стиль образа',
    scoreComplete:   'Полнота образа',
    scoreJudgeBonus: 'Бонус судей',
    scoreLessonPts:  'Очки за урок',
    btnNextClass:    '➡ Следующий урок',
    btnSeeResults:   '🌟 Итоги дня!',
    // Summary
    summaryTitle:    'День {d} завершён!',
    summaryDayScore: 'Очки за день: {s} / 500',
    summaryRankLine: '{rank}  ·  Всего: {pts} оч.',
    summaryNextRank: 'Следующий ранг: {name} с {at} оч.',
    summaryMaxRank:  '👑 Максимальный ранг! Легендарный идол!',
    btnNewDay:       '☀️ Следующий день',
    btnExitSchool:   '🎨 Свободный стиль',
    // Ranks
    rankTrainee:     '🌱 Стажёр',
    rankDebut:       '⭐ Дебют',
    rankIdol:        '🌟 Идол',
    rankStar:        '👑 K-Pop Звезда',
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

// Пакеты звёзд. id должны совпадать с продуктами в консоли Яндекс Игр.
const STAR_PACKAGES = [
  { id: 'stars_30',  stars:  30, bonus: 0,   icon: '⭐' },
  { id: 'stars_150', stars: 150, bonus: 0,   icon: '🌟' },
  { id: 'stars_300', stars: 300, bonus: 30,  icon: '💫', popular: true },
  { id: 'stars_600', stars: 600, bonus: 100, icon: '✨' },
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
      if (pkg) addStars(pkg.stars + pkg.bonus);
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
  const total = pkg.stars + pkg.bonus;
  addStars(total);
  buildItemsGrid(activeCategory);
  spawnSparkles(14);
  sfxUnlock();
  const msg = pkg.bonus > 0
    ? (lang === 'ru' ? `+${pkg.stars} ⭐ и +${pkg.bonus} бонус!` : `+${pkg.stars} ⭐ + ${pkg.bonus} bonus!`)
    : `+${pkg.stars} ⭐`;
  showToast(msg);
}

function showShopModal() {
  const modal = $('shop-modal');
  const container = $('shop-packages');
  container.innerHTML = '';

  const titleEl = $('shop-title');
  const subtitleEl = $('shop-subtitle');
  if (titleEl) titleEl.textContent = lang === 'ru' ? 'Магазин звёзд' : 'Star Shop';
  if (subtitleEl) subtitleEl.textContent = lang === 'ru' ? 'Покупай звёзды и открывай новые вещи!' : 'Buy stars and unlock new items!';

  // ── Кнопка "10 звёзд за рекламу" (во всю ширину, сверху) ──
  const adCard = document.createElement('div');
  adCard.className = 'shop-ad-card';
  adCard.innerHTML = `
    <span class="shop-ad-icon">📺</span>
    <span class="shop-ad-text">
      <b>+10 ⭐</b> — ${lang === 'ru' ? 'за просмотр рекламы' : 'watch an ad'}
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
            if (_rewarded) { addStars(10); spawnSparkles(8); showToast('+10 ⭐'); }
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
      addStars(10); spawnSparkles(8); showToast('+10 ⭐ (dev)');
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
      ? `<div class="shop-card-bonus">+${pkg.bonus} ${lang === 'ru' ? 'бонус!' : 'bonus!'}</div>`
      : `<div class="shop-card-bonus"></div>`;

    const badgeHtml = pkg.popular
      ? `<div class="shop-card-badge">${lang === 'ru' ? '🔥 Хит' : '🔥 Popular'}</div>`
      : '';

    card.innerHTML = `
      ${badgeHtml}
      <div class="shop-card-icon">${pkg.icon}</div>
      <div class="shop-card-stars">${pkg.stars + pkg.bonus} ⭐</div>
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
    { id:'hair_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
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
    { id:'top_none',         name:'None',             name_ru:'Нет',               src:null, pos:null, tags:[] },
    { id:'top_dress_new_1',  name:'K-Pop Dress',      name_ru:'K-Pop платье',      src:'Items/Dress/dress_new_1.png',
      pos:{left:0,top:0,width:100},   tags:['kpop','cute','pastel','formal','elegant'],  sub:'dresses' },
  ],

  // ── BOTTOMS ───────────────────────────────────────────────
  bottoms: [
    { id:'bot_none',   name:'None',            name_ru:'Нет',              src:null, pos:null, tags:[] },
  ],

  // ── SHOES ─────────────────────────────────────────────────
  shoes: [
    { id:'shoe_none',     name:'None',             name_ru:'Нет',               src:null, pos:null, tags:[] },
  ],

  // ── ACCESSORIES ───────────────────────────────────────────
  socks: [
    { id:'sock_none',     name:'None',             name_ru:'Нет',               src:null, pos:null, tags:[] },
  ],

  accessories: [
    { id:'acc_none',      name:'None',           name_ru:'Нет',               src:null, pos:null, tags:[] },
  ],
};

// ────────────────────────────────────────────────────────────
// PROGRESSION — ITEMS & COSTS
// ────────────────────────────────────────────────────────────

const FREE_ITEMS = new Set([
  'hair_none',
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
  'spiky_pixie_teal_blue': 30
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
  stars: 120, starsEarned: 120,
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

// ────────────────────────────────────────────────────────────
// PROGRESSION — STARS
// ────────────────────────────────────────────────────────────

function addStars(n) {
  prog.stars      += n;
  prog.starsEarned = (prog.starsEarned || 0) + n;
  saveProgress();
  updateStarsDisplay();
  const gain = document.createElement('div');
  gain.className = 'stars-gain-toast';
  gain.textContent = '+' + n + ' ⭐';
  document.body.appendChild(gain);
  setTimeout(() => gain.remove(), 1800);
}

function updateStarsDisplay() {
  const el = $('stars-count');
  if (el) el.textContent = prog.stars;
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

  const cost = getDailyDealCost(itemId);
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
  const origCost = itemCost(itemId);
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
    const canBuy = prog.stars >= cost;
    const shopHint = !canBuy
      ? `<button class="buy-bar-gem-hint" id="buy-bar-shop">
           💎 ${lang === 'ru' ? 'Купить звёзды' : 'Buy stars'}
         </button>`
      : '';
    bar.innerHTML = `
      <div class="buy-bar-name">${iName(item)}${isDeal ? ' 🔥' : ''}</div>
      ${isDeal ? `<div class="buy-bar-deal">${origCost}⭐ → <b>${cost}⭐</b></div>` : ''}
      <div class="buy-bar-row">
        <button class="buy-bar-btn buy-confirm${canBuy ? '' : ' cant-buy'}" id="buy-bar-yes">
          ${canBuy ? (lang === 'ru' ? `Купить ${cost}⭐` : `Buy ${cost}⭐`) : (lang === 'ru' ? `Нужно ${cost}⭐` : `Need ${cost}⭐`)}
        </button>
        <button class="buy-bar-btn buy-cancel" id="buy-bar-no">✕</button>
      </div>
      ${shopHint}`;
    bar.classList.remove('hidden');
    document.getElementById('buy-bar-yes').onclick = e => {
      e.stopPropagation();
      if (!canBuy) return;
      _buyPending = null; hideBuyBar();
      prog.stars -= cost;
      prog.unlocked.push(itemId);
      saveProgress(); updateStarsDisplay();
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
          ? '💡 Нажми <b>⭐</b> чтобы купить звёзды<br>или получи вещи <b>бесплатно</b> за рекламу!'
          : '💡 Tap <b>⭐</b> to buy stars<br>or get items <b>free</b> by watching ads!')
      : (lang === 'ru'
          ? '💡 Нажми <b>⭐</b> чтобы купить звёзды!'
          : '💡 Tap <b>⭐</b> to buy more stars!');
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
  const reward = 10 + Math.min((prog.loginStreak - 1) * 3, 15);
  addStars(reward);
  checkAchievements();
  showDailyLoginPopup(reward);
}

function showDailyLoginPopup(reward) {
  const popup = $('daily-login-popup');
  if (!popup) return;
  const titleEl = popup.querySelector('.daily-title');
  if (titleEl) titleEl.textContent = lang === 'ru' ? '🌟 Ежедневный бонус!' : '🌟 Daily Bonus!';
  const collectBtn = $('daily-collect-btn');
  if (collectBtn) collectBtn.textContent = lang === 'ru' ? '✨ Забрать!' : '✨ Collect!';
  $('daily-stars-reward').textContent = '+' + reward + ' ⭐';
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
  { id:'first_look',    icon:'👗', reward:15,
    name:'First Look',         name_ru:'Первый образ',
    desc:'Wear something in every slot',      desc_ru:'Надень что-нибудь в каждую категорию',
    check:() => Object.keys(clothes).every(cat => equipped[cat] !== clothes[cat][0].id) },
  { id:'first_unlock',  icon:'🛒', reward:10,
    name:'First Purchase',     name_ru:'Первая покупка',
    desc:'Unlock your first item',            desc_ru:'Купи первую вещь',
    check:() => prog.unlocked.length >= 1 },
  { id:'school_start',  icon:'📚', reward:20,
    name:"School's In",        name_ru:'Первый звонок',
    desc:'Complete your first lesson',        desc_ru:'Пройди первый урок',
    check:() => prog.totalLessons >= 1 },
  { id:'runway_debut',  icon:'🌟', reward:20,
    name:'Runway Debut',       name_ru:'Дебют на подиуме',
    desc:'Walk the runway for the first time',desc_ru:'Выйди на подиум в первый раз',
    check:() => (prog.runwayCount || 0) >= 1 },

  // ── Оценки ───────────────────────────────────────────────
  { id:'grade_b',       icon:'📝', reward:20,
    name:'Honor Roll',         name_ru:'Хорошистка',
    desc:'Score 60+ in a lesson',             desc_ru:'Набери 60+ за урок',
    check:() => prog.highScore >= 60 },
  { id:'grade_a',       icon:'⭐', reward:30,
    name:'A-Student',          name_ru:'Отличница',
    desc:'Score 80+ in a lesson',             desc_ru:'Набери 80+ за урок',
    check:() => prog.highScore >= 80 },
  { id:'perfect',       icon:'💯', reward:50,
    name:'Perfection!',        name_ru:'Совершенство!',
    desc:'Score 100 in a lesson',             desc_ru:'Набери 100 за урок',
    check:() => prog.highScore >= 100 },
  { id:'perfect_3',     icon:'🏅', reward:60,
    name:'Triple Perfect',     name_ru:'Три идеала',
    desc:'Score 100 three times',             desc_ru:'Набери 100 за урок три раза',
    check:() => (prog.perfectCount || 0) >= 3 },

  // ── Уроки ────────────────────────────────────────────────
  { id:'fashionista',   icon:'👑', reward:40,
    name:'Fashionista',        name_ru:'Фэшионистка',
    desc:'Complete 5 lessons',                desc_ru:'Пройди 5 уроков',
    check:() => prog.totalLessons >= 5 },
  { id:'lessons_10',    icon:'📖', reward:50,
    name:'Dedicated Student',  name_ru:'Прилежная студентка',
    desc:'Complete 10 lessons',               desc_ru:'Пройди 10 уроков',
    check:() => prog.totalLessons >= 10 },
  { id:'lessons_25',    icon:'🎓', reward:80,
    name:'Class President',    name_ru:'Президент класса',
    desc:'Complete 25 lessons',               desc_ru:'Пройди 25 уроков',
    check:() => prog.totalLessons >= 25 },
  { id:'lessons_50',    icon:'🏆', reward:80,
    name:'School Legend',      name_ru:'Легенда школы',
    desc:'Complete 50 lessons',               desc_ru:'Пройди 50 уроков',
    check:() => prog.totalLessons >= 50 },
  { id:'lessons_100',   icon:'👸', reward:120,
    name:'K-Pop Icon',         name_ru:'K-Pop Икона',
    desc:'Complete 100 lessons',              desc_ru:'Пройди 100 уроков',
    check:() => prog.totalLessons >= 100 },

  // ── Подиум ───────────────────────────────────────────────
  { id:'runway_5',      icon:'✨', reward:40,
    name:'Runway Regular',     name_ru:'Завсегдатай подиума',
    desc:'Walk the runway 5 times',           desc_ru:'Выйди на подиум 5 раз',
    check:() => (prog.runwayCount || 0) >= 5 },
  { id:'runway_10',     icon:'💫', reward:60,
    name:'Catwalk Queen',      name_ru:'Королева подиума',
    desc:'Walk the runway 10 times',          desc_ru:'Выйди на подиум 10 раз',
    check:() => (prog.runwayCount || 0) >= 10 },
  { id:'runway_25',     icon:'🦋', reward:60,
    name:'Supermodel',         name_ru:'Супермодель',
    desc:'Walk the runway 25 times',          desc_ru:'Выйди на подиум 25 раз',
    check:() => (prog.runwayCount || 0) >= 25 },

  // ── Гардероб ─────────────────────────────────────────────
  { id:'shopper',       icon:'🛍️', reward:35,
    name:'Shopaholic',         name_ru:'Шопоголик',
    desc:'Unlock 5 items',                    desc_ru:'Купи 5 вещей',
    check:() => prog.unlocked.length >= 5 },
  { id:'wardrobe_10',   icon:'👚', reward:50,
    name:'Fashion Lover',      name_ru:'Любительница моды',
    desc:'Unlock 10 items',                   desc_ru:'Купи 10 вещей',
    check:() => prog.unlocked.length >= 10 },
  { id:'wardrobe_20',   icon:'🧥', reward:55,
    name:'Style Expert',       name_ru:'Эксперт стиля',
    desc:'Unlock 20 items',                   desc_ru:'Купи 20 вещей',
    check:() => prog.unlocked.length >= 20 },
  { id:'wardrobe_35',   icon:'💎', reward:70,
    name:'Closet Legend',      name_ru:'Легенда гардероба',
    desc:'Unlock 35 items',                   desc_ru:'Купи 35 вещей',
    check:() => prog.unlocked.length >= 35 },

  // ── Серия дней ───────────────────────────────────────────
  { id:'streak_3',      icon:'🔥', reward:30,
    name:'3-Day Streak',       name_ru:'3 дня подряд',
    desc:'Play 3 days in a row',              desc_ru:'Заходи 3 дня подряд',
    check:() => prog.loginStreak >= 3 },
  { id:'streak_7',      icon:'🌟', reward:60,
    name:'Week Warrior',       name_ru:'Неделя без пропусков',
    desc:'Play 7 days in a row',              desc_ru:'Заходи 7 дней подряд',
    check:() => prog.loginStreak >= 7 },
  { id:'streak_14',     icon:'💖', reward:60,
    name:'Fortnight Fan',      name_ru:'Две недели подряд',
    desc:'Play 14 days in a row',             desc_ru:'Заходи 14 дней подряд',
    check:() => prog.loginStreak >= 14 },
  { id:'streak_30',     icon:'👑', reward:100,
    name:'Idol Dedication',    name_ru:'Преданность идола',
    desc:'Play 30 days in a row',             desc_ru:'Заходи 30 дней подряд',
    check:() => prog.loginStreak >= 30 },

  // ── Ежедневные задания ───────────────────────────────────
  { id:'daily_done',    icon:'📅', reward:20,
    name:'Daily Devotee',      name_ru:'Первое задание',
    desc:'Complete a daily challenge',        desc_ru:'Выполни первое ежедневное задание',
    check:() => (prog.dailyTasksCompleted || 0) >= 1 },
  { id:'daily_5',       icon:'📆', reward:40,
    name:'Routine Builder',    name_ru:'Привычка — вторая натура',
    desc:'Complete 5 daily challenges',       desc_ru:'Выполни 5 ежедневных заданий',
    check:() => (prog.dailyTasksCompleted || 0) >= 5 },
  { id:'daily_10',      icon:'🗓️', reward:60,
    name:'Daily Champion',     name_ru:'Чемпион дня',
    desc:'Complete 10 daily challenges',      desc_ru:'Выполни 10 ежедневных заданий',
    check:() => (prog.dailyTasksCompleted || 0) >= 10 },
  { id:'daily_30',      icon:'🏅', reward:100,
    name:'Monthly Master',     name_ru:'Мастер месяца',
    desc:'Complete 30 daily challenges',      desc_ru:'Выполни 30 ежедневных заданий',
    check:() => (prog.dailyTasksCompleted || 0) >= 30 },

  // ── Звёзды ───────────────────────────────────────────────
  { id:'star200',       icon:'💫', reward:25,
    name:'Star Collector',     name_ru:'Коллекционер звёзд',
    desc:'Earn 200 stars total',              desc_ru:'Заработай 200 звёзд суммарно',
    check:() => (prog.starsEarned || 0) >= 200 },
  { id:'star500',       icon:'🌠', reward:50,
    name:'Rising Star',        name_ru:'Восходящая звезда',
    desc:'Earn 500 stars total',              desc_ru:'Заработай 500 звёзд суммарно',
    check:() => (prog.starsEarned || 0) >= 500 },
  { id:'star1000',      icon:'⭐', reward:60,
    name:'Superstar',          name_ru:'Суперзвезда',
    desc:'Earn 1000 stars total',             desc_ru:'Заработай 1000 звёзд суммарно',
    check:() => (prog.starsEarned || 0) >= 1000 },
  { id:'star2500',      icon:'🌟', reward:0,
    name:'K-Pop Legend',       name_ru:'Легенда K-Pop',
    desc:'Earn 2500 stars total',             desc_ru:'Заработай 2500 звёзд суммарно',
    check:() => (prog.starsEarned || 0) >= 2500 },
];

function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (prog.achievements[ach.id] || !ach.check()) return;
    prog.achievements[ach.id] = true;
    saveProgress();
    if (ach.reward > 0) addStars(ach.reward);
    showAchievementToast(ach);
  });
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
    ${ach.reward > 0 ? `<div class="ach-reward">+${ach.reward} ⭐</div>` : ''}</div>`;
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
      ${ach.reward > 0 ? `<div class="ach-row-reward">${done ? '✓' : '+' + ach.reward} ⭐</div>` : ''}`;
    list.appendChild(row);
  });
  modal.classList.remove('hidden');
}

// ────────────────────────────────────────────────────────────
// LAYER ORDER & CATEGORIES
// ────────────────────────────────────────────────────────────

const LAYER_ORDER = [
  { key:'body',        zIndex:0 },
  { key:'shoes',       zIndex:1 },
  { key:'socks',       zIndex:2 },
  { key:'bottoms',     zIndex:3 },
  { key:'tops',        zIndex:4 },
  { key:'accessories', zIndex:5 },
  { key:'hair',        zIndex:6 },
];

function getCategories() {
  return [
    { key:'hair',        label:t('catHair'),    icon:'💇' },
    { key:'tops',        label:t('catTops'),    icon:'👕' },
    { key:'bottoms',     label:t('catBottoms'), icon:'👖' },
    { key:'shoes',       label:t('catShoes'),   icon:'👟' },
    { key:'socks',       label:t('catSocks'),   icon:'🧦' },
    { key:'accessories', label:t('catAcc'),     icon:'✨' },
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

const ASSIGNMENTS = [
  { id:'music_class',   judge:'kim',
    title:'🎵 Music Class',          title_ru:'🎵 Урок музыки',
    desc: 'Teacher Kim wants idol energy on stage!',
    desc_ru:'Учитель Ким хочет энергию идола на сцене!',
    requiredTags:['kpop','bold'],    bonusTags:['pastel','cute'] },
  { id:'pe_class',      judge:'lee',
    title:'🏃 PE Class',             title_ru:'🏃 Физкультура',
    desc: 'Coach Lee needs you in sporty gear! Move freely!',
    desc_ru:'Тренер Ли хочет спортивный образ. Двигайся свободно!',
    requiredTags:['sporty','casual'],bonusTags:['kpop'] },
  { id:'assembly',      judge:'park',
    title:'📋 School Assembly',      title_ru:'📋 Торжественная линейка',
    desc: 'Mrs. Park demands proper school attire. Look sharp!',
    desc_ru:'Мисс Пак требует настоящую школьную форму. Выгляди безупречно!',
    requiredTags:['school','formal'],bonusTags:['elegant'] },
  { id:'photoshoot',    judge:'kim',
    title:'📸 Yearbook Photoshoot',  title_ru:'📸 Фотосессия для ежегодника',
    desc: 'Your photo will last forever — show your best self!',
    desc_ru:'Эта фотография навсегда — покажи свой лучший образ!',
    requiredTags:['kpop','cute'],    bonusTags:['pastel','elegant'] },
  { id:'fan_meeting',   judge:'kim',
    title:'💜 Fan Meeting',           title_ru:'💜 Встреча с фанатами',
    desc: 'Your fans are here! Dress to impress and spread love!',
    desc_ru:'Твои фанаты ждут! Одевайся чтобы покорить их сердца!',
    requiredTags:['kpop','elegant'], bonusTags:['cute','bold'] },
  { id:'dance_practice',judge:'lee',
    title:'💃 Dance Practice',        title_ru:'💃 Репетиция танца',
    desc: 'Coach Lee wants style AND movement. Dance ready!',
    desc_ru:'Тренер Ли хочет стиль И свободу движений. Готова танцевать?',
    requiredTags:['sporty','kpop'],  bonusTags:['bold','casual'] },
  { id:'graduation',    judge:'park',
    title:'🎓 Graduation Ceremony',  title_ru:'🎓 Церемония выпуска',
    desc: 'A moment of pride! Mrs. Park expects perfection.',
    desc_ru:'Момент гордости! Мисс Пак ожидает совершенства.',
    requiredTags:['formal','elegant'],bonusTags:['school','cute'] },
  { id:'stage_perf',    judge:'kim',
    title:'🎤 Stage Performance',    title_ru:'🎤 Выступление на сцене',
    desc: 'The spotlight is yours! Teacher Kim is watching!',
    desc_ru:'Прожектор светит на тебя! Учитель Ким наблюдает!',
    requiredTags:['kpop','bold'],    bonusTags:['cute','gothic'] },
  { id:'lunch_break',   judge:'lee',
    title:'☕ Lunch Break',           title_ru:'☕ Перемена на обед',
    desc: 'Relaxed vibes today — comfort is key, but stay cute!',
    desc_ru:'Расслабленный день — комфорт важен, но оставайся милашкой!',
    requiredTags:['casual','cute'],  bonusTags:['kpop','school'] },
  { id:'art_class',     judge:'kim',
    title:'🎨 Art Class',            title_ru:'🎨 Урок рисования',
    desc: 'Express yourself! Teacher Kim loves creative outfits!',
    desc_ru:'Выражай себя! Учитель Ким обожает творческие образы!',
    requiredTags:['cute','bold'],    bonusTags:['gothic','pastel'] },
  { id:'library',       judge:'park',
    title:'📚 Library Study',        title_ru:'📚 Занятия в библиотеке',
    desc: 'Quiet and studious. Mrs. Park expects respectful dress.',
    desc_ru:'Тихо и усердно. Мисс Пак ждёт скромный наряд.',
    requiredTags:['school','casual'],bonusTags:['elegant','formal'] },
  { id:'festival',      judge:'kim',
    title:'🎉 School Festival',      title_ru:'🎉 Школьный фестиваль',
    desc: 'The biggest event of the year — make it iconic!',
    desc_ru:'Главное событие года — сделай образ культовым!',
    requiredTags:['kpop','bold'],    bonusTags:['cute','pastel','elegant'] },
];

function assignmentTitle(a) { return lang === 'ru' ? a.title_ru : a.title; }
function assignmentDesc(a)  { return lang === 'ru' ? a.desc_ru  : a.desc;  }

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — JUDGES
// ────────────────────────────────────────────────────────────

const JUDGES = {
  park: {
    name:'Mrs. Park',   name_ru:'Мисс Пак',
    title:'Elegance Queen', title_ru:'Королева Элегантности',
    emoji:'👩‍🏫',
    favoredTags:  ['school','formal','elegant','pastel'],
    dislikedTags: ['gothic','bold'],
    comments: {
      excellent: [
        'Simply impeccable, my dear! 💫',
        'Outstanding! This is what proper dressing looks like!',
        'Excellent! You would make any school proud!',
      ],
      good: [
        'Acceptable. A little more formality next time, perhaps.',
        'Not bad! But we can always be more refined. A bit more effort!',
        'I see the effort! Keep it elegant and neat. Keep improving!',
      ],
      poor: [
        'Absolutely not! This is a school, not a pop concert!',
        'I expected better. Please dress properly next time.',
        'Disappointing. Show more respect for the school with your attire.',
      ],
    },
    comments_ru: {
      excellent: [
        'Просто безупречно, дорогая! 💫',
        'Великолепно! Вот как нужно одеваться!',
        'Отлично! Любая школа гордилась бы тобой!',
      ],
      good: [
        'Приемлемо. В следующий раз — чуть больше строгости, пожалуйста.',
        'Неплохо! Но можно быть более утончённой. Чуть больше усилий!',
        'Вижу старание! Держи стиль элегантным и аккуратным. Продолжай расти!',
      ],
      poor: [
        'Недопустимо! Это школа, а не концерт!',
        'Я ожидала большего. Оденься прилично в следующий раз.',
        'Я разочарована. Уважай школу своим внешним видом.',
      ],
    },
  },
  kim: {
    name:'Teacher Kim', name_ru:'Учитель Ким',
    title:'K-Pop Visionary', title_ru:'K-Pop Провидец',
    emoji:'🎤',
    favoredTags:  ['kpop','bold','cute','pastel'],
    dislikedTags: ['formal','casual'],
    comments: {
      excellent: [
        'OMOOOO! Total idol energy! You were BORN for this! ⭐',
        'You are an idol! I see a future K-Pop star standing before me!',
        'INCREDIBLE!! This is the look the whole world needs to see! 🌟',
      ],
      good: [
        'Good vibes! Just push it a little further — fight for it!',
        'I feel the K-Pop spirit brewing! Keep experimenting!',
        'Nice style! Add more boldness next time. Go bolder!',
      ],
      poor: [
        'Where is it... The idol energy? Where did it go?!',
        'This looks too plain for a future star. Be bold! More flair!',
        'Try again! A K-Pop idol would never step on stage like this!',
      ],
    },
    comments_ru: {
      excellent: [
        'ОМООО! Настоящая энергия идола! Ты рождена для этого! ⭐',
        'Ты идол! Я вижу перед собой будущую K-Pop звезду!',
        'НЕВЕРОЯТНО!! Весь мир должен увидеть этот образ! 🌟',
      ],
      good: [
        'Хорошие вибрации! Просто добавь чуть больше — борись за это!',
        'Чувствую K-Pop дух! Продолжай экспериментировать!',
        'Классный стиль! В следующий раз — больше смелости. Будь смелее!',
      ],
      poor: [
        'Где же она... Энергия идола? Куда она пропала?!',
        'Это слишком просто для будущей звезды. Будь смелее! Больше блеска!',
        'Заново! Ни один K-Pop идол не вышел бы на сцену в этом!',
      ],
    },
  },
  lee: {
    name:'Coach Lee',  name_ru:'Тренер Ли',
    title:'Athletic Champion', title_ru:'Спортивный Чемпион',
    emoji:'🏃',
    favoredTags:  ['sporty','casual','kpop'],
    dislikedTags: ['elegant','formal','gothic'],
    comments: {
      excellent: [
        'LETS GO! Perfect athletic spirit! Champion! 🏆',
        'Now THAT is a winning look! Ready to run a marathon!',
        'Energy! Power! Style! You have it ALL today! Amazing!',
      ],
      good: [
        'Decent! But can you actually run in that?',
        'Good effort! I want to see more sporty energy next time!',
        'Nice! Keep that active spirit alive! Keep going! 💪',
      ],
      poor: [
        'Seriously?! How are you supposed to run in that?!',
        'This is PE class! Where are the practical clothes?!',
        'Come on... those shoes worry me. You need sneakers!',
      ],
    },
    comments_ru: {
      excellent: [
        'ДАВАЙ! Идеальный спортивный дух! Чемпион! 🏆',
        'ВОТ это победный образ! Готова бежать марафон!',
        'Энергия! Сила! Стиль! У тебя есть ВСЁ сегодня! Потрясающе!',
      ],
      good: [
        'Неплохо! Но ты точно сможешь в этом бегать?',
        'Хороший результат! В следующий раз — больше спортивной энергии!',
        'Молодец! Сохраняй этот активный дух! Продолжай! 💪',
      ],
      poor: [
        'Серьёзно?! Как ты вообще собираешься бегать в этом?!',
        'Это урок физкультуры! Где практичная одежда?!',
        'Ну как так... эта обувь меня беспокоит. Нужны кроссовки!',
      ],
    },
  },
};

function judgeName(jKey)  { const j = JUDGES[jKey]; return lang === 'ru' ? j.name_ru : j.name; }
function judgeTitle(jKey) { const j = JUDGES[jKey]; return lang === 'ru' ? j.title_ru : j.title; }

function pickJudgeComment(jKey, score) {
  const j    = JUDGES[jKey];
  const pool = lang === 'ru' ? j.comments_ru : j.comments;
  const arr  = score >= 8 ? pool.excellent : score >= 5 ? pool.good : pool.poor;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ────────────────────────────────────────────────────────────
// PROGRESSION RANKS
// ────────────────────────────────────────────────────────────

const RANKS = [
  { key:'trainee', minScore:0,    nextAt:300,  nameKey:'rankTrainee', emoji:'🌱' },
  { key:'debut',   minScore:300,  nextAt:700,  nameKey:'rankDebut',   emoji:'⭐' },
  { key:'idol',    minScore:700,  nextAt:1400, nameKey:'rankIdol',    emoji:'🌟' },
  { key:'star',    minScore:1400, nextAt:null, nameKey:'rankStar',    emoji:'👑' },
];

function getRank(total) {
  for (let i = RANKS.length - 1; i >= 0; i--)
    if (total >= RANKS[i].minScore) return RANKS[i];
  return RANKS[0];
}

// ────────────────────────────────────────────────────────────
// GAME STATE
// ────────────────────────────────────────────────────────────

const equipped = { hair:'hair_none', tops:'top_dress_new_1', bottoms:'bot_none', shoes:'shoe_none', socks:'sock_none', accessories:'acc_none' };
let activeCategory    = 'hair';
// Подкатегории для категорий с разделением
const CATEGORY_SUBS = {
  tops: [
    { key:'blouses', icon:'👚', label:'Blouses', label_ru:'Блузки'  },
    { key:'dresses', icon:'👗', label:'Dresses', label_ru:'Платья'  },
  ],
  bottoms: [
    { key:'pants',   icon:'👖', label:'Pants',   label_ru:'Брюки'  },
    { key:'skirts',  icon:'🎀', label:'Skirts',  label_ru:'Юбки'   },
  ],
};

// Активная подкатегория для каждой категории
const activeSub = { tops:'blouses', bottoms:'pants' };

function subLabel(sub) { return lang === 'ru' ? sub.label_ru : sub.label; }

const school = {
  active:       false,
  day:          1,
  lessonIndex:  0,
  schedule:     [],
  lessonScores: [],
  totalScore:   0,
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
function sfxScore(score) {
  if (score >= 80) sfxAchievement();
  else if (score >= 50) {
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
  if (btn) btn.textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) { if (_actx) _actx.resume(); actx(); startBGM(); sfxClick(); }
  else { pauseBGM(); stopBGM(); }
}

function initAudio() {
  soundOn = localStorage.getItem('kpop_sound') !== '0';
  const btn = $('btn-sound');
  if (btn) btn.textContent = soundOn ? '🔊' : '🔇';
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

  // Panel labels
  document.querySelector('#category-panel .panel-label').textContent = t('categoryLabel');
  $('items-panel-title').textContent = t('itemsLabel');

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
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat.key === activeCategory ? ' active' : '');
    btn.dataset.key = cat.key;
    btn.innerHTML = `<span class="cat-icon">${cat.icon}</span>${cat.label}`;
    btn.addEventListener('click', () => selectCategory(cat.key));
    list.appendChild(btn);
  });
}

function selectCategory(key) {
  activeCategory = key;
  document.querySelectorAll('.cat-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.key === key)
  );
  const cat = getCategories().find(c => c.key === key);
  $('items-panel-title').textContent = cat ? `${cat.icon} ${cat.label}` : t('itemsLabel');
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
    btn.textContent = sub.icon + ' ' + subLabel(sub);
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
    const cost   = isDeal ? getDailyDealCost(item.id) : itemCost(item.id);

    const card = document.createElement('div');
    card.className = 'item-card'
      + (equipped[category] === item.id ? ' selected' : '')
      + (locked ? ' locked' : '');
    card.dataset.id = item.id;

    const thumbHTML = item.src
      ? `<img src="${item.src}" alt="${iName(item)}" draggable="false"${item.filter ? ` style="filter:${item.filter}"` : ''}>`
      : `<div class="thumb-none">✕</div>`;

    const isAdItem     = AD_ITEMS.has(item.id);
    const isReviewItem = item.id === REVIEW_ITEM;
    const badge = isDeal
      ? `<div class="item-deal-badge">🔥 ${cost}⭐</div>`
      : locked && isAdItem
        ? `<div class="item-cost-badge item-ad-badge">📺 ${lang === 'ru' ? 'Реклама' : 'Ad'}</div>`
        : locked && isReviewItem
          ? `<div class="item-cost-badge item-review-badge">✍️ ${lang === 'ru' ? 'Отзыв' : 'Review'}</div>`
          : locked && cost > 0
            ? `<div class="item-cost-badge">${cost}⭐</div>`
            : '';

    card.innerHTML = `${thumbHTML}${badge}<span class="item-name">${iName(item)}</span>`;
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
  spawnSparkles(12);
  sfxEquip();
  updateOutfitName();
  document.querySelectorAll('#items-grid .item-card').forEach(card =>
    card.classList.toggle('selected', card.dataset.id === itemId)
  );
  saveOutfit();
  checkAchievements();
  updateRunwayBtn();
  checkRunwayHint();
}

// ────────────────────────────────────────────────────────────
// RANDOM / RESET
// ────────────────────────────────────────────────────────────

function randomOutfit() {
  Object.keys(clothes).forEach(cat => {
    const items = clothes[cat].filter((item, i) => i === 0 || isUnlocked(item.id));
    const pick = items[1 + Math.floor(Math.random() * (items.length - 1))];
    equipped[cat] = pick.id;
    updateLayer(cat, pick, true);
  });
  spawnSparkles(14);
  setTimeout(() => spawnSparkles(10), 220);
  updateOutfitName();
  buildItemsGrid(activeCategory);
  saveOutfit();
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
}
// ────────────────────────────────────────────────────────────
// SHARE OUTFIT — скачать PNG с образом
// ────────────────────────────────────────────────────────────

function loadImageForCanvas(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
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

    // — Фоновая картинка (студия) с прозрачностью
    const bgImg = await loadImageForCanvas('Background/background_1.png');
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
  try { localStorage.setItem(SCHOOL_SAVE_KEY, JSON.stringify({ day:school.day, totalScore:school.totalScore })); } catch(e) {}
}
function loadSchoolProgress() {
  try {
    const r = localStorage.getItem(SCHOOL_SAVE_KEY);
    if (r) { const s = JSON.parse(r); school.day = s.day || 1; school.totalScore = s.totalScore || 0; }
  } catch(e) {}
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
  return Object.keys(equipped).filter(cat => { const i = findItem(cat, equipped[cat]); return i && i.src; }).length;
}

function scoreOutfit(assignment) {
  const tags    = getEquippedTags();
  const filled  = countFilledSlots();
  const req     = assignment.requiredTags;
  const matched = req.filter(t => tags.includes(t)).length;
  const tagScore         = Math.round((matched / Math.max(req.length, 1)) * 50);
  const completenessScore= Math.round((filled / 5) * 20);
  const judgeScores = {};
  Object.keys(JUDGES).forEach(jKey => {
    const j = JUDGES[jKey];
    const fav  = j.favoredTags.filter(t => tags.includes(t)).length;
    const bad  = j.dislikedTags.filter(t => tags.includes(t)).length;
    judgeScores[jKey] = Math.max(0, Math.min(10, 3 + fav * 2 - bad * 2));
  });
  const judgeTotal = Object.values(judgeScores).reduce((a, b) => a + b, 0);
  const total = Math.min(100, tagScore + completenessScore + judgeTotal);
  return { tagScore, completenessScore, judgeScores, judgeTotal, total, matched, req };
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — FLOW
// ────────────────────────────────────────────────────────────

function buildDaySchedule() {
  school.schedule = [...ASSIGNMENTS].sort(() => Math.random() - 0.5).slice(0, 5);
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

function exitSchoolMode() {
  school.active = false;
  $('assignment-banner').classList.add('hidden');
  updateRunwayBtn();
  $('outfit-name-display').textContent = '';
  $('summary-modal').classList.add('hidden');
  $('score-modal').classList.add('hidden');
}

function showAssignmentBanner() {
  const a = school.schedule[school.lessonIndex];
  if (!a) return; // guard: schedule not ready yet
  $('banner-lesson').textContent = tf('bannerDayLesson', { d: school.day, l: school.lessonIndex + 1 });
  $('banner-task').textContent   = assignmentTitle(a) + ' — ' + assignmentDesc(a);
  $('banner-tags').textContent   = '🏷 ' + translateTags(a.requiredTags).join(', ');
  $('outfit-name-display').textContent = assignmentDesc(a);
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — CATWALK
// ────────────────────────────────────────────────────────────

const CATWALK_PHRASES = {
  en: [
    'Let\'s go! 💜',
    'Fighting spirit! ⭐',
    'Incredible! ✨',
    'Idol style! 🌟',
    'Superstar! 👑',
    'Perfect! 💫',
  ],
  ru: [
    'Поехали! 💜',
    'Боевой дух! ⭐',
    'Невероятно! ✨',
    'Стиль идола! 🌟',
    'Суперзвезда! 👑',
    'Совершенно! 💫',
  ],
};

function buildCatwalkCharacter() {
  const stage = $('catwalk-stage');
  stage.innerHTML = '';
  const bodyDiv = document.createElement('div');
  bodyDiv.style.cssText = 'position:absolute;inset:0;z-index:0;';
  const bodyImg = document.createElement('img');
  bodyImg.src = 'Items/body/body_new.png';
  bodyImg.style.cssText = 'width:100%;height:100%;object-fit:fill;display:block;pointer-events:none;';
  bodyDiv.appendChild(bodyImg);
  stage.appendChild(bodyDiv);
  LAYER_ORDER.forEach(({ key, zIndex }) => {
    if (key === 'body') return;
    const item = findItem(key, equipped[key]);
    if (!item || !item.src || !item.pos) return;
    const { left, top, width } = item.pos;
    const div = document.createElement('div');
    const z = (item.z !== undefined) ? item.z : zIndex;
    div.style.cssText = `position:absolute;inset:0;z-index:${z};overflow:visible;`;
    const img = document.createElement('img');
    img.src = item.src;
    img.style.cssText = `position:absolute;left:${left}%;top:${top}%;width:${width}%;height:auto;pointer-events:none;`;
    if (item.filter) img.style.filter = item.filter;
    div.appendChild(img);
    stage.appendChild(div);
  });
}

function showCatwalk(assignment, onDone) {
  buildCatwalkCharacter();
  const phrases = CATWALK_PHRASES[lang] || CATWALK_PHRASES.en;
  $('catwalk-phrase').textContent = phrases[Math.floor(Math.random() * phrases.length)];
  $('catwalk-overlay').classList.remove('hidden');
  setTimeout(() => {
    $('catwalk-overlay').classList.add('hidden');
    onDone();
  }, 2400);
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — SCORE SCREEN
// ────────────────────────────────────────────────────────────

function animateBar(el, pct, delay = 0) {
  setTimeout(() => { el.style.width = pct + '%'; }, delay);
}

function animateCounter(el, target, duration = 800) {
  const start = Date.now();
  const tick = () => {
    const p = Math.min((Date.now() - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  tick();
}

function showScoreScreen(assignment, result, earned) {
  $('score-assignment-title').textContent = tf('scoreResults', { title: assignmentTitle(assignment) });
  $('score-tag-info').textContent = tf('scoreRequired', {
    tags: translateTags(assignment.requiredTags).join(', '),
    m: result.matched,
    r: result.req.length,
  });

  // Judge cards
  const judgesContainer = $('judge-cards');
  judgesContainer.innerHTML = '';
  let delay = 200;
  Object.keys(JUDGES).forEach(jKey => {
    const score   = result.judgeScores[jKey];
    const comment = pickJudgeComment(jKey, score);
    const isMain  = assignment.judge === jKey;
    const card = document.createElement('div');
    card.className = 'judge-card' + (isMain ? ' judge-high' : '');
    card.innerHTML = `
      <div class="judge-emoji">${JUDGES[jKey].emoji}</div>
      <div class="judge-name">${judgeName(jKey)}</div>
      <div class="judge-score-num" data-target="${score}">0</div>
      <div class="judge-score-bar-wrap"><div class="judge-score-bar" style="width:0"></div></div>
      <div class="judge-comment">"${comment}"</div>
    `;
    judgesContainer.appendChild(card);
    animateBar(card.querySelector('.judge-score-bar'), score * 10, delay);
    setTimeout(() => animateCounter(card.querySelector('.judge-score-num'), score, 700), delay);
    delay += 150;
  });

  // Breakdown
  $('breakdown-tag-label').textContent      = t('scoreTagMatch');
  $('breakdown-complete-label').textContent = t('scoreComplete');
  $('breakdown-judge-label').textContent    = t('scoreJudgeBonus');
  $('score-lesson-label').textContent       = t('scoreLessonPts');

  animateBar($('bar-tags'),     (result.tagScore / 50) * 100,       400);
  animateBar($('bar-complete'), (result.completenessScore / 20)*100, 550);
  animateBar($('bar-judges'),   (result.judgeTotal / 30) * 100,      700);
  $('pts-tags').textContent     = `${result.tagScore}/50`;
  $('pts-complete').textContent = `${result.completenessScore}/20`;
  $('pts-judges').textContent   = `${result.judgeTotal}/30`;

  const totalEl = $('score-total-num');
  totalEl.textContent = '0';
  setTimeout(() => animateCounter(totalEl, result.total, 900), 800);

  const isLast = school.lessonIndex >= 4;
  $('btn-next-lesson').textContent = isLast ? t('btnSeeResults') : t('btnNextClass');
  $('btn-next-lesson').onclick = () => {
    $('score-modal').classList.add('hidden');
    // п. 4.2 — fullscreen-реклама на логической паузе (между уроками / после дня)
    showFullscreenAd(() => {
      if (isLast) {
        showDailySummary();
        $('btn-runway').disabled = false; // re-enable for next day
      } else {
        school.lessonIndex++;
        showAssignmentBanner();
        resetOutfit();
        $('btn-runway').disabled = false; // re-enable only after next lesson is set up
      }
    });
  };

  $('btn-share-score-label').textContent = lang === 'ru' ? 'Поделиться образом' : 'Share Outfit';

  // ── Удвой награду (только если score >= 50) ───────────────
  const dblBtn  = $('btn-double-reward');
  const retryBtn = $('btn-retry-lesson');
  retryBtn.classList.add('hidden');

  earned = earned || 0;
  if (result.total >= 50) {
    let doubled = false;
    dblBtn.textContent = lang === 'ru'
      ? `📺 Удвой награду (+${earned} ⭐)`
      : `📺 Double reward (+${earned} ⭐)`;
    dblBtn.classList.remove('hidden');
    dblBtn.onclick = () => {
      if (doubled || _adShowing) return;
      const onRewarded = () => {
        doubled = true;
        dblBtn.classList.add('hidden');
        addStars(earned);
        spawnSparkles(12);
        showToast(`✨ +${earned} ⭐ × 2!`);
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
        onRewarded(); // dev-режим
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
  const dayTotal = school.lessonScores.reduce((a, b) => a + b, 0);
  school.totalScore += dayTotal;
  saveSchoolProgress();

  const rank     = getRank(school.totalScore);
  const nextRank = RANKS[RANKS.indexOf(rank) + 1] || null;
  const pct      = dayTotal / 500;
  const gradeEmoji = pct >= 0.9 ? '👑' : pct >= 0.75 ? '🌟' : pct >= 0.55 ? '⭐' : pct >= 0.35 ? '💜' : '🌱';

  $('summary-emoji-big').textContent = gradeEmoji;
  $('summary-title').textContent     = tf('summaryTitle',    { d: school.day });
  $('summary-day-score').textContent = tf('summaryDayScore', { s: dayTotal });

  const list = $('summary-lessons-list');
  list.innerHTML = '';
  school.schedule.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'summary-lesson-row';
    row.innerHTML = `
      <span class="summary-lesson-name">${assignmentTitle(a)}</span>
      <span class="summary-lesson-score">${school.lessonScores[i] || 0}/100</span>
    `;
    list.appendChild(row);
  });

  $('summary-rank-badge').textContent = tf('summaryRankLine', {
    rank: t(rank.nameKey),
    pts:  school.totalScore,
  });

  if (nextRank) {
    const progress = (school.totalScore - rank.minScore) / (nextRank.minScore - rank.minScore);
    setTimeout(() => { $('summary-rank-bar').style.width = Math.min(progress * 100, 100) + '%'; }, 400);
    $('summary-rank-next').textContent = tf('summaryNextRank', { name: t(nextRank.nameKey), at: nextRank.minScore });
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
    // Свободный режим — просто показываем подиум без оценки
    hideCtxHint();
    prog.runwayCount = (prog.runwayCount || 0) + 1;
    saveProgress();
    checkAchievements();
    sfxRunway();
    showCatwalk(null, () => {});
    return;
  }
  const assignment = school.schedule[school.lessonIndex];
  if (!assignment) return; // guard: schedule not ready yet
  hideCtxHint();
  $('btn-runway').disabled = true;
  const result     = scoreOutfit(assignment);
  school.lessonScores.push(result.total);

  // Award stars for this lesson
  const earned = result.total >= 50 ? 8 + Math.floor(result.total / 8) : 0;
  prog.totalLessons++;
  prog.runwayCount = (prog.runwayCount || 0) + 1;
  if (result.total > prog.highScore) prog.highScore = result.total;
  if (result.total >= 100) prog.perfectCount = (prog.perfectCount || 0) + 1;
  // Bonus for daily challenge
  const isDaily = assignment.id === prog.dailyTaskId && !prog.dailyTaskDone;
  if (isDaily) {
    prog.dailyTaskDone = true;
    prog.dailyTasksCompleted = (prog.dailyTasksCompleted || 0) + 1;
  }
  saveProgress();
  const dailyBonus = isDaily ? 15 : 0;
  addStars(earned + dailyBonus);
  checkAchievements();

  sfxRunway();
  showCatwalk(assignment, () => {
    showScoreScreen(assignment, result, earned + dailyBonus);
    sfxScore(result.total);
  });
}

// ────────────────────────────────────────────────────────────
// LOADING SCREEN
// ────────────────────────────────────────────────────────────

function getAllImageSrcs() {
  const srcs = new Set();
  srcs.add('Items/body/body_new.png');
  srcs.add('Background/background_1.png');
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

  // Apply full translations (lang now finalised)
  applyTranslations();

  // Wire up buttons
  $('stars-display').addEventListener('click', () => { sfxClick(); showShopModal(); });
  $('btn-runway').addEventListener('click', onRunwayClick);
  $('btn-achievements').addEventListener('click', () => { sfxClick(); showAchievementsModal(); });
  $('achievements-close').addEventListener('click', () => { sfxClick(); $('achievements-modal').classList.add('hidden'); });
  $('shop-close').addEventListener('click', () => { sfxClick(); $('shop-modal').classList.add('hidden'); });
  $('btn-sound').addEventListener('click', toggleSound);
  $('btn-share-score').addEventListener('click', () => { sfxClick(); shareOutfit(); });
  $('btn-share-stage').addEventListener('click', () => { sfxClick(); shareOutfit(); });
  updateStarsDisplay();
  initAudio();
  $('btn-new-day').addEventListener('click', () => {
    $('summary-modal').classList.add('hidden');
    school.day++;
    school.lessonIndex  = 0;
    school.lessonScores = [];
    buildDaySchedule();
    showAssignmentBanner();
    resetOutfit();
    saveSchoolProgress();
  });
  $('btn-exit-school').addEventListener('click', () => {
    exitSchoolMode();
    updateOutfitName();
  });

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
    { text: 'Привет! Я Ю На! 👋\nТак рада наконец-то познакомиться с тобой!' },
    { text: 'Мы только что поступили в K-Pop Школу! 🏫✨\nЭто самая крутая школа для будущих идолов!' },
    { text: 'Наша цель — стать самыми популярными в школе! 👑\nЗдесь всё решает стиль и образ!' },
    { text: 'Помогай мне подбирать лучшие образы на каждый урок! 💅\nЧем круче образ — тем больше фанатов!' },
    { text: 'Участвуй в уроках 🏫, выходи на подиум 🌟 и зарабатывай звёзды ⭐\nСтань легендой K-Pop!' },
    { text: 'Готова? Тогда поехали! Покажем им, кто тут настоящая звезда! 🔥💖', last: true },
  ],
  en: [
    { text: "Hi! I'm Yu Na! 👋\nSo happy to finally meet you!" },
    { text: "We just enrolled in K-Pop School! 🏫✨\nThe coolest school for future idols!" },
    { text: "Our goal — become the most popular student! 👑\nHere, style and looks are everything!" },
    { text: "Help me put together the best outfits for every class! 💅\nBetter looks = more fans!" },
    { text: "Join classes 🏫, hit the runway 🌟, earn stars ⭐\nBecome a K-Pop legend!" },
    { text: "Ready? Let's go! Time to show them who the real star is! 🔥💖", last: true },
  ],
};

let _introStep = 0;
let _introTyping = null;

function buildIntroCharacter() {
  const stage = $('intro-char-stage');
  stage.innerHTML = '';

  // Body (fills entire stage)
  const bodyImg = document.createElement('img');
  bodyImg.src = 'Items/body/body_new.png';
  bodyImg.alt = '';
  bodyImg.draggable = false;
  bodyImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;z-index:0;';
  stage.appendChild(bodyImg);

  // Default intro outfit: hair + shirt + jeans + sneakers
  const introOutfit = [
    { cat: 'hair',       id: 'hair_none'  },
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
    addStars(20);
    showToast(lang === 'ru' ? '🎉 Добро пожаловать! +20 ⭐' : '🎉 Welcome! +20 ⭐');
  }, { once: true });
}

function applyLoadingTranslations() {
  const lt = $('loading-title');
  const lp = $('loading-text');
  if (lt) lt.textContent = t('loadingTitle');
  if (lp) lp.textContent = t('loadingText');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

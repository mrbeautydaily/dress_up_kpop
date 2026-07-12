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
  // 1. URL-параметр ?lang= — Яндекс Игры передают его в URL
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const cisLangs = ['ru', 'be', 'kk', 'uk', 'uz', 'az', 'hy', 'ka', 'mo', 'tg', 'tk', 'ky'];
  
  if (urlLang) {
    return cisLangs.includes(urlLang) ? 'ru' : 'en';
  }

  // 2. Язык браузера
  const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return cisLangs.some(l => nav.startsWith(l)) ? 'ru' : 'en';
}

function t(key) {
  return (T[lang] && T[lang][key] !== undefined ? T[lang][key] : T.en[key]) || key;
}

const T = {
  en: {
    // Loading
    loadingTitle:  'K-Pop Star: Dress Up',
    loadingText:   'Loading...',
    // Header
    gameTitle:     'K-Pop Star: Dress Up',
    btnRunway:     'Publish Post',
    // Panels
    catHair:       'Hair',
    catTops:       'Tops',
    catBottoms:    'Bottoms',
    catShoes:      'Shoes',
    catSocks:      'Socks',
    catAcc:        'Acc.',
    // Score screen
    scoreResults:    '📍 {title}',
    btnNewDay:       '➡ Next Post',
    // Milestone progress subtext
    milestoneSubtextLeft: '{milestone} Followers! ✅',
    // Outfit names (free mode)
    adj: ['Sparkly','Dreamy','Fierce','Sweet','Chic','Bold','Pastel','Glam','Iconic','Fresh'],
    noun:['Idol','Star','Diva','Queen','Vision','Dream','Look','Vibe','Moment','Era'],
    // Tooltips
    titleRandom:   'Random outfit',
    titlePrevBg:   'Previous background',
    titleNextBg:   'Next background',
    titleShare:    'Take screenshot',
    titleSound:    'Toggle sound',
    titleClearEmoji: 'Remove reaction',
    titleDevPanel:   'Developer panel',
  },
  ru: {
    // Loading
    loadingTitle:  'K-Pop Звезда: Одевалка',
    loadingText:   'Загрузка...',
    // Header
    gameTitle:     'K-Pop Звезда: Одевалка',
    btnRunway:     'Опубликовать',
    // Panels
    catHair:       'Волосы',
    catTops:       'Топы',
    catBottoms:    'Низ',
    catShoes:      'Обувь',
    catSocks:      'Носки',
    catAcc:        'Акс.',
    // Score screen
    scoreResults:    '📍 {title}',
    btnNewDay:       '➡ Следующий пост',
    // Milestone progress subtext
    milestoneSubtextLeft: '{milestone} подписчиков! ✅',
    // Outfit names (free mode)
    adj:  ['Сверкающий','Мечтательный','Дерзкий','Сладкий','Шикарный','Смелый','Пастельный','Гламурный','Культовый','Свежий'],
    noun: ['Идол','Звезда','Дива','Королева','Образ','Мечта','Лук','Вайб','Момент','Эпоха'],
    // Tooltips
    titleRandom:   'Случайный наряд',
    titlePrevBg:   'Предыдущий фон',
    titleNextBg:   'Следующий фон',
    titleShare:    'Сделать скриншот',
    titleSound:    'Вкл/Выкл звук',
    titleClearEmoji: 'Убрать реакцию',
    titleDevPanel:   'Панель разработчика',
  },
};

/// Template helper: t('key', {d:1, l:2})
function tf(key, vars) {
  let s = t(key);
  if (vars) Object.keys(vars).forEach(k => { s = s.replaceAll('{' + k + '}', vars[k]); });
  return s;
}

// ────────────────────────────────────────────────────────────
// APPLY TRANSLATIONS TO DOM
// ────────────────────────────────────────────────────────────

function applyTranslations() {
  // Update document title
  document.title = t('loadingTitle');

  // Loading screen
  const lt = $('loading-title');
  const lp = $('loading-text');
  if (lt) lt.textContent = t('loadingTitle');
  if (lp) lp.textContent = t('loadingText');

  // Header
  $('header-title').textContent = t('gameTitle');
  const rl = $('btn-runway-label');
  if (rl) rl.textContent = t('btnRunway').replace('🌟 ', '');

  // Tooltips for control buttons
  const btnRandom = $('btn-random-stage');
  const btnPrev = $('btn-prev-bg');
  const btnNext = $('btn-next-bg');
  const btnShare = $('btn-share-stage');
  const btnSound = $('btn-sound');

  if (btnRandom) btnRandom.title = t('titleRandom');
  if (btnPrev) btnPrev.title = t('titlePrevBg');
  if (btnNext) btnNext.title = t('titleNextBg');
  if (btnShare) btnShare.title = t('titleShare');
  if (btnSound) btnSound.title = t('titleSound');

  // Other tooltips
  const emojiClear = document.querySelector('.emoji-option-clear');
  const devTrigger = $('dev-panel-trigger');
  if (emojiClear) emojiClear.title = t('titleClearEmoji');
  if (devTrigger) devTrigger.title = t('titleDevPanel');

  // Rebuild translated lists
  buildCategoryPanel();
  buildItemsGrid(activeCategory);

  // Assignment banner if active
  if (school.active) showAssignmentBanner();
}

function applyLoadingTranslations() {
  const lt = $('loading-title');
  const lp = $('loading-text');
  if (lt) lt.textContent = t('loadingTitle');
  if (lp) lp.textContent = t('loadingText');
}


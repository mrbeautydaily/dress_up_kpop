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
    loadingText:   'Loading...',
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
    // Milestone progress subtext
    milestoneSubtextLeft: '{milestone} Followers! ✅',
    // Outfit names (free mode)
    adj: ['Sparkly','Dreamy','Fierce','Sweet','Chic','Bold','Pastel','Glam','Iconic','Fresh'],
    noun:['Idol','Star','Diva','Queen','Vision','Dream','Look','Vibe','Moment','Era'],
  },
  ru: {
    // Loading
    loadingTitle:  'Путь к славе: K-Pop',
    loadingText:   'Загрузка...',
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
    // Milestone progress subtext
    milestoneSubtextLeft: '{milestone} подписчиков! ✅',
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

function applyLoadingTranslations() {
  const lt = $('loading-title');
  const lp = $('loading-text');
  if (lt) lt.textContent = t('loadingTitle');
  if (lp) lp.textContent = t('loadingText');
}


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
  setTimeout(adjustStageCounters, 0);
}

function updateFollowersDisplay() {
  const el = $('followers-count');
  if (el) el.textContent = formatFollowers(school.totalFollowers);
  setTimeout(adjustStageCounters, 0);
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
           <img src="Items/UI/heart.png" class="inline-heart" alt="heart"> ${lang === 'ru' ? 'Купить лайки' : 'Buy Likes'}
         </button>`
      : '';
    bar.innerHTML = `
      <div class="buy-bar-name">${iName(item)}${isDeal ? ' 🔥' : ''}</div>
      ${isDeal ? `<div class="buy-bar-deal">${formatLikes(origCost)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart"> → <b>${formatLikes(cost)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart"></b></div>` : ''}
      <div class="buy-bar-row">
        <button class="buy-bar-btn buy-confirm${canBuy ? '' : ' cant-buy'}" id="buy-bar-yes">
          ${canBuy ? (lang === 'ru' ? `Купить ${formatLikes(cost)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart">` : `Buy ${formatLikes(cost)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart">`) : (lang === 'ru' ? `Нужно ${formatLikes(cost)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart">` : `Need ${formatLikes(cost)} <img src="Items/UI/heart.png" class="inline-heart" alt="heart">`)}
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
      ? 'Образ собран!<br>Нажми <b>Опубликовать</b>'
      : 'Outfit ready!<br>Tap <b>Publish Post</b>';
    showCtxHint('btn-runway', text, 5000);
  } else {
    _nudgeBtn(btn, 'hint-nudge');
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
          showToast(lang === 'ru' ? 'Реклама недоступна' : 'Ad unavailable', 'error');
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
            showToast(lang === 'ru' ? 'Отзыв не отправлен' : 'Review not submitted', 'error');
          }
        });
      } else {
        const msg = reason === 'GAME_RATED'
          ? (lang === 'ru' ? 'Ты уже оставлял отзыв!' : 'You already left a review!')
          : (lang === 'ru' ? 'Отзыв недоступен' : 'Review not available');
        // If already reviewed previously, still reward (user was honest)
        if (reason === 'GAME_RATED') unlockItemFree(category, itemId);
        else showToast(msg, 'info');
      }
    });
  } else {
    // Dev fallback
    unlockItemFree(category, itemId);
  }
}

function showToast(msg, type) {
  type = type || 'info';
  let el = $('game-toast');
  if (!el) { el = document.createElement('div'); el.id = 'game-toast'; document.body.appendChild(el); }
  el.innerHTML = msg;
  el.className = 'game-toast game-toast-' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = 'game-toast hidden', 2000);
}

// ────────────────────────────────────────────────────────────
// PROGRESSION — DAILY DEAL & TASK
// ────────────────────────────────────────────────────────────


function getDailyDealId() {
  const ids = Object.keys(ITEM_COSTS);
  return ids[dateHash(todayStr()) % ids.length];
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
}




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

let currentEquipAnimation = localStorage.getItem('dev_equip_animation') || 'softPopIn';

window.setEquipAnimation = function(val) {
  currentEquipAnimation = val;
};

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
  if (animate && currentEquipAnimation !== 'none') {
    const animClass = `layer-animate-${currentEquipAnimation}`;
    img.classList.add(animClass);
    img.addEventListener('animationend', () => img.classList.remove(animClass), { once:true });
  }
  layerEl.appendChild(img);
}

function renderAllLayers() {
  Object.keys(equipped).forEach(cat => updateLayer(cat, findItem(cat, equipped[cat]), false));
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
function saveSchoolProgress() {
  try {
    localStorage.setItem(SCHOOL_SAVE_KEY, JSON.stringify({
      day: school.day,
      totalFollowers: school.totalFollowers,
      totalPosts: school.totalPosts,
      dayFollowersGained: school.dayFollowersGained,
      rewardedMilestones: school.rewardedMilestones || [],
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
      if (s.rewardedMilestones) {
        school.rewardedMilestones = s.rewardedMilestones;
      } else {
        // Pre-populate already reached milestones to avoid retroactive reward spam/exploit on first load
        const MILESTONES = [1000, 10000, 100000, 500000, 1000000];
        school.rewardedMilestones = [];
        for (const m of MILESTONES) {
          if (school.totalFollowers >= m) {
            school.rewardedMilestones.push(m);
          }
        }
      }
    }
  } catch(e) {}
  updateFollowersDisplay();
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


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
      ? `<div class="item-deal-badge">🔥 ${formatLikes(cost)}<img src="Items/UI/heart.png" class="inline-heart" alt="heart"></div>`
      : locked && isAdItem
        ? `<div class="item-cost-badge item-ad-badge">📺 ${lang === 'ru' ? 'Реклама' : 'Ad'}</div>`
        : locked && isReviewItem
          ? `<div class="item-cost-badge item-review-badge">✍️ ${lang === 'ru' ? 'Отзыв' : 'Review'}</div>`
          : locked && cost > 0
            ? `<div class="item-cost-badge">${formatLikes(cost)}<img src="Items/UI/heart.png" class="inline-heart" alt="heart"></div>`
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


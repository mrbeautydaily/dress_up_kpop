// ────────────────────────────────────────────────────────────
// UI — CATEGORY PANEL & ITEMS GRID
// ────────────────────────────────────────────────────────────

let lastCategory = '';
let lastSubCategory = '';

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
    btn.addEventListener('click', () => { sfxClick(); selectCategory(cat.key); });

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
      sfxClick();
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

let blockDragClick = false;
let inertiaFrameId = null;

function stopInertia() {
  if (inertiaFrameId) {
    cancelAnimationFrame(inertiaFrameId);
    inertiaFrameId = null;
  }
}

function startInertia(velocityY) {
  const grid = document.getElementById('items-grid');
  if (!grid) return;

  // Limit max velocity so the list doesn't fly off too rapidly
  const maxVelocity = 2.5; 
  if (velocityY > maxVelocity) velocityY = maxVelocity;
  if (velocityY < -maxVelocity) velocityY = -maxVelocity;

  let currentVelocityY = velocityY * 16; // Translate px/ms into px/frame
  const friction = 0.94; // Decay rate

  function step() {
    if (Math.abs(currentVelocityY) < 0.1) {
      inertiaFrameId = null;
      return;
    }

    grid.scrollTop -= currentVelocityY;
    currentVelocityY *= friction;
    
    inertiaFrameId = requestAnimationFrame(step);
  }

  stopInertia();
  inertiaFrameId = requestAnimationFrame(step);
}

function initCardDragAndDrop(card, category, itemId) {
  let startX = 0;
  let startY = 0;
  let dragDetected = false;
  let scrollDetected = false;
  let dragActive = false;
  let cloneEl = null;
  let longPressTimeout = null;
  
  const stageWrap = document.getElementById('stage-wrap');
  
  function isOverStage(clientX, clientY) {
    if (!stageWrap) return false;
    const rect = stageWrap.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  function handleStart(clientX, clientY, isTouch) {
    stopInertia();
    
    startX = clientX;
    startY = clientY;
    dragDetected = false;
    scrollDetected = false;
    dragActive = false;
    cloneEl = null;

    if (isTouch) {
      longPressTimeout = setTimeout(() => {
        if (!scrollDetected && !dragDetected) {
          dragDetected = true;
          
          if (navigator.vibrate) {
            try { navigator.vibrate(15); } catch (e) {}
          }
          
          dragActive = true;
          card.classList.add('is-dragged');
          
          cloneEl = card.cloneNode(true);
          cloneEl.classList.add('drag-clone');
          
          const origRect = card.getBoundingClientRect();
          cloneEl.style.width = origRect.width + 'px';
          cloneEl.style.height = origRect.height + 'px';
          cloneEl.style.left = startX + 'px';
          cloneEl.style.top = startY + 'px';
          
          const origCanvas = card.querySelector('.item-thumb');
          const cloneCanvas = cloneEl.querySelector('.item-thumb');
          if (origCanvas && cloneCanvas) {
            const ctx = cloneCanvas.getContext('2d');
            ctx.drawImage(origCanvas, 0, 0);
          }
          
          document.body.appendChild(cloneEl);
          
          if (isOverStage(startX, startY)) {
            stageWrap.classList.add('drag-hover');
          }
        }
      }, 220);
    }
  }

  function handleMove(clientX, clientY, preventDefaultFn) {
    const dx = clientX - startX;
    const dy = clientY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (!dragDetected && !scrollDetected) {
      if (absDx > 8 || absDy > 8) {
        if (absDx > absDy) {
          dragDetected = true;
          if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
          }
        } else {
          scrollDetected = true;
          if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
          }
        }
      }
    }

    if (dragDetected) {
      if (typeof preventDefaultFn === 'function') preventDefaultFn();
      
      if (!dragActive) {
        dragActive = true;
        card.classList.add('is-dragged');
        
        cloneEl = card.cloneNode(true);
        cloneEl.classList.add('drag-clone');
        
        const origRect = card.getBoundingClientRect();
        cloneEl.style.width = origRect.width + 'px';
        cloneEl.style.height = origRect.height + 'px';
        cloneEl.style.left = clientX + 'px';
        cloneEl.style.top = clientY + 'px';
        
        const origCanvas = card.querySelector('.item-thumb');
        const cloneCanvas = cloneEl.querySelector('.item-thumb');
        if (origCanvas && cloneCanvas) {
          const ctx = cloneCanvas.getContext('2d');
          ctx.drawImage(origCanvas, 0, 0);
        }
        
        document.body.appendChild(cloneEl);
      }
      
      if (cloneEl) {
        cloneEl.style.left = clientX + 'px';
        cloneEl.style.top = clientY + 'px';
      }
      
      if (isOverStage(clientX, clientY)) {
        if (stageWrap) stageWrap.classList.add('drag-hover');
      } else {
        if (stageWrap) stageWrap.classList.remove('drag-hover');
      }
    }
  }

  function handleEnd(clientX, clientY) {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      longPressTimeout = null;
    }

    const wasDragging = dragActive;
    const wasScrolling = scrollDetected;

    if (dragActive) {
      card.classList.remove('is-dragged');
      if (cloneEl) {
        cloneEl.remove();
        cloneEl = null;
      }
      
      const overStage = isOverStage(clientX, clientY);
      if (stageWrap) stageWrap.classList.remove('drag-hover');
      
      if (overStage) {
        tryEquipOrBuy(category, itemId);
      }
    }

    if (wasDragging || wasScrolling) {
      blockDragClick = true;
      setTimeout(() => { blockDragClick = false; }, 100);
      return true;
    }
    return false;
  }

  card.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    handleStart(e.clientX, e.clientY, false);
    let lastY = e.clientY;
    let lastTime = performance.now();
    let velocityY = 0;
    
    function onMouseMove(moveEvent) {
      const clientY = moveEvent.clientY;
      const clientX = moveEvent.clientX;
      const now = performance.now();
      const deltaTime = now - lastTime;
      
      handleMove(clientX, clientY);
      
      const deltaY = clientY - lastY;
      if (scrollDetected) {
        const grid = document.getElementById('items-grid');
        if (grid) {
          grid.scrollTop -= deltaY;
        }
      }
      
      if (deltaTime > 0) {
        const instantVelocityY = deltaY / deltaTime;
        velocityY = velocityY * 0.4 + instantVelocityY * 0.6;
      }
      
      lastY = clientY;
      lastTime = now;
    }
    
    function onMouseUp(upEvent) {
      const timeSinceLastMove = performance.now() - lastTime;
      if (timeSinceLastMove > 80) {
        velocityY = 0;
      }
      
      const isDragEnded = handleEnd(upEvent.clientX, upEvent.clientY);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      if (scrollDetected && velocityY !== 0) {
        startInertia(velocityY);
      }
      
      if (isDragEnded) {
        upEvent.preventDefault();
        upEvent.stopPropagation();
      }
    }
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  card.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, true);
    
    function onTouchMove(moveEvent) {
      if (moveEvent.touches.length > 1) return;
      const t = moveEvent.touches[0];
      handleMove(t.clientX, t.clientY, () => {
        if (moveEvent.cancelable) {
          moveEvent.preventDefault();
        }
      });
    }
    
    function onTouchEnd(endEvent) {
      const t = endEvent.changedTouches[0] || endEvent.touches[0];
      const isDragEnded = handleEnd(t.clientX, t.clientY);
      
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      
      if (isDragEnded) {
        if (endEvent.cancelable) {
          endEvent.preventDefault();
        }
        endEvent.stopPropagation();
      }
    }
    
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });
  }, { passive: true });
}

let currentGridRenderSession = 0;

function buildItemsGrid(category) {
  stopInertia();
  const grid = $('items-grid');
  const currentSub = activeSub[category] || '';
  const isSameTab = (category === lastCategory && currentSub === lastSubCategory);

  let savedScrollTop = 0;
  let savedScrollLeft = 0;

  if (grid) {
    if (isSameTab) {
      savedScrollTop = grid.scrollTop;
      savedScrollLeft = grid.scrollLeft;
    }
  }

  lastCategory = category;
  lastSubCategory = currentSub;
  const subs = CATEGORY_SUBS[category];
  if (subs) {
    buildSubTabs(category);
  } else {
    hideSubTabs();
  }

  const fragment = document.createDocumentFragment();
  const drawTasks = [];
  const session = ++currentGridRenderSession;

  const allItems = clothes[category] || [];
  const items = subs
    ? allItems.filter(item => !item.sub || item.sub === activeSub[category])
    : allItems;

  items.forEach(item => {
    const locked = !isUnlocked(item.id);
    const cost   = itemStarCost(item.id);

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

    const isAdItem     = AD_ITEMS.has(item.id);
    const isReviewItem = item.id === REVIEW_ITEM;
    const badge = locked && isAdItem
      ? `<div class="item-cost-badge item-ad-badge"><img src="Items/UI/shop_ad_tv.png" class="badge-tv" alt="TV"> ${lang === 'ru' ? 'Реклама' : 'Ad'}</div>`
      : locked && isReviewItem
        ? `<div class="item-cost-badge item-review-badge"><img src="Items/UI/calendar.png" class="badge-calendar" alt="Calendar"> ${lang === 'ru' ? 'Отзыв' : 'Review'}</div>`
        : locked && cost > 0
          ? `<div class="item-cost-badge">${formatStars(cost)}<img src="Items/UI/star.png" class="inline-heart" alt="star"></div>`
          : '';

    const filterStyle = item.filter ? ` style="filter:${item.filter}"` : '';
    let thumbHTML = '';
    if (item.src) {
      thumbHTML = `<div class="item-thumb-wrapper" style="position: relative;">
          <canvas class="item-thumb" width="120" height="120" style="display: block; width: 100%; height: 100%; pointer-events: none;"${filterStyle}></canvas>
          ${badge}
        </div>`;
    } else {
      thumbHTML = `<div class="item-thumb-wrapper" style="display: flex; justify-content: center; align-items: center; position: relative;">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--card-text)" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          ${badge}
        </div>`;
    }

    card.innerHTML = `${thumbHTML}<span class="item-name">${iName(item)}</span>`;
    
    if (item.src) {
      const canvas = card.querySelector('.item-thumb');
      if (canvas) {
        drawTasks.push(() => drawItemThumbnail(canvas, item.src));
      }
    }
    
    if (isEquipped) {
      const check = document.createElement('div');
      check.className = 'equipped-indicator';
      check.textContent = '✓';
      card.appendChild(check);
    }

    card.addEventListener('click', (e) => {
      if (blockDragClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      tryEquipOrBuy(category, item.id);
    });

    initCardDragAndDrop(card, category, item.id);

    fragment.appendChild(card);
  });

  if (grid) {
    grid.innerHTML = '';
    grid.appendChild(fragment);

    if (isSameTab) {
      grid.scrollTop = savedScrollTop;
      grid.scrollLeft = savedScrollLeft;
    }
  }

  let taskIndex = 0;
  function processDrawTasks() {
    if (session !== currentGridRenderSession) return;
    const CHUNK_SIZE = 8;
    const end = Math.min(taskIndex + CHUNK_SIZE, drawTasks.length);
    for (; taskIndex < end; taskIndex++) {
      drawTasks[taskIndex]();
    }
    if (taskIndex < drawTasks.length) {
      requestAnimationFrame(processDrawTasks);
    }
  }
  
  if (drawTasks.length > 0) {
    requestAnimationFrame(processDrawTasks);
  }
}


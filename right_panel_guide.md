# Руководство по созданию правой панели категорий и карточек

Приветствую Вас, мой господин! 

В данном документе собраны все необходимые материалы для того, чтобы Вы могли перенести и воссоздать правую панель с категориями и карточками в другой своей игре аналогичного жанра.

Панель представляет собой двухколоночный сплит-лейаут:
1. **Левая колонка (Категории)**: Вертикальный список кнопок-категорий с мягкими тенями, анимацией наведения, активными состояниями и динамически появляющимися ярлыками.
2. **Правая колонка (Карточки предметов)**: Сетка карточек предметов с превью, названиями, проверкой активного состояния ("надето") и анимированным значком галочки (`✓`). Также реализована карточка "None" для снятия предметов.

---

## 1. HTML-структура (Разметка)

Ниже представлена базовая разметка контейнера правой панели. Вы можете разместить её внутри основной разметки игры:

```html
<!-- Right Sidebar Container -->
<aside class="sidebar items-sidebar">
  <div class="sidebar-split-layout">
    
    <!-- Left Column: Category Navigation Buttons -->
    <nav class="category-list" id="categories-nav">
      <!-- Dynamically populated via JavaScript -->
    </nav>
    
    <!-- Right Column: Content Column containing the Grid -->
    <div class="items-content-column">
      
      <!-- Scrollable container for the items grid -->
      <div class="items-grid-container">
        <div class="items-grid" id="items-grid">
          <!-- Dynamically populated via JavaScript -->
        </div>
      </div>
      
    </div>
  </div>
</aside>
```

---

## 2. CSS-стили (Оформление)

Эти стили используют CSS-переменные для быстрого переключения тем оформления (например, цветовой схемы Y2K Bubblegum). Вы можете легко переопределить их под дизайн Вашей новой игры.

```css
/* ==========================================================================
   Design Tokens & Theme Variables
   ========================================================================== */
:root {
  --font-ui: 'Inter', sans-serif;
  --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  --radius-md: 12px;
  --radius-sm: 8px;
  
  /* Color Palette (Y2K Bubblegum Theme) */
  --accent-pink: #ff6b9d;
  --accent-purple: #c5a3ff;
  --text-primary: #2d1e2f;
  --text-secondary: #8e6e88;
  --border-theme: 2.2px solid #e38daa;
}

/* ==========================================================================
   Sidebar & Split Layout
   ========================================================================== */
.items-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-split-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}

.items-content-column {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  padding: 16px;
}

/* ==========================================================================
   Left Column: Vertical Categories Navigation
   ========================================================================== */
#categories-nav {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-left: var(--border-theme);
  border-right: var(--border-theme);
  padding: 16px 8px;
  background: linear-gradient(to top, #ff6599, #ffcadc);
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none; /* Hide default scrollbar on Firefox */
}

#categories-nav::-webkit-scrollbar {
  display: none; /* Hide default scrollbar on Chrome/Safari */
}

.category-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.category-item-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dynamic category label that appears below the icon when selected */
.category-item-label {
  font-family: var(--font-ui);
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
  text-align: center;
  max-width: 68px;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.1;
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              margin-top 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  margin-top: 0;
}

.category-item-wrapper.active .category-item-label {
  opacity: 1;
  transform: translateY(0);
  max-height: 24px;
  margin-top: 4px;
}

/* Category Button Style (Squircle with 3D button effect) */
.category-item {
  background: #ffffff;
  border: 2px solid #ffccd5;
  color: var(--accent-pink);
  width: 56px;
  height: 56px;
  border-radius: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0px 4px 0px #ffccd5, 0px 6px 10px rgba(191, 132, 142, 0.15);
  transform: translateY(0);
}

.category-item:hover {
  border-color: #ffb3c6;
  box-shadow: 0px 6px 0px #ffb3c6, 0px 8px 15px rgba(191, 132, 142, 0.25);
  transform: translateY(-2px);
}

.category-item:active {
  transform: translateY(-1px) scale(0.96);
  box-shadow: 0px 3px 0px #ffccd5, 0px 4px 8px rgba(191, 132, 142, 0.15);
}

.category-item.active {
  background: #ffffff !important;
  border: 2px solid var(--accent-pink) !important;
  color: var(--accent-pink) !important;
  box-shadow: 0px 4px 0px var(--accent-pink), 0px 10px 20px rgba(255, 107, 157, 0.35) !important;
  transform: translateY(-4px) scale(1.05);
}

.category-icon {
  font-size: 20px;
  transition: var(--transition-smooth);
}

.category-item.active .category-icon {
  transform: scale(1.15);
}

.category-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-smooth);
}

.category-item:hover .category-icon-img {
  transform: scale(1.1);
}

.category-item.active .category-icon-img {
  transform: scale(1.15);
}

/* ==========================================================================
   Right Column: Scrollable Grid & Item Cards
   ========================================================================== */
.items-grid-container {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns */
  gap: 12px;
  padding-bottom: 16px;
}

/* Individual Item Card Styling */
.item-card {
  background: #ffecec;
  border: 1.5px solid #bf848e;
  border-radius: var(--radius-md);
  padding: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: var(--transition-smooth);
  overflow: hidden;
  box-shadow: 2px 3px 0px rgba(191, 132, 142, 0.3);
}

/* Card overlay gradient effect */
.item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-pink), var(--accent-purple));
  opacity: 0;
  transition: var(--transition-smooth);
  z-index: 0;
}

.item-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-pink);
  box-shadow: 3px 4px 0px rgba(191, 132, 142, 0.45);
}

/* Active/Equipped State of the Item Card */
.item-card.equipped {
  border-color: var(--accent-pink);
  box-shadow: 2px 3px 0px var(--accent-pink);
  background: #fff2f5;
}

.item-card.equipped::before {
  opacity: 0.03; /* Very subtle glow */
}

/* Image/Canvas Thumbnail Container inside the Card */
.item-thumb-wrapper {
  width: 100%;
  aspect-ratio: 1;
  background: #fef7fa;
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: 1px solid #eda1ba;
}

.item-thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: var(--transition-smooth);
}

.item-card:hover .item-thumb {
  transform: scale(1.1); /* Zoom item slightly on hover */
}

.item-name {
  font-size: 11px;
  font-weight: 500;
  color: #844646;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 1;
}

/* Equipped indicator (The pink badge with a checkmark) */
.equipped-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--accent-pink);
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(74, 62, 61, 0.15);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Equipped badge pop-in scale animation */
@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
```

---

## 3. JavaScript-логика (Управление интерфейсом)

Этот JavaScript-код отвечает за динамическое создание структуры DOM, переключение активных классов при клике и отслеживание надетых на куклу предметов.

```javascript
// ==========================================================================
// Configurations and Game State
// ==========================================================================
const GAME_CONFIG = {
  categories: [
    { id: 'hair', name: 'Hair' },
    { id: 'dress', name: 'Dresses' },
    { id: 'shoes', name: 'Shoes' }
  ],
  items: [
    { id: 'pink_dress', category: 'dress', name: 'Pink Dress', file: 'dress_pink.png' },
    { id: 'blue_hair', category: 'hair', name: 'Blue Hair', file: 'hair_blue.png' },
    { id: 'heels', category: 'shoes', name: 'Heels', file: 'heels.png' }
  ]
};

// State trackers
let currentCategory = 'dress';
let equippedItems = {}; // Format: { categoryId: itemObject }

// DOM cache
const categoriesNav = document.getElementById('categories-nav');
const itemsGrid = document.getElementById('items-grid');

// ==========================================================================
// Category Navigation Renderer
// ==========================================================================
function renderCategories() {
  categoriesNav.innerHTML = '';
  
  GAME_CONFIG.categories.forEach(cat => {
    // 1. Wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = `category-item-wrapper ${cat.id === currentCategory ? 'active' : ''}`;
    
    // 2. Main button with icon
    const btn = document.createElement('button');
    btn.className = `category-item ${cat.id === currentCategory ? 'active' : ''}`;
    
    // Determine category icon (can be emojis or <img> elements)
    let emoji = '👗';
    if (cat.id === 'hair') emoji = '💇‍♀️';
    if (cat.id === 'shoes') emoji = '👠';
    
    btn.innerHTML = `<span class="category-icon">${emoji}</span>`;
    btn.title = cat.name;
    
    // 3. Text label
    const label = document.createElement('span');
    label.className = `category-item-label ${cat.id === currentCategory ? 'active' : ''}`;
    label.textContent = cat.name;
    
    // 4. Click event handler
    btn.addEventListener('click', () => {
      if (currentCategory === cat.id) return;
      
      currentCategory = cat.id;
      
      // Update active classes across UI elements
      document.querySelectorAll('.category-item-wrapper').forEach(w => w.classList.remove('active'));
      document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.category-item-label').forEach(l => l.classList.remove('active'));
      
      wrapper.classList.add('active');
      btn.classList.add('active');
      label.classList.add('active');
      
      // Re-populate grid items for the selected category
      renderItems();
    });
    
    wrapper.appendChild(btn);
    wrapper.appendChild(label);
    categoriesNav.appendChild(wrapper);
  });
}

// ==========================================================================
// Grid Items Renderer
// ==========================================================================
function renderItems() {
  itemsGrid.innerHTML = '';
  
  // 1. Add "None" (Unequip slot) Card - skip for hair category as hair is essential
  if (currentCategory !== 'hair') {
    const noneCard = document.createElement('div');
    noneCard.className = 'item-card none-item-card';
    noneCard.dataset.id = 'none';
    noneCard.innerHTML = `
      <div class="item-thumb-wrapper" style="display: flex; justify-content: center; align-items: center;">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#bf848e" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <span class="item-name">None</span>
    `;
    
    noneCard.addEventListener('click', () => {
      if (equippedItems[currentCategory]) {
        delete equippedItems[currentCategory];
        updateDollLayers();      // Call your function to redraw characters
        updateEquippedStates();  // Update visual checkmarks
      }
    });
    itemsGrid.appendChild(noneCard);
  }
  
  // 2. Load item cards from configuration
  const filteredItems = GAME_CONFIG.items.filter(item => item.category === currentCategory);
  
  filteredItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;
    
    card.innerHTML = `
      <div class="item-thumb-wrapper">
        <img class="item-thumb" src="Items/${currentCategory}/${item.file}" alt="${item.name}">
      </div>
      <span class="item-name">${item.name}</span>
    `;
    
    card.addEventListener('click', () => {
      toggleEquipItem(item);
    });
    
    itemsGrid.appendChild(card);
  });
  
  updateEquippedStates();
}

// ==========================================================================
// Dressing Controller Logic
// ==========================================================================
function toggleEquipItem(item) {
  const isCurrentlyEquipped = equippedItems[item.category] && equippedItems[item.category].id === item.id;
  
  if (isCurrentlyEquipped) {
    if (item.category !== 'hair') {
      delete equippedItems[item.category]; // Unequip
    }
  } else {
    equippedItems[item.category] = item; // Equip
  }
  
  updateDollLayers();     // Update the visual representation on the doll
  updateEquippedStates(); // Update card borders and indicators in the grid
}

// ==========================================================================
// Visual State Sync (Borders & Indicators)
// ==========================================================================
function updateEquippedStates() {
  const hasEquippedInCat = !!equippedItems[currentCategory];
  
  itemsGrid.querySelectorAll('.item-card').forEach(card => {
    const cardId = card.dataset.id;
    
    if (cardId === 'none') {
      // Toggle equipped class on "None" card if nothing is equipped in current category
      card.classList.toggle('equipped', !hasEquippedInCat);
      
      const indicator = card.querySelector('.equipped-indicator');
      if (!hasEquippedInCat && !indicator) {
        const check = document.createElement('div');
        check.className = 'equipped-indicator';
        check.textContent = '✓';
        card.appendChild(check);
      } else if (hasEquippedInCat && indicator) {
        indicator.remove();
      }
    } else {
      // Toggle equipped class for active item
      const isEquipped = equippedItems[currentCategory] && equippedItems[currentCategory].id === cardId;
      card.classList.toggle('equipped', isEquipped);
      
      const indicator = card.querySelector('.equipped-indicator');
      if (isEquipped && !indicator) {
        const check = document.createElement('div');
        check.className = 'equipped-indicator';
        check.textContent = '✓';
        card.appendChild(check);
      } else if (!isEquipped && indicator) {
        indicator.remove();
      }
    }
  });
}

// Dummy functions representing character doll state refresh
function updateDollLayers() {
  console.log("Equipped items changed:", equippedItems);
}

// ==========================================================================
// Initialization
// ==========================================================================
renderCategories();
renderItems();
```

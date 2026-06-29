# Soft Idol UI — Codex Implementation Brief

## Цель

Привести текущий UI fashion/K-pop игры к единому дизайн-коду **Soft Idol UI**: мягкий pastel pink/purple интерфейс, белые округлые панели, единые кнопки, карточки, теги, состояния выбора и модальное окно результата.

Главная задача для Codex: **не менять игровую механику, данные, scoring, состояние, маршрутизацию и бизнес-логику**. Изменять только UI-слой, стили, классы, дизайн-токены и визуальную структуру компонентов.

---

## Визуальный результат

Интерфейс должен выглядеть как цельная мобильная/desktop fashion game UI-система:

- мягкий розово-фиолетовый фон;
- белые карточки с тонкой lavender-обводкой;
- большие скругления;
- фиолетовые gradient CTA-кнопки;
- розовые/голубые/оранжевые акценты только для лайков, сохранения, бонусов и прогресса;
- без тяжёлых чёрных рамок;
- без случайных радиусов и случайных теней;
- весь UI должен ощущаться как один kit.

Название дизайн-кода: **Soft Idol UI**.

---

## Не менять

Codex не должен менять:

- игровую логику;
- расчёт очков;
- список предметов;
- порядок категорий;
- данные пользователя;
- значения лайков/подписчиков;
- тексты миссий, если они уже приходят из данных;
- event handlers;
- API-запросы;
- состояние selected item / active category / modal visibility.

Разрешено менять:

- CSS / SCSS / Tailwind classes;
- component markup, если это нужно для стилизации;
- названия utility-классов;
- дизайн-токены;
- обёртки для карточек и кнопок;
- визуальные состояния hover / active / selected / disabled;
- spacing, radius, shadows, borders.

---

## Дизайн-токены

Добавить глобальные CSS variables. Если в проекте уже есть файл токенов, расширить его. Если нет — создать, например:

```txt
src/styles/tokens.css
src/styles/theme.css
src/app/globals.css
```

Использовать следующие токены как базу:

```css
:root {
  /* Backgrounds */
  --bg-main: #FBE6FF;
  --bg-main-2: #FFEFF8;
  --bg-panel: #FFFFFF;
  --bg-panel-soft: #FFF7FC;
  --bg-hover: #F6E8FF;

  /* Brand */
  --primary: #A647D8;
  --primary-dark: #7428A8;
  --primary-light: #EBC8FF;
  --primary-soft: #F3E0FF;

  /* Accents */
  --accent-pink: #FF5CB8;
  --accent-pink-soft: #FFE3F3;
  --accent-cyan: #45C8F5;
  --accent-cyan-soft: #E4F8FF;
  --accent-orange: #FF9A1F;
  --accent-orange-soft: #FFF1D8;
  --accent-green: #23B96F;
  --accent-green-soft: #DDFBEA;

  /* Text */
  --text-main: #3B2348;
  --text-secondary: #7B6688;
  --text-muted: #A38BAF;
  --text-inverse: #FFFFFF;

  /* Borders */
  --border-soft: #E8C9F5;
  --border-strong: #C875EF;
  --border-warm: #FFDFA8;

  /* Shadows */
  --shadow-card: 0 8px 24px rgba(116, 40, 168, 0.12);
  --shadow-card-hover: 0 12px 30px rgba(116, 40, 168, 0.18);
  --shadow-modal: 0 18px 60px rgba(69, 20, 89, 0.28);
  --shadow-button: 0 8px 18px rgba(166, 71, 216, 0.28);

  /* Radius */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  /* Spacing — 8px grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;
}
```

---

## Общие UI primitives

Создать или унифицировать эти классы. Если проект использует CSS modules, перенести названия в module-селекторы. Если Tailwind — заменить на utility-композиции или `@apply`.

### Panel / Card

Использовать для левой карточки задания, правой панели гардероба, карточек одежды, блока результата и соцпоста.

```css
.ui-panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.ui-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.ui-card-soft {
  background: var(--bg-panel-soft);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
}
```

### Typography

```css
.heading-xl {
  font-size: 56px;
  line-height: 1;
  font-weight: 900;
  color: var(--primary);
}

.heading-lg {
  font-size: 24px;
  line-height: 1.2;
  font-weight: 900;
  color: var(--text-main);
}

.heading-md {
  font-size: 18px;
  line-height: 1.25;
  font-weight: 900;
  color: var(--text-main);
}

.body-text {
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
  color: var(--text-secondary);
}

.caption-text {
  font-size: 12px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--text-muted);
}
```

Рекомендация по шрифтам:

1. основной: `Nunito Sans`, `Manrope`, `Inter`, system-ui;
2. заголовки можно оставить тем же шрифтом, но с `font-weight: 800–900`;
3. не использовать больше двух разных семейств шрифтов.

---

## Кнопки

Все крупные действия должны быть `pill`-формы. Убрать тяжёлые чёрные рамки, особенно у кнопки `Опубликовать`.

### Primary button

Использовать для:

- `Опубликовать`;
- `Следующий промо-тур`;
- главных CTA.

```css
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 48px;
  padding: 0 var(--space-5);
  border: 0;
  border-radius: var(--radius-pill);
  background: linear-gradient(180deg, #C75AF2 0%, #9B3ED1 100%);
  color: var(--text-inverse);
  box-shadow: var(--shadow-button);
  font-weight: 900;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}

.button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(166, 71, 216, 0.34);
  filter: brightness(1.02);
}

.button-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-button);
}
```

### Secondary button

Использовать для:

- `Сохранить фото`;
- вторичных действий.

```css
.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 42px;
  padding: 0 var(--space-4);
  border: 1px solid #A8E8FF;
  border-radius: var(--radius-pill);
  background: var(--accent-cyan-soft);
  color: #168BB4;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.button-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(69, 200, 245, 0.22);
}
```

### Reward button

Использовать для:

- `Удвоить награду`;
- бонусов;
- ad reward CTA.

```css
.button-reward {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 42px;
  padding: 0 var(--space-4);
  border: 1px dashed #FFB34D;
  border-radius: var(--radius-pill);
  background: var(--accent-orange-soft);
  color: #D96A00;
  font-weight: 900;
  cursor: pointer;
}
```

---

## Теги / badges

Теги должны выглядеть одинаково в миссии, результате, фильтрах и breakdown-блоках.

```css
.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 28px;
  padding: 0 12px;
  border: 1px solid var(--primary-light);
  border-radius: var(--radius-pill);
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
}

.tag-success {
  border-color: #A7F0C7;
  background: var(--accent-green-soft);
  color: #198A4A;
}

.tag-pink {
  border-color: #FFC2E3;
  background: var(--accent-pink-soft);
  color: #D62988;
}

.tag-orange {
  border-color: #FFD193;
  background: var(--accent-orange-soft);
  color: #D96A00;
}
```

---

## Основной layout

Текущий desktop layout должен остаться похожим по структуре:

```txt
[ Mission panel ]    [ Character stage ]    [ Wardrobe panel ]
                   [ Top stats / publish ]
                   [ Result modal overlay when published ]
```

Рекомендации:

- общий фон сделать более мягким: `linear-gradient(135deg, var(--bg-main), var(--bg-main-2))` поверх bedroom image;
- UI-панели не должны конкурировать с персонажем;
- character stage должен быть главным визуальным фокусом;
- правая wardrobe panel должна быть светлее и спокойнее;
- publish button должен быть фиолетовым gradient pill, а не белым с чёрной рамкой.

Пример:

```css
.game-screen {
  min-height: 100vh;
  color: var(--text-main);
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.55), transparent 32%),
    linear-gradient(135deg, rgba(251, 230, 255, 0.62), rgba(255, 239, 248, 0.54));
}

.game-overlay {
  backdrop-filter: blur(0px);
}
```

---

## Левая карточка миссии

Компонент: `MissionCard`, `TaskCard`, `PromoTask`, или аналогичный.

Должен использовать:

- `ui-panel`;
- padding `24px`;
- radius `24px`;
- thin lavender border;
- title row with small icon;
- tags as `.tag`.

```css
.mission-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-5);
  max-width: 360px;
}

.mission-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid rgba(232, 201, 245, 0.75);
  color: var(--primary);
  font-weight: 900;
}

.mission-card__body {
  padding-top: var(--space-4);
}

.mission-card__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: 20px;
  font-weight: 900;
  color: var(--text-main);
}

.mission-card__description {
  margin: 0 0 var(--space-4);
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.45;
}

.mission-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
```

---

## Top stats bar

Статистика подписчиков и лайков должна быть в мягких pill-контейнерах.

```css
.stats-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 44px;
  padding: 0 var(--space-4);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(12px);
  color: var(--text-main);
  font-weight: 900;
}

.stats-pill__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

---

## Правая панель гардероба

Компоненты: `WardrobePanel`, `Inventory`, `ClosetPanel`, `CategorySidebar`, `ItemGrid`.

Цель:

- убрать ощущение тяжёлой насыщенной фиолетовой стены;
- сделать панель белой/почти белой;
- оставить фиолетовый только для selected/active states;
- карточки вещей должны быть спокойными, с яркой рамкой только при выборе.

```css
.wardrobe-panel {
  background: rgba(255, 255, 255, 0.82);
  border-left: 1px solid var(--border-soft);
  box-shadow: -8px 0 30px rgba(116, 40, 168, 0.10);
  backdrop-filter: blur(16px);
}

.wardrobe-content {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: var(--space-4);
  height: 100%;
  padding: var(--space-4);
}
```

---

## Category buttons

Категории слева в wardrobe panel должны быть одинаковыми card-buttons.

```css
.category-button {
  width: 64px;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  background: var(--bg-panel);
  box-shadow: var(--shadow-card);
  color: var(--primary);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
}

.category-button:hover {
  transform: translateY(-1px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card-hover);
}

.category-button.active,
.category-button[aria-selected='true'] {
  border-color: var(--primary);
  background: linear-gradient(180deg, #FFFFFF 0%, #F3D6FF 100%);
  box-shadow: 0 10px 24px rgba(166, 71, 216, 0.22);
}

.category-button__icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.category-button__label {
  max-width: 58px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## Item grid / карточки вещей

Карточки предметов должны быть чище и менее агрессивными.

```css
.item-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: var(--space-3);
  overflow-y: auto;
  padding-right: var(--space-2);
}

.item-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 160px;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--bg-panel);
  box-shadow: 0 4px 14px rgba(116, 40, 168, 0.08);
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card-hover);
}

.item-card.selected,
.item-card[aria-selected='true'] {
  border: 2px solid var(--primary);
  background: linear-gradient(180deg, #FFFFFF 0%, #F9E9FF 100%);
  box-shadow: 0 10px 26px rgba(166, 71, 216, 0.24);
}

.item-card__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 104px;
  border-radius: 14px;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF7FC 100%);
}

.item-card__image {
  max-width: 100%;
  max-height: 104px;
  object-fit: contain;
}

.item-card__title {
  color: var(--text-main);
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
}

.item-card.selected .item-card__check,
.item-card[aria-selected='true'] .item-card__check {
  display: flex;
}
```

---

## Scrollbar внутри wardrobe

Сделать scrollbar мягким, в том же стиле.

```css
.item-grid::-webkit-scrollbar {
  width: 8px;
}

.item-grid::-webkit-scrollbar-track {
  background: #F6E8FF;
  border-radius: var(--radius-pill);
}

.item-grid::-webkit-scrollbar-thumb {
  background: #C875EF;
  border-radius: var(--radius-pill);
}

.item-grid::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}
```

---

## Result modal

Модалка результата должна стать эталоном для остальных карточек.

Цель:

- белая большая modal card;
- soft shadow;
- clear split: social preview слева, score breakdown справа;
- score `92/100` крупный фиолетовый;
- breakdown rows одинаковые;
- кнопки внизу по единой системе.

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: rgba(59, 35, 72, 0.46);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.result-modal {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(380px, 1fr);
  gap: var(--space-6);
  width: min(1120px, 94vw);
  max-height: 90vh;
  padding: var(--space-5);
  background: var(--bg-panel);
  border: 1px solid rgba(232, 201, 245, 0.92);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  overflow: auto;
}

.result-score-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-4);
}

.result-label {
  color: var(--accent-pink);
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  text-align: center;
}

.result-score {
  color: var(--primary);
  font-size: clamp(48px, 6vw, 72px);
  line-height: 1;
  font-weight: 900;
  text-align: center;
}

.result-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--border-warm);
  border-radius: var(--radius-md);
  background: #FFFDF8;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 900;
}

.result-row__left {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.result-row__value {
  color: var(--primary);
  font-size: 18px;
  font-weight: 900;
}
```

---

## Social post preview

Соцпост должен выглядеть как чистая карточка внутри модалки.

```css
.social-post {
  overflow: hidden;
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.social-post__header,
.social-post__actions,
.social-post__comment {
  padding: var(--space-3) var(--space-4);
}

.social-post__image {
  width: 100%;
  display: block;
  object-fit: cover;
}

.social-post__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--text-main);
  font-size: 13px;
  font-weight: 800;
}

.social-post__comment {
  display: flex;
  gap: var(--space-3);
  border-top: 1px solid rgba(232, 201, 245, 0.7);
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.35;
}
```

---

## Reward / progress blocks

Использовать для блока легенды, прогресса к 1M, follower/like delta cards.

```css
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.metric-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 58px;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-weight: 900;
  text-align: center;
}

.metric-card--followers {
  border: 1px solid var(--primary-light);
  background: #F7ECFF;
  color: var(--primary);
}

.metric-card--likes {
  border: 1px solid #FFC2E3;
  background: var(--accent-pink-soft);
  color: #D62988;
}

.progress-card {
  padding: var(--space-4);
  border: 1px solid rgba(232, 201, 245, 0.9);
  border-radius: var(--radius-md);
  background: var(--bg-panel);
}

.progress-track {
  height: 10px;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: #F1DDFB;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-orange) 0%, var(--accent-pink) 55%, var(--primary) 100%);
}
```

---

## Icons

Иконки должны быть едиными по стилю:

- rounded;
- цветные;
- одинаковый размер внутри одинаковых containers;
- без случайного смешения outline/filled/3D, если это выглядит неоднородно;
- active icon state — через background/border, а не через другой стиль иконки.

Размеры:

```css
.icon-sm { width: 18px; height: 18px; }
.icon-md { width: 24px; height: 24px; }
.icon-lg { width: 32px; height: 32px; }
```

---

## Анимации

Добавить лёгкие, но не агрессивные transitions:

```css
:root {
  --ease-soft: cubic-bezier(0.2, 0.8, 0.2, 1);
}

.interactive-soft {
  transition:
    transform 160ms var(--ease-soft),
    box-shadow 160ms var(--ease-soft),
    border-color 160ms var(--ease-soft),
    background 160ms var(--ease-soft),
    filter 160ms var(--ease-soft);
}
```

Правила:

- hover lift: максимум `translateY(-2px)`;
- selected state должен быть заметным, но не кричащим;
- modal появление можно сделать через opacity + scale `0.98 -> 1`.

---

## Responsive rules

Desktop:

- character stage остаётся центральной зоной;
- mission card слева;
- wardrobe справа;
- result modal centered.

Tablet / narrow:

- wardrobe panel может стать bottom sheet или overlay;
- item grid может стать `repeat(3, 1fr)` или horizontal scroll;
- result modal — single column.

CSS fallback:

```css
@media (max-width: 900px) {
  .result-modal {
    grid-template-columns: 1fr;
    width: min(560px, 94vw);
  }

  .wardrobe-content {
    grid-template-columns: 72px 1fr;
  }

  .item-grid {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
  }
}
```

---

## Пошаговый план для Codex

### 1. Найти UI-компоненты

Найти компоненты, отвечающие за:

- game screen / main scene;
- mission/task card;
- top stats;
- publish button;
- wardrobe/inventory panel;
- category buttons;
- item cards;
- result modal;
- social post preview.

Возможные поисковые запросы по репозиторию:

```txt
Publish
Опубликовать
Promo
Mission
Task
Wardrobe
Inventory
Closet
Category
ItemCard
Result
Score
Modal
Followers
Likes
```

### 2. Добавить design tokens

Добавить `:root` CSS variables из этого документа в глобальные стили.

### 3. Заменить hard-coded colors

Заменить случайные значения вроде:

```css
#000
black
#fff без токена
purple без токена
pink без токена
box-shadow вручную
border-radius вручную
```

на токены:

```css
var(--primary)
var(--border-soft)
var(--shadow-card)
var(--radius-lg)
```

### 4. Унифицировать панели

Все крупные UI-блоки должны использовать один из primitives:

```css
.ui-panel
.ui-card
.ui-card-soft
```

### 5. Переделать кнопку `Опубликовать`

Кнопка должна стать `.button-primary`:

- purple gradient;
- no black border;
- pill shape;
- white bold text;
- soft shadow.

### 6. Упростить правую wardrobe panel

- сделать фон светлым;
- убрать перегруженные purple blocks;
- active category — через gradient/strong border;
- item cards — white cards;
- selected item — `2px solid var(--primary)` + check badge.

### 7. Привести теги к одному компоненту

Все теги `к-поп`, `дерзкий`, successful matched tags должны использовать `.tag`, `.tag-success`.

### 8. Привести result modal к эталону

- modal backdrop blur;
- modal radius `32px`;
- shadow `var(--shadow-modal)`;
- left social post card;
- right result score card;
- CTA buttons use `.button-primary`, `.button-secondary`, `.button-reward`.

### 9. Проверить состояния

У каждого interactive element должны быть:

- default;
- hover;
- active/pressed;
- selected, если применимо;
- disabled, если применимо.

### 10. Финальная чистка

Удалить или заменить:

- толстые чёрные рамки;
- разные border-radius на похожих элементах;
- чрезмерные purple backgrounds;
- случайные shadows;
- непохожие кнопки;
- hard-coded spacing, если оно ломает 8px grid.

---

## Acceptance criteria

После изменений UI считается готовым, если:

- кнопка `Опубликовать` выглядит как главный фиолетовый gradient CTA;
- все крупные панели имеют белый/почти белый фон, lavender border и soft shadow;
- карточки одежды имеют единый размер, radius, border и hover state;
- выбранный предмет явно отличается через purple border/check, но не ломает layout;
- теги в mission card и result modal выглядят одинаково;
- result modal выглядит как часть того же design system;
- нет тяжёлых чёрных рамок в UI;
- spacing выглядит кратным 8px;
- персонаж остаётся главным визуальным фокусом;
- правая панель не перетягивает внимание с персонажа;
- UI выглядит мягким, глянцевым, K-pop/fashion/social-media oriented.

---

## Design QA checklist

Проверить вручную на скриншоте после реализации:

- [ ] Все кнопки pill-shaped.
- [ ] Primary CTA — фиолетовый gradient.
- [ ] Secondary CTA — голубой soft pill.
- [ ] Reward CTA — оранжевый dashed/soft pill.
- [ ] Нет `2–3px` чёрных borders на главных элементах.
- [ ] Все cards имеют radius `16–32px`.
- [ ] Все shadows мягкие, без грязных серых пятен.
- [ ] Tags используют один стиль.
- [ ] Item cards не перегружены фиолетовой рамкой в default state.
- [ ] Active/selected states заметны, но не агрессивны.
- [ ] Modal backdrop blur не скрывает полностью сцену.
- [ ] Score `92/100` крупный и фиолетовый.
- [ ] Follower/like delta cards различаются цветом, но используют один layout.
- [ ] Progress bar использует orange → pink → purple gradient.
- [ ] Текст читаемый на всех панелях.
- [ ] Названия предметов не ломают карточки; используется ellipsis или line clamp.

---

## Пример финального тона UI

```txt
Soft Idol UI:
Белые стеклянные карточки на мягком розово-фиолетовом фоне.
Главные действия — фиолетовый gradient.
Награды — оранжевые акценты.
Лайки — розовые.
Информация — мягкие карточки с тонкой lavender-обводкой.
Все элементы округлые, воздушные, без тяжёлых тёмных контуров.
```

---

## Итоговая инструкция для Codex

Сделай UI restyle текущей игры под дизайн-код **Soft Idol UI**. Сначала добавь design tokens, затем унифицируй panels/cards/buttons/tags/item cards/result modal. Не меняй игровую логику. Убери чёрные тяжёлые рамки и случайные стили. Используй белые панели, lavender borders, soft purple shadows, pill buttons, 8px spacing grid и единые selected/hover states.

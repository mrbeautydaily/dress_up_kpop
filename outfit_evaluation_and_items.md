# Документация: Логика оценки образа и База данных предметов

Этот документ содержит полное математическое описание логики оценки образа (Outfit Evaluation) и подробную базу данных всех предметов (одежда и мебель) с их игровыми тегами для использования при разработке мобильной игры.

## 1. Математическая модель оценки образа

### 1.1. Параметры сущностей
Каждый предмет в игре обладает следующими базовыми параметрами:
*   `outfit_score` ($S$) — базовая сила (оценка) предмета.
*   `rarity` ($R$) — редкость предмета (целое число от 1 до 5).
*   `style` — текстовый тег стиля (например, `sport`, `cozy`, `luxury`).

Сила конкретного предмета в наряде рассчитывается как:
$$P_{\text{item}} = S \times R$$

### 1.2. Расчет общей силы наряда
В оценке наряда участвуют три категории одежды: верх (`bodies`), низ (`bottoms`) и обувь (`shoes`).
$$total\_outfit\_power = P_{\text{body}} + P_{\text{bottom}} + P_{\text{shoes}}$$

### 1.3. Логика трендов
Игра выбирает один из стилей одежды в качестве текущего тренда (`current_trend`).
*   **Множитель тренда (`trend_multiplier`):** Если стиль хотя бы одного выбранного предмета совпадает с `current_trend`, то `trend_multiplier = 2.0`. В противном случае `trend_multiplier = 1.0`.
*   **Количество совпадений (`trend_match_count`):** Количество предметов (от 0 до 3), у которых стиль совпадает с `current_trend`.

### 1.4. Множитель подписчиков
Зависит от текущего количества подписчиков игрока (`followers`):
$$followers\_multiplier = 1 + 0.3 \times \min\left(1.0, \frac{\ln(1 + \frac{followers}{1000})}{\ln(2)}\right)$$

### 1.5. Формулы начисления наград
#### Игровая валюта (лайки/монеты):
$$likes\_gained = \text{round}\Big( (25 + total\_outfit\_power) \times followers\_multiplier \times trend\_multiplier \times 0.6 \Big)$$

#### Прогресс (подписчики):
$$base\_followers = 2 + \text{round}\left(\frac{total\_outfit\_power}{40}\right) + (trend\_match\_count \times 2)$$
$$followers\_gained = \text{round}(base\_followers \times 3.0)$$

---

## 2. База данных предметов одежды

Всего предметов одежды: **92**.

### Верх / Тело (bodies)
Количество предметов: **33**

| ID предмета | Стиль (Тег) | Редкость | Базовая сила (`outfit_score`) | Сила ($S \times R$) | Тип разблокировки | Цена (в лайках) |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| `body_cozy_1` | `cozy` | 1 | 12 | **12** | `locked` | - |
| `body_cozy_2` | `cozy` | 1 | 15 | **15** | `locked` | - |
| `body_cozy_3` | `cozy` | 1 | 18 | **18** | `locked` | - |
| `body_cozy_4` | `cozy` | 1 | 20 | **20** | `locked` | - |
| `body_cozy_5` | `cozy` | 2 | 45 | **90** | `locked` | - |
| `body_cozy_6` | `cozy` | 2 | 55 | **110** | `locked` | - |
| `body_rebel_1` | `rebel` | 2 | 50 | **100** | `rewarded` | - |
| `body_rebel_2` | `rebel` | 2 | 60 | **120** | `locked` | - |
| `body_rebel_3` | `rebel` | 3 | 100 | **300** | `likes` | 25000 |
| `body_rebel_4` | `rebel` | 3 | 112 | **336** | `locked` | - |
| `body_rebel_5` | `rebel` | 3 | 120 | **360** | `rewarded` | - |
| `body_rebel_6` | `rebel` | 3 | 130 | **390** | `likes` | 15000 |
| `body_rebel_7` | `rebel` | 4 | 280 | **1120** | `locked` | - |
| `body_school_1` | `school` | 2 | 45 | **90** | `locked` | - |
| `body_school_2` | `school` | 2 | 58 | **116** | `likes` | 3500 |
| `body_luxury_1` | `luxury` | 3 | 138 | **414** | `locked` | - |
| `body_luxury_2` | `luxury` | 4 | 320 | **1280** | `locked` | - |
| `body_luxury_3` | `luxury` | 4 | 420 | **1680** | `locked` | - |
| `body_luxury_4` | `luxury` | 5 | 800 | **4000** | `locked` | - |
| `body_luxury_5` | `luxury` | 5 | 1100 | **5500** | `likes` | 40000 |
| `body_oversize_1` | `oversize` | 1 | 15 | **15** | `locked` | - |
| `body_oversize_2` | `oversize` | 2 | 45 | **90** | `locked` | - |
| `body_oversize_3` | `oversize` | 2 | 52 | **104** | `locked` | - |
| `body_oversize_4` | `oversize` | 2 | 60 | **120** | `likes` | 500 |
| `body_oversize_5` | `oversize` | 3 | 108 | **324** | `likes` | 3000 |
| `body_oversize_6` | `oversize` | 3 | 122 | **366** | `locked` | - |
| `body_sport_1` | `sport` | 1 | 10 | **10** | `locked` | - |
| `body_sport_2` | `sport` | 1 | 15 | **15** | `locked` | - |
| `body_sport_3` | `sport` | 2 | 42 | **84** | `locked` | - |
| `body_sport_4` | `sport` | 2 | 50 | **100** | `locked` | - |
| `body_sport_5` | `sport` | 2 | 55 | **110** | `rewarded` | - |
| `body_sport_6` | `sport` | 2 | 62 | **124** | `locked` | - |
| `body_sport_7` | `sport` | 3 | 110 | **330** | `locked` | - |


### Низ (bottoms)
Количество предметов: **23**

| ID предмета | Стиль (Тег) | Редкость | Базовая сила (`outfit_score`) | Сила ($S \times R$) | Тип разблокировки | Цена (в лайках) |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| `bottom_casual_1` | `casual` | 1 | 10 | **10** | `locked` | - |
| `bottom_cozy_1` | `cozy` | 1 | 10 | **10** | `rewarded` | - |
| `bottom_cozy_2` | `cozy` | 1 | 12 | **12** | `likes` | 350 |
| `bottom_cozy_3` | `cozy` | 1 | 15 | **15** | `rewarded` | - |
| `bottom_cozy_4` | `cozy` | 1 | 20 | **20** | `locked` | - |
| `bottom_cozy_5` | `cozy` | 2 | 45 | **90** | `locked` | - |
| `bottom_rebel_1` | `rebel` | 2 | 60 | **120** | `rewarded` | - |
| `bottom_rebel_2` | `rebel` | 3 | 105 | **315** | `locked` | - |
| `bottom_rebel_3` | `rebel` | 3 | 125 | **375** | `locked` | - |
| `bottom_rebel_4` | `rebel` | 4 | 300 | **1200** | `locked` | - |
| `bottom_school_1` | `school` | 2 | 45 | **90** | `locked` | - |
| `bottom_school_2` | `school` | 2 | 58 | **116** | `locked` | - |
| `bottom_luxury_1` | `luxury` | 3 | 135 | **405** | `locked` | - |
| `bottom_luxury_2` | `luxury` | 4 | 350 | **1400** | `likes` | 50000 |
| `bottom_luxury_3` | `luxury` | 4 | 450 | **1800** | `locked` | - |
| `bottom_luxury_4` | `luxury` | 5 | 900 | **4500** | `locked` | - |
| `bottom_oversize_1` | `oversize` | 1 | 15 | **15** | `locked` | - |
| `bottom_oversize_2` | `oversize` | 2 | 48 | **96** | `locked` | - |
| `bottom_oversize_3` | `oversize` | 2 | 58 | **116** | `rewarded` | - |
| `bottom_sport_1` | `sport` | 1 | 10 | **10** | `locked` | - |
| `bottom_sport_2` | `sport` | 1 | 15 | **15** | `likes` | 700 |
| `bottom_sport_3` | `sport` | 2 | 42 | **84** | `locked` | - |
| `bottom_sport_4` | `sport` | 2 | 55 | **110** | `locked` | - |


### Обувь (shoes)
Количество предметов: **26**

| ID предмета | Стиль (Тег) | Редкость | Базовая сила (`outfit_score`) | Сила ($S \times R$) | Тип разблокировки | Цена (в лайках) |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| `shoes_casual_1` | `casual` | 1 | 10 | **10** | `locked` | - |
| `shoes_casual_2` | `casual` | 1 | 12 | **12** | `locked` | - |
| `shoes_casual_3` | `casual` | 1 | 15 | **15** | `locked` | - |
| `shoes_cozy_1` | `cozy` | 1 | 10 | **10** | `locked` | - |
| `shoes_cozy_2` | `cozy` | 1 | 12 | **12** | `locked` | - |
| `shoes_cozy_3` | `cozy` | 1 | 15 | **15** | `locked` | - |
| `shoes_cozy_4` | `cozy` | 1 | 18 | **18** | `likes` | 1500 |
| `shoes_cozy_5` | `cozy` | 2 | 42 | **84** | `locked` | - |
| `shoes_rebel_1` | `rebel` | 2 | 52 | **104** | `locked` | - |
| `shoes_rebel_2` | `rebel` | 3 | 110 | **330** | `locked` | - |
| `shoes_rebel_3` | `rebel` | 3 | 122 | **366** | `locked` | - |
| `shoes_rebel_4` | `rebel` | 1 | 35 | **35** | `locked` | - |
| `shoes_rebel_5` | `rebel` | 3 | 132 | **396** | `rewarded` | - |
| `shoes_school_1` | `school` | 2 | 45 | **90** | `locked` | - |
| `shoes_school_2` | `school` | 2 | 55 | **110** | `locked` | - |
| `shoes_school_3` | `school` | 3 | 105 | **315** | `locked` | - |
| `shoes_school_4` | `school` | 3 | 118 | **354** | `locked` | - |
| `shoes_luxury_1` | `luxury` | 3 | 138 | **414** | `locked` | - |
| `shoes_luxury_2` | `luxury` | 4 | 340 | **1360** | `locked` | - |
| `shoes_luxury_3` | `luxury` | 4 | 440 | **1760** | `locked` | - |
| `shoes_luxury_4` | `luxury` | 5 | 950 | **4750** | `locked` | - |
| `shoes_oversize_1` | `oversize` | 1 | 15 | **15** | `locked` | - |
| `shoes_oversize_2` | `oversize` | 2 | 42 | **84** | `locked` | - |
| `shoes_oversize_3` | `oversize` | 2 | 52 | **104** | `locked` | - |
| `shoes_oversize_4` | `oversize` | 2 | 62 | **124** | `locked` | - |
| `shoes_sport_1` | `sport` | 1 | 12 | **12** | `locked` | - |


### Прически (hairs)
Количество предметов: **10**

| ID предмета | Стиль (Тег) | Редкость | Базовая сила (`outfit_score`) | Сила ($S \times R$) | Тип разблокировки | Цена (в лайках) |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| `hairs_style_1` | `hair_straight` | 1 | 10 | **10** | `locked` | - |
| `hairs_style_2` | `hair_wavy` | 1 | 10 | **10** | `likes` | 500 |
| `hairs_style_3` | `hair_ponytail` | 1 | 12 | **12** | `likes` | 2500 |
| `hairs_style_4` | `hair_braids` | 1 | 12 | **12** | `locked` | - |
| `hairs_style_5` | `hair_pigtails` | 1 | 14 | **14** | `locked` | - |
| `hairs_style_6` | `hair_bob` | 1 | 14 | **14** | `locked` | - |
| `hairs_style_7` | `hair_buns` | 1 | 16 | **16** | `locked` | - |
| `hairs_style_8` | `hair_bun` | 1 | 16 | **16** | `locked` | - |
| `hairs_style_9` | `hair_knot` | 1 | 18 | **18** | `likes` | 750 |
| `hairs_style_10` | `hair_double` | 1 | 18 | **18** | `locked` | - |


---

## 3. База данных предметов мебели (Декор)

Всего предметов мебели: **60** (напольная: 41, настенная: 19).

> [!NOTE]
> Предметы мебели не имеют параметра `outfit_score`, так как они используются исключительно для кастомизации комнаты персонажа и не участвуют в расчете силы наряда в видео.

### Напольная мебель (furniture_floor)
| ID предмета | Тег стиля | Редкость | Тип разблокировки | Цена (в лайках) |
| :--- | :--- | :---: | :--- | :---: |
| `floor_item_1` | `creator` | 1 | `likes` | 500 |
| `floor_item_2` | `creator` | 1 | `locked` | - |
| `floor_item_3` | `creator` | 1 | `locked` | - |
| `floor_item_4` | `creator` | 1 | `rewarded` | - |
| `floor_item_5` | `creator` | 1 | `likes` | 2000 |
| `floor_item_6` | `creator` | 1 | `locked` | - |
| `floor_item_7` | `creator` | 1 | `locked` | - |
| `floor_item_8` | `creator` | 1 | `likes` | 350 |
| `floor_item_9` | `creator` | 1 | `locked` | - |
| `floor_item_10` | `creator` | 1 | `locked` | - |
| `floor_item_11` | `creator` | 1 | `locked` | - |
| `floor_item_12` | `creator` | 1 | `locked` | - |
| `floor_item_13` | `creator` | 1 | `rewarded` | - |
| `floor_item_14` | `creator` | 1 | `locked` | - |
| `floor_item_15` | `creator` | 1 | `locked` | - |
| `floor_item_16` | `creator` | 1 | `locked` | - |
| `floor_item_17` | `creator` | 1 | `locked` | - |
| `floor_item_18` | `creator` | 1 | `likes` | 7000 |
| `floor_item_19` | `creator` | 1 | `rewarded` | - |
| `floor_item_20` | `creator` | 1 | `rewarded` | - |
| `floor_item_21` | `creator` | 1 | `locked` | - |
| `floor_item_22` | `creator` | 1 | `locked` | - |
| `floor_item_23` | `creator` | 1 | `likes` | 15000 |
| `floor_item_25` | `creator` | 1 | `locked` | - |
| `floor_item_26` | `creator` | 1 | `likes` | 5000 |
| `floor_item_27` | `creator` | 1 | `locked` | - |
| `floor_item_28` | `creator` | 1 | `likes` | 1000 |
| `floor_item_29` | `creator` | 1 | `locked` | - |
| `floor_item_30` | `creator` | 1 | `locked` | - |
| `floor_item_31` | `creator` | 1 | `likes` | 1500 |
| `floor_item_32` | `creator` | 1 | `locked` | - |
| `floor_item_33` | `creator` | 1 | `locked` | - |
| `floor_item_34` | `creator` | 1 | `rewarded` | - |
| `floor_item_35` | `creator` | 1 | `likes` | 500 |
| `floor_item_36` | `creator` | 1 | `locked` | - |
| `floor_item_37` | `creator` | 1 | `locked` | - |
| `floor_item_38` | `creator` | 1 | `locked` | - |
| `floor_item_39` | `creator` | 1 | `likes` | 20000 |
| `floor_item_40` | `creator` | 1 | `locked` | - |
| `floor_item_41` | `creator` | 1 | `locked` | - |
| `floor_item_42` | `creator` | 1 | `rewarded` | - |


### Настенная мебель (furniture_wall)
| ID предмета | Тег стиля | Редкость | Тип разблокировки | Цена (в лайках) |
| :--- | :--- | :---: | :--- | :---: |
| `wall_item_1` | `pro` | 1 | `likes` | 150 |
| `wall_item_2` | `pro` | 1 | `locked` | - |
| `wall_item_3` | `pro` | 1 | `likes` | 30000 |
| `wall_item_4` | `pro` | 1 | `locked` | - |
| `wall_item_5` | `pro` | 1 | `locked` | - |
| `wall_item_6` | `pro` | 1 | `locked` | - |
| `wall_item_7` | `pro` | 1 | `likes` | 10000 |
| `wall_item_8` | `pro` | 1 | `rewarded` | - |
| `wall_item_9` | `pro` | 1 | `locked` | - |
| `wall_item_10` | `vibes` | 2 | `locked` | - |
| `wall_item_11` | `vibes` | 2 | `likes` | 5000 |
| `wall_item_12` | `vibes` | 2 | `locked` | - |
| `wall_item_13` | `vibes` | 2 | `likes` | 750 |
| `wall_item_14` | `vibes` | 2 | `locked` | - |
| `wall_item_15` | `vibes` | 2 | `likes` | 250 |
| `wall_item_16` | `vibes` | 2 | `likes` | 500 |
| `wall_item_17` | `vibes` | 2 | `rewarded` | - |
| `wall_item_18` | `vibes` | 2 | `rewarded` | - |
| `wall_item_19` | `vibes` | 2 | `locked` | - |


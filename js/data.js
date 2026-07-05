const $ = id => document.getElementById(id);

const STAR_PACKAGES = [
  { id: 'stars_30',  likes:  3000, bonus: 0,     icon: 'Items/UI/shop_heart_1.png' },
  { id: 'stars_150', likes: 15000, bonus: 0,     icon: 'Items/UI/shop_heart_2.png' },
  { id: 'stars_300', likes: 30000, bonus: 3000,  icon: 'Items/UI/shop_heart_3.png', popular: true },
  { id: 'stars_600', likes: 60000, bonus: 10000, icon: 'Items/UI/shop_heart_4.png' },
];

// ────────────────────────────────────────────────────────────
// CLOTHES DATA
/// Each item: name (EN), name_ru (RU), tags, pos, src
// ────────────────────────────────────────────────────────────

const clothes = {

  // ── HAIR ──────────────────────────────────────────────────
  hair: [
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
    { id:'top_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'top_dress_new_1', name:'K-Pop Dress', name_ru:'K-Pop платье', src:'Items/Dress/dress_new_1.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute','pastel','formal','elegant'], sub:'dresses' },
    { id:'black_lace_crop_top', name:'Black Lace Crop Top', name_ru:'Черный кружевной кроп-топ', src:'Items/Shirt/black_lace_crop_top.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'blouses' },
    { id:'kpop_sequin_crop_top', name:'Sequin Crop Top', name_ru:'Кроп-топ с пайетками', src:'Items/Shirt/kpop_sequin_crop_top.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','pastel','cute'], sub:'blouses' },
    { id:'casual_hoodie', name:'Oversized Hoodie', name_ru:'Объемное худи', src:'Items/Shirt/casual_hoodie.png', pos:{left:0,top:0,width:100}, tags:['casual','sporty'], sub:'blouses' },
    { id:'pink_y2k_cardigan', name:'Pink Y2K Cardigan', name_ru:'Розовый Y2K кардиган', src:'Items/Shirt/pink_y2k_cardigan.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','kpop'], sub:'blouses' },
    { id:'gothic_mini_dress', name:'Gothic Mini Dress', name_ru:'Готическое mini-платье', src:'Items/Dress/gothic_mini_dress.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'dresses' },
    { id:'navy_sailor_dress', name:'Navy Sailor Dress', name_ru:'Синее матросское платье', src:'Items/Dress/navy_sailor_dress.png', pos:{left:0,top:0,width:100}, tags:['school','cute','formal'], sub:'dresses' },
    { id:'pink_sequin_dress', name:'Pink Sequin Dress', name_ru:'Розовое блестящее платье', src:'Items/Dress/pink_sequin_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','elegant','pastel','cute'], sub:'dresses' },
    { id:'school_uniform_dress', name:'School Uniform Dress', name_ru:'Школьная форма', src:'Items/Dress/school_uniform_dress.png', pos:{left:0,top:0,width:100}, tags:['school','formal','casual'], sub:'blouses' },
    { id:'silver_bodycon_dress', name:'Silver Bodycon Dress', name_ru:'Серебристое облегающее платье', src:'Items/Dress/silver_bodycon_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','elegant'], sub:'dresses' },
    
    // 16 новых топов
    { id:'athletic_track_jacket', name:'Athletic Track Jacket', name_ru:'Спортивная ветровка', src:'Items/Shirt/athletic_track_jacket.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'blouses' },
    { id:'beige_cable_sweater', name:'Beige Cable Sweater', name_ru:'Бежевый вязаный свитер', src:'Items/Shirt/beige_cable_sweater.png', pos:{left:0,top:0,width:100}, tags:['casual','pastel'], sub:'blouses' },
    { id:'crimson_corset', name:'Crimson Corset', name_ru:'Малиновый корсет', src:'Items/Shirt/crimson_corset.png', pos:{left:0,top:0,width:100}, tags:['bold','elegant','kpop'], sub:'blouses' },
    { id:'cropped_black_leather_jacket', name:'Cropped Leather Jacket', name_ru:'Черная кожаная косуха', src:'Items/Shirt/cropped_black_leather_jacket.png', pos:{left:0,top:0,width:100}, tags:['bold','dark','gothic'], sub:'blouses' },
    { id:'cropped_cardigan', name:'Cropped Cardigan', name_ru:'Укороченный кардиган', src:'Items/Shirt/cropped_cardigan.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel'], sub:'blouses' },
    { id:'futuristic_crop_top', name:'Futuristic Crop Top', name_ru:'Футуристичный кроп-топ', src:'Items/Shirt/futuristic_crop_top.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'], sub:'blouses' },
    { id:'gothic_velvet_top_1', name:'Gothic Velvet Top I', name_ru:'Готический бархатный топ I', src:'Items/Shirt/gothic_velvet_top_1.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'blouses' },
    { id:'gothic_velvet_top_2', name:'Gothic Velvet Top II', name_ru:'Готический бархатный топ II', src:'Items/Shirt/gothic_velvet_top_2.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'blouses' },
    { id:'grunge_knit_sweater', name:'Grunge Knit Sweater', name_ru:'Гранжевый рваный свитер', src:'Items/Shirt/grunge_knit_sweater.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','casual'], sub:'blouses' },
    { id:'kpop_stage_top', name:'K-Pop Stage Top', name_ru:'Сценический кроп-топ', src:'Items/Shirt/kpop_stage_top.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','cute'], sub:'blouses' },
    { id:'kpop_top_set_lavender', name:'Lavender Stage Top', name_ru:'Лавандовый топ-сет', src:'Items/Shirt/kpop_top_set_lavender.png', pos:{left:0,top:0,width:100}, tags:['kpop','pastel','cute'], sub:'blouses' },
    { id:'lavender_sweatshirt', name:'Lavender Sweatshirt', name_ru:'Лавандовый свитшот', src:'Items/Shirt/lavender_sweatshirt.png', pos:{left:0,top:0,width:100}, tags:['casual','pastel'], sub:'blouses' },
    { id:'layered_cherry_top', name:'Cherry Print Top', name_ru:'Топ с вишневым принтом', src:'Items/Shirt/layered_cherry_top.png', pos:{left:0,top:0,width:100}, tags:['cute','casual'], sub:'blouses' },
    { id:'navy_sweater_vest', name:'Navy Sweater Vest', name_ru:'Школьный вязаный жилет', src:'Items/Shirt/navy_sweater_vest.png', pos:{left:0,top:0,width:100}, tags:['school','formal','casual'], sub:'blouses' },
    { id:'puffer_vest_tshirt', name:'Puffer Vest Over T-Shirt', name_ru:'Дутый жилет с футболкой', src:'Items/Shirt/puffer_vest_tshirt.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'blouses' },
    { id:'white_blouse_black_bow', name:'White Blouse with Bow', name_ru:'Блузка с черным бантом', src:'Items/Shirt/white_blouse_black_bow.png', pos:{left:0,top:0,width:100}, tags:['school','formal','elegant'], sub:'blouses' },

    // 13 новых платьев
    { id:'beige_cable_knit_dress', name:'Beige Cable-Knit Dress', name_ru:'Бежевое вязаное платье', src:'Items/Dress/beige_cable_knit_dress.png', pos:{left:0,top:0,width:100}, tags:['casual','pastel','elegant'], sub:'dresses' },
    { id:'gothic_lolita_dress_1', name:'Gothic Lolita Dress I', name_ru:'Платье Готическая Лолита I', src:'Items/Dress/gothic_lolita_dress_1.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','cute'], sub:'dresses' },
    { id:'gothic_lolita_dress_2', name:'Gothic Lolita Dress II', name_ru:'Платье Готическая Лолита II', src:'Items/Dress/gothic_lolita_dress_2.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','cute'], sub:'dresses' },
    { id:'gothic_stage_dress', name:'Gothic Stage Dress', name_ru:'Сценическое готик-платье', src:'Items/Dress/gothic_stage_dress.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold','kpop'], sub:'dresses' },
    { id:'kpop_stage_dress', name:'K-Pop Stage Dress', name_ru:'Яркое сценическое платье', src:'Items/Dress/kpop_stage_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','cute'], sub:'dresses' },
    { id:'tank_dress_with_jacket', name:'Tank Dress with Jacket', name_ru:'Платье с курткой', src:'Items/Dress/tank_dress_with_jacket.png', pos:{left:0,top:0,width:100}, tags:['casual','sporty'], sub:'dresses' },
    { id:'simple_mini_dress', name:'Simple Mini Dress', name_ru:'Простое мини-платье', src:'Items/Dress/simple_mini_dress.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'dresses' },
    { id:'navy_chiffon_star_dress', name:'Navy Chiffon Star Dress', name_ru:'Шифоновое платье со звездами', src:'Items/Dress/navy_chiffon_star_dress.png', pos:{left:0,top:0,width:100}, tags:['elegant','pastel','kpop'], sub:'dresses' },
    { id:'pinafore_dress_blouse', name:'Pinafore School Dress', name_ru:'Сарафан поверх блузки', src:'Items/Dress/pinafore_dress_blouse.png', pos:{left:0,top:0,width:100}, tags:['school','formal','cute'], sub:'dresses' },
    { id:'polo_mini_dress', name:'Polo Mini Dress', name_ru:'Спортивное платье-поло', src:'Items/Dress/polo_mini_dress.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'dresses' },
    { id:'red_tartan_plaid_dress', name:'Red Tartan Plaid Dress', name_ru:'Платье в красную клетку', src:'Items/Dress/red_tartan_plaid_dress.png', pos:{left:0,top:0,width:100}, tags:['school','casual','cute'], sub:'dresses' },
    { id:'ribbed_knit_pastel_dress', name:'Ribbed Knit Pastel Dress', name_ru:'Трикотажное нежное платье', src:'Items/Dress/ribbed_knit_pastel_dress.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','casual'], sub:'dresses' },
    { id:'sleeveless_sequin_dress', name:'Sleeveless Sequin Dress', name_ru:'Серебристое платье без рукавов', src:'Items/Dress/sleeveless_sequin_dress.png', pos:{left:0,top:0,width:100}, tags:['kpop','elegant','bold'], sub:'dresses' }
  ],

  // ── BOTTOMS ───────────────────────────────────────────────
  bottoms: [
    { id:'bot_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'athletic_joggers', name:'Athletic Joggers', name_ru:'Спортивные джоггеры', src:'Items/Legs/Jeans/athletic_joggers.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'pants' },
    { id:'gothic_shorts', name:'Gothic Leather Shorts', name_ru:'Готические шорты', src:'Items/Legs/Jeans/gothic_shorts.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'], sub:'pants' },
    { id:'y2k_cargo_pants', name:'Y2K Cargo Pants', name_ru:'Широкие брюки карго', src:'Items/Legs/Jeans/y2k_cargo_pants.png', pos:{left:0,top:0,width:100}, tags:['casual','bold','sporty'], sub:'pants' },
    { id:'kpop_ruffled_skirt', name:'Ruffled Mini Skirt', name_ru:'Мини-юбка с оборками', src:'Items/Legs/Skirt/kpop_ruffled_skirt.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute','pastel'], sub:'skirts' },
    { id:'kpop_plaid_skirt', name:'Plaid Pleated Skirt', name_ru:'Плиссированная юбка в клетку', src:'Items/Legs/Skirt/kpop_plaid_skirt.png', pos:{left:0,top:0,width:100}, tags:['school','cute','formal'], sub:'skirts' },
    { id:'kpop_style_skirt_1', name:'K-Pop Skirt I', name_ru:'K-Pop юбка I', src:'Items/Legs/Skirt/kpop_style_skirt_1.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute'], sub:'skirts' },
    { id:'kpop_style_skirt_2', name:'K-Pop Skirt II', name_ru:'K-Pop юбка II', src:'Items/Legs/Skirt/kpop_style_skirt_2.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'], sub:'skirts' },
    { id:'kpop_style_skirt_3', name:'K-Pop Skirt III', name_ru:'K-Pop юбка III', src:'Items/Legs/Skirt/kpop_style_skirt_3.png', pos:{left:0,top:0,width:100}, tags:['kpop','elegant'], sub:'skirts' },
    { id:'pleated_mini_skirt_classic', name:'Classic Pleated Skirt', name_ru:'Классическая плиссированная юбка', src:'Items/Legs/Skirt/pleated_mini_skirt_classic.png', pos:{left:0,top:0,width:100}, tags:['school','casual'], sub:'skirts' },
    
    // 4 новых брюк/шорт
    { id:'classic_pants', name:'Classic Trousers', name_ru:'Классические брюки', src:'Items/Legs/Jeans/classic_pants.png', pos:{left:0,top:0,width:100}, tags:['formal','school','casual'], sub:'pants' },
    { id:'running_shorts', name:'Running Shorts', name_ru:'Спортивные шорты', src:'Items/Legs/Jeans/running_shorts.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'], sub:'pants' },
    { id:'tailored_shorts', name:'Tailored Shorts', name_ru:'Строгие шорты', src:'Items/Legs/Jeans/tailored_shorts.png', pos:{left:0,top:0,width:100}, tags:['formal','school'], sub:'pants' },
    { id:'stylish_cargo_pants', name:'Stylish Cargo Pants', name_ru:'Стильные брюки карго', src:'Items/Legs/Jeans/stylish_cargo_pants.png', pos:{left:0,top:0,width:100}, tags:['casual','bold','sporty'], sub:'pants' },

    // 6 новых юбок
    { id:'mini_skirt_basic_1', name:'Basic Mini Skirt I', name_ru:'Базовая мини-юбка I', src:'Items/Legs/Skirt/mini_skirt_basic_1.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'skirts' },
    { id:'mini_skirt_basic_2', name:'Basic Mini Skirt II', name_ru:'Базовая мини-юбка II', src:'Items/Legs/Skirt/mini_skirt_basic_2.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'skirts' },
    { id:'navy_chiffon_skirt', name:'Navy Chiffon Skirt', name_ru:'Синяя шифоновая юбка', src:'Items/Legs/Skirt/navy_chiffon_skirt.png', pos:{left:0,top:0,width:100}, tags:['elegant','cute','pastel'], sub:'skirts' },
    { id:'pleated_mini_skirt_new', name:'Pleated Mini Skirt', name_ru:'Плиссированная мини-юбка', src:'Items/Legs/Skirt/pleated_mini_skirt_new.png', pos:{left:0,top:0,width:100}, tags:['school','casual','cute'], sub:'skirts' },
    { id:'silver_metallic_skirt', name:'Silver Metallic Skirt', name_ru:'Серебристая блестящая юбка', src:'Items/Legs/Skirt/silver_metallic_skirt.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'], sub:'skirts' },
    { id:'y2k_denim_mini_skirt', name:'Y2K Denim Mini Skirt', name_ru:'Джинсовая мини-юбка Y2K', src:'Items/Legs/Skirt/y2k_denim_mini_skirt.png', pos:{left:0,top:0,width:100}, tags:['casual','cute'], sub:'skirts' }
  ],

  // ── SHOES ─────────────────────────────────────────────────
  shoes: [
    { id:'shoe_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'gothic_combat_boots', name:'Gothic Combat Boots', name_ru:'Готические армейские ботинки', src:'Items/Shoes/gothic_combat_boots.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'classic_loafers', name:'Classic Loafers', name_ru:'Классические лоферы', src:'Items/Shoes/classic_loafers.png', pos:{left:0,top:0,width:100}, tags:['school','formal','elegant'] },
    { id:'pink_hightop_sneakers', name:'Pink High-Top Sneakers', name_ru:'Розовые высокие кеды', src:'Items/Shoes/pink_hightop_sneakers.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','sporty'] },
    { id:'sporty_sneakers', name:'Sporty Sneakers', name_ru:'Спортивные кроссовки', src:'Items/Shoes/sporty_sneakers.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'] },
    { id:'white_high_heels', name:'White High Heels', name_ru:'Белые лаковые туфли', src:'Items/Shoes/white_high_heels.png', pos:{left:0,top:0,width:100}, tags:['elegant','formal','kpop'] },
    
    // 15 новых пар обуви
    { id:'black_sneakers', name:'Black Sneakers', name_ru:'Черные кеды', src:'Items/Shoes/black_sneakers.png', pos:{left:0,top:0,width:100}, tags:['casual','sporty'] },
    { id:'classic_boots', name:'Classic Boots', name_ru:'Осенние ботинки', src:'Items/Shoes/classic_boots.png', pos:{left:0,top:0,width:100}, tags:['casual','school'] },
    { id:'brown_oxford_shoes', name:'Brown Oxford Shoes', name_ru:'Коричневые оксфорды', src:'Items/Shoes/brown_oxford_shoes.png', pos:{left:0,top:0,width:100}, tags:['school','formal','elegant'] },
    { id:'futuristic_boots', name:'Futuristic Boots', name_ru:'Футуристичные сапоги', src:'Items/Shoes/futuristic_boots.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold'] },
    { id:'gothic_high_boots', name:'Gothic High Boots', name_ru:'Высокие готические сапоги', src:'Items/Shoes/gothic_high_boots.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'gothic_combat_boots_2', name:'Gothic Combat Boots II', name_ru:'Готические ботинки II', src:'Items/Shoes/gothic_combat_boots_2.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'gothic_creeper_shoes', name:'Gothic Creeper Shoes', name_ru:'Готические криперы', src:'Items/Shoes/gothic_creeper_shoes.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','casual'] },
    { id:'glam_high_heels', name:'Glam High Heels', name_ru:'Элегантные туфли на шпильке', src:'Items/Shoes/glam_high_heels.png', pos:{left:0,top:0,width:100}, tags:['elegant','formal','kpop'] },
    { id:'loafers_new', name:'Classic Black Loafers', name_ru:'Черные лоферы', src:'Items/Shoes/loafers_new.png', pos:{left:0,top:0,width:100}, tags:['school','formal'] },
    { id:'mary_jane_shoes', name:'Mary Jane Shoes', name_ru:'Туфли Мэри Джейн', src:'Items/Shoes/mary_jane_shoes.png', pos:{left:0,top:0,width:100}, tags:['school','cute','formal'] },
    { id:'pink_mary_jane_shoes', name:'Pink Mary Jane Shoes', name_ru:'Розовые туфли Мэри Джейн', src:'Items/Shoes/pink_mary_jane_shoes.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel'] },
    { id:'silver_metallic_boots', name:'Silver Metallic Boots', name_ru:'Серебристые сапоги', src:'Items/Shoes/silver_metallic_boots.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','elegant'] },
    { id:'sneakers_basic', name:'Basic Sneakers', name_ru:'Базовые кроссовки', src:'Items/Shoes/sneakers_basic.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'] },
    { id:'white_red_sneakers', name:'White & Red Sneakers', name_ru:'Бело-красные кроссовки', src:'Items/Shoes/white_red_sneakers.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual','kpop'] }
  ],

  // ── ACCESSORIES ───────────────────────────────────────────
  socks: [
    { id:'sock_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'gothic_fishnet_stockings', name:'Fishnet Stockings', name_ru:'Колготки в сеточку', src:'Items/Socks/gothic_fishnet_stockings.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'white_frilly_socks', name:'Frilly Knee-High Socks', name_ru:'Гольфы с рюшами', src:'Items/Socks/white_frilly_socks.png', pos:{left:0,top:0,width:100}, tags:['cute','school','pastel'] },
    { id:'y2k_overknee_socks', name:'Y2K Over-Knee Socks', name_ru:'Гольфы выше колена Y2K', src:'Items/Socks/y2k_overknee_socks.png', pos:{left:0,top:0,width:100}, tags:['casual','cute','school'] },
    
    // 5 новых носков
    { id:'gothic_thigh_high_stockings', name:'Gothic Thigh-High Stockings', name_ru:'Готические чулки', src:'Items/Socks/gothic_thigh_high_stockings.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'kpop_patterned_stockings', name:'K-Pop Patterned Stockings', name_ru:'K-Pop колготки', src:'Items/Socks/kpop_patterned_stockings.png', pos:{left:0,top:0,width:100}, tags:['kpop','cute','bold'] },
    { id:'casual_white_socks', name:'Casual White Socks', name_ru:'Белые носки', src:'Items/Socks/casual_white_socks.png', pos:{left:0,top:0,width:100}, tags:['casual','school'] },
    { id:'stage_glitter_tights', name:'Stage Glitter Tights', name_ru:'Блестящие колготки', src:'Items/Socks/stage_glitter_tights.png', pos:{left:0,top:0,width:100}, tags:['kpop','bold','elegant'] },
    { id:'striped_sporty_socks', name:'Striped Sporty Socks', name_ru:'Спортивные носки в полоску', src:'Items/Socks/striped_sporty_socks.png', pos:{left:0,top:0,width:100}, tags:['sporty','casual'] },
    
    // Новейшие гольфы
    { id:'white_knee_high_socks_classic', name:'Classic White Knee-High Socks', name_ru:'Классические белые гольфы', src:'Items/Socks/white_knee_high_socks_classic.png', pos:{left:0,top:0,width:100}, tags:['school','formal','cute'] }
  ],

  accessories: [
    { id:'acc_none', name:'None', name_ru:'Нет', src:null, pos:null, tags:[] },
    { id:'gothic_cross_choker', name:'Gothic Cross Choker', name_ru:'Готический чокер с крестом', src:'Items/Accessories/gothic_cross_choker.png', pos:{left:0,top:0,width:100}, tags:['gothic','dark','bold'] },
    { id:'accessories_headphones', name:'Idol Headphones', name_ru:'Наушники идола', src:'Items/Accessories/accessories_headphones.png', pos:{left:0,top:0,width:100}, tags:['kpop','casual','sporty'] },
    
    // 3 новых аксессуара
    { id:'cyber_goggles', name:'Cyber Goggles', name_ru:'Кибер-очки', src:'Items/Accessories/cyber_goggles.png', pos:{left:0,top:0,width:100}, tags:['bold','kpop'] },
    { id:'headphones_on_head', name:'Stylish Headphones', name_ru:'Стильные наушники', src:'Items/Accessories/headphones_on_head.png', pos:{left:0,top:0,width:100}, tags:['kpop','casual','sporty'] },
    { id:'pink_heart_bag', name:'Pink Heart Bag', name_ru:'Розовая сумка-сердце', src:'Items/Accessories/pink_heart_bag.png', pos:{left:0,top:0,width:100}, tags:['cute','pastel','kpop'] }
  ],
};

// ────────────────────────────────────────────────────────────
// PROGRESSION — ITEMS & COSTS
// ────────────────────────────────────────────────────────────

const FREE_ITEMS = new Set([
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
  
  // Ранее добавленные бесплатные вещи
  'kpop_sequin_crop_top',
  'casual_hoodie',
  'navy_sailor_dress',
  'school_uniform_dress',
  'athletic_joggers',
  'kpop_plaid_skirt',
  'pleated_mini_skirt_classic',
  'classic_loafers',
  'sporty_sneakers',
  'white_frilly_socks',
  'y2k_overknee_socks',
  'accessories_headphones',

  // Новые бесплатные вещи из 54 ассетов
  'athletic_track_jacket',
  'beige_cable_sweater',
  'cropped_cardigan',
  'lavender_sweatshirt',
  'layered_cherry_top',
  'navy_sweater_vest',
  'puffer_vest_tshirt',
  'white_blouse_black_bow',
  'tank_dress_with_jacket',
  'simple_mini_dress',
  'pinafore_dress_blouse',
  'polo_mini_dress',
  'red_tartan_plaid_dress',
  'classic_pants',
  'running_shorts',
  'tailored_shorts',
  'mini_skirt_basic_1',
  'mini_skirt_basic_2',
  'pleated_mini_skirt_new',
  'y2k_denim_mini_skirt',
  'black_sneakers',
  'classic_boots',
  'brown_oxford_shoes',
  'loafers_new',
  'mary_jane_shoes',
  'sneakers_basic',
  'white_red_sneakers',
  
  // Новейшие бесплатные вещи (носки и аксессуары)
  'casual_white_socks',
  'striped_sporty_socks',
  'headphones_on_head',
  'white_knee_high_socks_classic'
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
  'spiky_pixie_teal_blue': 30,
  
  // Ранее добавленные платные вещи
  'black_lace_crop_top': 25,
  'pink_y2k_cardigan': 30,
  'gothic_mini_dress': 40,
  'pink_sequin_dress': 35,
  'silver_bodycon_dress': 45,
  'gothic_shorts': 30,
  'y2k_cargo_pants': 35,
  'kpop_ruffled_skirt': 30,
  'kpop_style_skirt_1': 25,
  'kpop_style_skirt_2': 25,
  'kpop_style_skirt_3': 25,
  'gothic_combat_boots': 30,
  'pink_hightop_sneakers': 20,
  'white_high_heels': 35,
  'gothic_fishnet_stockings': 20,
  'gothic_cross_choker': 15,

  // Новые платные вещи из 54 ассетов
  'crimson_corset': 30,
  'cropped_black_leather_jacket': 35,
  'futuristic_crop_top': 25,
  'gothic_velvet_top_1': 30,
  'gothic_velvet_top_2': 30,
  'grunge_knit_sweater': 25,
  'kpop_stage_top': 30,
  'kpop_top_set_lavender': 30,
  'beige_cable_knit_dress': 35,
  'gothic_lolita_dress_1': 45,
  'gothic_lolita_dress_2': 45,
  'gothic_stage_dress': 50,
  'kpop_stage_dress': 40,
  'navy_chiffon_star_dress': 35,
  'ribbed_knit_pastel_dress': 30,
  'sleeveless_sequin_dress': 40,
  'stylish_cargo_pants': 30,
  'navy_chiffon_skirt': 25,
  'silver_metallic_skirt': 30,
  'futuristic_boots': 35,
  'gothic_high_boots': 40,
  'gothic_combat_boots_2': 30,
  'gothic_creeper_shoes': 25,
  'glam_high_heels': 35,
  'pink_mary_jane_shoes': 20,
  'silver_metallic_boots': 35,
  
  // Новейшие платные вещи
  'gothic_thigh_high_stockings': 20,
  'kpop_patterned_stockings': 25,
  'stage_glitter_tights': 30,
  'cyber_goggles': 20,
  'pink_heart_bag': 25
};

// Вещи за рекламу (можно также купить за звёзды)
const AD_ITEMS = new Set([
  'split_dye_hair_1',
  'double_space_buns_pastel_lavender',
  'cropped_black_leather_jacket',
  'pink_sequin_dress',
  'futuristic_boots',
  'cyber_goggles',
  'split_dye_hair_2',
  'gothic_wolf_cut',
  'gothic_mini_dress',
  'silver_bodycon_dress',
  'y2k_cargo_pants',
  'gothic_high_boots',
  'pink_heart_bag'
]);

// Эксклюзивная вещь только за отзыв
const REVIEW_ITEM = 'gothic_stage_dress';

// ────────────────────────────────────────────────────────────
// MILESTONE GOALS & REWARDS
// ────────────────────────────────────────────────────────────

const MILESTONE_REWARDS = {
  1000: 3000,
  10000: 5000,
  100000: 10000,
  500000: 25000,
  1000000: 50000
};

// ────────────────────────────────────────────────────────────
// LAYER ORDER & CATEGORIES
// ────────────────────────────────────────────────────────────

const LAYER_ORDER = [
  { key:'body',        zIndex:0 },
  { key:'socks',       zIndex:1 },
  { key:'shoes',       zIndex:2 },
  { key:'bottoms',     zIndex:3 },
  { key:'tops',        zIndex:4 },
  { key:'hair',        zIndex:5 },
  { key:'accessories', zIndex:6 },
];

function getCategories() {
  return [
    { key:'hair',        label:t('catHair'),    icon:`<img src="Items/UI/hair.png" class="ui-icon" alt="hair">` },
    { key:'tops',        label:t('catTops'),    icon:`<img src="Items/UI/tops.png" class="ui-icon" alt="tops">` },
    { key:'bottoms',     label:t('catBottoms'), icon:`<img src="Items/UI/bottoms.png" class="ui-icon" alt="bottoms">` },
    { key:'socks',       label:t('catSocks'),   icon:`<img src="Items/UI/socks.png" class="ui-icon" alt="socks">` },
    { key:'shoes',       label:t('catShoes'),   icon:`<img src="Items/UI/shoes.png" class="ui-icon" alt="shoes">` },
    { key:'accessories', label:t('catAcc'),     icon:`<img src="Items/UI/accessories.png" class="ui-icon" alt="accessories">` },
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

function buildHashtagsHTML(assignment, result) {
  if (!assignment || !result) return '';
  const equippedTags = getEquippedTags();
  const req = assignment.requiredTags || [];
  
  return req.map(t => {
    const matched = equippedTags.includes(t);
    const label = lang === 'ru' ? (TAG_NAMES_RU[t] || t) : t;
    const icon = matched ? '✅' : '❌';
    const tagClass = matched ? 'tag-matched' : 'tag-unmatched';
    return `<span class="hashtag-badge ${tagClass}">#${label} ${icon}</span>`;
  }).join(' ');
}


const PROMO_ACTIVITIES = [
  { id:'recording',
    title:'Recording Session',     title_ru:'Запись трека',
    desc: 'Fans want pure charisma and bold vibe for the title track!',
    desc_ru:'Фанаты хотят чистую харизму и дерзкий вайб от заглавного трека!',
    requiredTags:['kpop','bold'] },
  { id:'fitness',
    title:'Fitness & Stretching',  title_ru:'Фитнес и растяжка',
    desc: 'Fans expect a comfortable, sporty outfit for stretching!',
    desc_ru:'Фанаты ждут удобный спортивный лук на растяжке!',
    requiredTags:['sporty','casual'] },
  { id:'photoshoot',
    title:'Album Photoshoot',      title_ru:'Фотосессия для альбома',
    desc: 'Fans expect an elegant, concept-driven outfit for the album book.',
    desc_ru:'Фанаты ждут элегантный концептуальный образ для буклета альбома.',
    requiredTags:['kpop','elegant'] },
  { id:'fansign',
    title:'Fansign Event',         title_ru:'Автограф-сессия',
    desc: 'Meet your fans! They demand an elegant and neat appearance.',
    desc_ru:'Встреться с фанатами! Они ждут элегантный и аккуратный вид.',
    requiredTags:['school','formal'] },
  { id:'variety_show',
    title:'Variety Show',          title_ru:'Развлекательное шоу',
    desc: 'Show a cute, eye-catching look for the television screen! Fans are watching!',
    desc_ru:'Покажи милый, выделяющийся образ для экранов ТВ! Фанаты ждут его!',
    requiredTags:['kpop','cute'] },
  { id:'dance_practice',
    title:'Choreography Practice', title_ru:'Репетиция хореографии',
    desc: 'Show style AND movement. Fans want to see you ready to dance!',
    desc_ru:'Покажи стиль И свободу движений. Фанаты ждут твоей готовности к танцу!',
    requiredTags:['sporty','kpop'] },
  { id:'vlog', // Продюсер Сон отвечает за видео-контент
    title:'Vlog Recording',        title_ru:'Запись влога',
    desc: 'Show your casual everyday style behind-the-scenes to your fans!',
    desc_ru:'Покажи фанатам свой естественный повседневный стиль за кулисами!',
    requiredTags:['casual','cute'] },
  { id:'fans_qa',
    title:'Live with Fans',        title_ru:'Эфир с фанатами',
    desc: 'Live stream time! Fans expect a neat and casual dress for the broadcast.',
    desc_ru:'Время прямого эфира! Фанаты ждут опрятный и повседневный наряд для трансляции.',
    requiredTags:['school','casual'] },
  { id:'dance_challenge',
    title:'Viral Dance Challenge', title_ru:'Вирусный танец',
    desc: 'Record a viral dance! Fans want a bright, trendy look for social media!',
    desc_ru:'Запиши вирусный танец! Фанаты ждут яркий, трендовый образ для соцсетей!',
    requiredTags:['cute','bold'] }
];

const FINAL_STAGES = [
  { id:'live_stage',
    title:'Inkigayo Live Stage',    title_ru:'Выступление на Inkigayo',
    desc: 'Your debut performance! Fans are watching your bold stage style!',
    desc_ru:'Твое дебютное выступление! Фанаты ждут дерзкий сценический стиль!',
    requiredTags:['kpop','bold'] },
  { id:'grand_concert',
    title:'Rookie Awards Stage',   title_ru:'Сцена премии Rookie Awards',
    desc: 'The biggest event! Fans expect maximum elegance and perfection.',
    desc_ru:'Главное событие! Фанаты ждут максимальную элегантность и совершенство.',
    requiredTags:['formal','elegant'] }
];

const FREE_POST = {
  id:'free_style',
  title:'Free Style Post',     title_ru:'Пост в свободном стиле',
  desc: 'Post whatever you like! Your fans love your personal style!',
  desc_ru:'Публикуй что хочешь! Фанаты обожают твой личный стиль!',
  requiredTags:[], isFree: true
};

const ASSIGNMENTS = [...PROMO_ACTIVITIES, ...FINAL_STAGES, FREE_POST];

const ACTIVITY_ICONS = {
  recording: 'recording.png',
  fitness: 'fitness.png',
  photoshoot: 'photoshoot.png',
  fansign: 'fansign.png',
  variety_show: 'variety_show.png',
  dance_practice: 'dance_practice.png',
  vlog: 'vlog.png',
  fans_qa: 'fans_qa.png',
  dance_challenge: 'dance_challenge.png',
  live_stage: 'live_stage.png',
  grand_concert: 'grand_concert.png',
  free_style: 'free_style.png'
};

function getActivityIcon(id) {
  return ACTIVITY_ICONS[id] || 'camera.png';
}

function assignmentTitle(a) { return lang === 'ru' ? a.title_ru : a.title; }
function assignmentDesc(a)  { return lang === 'ru' ? a.desc_ru  : a.desc;  }

// ────────────────────────────────────────────────────────────
// PROGRESSION RANKS
// ────────────────────────────────────────────────────────────

// Likes = followers × random(min..max)
const LIKE_MULTIPLIER = [6, 10];

const GOAL_FOLLOWERS = 1000000; // 1M = game finale


// ────────────────────────────────────────────────────────────
// GAME STATE
// ────────────────────────────────────────────────────────────

const equipped = { hair:'blunt_bob_pink_headband', tops:'top_dress_new_1', bottoms:'bot_none', shoes:'shoe_none', socks:'sock_none', accessories:'acc_none' };
let activeCategory    = 'hair';
// Подкатегории для категорий с разделением
const CATEGORY_SUBS = {
  tops: [
    { key:'blouses', icon:`<img src="Items/UI/blouses.png" alt="Blouses">`, label:'Blouses', label_ru:'Блузки'  },
    { key:'dresses', icon:`<img src="Items/UI/dresses.png" alt="Dresses">`, label:'Dresses', label_ru:'Платья'  },
  ],
  bottoms: [
    { key:'pants',   icon:`<img src="Items/UI/pants.png" alt="Pants">`, label:'Pants',   label_ru:'Брюки'  },
    { key:'skirts',  icon:`<img src="Items/UI/skirts.png" alt="Skirts">`, label:'Skirts',  label_ru:'Юбки'   },
  ],
};

// Активная подкатегория для каждой категории
const activeSub = { tops:'blouses', bottoms:'pants' };

function subLabel(sub) { return lang === 'ru' ? sub.label_ru : sub.label; }

const school = {
  active:             false,
  day:                1,
  lessonIndex:        0,
  schedule:           [],
  lessonScores:       [],    // stars per lesson (0-5)
  totalFollowers:     0,     // total followers (gained across posts)
  totalPosts:         0,     // total published posts
  dayFollowersGained: 0,     // followers gained during current day
  rewardedMilestones: [],    // list of already rewarded follower milestones
};

// ────────────────────────────────────────────────────────────
// DOM HELPER
// ────────────────────────────────────────────────────────────

const BACKGROUNDS = [
  'Background/recording.jpg',
  'Background/fitness.jpg',
  'Background/photoshoot.jpg',
  'Background/fansign.jpg',
  'Background/variety_show.jpg',
  'Background/dance_practice.jpg',
  'Background/vlog.jpg',
  'Background/fans_qa.jpg',
  'Background/dance_challenge.jpg',
  'Background/live_stage.jpg',
  'Background/grand_concert.jpg',
  'Background/free_style.jpg'
];
let currentBackgroundIndex = 2; // Default to 'Background/photoshoot.jpg'

function formatFollowers(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function formatShortNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
  return String(n);
}

function findItem(category, itemId) {
  return (clothes[category] || []).find(i => i.id === itemId) || null;
}

function iName(item) {
  return (lang === 'ru' && item.name_ru) ? item.name_ru : item.name;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function dateHash(s) {
  let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h);
}

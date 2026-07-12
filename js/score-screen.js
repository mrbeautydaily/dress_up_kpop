
// Timers for synchronized score sounds
let scoreRiseTimer = null;
let scoreRewardRiseTimer = null;
let scoreFinalChimeTimer = null;

function loadImageForCanvas(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => {
      // CORS fallback: retry without crossOrigin if anonymous fails
      const retryImg = new Image();
      retryImg.onload  = () => resolve(retryImg);
      retryImg.onerror = () => resolve(null);
      retryImg.src = src;
    };
    img.src = src;
  });
}

async function shareOutfit() {
  const overlay = $('share-generating');
  const genText = $('share-generating-text');
  overlay.classList.remove('hidden');
  if (genText) genText.textContent = lang === 'ru' ? 'Создаём образ...' : 'Creating outfit...';

  try {
    // Берём реальные размеры #stage чтобы процентное позиционирование совпало 1:1
    const stageEl = $('stage');
    const stageRect = stageEl.getBoundingClientRect();
    const srcW = stageRect.width  || 300;
    const srcH = stageRect.height || 500;

    // Масштабируем до 420px по ширине, сохраняя пропорции stage
    const SHARE_W = 420;
    const SHARE_H = Math.round(srcH / srcW * SHARE_W);

    // Волосы имеют top: ~-1.2% (выходят за верхний край stage).
    // Добавляем отступ сверху чтобы они не обрезались в канвасе.
    const TOP_PAD = Math.round(0.05 * SHARE_H); // 5% высоты
    const IMAGE_H = SHARE_H + TOP_PAD;
    const BAR_H = 44;
    const CANVAS_H = IMAGE_H + BAR_H;

    const canvas = document.createElement('canvas');
    canvas.width  = SHARE_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');

    // — Фон: градиент (на случай, если картинка не загрузится)
    const grad = ctx.createLinearGradient(0, 0, SHARE_W, IMAGE_H);
    grad.addColorStop(0, '#ffd6ec');
    grad.addColorStop(0.5, '#ede9fe');
    grad.addColorStop(1, '#ccfbf1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SHARE_W, IMAGE_H);

    // — Фоновая картинка (студия) с полной непрозрачностью и обрезкой по размеру (cover)
    const bgImg = await loadImageForCanvas(BACKGROUNDS[currentBackgroundIndex]);
    if (bgImg) {
      const imgW = bgImg.naturalWidth;
      const imgH = bgImg.naturalHeight;
      const aspectImg = imgW / imgH;
      const aspectTarget = SHARE_W / IMAGE_H;

      let sx = 0, sy = 0, sWidth = imgW, sHeight = imgH;
      if (aspectImg > aspectTarget) {
        // Картинка шире целевого соотношения сторон — обрезаем по бокам
        sWidth = imgH * aspectTarget;
        sx = (imgW - sWidth) / 2;
      } else {
        // Картинка выше целевого соотношения сторон — обрезаем сверху/снизу
        sHeight = imgW / aspectTarget;
        sy = (imgH - sHeight) / 2;
      }
      ctx.drawImage(bgImg, sx, sy, sWidth, sHeight, 0, 0, SHARE_W, IMAGE_H);
    }

    // — Тень персонажа (овал под ногами)
    ctx.save();
    const cx = SHARE_W * 0.52;
    const cy = TOP_PAD + SHARE_H * 0.95; // Соответствует bottom: 5%
    const rx = SHARE_W * 0.3; // 60% ширины -> радиус 30%
    const ry = SHARE_H * 0.0225; // 4.5% высоты -> радиус 2.25%
    
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(0.84, 'rgba(0, 0, 0, 0.15)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // — Тело персонажа: смещено вниз на TOP_PAD, занимает SHARE_H
    const bodyImg = await loadImageForCanvas('Items/body/body_new.png');
    if (bodyImg) ctx.drawImage(bodyImg, 0, TOP_PAD, SHARE_W, SHARE_H);

    // — Слои одежды в правильном z-порядке.
    // Используем item.z (если задан) вместо LAYER_ORDER.zIndex —
    // это точно воспроизводит CSS z-index из игры.
    // При равном z используем DOM-порядок (индекс в LAYER_ORDER) как tiebreaker.
    const sortedLayers = LAYER_ORDER
      .filter(l => l.key !== 'body')
      .map(layer => {
        const itemId = equipped[layer.key];
        const item   = itemId ? findItem(layer.key, itemId) : null;
        const effectiveZ = (item && item.z !== undefined) ? item.z : layer.zIndex;
        const domOrder   = LAYER_ORDER.findIndex(l => l.key === layer.key);
        return { layer, item, effectiveZ, domOrder };
      })
      .sort((a, b) => a.effectiveZ !== b.effectiveZ
        ? a.effectiveZ - b.effectiveZ
        : a.domOrder  - b.domOrder);

    for (const { item } of sortedLayers) {
      if (!item) continue;
      if (!item.src || !item.pos) continue;

      const img = await loadImageForCanvas(item.src);
      if (!img) continue;

      // % от SHARE_H + смещение TOP_PAD — волосы с top:-1.2% теперь не обрезаются
      const { left, top, width } = item.pos;
      const x = left  / 100 * SHARE_W;
      const y = top   / 100 * SHARE_H + TOP_PAD;
      const w = width / 100 * SHARE_W;
      const h = w * (img.naturalHeight / img.naturalWidth);

      if (item.filter) {
        ctx.save();
        ctx.filter = item.filter;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, w, h);
      }
    }

    // — НАЛОЖЕНИЕ ШАПКИ (HEADER) INSTAGRAM (поверх картинки сверху)
    const authorName = $('score-author-name-left')?.textContent || 'eclipse';
    const locationText = $('score-location-left')?.textContent || 'Seoul, South Korea';
    const timeText = $('score-meta-time-text')?.textContent || (lang === 'ru' ? '2ч' : '2h');

    // 1. Аватарка с цветным градиентным кольцом
    const avatarX = 26;
    const avatarY = 26;
    const ringR = 15;
    
    const ringGrad = ctx.createLinearGradient(avatarX - ringR, avatarY + ringR, avatarX + ringR, avatarY - ringR);
    ringGrad.addColorStop(0, '#f9ce34');
    ringGrad.addColorStop(0.5, '#ee2a7b');
    ringGrad.addColorStop(1, '#6228d7');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, ringR, 0, Math.PI * 2);
    ctx.fill();

    // Белый внутренний круг
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 13.5, 0, Math.PI * 2);
    ctx.fill();

    // Обрезаем и рисуем саму аватарку
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 12.5, 0, Math.PI * 2);
    ctx.clip();
    const avatarImg = await loadImageForCanvas(document.querySelector('.instagram-avatar-img')?.src || 'Items/UI/profile_image.jpg');
    if (avatarImg) {
      ctx.drawImage(avatarImg, avatarX - 12.5, avatarY - 12.5, 25, 25);
    }
    ctx.restore();

    // 2. Текст шапки: Имя автора, Галочка, Точка, Время
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(authorName, 50, 22);

    const authorWidth = ctx.measureText(authorName).width;
    const badgeX = 50 + authorWidth + 4;
    
    // Синий значок верификации
    ctx.fillStyle = '#0095f6';
    ctx.beginPath();
    ctx.arc(badgeX + 6, 17, 6, 0, Math.PI * 2);
    ctx.fill();
    // Белая галочка внутри значка
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(badgeX + 3.5, 17);
    ctx.lineTo(badgeX + 5.5, 19);
    ctx.lineTo(badgeX + 9, 15);
    ctx.stroke();

    // Точка и время
    const dotX = badgeX + 16;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('•', dotX, 22);
    const dotWidth = ctx.measureText('•').width;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(timeText, dotX + dotWidth + 4, 22);

    // Локация
    ctx.font = '500 11px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(locationText, 50, 36);
    ctx.restore();

    // 3. Три точки меню справа
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    const dotR = 1.8;
    const dotsY = 26;
    const centerDotX = SHARE_W - 24;
    ctx.beginPath();
    ctx.arc(centerDotX - 6, dotsY, dotR, 0, Math.PI * 2);
    ctx.arc(centerDotX,     dotsY, dotR, 0, Math.PI * 2);
    ctx.arc(centerDotX + 6, dotsY, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // — НИЖНЯЯ БРЕНДОВАЯ ПЛАШКА (GAME BRANDING BAR)
    // Рисуем белую подложку
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, IMAGE_H, SHARE_W, BAR_H);

    // Тонкий разделитель между фото и плашкой
    ctx.strokeStyle = '#efefef';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, IMAGE_H);
    ctx.lineTo(SHARE_W, IMAGE_H);
    ctx.stroke();

    // Минималистичный премиальный текст названия игры в центре
    ctx.save();
    ctx.fillStyle = '#1f2937'; // Elegant dark charcoal (gray-800)
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = '4px';
    }
    // Очищаем название игры от смайликов-искр, которые вшиты в локализацию
    const titleText = t('gameTitle').replace(/[✨]/g, '').trim().toUpperCase();
    ctx.fillText(titleText, SHARE_W / 2, IMAGE_H + BAR_H / 2);
    ctx.restore();

    // Окантовка всего поста для аккуратности
    ctx.strokeStyle = '#dbdbdb';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, SHARE_W, CANVAS_H);

    // — Скачать или поделиться
    const filename = 'kpop-outfit.png';
    let shared = false;

    // Пытаемся использовать Web Share API (особенно актуально для iOS/Yandex)
    // чтобы избежать ухода со страницы при попытке скачивания
    if (navigator.canShare && navigator.share) {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file]
            });
            shared = true;
          }
        }
      } catch (e) {
        console.log('Share canceled or failed', e);
        // Если юзер просто закрыл меню "Поделиться", не нужно принудительно скачивать
        if (e.name === 'AbortError' || e.name === 'NotAllowedError') {
          shared = true;
        }
      }
    }

    if (!shared) {
      const link = document.createElement('a');
      link.download = filename;
      link.target = '_blank';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link); // Иногда нужно добавить в DOM
      link.click();
      document.body.removeChild(link);
    }

  } catch (e) {
    showToast(lang === 'ru' ? 'Не удалось создать изображение' : 'Could not create image', 'error');
  } finally {
    overlay.classList.add('hidden');
  }
}



// ────────────────────────────────────────────────────────────
// SCHOOL MODE — SCORE SCREEN
// ────────────────────────────────────────────────────────────


// Smoothly count up raw numbers (e.g. total points, followers)
function animateCounter(el, target, duration = 1000, prefix = '', suffix = '', format = false, startValue = 0) {
  if (!el) return;
  const start = startValue;
  const startTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
  
  function update() {
    const now = (window.performance && window.performance.now) ? performance.now() : Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing out quad
    const easeProgress = progress * (2 - progress);
    const currentValue = Math.floor(start + easeProgress * (target - start));
    
    let displayValue;
    if (format === 'short') {
      displayValue = formatShortNumber(currentValue);
    } else if (format) {
      displayValue = currentValue.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
    } else {
      displayValue = currentValue;
    }
    el.textContent = prefix + displayValue + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      let finalValue;
      if (format === 'short') {
        finalValue = formatShortNumber(target);
      } else if (format) {
        finalValue = target.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
      } else {
        finalValue = target;
      }
      el.textContent = prefix + finalValue + suffix;
    }
  }
  
  requestAnimationFrame(update);
}



// Get a stylized post caption based on the activity type
function getPostTextForActivity(activityId) {
  const ruTexts = {
    recording: 'Записываем новый трек на студии! 🎙️ Дерзкий вайб и крутой звук обеспечены. Как вам наш лук сегодня? ✨ #kpop #bold',
    fitness: 'Утренняя тренировка и растяжка перед камбэком! 🧘 Главное — удобство и стиль. Заряжаемся энергией! 👟 #sporty #casual',
    photoshoot: 'Снимаем концепт-фото для нового альбома! 📸 Как вам этот элегантный образ? Будет жарко! 💫 #kpop #elegant',
    fansign: 'Наконец-то встретились с нашими любимыми фанатами на автограф-сессии! 🤝 Спасибо за поддержку и подарки! 💖 #school #formal',
    variety_show: 'Приняли участие в развлекательном шоу! 📺 Было очень весело, ждите эфир! Оцените наш милый стиль 🎀 #kpop #cute',
    dance_practice: 'Отрабатываем хореографию в зале до идеала! 💃 Стиль и свобода движений — наш девиз сегодня! 🎵 #sporty #kpop',
    vlog: 'Снимаем новый влог для вас! 🧋 Покажем наши повседневные будни за кадром. Ждете? 😉 #casual #cute',
    fans_qa: 'Провели уютный прямой эфир и ответили на ваши вопросы! 📱 Вы лучшие, обожаем вас! 💕 #school #casual',
    dance_challenge: 'Записали новый танцевальный челлендж! 🎵 Залетайте в тренды, повторяйте движения! 🌟 #cute #bold',
    live_stage: 'Наше дебютное выступление на Inkigayo! 🎤 Сцена горела, зал кричал, это было незабываемо! 🔥 #kpop #bold',
    grand_concert: 'Выступили на премии Rookie Awards! 🏆 Мы невероятно счастливы и элегантны. Спасибо, наш фандом! 👑 #formal #elegant'
  };

  const enTexts = {
    recording: 'Recording a new hit in the studio! 🎙️ Charisma and bold vibe guaranteed. How do you like our look today? ✨ #kpop #bold',
    fitness: 'Morning stretching and fitness before the comeback! 🧘 Comfort and style are key. Getting energized! 👟 #sporty #casual',
    photoshoot: 'Shooting concept photos for our new album! 📸 How do you like this elegant look? It\'s going to be hot! 💫 #kpop #elegant',
    fansign: 'Finally met our lovely fans at the fansign event! 🤝 Thank you for the support and gifts! 💖 #school #formal',
    variety_show: 'We guest starred on a variety show! 📺 It was super fun, watch out for the broadcast! Rate our cute style 🎀 #kpop #cute',
    dance_practice: 'Practicing our choreography to perfection! 💃 Style and movement are our motto today! 🎵 #sporty #kpop',
    vlog: 'Shooting a new vlog for you! 🧋 Showing our daily life behind the scenes. Are you excited? 😉 #casual #cute',
    fans_qa: 'Had a cozy live stream and answered your questions! 📱 You are the best, love you all! 💕 #school #casual',
    dance_challenge: 'Recorded a new dance challenge! 🎵 Jump into the trends, copy the moves! 🌟 #cute #bold',
    live_stage: 'Our debut performance on Inkigayo! 🎤 The stage was on fire, the crowd was loud, unforgettable! 🔥 #kpop #bold',
    grand_concert: 'Performed on the Rookie Awards stage! 🏆 We are incredibly happy and elegant. Thank you to our fandom! 👑 #formal #elegant'
  };

  const pool = lang === 'ru' ? ruTexts : enTexts;
  return pool[activityId] || (lang === 'ru' ? 'Новый пост! ✨ Оцените наш образ для сегодняшней активности!' : 'New post! ✨ Check out our look for today\'s activity!');
}

// Generate three comments from virtual fans based on the scoring results
function generateSocialComments(result, assignment) {
  const nicknames = [
    '@kpop_star_fan', '@yuri_bias_forever', '@kpop_lover_xx', '@idol_vibe',
    '@knetizen_99', '@kpop_queen', '@fandom_leader', '@bias_wrecker',
    '@kpop_dance_crew', '@starlight_kpop', '@weverse_enjoyer', '@multifan_life',
    '@kpop_aesthetic', '@hallyu_wave', '@blink_army', '@midzy_once'
  ];
  const emojis = ['🐼', '🦊', '🐰', '🐱', '🐻', '🐨', '🐯', '🦄', '💖', '✨', '🎵'];
  const nicknameAvatars = {
    '@kpop_star_fan': 'Avatars/avatar_1.png',
    '@yuri_bias_forever': 'Avatars/avatar_2.png',
    '@kpop_lover_xx': 'Avatars/avatar_3.png',
    '@idol_vibe': 'Avatars/avatar_4.png',
    '@knetizen_99': 'Avatars/avatar_5.png',
    '@kpop_queen': 'Avatars/avatar_6.png',
    '@fandom_leader': 'Avatars/avatar_7.png',
    '@bias_wrecker': 'Avatars/avatar_8.png',
    '@kpop_dance_crew': 'Avatars/avatar_9.png',
    '@starlight_kpop': 'Avatars/avatar_10.png',
    '@weverse_enjoyer': 'Avatars/avatar_11.png',
    '@multifan_life': 'Avatars/avatar_12.png',
    '@kpop_aesthetic': 'Avatars/avatar_13.png',
    '@hallyu_wave': 'Avatars/avatar_14.png',
    '@blink_army': 'Avatars/avatar_15.png',
    '@midzy_once': 'Avatars/avatar_16.png'
  };

  const commentsData = result ? [
    { type: 'style', val: result.trendMatches },
    { type: 'rating', val: result.totalPoints },
    { type: 'special' }
  ] : [
    { type: 'style', val: 0, isFreeMode: true },
    { type: 'rating', val: 100, isFreeMode: true },
    { type: 'special', isFreeMode: true }
  ];

  return commentsData.map(c => {
    const nick = nicknames[Math.floor(Math.random() * nicknames.length)];
    const avatar = nicknameAvatars[nick] || 'Avatars/avatar_1.png';
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    let text = '';

    if (c.type === 'style') {
      if (c.isFreeMode || (result && result.isFreePost)) {
        text = lang === 'ru'
          ? 'Свободный день — свободный стиль! Выглядит отлично! 💕'
          : 'Free style day! Looks great! 💕';
      } else if (result && result.isNaked) {
        text = lang === 'ru'
          ? 'Эм... Образ явно не закончен. Где низ/верх? 😅'
          : 'Um... The look is clearly unfinished. Where is the rest? 😅';
      } else {
        const trendMatches = c.val;
        const poolRu = trendMatches >= 2
          ? ['Этот образ идеально подходит под тренды! 😍', 'Стиль передан на 100% круто! 🔥', 'Трендовый лук, прямо в точку! 🔥']
          : trendMatches >= 1
          ? ['Миленько, но хотелось бы больше вещей в тему.', 'Образ аккуратный, но не хватает яркого трендового акцента.']
          : ['Совсем не попали в стиль события... 😢', 'Странный выбор вещей, концепт провален.', 'Она точно знала, куда одевается?'];
        const poolEn = trendMatches >= 2
          ? ['This outfit is absolutely perfect for the trends! 😍', 'The style is captured perfectly! 🔥', 'Super trendy look, right on target! 🔥']
          : trendMatches >= 1
          ? ['Cute, but I wanted more matching vibes.', 'The outfit is neat, but lacks a bright, trendy accent.']
          : ['This outfit doesn\'t suit the event at all... 😢', 'Strange choice of items, concept missed.', 'Did she know where she was going?'];

        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      }
    } else if (c.type === 'rating') {
      if (result && result.isNaked) {
        text = lang === 'ru' ? 'Ой, где же одежда? 😢' : 'Oops, where is the clothing? 😢';
      } else {
        const score = c.val;
        const poolRu = score >= 90
          ? ['🔥 Лучший образ за всю историю! Вирусный хит!', 'Шедевр! Фанаты сходят с ума! 😍✨', 'Просто разрыв! Мой биас прекрасен! 💖']
          : score >= 75
          ? ['✨ Очень красивый и стильный образ! Лайк!', 'Фанаты в восторге, образ получился супер!', 'Хороший пост, делюсь со всеми друзьями! 🥰']
          : score >= 50
          ? ['Вполне неплохой наряд, фанаты одобряют 👍', 'Хороший лук, мне нравится!', 'Симпатично! Лайк от меня. 🥰']
          : ['Нормально, но бывало и лучше 😕', 'Обычный образ, ничего особенного.', 'Пойдет, но можно было постараться сильнее.'];
        const poolEn = score >= 90
          ? ['🔥 Best look ever! Absolute viral hit!', 'Masterpiece! Fans are going crazy! 😍✨', 'Absolute perfection! My bias is gorgeous! 💖']
          : score >= 75
          ? ['✨ Very beautiful and stylish outfit! I love it!', 'Fans love it, the outfit is super cool!', 'Nice post, sharing with all my friends! 🥰']
          : score >= 50
          ? ['Quite a decent outfit, fans approve 👍', 'Good look, I like it!', 'Cute! Like it! 🥰']
          : ['It\'s okay, but could be better 😕', 'Ordinary look, nothing special.', 'Fine, but could be much better.'];

        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      }
    } else if (c.type === 'special') {
      if (c.isFreeMode) {
        text = lang === 'ru' ? 'Очень эстетично выглядит! ✨' : 'Looks very aesthetic! ✨';
      } else if (result && result.isNaked) {
        const poolRu = ['Забыла одеться? Кто-нибудь, дайте ей пальто! 😮', 'Эм... почему наряд такой пустой? 😮', 'Где верх и низ (или платье)? Образ абсолютно не завершен.'];
        const poolEn = ['Forgot to get dressed? Someone give her a coat! 😮', 'Um... why so empty? 😮', 'Where are the top and bottom (or dress)? The look is incomplete.'];
        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      } else if (result && result.isFreePost) {
        const poolRu = ['Люблю, когда она сама выбирает одежду! 💕', 'Свободный стиль ей так идет! 🥰', 'Самый естественный и милый пост! 💕'];
        const poolEn = ['Love it when she chooses her own clothes! 💕', 'Free style suits her so well! 🥰', 'The most natural and cute post! 💕'];
        const pool = lang === 'ru' ? poolRu : poolEn;
        text = pool[Math.floor(Math.random() * pool.length)];
      } else {
        if (result && result.filled >= result.totalSlots) {
          const poolRu = ['Полный образ! Всё продумано до мелочей! 🌟', 'Вау, каждый слот заполнен — идеально! 🔥', 'Собрала полный лук, вот это старание! ✨'];
          const poolEn = ['Full outfit! Every detail is perfect! 🌟', 'Wow, every slot is filled — perfection! 🔥', 'Complete look, that\'s dedication! ✨'];
          const pool = lang === 'ru' ? poolRu : poolEn;
          text = pool[Math.floor(Math.random() * pool.length)];
        } else {
          const poolRu = ['Приятный пост, лайк от меня!', 'Прикольно, жду новые посты!', 'Очень эстетично выглядит. ✨'];
          const poolEn = ['Nice post, love it!', 'Cool, waiting for new posts!', 'Looks very aesthetic. ✨'];
          const pool = lang === 'ru' ? poolRu : poolEn;
          text = pool[Math.floor(Math.random() * pool.length)];
        }
      }
    }

    return { nick, emoji, avatar, text, scoreHtml: '' };
  });
}

function showScoreScreen(assignment, result, earned, socialStats) {
  const picker = $('emoji-picker');
  const isFree = !assignment || !result;
  const authorName = 'eclipse';

  const cleanupScoreTimers = () => {
    if (scoreRiseTimer) {
      clearTimeout(scoreRiseTimer);
      scoreRiseTimer = null;
    }
    if (scoreRewardRiseTimer) {
      clearTimeout(scoreRewardRiseTimer);
      scoreRewardRiseTimer = null;
    }
    if (scoreFinalChimeTimer) {
      clearTimeout(scoreFinalChimeTimer);
      scoreFinalChimeTimer = null;
    }
  };

  // Clear any existing score sound timers
  cleanupScoreTimers();

  // Clear any existing auto-scroll timer on screen load
  if (scoreAutoScrollTimer) {
    clearInterval(scoreAutoScrollTimer);
    scoreAutoScrollTimer = null;
  }

  const startAutoScroll = () => {
    if (scoreAutoScrollTimer) clearInterval(scoreAutoScrollTimer);
    scoreAutoScrollTimer = setInterval(() => {
      const nextBtn = $('overlay-comment-next');
      if (nextBtn) {
        nextBtn.click();
      }
    }, 8000); // 8 seconds is optimal for reading short fan comments!
  };

  const stopAutoScroll = () => {
    if (scoreAutoScrollTimer) {
      clearInterval(scoreAutoScrollTimer);
      scoreAutoScrollTimer = null;
    }
  };
  
  const authorLeft = $('score-author-name-left');
  if (authorLeft) authorLeft.textContent = authorName;
  const authorRight = $('score-author-name');
  if (authorRight) authorRight.textContent = authorName;

  // Set post time dynamically
  const timeText = $('score-meta-time-text');
  if (timeText) {
    timeText.textContent = lang === 'ru' ? '2ч' : '2h';
  }

  // Set location in Instagram-like header
  const locationEl = $('score-location-left');
  if (locationEl) {
    if (isFree) {
      locationEl.textContent = lang === 'ru' ? 'Свободная фотосессия' : 'Free Photoshoot';
    } else {
      let locText = 'Seoul, South Korea';
      if (assignment.id === 'live_stage') {
        locText = lang === 'ru' ? 'Сцена SBS Inkigayo' : 'SBS Inkigayo Stage';
      } else if (assignment.id === 'grand_concert') {
        locText = lang === 'ru' ? 'Премия Rookie Music Awards' : 'Rookie Music Awards';
      } else if (assignment.id === 'dance_practice') {
        locText = lang === 'ru' ? 'Танцевальная студия' : 'K-Pop Practice Studio';
      } else if (assignment.id === 'fansign') {
        locText = lang === 'ru' ? 'Автограф-сессия в Каннаме' : 'Gangnam Fansign Hall';
      } else if (assignment.id === 'vlog') {
        locText = lang === 'ru' ? 'Моя комната' : 'My Room';
      } else if (assignment.id === 'fans_qa') {
        locText = lang === 'ru' ? 'Прямой эфир' : 'Live Broadcast';
      } else if (assignment.id === 'photoshoot') {
        locText = lang === 'ru' ? 'Фотостудия в Сеуле' : 'Seoul Photo Studio';
      }
      locationEl.textContent = locText;
    }
  }

  // Handle likes display next to the like button
  const likesCountEl = $('instagram-likes-count-new');
  let currentLikesVal = 0;
  if (likesCountEl) {
    if (isFree) {
      currentLikesVal = Math.floor(Math.random() * 1000) + 250;
    } else {
      currentLikesVal = (socialStats && socialStats.likes !== undefined) ? socialStats.likes : Math.max(1, earned || 0);
    }
    likesCountEl.textContent = '0';
    setTimeout(() => animateCounter(likesCountEl, currentLikesVal, 900, '', '', true), 800);
  }

  // Set shares/reposts count (proportional to likes, e.g. ~1-3% of likes, minimum 5)
  let currentSharesVal = Math.max(5, Math.floor(currentLikesVal * (0.01 + Math.random() * 0.02)));
  const sharesCountEl = $('instagram-shares-count-new');
  if (sharesCountEl) {
    sharesCountEl.textContent = '0';
    setTimeout(() => animateCounter(sharesCountEl, currentSharesVal, 900, '', '', true), 800);
  }

  // Interactive like button for the Instagram post
  const postLikeBtn = $('instagram-post-like-btn');
  if (postLikeBtn) {
    postLikeBtn.classList.add('liked');
    
    let postLiked = true;
    postLikeBtn.onclick = (e) => {
      e.stopPropagation();
      sfxClick();
      postLiked = !postLiked;
      if (postLiked) {
        postLikeBtn.classList.add('liked');
        if (likesCountEl) {
          likesCountEl.textContent = formatStars(currentLikesVal);
        }
      } else {
        postLikeBtn.classList.remove('liked');
        if (likesCountEl) {
          likesCountEl.textContent = formatStars(Math.max(0, currentLikesVal - 1));
        }
      }
    };
  }

  // Interactive bookmark button for the Instagram post
  const postBookmarkBtn = $('instagram-post-bookmark-btn');
  if (postBookmarkBtn) {
    postBookmarkBtn.classList.remove('saved');
    let postBookmarked = false;
    postBookmarkBtn.onclick = (e) => {
      e.stopPropagation();
      sfxClick();
      postBookmarked = !postBookmarked;
      if (postBookmarked) {
        postBookmarkBtn.classList.add('saved');
      } else {
        postBookmarkBtn.classList.remove('saved');
      }
    };
  }

  // Interactive share button for the Instagram post
  const postShareBtn = $('instagram-post-share-btn');
  if (postShareBtn) {
    let postShared = false;
    postShareBtn.onclick = (e) => {
      e.stopPropagation();
      sfxClick();
      
      // Trigger fly-away animation
      postShareBtn.classList.remove('sharing');
      void postShareBtn.offsetWidth; // Trigger reflow to restart CSS animation
      postShareBtn.classList.add('sharing');
      
      // Clean up sharing class after animation completes
      setTimeout(() => {
        postShareBtn.classList.remove('sharing');
      }, 500);

      // Increment share count only once per view
      if (!postShared) {
        postShared = true;
        currentSharesVal++;
        if (sharesCountEl) {
          sharesCountEl.textContent = formatStars(currentSharesVal);
        }
      }
    };
  }

  // Clone stage for post preview
  const container = $('score-post-image-container');
  if (container) {
    container.innerHTML = '';
    const originalStage = $('stage');
    if (originalStage) {
      const clonedStage = originalStage.cloneNode(true);
      clonedStage.id = 'cloned-stage';
      
      // Clean up cloned stage IDs to avoid duplicate ID issues
      const charLayers = clonedStage.querySelector('#character-layers');
      if (charLayers) {
        charLayers.id = 'cloned-character-layers';
        charLayers.classList.add('cloned-character-layers');
      }
      
      const layerBody = clonedStage.querySelector('#layer-body');
      if (layerBody) {
        layerBody.id = 'cloned-layer-body';
        layerBody.classList.add('cloned-layer-body');
      }
      
      // Prefix all other IDs in the cloned element to prevent duplicates
      clonedStage.querySelectorAll('[id]').forEach(el => {
        if (el.id !== 'cloned-stage' && el.id !== 'cloned-character-layers' && el.id !== 'cloned-layer-body') {
          el.id = 'cloned-' + el.id;
        }
      });
      
      // Strip the layer-animate class to make sure images are not stuck at opacity 0
      clonedStage.querySelectorAll('img').forEach(img => {
        const classesToRemove = [];
        img.classList.forEach(cls => {
          if (cls.startsWith('layer-animate')) {
            classesToRemove.push(cls);
          }
        });
        classesToRemove.forEach(cls => img.classList.remove(cls));
      });
      
      // Remove sparkles from the post picture (they are animated and might look weird static)
      const sparkles = clonedStage.querySelector('#cloned-sparkles');
      if (sparkles) {
        sparkles.remove();
      }
      
      // Reset styling rules to lock aspect ratio and prevent squishing
      clonedStage.style.height = '100%';
      clonedStage.style.width = 'auto';
      clonedStage.style.aspectRatio = '768 / 1376';
      clonedStage.style.position = 'absolute';
      clonedStage.style.top = '50%';
      clonedStage.style.left = '50%';
      clonedStage.style.transform = 'translate(-50%, -50%)';
      clonedStage.style.display = 'block';
      clonedStage.style.maxWidth = 'none';
      clonedStage.style.maxHeight = 'none';
      
      // Set background image on both container and clonedStage to be absolutely sure it renders
      const bgUrl = BACKGROUNDS[currentBackgroundIndex];
      container.style.backgroundImage = `url('${bgUrl}')`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      
      clonedStage.style.backgroundImage = `url('${bgUrl}')`;
      clonedStage.style.backgroundSize = 'cover';
      clonedStage.style.backgroundPosition = 'center';
      
      container.appendChild(clonedStage);
    }
  }

  // Handle Free vs School mode layout
  const resultsBlock = document.querySelector('.social-results-block');
  const tagInfo = $('score-tag-info');

  const assignTitleEl = $('score-assignment-title');
  const postTextEl = $('score-post-text');
  if (isFree) {
    if (assignTitleEl) {
      assignTitleEl.textContent = lang === 'ru' ? '📍 Свободная фотосессия' : '📍 Free Photoshoot';
    }
    if (postTextEl) {
      postTextEl.textContent = lang === 'ru' 
        ? 'Мой новый образ в свободном стиле! Как вам такое сочетание? 💫 #kpop #freestyle' 
        : 'My new outfit in free style! Do you like this combination? 💫 #kpop #freestyle';
    }
    
    if (tagInfo) tagInfo.style.display = 'none';
    if (resultsBlock) resultsBlock.style.display = 'none';
  } else {
    if (assignTitleEl) {
      assignTitleEl.textContent = tf('scoreResults', { title: assignmentTitle(assignment) });
    }
    if (postTextEl) {
      postTextEl.textContent = getPostTextForActivity(assignment.id);
    }
    
    if (tagInfo) {
      tagInfo.style.display = 'none';
      tagInfo.innerHTML = buildHashtagsHTML(assignment, result);
    }
    if (resultsBlock) resultsBlock.style.display = 'block';
  }

  const rankTitleEl = $('score-rank-title');
  if (rankTitleEl) rankTitleEl.textContent = lang === 'ru' ? 'Подписчики:' : 'Followers:';

  const socialComments = generateSocialComments(result, assignment);
  
  // Set comments count (proportional to likes, e.g. ~4-7% of likes, minimum 3)
  const commentsCountEl = $('instagram-comments-count-new');
  if (commentsCountEl) {
    const commentCount = Math.max(3, Math.floor(currentLikesVal * (0.04 + Math.random() * 0.03)));
    commentsCountEl.textContent = '0';
    setTimeout(() => animateCounter(commentsCountEl, commentCount, 900, '', '', true), 800);
  }
  
  // Handle rewards display (show in school/promo mode, hide in free mode)
  const rewardRow = $('score-reward-row');
  if (rewardRow) {
    if (isFree) {
      rewardRow.style.display = 'none';
    } else {
      rewardRow.style.display = 'flex';
      const rewardValEl = $('score-reward-value');
      if (rewardValEl) {
        rewardValEl.textContent = '0';
        const likesVal = earned || 0;
        setTimeout(() => animateCounter(rewardValEl, likesVal, 900, '', '', 'short'), 800);
      }
      const totalLabelEl = $('score-total-label');
      if (totalLabelEl) {
        totalLabelEl.textContent = lang === 'ru' ? 'Итого:' : 'Total:';
      }
    }
  }

  // Play chime during total reward / likes count-up animation (duration 800ms)
  scoreRewardRiseTimer = setTimeout(() => {
    const targetVal = isFree ? currentLikesVal : (earned || 0);
    sfxScoreRiseChime(targetVal, 800);
  }, 800);

  if (!isFree) {
    // ── Update score status title ──
    const statusTitleEl = $('score-status-title');
    if (statusTitleEl) {
      statusTitleEl.classList.remove('visible');
      let statusText = '';
      const pts = result.totalPoints;
      if (lang === 'ru') {
        if (result.isNaked) statusText = 'Забыли одеться';
        else if (pts >= 100) statusText = '👑 Сенсация!';
        else if (pts >= 80) statusText = '🔥 Невероятно!';
        else if (pts >= 60) statusText = '✨ Трендово!';
        else if (pts >= 40) statusText = '👍 Хорошая работа';
        else statusText = '💜 Начало пути';
      } else {
        if (result.isNaked) statusText = 'Forgot clothes';
        else if (pts >= 100) statusText = '👑 Sensational!';
        else if (pts >= 80) statusText = '🔥 Incredible!';
        else if (pts >= 60) statusText = '✨ Trendy!';
        else if (pts >= 40) statusText = '👍 Good job!';
        else statusText = '💜 Start of the journey';
      }
      statusTitleEl.textContent = statusText;
      
      if (result.isNaked) {
        // Show immediately (with a minimal delay for CSS transitions to trigger)
        scoreFinalChimeTimer = setTimeout(() => {
          statusTitleEl.classList.add('visible');
          sfxScore(result.trendMatches);
        }, 50);
      } else {
        // Show and play final chime at the end of the counter animation (approx 1700ms)
        scoreFinalChimeTimer = setTimeout(() => {
          statusTitleEl.classList.add('visible');
          sfxScore(result.trendMatches);
        }, 1700);
      }
    }

    // ── Populate breakdown rows ──
    const itemsLabel = $('score-items-label');
    const itemsValue = $('score-items-value');
    const trendLabel = $('score-trend-label');
    const trendValue = $('score-trend-value');
    const trendRowEl = $('score-row-trend');
    const breakdownCard = document.querySelector('.score-breakdown');

    if (itemsLabel) {
      itemsLabel.textContent = lang === 'ru'
        ? `Образ: ${result.filled}/${result.totalSlots} вещей`
        : `Outfit: ${result.filled}/${result.totalSlots} items`;
    }
    if (itemsValue) {
      itemsValue.textContent = '0';
      setTimeout(() => animateCounter(itemsValue, result.filledPoints, 600), 300);
    }

    // Trend points row — show always in school mode to clarify addition
    if (trendRowEl) {
      trendRowEl.style.display = 'flex';
      if (result.trendMatches > 0) {
        trendRowEl.classList.add('has-trend');
      } else {
        trendRowEl.classList.remove('has-trend');
      }
      if (trendLabel) {
        trendLabel.style.setProperty('display', 'inline-flex', 'important');
        trendLabel.style.setProperty('align-items', 'center', 'important');
        trendLabel.style.setProperty('flex-wrap', 'nowrap', 'important');
        trendLabel.style.setProperty('white-space', 'nowrap', 'important');
        trendLabel.style.setProperty('flex', '1', 'important');
        trendLabel.style.setProperty('min-width', '0', 'important');
        trendLabel.style.setProperty('width', 'auto', 'important');
        trendLabel.style.setProperty('overflow', 'hidden', 'important');

        const isFree = (result && result.isFreePost) || (assignment && assignment.isFree);
        if (lang === 'ru') {
          let html = '';
          if (isFree) {
            html = `<span>Тренд: Свободный стиль ✅</span>`;
          } else {
            html = `<span>Тренд: ${result.trendMatches} совпад.</span>`;
            if (result.matchedTrendTags && result.matchedTrendTags.length > 0) {
              const badges = result.matchedTrendTags.map(t => {
                const label = TAG_NAMES_RU[t] || t;
                return `<span class="hashtag-badge tag-matched" style="margin-left: 0.5em; margin-top: 0; margin-bottom: 0; display: inline-flex; align-items: center; gap: 0.3em;">#${label} ✅</span>`;
              }).join('');
              html += badges;
            }
          }
          trendLabel.innerHTML = html;
        } else {
          let html = '';
          if (isFree) {
            html = `<span>Trend: Free style ✅</span>`;
          } else {
            html = `<span>Trend: ${result.trendMatches} match${result.trendMatches !== 1 ? 'es' : ''}</span>`;
            if (result.matchedTrendTags && result.matchedTrendTags.length > 0) {
              const badges = result.matchedTrendTags.map(t => {
                return `<span class="hashtag-badge tag-matched" style="margin-left: 0.5em; margin-top: 0; margin-bottom: 0; display: inline-flex; align-items: center; gap: 0.3em;">#${t} ✅</span>`;
              }).join('');
              html += badges;
            }
          }
          trendLabel.innerHTML = html;
        }

        // Auto-shrink font size if content overflows (keep single line, no wrapping)
        requestAnimationFrame(() => {
          let fs = 0.85;
          const minFs = 0.55;
          trendLabel.style.fontSize = fs + 'em';
          while (trendLabel.scrollWidth > trendLabel.clientWidth && fs > minFs) {
            fs -= 0.03;
            trendLabel.style.fontSize = fs + 'em';
          }
        });
      }
      if (trendValue) {
        trendValue.textContent = '0';
        setTimeout(() => animateCounter(trendValue, result.trendPoints, 600), 300);
      }
    }



    // Play chime during outfit/trend points animation (duration 450ms)
    scoreRiseTimer = setTimeout(() => {
      sfxScoreRiseChime(result.totalPoints, 450);
    }, 300);

    // Viral glow on breakdown card
    if (breakdownCard) {
      breakdownCard.classList.toggle('viral-post', result.trendMatches >= 2);
    }

    // Followers gained (static, acts as the source of points for the progress bar below)
    const gainedEl = $('score-followers-gained');
    if (gainedEl) {
      const followersVal = socialStats ? socialStats.followers : 0;
      gainedEl.textContent = formatShortNumber(followersVal);
    }

    // Update Milestone Progress (1K → 10K → 100K → 500K → 1M)
    const MILESTONES = [1000, 10000, 100000, 500000, 1000000];
    const prevTotal = Math.max(0, school.totalFollowers - (socialStats ? socialStats.followers : 0));

    // Find current milestone bracket
    function getMilestone(followers) {
      let prevM = 0;
      for (const m of MILESTONES) {
        if (followers < m) return { from: prevM, to: m };
        prevM = m;
      }
      return { from: MILESTONES[MILESTONES.length - 2], to: MILESTONES[MILESTONES.length - 1] };
    }

    const curMilestone = getMilestone(school.totalFollowers);
    const prevMilestone = getMilestone(prevTotal);

    const rankBadgeEl = $('score-rank-badge');
    const rankBarEl = $('score-rank-bar');
    const rankNextEl = $('score-rank-next');
    const rankNextDarkEl = $('score-rank-next-dark');
    const rankSectionEl = $('score-rank-section');
    const giftBoxEl = $('score-gift-box');

    // Hide milestone alert initially
    const alertEl = $('score-milestone-subtext');
    if (alertEl) alertEl.classList.add('hidden');
    if (rankSectionEl) rankSectionEl.classList.remove('celebrating');
    if (giftBoxEl) {
      giftBoxEl.classList.remove('shaking');
      giftBoxEl.classList.remove('hidden-box');
    }

    // Milestone calculation and reward check
    const newlyReached = [];
    if (!school.rewardedMilestones) {
      school.rewardedMilestones = [];
    }
    for (const m of MILESTONES) {
      if (school.totalFollowers >= m && !school.rewardedMilestones.includes(m)) {
        newlyReached.push(m);
        school.rewardedMilestones.push(m);
      }
    }

    const milestoneCrossed = curMilestone.to !== prevMilestone.to;

    // Show current total as badge (start at prevTotal and animate)
    const rankBadgeValEl = $('score-rank-badge-val');
    const rankBadgeValDarkEl = $('score-rank-badge-val-dark');
    
    function animateBothBadges(startVal, endVal, durationMs) {
      if (startVal === endVal) return;
      const startTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
      function update() {
        const now = (window.performance && window.performance.now) ? performance.now() : Date.now();
        const progress = Math.min((now - startTime) / durationMs, 1);
        const easeProgress = progress * (2 - progress);
        const current = Math.floor(startVal + easeProgress * (endVal - startVal));
        const text = formatFollowers(current);
        if (rankBadgeValEl) rankBadgeValEl.textContent = text;
        if (rankBadgeValDarkEl) rankBadgeValDarkEl.textContent = text;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }

    const initialFollowersText = formatFollowers(prevTotal);
    if (rankBadgeValEl) rankBadgeValEl.textContent = initialFollowersText;
    if (rankBadgeValDarkEl) rankBadgeValDarkEl.textContent = initialFollowersText;
    else if (!rankBadgeValEl && rankBadgeEl) rankBadgeEl.textContent = `📊 ${initialFollowersText}`;

    if (school.totalFollowers >= GOAL_FOLLOWERS) {
      if (rankBarEl) {
        const pDenom = prevMilestone.to - prevMilestone.from;
        const prevPct = pDenom > 0 ? ((prevTotal - prevMilestone.from) / pDenom) * 100 : 100;
        const initialPercent = Math.min(Math.max(0, prevPct), 100);
        rankBarEl.style.width = initialPercent + '%';
        rankBarEl.style.transition = 'width 0.6s cubic-bezier(.22,.61,.36,1)';
        const progTextWhiteEl = $('score-rank-progress-text-white');
        if (progTextWhiteEl) {
          progTextWhiteEl.style.clipPath = `inset(0 ${100 - initialPercent}% 0 0)`;
        }
        setTimeout(() => { 
          rankBarEl.style.width = '100%'; 
          if (progTextWhiteEl) {
            progTextWhiteEl.style.transition = 'clip-path 0.6s cubic-bezier(.22,.61,.36,1)';
            progTextWhiteEl.style.clipPath = 'inset(0 0% 0 0)';
          }
          animateBothBadges(prevTotal, school.totalFollowers, 600);
        }, 300);
      }
      if (rankNextEl) {
        const progTextWhite = $('score-rank-progress-text-white');
        const progTextDark = $('score-rank-progress-text-dark');
        const finaleHtml = lang === 'ru'
          ? '<span style="font-weight: 800;">🎉 1М! Легенды K-Pop! 🎉</span>'
          : '<span style="font-weight: 800;">🎉 1M! K-Pop Legends! 🎉</span>';
        if (progTextWhite) progTextWhite.innerHTML = finaleHtml;
        if (progTextDark) progTextDark.innerHTML = finaleHtml;
      }

      // If reached 1M for the first time
      if (newlyReached.includes(1000000)) {
        const reward = MILESTONE_REWARDS[1000000] || 50000;
        addStars(reward);
        saveSchoolProgress();

        if (giftBoxEl) {
          setTimeout(() => {
            giftBoxEl.classList.add('shaking');
          }, 900);
        }

        setTimeout(() => {
          if (giftBoxEl) {
            giftBoxEl.classList.remove('shaking');
            giftBoxEl.classList.add('hidden-box');
          }
          spawnSparkles(35, giftBoxEl, 'star');
          sfxClick();

          if (rankSectionEl) rankSectionEl.classList.add('celebrating');

          if (alertEl) {
            const titleTextEl = $('score-milestone-title-text');
            const rewardTextEl = $('score-milestone-reward-text');
            if (titleTextEl) {
              titleTextEl.textContent = tf('milestoneSubtextLeft', { milestone: formatFollowers(1000000) });
            }
            if (rewardTextEl) {
              rewardTextEl.textContent = '+' + formatFollowers(reward);
            }
            alertEl.classList.remove('hidden');
          }
          showToast(`+${formatStars(reward)} <img src="Items/UI/star.png" class="inline-heart" alt="star">!`, 'reward');
          
          if (rankBadgeValEl) rankBadgeValEl.textContent = formatFollowers(school.totalFollowers);
        }, 1500);
      }
    } else {
      const denom = curMilestone.to - curMilestone.from;
      const pDenom = prevMilestone.to - prevMilestone.from;
      const prevPercent = pDenom > 0 ? ((prevTotal - prevMilestone.from) / pDenom) * 100 : 0;
      const nextPercent = denom > 0 ? ((school.totalFollowers - curMilestone.from) / denom) * 100 : 0;

      if (rankBarEl) {
        if (milestoneCrossed) {
          // 1. Start at prevPercent of the old bracket
          const initialPercent = Math.min(Math.max(0, prevPercent), 100);
          rankBarEl.style.transition = '';
          rankBarEl.style.width = initialPercent + '%';
          const progTextWhiteEl = $('score-rank-progress-text-white');
          if (progTextWhiteEl) {
            progTextWhiteEl.style.transition = '';
            progTextWhiteEl.style.clipPath = `inset(0 ${100 - initialPercent}% 0 0)`;
          }
          
          // 2. Animate to 100% of the old bracket
          setTimeout(() => {
            rankBarEl.style.transition = 'width 0.6s cubic-bezier(.22,.61,.36,1)';
            rankBarEl.style.width = '100%';
            if (progTextWhiteEl) {
              progTextWhiteEl.style.transition = 'clip-path 0.6s cubic-bezier(.22,.61,.36,1)';
              progTextWhiteEl.style.clipPath = 'inset(0 0% 0 0)';
            }
            animateBothBadges(prevTotal, prevMilestone.to, 600);
          }, 300);

          if (giftBoxEl) {
            setTimeout(() => {
              giftBoxEl.classList.add('shaking');
            }, 900);
          }

          if (rankNextEl) rankNextEl.textContent = formatFollowers(prevMilestone.to);
          const rankNextDarkEl = $('score-rank-next-dark');
          if (rankNextDarkEl) rankNextDarkEl.textContent = formatFollowers(prevMilestone.to);
          
          // 3. When it reaches 100% (after ~1500ms total), trigger celebration and reward
          setTimeout(() => {
            if (giftBoxEl) {
              giftBoxEl.classList.remove('shaking');
              giftBoxEl.classList.add('hidden-box');
            }
            spawnSparkles(30, giftBoxEl, 'star');
            sfxClick();

            if (rankSectionEl) rankSectionEl.classList.add('celebrating');
            
            const milestone = newlyReached[newlyReached.length - 1] || prevMilestone.to;
            const reward = MILESTONE_REWARDS[milestone] || 3000;
            
            addStars(reward);
            saveSchoolProgress();
            
            if (alertEl) {
              const titleTextEl = $('score-milestone-title-text');
              const rewardTextEl = $('score-milestone-reward-text');
              if (titleTextEl) {
                titleTextEl.textContent = tf('milestoneSubtextLeft', { milestone: formatFollowers(milestone) });
              }
              if (rewardTextEl) {
                rewardTextEl.textContent = '+' + formatFollowers(reward);
              }
              alertEl.classList.remove('hidden');
            }
            showToast(`+${formatStars(reward)} <img src="Items/UI/star.png" class="inline-heart" alt="star">!`, 'reward');
            
            // Update total followers display badge early to reflect progress
            const currentFollowersText = formatFollowers(school.totalFollowers);
            // Since we animate these values, we just ensure they are correct when phase 2 starts
            if (rankBadgeValEl) rankBadgeValEl.textContent = formatFollowers(prevMilestone.to);
            if (rankBadgeValDarkEl) rankBadgeValDarkEl.textContent = formatFollowers(prevMilestone.to);
            
            // 4. Wait another 1500ms for player to celebrate, then reset progress bar to 0% and animate to new nextPercent
            setTimeout(() => {
              if (rankSectionEl) rankSectionEl.classList.remove('celebrating');
              if (giftBoxEl) {
                giftBoxEl.classList.remove('hidden-box');
              }

              const newPercent = Math.min(Math.max(0, nextPercent), 100);
              rankBarEl.style.transition = 'none';
              rankBarEl.style.width = '0%';
              const progTextWhiteEl = $('score-rank-progress-text-white');
              if (progTextWhiteEl) {
                progTextWhiteEl.style.transition = 'none';
                progTextWhiteEl.style.clipPath = 'inset(0 100% 0 0)';
              }
              void rankBarEl.offsetWidth; // trigger reflow
              rankBarEl.style.transition = ''; // restore CSS transition
              rankBarEl.style.width = newPercent + '%';
              if (progTextWhiteEl) {
                progTextWhiteEl.style.transition = 'clip-path 1.2s cubic-bezier(.22,.61,.36,1)';
                progTextWhiteEl.style.clipPath = `inset(0 ${100 - newPercent}% 0 0)`;
              }
              animateBothBadges(prevMilestone.to, school.totalFollowers, 1200);
              
              if (rankNextEl) rankNextEl.textContent = formatFollowers(curMilestone.to);
              const rankNextDarkEl = $('score-rank-next-dark');
              if (rankNextDarkEl) rankNextDarkEl.textContent = formatFollowers(curMilestone.to);
            }, 1500);
            
          }, 1500);
          
        } else {
          // No milestone crossed: standard animation
          const initialPercent = Math.min(Math.max(0, prevPercent), 100);
          const finalPercent = Math.min(Math.max(0, nextPercent), 100);
          rankBarEl.style.transition = '';
          rankBarEl.style.width = initialPercent + '%';
          const progTextWhiteEl = $('score-rank-progress-text-white');
          if (progTextWhiteEl) {
            progTextWhiteEl.style.transition = '';
            progTextWhiteEl.style.clipPath = `inset(0 ${100 - initialPercent}% 0 0)`;
          }
          
          setTimeout(() => {
            rankBarEl.style.width = finalPercent + '%';
            if (progTextWhiteEl) {
              progTextWhiteEl.style.transition = 'clip-path 1.2s cubic-bezier(.22,.61,.36,1)';
              progTextWhiteEl.style.clipPath = `inset(0 ${100 - finalPercent}% 0 0)`;
            }
            animateBothBadges(prevTotal, school.totalFollowers, 1200);
          }, 300);
          
          if (rankNextEl) rankNextEl.textContent = formatFollowers(curMilestone.to);
          const rankNextDarkEl = $('score-rank-next-dark');
          if (rankNextDarkEl) rankNextDarkEl.textContent = formatFollowers(curMilestone.to);
        }
      }
    }
  }

  // Comments slider overlay state
  let activeCommentIndex = 0;
  let isAnimating = false;
  const commentStates = [
    { liked: false, reaction: null },
    { liked: false, reaction: null },
    { liked: false, reaction: null }
  ];
  const commentTimes = [
    lang === 'ru' ? '2м' : '2m',
    lang === 'ru' ? '5м' : '5m',
    lang === 'ru' ? '10м' : '10m'
  ];

  // Inject comments overlay into the new comments container in the left column
  const commentsContainer = $('score-comments-container-left');
  if (commentsContainer && socialComments && socialComments.length > 0) {
    // Remove any existing overlay first to prevent duplicates
    commentsContainer.innerHTML = '';

    commentsContainer.insertAdjacentHTML('beforeend', `
      <div id="score-comment-overlay" class="score-comment-overlay">
        <button class="score-comment-arrow prev-btn" id="overlay-comment-prev" type="button">&lsaquo;</button>
        <div class="score-comment-content">
          <div class="score-comment-main">
            <div class="score-comment-avatar" id="overlay-avatar"></div>
            <div class="score-comment-text-block">
              <span class="score-comment-nick" id="overlay-nick"></span>
              <span class="score-comment-text" id="overlay-comment-text"></span>
            </div>
          </div>
          <div class="score-comment-actions-row">
            <span class="score-comment-time" id="overlay-time"></span>
            <span class="score-comment-action-btn score-like-btn" id="overlay-like-btn"></span>
            <span class="score-comment-action-btn score-reply-btn" id="overlay-reply-btn"></span>
          </div>
        </div>
        <button class="score-comment-arrow next-btn" id="overlay-comment-next" type="button">&rsaquo;</button>
      </div>
    `);

    const updateActiveComment = () => {
      const comment = socialComments[activeCommentIndex];
      if (!comment) return;

      const avatarEl = $('overlay-avatar');
      const nickEl = $('overlay-nick');
      const textEl = $('overlay-comment-text');
      const timeEl = $('overlay-time');
      const likeBtn = $('overlay-like-btn');
      const replyBtn = $('overlay-reply-btn');

      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${comment.avatar || 'Avatars/avatar_1.png'}" alt="avatar" class="score-comment-avatar-img">`;
      }
      if (nickEl) nickEl.textContent = comment.nick;
      if (textEl) textEl.textContent = comment.text;
      if (timeEl) timeEl.textContent = commentTimes[activeCommentIndex] || '2m';

      const state = commentStates[activeCommentIndex];

      if (likeBtn) {
        if (state.liked) {
          likeBtn.textContent = '❤️';
          likeBtn.classList.add('liked');
        } else {
          likeBtn.textContent = lang === 'ru' ? 'Нравится' : 'Like';
          likeBtn.classList.remove('liked');
        }
      }

      if (replyBtn) {
        if (state.reaction) {
          replyBtn.textContent = state.reaction;
          replyBtn.classList.add('has-reaction');
        } else {
          replyBtn.textContent = lang === 'ru' ? 'Ответить' : 'Reply';
          replyBtn.classList.remove('has-reaction');
        }
      }
    };

    // Initialize first comment
    updateActiveComment();
    startAutoScroll();

    // Arrows event listeners
    const prevBtn = $('overlay-comment-prev');
    const nextBtn = $('overlay-comment-next');

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        if (picker) picker.classList.add('hidden');
        startAutoScroll(); // Reset auto scroll timer on manual interaction

        const contentEl = commentsContainer.querySelector('.score-comment-content');
        if (contentEl) {
          isAnimating = true;
          contentEl.classList.remove('comment-slide-next-in', 'comment-slide-next-out', 'comment-slide-prev-in', 'comment-slide-prev-out');
          contentEl.classList.add('comment-slide-prev-out');

          setTimeout(() => {
            activeCommentIndex = (activeCommentIndex - 1 + socialComments.length) % socialComments.length;
            updateActiveComment();
            contentEl.classList.remove('comment-slide-prev-out');
            contentEl.classList.add('comment-slide-prev-in');
            isAnimating = false;
          }, 200);
        } else {
          activeCommentIndex = (activeCommentIndex - 1 + socialComments.length) % socialComments.length;
          updateActiveComment();
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        if (picker) picker.classList.add('hidden');
        startAutoScroll(); // Reset auto scroll timer on manual interaction

        const contentEl = commentsContainer.querySelector('.score-comment-content');
        if (contentEl) {
          isAnimating = true;
          contentEl.classList.remove('comment-slide-next-in', 'comment-slide-next-out', 'comment-slide-prev-in', 'comment-slide-prev-out');
          contentEl.classList.add('comment-slide-next-out');

          setTimeout(() => {
            activeCommentIndex = (activeCommentIndex + 1) % socialComments.length;
            updateActiveComment();
            contentEl.classList.remove('comment-slide-next-out');
            contentEl.classList.add('comment-slide-next-in');
            isAnimating = false;
          }, 200);
        } else {
          activeCommentIndex = (activeCommentIndex + 1) % socialComments.length;
          updateActiveComment();
        }
      };
    }

    const postCommentBtn = $('instagram-post-comment-btn');
    if (postCommentBtn) {
      postCommentBtn.onclick = (e) => {
        e.stopPropagation();
        sfxClick();
        if (nextBtn) {
          nextBtn.click();
        }
      };
    }

    // Interactive actions event listeners
    const likeBtn = $('overlay-like-btn');
    if (likeBtn) {
      likeBtn.onclick = (e) => {
        e.stopPropagation();
        if (picker) picker.classList.add('hidden');
        commentStates[activeCommentIndex].liked = !commentStates[activeCommentIndex].liked;
        updateActiveComment();
      };
    }

    const replyBtn = $('overlay-reply-btn');
    if (replyBtn && picker) {
      replyBtn.onclick = (e) => {
        e.stopPropagation();
        picker.classList.remove('hidden');
        picker.style.visibility = 'hidden';
        const pickerHeight = picker.offsetHeight;
        const pickerWidth = picker.offsetWidth;
        picker.style.visibility = 'visible';

        const rect = replyBtn.getBoundingClientRect();
        picker.style.top = `${rect.top - pickerHeight - 8 + window.scrollY}px`;
        picker.style.left = `${rect.left + (rect.width - pickerWidth) / 2 + window.scrollX}px`;

        const closeHandler = (evt) => {
          if (picker && !picker.contains(evt.target)) {
            picker.classList.add('hidden');
            document.removeEventListener('click', closeHandler);
          }
        };
        setTimeout(() => {
          document.addEventListener('click', closeHandler);
        }, 50);
      };

      const emojiOptions = picker.querySelectorAll('.emoji-option');
      emojiOptions.forEach(opt => {
        opt.onclick = (e) => {
          e.stopPropagation();
          commentStates[activeCommentIndex].reaction = opt.dataset.emoji;
          updateActiveComment();
          picker.classList.add('hidden');
        };
      });

      const clearOpt = picker.querySelector('.emoji-option-clear');
      if (clearOpt) {
        clearOpt.onclick = (e) => {
          e.stopPropagation();
          commentStates[activeCommentIndex].reaction = null;
          updateActiveComment();
          picker.classList.add('hidden');
        };
      }
    }
  }

  // Next / Close button handler
  if (isFree) {
    $('btn-next-lesson').textContent = lang === 'ru' ? 'Закрыть' : 'Close';
    $('btn-next-lesson').onclick = () => {
      stopAutoScroll();
      cleanupScoreTimers();
      if (picker) picker.classList.add('hidden');
      $('score-modal').classList.add('hidden');
    };
  } else {
    // Every post is a day. The next button advances to the next day.
    $('btn-next-lesson').textContent = t('btnNewDay');
    $('btn-next-lesson').onclick = () => {
      stopAutoScroll();
      cleanupScoreTimers();
      if (picker) picker.classList.add('hidden');
      $('score-modal').classList.add('hidden');
      showFullscreenAd(() => {
        school.day++;
        school.lessonIndex  = 0;
        school.lessonScores = [];
        school.dayFollowersGained = 0;
        buildDaySchedule();
        showAssignmentBanner();
        resetOutfit();
        $('btn-runway').disabled = false;
        saveSchoolProgress();
      });
    };
  }

  $('btn-share-score-label').textContent = lang === 'ru' ? 'Сохранить' : 'Save';
  
  // ── Удвой награду (только если trendMultiplier >= 1.3 и не свободный режим) ───────────────
  const dblBtn  = $('btn-double-reward');
  const retryBtn = $('btn-retry-lesson');
  retryBtn.classList.add('hidden');

  earned = earned || 0;
  if (!isFree && result.trendMatches >= 1) {
    let doubled = false;
    dblBtn.innerHTML = lang === 'ru'
      ? `<img src="Items/UI/shop_ad_tv.png" class="inline-tv" alt="tv">Удвоить +${formatStars(earned)} <img src="Items/UI/star.png" class="inline-heart" alt="star">`
      : `<img src="Items/UI/shop_ad_tv.png" class="inline-tv" alt="tv">Double +${formatStars(earned)} <img src="Items/UI/star.png" class="inline-heart" alt="star">`;
    dblBtn.classList.remove('hidden');
    dblBtn.onclick = () => {
      if (doubled || _adShowing) return;
      const onRewarded = () => {
        doubled = true;
        dblBtn.classList.add('hidden');
        addStars(earned);
        spawnSparkles(12, null, 'star');
        showToast(`+${formatStars(earned)} <img src="Items/UI/star.png" class="inline-heart" alt="star"> × 2!`, 'reward');
      };
      if (ysdk) {
        _adShowing = true;
        if (_actx) _actx.suspend(); pauseBGM();
        let _rewarded = false;
        const _onRewarded = onRewarded;
        ysdk.adv.showRewardedVideo({
          callbacks: {
            onRewarded: () => { _rewarded = true; },
            onClose: () => {
              _adShowing = false;
              if (_actx && soundOn) _actx.resume(); resumeBGM();
              if (_rewarded) _onRewarded();
            },
            onError: () => {
              _adShowing = false;
              if (_actx && soundOn) _actx.resume(); resumeBGM();
              showToast(lang === 'ru' ? 'Реклама недоступна' : 'Ad unavailable', 'error');
            },
          },
        });
      } else {
        onRewarded();
      }
    };
  } else {
    dblBtn.classList.add('hidden');
  }

  $('score-modal').classList.remove('hidden');
}

/**
 * Dynamically adjusts the font size of the trend label element to ensure
 * all hashtag tags fit on a single line without wrapping.
 * @param {HTMLElement} trendLabel - The element containing the trend label and tags.
 */
function adjustTrendLabelFontSize(trendLabel) {
  if (!trendLabel) return;

  // Reset font size so we measure at base style
  trendLabel.style.fontSize = '';

  const parent = trendLabel.parentElement;
  if (!parent) return;

  // Calculate the total width of all sibling elements
  let siblingsWidth = 0;
  for (let child of parent.children) {
    if (child !== trendLabel) {
      siblingsWidth += child.getBoundingClientRect().width;
    }
  }

  // Get parent's usable width (excluding padding)
  const parentStyle = window.getComputedStyle(parent);
  const paddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(parentStyle.paddingRight) || 0;
  const parentUsableWidth = parent.clientWidth - paddingLeft - paddingRight;

  // Get gap between elements
  const gap = parseFloat(parentStyle.gap) || 8;
  const gapCount = parent.children.length - 1;
  const totalGap = gap * gapCount;

  // Available width for the trend label
  const availableWidth = parentUsableWidth - siblingsWidth - totalGap - 4; // 4px safety buffer

  if (availableWidth > 0) {
    const contentWidth = trendLabel.scrollWidth;
    if (contentWidth > availableWidth) {
      const scale = availableWidth / contentWidth;
      // Set lower boundary to prevent it from becoming microscopic
      const finalScale = Math.max(0.6, scale);
      trendLabel.style.fontSize = `${finalScale}em`;
    }
  }
}

// Add global window resize handler to adjust font size dynamically
window.addEventListener('resize', () => {
  const trendLabel = document.getElementById('score-trend-label');
  const scoreModal = document.getElementById('score-modal');
  if (trendLabel && scoreModal && !scoreModal.classList.contains('hidden')) {
    adjustTrendLabelFontSize(trendLabel);
  }
});



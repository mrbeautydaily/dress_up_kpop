// ────────────────────────────────────────────────────────────
// INTRO DIALOGUE
// ────────────────────────────────────────────────────────────

const IntroDirector = {
  phase: 1,
  typingTimer: null,
  
  starterOutfit: [
    { cat: 'hair',    id: 'blunt_bob_pink_headband' },
    { cat: 'tops',    id: 'kpop_stage_top' },
    { cat: 'bottoms',  id: 'silver_metallic_skirt' },
    { cat: 'shoes',   id: 'silver_metallic_boots' }
  ],
  stageOutfit: [
    { cat: 'hair',    id: 'blunt_bob_pink_headband' },
    { cat: 'tops',    id: 'pink_sequin_dress' },
    { cat: 'bottoms',  id: 'bot_none' },
    { cat: 'socks',   id: 'y2k_overknee_socks' },
    { cat: 'shoes',   id: 'glam_high_heels' }
  ],

  steps: {
    ru: {
      dream: 'Один вирусный пост может изменить всё...',
      realityText: '...Но пока я об этом только мечтаю. 💭\nПривет! Я Хана из K-Pop группы Eclipse! 👋\nМы только что дебютировали, и о нас пока никто не знает 😅',
      gameplayText1: 'Мне нужен стилист — и это ты! 💖\nКаждый день мы публикуем посты о съемках клипов, фан-встречах, концертах...',
      gameplayText2: 'Подбирай образы под эти события — чем точнее попадёшь в стиль, тем больше подписчиков и звёзд!\n(За звёзды {heart} можно покупать новые вещи!)',
      debutText: 'Наша мечта — 1 000 000 подписчиков! 👑\nОт полных нулей до K-Pop легенд!\nНу что, поможешь мне? 🔥',
      btnNext: 'Далее ➤',
      btnDebut: 'Начать карьеру!',
      skipText: 'Пропустить',
      followersLabel: 'Подписчиков',
      postCaption: 'Дебютный сингл Eclipse уже в сети! Слушайте на всех платформах! 🎧✨'
    },
    en: {
      dream: 'One viral post can change everything...',
      realityText: "...But for now, I can only dream of it. 💭\nHi! I'm Hana from the K-Pop group Eclipse! 👋\nWe just debuted, and nobody knows us yet 😅",
      gameplayText1: "I need a stylist — and that's you! 💖\nEvery day we publish posts about music video shoots, fan meetings, concerts...",
      gameplayText2: "Match outfits to these events — the closer you get to the style, the more followers and stars we get!\n(With stars {heart}, you can buy new clothes!)",
      debutText: 'Our dream — 1,000,000 followers! 👑\nFrom total zeros to K-Pop legends!\nSo, will you help me? 🔥',
      btnNext: 'Next ➤',
      btnDebut: 'Start Career!',
      skipText: 'Skip',
      followersLabel: 'Followers',
      postCaption: "Eclipse's debut single is out now! Listen on all platforms! 🎧✨"
    }
  },

  start() {
    this.phase = 1;
    const overlay = $('intro-overlay');
    overlay.classList.remove('hidden');

    const tData = this.steps[lang] || this.steps.en;
    $('intro-skip-btn').textContent = tData.skipText;
    $('intro-follower-label').textContent = tData.followersLabel;
    
    const captionEl = $('intro-post-caption');
    if (captionEl) captionEl.textContent = tData.postCaption;

    $('intro-skip-btn').onclick = (e) => {
      e.stopPropagation();
      sfxClick();
      this.skipIntro();
    };

    this.startParticles();
    this.enterPhase1();
  },

  enterPhase1() {
    this.phase = 1;
    const tData = this.steps[lang] || this.steps.en;

    document.documentElement.style.setProperty('--page-bg', 'none');
    $('intro-bg').style.backgroundImage = "url('Background/grand_concert.jpg')";
    $('intro-bg').style.filter = 'blur(10px) brightness(0.4)';
    $('intro-bg').style.transform = 'scale(1.05)';
    $('intro-spotlight').classList.add('active');

    $('intro-dialogue').classList.remove('active');
    $('intro-character').classList.remove('active');
    $('intro-follower-counter').classList.remove('active');

    const textEl = $('intro-dream-text');
    textEl.innerHTML = '';
    textEl.classList.add('active');

    this.playSynthWhoosh();

    let typingFinished = false;
    let countingFinished = false;
    let counterAnimationRef = null;
    let transitionTimeoutRef = null;

    const startCounterAnimation = () => {
      textEl.classList.remove('active');
      $('intro-follower-counter').classList.add('active');
      this.renderCharacter(this.starterOutfit, $('intro-phone-char-stage'));

      const countNumEl = $('intro-follower-num');
      let startVal = 0;
      const endVal = 1000000;
      const duration = 2000;
      const startTime = performance.now();

      const spawnHeart = () => {
        const btn = $('intro-phone-heart');
        const counter = $('intro-follower-counter');
        if (!btn || !counter) return;
        const rect = btn.getBoundingClientRect();
        const containerRect = counter.getBoundingClientRect();
        
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = Math.random() > 0.35 ? '❤️' : (Math.random() > 0.5 ? '💖' : '👍');
        
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;
        
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        
        const rot = (Math.random() * 60 - 30) + 'deg';
        heart.style.setProperty('--rot', rot);
        
        counter.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
      };

      const countUp = (now) => {
        if (countingFinished) return;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const val = Math.floor(startVal + ease * (endVal - startVal));

        countNumEl.textContent = formatFollowers(val);

        if (Math.random() < 0.15 && progress < 0.95) {
          spawnHeart();
        }

        if (progress < 1) {
          counterAnimationRef = requestAnimationFrame(countUp);
        } else {
          countingFinished = true;
          transitionTimeoutRef = setTimeout(() => {
            if (this.phase === 1) this.enterPhase2();
          }, 2500);
        }
      };

      counterAnimationRef = requestAnimationFrame(countUp);
    };

    this.typewrite(textEl, tData.dream, () => {
      typingFinished = true;
      setTimeout(() => {
        if (this.phase === 1 && !countingFinished) {
          startCounterAnimation();
        }
      }, 1000);
    }, 45);

    $('intro-overlay').onclick = (e) => {
      if (e.target.id === 'intro-skip-btn') return;

      if (!typingFinished) {
        this.clearTyping();
        textEl.innerHTML = tData.dream;
        typingFinished = true;
        startCounterAnimation();
      } else if (!countingFinished) {
        countingFinished = true;
        if (counterAnimationRef) cancelAnimationFrame(counterAnimationRef);
        if (transitionTimeoutRef) clearTimeout(transitionTimeoutRef);
        this.enterPhase2();
      } else {
        if (transitionTimeoutRef) clearTimeout(transitionTimeoutRef);
        this.enterPhase2();
      }
    };
  },

  enterPhase2() {
    this.phase = 2;
    const tData = this.steps[lang] || this.steps.en;
    $('intro-bg').onclick = null;
    $('intro-overlay').onclick = null;

    $('intro-bg').style.backgroundImage = "url('Background/vlog.jpg')";
    $('intro-bg').style.filter = 'blur(1px) brightness(0.6)';
    $('intro-spotlight').classList.remove('active');
    $('intro-follower-counter').classList.remove('active');
    $('intro-dream-text').classList.remove('active');

    const vlogOutfit = [
      { cat: 'hair',    id: 'blunt_bob_pink_headband' },
      { cat: 'tops',    id: 'pink_y2k_cardigan' },
      { cat: 'bottoms',  id: 'y2k_cargo_pants' },
      { cat: 'shoes',   id: 'pink_hightop_sneakers' }
    ];
    this.renderCharacter(vlogOutfit);

    $('intro-character').classList.add('active');

    const dialogueEl = $('intro-dialogue');
    dialogueEl.classList.add('active');

    $('intro-name-badge').textContent = lang === 'ru' ? 'Хана' : 'Hana';
    $('intro-dots').style.display = 'flex';

    this.buildDots(4, 0);

    const btn = $('intro-next-btn');
    btn.textContent = tData.btnNext;

    const textEl = $('intro-text');
    textEl.onclick = () => {
      if (this.typingTimer) {
        this.clearTyping();
        textEl.innerHTML = this.formatText(tData.realityText);
      }
    };

    this.typewrite(textEl, tData.realityText, null, 25);

    btn.onclick = () => {
      sfxClick();
      if (this.typingTimer) {
        this.clearTyping();
        textEl.innerHTML = this.formatText(tData.realityText);
      } else {
        this.enterPhase3();
      }
    };
  },

  enterPhase3() {
    this.phase = 3;
    const tData = this.steps[lang] || this.steps.en;

    $('intro-bg').style.backgroundImage = "url('Background/photoshoot.jpg')";
    $('intro-bg').style.filter = 'blur(1px) brightness(0.6)';

    const photoshootOutfit = [
      { cat: 'hair',    id: 'blunt_bob_pink_headband' },
      { cat: 'tops',    id: 'top_dress_new_1' },
      { cat: 'bottoms',  id: 'bot_none' },
      { cat: 'shoes',   id: 'pink_mary_jane_shoes' }
    ];
    this.renderCharacter(photoshootOutfit);

    this.buildDots(4, 1);

    const btn = $('intro-next-btn');
    btn.textContent = tData.btnNext;

    const textEl = $('intro-text');
    textEl.onclick = () => {
      if (this.typingTimer) {
        this.clearTyping();
        textEl.innerHTML = this.formatText(tData.gameplayText1);
      }
    };

    this.typewrite(textEl, tData.gameplayText1, null, 25);

    btn.onclick = () => {
      sfxClick();
      if (this.typingTimer) {
        this.clearTyping();
        textEl.innerHTML = this.formatText(tData.gameplayText1);
      } else {
        this.enterPhase4();
      }
    };
  },

  enterPhase4() {
    this.phase = 4;
    const tData = this.steps[lang] || this.steps.en;

    $('intro-bg').style.backgroundImage = "url('Background/photoshoot.jpg')";
    $('intro-bg').style.filter = 'blur(1px) brightness(0.6)';

    const photoshootOutfit = [
      { cat: 'hair',    id: 'blunt_bob_pink_headband' },
      { cat: 'tops',    id: 'top_dress_new_1' },
      { cat: 'bottoms',  id: 'bot_none' },
      { cat: 'shoes',   id: 'pink_mary_jane_shoes' }
    ];
    this.renderCharacter(photoshootOutfit);

    this.buildDots(4, 2);

    const btn = $('intro-next-btn');
    btn.textContent = tData.btnNext;

    const textEl = $('intro-text');
    textEl.onclick = () => {
      if (this.typingTimer) {
        this.clearTyping();
        textEl.innerHTML = this.formatText(tData.gameplayText2);
      }
    };

    this.typewrite(textEl, tData.gameplayText2, null, 25);

    btn.onclick = () => {
      sfxClick();
      if (this.typingTimer) {
        this.clearTyping();
        textEl.innerHTML = this.formatText(tData.gameplayText2);
      } else {
        this.enterPhase5();
      }
    };
  },

  enterPhase5() {
    this.phase = 5;
    const tData = this.steps[lang] || this.steps.en;

    $('intro-bg').style.backgroundImage = "url('Background/live_stage.jpg')";
    $('intro-bg').style.filter = 'blur(1px) brightness(0.7)';
    $('intro-spotlight').classList.add('active');

    this.renderCharacter(this.stageOutfit);

    this.buildDots(4, 3);

    const btn = $('intro-next-btn');
    btn.textContent = tData.btnDebut;

    const textEl = $('intro-text');
    this.typewrite(textEl, tData.debutText, () => {
      this.spawnConfettiFireworks();
    }, 25);

    btn.onclick = () => {
      sfxClick();
      if (this.typingTimer) {
        this.clearTyping();
        textEl.innerHTML = this.formatText(tData.debutText);
      } else {
        this.finishIntro();
      }
    };
  },

  renderCharacter(outfit, stage = $('intro-char-stage')) {
    if (!stage) return;
    stage.innerHTML = '';

    const shadowDiv = document.createElement('div');
    shadowDiv.className = 'character-shadow';
    stage.appendChild(shadowDiv);

    const bodyImg = document.createElement('img');
    bodyImg.src = 'Items/body/body_new.png';
    bodyImg.alt = '';
    bodyImg.draggable = false;
    bodyImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;z-index:0;';
    stage.appendChild(bodyImg);

    const blinkImg = document.createElement('img');
    blinkImg.src = 'Items/body/body_new_blink.png';
    blinkImg.alt = '';
    blinkImg.className = 'body-blink-overlay';
    blinkImg.draggable = false;
    blinkImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;z-index:0;';
    stage.appendChild(blinkImg);

    const sorted = outfit
      .map(({ cat, id }) => {
        const item = findItem(cat, id);
        const layerZ = LAYER_ORDER.find(l => l.key === cat)?.zIndex ?? 1;
        const domOrder = LAYER_ORDER.findIndex(l => l.key === cat);
        return { item, layerZ, domOrder };
      })
      .filter(({ item }) => item && item.src && item.pos)
      .sort((a, b) => a.layerZ !== b.layerZ ? a.layerZ - b.layerZ : a.domOrder - b.domOrder);

    sorted.forEach(({ item, layerZ }) => {
      const { left, top, width } = item.pos;
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.draggable = false;
      img.style.cssText = `position:absolute;left:${left}%;top:${top}%;width:${width}%;height:auto;pointer-events:none;z-index:${layerZ};`;
      stage.appendChild(img);
    });

    if (typeof startBlinking === 'function') {
      startBlinking(stage);
    }
  },

  typewrite(el, text, onComplete, speed = 30) {
    this.clearTyping();
    el.innerHTML = '';

    const cursor = document.createElement('span');
    cursor.className = 'intro-cursor';
    el.appendChild(cursor);

    const tokens = [];
    const parts = text.split('{heart}');
    for (let j = 0; j < parts.length; j++) {
      let chars;
      if (window.Intl && window.Intl.Segmenter) {
        chars = Array.from(new Intl.Segmenter().segment(parts[j])).map(x => x.segment);
      } else {
        chars = Array.from(parts[j]);
      }
      tokens.push(...chars);
      if (j < parts.length - 1) {
        tokens.push('{heart}');
      }
    }

    let i = 0;

    const typeNext = () => {
      if (i < tokens.length) {
        const token = tokens[i++];

        if (token === '{heart}') {
          const img = document.createElement('img');
          img.src = 'Items/UI/star.png';
          img.className = 'intro-inline-heart';
          img.alt = 'star';
          el.insertBefore(img, cursor);
          this.typingTimer = setTimeout(typeNext, speed);
          return;
        }

        const tn = document.createTextNode(token === '\n' ? '' : token);
        if (token === '\n') {
          el.insertBefore(document.createElement('br'), cursor);
        } else {
          el.insertBefore(tn, cursor);
        }

        if (i % 2 === 0) this.playSynthTick();

        this.typingTimer = setTimeout(typeNext, token === '\n' ? 120 : speed);
      } else {
        cursor.remove();
        this.typingTimer = null;
        if (onComplete) onComplete();
      }
    };

    typeNext();
  },

  clearTyping() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  },

  formatText(txt) {
    return txt
      .replace(/\n/g, '<br>')
      .replace(/{heart}/g, '<img src="Items/UI/star.png" class="intro-inline-heart" alt="star">');
  },

  buildDots(total, current) {
    const dotsEl = $('intro-dots');
    dotsEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'intro-dot' + (i === current ? ' active' : '');
      dotsEl.appendChild(d);
    }
  },

  triggerFlash() {
    const flash = $('intro-flash');
    if (!flash) return;
    flash.classList.add('active');
    setTimeout(() => {
      flash.classList.remove('active');
    }, 150);
  },

  playSynthTick() {
    if (!soundOn) return;
    try {
      const ctx = actx();
      if (ctx.state === 'suspended') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(_masterGain || ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch(e) {}
  },

  playSynthFlash() {
    if (!soundOn) return;
    try {
      const ctx = actx();
      if (ctx.state === 'suspended') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(_masterGain || ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  },

  playSynthWhoosh() {
    if (!soundOn) return;
    try {
      const ctx = actx();
      if (ctx.state === 'suspended') return;

      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4, ctx.currentTime);
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(_masterGain || ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.4);
    } catch(e) {}
  },

  playSynthDressUp() {
    if (!soundOn) return;
    try {
      const ctx = actx();
      if (ctx.state === 'suspended') return;
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const time = ctx.currentTime + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.04, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        osc.connect(gain);
        gain.connect(_masterGain || ctx.destination);
        osc.start(time);
        osc.stop(time + 0.12);
      });
    } catch(e) {}
  },

  startParticles() {
    const container = $('intro-particles');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 15; i++) {
      this.spawnFloatStar(container);
    }
  },

  spawnFloatStar(container) {
    const p = document.createElement('div');
    p.className = 'intro-particle';
    const size = Math.random() * 4 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.opacity = Math.random() * 0.4 + 0.1;
    container.appendChild(p);

    const anim = () => {
      if (!document.getElementById('intro-overlay') || $('intro-overlay').classList.contains('hidden')) return;
      let y = parseFloat(p.style.top);
      y -= 0.05 + Math.random() * 0.05;
      if (y < -5) {
        y = 105;
        p.style.left = `${Math.random() * 100}%`;
      }
      p.style.top = `${y}%`;
      p.style.opacity = Math.sin(Date.now() / 600 + parseFloat(p.style.left)) * 0.2 + 0.3;
      requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  },

  spawnConfettiFireworks() {
    const container = $('intro-particles');
    if (!container) return;

    for (let k = 0; k < 40; k++) {
      const p = document.createElement('div');
      p.className = 'intro-particle';
      const size = Math.random() * 6 + 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = '50%';
      p.style.top = '40%';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';

      const colors = ['#ff007f', '#ffd700', '#00e5ff', '#ff00ff', '#e0f7fa'];
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.opacity = '1';
      container.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed - 2;
      let px = window.innerWidth / 2;
      let py = window.innerHeight * 0.4;
      let op = 1;

      const update = () => {
        vy += 0.25;
        px += vx;
        py += vy;
        op -= 0.015;

        p.style.left = `${px}px`;
        p.style.top = `${py}px`;
        p.style.opacity = op;
        p.style.transform = `rotate(${py * 1.5}deg)`;

        if (op > 0) {
          requestAnimationFrame(update);
        } else {
          p.remove();
        }
      };
      requestAnimationFrame(update);
    }
  },

  skipIntro() {
    this.clearTyping();
    this.finishIntro();
  },

  finishIntro() {
    this.clearTyping();

    equipped['socks'] = 'sock_none';
    equipped['accessories'] = 'acc_none';

    const photoshootOutfit = [
      { cat: 'hair',    id: 'blunt_bob_pink_headband' },
      { cat: 'tops',    id: 'top_dress_new_1' },
      { cat: 'bottoms',  id: 'bot_none' },
      { cat: 'shoes',   id: 'pink_mary_jane_shoes' }
    ];
    photoshootOutfit.forEach(({ cat, id }) => {
      equipped[cat] = id;
    });

    saveOutfit();
    prog.introDone = true;
    saveProgress();

    const overlay = $('intro-overlay');
    overlay.style.transition = 'opacity .6s ease';
    overlay.style.opacity = '0';
    
    // Надежный таймер вместо transitionend (чтобы игра не зависла, если игрок свернул окно)
    setTimeout(() => {
      overlay.remove();

      $('game').classList.remove('hidden');
      renderAllLayers();
      startSchoolMode();
      

      if (window.GameParticles) {
        window.GameParticles.start();
      }
    }, 600);
  }
};

function showIntro() {
  IntroDirector.start();
}


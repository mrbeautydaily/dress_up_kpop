// ────────────────────────────────────────────────────────────
// SCHOOL MODE — SCORING ENGINE
// ────────────────────────────────────────────────────────────

function getEquippedTags() {
  const tags = [];
  Object.keys(equipped).forEach(cat => {
    const item = findItem(cat, equipped[cat]);
    if (item && item.tags) tags.push(...item.tags);
  });
  return tags;
}

function countFilledSlots() {
  let filled = Object.keys(equipped).filter(cat => { const i = findItem(cat, equipped[cat]); return i && i.src; }).length;
  const topItem = findItem('tops', equipped.tops);
  if (topItem && topItem.sub === 'dresses' && topItem.src) {
    const bottomItem = findItem('bottoms', equipped.bottoms);
    if (!bottomItem || !bottomItem.src) {
      filled = Math.min(filled + 1, 6);
    }
  }
  return filled;
}

function scoreOutfit(assignment) {
  const tags   = getEquippedTags();
  const filled = countFilledSlots();
  const totalSlots = 6;

  // ── Smart naked check ──
  const topItem = findItem('tops', equipped.tops);
  const hasDress = topItem && topItem.sub === 'dresses' && topItem.src;
  const hasTop = topItem && topItem.sub !== 'dresses' && topItem.src;
  const bottomItem = findItem('bottoms', equipped.bottoms);
  const hasBottom = bottomItem && bottomItem.src;
  const isNaked = !hasDress && !(hasTop && hasBottom);

  if (isNaked) {
    return { totalPoints:0, filledPoints:0, trendPoints:0, trendMatches:0, matchedTrendTags: [],
             filled, totalSlots, req:assignment.requiredTags,
             isNaked:true, isFreePost:false };
  }

  // ── Filled points (up to 50) ──
  const filledPoints = Math.round((filled / 6) * 50);

  // ── Trend points (up to 50) ──
  let trendMatches = 0;
  let trendPoints = 0;
  let req = [];
  let matchedTrendTags = [];

  if (assignment.isFree) {
    trendMatches = 2; // Auto-perfect match for free posts
    trendPoints = 50;
  } else {
    req = assignment.requiredTags;
    matchedTrendTags = req.filter(t => tags.includes(t));
    trendMatches = matchedTrendTags.length;
    trendPoints = trendMatches * 25;
  }

  const totalPoints = filledPoints + trendPoints;

  return { totalPoints, filledPoints, trendPoints, trendMatches, matchedTrendTags,
           filled, totalSlots, req,
           isNaked:false, isFreePost:!!assignment.isFree };
}

// ────────────────────────────────────────────────────────────
// SCHOOL MODE — FLOW
// ────────────────────────────────────────────────────────────

function buildDaySchedule() {
  const allTasks = [
    PROMO_ACTIVITIES[0], // Day 1: Recording Session (bold, kpop)
    PROMO_ACTIVITIES[6], // Day 2: Vlog Recording (casual, cute)
    PROMO_ACTIVITIES[2], // Day 3: Album Photoshoot (kpop, elegant)
    FREE_POST,            // Day 4: Free Style Post
    PROMO_ACTIVITIES[1], // Day 5: Fitness & Stretching (sporty, casual)
    PROMO_ACTIVITIES[3], // Day 6: Fansign Event (school, formal)
    PROMO_ACTIVITIES[4], // Day 7: Variety Show (kpop, cute)
    FINAL_STAGES[0],     // Day 8: Inkigayo Live Stage (kpop, bold)
    PROMO_ACTIVITIES[5], // Day 9: Choreography Practice (sporty, kpop)
    FREE_POST,            // Day 10: Free Style Post
    PROMO_ACTIVITIES[7], // Day 11: Live with Fans (school, casual)
    PROMO_ACTIVITIES[8], // Day 12: Viral Dance Challenge (cute, bold)
    FINAL_STAGES[1],     // Day 13: Rookie Awards Stage (formal, elegant)
  ];
  const idx = Math.max(0, school.day - 1) % allTasks.length;
  school.schedule = [allTasks[idx]];
}

function startSchoolMode() {
  school.active       = true;
  school.lessonIndex  = 0;
  school.lessonScores = [];
  buildDaySchedule();
  $('assignment-banner').classList.remove('hidden');
  $('btn-runway').classList.remove('hidden');
  $('outfit-name-display').textContent = '';
  showAssignmentBanner();
  saveSchoolProgress();
}

function updateStageBackground(bgName) {
  const stage = $('stage');
  let bgUrl = '';
  
  if (bgName) {
    bgUrl = `Background/${bgName}.jpg`;
    const idx = BACKGROUNDS.findIndex(b => b.endsWith(`${bgName}.jpg`));
    if (idx !== -1) {
      currentBackgroundIndex = idx;
    }
  } else {
    bgUrl = BACKGROUNDS[currentBackgroundIndex];
  }
  
  if (stage) {
    stage.style.backgroundImage = 'none';
  }
  document.documentElement.style.setProperty('--page-bg', `url('../${bgUrl}')`);
}

function changeBackground(direction) {
  currentBackgroundIndex = (currentBackgroundIndex + direction + BACKGROUNDS.length) % BACKGROUNDS.length;
  updateStageBackground();
}

function showAssignmentBanner() {
  const a = school.schedule[school.lessonIndex];
  if (!a) return; // guard: schedule not ready yet
  updateStageBackground(a.id);
  
  const iconEl = $('banner-task-icon');
  if (iconEl) {
    iconEl.src = `Items/UI/activities/${getActivityIcon(a.id)}`;
    iconEl.style.display = 'block';
  }

  const subtitleEl = $('banner-task-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = lang === 'ru' ? 'Тема:' : 'Theme:';
  }

  if ($('banner-task-title')) {
    $('banner-task-title').textContent = assignmentTitle(a);
  }
  if ($('banner-task-desc')) {
    $('banner-task-desc').textContent = assignmentDesc(a);
  }
  
  const tagsContainer = $('banner-tags-container');
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    translateTags(a.requiredTags).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag-badge';
      span.textContent = `#${tag}`;
      tagsContainer.appendChild(span);
    });
  }
  
  $('outfit-name-display').textContent = assignmentDesc(a);

  const banner = $('assignment-banner');
  const arrow = $('assignment-card-arrow');
  if (banner && arrow) {
    if (school.day === 1) {
      banner.classList.remove('collapsed');
      arrow.classList.remove('arrow-glow');
    } else {
      if (!school.bannerGlowDismissed) {
        banner.classList.add('collapsed');
        arrow.classList.add('arrow-glow');
      } else {
        arrow.classList.remove('arrow-glow');
      }
    }
  }

  setTimeout(() => {
    adjustAssignmentBannerWidth();
    adjustStageCounters();
  }, 0);
}

function adjustAssignmentBannerWidth() {
  const banner = $('assignment-banner');
  const stage = $('stage');
  if (!banner || banner.classList.contains('hidden') || !stage) return;

  const stageRect = stage.getBoundingClientRect();
  if (stageRect.width === 0) return; // Not visible or rendered yet

  // Standard width from CSS
  const standardWidth = window.innerWidth < 600 ? 190 : (window.innerWidth < 860 ? 210 : 290);
  const bannerLeft = window.innerWidth < 860 ? 8 : 12;

  // Character starts around 30% of stage width
  const characterLeft = stageRect.left + stageRect.width * 0.3;

  // Available space up to character with a 12px margin
  const availableWidth = characterLeft - bannerLeft - 12;

  if (availableWidth < standardWidth) {
    banner.style.setProperty('width', `${Math.max(120, availableWidth)}px`, 'important');
  } else {
    banner.style.setProperty('width', `${standardWidth}px`, 'important');
  }
}

function adjustStageCounters() {
  const counters = document.querySelector('.stage-counters');
  const stage = $('stage');
  const stageWrap = $('stage-wrap');
  if (!counters || !stage || !stageWrap) return;

  const stageRect = stage.getBoundingClientRect();
  const stageWrapRect = stageWrap.getBoundingClientRect();
  if (stageRect.width === 0) return; // Not visible or rendered yet

  // Character right boundary is around 70% of stage width
  const characterRight = stageRect.left + stageRect.width * 0.7;

  // Available space from right edge of stageWrap to characterRight (minus 12px margin and 12px gap)
  const availableSpace = stageWrapRect.right - characterRight - 24;

  // Reset transform to get natural width
  counters.style.transform = 'none';
  counters.style.transformOrigin = 'top right';

  const countersRect = counters.getBoundingClientRect();
  const naturalWidth = countersRect.width;

  if (naturalWidth > availableSpace) {
    const scale = Math.max(0.65, availableSpace / naturalWidth);
    counters.style.setProperty('transform', `scale(${scale})`, 'important');
  } else {
    counters.style.setProperty('transform', 'none', 'important');
  }
}

// ────────────────────────────────────────────────────────────
// RUNWAY BUTTON
// ────────────────────────────────────────────────────────────

function onRunwayClick() {
  if (!school.active) {
    // Free mode — snap photo, trigger flash and open post overlay
    hideCtxHint();
    prog.runwayCount = (prog.runwayCount || 0) + 1;
    saveProgress();
    
    // Play shutter sound, trigger visual flash, and clone DOM stage instantly
    $('btn-runway').disabled = true;
    triggerCameraFlash(() => {
      showScoreScreen(null, null, 0);
      $('btn-runway').disabled = false;
    });
    return;
  }
  const assignment = school.schedule[school.lessonIndex];
  if (!assignment) return; // guard: schedule not ready yet
  hideCtxHint();
  $('btn-runway').disabled = true;
  
  const result = scoreOutfit(assignment);
  school.lessonScores.push(result.totalPoints); // Store total points

  // ── Growing reach: quadratic progression targeting 1M followers in ~40 posts ──
  school.totalPosts++;

  // ── Followers earned based on score and quadratic growth: 45 * N^2 ──
  let followers;
  if (result.isNaked) {
    followers = Math.floor(Math.random() * 10) + 1;
  } else {
    const postNum = school.totalPosts;
    const baseFollowers = 45 * postNum * postNum;
    followers = Math.round((result.totalPoints / 100) * baseFollowers);
    if (followers < 1) followers = 1;
  }

  school.totalFollowers += followers;
  school.dayFollowersGained += followers;

  // ── Social likes (display only, not currency) ──
  const [lMin, lMax] = LIKE_MULTIPLIER;
  const likes = followers * (Math.floor(Math.random() * (lMax - lMin + 1)) + lMin);

  // ── Likes reward (currency) ──
  const earned = result.isNaked ? 0 : result.totalPoints;

  prog.totalLessons++;
  prog.runwayCount = (prog.runwayCount || 0) + 1;
  if (result.totalPoints > (prog.highScore || 0)) prog.highScore = result.totalPoints;
  if (result.totalPoints >= 100) {
    prog.perfectCount = (prog.perfectCount || 0) + 1;
  }

  saveProgress();
  addStars(earned);
  saveSchoolProgress();

  // Instant shutter click + flash -> show post and results using stage cloning
  triggerCameraFlash(() => {
    showScoreScreen(assignment, result, earned, { followers, likes });
  });
}


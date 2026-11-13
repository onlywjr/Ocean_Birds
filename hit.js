(() => {
  const canvas = document.querySelector('#shore');
  const ctx = canvas.getContext('2d');
  const timeOutput = document.querySelector('#time');
  const scoreOutput = document.querySelector('#score');
  const timeCard = document.querySelector('.hud-time');
  const welcome = document.querySelector('#welcome');
  const results = document.querySelector('#results');
  const feedback = document.querySelector('#feedback');
  const resultScore = document.querySelector('#final-score');
  const resultCopy = document.querySelector('#result-copy');
  const images = {};
  const imageIds = [7, 20, 22, 27, 32, 36, 46, 51, 55];
  for (const id of imageIds) {
    const image = new Image();
    image.src = FOOD_SEARCH_PATHS[id];
    images[id] = image;
  }

  const foods = [27, 32, 36];
  const trash = [46, 51, 55];
  const items = [...foods.map(id => ({ id, kind: 'food', points: 10 })), ...trash.map(id => ({ id, kind: 'trash', points: -8 }))];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let running = false;
  let startedAt = 0;
  let lastFrame = 0;
  let score = 0;
  let bird = { x: 0, y: 0, targetX: 0, targetY: 0, faceRight: false, peckUntil: 0 };
  let targets = [];
  let particles = [];
  let floatingText = [];
  let nextSpawnAt = 0;
  let feedbackTimer;
  let raf = 0;
  const heldKeys = new Set();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) draw(performance.now());
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function rand(min, max) { return min + Math.random() * (max - min); }

  function drawBackground(now) {
    const image = images[7];
    ctx.fillStyle = '#a9c5bb';
    ctx.fillRect(0, 0, width, height);
    if (image.complete && image.naturalWidth) {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const sourceWidth = width / scale;
      const sourceHeight = height / scale;
      const sx = (image.naturalWidth - sourceWidth) / 2;
      const sy = (image.naturalHeight - sourceHeight) * .62;
      ctx.drawImage(image, sx, sy, sourceWidth, sourceHeight, 0, 0, width, height);
    }
    const tint = ctx.createLinearGradient(0, 0, 0, height);
    tint.addColorStop(0, '#14394124');
    tint.addColorStop(.48, '#174c4e08');
    tint.addColorStop(1, '#123a3e38');
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = height * (.56 + i * .047);
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 28) {
        const wave = Math.sin(x * .012 + now * .00045 + i * 1.8) * (2 + i * .16);
        if (x === -20) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.strokeStyle = `rgba(245, 250, 239, ${.055 + i * .004})`;
      ctx.stroke();
    }
    ctx.restore();
  }

  function spawnTarget(kind) {
    const pool = kind === 'food' ? foods : kind === 'trash' ? trash : Math.random() < .64 ? foods : trash;
    const id = pool[Math.floor(Math.random() * pool.length)];
    const isFood = foods.includes(id);
    const maxSide = clamp(width * .045, 44, 76) * rand(.86, 1.12);
    const image = images[id];
    const ratio = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
    const w = ratio >= 1 ? maxSide : maxSide * ratio;
    const h = ratio >= 1 ? maxSide / ratio : maxSide;
    let x, y, attempts = 0;
    do {
      x = rand(width * .06, width * .94);
      y = rand(height * .22, height * .88);
      attempts++;
    } while (attempts < 24 && (Math.hypot(x - bird.x, y - bird.y) < Math.max(110, width * .09) || targets.some(t => Math.hypot(x - t.x, y - t.y) < maxSide * 1.6)));
    const elapsed = running ? Math.max(0, (performance.now() - startedAt) / 1000) : 0;
    const lifetime = rand(1.65 - elapsed * .009, 2.05 - elapsed * .014);
    targets.push({ id, kind: isFood ? 'food' : 'trash', x, y, w, h, size: maxSide, phase: rand(0, Math.PI * 2), bornAt: performance.now(), expiresAt: performance.now() + Math.max(.82, lifetime) * 1000 });
  }

  function drawTarget(target, now) {
    const life = Math.max(0, Math.min(1, (target.expiresAt - now) / 260));
    const appear = clamp((now - target.bornAt) / 170, 0, 1);
    const bob = Math.sin(now * .0015 + target.phase) * Math.min(4, height * .005);
    const x = target.x;
    const y = target.y + bob;
    ctx.save();
    ctx.globalAlpha = life;
    ctx.translate(x, y);
    ctx.scale(.72 + .28 * appear, .72 + .28 * appear);
    ctx.translate(-x, -y);
    const glow = target.kind === 'food' ? '#f6cd7930' : '#de8e7c28';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, y + target.h * .28, target.size * .65, target.size * .24, 0, 0, Math.PI * 2);
    ctx.fill();

    const image = images[target.id];
    if (image.complete && image.naturalWidth) {
      ctx.save();
      ctx.shadowColor = '#102d3745';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      ctx.drawImage(image, x - target.w / 2, y - target.h / 2, target.w, target.h);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawBird(now) {
    const pecking = now < bird.peckUntil;
    const image = images[pecking ? 22 : 20];
    if (!image.complete || !image.naturalWidth) return;
    const baseHeight = clamp(height * .2, 108, 190);
    const spriteHeight = pecking ? baseHeight * .7 : baseHeight;
    const spriteWidth = spriteHeight * image.naturalWidth / image.naturalHeight;
    const vx = bird.targetX - bird.x;
    if (Math.abs(vx) > 2) bird.faceRight = vx > 0;
    const bob = Math.sin(now * .005) * 2;
    ctx.save();
    ctx.translate(bird.x, bird.y + bob);
    if (bird.faceRight) ctx.scale(-1, 1);
    ctx.shadowColor = '#102d3738';
    ctx.shadowBlur = 13;
    ctx.shadowOffsetY = 6;
    ctx.drawImage(image, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
    ctx.restore();
  }

  function drawEffects(dt) {
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 18 * dt;
      p.life -= dt;
      ctx.globalAlpha = clamp(p.life / .55, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    floatingText = floatingText.filter(f => f.life > 0);
    for (const f of floatingText) {
      f.y -= 28 * dt;
      f.life -= dt;
      ctx.globalAlpha = clamp(f.life / .7, 0, 1);
      ctx.font = '700 22px "Noto Serif TC", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      ctx.shadowColor = '#fffefa';
      ctx.shadowBlur = 6;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function showFeedback(target) {
    clearTimeout(feedbackTimer);
    feedback.hidden = false;
    feedback.className = `food-feedback is-${target.kind}`;
    feedback.textContent = target.kind === 'food' ? '覓食成功　+10' : '垃圾不能吃　−8';
    feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 820);
  }

  function collect(target, now) {
    score += target.kind === 'food' ? 10 : -8;
    scoreOutput.textContent = String(score);
    bird.peckUntil = now + 360;
    showFeedback(target);
    floatingText.push({ x: target.x, y: target.y - 14, text: target.kind === 'food' ? '+10' : '−8', color: target.kind === 'food' ? '#216e56' : '#ad4a3d', life: .8 });
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI * 2 * i / 10 + rand(-.2, .2);
      const speed = rand(22, 78);
      particles.push({ x: target.x, y: target.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: rand(2, 4), color: target.kind === 'food' ? '#f4d28a' : '#e7a08a', life: .55 });
    }
  }

  function formatTime(seconds) {
    const value = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(value / 60);
    const remainder = value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  function finishGame() {
    running = false;
    cancelAnimationFrame(raf);
    resultScore.textContent = String(score);
    resultCopy.textContent = score >= 100 ? '好眼力！小白鷺今天吃得飽飽，海岸也保持得很乾淨。' : score >= 40 ? '不錯的覓食成果！再多留意一下海面上的垃圾。' : '海岸還有不少垃圾，帶小白鷺再巡一圈吧。';
    results.hidden = false;
  }

  function update(now, dt) {
    const elapsed = (now - startedAt) / 1000;
    const remain = 60 - elapsed;
    timeOutput.textContent = formatTime(remain);
    timeCard.classList.toggle('is-urgent', remain <= 10);
    if (remain <= 0) {
      finishGame();
      return;
    }

    if (heldKeys.size) {
      const speed = Math.max(width, height) * .58 * dt;
      if (heldKeys.has('ArrowLeft') || heldKeys.has('a')) bird.targetX -= speed;
      if (heldKeys.has('ArrowRight') || heldKeys.has('d')) bird.targetX += speed;
      if (heldKeys.has('ArrowUp') || heldKeys.has('w')) bird.targetY -= speed;
      if (heldKeys.has('ArrowDown') || heldKeys.has('s')) bird.targetY += speed;
    }
    bird.targetX = clamp(bird.targetX, 50, width - 50);
    bird.targetY = clamp(bird.targetY, height * .2, height - 80);
    const ease = 1 - Math.exp(-dt * 8.5);
    bird.x += (bird.targetX - bird.x) * ease;
    bird.y += (bird.targetY - bird.y) * ease;

    targets = targets.filter(target => target.expiresAt > now);
    const spawnEvery = Math.max(380, 860 - elapsed * 7.2);
    if (now >= nextSpawnAt && targets.length < 6) {
      spawnTarget();
      nextSpawnAt = now + rand(spawnEvery * .72, spawnEvery * 1.25);
    }

    const catchRadius = clamp(height * .073, 44, 72);
    for (let i = targets.length - 1; i >= 0; i--) {
      const target = targets[i];
      if (Math.hypot(bird.x - target.x, bird.y - target.y) < catchRadius + target.size * .25) {
        targets.splice(i, 1);
        collect(target, now);
      }
    }
  }

  function draw(now, dt = 0) {
    ctx.clearRect(0, 0, width, height);
    drawBackground(now);
    for (const target of targets) drawTarget(target, now);
    if (running) {
      drawBird(now);
      drawEffects(dt);
    } else if (!welcome.hidden && images[20].complete && images[20].naturalWidth) {
      const image = images[20];
      const h = clamp(height * .18, 100, 160);
      const w = h * image.naturalWidth / image.naturalHeight;
      ctx.save();
      ctx.globalAlpha = .9;
      ctx.drawImage(image, width * .72 - w / 2, height * .66 - h / 2, w, h);
      ctx.restore();
    }
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    update(now, dt);
    if (running) {
      draw(now, dt);
      raf = requestAnimationFrame(frame);
    }
  }

  function startGame() {
    running = true;
    startedAt = performance.now();
    lastFrame = startedAt;
    score = 0;
    scoreOutput.textContent = '0';
    timeOutput.textContent = '01:00';
    timeCard.classList.remove('is-urgent');
    welcome.hidden = true;
    results.hidden = true;
    feedback.hidden = true;
    particles = [];
    floatingText = [];
    targets = [];
    bird = { x: width * .5, y: height * .68, targetX: width * .5, targetY: height * .68, faceRight: false, peckUntil: 0 };
    for (let i = 0; i < 3; i++) spawnTarget();
    nextSpawnAt = startedAt + 650;
    canvas.focus({ preventScroll: true });
    raf = requestAnimationFrame(frame);
  }

  function moveTarget(event) {
    if (!running) return;
    if (event.pointerType === 'touch') event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      bird.targetX = x;
      bird.targetY = y;
      heldKeys.clear();
    }
  }

  document.querySelector('#start').addEventListener('click', startGame);
  document.querySelector('#again').addEventListener('click', startGame);
  window.addEventListener('pointermove', moveTarget, { passive: false });
  canvas.addEventListener('pointerdown', moveTarget, { passive: false });
  window.addEventListener('keydown', event => {
    if (!running) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'].includes(event.key)) {
      heldKeys.add(event.key);
      if (event.key.startsWith('Arrow')) event.preventDefault();
    }
  });
  window.addEventListener('keyup', event => heldKeys.delete(event.key));
  window.addEventListener('blur', () => heldKeys.clear());
  window.addEventListener('resize', resize);
  for (const image of Object.values(images)) image.addEventListener('load', () => { if (!running) draw(performance.now()); });
  resize();
})();

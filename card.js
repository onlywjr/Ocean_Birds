(() => {
  const species = [
    [11, '小白鷺'], [13, '黑鳶'], [15, '魚鷹'], [17, '彩鷸'],
    [19, '灰斑鴴'], [21, '紅胸濱鷸'], [23, '小燕鷗'], [25, '翠鳥'],
    [27, '白背鴴'], [29, '東方環頸鴴'], [31, '中杓鷸'], [9, '白腹鰹鳥'],
  ].map(([id, name]) => ({ id, name, src: window.MATCHING_IMAGE_PATHS[id] }));
  const modes = { 6: 60, 8: 90, 12: 120 };
  const board = document.querySelector('#board');
  const welcome = document.querySelector('#welcome');
  const pausePanel = document.querySelector('#pause-panel');
  const results = document.querySelector('#results');
  const timerOutput = document.querySelector('#timer');
  const matchesOutput = document.querySelector('#matches');
  const totalOutput = document.querySelector('#total');
  const flipsOutput = document.querySelector('#flips');
  const progress = document.querySelector('#time-progress');
  const pauseButton = document.querySelector('#pause');
  const resetButton = document.querySelector('#reset');
  const modeButtons = [...document.querySelectorAll('.difficulty-picker button')];
  let pairCount = 12;
  let duration = modes[pairCount];
  let remainingMs = duration * 1000;
  let startedAt = 0;
  let timerId = 0;
  let firstCard = null;
  let locked = false;
  let paused = false;
  let hasStarted = false;
  let foundPairs = 0;
  let flips = 0;

  function shuffle(values) { return [...values].sort(() => Math.random() - .5); }

  function formatTime(milliseconds) {
    const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function updateHud() {
    timerOutput.textContent = formatTime(remainingMs);
    matchesOutput.textContent = String(foundPairs);
    flipsOutput.textContent = String(flips);
    document.querySelector('.hud-time').classList.toggle('is-urgent', remainingMs <= 10000);
    progress.style.transform = `scaleX(${Math.max(0, remainingMs / (duration * 1000))})`;
    progress.style.background = remainingMs <= 10000 ? '#e88970' : '';
  }

  function stopTimer() {
    window.clearInterval(timerId);
    timerId = 0;
  }

  function tick() {
    remainingMs = Math.max(0, duration * 1000 - (Date.now() - startedAt));
    updateHud();
    if (remainingMs <= 0) finish(false);
  }

  function startTimer() {
    if (timerId || paused || !hasStarted || board.hidden) return;
    startedAt = Date.now() - (duration * 1000 - remainingMs);
    timerId = window.setInterval(tick, 100);
  }

  function makeCard(bird, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'bird-card';
    card.dataset.species = String(bird.id);
    card.dataset.index = String(index + 1);
    card.setAttribute('aria-label', `第 ${index + 1} 張尚未翻開的鳥類卡片`);
    card.setAttribute('aria-pressed', 'false');

    const inner = document.createElement('span');
    inner.className = 'card-inner';
    const back = document.createElement('span');
    back.className = 'card-face card-back';
    back.setAttribute('aria-hidden', 'true');
    const front = document.createElement('span');
    front.className = 'card-face card-front';
    const image = document.createElement('img');
    image.src = bird.src;
    image.alt = '';
    image.draggable = false;
    image.loading = 'lazy';
    const name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = bird.name;
    front.append(image, name);
    inner.append(back, front);
    card.append(inner);
    card.addEventListener('click', () => flip(card, bird.name));
    return card;
  }

  function buildBoard() {
    const selected = shuffle(species).slice(0, pairCount);
    const deck = shuffle([...selected, ...selected]);
    const columns = pairCount === 6 ? 4 : pairCount === 8 ? 4 : 6;
    const rows = Math.ceil((pairCount * 2) / columns);
    board.style.setProperty('--columns', String(columns));
    board.style.setProperty('--rows', String(rows));
    board.replaceChildren(...deck.map(makeCard));
  }

  function beginGame() {
    stopTimer();
    duration = modes[pairCount];
    remainingMs = duration * 1000;
    firstCard = null;
    locked = false;
    paused = false;
    hasStarted = false;
    foundPairs = 0;
    flips = 0;
    pauseButton.textContent = '休息一下';
    pauseButton.setAttribute('aria-pressed', 'false');
    totalOutput.textContent = String(pairCount);
    buildBoard();
    updateHud();
    welcome.hidden = true;
    pausePanel.hidden = true;
    results.hidden = true;
    board.hidden = false;
    pauseButton.hidden = false;
    resetButton.hidden = false;
  }

  function flip(card, name) {
    if (locked || paused || card.disabled || card.classList.contains('is-flipped')) return;
    hasStarted = true;
    startTimer();
    flips++;
    flipsOutput.textContent = String(flips);
    card.classList.add('is-flipped');
    card.setAttribute('aria-pressed', 'true');
    card.setAttribute('aria-label', `第 ${card.dataset.index} 張：${name}`);
    if (!firstCard) {
      firstCard = card;
      return;
    }

    if (firstCard.dataset.species === card.dataset.species) {
      const matched = [firstCard, card];
      firstCard = null;
      matched.forEach(item => {
        item.classList.add('is-matched');
        item.disabled = true;
        item.setAttribute('aria-label', `${name}，配對成功`);
      });
      foundPairs++;
      matchesOutput.textContent = String(foundPairs);
      if (foundPairs === pairCount) finish(true);
      return;
    }

    locked = true;
    const previous = firstCard;
    firstCard = null;
    previous.classList.add('is-mismatched');
    card.classList.add('is-mismatched');
    window.setTimeout(() => {
      [previous, card].forEach(item => {
        item.classList.remove('is-flipped', 'is-mismatched');
        item.setAttribute('aria-pressed', 'false');
        item.setAttribute('aria-label', `第 ${item.dataset.index} 張尚未翻開的鳥類卡片`);
      });
      locked = false;
    }, 780);
  }

  function bestForMode() {
    try { return JSON.parse(localStorage.getItem(`coastal-pair-best-${pairCount}`) || 'null'); }
    catch { return null; }
  }

  function finish(won) {
    stopTimer();
    board.hidden = true;
    pausePanel.hidden = true;
    results.hidden = false;
    pauseButton.hidden = true;
    resetButton.hidden = true;
    document.querySelector('#result-title').textContent = won ? '配對成功！' : '時間到，再試一次';
    document.querySelector('#result-matches').textContent = String(foundPairs);
    const copy = document.querySelector('#result-copy');
    if (!won) {
      copy.textContent = `你已翻牌 ${flips} 次。還差 ${pairCount - foundPairs} 對鳥兒，就能完成這趟海岸記憶挑戰。`;
    } else {
      const record = { flips, seconds: Math.ceil((duration * 1000 - remainingMs) / 1000) };
      const oldBest = bestForMode();
      const isBest = !oldBest || record.flips < oldBest.flips || (record.flips === oldBest.flips && record.seconds < oldBest.seconds);
      if (isBest) {
        try { localStorage.setItem(`coastal-pair-best-${pairCount}`, JSON.stringify(record)); } catch { /* Local file mode may block saved records. */ }
      }
      copy.textContent = `用時 ${formatTime(duration * 1000 - remainingMs)}，翻牌 ${flips} 次。${isBest ? '創下這個難度的最佳紀錄！' : `最佳紀錄：${oldBest.flips} 次翻牌。`}`;
    }
    document.querySelector('#again').focus();
  }

  modeButtons.forEach(button => button.addEventListener('click', () => {
    modeButtons.forEach(option => option.classList.toggle('is-active', option === button));
    pairCount = Number(button.dataset.pairs);
    timerOutput.textContent = formatTime(modes[pairCount] * 1000);
    totalOutput.textContent = String(pairCount);
    progress.style.transform = 'scaleX(1)';
  }));
  document.querySelector('#begin').addEventListener('click', beginGame);
  document.querySelector('#again').addEventListener('click', beginGame);
  resetButton.addEventListener('click', beginGame);
  pauseButton.addEventListener('click', () => {
    if (board.hidden || !results.hidden) return;
    paused = !paused;
    pauseButton.textContent = paused ? '繼續遊戲' : '休息一下';
    pauseButton.setAttribute('aria-pressed', String(paused));
    if (paused) {
      if (timerId) remainingMs = Math.max(0, duration * 1000 - (Date.now() - startedAt));
      stopTimer();
      updateHud();
      pausePanel.hidden = false;
    } else {
      pausePanel.hidden = true;
      startTimer();
    }
  });
  document.querySelector('#resume').addEventListener('click', () => {
    paused = false;
    pauseButton.textContent = '休息一下';
    pauseButton.setAttribute('aria-pressed', 'false');
    pausePanel.hidden = true;
    startTimer();
  });
  updateHud();
})();

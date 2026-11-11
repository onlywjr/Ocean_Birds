const species = [
  [11, '小白鷺'], [13, '黑鳶'], [15, '魚鷹'], [17, '彩鷸'],
  [19, '灰斑鴴'], [21, '紅胸濱鷸'], [23, '小燕鷗'], [25, '翠鳥'],
  [27, '白背鴴'], [29, '東方環頸鴴'], [31, '中杓鷸'], [9, '白腹鰹鳥'],
].map(([id, name]) => ({ id, name, src: window.MATCHING_IMAGE_PATHS[id] }));

const board = document.querySelector('#board');
const welcome = document.querySelector('#welcome');
const timer = document.querySelector('#timer');
const matches = document.querySelector('#matches');
const pauseButton = document.querySelector('#pause');
const result = document.querySelector('#result');
let first = null, lock = false, paused = false, elapsed = 0, flips = 0, ticker = null, startedAt = 0;

document.querySelector('#bird-cards').innerHTML = species.map((bird, i) =>
  `<img src="${bird.src}" alt="" style="--angle:${(i % 5 - 2) * 5}deg">`).join('');

function formatTime(tenths) {
  const seconds = Math.floor(tenths / 10);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}.${tenths % 10}`;
}

function stopTimer() { clearInterval(ticker); ticker = null; }

function readBest() {
  try { return JSON.parse(localStorage.getItem('bird-memory-best-v1') || 'null'); }
  catch { return null; }
}

function writeBest(record) {
  try { localStorage.setItem('bird-memory-best-v1', JSON.stringify(record)); }
  catch { /* File origins can disable local storage; the round still works. */ }
}

function startTimer() {
  if (ticker || elapsed >= 1200 || paused) return;
  startedAt = Date.now() - elapsed * 100;
  ticker = setInterval(() => {
    elapsed = Math.floor((Date.now() - startedAt) / 100);
    timer.value = formatTime(elapsed);
    timer.textContent = formatTime(elapsed);
    if (elapsed >= 1200) finish(false);
  }, 100);
}

function finish(won) {
  stopTimer();
  document.querySelector('#result-title').textContent = won ? '配對成功！' : '時間到';
  const resultMessage = document.querySelector('#result-message');
  if (won) {
    const oldBest = readBest();
    const record = { time: elapsed, flips };
    const isBest = !oldBest || record.time < oldBest.time || (record.time === oldBest.time && record.flips < oldBest.flips);
    const best = isBest ? record : oldBest;
    if (isBest) writeBest(record);
    resultMessage.textContent = `你在 ${formatTime(elapsed)} 內找到所有配對，共翻牌 ${flips} 次。${isBest ? '創下最佳紀錄！' : `最佳紀錄：${formatTime(best.time)}，${best.flips} 次。`}`;
  } else {
    resultMessage.textContent = `兩分鐘到了，完成 ${matches.textContent} 組、翻牌 ${flips} 次。再試一次，幫鳥兒找到雙胞胎吧。`;
  }
  result.hidden = false;
  document.querySelector('#again').focus();
}

function flip(card) {
  if (lock || paused || card.classList.contains('matched') || card === first) return;
  startTimer();
  flips++;
  card.setAttribute('aria-pressed', 'true');
  card.setAttribute('aria-label', card.dataset.name);
  card.innerHTML = `<img src="${card.dataset.src}" alt="${card.dataset.name}">`;
  if (!first) { first = card; return; }
  if (first.dataset.species === card.dataset.species) {
    first.classList.add('matched');
    card.classList.add('matched');
    first = null;
    const total = Number(matches.textContent) + 1;
    matches.textContent = total;
    if (total === species.length) finish(true);
  } else {
    lock = true;
    const previous = first;
    first = null;
    setTimeout(() => {
      previous.setAttribute('aria-pressed', 'false');
      card.setAttribute('aria-pressed', 'false');
      previous.setAttribute('aria-label', `第 ${previous.dataset.index} 張未知卡片`);
      card.setAttribute('aria-label', `第 ${card.dataset.index} 張未知卡片`);
      previous.innerHTML = '';
      card.innerHTML = '';
      lock = false;
    }, 900);
  }
}

function newGame() {
  stopTimer(); elapsed = 0; flips = 0; first = null; lock = false; paused = false;
  timer.value = '00:00.0'; timer.textContent = '00:00.0';
  matches.textContent = '0'; pauseButton.textContent = '休息一下'; pauseButton.setAttribute('aria-pressed', 'false');
  const deck = [...species, ...species].sort(() => Math.random() - .5);
  board.innerHTML = deck.map((bird, i) => `<button class="memory-card" type="button" role="gridcell" aria-label="第 ${i + 1} 張未知卡片" aria-pressed="false" data-index="${i + 1}" data-species="${bird.id}" data-name="${bird.name}" data-src="${bird.src}"></button>`).join('');
  board.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', () => flip(card)));
  welcome.hidden = true; board.hidden = false; result.hidden = true;
}

document.querySelector('#begin').addEventListener('click', newGame);
document.querySelector('#new-game').addEventListener('click', newGame);
document.querySelector('#again').addEventListener('click', newGame);
pauseButton.addEventListener('click', () => {
  if (board.hidden || result.hidden === false) return;
  paused = !paused;
  pauseButton.textContent = paused ? '繼續遊戲' : '休息一下';
  pauseButton.setAttribute('aria-pressed', String(paused));
  if (paused) stopTimer(); else startTimer();
});

const regionBirds = {
  'white-bellied-booby': {
    name: '白腹鰹鳥', caption: '鰹科',
    images: ['assets/region/white-bellied-booby.jpg', ...[2,3,4,5,6].map(n => `assets/region/white-bellied-booby-0${n}.jpg`)],
    stories: [
      '大家好，我叫白腹鰹鳥，是屬於鰹鳥家族中的一份子，我可是個大塊頭，體長約有73公分呢!',
      '許多人喜歡叫我海雞母，因為我的腳上有蹼，嘴卻為長圓錐形，跟雞嘴一樣。我全身披著黑褐色的外衣，配上肚子上的白西裝，帥氣極了。',
      '海上休息站到了！我停在船邊整理羽毛，順便看看船員今天有沒有帶魚上船。',
      '大翅膀有個好處，在空中飛行時又快又穩，有時懶得動還可以借助風力在空中滑行。',
      '基隆港附近及台灣東北部沿海可是我常去的美食街；我喜歡貼著海面飛行，因為這樣美味的魚看得比較清楚。',
      '說到抓魚，還真是一門學問，你要在15～27公尺空中就開始俯衝，在淺水處以45度衝進海中2～3公尺深，然後在水中經6～8秒後浮出。媽媽跟我說這樣抓到的魚比較好吃。',
    ],
  },
  'black-kite': {
    name: '黑鳶', caption: '鷲鷹科',
    images: ['assets/region/black-kite.jpg', ...[2,3,4,5,6,7,8,9].map(n => `assets/region/black-kite-0${n}.jpg`)],
    stories: [
      '大家好我是黑鳶，是鷲鷹科的一員，體長約64公分，什麼!沒聽過，那老鷹的大名總聽過吧!',
      '我全身都是黑褐色，頭跟肚子有淺褐色縱斑，翅膀很長而窄，有明顯的白斑，尾羽略成凹狀就像魚尾一樣，腳是灰褐色的。',
      '別人幫我取了許多的外號，像是麻鷹、老雕、黑耳鷹、老鳶、雞屎鷹、來鷂（閩南語）。',
      '有時連自己都會搞混，害我一天到晚神精兮兮的，聽到「鷹」字就會忍不住停下來回頭看一下，還好脖子從沒扭到過。',
      '我喜歡在空中盤旋，觀察地面獵物。',
      '一逮到機會，快、狠、準，決不放過。',
      '翅膀一收、爪子準備好，看到獵物就俯衝！空中巡邏可不能只顧著看風景。',
      '抓到目標啦！把爪子收穩，帶著這份午餐飛回去，今天總算沒有空手而歸。',
      '回家的路上也要保持帥氣滑翔，老婆看到我的戰利品，應該就不會嫌我巡邏太久了吧？',
    ],
  },
  'crested-tern': {
    name: '鳳頭燕鷗', caption: '鷗科',
    images: ['assets/region/crested-tern.jpg', ...[2,3,4,5,6].map(n => `assets/region/crested-tern-0${n}.jpg`)],
    stories: [
      '大家好，我是鳳頭燕鷗，是鷗科中的一員，體長約45公分。我棲習於陸地附近之礁岩島嶼，除補食魚類外，亦常啄食海面漂浮之魚內臟。',
      '我的嘴鮮黃、腳是黑色。頭部有黑色短羽冠。飛行時拍翅動作較慢，常低空飛翔於海面搜尋獵物，發現目標後即直接俯衝入水捕食。',
      '大家都在礁岩上休息，我也先停一下；海風一吹，羽毛都快被整理得比我本人還整齊了。',
      '休息時間結束，隊友開始振翅，我也跟上！這片海岸的空中交通可熱鬧了。',
      '我最大的興趣就是一直飛，不斷的飛，無止盡的飛。',
      '一隻接一隻起飛，隊伍出發巡海囉！跟緊一點，前面的好風可別被搶走。',
    ],
  },
};

const intro = document.querySelector('#region-intro');
const overviewArt = document.querySelector('#region-overview-art');
const detail = document.querySelector('#region-detail');
const image = document.querySelector('#region-detail-image');
const title = document.querySelector('#region-detail-title');
const copy = document.querySelector('#region-detail-copy');
const caption = document.querySelector('#region-detail-caption');
const family = document.querySelector('#region-detail-family');
const progress = document.querySelector('#region-progress');
const tabs = document.querySelector('#region-detail-tabs');
const voiceReplay = document.querySelector('#region-voice-replay');
const narration = new Audio();
narration.preload = 'auto';
let selectedBird = null;
let slide = 0;
let autoplayTimer;
let advanceTimer;
let narrationGeneration = 0;

function advanceAutoplay() {
  if (!autoplayTimer) return;
  const bird = regionBirds[selectedBird];
  if (!bird || slide >= bird.images.length - 1) return stopAutoplay();
  showSlide(slide + 1);
}

function playNarration(bird, index) {
  clearTimeout(advanceTimer);
  narration.pause();
  const audioSource = bird.images[index].replace(/\.jpg$/i, '.mp3');
  narration.src = audioSource;
  narration.load();
  const fallback = () => {
    if (autoplayTimer) advanceTimer = setTimeout(advanceAutoplay, Math.max(5000, bird.stories[index].length * 220));
  };
  narration.onerror = fallback;
  const request = narration.play();
  if (request?.catch) request.catch(fallback);
}

narration.addEventListener('ended', () => {
  if (autoplayTimer) {
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(advanceAutoplay, 450);
  }
});

function stopAutoplay() {
  clearTimeout(advanceTimer);
  advanceTimer = undefined;
  autoplayTimer = undefined;
  const button = document.querySelector('#region-autoplay');
  button.setAttribute('aria-pressed', 'false');
  button.textContent = '自動播放';
}

function showSlide(index) {
  const bird = regionBirds[selectedBird];
  if (!bird) return;
  const nextSlide = Math.max(0, Math.min(bird.images.length - 1, index));
  const generation = ++narrationGeneration;
  narration.pause();
  window.transitionPageContent(() => renderSlide(bird, nextSlide, true), bird.images[nextSlide], () => {
    if (generation === narrationGeneration && selectedBird && slide === nextSlide) playNarration(bird, nextSlide);
  });
}

function renderSlide(bird, index, audioStarted = false) {
  if (!audioStarted) playNarration(bird, index);
  slide = index;
  image.src = bird.images[slide];
  image.alt = `${bird.name}，第 ${slide + 1} 張照片`;
  title.textContent = bird.name;
  copy.textContent = bird.stories[slide].replace(/\s+/g, ' ').trim();
  family.textContent = bird.caption;
  caption.textContent = bird.name;
  progress.textContent = `${slide + 1} / ${bird.images.length}`;
  document.querySelector('#region-previous').disabled = slide === 0;
  document.querySelector('#region-next').disabled = slide === bird.images.length - 1;
  tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(button.dataset.bird === selectedBird)));
}

function selectBird(id) {
  const generation = ++narrationGeneration;
  selectedBird = id;
  slide = 0;
  stopAutoplay();
  const bird = regionBirds[id];
  window.transitionPageContent(() => {
    intro.hidden = true;
    overviewArt.hidden = true;
    detail.hidden = false;
    renderSlide(bird, 0, true);
  }, bird.images[0], () => {
    if (generation === narrationGeneration && selectedBird === id && slide === 0) playNarration(bird, 0);
  });
}

function showOverview() {
  narrationGeneration++;
  stopAutoplay();
  narration.pause();
  narration.currentTime = 0;
  narration.removeAttribute('src');
  narration.load();
  selectedBird = null;
  window.transitionPageContent(() => {
    detail.hidden = true;
    overviewArt.hidden = false;
    intro.hidden = false;
  });
}

tabs.innerHTML = Object.entries(regionBirds).map(([id, bird]) =>
  `<button type="button" data-bird="${id}" aria-current="false">${bird.name}</button>`
).join('');
tabs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => selectBird(button.dataset.bird)));
document.querySelectorAll('.region-bird').forEach(button => button.addEventListener('click', () => selectBird(button.dataset.bird)));
document.querySelector('#region-overview').addEventListener('click', showOverview);
document.querySelector('#region-previous').addEventListener('click', () => { stopAutoplay(); showSlide(slide - 1); });
document.querySelector('#region-next').addEventListener('click', () => { stopAutoplay(); showSlide(slide + 1); });
voiceReplay.addEventListener('click', () => {
  const bird = regionBirds[selectedBird];
  if (bird) playNarration(bird, slide);
});
document.querySelector('#region-autoplay').addEventListener('click', event => {
  if (autoplayTimer) return stopAutoplay();
  autoplayTimer = true;
  event.currentTarget.setAttribute('aria-pressed', 'true');
  event.currentTarget.textContent = '停止播放';
  const bird = regionBirds[selectedBird];
  if (slide === bird.images.length - 1) showSlide(0);
  else if (narration.paused || narration.ended) playNarration(bird, slide);
});
document.addEventListener('keydown', event => {
  if (detail.hidden || event.target.matches('input,textarea,select')) return;
  if (event.key === 'ArrowLeft') { stopAutoplay(); showSlide(slide - 1); }
  if (event.key === 'ArrowRight') { stopAutoplay(); showSlide(slide + 1); }
});

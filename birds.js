const birds = {
  '鷺科': [
    { name: '大白鷺', id: 220, story: [222, 259] }, { name: '小白鷺', id: 261, story: [266, 291] },
    { name: '蒼鷺', id: 293, story: [295, 317] }, { name: '岩鷺', id: 319, story: [321, 343] },
  ],
  '鶚科': [{ name: '魚鷹', id: 588, story: [590, 612] }],
  '鷸科': [
    { name: '小青足鷸', id: 709, story: [711, 727] }, { name: '中杓鷸', id: 729 },
    { name: '半蹼鷸', id: 442 }, { name: '紅胸濱鷸', id: 462, story: [464, 480] },
    { name: '磯鷸', id: 482, story: [484, 500] }, { name: '翻石鷸', id: 502, story: [504, 526] },
  ],
  '彩鷸科': [{ name: '彩鷸', id: 614 }],
  '鴴科': [
    { name: '小環頸鴴', id: 385, story: [387, 409] }, { name: '東方環頸鴴', id: 407, story: [409, 440] },
    { name: '金斑鴴', id: 640, story: [642, 661] }, { name: '鐵嘴鴴', id: 663, story: [665, 684] },
    { name: '灰斑鴴', id: 686, story: [688, 707] },
  ],
  '鷗科': [
    { name: '小燕鷗', id: 528, story: [530, 546] }, { name: '黑嘴鷗', id: 548, story: [550, 566] },
    { name: '黑脊鷗', id: 568 },
  ],
  '翡翠科': [{ name: '翠鳥', id: 772 }],
  '鶺鴒科': [{ name: '白鶺鴒', id: 792 }],
};
const gallery = document.querySelector('#gallery');
const view = document.querySelector('#species-view');
const list = document.querySelector('#species-list');
const title = document.querySelector('#family-title');
const image = document.querySelector('#species-image');
const name = document.querySelector('#species-name');
const copy = document.querySelector('#species-copy');
const pageHeading = document.querySelector('.birds-heading');
let options = [], current = 0, currentSlide = 0, autoplay = null;

function stopAutoplay() {
  clearInterval(autoplay);
  autoplay = null;
  document.querySelector('#auto-play').setAttribute('aria-pressed', 'false');
}

function showBird(index, slideIndex = 0) {
  current = index;
  const bird = options[current];
  const slides = window.BIRD_SLIDES?.[bird.name] || [];
  currentSlide = Math.min(Math.max(slideIndex, 0), slides.length - 1);
  const slide = slides[currentSlide];
  title.textContent = bird.name;
  name.textContent = bird.name;
  image.src = `assets/decoded/bitmap_${slide?.image ?? bird.id}.jpg`;
  image.alt = bird.name;
  const paragraphText = (slide?.text || '')
    .replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, '');
  const decoded = document.createElement('textarea');
  decoded.innerHTML = paragraphText;
  copy.textContent = decoded.value.trim();
  copy.hidden = !copy.textContent;
  document.querySelector('#slide-count').textContent = `${currentSlide + 1} / ${slides.length}`;
  const nextButton = document.querySelector('#next-slide');
  nextButton.disabled = currentSlide >= slides.length - 1;
  nextButton.setAttribute('aria-label', '下一張圖片');
  list.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-current', i === current ? 'true' : 'false'));
}

document.querySelectorAll('.family-card').forEach(card => card.addEventListener('click', () => {
  stopAutoplay();
  const family = card.dataset.family;
  options = birds[family];
  title.textContent = family;
  list.innerHTML = options.map((bird, i) => `<button type="button" data-bird="${i}">${bird.name}</button>`).join('');
  list.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    stopAutoplay();
    showBird(Number(button.dataset.bird));
  }));
  gallery.hidden = true;
  pageHeading.hidden = true;
  document.querySelector('.home-button').hidden = true;
  view.hidden = false;
  showBird(0);
}));

document.querySelector('#back-to-list').addEventListener('click', () => { stopAutoplay(); view.hidden = true; gallery.hidden = false; pageHeading.hidden = false; document.querySelector('.home-button').hidden = false; });
document.querySelector('#next-slide').addEventListener('click', () => {
  stopAutoplay();
  showBird(current, currentSlide + 1);
});
document.querySelector('#auto-play').addEventListener('click', () => {
  stopAutoplay();
  const slides = window.BIRD_SLIDES?.[options[current]?.name] || [];
  if (currentSlide >= slides.length - 1) showBird(current, 0);
  autoplay = setInterval(() => {
    if (currentSlide >= slides.length - 1) return stopAutoplay();
    showBird(current, currentSlide + 1);
    if (currentSlide >= slides.length - 1) stopAutoplay();
  }, 3000);
  document.querySelector('#auto-play').setAttribute('aria-pressed', 'true');
});
document.querySelector('#stop-play').addEventListener('click', stopAutoplay);

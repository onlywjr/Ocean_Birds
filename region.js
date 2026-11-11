const regionBirds = {
  'white-bellied-booby': { name: '白腹鰹鳥', frames: [14, 15, 16, 17, 18, 19] },
  'black-kite': { name: '黑鳶', frames: [96, 97, 98, 99, 100, 101, 102, 103, 104] },
  'crested-tern': { name: '鳳頭燕鷗', frames: [316, 317, 318, 319, 320, 321] },
};
const viewer = document.querySelector('#original-frame');
const intro = document.querySelector('#region-intro');
const controls = document.querySelector('#region-controls');
const progress = document.querySelector('#region-progress');
let selectedBird = null;
let slide = 0;

function showSlide(index) {
  const bird = regionBirds[selectedBird];
  if (!bird) return;
  slide = Math.max(0, Math.min(bird.frames.length - 1, index));
  viewer.classList.remove('frame-enter');
  void viewer.offsetWidth;
  viewer.classList.add('frame-enter');
  viewer.src = `flash-frame.html?frame=${bird.frames[slide]}`;
  viewer.title = `${bird.name}｜第 ${slide + 1} 張`;
  progress.textContent = `${bird.name}　${slide + 1} / ${bird.frames.length}`;
  document.querySelector('#region-previous').disabled = slide === 0;
  document.querySelector('#region-next').disabled = slide === bird.frames.length - 1;
}

function showOverview() {
  selectedBird = null;
  viewer.classList.remove('frame-enter');
  void viewer.offsetWidth;
  viewer.classList.add('frame-enter');
  viewer.src = 'flash-frame.html?frame=342';
  viewer.title = '展翅基隆原始 Flash 畫面';
  intro.hidden = false;
  controls.hidden = true;
}

document.querySelectorAll('.region-bird').forEach(button => button.addEventListener('click', () => {
  selectedBird = button.dataset.bird;
  intro.hidden = true;
  controls.hidden = false;
  showSlide(0);
}));

document.querySelector('#region-overview').addEventListener('click', showOverview);
document.querySelector('#region-previous').addEventListener('click', () => showSlide(slide - 1));
document.querySelector('#region-next').addEventListener('click', () => showSlide(slide + 1));
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showSlide(slide - 1);
  if (event.key === 'ArrowRight') showSlide(slide + 1);
});

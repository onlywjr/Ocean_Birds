const pages = [
  {
    title: '海與島嶼的日常',
    caption: '四面環海的島嶼，孕育多樣的海岸生命',
    layout: 'map',
    images: [
      { id: 71, alt: '台灣四面環海的衛星地圖', className: 'map' },
      { id: 7, alt: '小白鷺站在水邊' },
      { id: 9, alt: '黑色岩鷺停在礁岩間' },
      { id: 5, alt: '小環頸鴴在沙地停留' },
      { id: 19, alt: '燕鷗在海岸上空飛翔' }
    ],
    text: '台灣四面環海，海洋可說與我們生活習習相關，人們靠海維生，不僅僅人類如此，許多的動物們也離不開海洋，綿長的海岸線為我們帶來了無與倫比的豐富生態。'
  },
  {
    title: '海岸是一座餐桌',
    caption: '潮汐之間，鳥群尋找食物與棲身之處',
    layout: 'triptych',
    images: [
      { id: 87, src: window.GUIDE_IMAGE_PATHS[87], alt: '小青足鷸在水面覓食' },
      { id: 89, src: window.GUIDE_IMAGE_PATHS[89], alt: '小白鷺在潮間帶捕食' },
      { id: 91, src: window.GUIDE_IMAGE_PATHS[91], alt: '黑脊鷗在淺灘尋找食物' }
    ],
    text: '海濱沿岸的食物鏈因此孕育而生，大量的魚類及潮間帶的各種螃蟹、寄居蟹、軟體動物，為鳥群們提供了極佳的生存環境。'
  },
  {
    title: '長住與過境的旅人',
    caption: '六種海岸鄰居，在台灣生活或短暫停歇',
    layout: 'mosaic',
    images: [
      { id: 98, alt: '多隻小白鷺在草地與水邊聚集' },
      { id: 100, alt: '黑鳶在水面上捕食' },
      { id: 102, alt: '小環頸鴴站在淺水中' },
      { id: 107, alt: '黑脊鷗在空中飛翔' },
      { id: 110, alt: '翻石鷸在泥灘上停留' },
      { id: 112, alt: '小青足鷸在水中覓食' }
    ],
    text: '台灣得天獨厚的海洋環境使得鳥的種類特別多，有些就在此地長住下來了，就像是：小白鷺、小環頸鴴、黑鳶，有些則只是短暫且美麗的訪客，像是：小青足鷸、翻石鷸、黑脊鷗。我們依海而生，怎能對這些好鄰居一無所知呢'
  },
  {
    title: '棲地改變，鳥群離開',
    caption: '原本美麗的沙灘，與嚴重流失後的海岸',
    layout: 'before-after',
    images: [
      { id: 121, alt: '原本美麗的福隆澳底沙灘', label: '原本美麗的沙灘' },
      { id: 124, alt: '沙灘流失後的海岸與碼頭景觀', label: '沙灘嚴重流失' }
    ],
    text: '近年來海岸環境的破壞，迫使鳥群們搬離原來的棲地，更甚者，有些鳥群有滅絕的危機，貢寮核四廠的興建便是最好的例子，為了使物料得以方便輸運，在福隆-澳底間蓋了一座新碼頭，而原本位在澳底的一段白淨沙灘，短短幾年間消失殆盡，沙灘沒入水中或是流失，使得依此為生的鳥群，不得不遷移，豐富的潮間生態及各式各樣、形形色色的鳥群，再也不復見，只剩下卸貨碼頭與水泥河堤，遙遙相望。'
  },
  {
    title: '和海岸一起生活',
    caption: '原作以白鷺、海岸與工程景觀並置，留下思考',
    layout: 'finale',
    images: [
      { id: 129, src: window.GUIDE_IMAGE_PATHS[129], alt: '白鷺飛翔、海岸棲地與工程景觀合成圖', className: 'finale' }
    ],
    text: '住在台灣的我們是否應該思考在海洋環境中所應扮演的角色?我們希望能藉由認識台灣海濱常見的鳥類生態，進而引導人們取得與大自然共存的一個平衡點。',
    nextTopic: true
  }
];

const gallery = document.querySelector('#guide-gallery');
const caption = document.querySelector('#guide-caption');
const title = document.querySelector('#guide-title');
const text = document.querySelector('#guide-text');
const step = document.querySelector('#guide-step');
const counter = document.querySelector('#page-counter');
const nextTopic = document.querySelector('#guide-next-topic');
let page = 0;

function showPage(index) {
  page = Math.max(0, Math.min(pages.length - 1, index));
  const data = pages[page];
  document.body.dataset.page = page + 1;
  gallery.className = `guide-gallery guide-gallery--${data.layout}`;
  gallery.replaceChildren(...data.images.map(item => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = item.src || window.GUIDE_IMAGE_PATHS[item.id];
    img.alt = item.alt;
    if (item.className) figure.classList.add(`guide-image--${item.className}`);
    figure.append(img);
    if (item.label) {
      const label = document.createElement('figcaption');
      label.textContent = item.label;
      figure.append(label);
    }
    return figure;
  }));
  caption.textContent = data.caption;
  title.textContent = data.title;
  text.textContent = data.text;
  step.textContent = `${String(page + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`;
  counter.textContent = `${page + 1} / ${pages.length}`;
  nextTopic.hidden = !data.nextTopic;
  document.querySelector('#previous').disabled = page === 0;
  document.querySelector('#next').disabled = page === pages.length - 1;
  document.querySelector('.guide-scene').classList.remove('scene-enter');
  void document.querySelector('.guide-scene').offsetWidth;
  document.querySelector('.guide-scene').classList.add('scene-enter');
}

document.querySelector('#previous').addEventListener('click', () => showPage(page - 1));
document.querySelector('#next').addEventListener('click', () => showPage(page + 1));
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showPage(page - 1);
  if (event.key === 'ArrowRight') showPage(page + 1);
});
showPage(0);

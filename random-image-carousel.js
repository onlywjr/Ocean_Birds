(() => {
  const carousels = document.querySelectorAll('.random-carousel[data-images]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  carousels.forEach((carousel) => {
    const images = [...carousel.querySelectorAll(':scope > img')];
    const paths = (carousel.dataset.images || '').split('|').filter(Boolean);
    if (images.length < 2 || paths.length < 2) return;

    const mobileFocalPoints = {
      'asian-dowitcher': 58, 'black-tailed-gull': 53, 'common-greenshank': 55,
      'common-sandpiper': 51, 'great-egret': 36, 'grey-headed-plover': 52,
      'grey-heron': 52, 'grey-plover': 29, 'kentish-plover': 50,
      kingfisher: 63, 'little-egret': 53, 'little-ringed-plover': 52,
      'little-tern': 48, osprey: 52, 'pacific-golden-plover': 55,
      'pacific-reef-heron': 30, 'painted-snipe': 50, 'red-necked-stint': 56,
      'ruddy-turnstone': 49, 'saunders-gull': 51, whimbrel: 50, 'white-wagtail': 50
    };
    const setFocalPoint = (path, image) => {
      const folder = path.split('/').at(-2);
      image.style.setProperty('--mobile-focal-x', `${mobileFocalPoints[folder] ?? 50}%`);
    };
    let order = [];
    let cursor = 0;
    let active = Math.max(0, images.findIndex((image) => image.classList.contains('is-active')));
    let timer;

    const openingImage = paths[Math.floor(Math.random() * paths.length)];
    setFocalPoint(openingImage, images[active]);
    images[active].src = openingImage;

    const shuffle = (avoidFirst) => {
      order = [...paths];
      for (let i = order.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      if (avoidFirst && order.length > 1 && order[0] === avoidFirst) {
        [order[0], order[1]] = [order[1], order[0]];
      }
      cursor = 0;
    };

    const setActive = (index) => {
      images.forEach((image, i) => {
        image.classList.toggle('is-active', i === index);
        image.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      active = index;
    };

    const next = () => {
      if (cursor >= order.length) shuffle(images[active].getAttribute('src'));
      const path = order[cursor++];
      const nextLayer = 1 - active;
      const incoming = images[nextLayer];
      const outgoing = images[active];
      incoming.onload = () => {
        incoming.onload = null;
        incoming.onerror = null;
        setFocalPoint(path, incoming);
        setActive(nextLayer);
        timer = window.setTimeout(next, 7000);
      };
      incoming.onerror = () => {
        incoming.onload = null;
        incoming.onerror = null;
        timer = window.setTimeout(next, 7000);
      };
      incoming.src = path;
      if (incoming.complete && incoming.naturalWidth) incoming.onload();
      else if (path === outgoing.getAttribute('src')) incoming.onload();
    };

    shuffle(openingImage);
    if (reduceMotion) return;
    timer = window.setTimeout(next, 7000);
    carousel.addEventListener('remove', () => window.clearTimeout(timer), { once: true });
  });
})();

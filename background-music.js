(() => {
  const page = location.pathname.split('/').pop().replace(/\.html?$/i, '');
  const birdPages = new Set(['birds', 'region']);
  const musicPages = new Set(['card', 'choice', 'game', 'guess', 'hit', 'main-page', 'movie', ...birdPages]);
  if (!musicPages.has(page)) return;

  const track = birdPages.has(page)
    ? ['main-page', 'movie', 'choice'][Math.floor(Math.random() * 3)]
    : page;
  const audio = new Audio(new URL(`assets/sounds/${track}.mp3`, document.baseURI));
  audio.loop = true;
  audio.preload = 'none';
  const normalVolume = birdPages.has(page) ? 0.2 : page === 'movie' ? 0.1 : 0.24;
  audio.volume = 0;

  let fadeTimer;
  let ducked = false;
  const setDucked = (value) => {
    ducked = value;
    clearInterval(fadeTimer);
    const target = ducked ? 0.045 : normalVolume;
    fadeTimer = window.setInterval(() => {
      const difference = target - audio.volume;
      if (Math.abs(difference) <= 0.01) {
        audio.volume = target;
        clearInterval(fadeTimer);
        return;
      }
      audio.volume += Math.sign(difference) * 0.01;
    }, 40);
  };
  if (birdPages.has(page)) window.setBackgroundMusicDucked = setDucked;

  const startMusic = () => {
    audio.play().then(() => {
      audio.volume = ducked ? 0.045 : normalVolume;
      document.removeEventListener('pointerdown', startMusic);
      document.removeEventListener('keydown', startMusic);
    }).catch(() => {
      // Browsers may block autoplay until the visitor interacts with the page.
    });
  };

  startMusic();
  document.addEventListener('pointerdown', startMusic);
  document.addEventListener('keydown', startMusic);
})();
